import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.avif';
import { useAuth } from '../context/AuthContext.jsx';
import { MEMBERSHIP_BENEFITS } from '../data/membershipBenefits.js';

export function MemberPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

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

  return (
    <div className="page member">
      <header className="top-bar">
        <Link to="/">
          <img src={logo} alt="IKS" className="logo" />
        </Link>
        <div className="top-actions">
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
                <p className="muted small">Online payment opening soon</p>
              </div>
              <button
                type="button"
                className="btn-primary btn-large"
                onClick={() => setShowPaymentNotice(true)}
              >
                Pay securely
              </button>
            </>
          )}
        </div>
      </main>

      {showPaymentNotice && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowPaymentNotice(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-notice-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowPaymentNotice(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 id="payment-notice-title">Payment</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              Payment will be available within an hour.
            </p>
            <div className="form-actions" style={{ marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-primary" onClick={() => setShowPaymentNotice(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
