// railway/opendental.js
// Open Dental REST API v1 client.
// All functions throw OpenDentalError on failure — server.js catches by .code.

export class OpenDentalError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OpenDentalError';
    this.code = code; // 'INVALID_KEY' | 'UNREACHABLE' | 'SLOT_TAKEN' | 'PATIENT_ERROR'
  }
}

function headers(customerKey) {
  const key = process.env.OPENDENTAL_DEVELOPER_KEY;
  if (!key) throw new OpenDentalError('INVALID_KEY', 'OPENDENTAL_DEVELOPER_KEY env var is not set');
  return {
    'Authorization': `ODFHIR ${key}/${customerKey}`,
    'Content-Type': 'application/json',
  };
}

async function odFetch(serverUrl, customerKey, path, options = {}) {
  const url = `${serverUrl.replace(/\/$/, '')}/api/v1${path}`;
  let res;
  try {
    res = await fetch(url, { ...options, headers: { ...headers(customerKey), ...(options.headers || {}) } });
  } catch (e) {
    throw new OpenDentalError('UNREACHABLE', `Open Dental unreachable: ${e.message}`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new OpenDentalError('INVALID_KEY', 'Open Dental rejected the API key');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new OpenDentalError('UNREACHABLE', `Open Dental ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new OpenDentalError('UNREACHABLE', `Open Dental returned non-JSON: ${text.slice(0, 120)}`);
  }
}

// Search for an existing patient by last name + first name + date of birth.
// Returns the patient object { PatNum, LName, FName, Birthdate, HmPhone, ... } or null.
// DOB format expected: 'YYYY-MM-DD'
// phone is not used — Open Dental patient search matches on name + DOB only
export async function findPatient(serverUrl, customerKey, { name, dob }) {
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';
  const params = new URLSearchParams({ LName: lastName, FName: firstName });
  if (dob) params.set('Birthdate', dob);
  try {
    const patients = await odFetch(serverUrl, customerKey, `/patients?${params}`);
    if (!Array.isArray(patients) || patients.length === 0) return null;
    return patients[0];
  } catch (e) {
    if (e instanceof OpenDentalError) throw e;
    throw new OpenDentalError('PATIENT_ERROR', e.message);
  }
}

// Create a new patient record. Returns the new patient object including PatNum.
// dob: 'YYYY-MM-DD', phone: any format (stored as-is)
export async function createPatient(serverUrl, customerKey, { name, phone, dob, email, reason }) {
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';
  const body = {
    LName: lastName,
    FName: firstName,
    Birthdate: dob || '',
    HmPhone: phone || '',
    Email: email || '',
    PatStatus: 0,  // 0 = Patient
  };
  try {
    const patient = await odFetch(serverUrl, customerKey, '/patients', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!patient?.PatNum) throw new OpenDentalError('PATIENT_ERROR', 'No PatNum in response');
    return patient;
  } catch (e) {
    if (e instanceof OpenDentalError) throw e;
    throw new OpenDentalError('PATIENT_ERROR', e.message);
  }
}

// Return array of { ProvNum, FName, LName, Abbr } for all active providers.
export async function getProviders(serverUrl, customerKey) {
  const providers = await odFetch(serverUrl, customerKey, '/providers');
  return Array.isArray(providers) ? providers : [];
}

// Return up to 5 open slots within windowDays from today.
// Each slot: { date, time, provider, providerId, operatoryId, aptDateTime }
// providerName: optional string — if given, filter to matching provider only.
// Default appointment length: 60 minutes.
export async function getAvailability(serverUrl, customerKey, { windowDays = 7, providerName = null, timeZone = 'America/New_York' }) {
  // Use practice timezone for date math to avoid UTC midnight off-by-one for US practices
  const now = new Date();
  const startDate = now.toLocaleDateString('en-CA', { timeZone }); // en-CA gives YYYY-MM-DD
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + windowDays);
  const stopDate = endDate.toLocaleDateString('en-CA', { timeZone });

  let providers = [];
  if (providerName) {
    try {
      const all = await getProviders(serverUrl, customerKey);
      providers = all.filter(
        (p) => `${p.FName} ${p.LName}`.toLowerCase().includes(providerName.toLowerCase())
               || p.Abbr?.toLowerCase().includes(providerName.toLowerCase())
      );
    } catch { /* ignore provider filter failure — fall back to all providers */ }
  }

  const params = new URLSearchParams({
    startDate,
    stopDate,
    length: '60',
  });
  if (providers.length === 1) params.set('provNum', String(providers[0].ProvNum));

  const slots = await odFetch(serverUrl, customerKey, `/openslots?${params}`);
  if (!Array.isArray(slots)) return [];

  return slots.slice(0, 5).map((s) => {
    const dt = new Date(s.AptDateTime || s.aptDateTime);
    return {
      aptDateTime: s.AptDateTime || s.aptDateTime,
      date: dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      provider: s.ProviderName || s.provAbbr || 'the doctor',
      providerId: s.ProvNum,
      operatoryId: s.Op || s.OperatoryNum,
    };
  });
}

// Book an appointment. mode controls AptStatus:
//   'autonomous' → AptStatus 1 (Scheduled — appears confirmed in Open Dental)
//   'pending'    → AptStatus 6 (Unscheduled — front desk must confirm)
//   'collect_only' → never call this function; handle at caller level
export async function createAppointment(serverUrl, customerKey, {
  patientId, aptDateTime, operatoryId, providerId, reason, mode,
}) {
  const aptStatus = mode === 'pending' ? 6 : 1;
  const body = {
    PatNum: patientId,
    AptDateTime: aptDateTime,
    Op: operatoryId,
    ProvNum: providerId,
    ProcDescript: reason || 'General appointment',
    AptStatus: aptStatus,
  };
  try {
    const apt = await odFetch(serverUrl, customerKey, '/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!apt?.AptNum) throw new OpenDentalError('UNREACHABLE', 'No AptNum in response');
    return apt;
  } catch (e) {
    if (e instanceof OpenDentalError) {
      // Re-classify 409 Conflict (slot taken) if we can detect it
      if (e.status === 409 || e.message.toLowerCase().includes('conflict')) {
        throw new OpenDentalError('SLOT_TAKEN', 'That slot was just booked by someone else');
      }
      throw e;
    }
    throw new OpenDentalError('UNREACHABLE', e.message);
  }
}
