export type ServiceDefault = { name: string; durationMinutes: number; description: string };

export const SERVICE_DEFAULTS_BY_TYPE: Record<string, ServiceDefault[]> = {
  dental: [
    { name: "New Patient Exam", durationMinutes: 90, description: "Includes X-rays and full evaluation" },
    { name: "Adult Cleaning", durationMinutes: 60, description: "" },
    { name: "Filling", durationMinutes: 60, description: "" },
    { name: "Emergency Visit", durationMinutes: 30, description: "Same-day pain triage" },
  ],
  orthodontics: [
    { name: "Consultation", durationMinutes: 60, description: "Initial orthodontic assessment" },
    { name: "Adjustment", durationMinutes: 30, description: "" },
    { name: "Retainer Check", durationMinutes: 20, description: "" },
    { name: "Emergency Wire Repair", durationMinutes: 30, description: "" },
  ],
  oral_surgery: [
    { name: "Consultation", durationMinutes: 45, description: "" },
    { name: "Wisdom Tooth Extraction", durationMinutes: 90, description: "" },
    { name: "Implant Placement", durationMinutes: 120, description: "" },
    { name: "Follow-up", durationMinutes: 20, description: "" },
  ],
  pediatric_dental: [
    { name: "New Patient Visit", durationMinutes: 60, description: "Child-friendly intake" },
    { name: "Child Cleaning", durationMinutes: 30, description: "" },
    { name: "Fluoride Treatment", durationMinutes: 20, description: "" },
    { name: "Sealants", durationMinutes: 45, description: "" },
  ],
  other: [
    { name: "Consultation", durationMinutes: 30, description: "" },
    { name: "Follow-up Visit", durationMinutes: 30, description: "" },
    { name: "Procedure", durationMinutes: 60, description: "" },
  ],
};

export function getServiceDefaults(businessType: string): ServiceDefault[] {
  return SERVICE_DEFAULTS_BY_TYPE[businessType] ?? SERVICE_DEFAULTS_BY_TYPE.dental;
}

export function buildDefaultGreeting(aiName: string, practiceName: string): string {
  const name = aiName.trim() || "your AI receptionist";
  const practice = practiceName.trim() || "our practice";
  return `Hi, thanks for calling ${practice}. I'm ${name}. How can I help you today?`;
}
