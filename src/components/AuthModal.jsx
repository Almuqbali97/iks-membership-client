import { useEffect, useState } from 'react';
import { apiJson } from '../api.js';

const initialSignup = {
  firstName: '',
  lastName: '',
  email: '',
  mobileCountryIso: '',
  mobileNumber: '',
  countryOfLiving: '',
  nationality: '',
};

export function AuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState('signup');
  const [countries, setCountries] = useState([]);
  const [signup, setSignup] = useState(initialSignup);
  const [loginEmail, setLoginEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('register');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await apiJson('/meta/countries');
        const list = data.countries || [];
        setCountries(list);
        setSignup((s) => ({
          ...s,
          mobileCountryIso: s.mobileCountryIso || list[0]?.code || '',
        }));
      } catch {
        setError('Could not load countries.');
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMode('signup');
      setSignup(initialSignup);
      setLoginEmail('');
      setOtpEmail('');
      setOtpCode('');
      setStep('form');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  async function submitSignup(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const dial = countries.find((c) => c.code === signup.mobileCountryIso)?.dial;
      if (!dial) {
        setError('Select a valid mobile country code.');
        setPending(false);
        return;
      }
      await apiJson('/auth/register', {
        method: 'POST',
        body: {
          firstName: signup.firstName,
          lastName: signup.lastName,
          email: signup.email,
          mobileCountryCode: dial,
          mobileNumber: signup.mobileNumber,
          countryOfLiving: signup.countryOfLiving,
          nationality: signup.nationality,
        },
      });
      setOtpEmail(signup.email.trim().toLowerCase());
      setOtpPurpose('register');
      setStep('otp');
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setPending(false);
    }
  }

  async function submitLoginRequest(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await apiJson('/auth/login', {
        method: 'POST',
        body: { email: loginEmail.trim().toLowerCase() },
      });
      setOtpEmail(loginEmail.trim().toLowerCase());
      setOtpPurpose('login');
      setStep('otp');
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setPending(false);
    }
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const data = await apiJson('/auth/verify', {
        method: 'POST',
        body: {
          email: otpEmail,
          code: otpCode.trim(),
          purpose: otpPurpose,
        },
      });
      onAuthed(data.user);
      onClose();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setPending(false);
    }
  }

  const countryOptions = countries.map((c) => (
    <option key={c.code} value={c.code}>
      {c.name}
    </option>
  ));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="auth-title">{mode === 'signup' ? 'Create your account' : 'Sign in'}</h2>

        {step === 'form' && mode === 'signup' && (
          <form onSubmit={submitSignup} className="form-grid">
            <label>
              First name
              <input
                required
                value={signup.firstName}
                onChange={(e) => setSignup({ ...signup, firstName: e.target.value })}
              />
            </label>
            <label>
              Last name
              <input
                required
                value={signup.lastName}
                onChange={(e) => setSignup({ ...signup, lastName: e.target.value })}
              />
            </label>
            <label className="span-2">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={signup.email}
                onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              />
            </label>
            <label>
              Mobile code
              <select
                required
                value={signup.mobileCountryIso}
                onChange={(e) => setSignup({ ...signup, mobileCountryIso: e.target.value })}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mobile number
              <input
                required
                inputMode="numeric"
                autoComplete="tel-national"
                value={signup.mobileNumber}
                onChange={(e) => setSignup({ ...signup, mobileNumber: e.target.value })}
              />
            </label>
            <label>
              Country of living
              <select
                required
                value={signup.countryOfLiving}
                onChange={(e) => setSignup({ ...signup, countryOfLiving: e.target.value })}
              >
                <option value="">Select</option>
                {countryOptions}
              </select>
            </label>
            <label>
              Nationality
              <select
                required
                value={signup.nationality}
                onChange={(e) => setSignup({ ...signup, nationality: e.target.value })}
              >
                <option value="">Select</option>
                {countryOptions}
              </select>
            </label>
            {error && <p className="form-error span-2">{error}</p>}
            <div className="span-2 form-actions">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? 'Sending…' : 'Continue with email OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'form' && mode === 'login' && (
          <form onSubmit={submitLoginRequest} className="form-grid">
            <label className="span-2">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </label>
            {error && <p className="form-error span-2">{error}</p>}
            <div className="span-2 form-actions">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? 'Sending…' : 'Send sign-in code'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} className="form-grid">
            <p className="span-2 muted">
              Enter the 6-digit code sent to <strong>{otpEmail}</strong>
            </p>
            <label className="span-2">
              Verification code
              <input
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </label>
            {error && <p className="form-error span-2">{error}</p>}
            <div className="span-2 form-actions">
              <button type="button" className="btn-ghost" onClick={() => setStep('form')}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </form>
        )}

        {step === 'form' && (
          <p className="modal-switch">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button type="button" className="link" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" className="link" onClick={() => setMode('signup')}>
                  Create an account
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
