import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge, AiBanner } from '../../components/UI';
import { adminApi } from '../../services/api';
import type { BadgeVariant } from '../../types';

interface Row {
  id: string; name: string; owner: string; email: string;
  routes: number; vehicles: number; revenue: string;
  status: string; variant: BadgeVariant; joined: string;
}

function saccoStatus(s: any): { label: string; variant: BadgeVariant } {
  if (s.isActive === false || s.status === 'SUSPENDED') return { label:'Suspended', variant:'red' };
  if (s.status === 'PENDING' || s.isApproved === false) return { label:'Pending',   variant:'amber' };
  return { label:'Active', variant:'green' };
}

export default function AdminSaccos() {
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('All');

  const loadSaccos = () => {
    setLoading(true);
    adminApi.saccos()
      .then(res => {
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        setRows(data.map(s => {
          const { label, variant } = saccoStatus(s);
          return {
            id:       s.id,
            name:     s.name ?? '—',
            owner:    s.owner ? `${s.owner.firstName ?? ''} ${s.owner.lastName ?? ''}`.trim() : '—',
            email:    s.supportEmail ?? s.owner?.email ?? '—',
            routes:   s._count?.routes   ?? s.routes   ?? 0,
            vehicles: s._count?.buses    ?? s.vehicles  ?? 0,
            revenue:  s.revenueThisMonth ? `KES ${parseFloat(s.revenueThisMonth).toLocaleString()}` : '—',
            status:   label,
            variant,
            joined:   s.createdAt
              ? new Date(s.createdAt).toLocaleDateString('en-KE', { month:'short', year:'numeric' })
              : '—',
          };
        }));
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false));
  };

  useEffect(loadSaccos, []);

  const handleApprove = async (id: string) => {
    await adminApi.updateSaccoStatus(id, true).catch(() => {});
    loadSaccos();
  };

  const handleReject = async (id: string) => {
    await adminApi.updateSaccoStatus(id, false).catch(() => {});
    loadSaccos();
  };

  const visible = rows.filter(s => status === 'All' || s.status === status);
  const pendingCount = rows.filter(s => s.status === 'Pending').length;

  return (
    <DashboardLayout
      title="SACCO Management"
      subtitle="Approve, monitor and manage transport operators on the platform"
      actions={<button className="btn btn-primary btn-sm">+ Register SACCO</button>}
    >
      <AiBanner text={`<strong>${pendingCount} SACCO${pendingCount !== 1 ? 's' : ''} pending approval.</strong> AI background check complete: no fraud signals detected. Recommend approval within 24h to meet onboarding SLA.`} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Active SACCOs',   value: rows.filter(s=>s.status==='Active').length },
          { label:'Pending Approval',value: rows.filter(s=>s.status==='Pending').length },
          { label:'Suspended',       value: rows.filter(s=>s.status==='Suspended').length },
          { label:'Total Vehicles',  value: rows.reduce((a,s)=>a+s.vehicles, 0) },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding:'18px 20px', textAlign:'center' }}>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['All','Active','Pending','Suspended'].map(f => (
          <button key={f} className={`btn btn-sm ${status===f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStatus(f)}>{f}</button>
        ))}
      </div>

      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize:32, marginBottom:12 }}>🚌</div>
          <div>Loading SACCOs…</div>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table className="sc-table">
            <thead>
              <tr><th>SACCO</th><th>Owner</th><th>Routes</th><th>Vehicles</th>
                <th>Revenue</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'var(--gray-400)' }}>{s.email}</div>
                  </td>
                  <td style={{ fontSize:13 }}>{s.owner}</td>
                  <td style={{ fontWeight:600 }}>{s.routes || '—'}</td>
                  <td style={{ fontWeight:600 }}>{s.vehicles || '—'}</td>
                  <td style={{ fontWeight:600 }}>{s.revenue}</td>
                  <td style={{ fontSize:12, color:'var(--gray-400)' }}>{s.joined}</td>
                  <td><Badge variant={s.variant}>{s.status}</Badge></td>
                  <td>
                    {s.status === 'Pending' ? (
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprove(s.id)}>Approve</button>
                        <button className="btn btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleReject(s.id)}>Reject</button>
                      </div>
                    ) : (
                      <button className="btn btn-sm">View</button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--gray-400)', padding:32 }}>No SACCOs in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
