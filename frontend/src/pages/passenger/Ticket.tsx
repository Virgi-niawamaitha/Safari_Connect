import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Steps, Badge } from '../../components/UI';
import { useBooking } from '../../context/BookingContext';

export default function Ticket() {
  const navigate = useNavigate();
  const { booking, reset } = useBooking();
  const ref = booking.bookingRef || 'SC-2026-00892';

  return (
    <DashboardLayout title="Booking confirmed 🎉" subtitle="Your e-ticket is ready">
      <Steps steps={['Search','Results','Seat','Confirm','Payment','Ticket']} current={5} />

      <div style={{ background:'var(--brand-light)', border:'1px solid var(--brand-mid)', borderRadius:'var(--r-lg)', padding:'14px 20px', marginBottom:28, display:'flex', alignItems:'center', gap:14 }}>
        <span className="ai-chip">✓ Confirmed</span>
        <span style={{ fontSize:14, color:'var(--gray-700)' }}>
          <strong>Payment received.</strong> Your seat {booking.selectedSeat ?? '14B'} is reserved.
          Arrive at the stage by 7:40 AM. Safe journey!
        </span>
      </div>

      <div style={{ display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap' }}>
        <div className="ticket">
          <div className="ticket-head">
            <div className="ticket-brand">SafiriConnect · E-Ticket</div>
            <div className="ticket-route">Nairobi → Nakuru</div>
            <div className="ticket-ref">Ref: {ref}</div>
          </div>
          <div className="ticket-body">
            {[
              ['Passenger',   `${booking.passenger?.firstName ?? 'Jane'} ${booking.passenger?.lastName ?? 'Mwangi'}`],
              ['ID number',   booking.passenger?.idNumber ?? '23456789'],
              ['SACCO',       booking.selectedBus?.saccoName ?? 'Modern Coast'],
              ['Date',        booking.searchQuery?.date ?? 'Wed 18 Mar 2026'],
              ['Departure',   '8:00 AM'],
              ['Arrival',     '11:30 AM (estimated)'],
              ['Seat',        `${booking.selectedSeat ?? '14B'} · ${booking.seatClass ?? 'Economy'}`],
            ].map(([l, v]) => (
              <div key={l} className="ticket-row">
                <span className="ticket-row-label">{l}</span>
                <span style={{ fontWeight:600, color:'var(--gray-900)' }}>{v}</span>
              </div>
            ))}
            <div className="ticket-row">
              <span className="ticket-row-label">Amount paid</span>
              <strong style={{ color:'var(--brand)', fontSize:16 }}>
                KES {(booking.fare || 850).toLocaleString()}
              </strong>
            </div>
            <div className="ticket-row">
              <span className="ticket-row-label">Status</span>
              <Badge variant="green">✓ Confirmed</Badge>
            </div>
          </div>
          <div className="ticket-qr">
            <div style={{ fontFamily:'monospace', fontSize:40, letterSpacing:-2, color:'var(--gray-700)' }}>▉▊▉▊▉▊▉</div>
            <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:6 }}>{ref} · Present at boarding gate</div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:200 }}>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print ticket</button>
          <button className="btn" onClick={() => navigate('/passenger/mybookings')}>📂 View all bookings</button>
          <button className="btn btn-outline mt-2" onClick={() => { reset(); navigate('/passenger/search'); }}>
            + Book another trip
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
