import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge } from '../../components/UI';
import { adminApi } from '../../services/api';
import type { BadgeVariant } from '../../types';

interface Row {
  id: string; name: string; email: string; phone: string;
  role: string; roleVariant: BadgeVariant;
  trustScore: number; joined: string; status: string; statusVariant: BadgeVariant;
}

function roleInfo(r: string): { label: string; variant: BadgeVariant } {
  if (r === 'OWNER') return { label:'SACCO Owner', variant:'blue' };
  if (r === 'ADMIN') return { label:'Admin',       variant:'purple' };
  return { label:'Passenger', variant:'green' };
}

function statusInfo(s?: string): { label: string; variant: BadgeVariant } {
  if (s === 'SUSPENDED') return { label:'Suspended', variant:'red' };
  if (s === 'FLAGGED')   return { label:'Flagged',   variant:'amber' };
  return { label:'Active', variant:'green' };
}

const ROLE_FILTERS   = ['All', 'Passenger', 'SACCO Owner', 'Admin'];
const STATUS_FILTERS = ['All', 'Active', 'Flagged', 'Suspended'];

export default function AdminUsers() {
  const [rows, setRows]         = useState<Row[]>([]);
  const [loading, setLoading]   = useState(true);
  const [roleFilter, setRF]     = useState('All');
  const [statusFilter, setSF]   = useState('All');
  const [search, setSearch]     = useState('');

  const loadUsers = () => {
    setLoading(true);
    adminApi.users()
      .then(res => {
        const data: any[] = res.data ?? [];
        setRows(data.map(u => {
          const { label: rLabel, variant: rVariant } = roleInfo(u.role);
          const { label: sLabel, variant: sVariant } = statusInfo(u.status);
          return {
            id:           u.id,
            name:         `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
            email:        u.email,
            phone:        u.phone ?? '—',
            role:         rLabel,
            roleVariant:  rVariant,
            trustScore:   u.trustScore ?? 80,
            joined:       u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('en-KE', { month:'short', year:'numeric' })
              : '—',
            status:       sLabel,
            statusVariant: sVariant,
          };
        }));
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleFlag = async (id: string) => {
    await adminApi.updateUserStatus(id, 'SUSPENDED').catch(() => {});
    loadUsers();
  };

  const handleRestore = async (id: string) => {
    await adminApi.updateUserStatus(id, 'ACTIVE').catch(() => {});
    loadUsers();
  };

  const visible = rows.filter(u => {
    const matchRole   = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <DashboardLayout
      title="User Management"
      subtitle="All registered passengers, SACCO owners, and admins"
      actions={<button className="btn btn-primary btn-sm">+ Invite user</button>}
    >
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input className="input" placeholder="Search by name or email…"
          style={{ maxWidth:260, fontSize:13 }} value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:6 }}>
          {ROLE_FILTERS.map(f => (
            <button key={f} className={`btn btn-sm ${roleFilter===f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRF(f)}>{f}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} className={`btn btn-sm ${statusFilter===f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSF(f)}>{f}</button>
          ))}
        </div>
        <span className="text-muted" style={{ fontSize:12, marginLeft:'auto' }}>{visible.length} users</span>
      </div>

      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize:32, marginBottom:12 }}>👥</div>
          <div>Loading users…</div>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table className="sc-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th>
                <th>AI Trust</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--brand)', color:'#fff',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                        {u.name.split(' ').map((n: string)=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:12, color:'var(--gray-500)' }}>{u.email}</td>
                  <td style={{ fontSize:12 }}>{u.phone}</td>
                  <td><Badge variant={u.roleVariant}>{u.role}</Badge></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:50, height:6, background:'var(--gray-100)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${u.trustScore}%`, background: u.trustScore>=80 ? 'var(--brand)' : u.trustScore>=60 ? 'var(--warning)' : 'var(--danger)', borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700 }}>{u.trustScore}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:12, color:'var(--gray-500)' }}>{u.joined}</td>
                  <td><Badge variant={u.statusVariant}>{u.status}</Badge></td>
                  <td style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-sm">View</button>
                    {u.status === 'Active' && (
                      <button className="btn btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleFlag(u.id)}>Flag</button>
                    )}
                    {u.status === 'Suspended' && (
                      <button className="btn btn-sm" style={{ color:'var(--brand)' }} onClick={() => handleRestore(u.id)}>Restore</button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--gray-400)', padding:32 }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
