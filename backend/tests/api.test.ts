import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('API', () => {
  it('health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('schema GET', async () => {
    const res = await request(app).get('/api/schema');
    expect(res.status).toBe(200);
    expect(res.body.steps?.length).toBeGreaterThan(0);
  });

  it('send otp', async () => {
    const res = await request(app).post('/api/otp/send').send({ mobileNumber: '9876543210' });
    expect(res.status).toBe(200);
    expect(res.body.otp).toBe('123456');
  });

  it('validate step1 invalid otp', async () => {
    const res = await request(app).post('/api/validate/step1').send({
      aadhaarNumber: '123456789012',
      applicantName: 'John Doe',
      mobileNumber: '9876543210',
      otp: '000000'
    });
    expect(res.status).toBe(400);
  });

  it('validate step2 pan', async () => {
    const res = await request(app).post('/api/validate/step2').send({ panNumber: 'ABCDE1234F' });
    expect(res.status).toBe(200);
  });
}); 