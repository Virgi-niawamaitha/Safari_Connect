import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge, StatTile } from '../../components/UI';
import { adminApi } from '../../services/api';
import type { BadgeVariant } from '../../types';

interface Row {
  id: string; bookingCode: string; passenger: string; sacco: string;
  route: string; date: string; amount: number; commission: number;
  mpesaCode: string; status: string; variant: BadgeVariant;
}

function payVariant(s: string): BadgeVariant {
  if (s === 'SUCCESS')  return 'green';
  if (s === 'REFUNDED') return 'amber';
  if (s === 'FAILED')   return 'red';
  if (s === 'PENDING' || s === 'INITIATED') return 'blue';
  return 'gray';
}

const FILTERS = ['All', 'Success', 'Pending', 'Refunded', 'Failed'];

export default function AdminPayments() {
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');

  useEffect(() => {
    adminApi.payments()
      .then(res => {
        const data: any[] = res.data ?? [];
        setRows(data.map(p => ({
          id:          p.id,
          bookingCode: p.booking?.bookingCode ?? '—',
          passenger:   p.booking ? `${p.booking.firstName ?? ''} ${p.booking.lastName ?? ''}`.trim() : '—',
          sacco:       p.booking?.trip?.sacco?.name ?? '—',
          route:       p.booking?.trip?.route
            ? `${p.booking.trip.route.origin} → ${p.booking.trip.route.destination}`
            : '—',
          date:        p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })
            : '—',
          amount:      parseFloat(p.amount || '0'),
          commission:  parseFloat(p.amount || '0') * 0.05,
          mpesaCode:   p.transactionRef ?? p.checkoutRequestId ?? '—',
          status:      p.status ?? 'PENDING',
          variant:     payVariant(p.status),
        })));
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false));
  }, []);

  const filterLabel = (s: string) => s.toUpperCase();
  const visible = rows.filter(p => filter === 'All' || p.status === filterLabel(filter));

  const settled    = rows.filter(p => p.status === 'SUCCESS');
  const totalRev   = settled.reduce((a, p) => a + p.amount, 0);
  const totalComm  = settled.reduce((a, p) => a + p.commission, 0);

  return (
    <DashboardLayout
      title="Payments Overview"
      subtitle="All M-Pesa transactions — revenue, commissions, refunds, disputes"
      actions={<button className="btn btn-primary btn-sm">Export CSV</button>}
    >
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatTile label="Total Revenue"       value={`KES ${totalRev.toLocaleString()}`} sub="Settled only" />
        <StatTile label="Platform Commission" value={`KES ${Math.round(totalComm).toLocaleString()}`} sub="5% avg rate" />
        <StatTile label="Refunds"             value={rows.filter(p=>p.status==='REFUNDED').length} sub="This period" />
        <StatTile label="Failed"              value={rows.filter(p=>p.status==='FAILED').length}   sub="Needs review" neg />
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {FILTERS.map(f => (
          <button key={f} className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize:32, marginBottom:12 }}>💳</div>
          <div>Loading payments…</div>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table className="sc-table">
            <thead>
              <tr><th>Transaction ID</th><th>Booking ref</th><th>Passenger</th><th>SACCO</th>
                <th>Route</th><th>Date</th><th>Amount</th><th>Commission</th><th>M-Pesa code</th><th>Status</th></tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id}>
                  <td className="td-primary" style={{ fontFamily:'monospace', fontSize:11 }}>{p.id.slice(0,14)}…</td>
                  <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--gray-500)' }}>{p.bookingCode}</td>
                  <td style={{ fontWeight:500, fontSize:13 }}>{p.passenger}</td>
                  <td style={{ fontSize:13 }}>{p.sacco}</td>
                  <td style={{ fontSize:13 }}>{p.route}</td>
                  <td style={{ fontSize:12, color:'var(--gray-500)' }}>{p.date}</td>
                  <td style={{ fontWeight:700 }}>KES {p.amount.toLocaleString()}</td>
                  <td style={{ fontWeight:600, color:'var(--brand)' }}>KES {Math.round(p.commission).toLocaleString()}</td>
                  <td style={{ fontFamily:'monospace', fontSize:12, letterSpacing:'.5px' }}>{p.mpesaCode}</td>
                  <td><Badge variant={p.variant}>{p.status}</Badge></td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign:'center', color:'var(--gray-400)', padding:32 }}>No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
