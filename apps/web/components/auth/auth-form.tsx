'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { passwordSchema, signInSchema, signUpSchema } from '@monk/contracts';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function AuthForm({ mode, next = '/workspace' }: { mode: 'sign-in' | 'sign-up' | 'forgot' | 'reset'; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/workspace';
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isSupabaseConfigured()) { setError('Live authentication is not configured yet. You can still explore the interactive demo.'); return; }
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const fullName = String(form.get('fullName') ?? '');
    const acceptedLegal = form.get('acceptedLegal') === 'on';

    if (mode === 'sign-up') {
      const parsed = signUpSchema.safeParse({ fullName, email, password, acceptedLegal });
      if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your details and accept the legal terms.'); return; }
    } else if (mode === 'sign-in') {
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) { setError('Enter a valid email address and password.'); return; }
    } else {
      const parsed = passwordSchema.safeParse(password);
      if (mode === 'reset' && !parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Use a stronger password.'); return; }
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (mode === 'sign-in') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError('The email or password is incorrect, or your email still needs verification.'); return; }
        router.push(safeNext);
        router.refresh();
      } else if (mode === 'sign-up') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, accepted_legal: 'true', terms_version: '2026-11-05', privacy_version: '2026-11-05' },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        });
        if (authError) { setError('We couldn’t create your account. Try a different email or sign in if you already have one.'); return; }
        if (data.session) router.push('/onboarding');
        else setSuccess('Check your inbox and confirm your email address. Then we’ll help you create your workspace.');
      } else if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (authError) { setError('The recovery email could not be sent. Please wait a moment and try again.'); return; }
        setSuccess('If an account exists for that email, a recovery link is on its way. The link expires shortly.');
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) { setError('This recovery link may have expired. Request a new link and try again.'); return; }
        await supabase.auth.signOut({ scope: 'others' });
        setSuccess('Your password has been updated. Other sessions have been signed out.');
        setTimeout(() => router.push('/workspace'), 900);
      }
    } catch {
      setError('The secure service could not be reached. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div className="auth-success" role="status"><span><CheckCircle2 /></span><h2>{mode === 'forgot' ? 'Check your inbox' : mode === 'reset' ? 'Password updated' : 'One more step'}</h2><p>{success}</p>{mode === 'sign-up' || mode === 'forgot' ? <Link className="button button-secondary" href="/login">Back to sign in <ArrowRight /></Link> : <Link className="button button-secondary" href="/demo">Explore the demo meanwhile <ArrowRight /></Link>}</div>;

  return <><form className="auth-form" onSubmit={submit} noValidate>
    {mode === 'sign-up' && <div className="field"><label htmlFor="fullName">Your name</label><input className="input" id="fullName" name="fullName" autoComplete="name" required autoFocus placeholder="Arjun Mehta" /></div>}
    {mode !== 'reset' && <div className="field"><label htmlFor="email">Work email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required autoFocus={mode !== 'sign-up'} placeholder="you@company.com" /></div>}
    {mode !== 'forgot' && <div className="field"><div className="auth-label-row"><label htmlFor="password">{mode === 'reset' ? 'New password' : 'Password'}</label>{mode === 'sign-in' && <Link href="/forgot-password">Forgot password?</Link>}</div><input className="input" id="password" name="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required minLength={mode === 'sign-in' ? 1 : 10} placeholder={mode === 'sign-in' ? 'Your password' : 'At least 10 characters'} />{mode !== 'sign-in' && <p className="field-hint">Use at least 10 characters. A unique passphrase works best.</p>}</div>}
    {mode === 'sign-up' && <label className="checkbox-row"><input type="checkbox" name="acceptedLegal" required /><span>I agree to the <Link href="/legal/terms" target="_blank">Terms</Link> and acknowledge the <Link href="/legal/privacy" target="_blank">Privacy Policy</Link> (version 5 Nov 2026).</span></label>}
    {error && <div className="form-error" role="alert">{error}{!isSupabaseConfigured() && <> <Link href="/demo">Open demo</Link></>}</div>}
    <button className="button auth-submit" disabled={loading}>{loading ? <span className="spinner" /> : <ArrowRight />}{loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in to MONK' : mode === 'sign-up' ? 'Create your account' : mode === 'forgot' ? 'Send recovery link' : 'Update password'}</button>
  </form><div className="auth-switch">{mode === 'sign-in' && <>New to MONK? <Link href="/signup">Create an account</Link></>}{mode === 'sign-up' && <>Already have an account? <Link href="/login">Sign in</Link></>}{mode === 'forgot' && <Link href="/login">Back to sign in</Link>}{mode === 'reset' && <Link href="/forgot-password">Request a new link</Link>}</div>{mode === 'sign-in' && <div className="auth-demo-link"><span>Just looking around?</span><Link href="/demo">Explore the interactive demo <ArrowRight /></Link></div>}</>;
}
