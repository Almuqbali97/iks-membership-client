import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.avif';
import { apiJson } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MEMBERSHIP_BENEFITS } from '../data/membershipBenefits.js';

export function MemberPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="page center">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const isMember = Boolean(user.membershipPaidAt && user.membershipCode);

  async function handleCreateCheckout() {
    if (isCreatingCheckout || isMember) return;
    setPaymentError('');
    setIsCreatingCheckout(true);
    try {
      const res = await apiJson('/payment/create-membership-checkout', { method: 'POST' });
      if (!res?.success || !res?.sessionUrl) {
        throw new Error('Invalid payment session response');
      }
      window.location.href = res.sessionUrl;
    } catch (error) {
      setPaymentError(
        error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          'Could not start payment. Please try again.'
      );
    } finally {
      setIsCreatingCheckout(false);
    }
  }

  return (
    <div className="page member">
      <header className="top-bar">
        <Link to="/">
          <div className="brand">
            <img src={logo} alt="IKS" className="logo" />
            <div className="brand-text">International Keratoconus Society</div>
          </div>
        </Link>
        <div className="top-actions">
          <p className="welcome-text">
            Welcome {user.firstName} {user.lastName}
          </p>
          <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
            Home
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="member-main">
        <div className="card member-card">
          <h1>IKS membership</h1>
          <p className="muted">
            Signed in as <strong>{user.email}</strong>
          </p>

          {isMember ? (
            <div className="member-active">
              <p className="success-banner">
                You are a member. Your membership code is{' '}
                <strong className="code">{user.membershipCode}</strong>
              </p>
              <p className="muted small">
                Thank you for supporting the International Keratoconus Society.
              </p>
            </div>
          ) : (
            <>
              <section className="member-benefits" aria-labelledby="member-benefits-heading">
                <h2 id="member-benefits-heading">What you get with membership</h2>
                <ul>
                  {MEMBERSHIP_BENEFITS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <div className="price-block">
                <p className="price">
                  21 OMR <span className="tilde">(~</span> 50 USD<span className="tilde">)</span>
                </p>
                <p className="muted small">One-time secure checkout with Thawani</p>
              </div>
              <button
                type="button"
                className="btn-primary btn-large"
                onClick={handleCreateCheckout}
                disabled={isCreatingCheckout}
              >
                {isCreatingCheckout ? 'Redirecting…' : 'Pay securely'}
              </button>
              {paymentError && <p className="form-error" style={{ marginTop: '0.75rem' }}>{paymentError}</p>}
            </>
          )}
        </div>
      </main>
      <footer className="site-footer">
        <small>© {new Date().getFullYear()} International Keratoconus Society. All rights reserved.</small>
      </footer>
    </div>
  );
}
