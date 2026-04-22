import {
  classifyUrgency,
  detectAppointmentIntent,
  detectCallbackIntent,
  extractContact,
  isAfterHours,
  URGENCY_RANK,
} from "@/lib/classify";

describe("classifyUrgency", () => {
  describe("emergency detection", () => {
    it("detects emergency from severe pain keywords", () => {
      expect(classifyUrgency("I have severe pain")).toBe("emergency");
      expect(classifyUrgency("Emergency! Knocked out tooth")).toBe("emergency");
      expect(classifyUrgency("Bleeding and swelling")).toBe("emergency");
    });

    it("detects emergency from medical emergencies", () => {
      expect(classifyUrgency("abscess in my mouth")).toBe("emergency");
      expect(classifyUrgency("I can't eat or sleep")).toBe("emergency");
      expect(classifyUrgency("throbbing pain")).toBe("emergency");
      expect(classifyUrgency("excruciating toothache")).toBe("emergency");
    });

    it("is case-insensitive", () => {
      expect(classifyUrgency("EMERGENCY")).toBe("emergency");
      expect(classifyUrgency("EmErGeNcY")).toBe("emergency");
      expect(classifyUrgency("SEVERE PAIN")).toBe("emergency");
    });
  });

  describe("urgent detection", () => {
    it("detects urgent from pain keywords", () => {
      expect(classifyUrgency("My tooth hurts")).toBe("urgent");
      expect(classifyUrgency("I have a cavity")).toBe("urgent");
      expect(classifyUrgency("Tooth is sensitive")).toBe("urgent");
    });

    it("detects urgent from appointment keywords", () => {
      expect(classifyUrgency("I need to book an appointment")).toBe("urgent");
      expect(classifyUrgency("Can I reschedule?")).toBe("urgent");
    });

    it("detects urgent from insurance/billing", () => {
      expect(classifyUrgency("I have a billing question")).toBe("urgent");
      expect(classifyUrgency("Insurance claim issue")).toBe("urgent");
    });
  });

  describe("routine detection", () => {
    it("defaults to routine for non-emergency text", () => {
      expect(classifyUrgency("Hi, how are you?")).toBe("routine");
      expect(classifyUrgency("What are your hours?")).toBe("routine");
      expect(classifyUrgency("Do you accept walk-ins?")).toBe("routine");
    });

    it("returns routine for empty input", () => {
      expect(classifyUrgency("")).toBe("routine");
    });
  });

  describe("urgency ranking", () => {
    it("ranks emergency > urgent > routine", () => {
      expect(URGENCY_RANK.emergency > URGENCY_RANK.urgent).toBe(true);
      expect(URGENCY_RANK.urgent > URGENCY_RANK.routine).toBe(true);
    });
  });
});

describe("detectAppointmentIntent", () => {
  it("detects appointment keywords", () => {
    expect(detectAppointmentIntent("I'd like to book an appointment")).toBe(true);
    expect(detectAppointmentIntent("Can I schedule a visit?")).toBe(true);
    expect(detectAppointmentIntent("Do you have any openings?")).toBe(true);
  });

  it("detects rescheduling intent", () => {
    expect(detectAppointmentIntent("I need to reschedule")).toBe(true);
    expect(detectAppointmentIntent("Can I cancel my appointment?")).toBe(true);
  });

  it("detects slot/availability queries", () => {
    expect(detectAppointmentIntent("What slots are available?")).toBe(true);
    expect(detectAppointmentIntent("Do you have any come in times?")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(detectAppointmentIntent("BOOK AN APPOINTMENT")).toBe(true);
  });

  it("returns false for non-appointment text", () => {
    expect(detectAppointmentIntent("What are your hours?")).toBe(false);
    expect(detectAppointmentIntent("Do you take insurance?")).toBe(false);
  });
});

describe("detectCallbackIntent", () => {
  it("detects callback keywords", () => {
    expect(detectCallbackIntent("Can you call me back?")).toBe(true);
    expect(detectCallbackIntent("I'd like a callback")).toBe(true);
    expect(detectCallbackIntent("Please get back to me")).toBe(true);
  });

  it("detects contact request variants", () => {
    expect(detectCallbackIntent("reach me at 555-1234")).toBe(true);
    expect(detectCallbackIntent("contact me please")).toBe(true);
    expect(detectCallbackIntent("return my call")).toBe(true);
    expect(detectCallbackIntent("give me a call")).toBe(true);
  });

  it("returns false for non-callback text", () => {
    expect(detectCallbackIntent("What are your services?")).toBe(false);
    expect(detectCallbackIntent("Do you take my insurance?")).toBe(false);
  });
});

describe("extractContact", () => {
  it("extracts phone numbers", () => {
    const result = extractContact("Call me at 555-123-4567");
    expect(result.phone).toBe("5551234567");
  });

  it("extracts phone with various formats", () => {
    expect(extractContact("+1 (555) 123-4567").phone).toBe("+15551234567");
    expect(extractContact("555.123.4567").phone).toBe("5551234567");
    expect(extractContact("5551234567").phone).toBe("5551234567");
  });

  it("requires at least 10 digits for valid phone", () => {
    expect(extractContact("123-45").phone).toBeUndefined();
  });

  it("extracts email addresses", () => {
    const result = extractContact("Email me at john@example.com");
    expect(result.email).toBe("john@example.com");
  });

  it("extracts both phone and email", () => {
    const result = extractContact("Call 555-123-4567 or email test@example.com");
    expect(result.phone).toBe("5551234567");
    expect(result.email).toBe("test@example.com");
  });

  it("returns empty object for no contact info", () => {
    const result = extractContact("Hi there!");
    expect(result.phone).toBeUndefined();
    expect(result.email).toBeUndefined();
  });
});

describe("isAfterHours", () => {
  const mockHours = {
    monday: { open: "09:00", close: "17:00", enabled: true },
    tuesday: { open: "09:00", close: "17:00", enabled: true },
    wednesday: { open: "09:00", close: "17:00", enabled: true },
    thursday: { open: "09:00", close: "17:00", enabled: true },
    friday: { open: "09:00", close: "17:00", enabled: true },
    saturday: { open: "09:00", close: "13:00", enabled: true },
    sunday: { open: null, close: null, enabled: false },
  };

  it("returns false during business hours", () => {
    // Create a date that's definitely a Monday at 10:00 AM
    // January 1, 2024 is a Monday
    const testDate = new Date(2024, 0, 1, 10, 0);
    expect(isAfterHours(mockHours, testDate)).toBe(false);
  });

  it("returns true after close time", () => {
    // Monday 6:00 PM (after 5 PM close)
    const testDate = new Date(2024, 0, 1, 18, 0);
    expect(isAfterHours(mockHours, testDate)).toBe(true);
  });

  it("returns true before open time", () => {
    // Monday 8:00 AM (before 9 AM open)
    const testDate = new Date(2024, 0, 1, 8, 0);
    expect(isAfterHours(mockHours, testDate)).toBe(true);
  });

  it("returns true on closed days", () => {
    // Sunday
    const testDate = new Date(2024, 0, 7, 10, 0); // Sunday
    expect(isAfterHours(mockHours, testDate)).toBe(true);
  });

  it("returns false for null/invalid hours", () => {
    expect(isAfterHours(null)).toBe(false);
    expect(isAfterHours(undefined)).toBe(false);
    expect(isAfterHours("invalid")).toBe(false);
  });

  it("returns true when entry is disabled", () => {
    const disabledHours = {
      monday: { open: "09:00", close: "17:00", enabled: false },
    };
    expect(isAfterHours(disabledHours, new Date(2024, 0, 1, 10, 0))).toBe(true);
  });

  it("returns true when hours are missing", () => {
    const incompleteHours = {
      monday: { open: "09:00", close: null, enabled: true },
    };
    expect(isAfterHours(incompleteHours, new Date(2024, 0, 1, 10, 0))).toBe(true);
  });
});
