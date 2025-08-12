export type Step1Payload = {
  aadhaarNumber: string;
  applicantName: string;
  mobileNumber: string;
  otp: string;
};

export type Step2Payload = {
  panNumber: string;
  pinCode?: string;
  state?: string;
  city?: string;
};

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export async function fetchSchema() {
  const res = await fetch(`${API_BASE}/schema`);
  if (!res.ok) throw new Error('Failed to fetch schema');
  return res.json();
}

export async function sendOtp(mobileNumber: string) {
  const res = await fetch(`${API_BASE}/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber })
  });
  return res;
}

export async function validateStep1(payload: Step1Payload) {
  return fetch(`${API_BASE}/validate/step1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function validateStep2(payload: Step2Payload) {
  return fetch(`${API_BASE}/validate/step2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function submitAll(step1: Step1Payload, step2: Step2Payload) {
  return fetch(`${API_BASE}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step1, step2 })
  });
}

export async function lookupPin(pinCode: string) {
  const res = await fetch(`${API_BASE}/pin/${pinCode}`);
  return res.ok ? res.json() : null;
}
