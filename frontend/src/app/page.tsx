'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchSchema, validateStep1, validateStep2, submitAll, lookupPin, Step1Payload, Step2Payload, sendOtp } from '@/lib/api';

type Field = { name: string; label: string; type: string; required?: boolean; pattern?: string };

type Step = { id: number; title: string; fields: Field[] };

type Schema = { steps: Step[] };

function MobileWithOtp({ value, onChange, error, onOtpReceived }: { value: string; onChange: (v: string) => void; error?: string; onOtpReceived: (otp: string) => void }) {
  const [sending, setSending] = useState(false);
  const canSend = /^[6-9]\d{9}$/.test(value);
  const handleSend = async () => {
    if (!canSend) {
      alert('Enter a valid 10-digit mobile number');
      return;
    }
    setSending(true);
    try {
      const res = await sendOtp(value);
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        alert(data?.error || 'Failed to send OTP');
        return;
      }
      if (data?.otp) {
        onOtpReceived(data.otp);
        alert(`Your OTP is ${data.otp}`);
      } else {
        alert('OTP not received');
      }
    } catch (e) {
      alert('Network error while sending OTP');
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Mobile Number *</label>
      <div className="flex gap-2 items-center">
        <input
          className={`border rounded px-3 py-2 outline-none focus:ring w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mobile Number"
        />
        <button type="button" onClick={handleSend} disabled={!canSend || sending} className="whitespace-nowrap px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
          {sending ? 'Sending…' : 'Get OTP'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Input({ field, value, onChange, error }: { field: Field; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {field.label}
        {field.required ? ' *' : ''}
      </label>
      <input
        className={`border rounded px-3 py-2 outline-none focus:ring w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
        type={field.type === 'text' ? 'text' : field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Home() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [active, setActive] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchema().then(setSchema).catch(console.error);
  }, []);

  const step = useMemo(() => (schema ? schema.steps.find((s) => s.id === active) : undefined), [schema, active]);

  useEffect(() => {
    const pin = values['pinCode'];
    if (pin && /^\d{6}$/.test(pin)) {
      lookupPin(pin).then((r) => {
        if (r) {
          setValues((v) => ({ ...v, state: r.state || v.state || '', city: r.city || v.city || '' }));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values['pinCode']]);

  const handleNext = async () => {
    if (!step) return;
    const payload: Record<string, string> = {};
    step.fields.forEach((f) => (payload[f.name] = values[f.name] || ''));
    const res = active === 1 ? await validateStep1(payload as Step1Payload) : await validateStep2(payload as Step2Payload);
    if (!res.ok) {
      const data = await res.json();
      const fieldErrors: Record<string, string[]> = data.errors?.fieldErrors || {};
      const flat: Record<string, string> = {};
      Object.keys(fieldErrors).forEach((k) => (flat[k] = fieldErrors[k][0]));
      setErrors(flat);
      return;
    }
    setErrors({});
    if (active === 1) setActive(2);
    else await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!schema) return;
    setSubmitting(true);
    const step1: Step1Payload = Object.fromEntries(schema.steps[0].fields.map((f) => [f.name, values[f.name] || ''])) as Step1Payload;
    const step2: Step2Payload = Object.fromEntries(schema.steps[1].fields.map((f) => [f.name, values[f.name] || ''])) as Step2Payload;
    const res = await submitAll(step1, step2);
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      setSuccessId(data.id);
    } else {
      const data = await res.json();
      const f1: Record<string, string[]> = data.step1?.fieldErrors || {};
      const f2: Record<string, string[]> = data.step2?.fieldErrors || {};
      const fieldErrors = { ...f1, ...f2 } as Record<string, string[]>;
      const flat: Record<string, string> = {};
      Object.keys(fieldErrors).forEach((k) => (flat[k] = fieldErrors[k][0]));
      setErrors(flat);
    }
  };

  if (!schema) return <div className="min-h-screen grid place-items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-2">Udyam Registration</h1>
        <p className="text-sm text-gray-600 mb-6">Aadhaar and PAN steps</p>

        <div className="flex items-center gap-2 mb-6">
          <div className={`h-2 rounded-full flex-1 ${active >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`h-2 rounded-full flex-1 ${active >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        </div>

        {successId ? (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-medium">Submitted</p>
            <p className="text-sm text-gray-700">Reference ID: {successId}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">{step?.title}</h2>
            <div className="grid grid-cols-1 gap-4">
              {step?.fields.map((f) => (
                f.name === 'mobileNumber' ? (
                  <MobileWithOtp
                    key={f.name}
                    value={values[f.name] || ''}
                    onChange={(v) => setValues((o) => ({ ...o, [f.name]: v }))}
                    error={errors[f.name]}
                    onOtpReceived={(otp) => setValues((o) => ({ ...o, otp }))}
                  />
                ) : (
                  <Input key={f.name} field={f} value={values[f.name] || ''} onChange={(v) => setValues((o) => ({ ...o, [f.name]: v }))} error={errors[f.name]} />
                )
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 rounded border" onClick={() => setActive(Math.max(1, active - 1))} disabled={active === 1}>
                Back
              </button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60" onClick={handleNext} disabled={submitting}>
                {active === 1 ? 'Next' : submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
