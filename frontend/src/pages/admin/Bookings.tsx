import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge } from '../../components/UI';
import { adminApi } from '../../services/api';
import type { BadgeVariant } from '../../types';

interface Row {
  id: string; code: string; passenger: string; route: string; sacco: string;
  date: string; seat: string; fare: string; payment: string;
  status: string; variant: BadgeVariant;
}

function mapStatus(s: string): { label: string; variant: BadgeVariant } {
  const m: Record<string, { label: string; variant: BadgeVariant }> = {
    CONFIRMED:  { label:'Confirmed',  variant:'green' },
    PENDING:    { label:'Pending',    variant:'amber' },
    CANCELLED:  { label:'Cancelled', variant:'red'   },
    BOARDED:    { label:'Boarded',   variant:'blue'  },
    'AI-HOLD':  { label:'AI Hold',   variant:'red'   },
  };
  return m[s] ?? { label: s, variant:'gray' };
}

const FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Boarded'];

export default function AdminBookings() {
  const [rows, setRows]     = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.bookings()
      .then(res => {
        const data: any[] = res.data ?? [];
        setRows(data.map(b => {
          const { label, variant } = mapStatus(b.status);
          const payStatus = b.payment?.status === 'SUCCESS' ? 'M-Pesa ✓'
            : b.payment?.status === 'REFUNDED' ? 'Refunded'
            : b.payment ? 'Pending' : '—';
          return {
            id:        b.id,
            code:      b.bookingCode ?? '—',
            passenger: `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim() || '—',
            route:     `${b.trip?.route?.origin ?? '—'} → ${b.trip?.route?.destination ?? '—'}`,
            sacco:     b.trip?.sacco?.name ?? '—',
            date:      b.trip?.departureTime
              ? new Date(b.trip.departureTime).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })
              : '—',
            seat:      b.seat?.seatNumber ? `${b.seat.seatNumber} ${b.seat.seatClass}` : '—',
            fare:      `KES ${parseFloat(b.amount || '0').toLocaleString()}`,
            payment:   payStatus,
            status:    label,
            variant,
          };
        }));
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false));
  }, []);

  const visible = rows.filter(b => {
    const matchFilter = filter === 'All' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || b.code.toLowerCase().includes(q) ||
      b.passenger.toLowerCase().includes(q) || b.route.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout
      title="Booking Oversight"
      subtitle="All platform bookings — monitor, filter, and investigate"
      actions={<button className="btn btn-primary btn-sm">Export</button>}
    >
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input className="input" placeholder="Search by ref, passenger, route…"
          style={{ maxWidth:280, fontSize:13 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <span className="text-muted" style={{ fontSize:12, marginLeft:'auto' }}>{visible.length} results</span>
      </div>

      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize:32, marginBottom:12 }}>📋</div>
          <div>Loading bookings…</div>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table className="sc-table">
            <thead>
              <tr><th>Booking ref</th><th>Passenger</th><th>Route</th><th>SACCO</th>
                <th>Date</th><th>Seat</th><th>Fare</th><th>Payment</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {visible.map(b => (
                <tr key={b.id}>
                  <td className="td-primary" style={{ fontFamily:'monospace', fontSize:12 }}>{b.code}</td>
                  <td style={{ fontWeight:500 }}>{b.passenger}</td>
                  <td>{b.route}</td>
                  <td>{b.sacco}</td>
                  <td>{b.date}</td>
                  <td style={{ fontSize:12 }}>{b.seat}</td>
                  <td style={{ fontWeight:600 }}>{b.fare}</td>
                  <td style={{ fontSize:12, color: b.payment.includes('✓') ? 'var(--brand)' : b.payment==='Refunded' ? 'var(--warning)' : 'inherit' }}>
                    {b.payment}
                  </td>
                  <td><Badge variant={b.variant}>{b.status}</Badge></td>
                  <td><button className="btn btn-sm">View</button></td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign:'center', color:'var(--gray-400)', padding:32 }}>No bookings match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
