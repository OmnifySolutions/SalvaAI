import dentalGeneral from './dental_general.js';

// Registry of vertical profiles. Add new verticals here as we expand.
// Each profile must export: { id, buildPromptLayer(business, services) }
const PROFILES = {
  dental_general:      dentalGeneral,
  dental_ortho:        dentalGeneral, // stub — uses general until ortho profile is written
  dental_oral_surgery: dentalGeneral, // stub
  dental_pediatric:    dentalGeneral, // stub
};

export function loadProfile(id) {
  return PROFILES[id] || PROFILES.dental_general;
}
