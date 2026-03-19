import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge } from '../../components/UI';
import { bookingsApi } from '../../services/api';
import type { ApiBooking } from '../../services/api';
import type { BadgeVariant } from '../../types';

function statusVariant(s: string): BadgeVariant {
  if (s === 'CONFIRMED') return 'green';
  if (s === 'PENDING')   return 'amber';
  if (s === 'CANCELLED') return 'red';
  if (s === 'BOARDED')   return 'blue';
  return 'gray';
}

function statusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [rows, setRows]       = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    bookingsApi.mine()
      .then(res => setRows(res.data ?? []))
      .catch(e  => setError(e.message ?? 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title="My bookings"
      subtitle="All your trip history and upcoming journeys"
      actions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/passenger/search')}>+ Book new trip</button>}
    >
      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize:32, marginBottom:12 }}>📋</div>
          <div>Loading your bookings…</div>
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding:32, textAlign:'center' }}>
          <div style={{ color:'var(--danger)', fontWeight:600, marginBottom:8 }}>Could not load bookings</div>
          <div className="text-muted" style={{ fontSize:13 }}>{error}</div>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎫</div>
          <div style={{ fontWeight:600, marginBottom:6 }}>No bookings yet</div>
          <div className="text-muted" style={{ fontSize:13 }}>Book your first trip to see it here.</div>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/passenger/search')}>Book a trip</button>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="table-wrap">
          <table className="sc-table">
            <thead>
              <tr>
                <th>Booking ref</th><th>Route</th><th>SACCO</th><th>Date</th>
                <th>Seat</th><th>Fare</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(b => {
                const route = `${b.trip?.route?.origin ?? '—'} → ${b.trip?.route?.destination ?? '—'}`;
                const sacco = b.trip?.sacco?.name ?? '—';
                const date  = b.trip?.departureTime
                  ? new Date(b.trip.departureTime).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })
                  : '—';
                const seat  = `${b.seat?.seatNumber ?? '—'} ${b.seat?.seatClass ?? ''}`;
                const fare  = `KES ${parseFloat(b.amount || '0').toLocaleString()}`;
                const variant = statusVariant(b.status);
                return (
                  <tr key={b.id}>
                    <td className="td-primary">{b.bookingCode}</td>
                    <td style={{ fontWeight:500 }}>{route}</td>
                    <td>{sacco}</td>
                    <td>{date}</td>
                    <td>{seat}</td>
                    <td style={{ fontWeight:600 }}>{fare}</td>
                    <td><Badge variant={variant}>{statusLabel(b.status)}</Badge></td>
                    <td>
                      <button className="btn btn-sm" onClick={() => navigate('/passenger/ticket')}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
