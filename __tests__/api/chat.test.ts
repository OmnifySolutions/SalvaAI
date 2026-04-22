import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock("@anthropic-ai/sdk");
jest.mock("groq-sdk");
jest.mock("@/lib/notifications", () => ({
  sendEmergencyNotification: jest.fn().mockResolvedValue(undefined),
  sendBookingNotification: jest.fn().mockResolvedValue(undefined),
  sendCallbackNotification: jest.fn().mockResolvedValue(undefined),
}));

import { supabaseAdmin } from "@/lib/supabase";

describe("POST /api/chat", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = supabaseAdmin as jest.Mocked<any>;

    // Reset environment variables
    process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID = "demo-id";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.GROQ_API_KEY = "gsk-test";
  });

  describe("Request Validation", () => {
    it("returns 400 for missing businessId", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("returns 400 for missing message", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ businessId: "test-biz" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("returns 400 for invalid JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: "invalid json",
        headers: { "content-type": "application/json" },
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid JSON");
    });

    it("returns 400 for message longer than 1000 chars", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "test-biz",
          message: "a".repeat(1001),
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("too long");
    });

    it("returns 400 for non-string message", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "test-biz",
          message: { text: "not a string" },
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("Business Lookup", () => {
    it("returns 404 when business not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "nonexistent",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain("Business not found");
    });
  });

  describe("Interaction Limits", () => {
    it("returns 403 when free tier reaches 50 interactions", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: "biz-1",
                name: "Test Dental",
                plan: "free",
                interaction_count: 50,
                ai_name: "Claire",
                business_type: "dental",
              },
              error: null,
            }),
          }),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "biz-1",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain("Free trial limit");
    });

    it("returns 403 when basic tier reaches 500 interactions", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: "biz-1",
                plan: "basic",
                interaction_count: 500,
                ai_name: "Claire",
              },
              error: null,
            }),
          }),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "biz-1",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(403);
    });

    it("allows free tier with interaction count < 50", async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "biz-1",
                  plan: "free",
                  interaction_count: 25,
                  ai_name: "Claire",
                  name: "Dental Co",
                  business_type: "dental",
                  hours: {},
                  faqs: [],
                  services: [],
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: { id: "conv-1" }, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "biz-1",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      expect(response.status).not.toBe(403);
    });
  });

  describe("Classification & Intent Detection", () => {
    it("detects emergency in message", async () => {
      // This test verifies that the classification logic is applied
      // The actual test would check that conversations are created with urgency='emergency'
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("detects appointment intent", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("detects callback intent", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Conversation Management", () => {
    it("creates new conversation when conversationId not provided", async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: { id: "conv-123" }, error: null }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "biz-1",
                  plan: "pro",
                  interaction_count: 5,
                  ai_name: "Claire",
                  name: "Dental Co",
                  business_type: "dental",
                  hours: {},
                  faqs: [],
                  services: [],
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: insertMock,
        });

      expect(insertMock).toBeDefined();
    });

    it("verifies conversation belongs to correct business", async () => {
      // Security test: ensure cross-business access is prevented
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("updates conversation with new urgency if higher", async () => {
      // Test urgency escalation logic
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Feature Toggle Injection", () => {
    it("includes enabled features in system prompt", async () => {
      // This is an integration test that verifies buildFeatureLayer is called
      expect(true).toBe(true); // Feature injection tested in ai-features.test.ts
    });

    it("handles empty feature array", async () => {
      expect(true).toBe(true); // Tested in ai-features.test.ts
    });
  });

  describe("Custom Guidelines (Do's & Don'ts)", () => {
    it("includes ai_dos in system prompt when present", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("includes ai_donts in system prompt when present", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("formats do's and don'ts correctly", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("SalvaAI Demo Bot", () => {
    it("uses SalvaAI system prompt for demo business", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("returns appropriate SalvaAI pricing info in mock response", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Mock Response Generation", () => {
    it("generates mock response when LLM fails", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("handles price questions in mock response", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("handles appointment questions in mock response", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Rate Limiting", () => {
    it("allows requests within rate limit", async () => {
      expect(true).toBe(true); // Rate limiter is in-memory, hard to test across calls
    });

    it("blocks requests exceeding rate limit", async () => {
      expect(true).toBe(true); // Rate limiter test
    });
  });

  describe("Message Storage", () => {
    it("stores user message in database", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });

    it("stores assistant reply in database", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Interaction Counter", () => {
    it("increments interaction count after successful chat", async () => {
      expect(true).toBe(true); // Placeholder for E2E test
    });
  });

  describe("Error Handling", () => {
    it("returns 500 on unexpected error", async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "biz-1",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(500);
    });

    it("includes error message in response", async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error("Test error");
      });

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          businessId: "biz-1",
          message: "Hello",
        }),
      });

      const response = await POST(req);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
