import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Steps } from '../../components/UI';
import { useBooking } from '../../context/BookingContext';

type PayStatus = 'initiating' | 'waiting' | 'success' | 'failed';

const POLL_INTERVAL = 4000;   // 4 s
const EXPIRY_SECS   = 60;

export default function Payment() {
  const navigate = useNavigate();
  const { booking, initiatePayment, pollPayment } = useBooking();

  const [status,   setStatus]   = useState<PayStatus>('initiating');
  const [seconds,  setSeconds]  = useState(EXPIRY_SECS);
  const [initErr,  setInitErr]  = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 1. Trigger STK push on mount ──────────────────────────────────────────
  useEffect(() => {
    const phone = booking.phone;
    if (!phone || !booking.bookingId) {
      setInitErr('Missing booking or phone number. Please go back.');
      setStatus('failed');
      return;
    }

    initiatePayment(phone)
      .then(() => setStatus('waiting'))
      .catch((e: any) => {
        setInitErr(e.message ?? 'Failed to send STK push. Try again.');
        setStatus('failed');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Count-down timer while waiting ─────────────────────────────────────
  useEffect(() => {
    if (status !== 'waiting') return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // ── 3. Poll payment status ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'waiting') { clearInterval(pollRef.current ?? undefined); return; }

    pollRef.current = setInterval(async () => {
      const result = await pollPayment();
      if (result === 'SUCCESS') {
        clearInterval(pollRef.current ?? undefined);
        setStatus('success');
        setTimeout(() => navigate('/passenger/ticket'), 1400);
      } else if (result === 'FAILED') {
        clearInterval(pollRef.current ?? undefined);
        setStatus('failed');
        setInitErr('Payment was declined or timed out. Please try again.');
      }
      // PENDING → keep polling
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current ?? undefined);
  }, [status, pollPayment, navigate]);

  // ── Resend STK push ────────────────────────────────────────────────────────
  const handleResend = async () => {
    setInitErr('');
    setSeconds(EXPIRY_SECS);
    setStatus('initiating');
    try {
      await initiatePayment(booking.phone);
      setStatus('waiting');
    } catch (e: any) {
      setInitErr(e.message ?? 'Could not resend. Try again.');
      setStatus('failed');
    }
  };

  const icon =
    status === 'success'   ? '✅' :
    status === 'failed'    ? '❌' :
    status === 'initiating'? '⏳' : '📱';

  return (
    <DashboardLayout title="M-Pesa Payment" subtitle="Complete payment to confirm your booking">
      <Steps steps={['Search','Results','Seat','Confirm','Payment','Ticket']} current={4} />

      <div style={{ maxWidth: 520 }}>
        <div className="card text-center" style={{ padding: '44px 36px' }}>
          <div style={{ fontSize: 66, marginBottom: 20 }} className={status === 'waiting' ? 'pulse-icon' : ''}>
            {icon}
          </div>

          <div style={{ fontFamily:"'Syne',sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 6 }}>
            KES {(booking.fare || 0).toLocaleString()}
          </div>
          <p className="text-muted mb-5">
            STK push sent to <strong style={{ color:'var(--gray-800)' }}>{booking.phone || '—'}</strong>
          </p>

          {status === 'initiating' && (
            <div style={{ color:'var(--gray-500)', fontSize:14 }}>Sending payment request…</div>
          )}

          {status === 'waiting' && (
            <>
              <div style={{ background:'var(--warning-light)', border:'1px solid #fde68a', borderRadius:'var(--r)', padding:16, marginBottom:24 }}>
                <div style={{ fontWeight:700, color:'#92400e', marginBottom:6 }}>Check your phone now</div>
                <div style={{ fontSize:13, color:'#92400e', marginBottom:12 }}>
                  Enter your M-Pesa PIN to confirm. Request expires in{' '}
                  <strong>{seconds}s</strong>.
                </div>
                <div style={{ height:4, background:'#fde68a', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--warning)', borderRadius:99, width:`${(seconds/EXPIRY_SECS)*100}%`, transition:'width 1s linear' }} />
                </div>
              </div>
              <button className="btn btn-ghost btn-full" onClick={handleResend}>Resend STK push</button>
            </>
          )}

          {status === 'success' && (
            <div style={{ background:'var(--brand-light)', border:'1px solid var(--brand-mid)', borderRadius:'var(--r)', padding:20 }}>
              <div style={{ fontWeight:700, color:'var(--brand-dark)', fontSize:16 }}>Payment received!</div>
              <div style={{ fontSize:13, color:'var(--gray-500)', marginTop:4 }}>Generating your ticket…</div>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div style={{ background:'var(--danger-light)', border:'1px solid #fca5a5', borderRadius:'var(--r)', padding:16, marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'var(--danger)' }}>Payment failed</div>
                <div style={{ fontSize:13, color:'#991b1b', marginTop:4 }}>{initErr || 'Something went wrong.'}</div>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleResend}>Try again</button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted text-center mt-3">
          🔒 Payments processed securely via Safaricom M-Pesa
        </p>
      </div>
    </DashboardLayout>
  );
}
