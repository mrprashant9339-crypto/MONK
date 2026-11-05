'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { organizationSchema } from '@monk/contracts';
import { apiRequest } from '@/lib/utils';

export function OnboardingForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get('name') ?? ''), slug: String(form.get('slug') ?? ''),
      country: 'IN', timezone: 'Asia/Kolkata', currency: 'INR', locale: 'en-IN',
      industry: String(form.get('industry') ?? ''),
    };
    const parsed = organizationSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your organization details.'); return; }
    setLoading(true);
    try {
      await apiRequest('/api/v1/organizations', { method: 'POST', body: JSON.stringify(parsed.data) });
      router.push('/workspace');
      router.refresh();
    } catch (requestError) {
      const typed = requestError as Error & { status?: number };
      if (typed.status === 401) router.replace('/login?next=/onboarding');
      else setError(typed.message);
    } finally { setLoading(false); }
  };
  return <form className="auth-form" onSubmit={submit}><div className="field"><label htmlFor="name">Organization name</label><input className="input" id="name" name="name" required autoFocus placeholder="Northstar Studio" onChange={(event) => { if (!slugTouched) setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)); }} /></div><div className="field"><label htmlFor="slug">Workspace URL</label><div className="slug-input"><input className="input" id="slug" name="slug" required value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} placeholder="northstar-studio" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><span>.monk.app</span></div><p className="field-hint">Lowercase letters, numbers and hyphens. You can change this later.</p></div><div className="field"><label htmlFor="industry">What kind of work do you do?</label><select className="select" id="industry" name="industry" defaultValue="Design & creative services"><option>Design & creative services</option><option>Consulting & advisory</option><option>Marketing services</option><option>Engineering services</option><option>Professional services</option><option>Other services</option></select></div><div className="onboarding-defaults"><span><Check />India pilot defaults</span><small>Asia/Kolkata · INR · English (India)</small></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button auth-submit" disabled={loading}>{loading ? <span className="spinner" /> : <ArrowRight />}{loading ? 'Creating your workspace…' : 'Create workspace'}</button><p className="onboarding-note">You’ll be the organization owner. Team invitations can be added after your workspace is ready.</p></form>;
}
