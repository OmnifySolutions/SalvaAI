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
    throw new OpenDentalError('UNREACHABLE', `Open Dental ${res.status}: ${body}`);
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
