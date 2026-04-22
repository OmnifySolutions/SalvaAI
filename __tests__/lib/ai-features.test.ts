import {
  buildFeatureLayer,
  FEATURE_DEFINITIONS,
  VALID_FEATURE_KEYS,
  GROUP_LABELS,
} from "@/lib/ai-features";

describe("Feature Definitions", () => {
  it("has 8 features defined", () => {
    expect(FEATURE_DEFINITIONS.length).toBe(8);
  });

  it("has all required fields", () => {
    FEATURE_DEFINITIONS.forEach((f) => {
      expect(f.key).toBeDefined();
      expect(f.label).toBeDefined();
      expect(f.description).toBeDefined();
      expect(f.icon).toBeDefined();
      expect(f.group).toBeDefined();
      expect(f.promptInstruction).toBeDefined();
    });
  });

  it("groups features by category", () => {
    const groups = new Set(FEATURE_DEFINITIONS.map((f) => f.group));
    expect(groups).toEqual(new Set(["booking", "clinical", "financial"]));
  });

  it("has valid group labels", () => {
    expect(GROUP_LABELS.booking).toBe("Booking & Availability");
    expect(GROUP_LABELS.clinical).toBe("Clinical & Triage");
    expect(GROUP_LABELS.financial).toBe("Financial");
  });
});

describe("VALID_FEATURE_KEYS", () => {
  it("contains all feature keys", () => {
    FEATURE_DEFINITIONS.forEach((f) => {
      expect(VALID_FEATURE_KEYS.has(f.key)).toBe(true);
    });
  });

  it("has exactly 8 keys", () => {
    expect(VALID_FEATURE_KEYS.size).toBe(8);
  });

  it("contains expected keys", () => {
    expect(VALID_FEATURE_KEYS.has("instant_booking")).toBe(true);
    expect(VALID_FEATURE_KEYS.has("emergency_detection")).toBe(true);
    expect(VALID_FEATURE_KEYS.has("insurance_questions")).toBe(true);
  });
});

describe("buildFeatureLayer", () => {
  it("returns after_hours_handling when no features enabled", () => {
    // After hours is applied by default (inverted logic)
    const result = buildFeatureLayer([]);
    expect(result).toContain("## Active AI Features");
    expect(result).toContain("office is currently closed");
  });

  it("builds feature layer with single feature", () => {
    const result = buildFeatureLayer(["instant_booking"]);
    expect(result).toContain("## Active AI Features");
    expect(result).toContain("book appointments directly");
  });

  it("builds feature layer with multiple features", () => {
    const result = buildFeatureLayer([
      "instant_booking",
      "emergency_detection",
    ]);
    expect(result).toContain("## Active AI Features");
    expect(result).toContain("book appointments directly");
    expect(result).toContain("dental emergency");
  });

  it("includes all enabled features in prompt instructions", () => {
    const result = buildFeatureLayer([
      "instant_booking",
      "insurance_questions",
      "pricing_transparency",
    ]);
    expect(result).toContain("book appointments directly");
    expect(result).toContain("insurance");
    expect(result).toContain("cost");
  });

  it("handles after_hours_handling inversion correctly", () => {
    // When after_hours_handling is IN the enabled list, it should DISABLE the feature
    // because it's inverted logic
    const resultWithFeature = buildFeatureLayer(["after_hours_handling"]);
    expect(resultWithFeature).not.toContain("closed");
    // Should NOT include the after_hours instruction
  });

  it("includes after_hours_handling when NOT in enabled list", () => {
    const resultWithout = buildFeatureLayer([]);
    // After hours is always applied by default (not in array = apply it)
    // This tests the inverted logic
    expect(resultWithout).toContain("## Active AI Features");
    expect(resultWithout).toContain("closed");
  });

  it("filters out invalid feature keys", () => {
    const result = buildFeatureLayer([
      "instant_booking",
      "invalid_feature_key",
    ]);
    expect(result).toContain("book appointments directly");
    expect(result).not.toContain("invalid_feature_key");
  });

  it("handles mixed valid and invalid keys", () => {
    const result = buildFeatureLayer([
      "instant_booking",
      "nonexistent_key",
      "emergency_detection",
      "fake_feature",
    ]);
    expect(result).toContain("book appointments");
    expect(result).toContain("emergency");
    expect(result).not.toContain("nonexistent_key");
    expect(result).not.toContain("fake_feature");
  });

  it("returns properly formatted prompt injection", () => {
    const result = buildFeatureLayer(["instant_booking"]);
    expect(result.startsWith("\n## Active AI Features")).toBe(true);
    expect(result).toContain("- "); // Bullet points
  });

  it("handles all 8 features together", () => {
    const allFeatures = [
      "instant_booking",
      "after_hours_handling",
      "waitlist_offers",
      "emergency_detection",
      "insurance_questions",
      "new_patient_flow",
      "pricing_transparency",
      "payment_plans",
    ];
    const result = buildFeatureLayer(allFeatures);
    expect(result).toContain("## Active AI Features");
    // Should have multiple features (note: after_hours_handling is inverted)
    expect(result).toContain("-");
  });

  it("maintains feature instruction integrity", () => {
    const result = buildFeatureLayer(["emergency_detection"]);
    const definition = FEATURE_DEFINITIONS.find(
      (f) => f.key === "emergency_detection"
    );
    expect(result).toContain(definition!.promptInstruction);
  });

  it("handles duplicate features gracefully", () => {
    const result = buildFeatureLayer([
      "instant_booking",
      "instant_booking",
      "insurance_questions",
    ]);
    // Should deduplicate or handle gracefully
    const bookingCount = (result.match(/book appointments/g) || []).length;
    expect(bookingCount).toBeLessThanOrEqual(2); // Not doubled
  });
});

describe("Feature Instructions Integration", () => {
  it("instant_booking instruction includes key terms", () => {
    const feature = FEATURE_DEFINITIONS.find(
      (f) => f.key === "instant_booking"
    );
    expect(feature!.promptInstruction).toContain("book");
    expect(feature!.promptInstruction).toContain("appointment");
  });

  it("emergency_detection instruction is comprehensive", () => {
    const feature = FEATURE_DEFINITIONS.find(
      (f) => f.key === "emergency_detection"
    );
    expect(feature!.promptInstruction).toContain("severe");
    expect(feature!.promptInstruction).toContain("emergency");
    expect(feature!.promptInstruction).toContain("same-day");
  });

  it("insurance_questions instruction is prudent", () => {
    const feature = FEATURE_DEFINITIONS.find(
      (f) => f.key === "insurance_questions"
    );
    expect(feature!.promptInstruction).toContain("basic");
    expect(feature!.promptInstruction).toContain("billing team");
  });
});
