import { z } from 'zod';

export const validateStep1Payload = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
  applicantName: z.string().min(2, 'Name is required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
});

export const validateStep2Payload = z.object({
  panNumber: z
    .string()
    .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits').optional(),
  state: z.string().optional(),
  city: z.string().optional()
}); 