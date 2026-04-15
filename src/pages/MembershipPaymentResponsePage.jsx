import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiJson } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function MembershipPaymentResponsePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const clientReferenceId = useMemo(
    () => searchParams.get('client_reference_id') || '',
    [searchParams]
  );

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!clientReferenceId) {
        if (!active) return;
        setStatus('failed');
        setError('Invalid payment reference.');
        return;
      }

      try {
        const res = await apiJson(
          `/payment/membership/verify?client_reference_id=${encodeURIComponent(clientReferenceId)}`
        );
        if (!active) return;

        if (!res?.success) {
          setStatus('failed');
          setError('Could not verify payment status.');
          return;
        }

        const data = res.data || null;
        setPaymentData(data);

        if (data?.payment_status === 'paid') {
          await refresh();
          setStatus('success');
          return;
        }

        if (data?.payment_status === 'cancelled') {
          setStatus('failed');
          setError('Payment was cancelled.');
          return;
        }

        if (data?.payment_status === 'failed') {
          setStatus('failed');
          setError('Payment failed. Please try again.');
          return;
        }

        setStatus('failed');
        setError('Payment is still pending. Please check again in a moment.');
      } catch (err) {
        if (!active) return;
        setStatus('failed');
        setError(err?.data?.message || err?.data?.error || 'Failed to verify payment.');
      }
    }

    verify();
    return () => {
      active = false;
    };
  }, [clientReferenceId, refresh]);

  return (
    <div className="page checkout-result">
      <main className="center">
        <div className="card result-card">
          {status === 'verifying' && (
            <>
              <div className="spinner" />
              <h1>Verifying payment</h1>
              <p className="muted">Please wait while we confirm your transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="result-icon result-icon--success">✓</div>
              <h1>Payment successful</h1>
              <p className="muted">Your IKS membership is now active.</p>
              <div className="result-detail-box">
                <div className="result-row">
                  <span className="result-label">Membership code</span>
                  <span className="result-value">
                    {paymentData?.membership?.membership_code || 'N/A'}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Amount paid</span>
                  <span className="result-value">
                    {paymentData?.total_amount
                      ? `${(paymentData.total_amount / 1000).toFixed(3)} OMR (~50 USD)`
                      : '21.000 OMR (~50 USD)'}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Status</span>
                  <span className="result-value">Paid</span>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                <button type="button" className="btn-primary" onClick={() => navigate('/member')}>
                  Go to membership
                </button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="result-icon result-icon--fail">×</div>
              <h1>Payment not completed</h1>
              <p className="muted">{error}</p>
              <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                <button type="button" className="btn-primary" onClick={() => navigate('/member')}>
                  Try again
                </button>
                <Link to="/" className="btn-ghost">
                  Home
                </Link>
              </div>
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
