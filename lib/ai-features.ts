export interface FeatureDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  group: 'booking' | 'clinical' | 'financial';
  promptInstruction: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Booking & Availability
  {
    key: 'instant_booking',
    label: 'Instant Booking',
    description: 'AI books appointments directly without front-desk confirmation.',
    icon: 'CalendarCheck',
    group: 'booking',
    promptInstruction:
      'You can book appointments directly in the scheduling system. When a patient wants to schedule, collect their full name, date of birth, phone number, reason for visit, and preferred time — then confirm the appointment immediately.',
  },
  {
    key: 'after_hours_handling',
    label: 'After-Hours Handling',
    description: 'Automatically handle after-hours contacts. When enabled, the AI acknowledges closed hours and offers callback collection.',
    icon: 'Moon',
    group: 'booking',
    promptInstruction:
      'When a patient contacts outside business hours, acknowledge that the office is currently closed. Offer to take a callback request (collect their name and best number). If an emergency line is configured, provide it for urgent dental situations.',
  },
  {
    key: 'waitlist_offers',
    label: 'Waitlist Offers',
    description: 'Offer patients a spot on the cancellation waitlist when fully booked.',
    icon: 'ListOrdered',
    group: 'booking',
    promptInstruction:
      'When no appointment slots are available in the patient\'s preferred window, offer to add them to the cancellation waitlist. Collect their name, phone, preferred day/time range, and service needed.',
  },
  // Clinical & Triage
  {
    key: 'emergency_detection',
    label: 'Emergency Detection',
    description: 'Detect dental emergencies and route patients to urgent care.',
    icon: 'Siren',
    group: 'clinical',
    promptInstruction:
      'Actively monitor for signs of dental emergency: severe uncontrolled pain, facial swelling, trauma to teeth or jaw, knocked-out tooth, abscess, or uncontrolled bleeding. If detected, immediately prioritize this call — express urgency, provide the emergency contact line if available, and advise them to seek same-day care.',
  },
  {
    key: 'insurance_questions',
    label: 'Insurance Questions',
    description: 'Answer basic insurance and coverage questions instead of deflecting.',
    icon: 'ShieldCheck',
    group: 'clinical',
    promptInstruction:
      'You may answer basic insurance questions: which plans the practice accepts, whether a procedure is typically covered, and general billing process. For specific coverage amounts or pre-authorizations, let them know the billing team will provide exact details and offer to take their contact info.',
  },
  {
    key: 'new_patient_flow',
    label: 'New Patient Welcome',
    description: 'Enhanced intake and welcome experience for first-time patients.',
    icon: 'UserPlus',
    group: 'clinical',
    promptInstruction:
      'When a patient identifies as new, give them a warm welcome. Briefly explain what to expect on their first visit (paperwork, exam, X-rays). Offer to collect their basic intake information (name, phone, DOB, insurance carrier) so the front desk can prepare before their appointment.',
  },
  // Financial
  {
    key: 'pricing_transparency',
    label: 'Pricing Transparency',
    description: 'Discuss approximate costs and price ranges when patients ask.',
    icon: 'DollarSign',
    group: 'financial',
    promptInstruction:
      'When patients ask about cost, you may discuss approximate price ranges for common procedures if known. Always clarify that exact fees depend on the patient\'s specific situation and insurance coverage, and that the dentist will provide a precise treatment plan and cost at their visit.',
  },
  {
    key: 'payment_plans',
    label: 'Payment Plans',
    description: 'Mention financing and payment plan options when cost is a concern.',
    icon: 'CreditCard',
    group: 'financial',
    promptInstruction:
      'When a patient expresses concern about cost, let them know the practice offers payment plan options and financing to make treatment affordable. Encourage them to ask the front desk about available plans at their visit or when scheduling.',
  },
];

export const GROUP_LABELS: Record<string, string> = {
  booking: 'Booking & Availability',
  clinical: 'Clinical & Triage',
  financial: 'Financial',
};

export const VALID_FEATURE_KEYS = new Set(FEATURE_DEFINITIONS.map((f) => f.key));

export function buildFeatureLayer(enabledFeatures: string[]): string {
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
