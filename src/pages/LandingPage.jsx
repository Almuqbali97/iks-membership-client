import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.avif';
import { AuthModal } from '../components/AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MEMBERSHIP_BENEFITS } from '../data/membershipBenefits.js';

export function LandingPage() {
  const { user, loading, setUser } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="page landing">
      <header className="top-bar">
        <img src={logo} alt="IKS" className="logo" />
        <div className="top-actions">
          {!loading && user && (
            <button type="button" className="btn-ghost" onClick={() => navigate('/member')}>
              Membership
            </button>
          )}
          {!loading && !user && (
            <button type="button" className="btn-ghost" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="landing-main">
        <section className="hero card">
          <p className="eyebrow">International Keratoconus Society</p>
          <h1>Become a member today</h1>
          <p className="lede">
            Join IKS and unlock conference savings, WKC benefits, and members-only updates.
          </p>
          <button
            type="button"
            className="btn-primary btn-large"
            onClick={() => {
              if (user) navigate('/member');
              else setAuthOpen(true);
            }}
          >
            {user ? 'Continue to membership' : 'Become a member'}
          </button>
        </section>

        <section className="card benefits">
          <h2>Membership benefits</h2>
          <ul>
            {MEMBERSHIP_BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={(u) => {
          setUser(u);
          setAuthOpen(false);
          navigate('/member');
        }}
      />
    </div>
  );
}
