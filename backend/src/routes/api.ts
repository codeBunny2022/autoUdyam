import { Router } from 'express';
import { validateStep1Payload, validateStep2Payload } from '../validation/schemas.js';
import { prisma } from '../utils/prisma.js';
import axios from 'axios';

export const router = Router();

router.get('/schema', async (_req, res) => {
  // Minimal schema for Step 1 & 2 fields; in production this would be scraped
  const schema = {
    steps: [
      {
        id: 1,
        title: 'Aadhaar & OTP',
        fields: [
          { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'text', required: true, pattern: '^\\d{12}$' },
          { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
          { name: 'mobileNumber', label: 'Mobile Number', type: 'text', required: true, pattern: '^[6-9]\\d{9}$' },
          { name: 'otp', label: 'OTP', type: 'text', required: true, pattern: '^\\d{6}$' }
        ]
      },
      {
        id: 2,
        title: 'PAN Validation',
        fields: [
          { name: 'panNumber', label: 'PAN Number', type: 'text', required: true, pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$' },
          { name: 'pinCode', label: 'PIN Code', type: 'text', required: false, pattern: '^\\d{6}$' },
          { name: 'state', label: 'State', type: 'text', required: false },
          { name: 'city', label: 'City', type: 'text', required: false }
        ]
      }
    ]
  };
  res.json(schema);
});

router.get('/pin/:pinCode', async (req, res) => {
  try {
    const { pinCode } = req.params;
    const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pinCode}`);
    if (Array.isArray(data) && data[0]?.Status === 'Success') {
      const postOffice = data[0].PostOffice?.[0];
      return res.json({
        state: postOffice?.State ?? '',
        city: postOffice?.District ?? ''
      });
    }
    return res.status(404).json({ error: 'PIN not found' });
  } catch (err) {
    return res.status(500).json({ error: 'PIN lookup failed' });
  }
});

router.post('/otp/send', async (req, res) => {
  const mobileNumber: string | undefined = req.body?.mobileNumber;
  if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  }
  // Simulate sending OTP
  return res.json({ message: 'OTP sent', otp: '123456' });
});

router.post('/validate/step1', async (req, res) => {
  const parse = validateStep1Payload.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  const { otp } = parse.data;
  if (otp !== '123456') {
    return res.status(400).json({ errors: { fieldErrors: { otp: ['Invalid OTP'] } } });
  }
  return res.json({ ok: true });
});

router.post('/validate/step2', async (req, res) => {
  const parse = validateStep2Payload.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten() });
  }
  return res.json({ ok: true });
});

router.post('/submit', async (req, res) => {
  const step1 = validateStep1Payload.safeParse(req.body.step1);
  const step2 = validateStep2Payload.safeParse(req.body.step2);
  if (!step1.success || !step2.success) {
    return res.status(400).json({
      step1: step1.success ? null : step1.error.flatten(),
      step2: step2.success ? null : step2.error.flatten()
    });
  }
  const { aadhaarNumber, applicantName, mobileNumber } = step1.data;
  const { panNumber, pinCode, state, city } = step2.data;

  const created = await prisma.registration.create({
    data: {
      aadhaarNumber,
      applicantName,
      mobileNumber,
      otpVerified: true,
      panNumber,
      pinCode: pinCode ?? null,
      state: state ?? null,
      city: city ?? null
    }
  });
  res.status(201).json({ id: created.id });
}); 