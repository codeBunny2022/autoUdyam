import { validateStep1Payload, validateStep2Payload } from '../src/validation/schemas.js';

describe('validation schemas', () => {
  it('rejects invalid PAN', () => {
    const result = validateStep2Payload.safeParse({ panNumber: 'ABCDE12345Z' });
    expect(result.success).toBe(false);
  });

  it('accepts valid PAN', () => {
    const result = validateStep2Payload.safeParse({ panNumber: 'ABCDE1234F' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid Aadhaar', () => {
    const result = validateStep1Payload.safeParse({ aadhaarNumber: '123', applicantName: 'A', mobileNumber: '9999999999', otp: '123456' });
    expect(result.success).toBe(false);
  });

  it('accepts valid step1 with mock otp', () => {
    const result = validateStep1Payload.safeParse({ aadhaarNumber: '123456789012', applicantName: 'John Doe', mobileNumber: '9876543210', otp: '123456' });
    expect(result.success).toBe(true);
  });
}); 