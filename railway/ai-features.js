const FEATURE_DEFINITIONS = [
  // Booking & Availability
  {
    key: 'instant_booking',
    label: 'Instant Booking',
    group: 'booking',
    promptInstruction:
      'You can book appointments directly in the scheduling system. When a patient wants to schedule, collect their full name, date of birth, phone number, reason for visit, and preferred time — then confirm the appointment immediately.',
  },
  {
    key: 'after_hours_handling',
    label: 'Disable After Hours Handling',
    group: 'booking',
    promptInstruction:
      'When a patient contacts outside business hours, acknowledge that the office is currently closed. Offer to take a callback request (collect their name and best number). If an emergency line is configured, provide it for urgent dental situations.',
  },
  {
    key: 'waitlist_offers',
    label: 'Waitlist Offers',
    group: 'booking',
    promptInstruction:
      "When no appointment slots are available in the patient's preferred window, offer to add them to the cancellation waitlist. Collect their name, phone, preferred day/time range, and service needed.",
  },
  // Clinical & Triage
  {
    key: 'emergency_detection',
    label: 'Emergency Detection',
    group: 'clinical',
    promptInstruction:
      'Actively monitor for signs of dental emergency: severe uncontrolled pain, facial swelling, trauma to teeth or jaw, knocked-out tooth, abscess, or uncontrolled bleeding. If detected, immediately prioritize this call — express urgency, provide the emergency contact line if available, and advise them to seek same-day care.',
  },
  {
    key: 'insurance_questions',
    label: 'Insurance Questions',
    group: 'clinical',
    promptInstruction:
      'You may answer basic insurance questions: which plans the practice accepts, whether a procedure is typically covered, and general billing process. For specific coverage amounts or pre-authorizations, let them know the billing team will provide exact details and offer to take their contact info.',
  },
  {
    key: 'new_patient_flow',
    label: 'New Patient Welcome',
    group: 'clinical',
    promptInstruction:
      'When a patient identifies as new, give them a warm welcome. Briefly explain what to expect on their first visit (paperwork, exam, X-rays). Offer to collect their basic intake information (name, phone, DOB, insurance carrier) so the front desk can prepare before their appointment.',
  },
  // Financial
  {
    key: 'pricing_transparency',
    label: 'Pricing Transparency',
    group: 'financial',
    promptInstruction:
      "When patients ask about cost, you may discuss approximate price ranges for common procedures if known. Always clarify that exact fees depend on the patient's specific situation and insurance coverage, and that the dentist will provide a precise treatment plan and cost at their visit.",
  },
  {
    key: 'payment_plans',
    label: 'Payment Plans',
    group: 'financial',
    promptInstruction:
      'When a patient expresses concern about cost, let them know the practice offers payment plan options and financing to make treatment affordable. Encourage them to ask the front desk about available plans at their visit or when scheduling.',
  },
];

const VALID_FEATURE_KEYS = new Set(FEATURE_DEFINITIONS.map((f) => f.key));

function buildFeatureLayer(enabledFeatures) {
  // Special handling: after_hours_handling is inverted (enabled by default, disabled when toggled ON)
  const isAfterHoursDisabled = enabledFeatures.includes('after_hours_handling');

  const enabled = FEATURE_DEFINITIONS.filter((f) => {
    if (f.key === 'after_hours_handling') {
      return !isAfterHoursDisabled; // Apply instruction when NOT disabled
    }
    return enabledFeatures.includes(f.key);
  });

  if (!enabled.length) return '';
  const instructions = enabled.map((f) => `- ${f.promptInstruction}`).join('\n');
  return `\n## Active AI Features\n${instructions}`;
}

module.exports = { FEATURE_DEFINITIONS, VALID_FEATURE_KEYS, buildFeatureLayer };
