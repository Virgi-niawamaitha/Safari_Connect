import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { AiBanner, StatTile, ChartBar, Badge, AiAgentPanel } from '../../components/UI';

export default function AdminDashboard() {
  const nav = useNavigate();
  return (
    <DashboardLayout title="Platform overview" subtitle="Super Admin">
      <AiBanner text="<strong>Platform healthy.</strong> 3 fraud cases auto-held. Dynamic pricing on 14 routes. Revenue up 18% WoW. 2 SACCO approvals pending your review."
        action={<button className="btn btn-primary btn-sm" onClick={() => nav('/admin/saccos')}>Review SACCOs</button>} />
      <div className="stat-grid mb-6">
        <StatTile label="Total users"    value="8,910"   sub="+204 this week" />
        <StatTile label="Active SACCOs"  value="34"      sub="2 pending approval" />
        <StatTile label="Bookings today" value="1,240"   sub="+18% WoW" />
        <StatTile label="Gross rev MTD"  value="KES 4.2M" />
      </div>
      <div className="stat-grid mb-6">
        <StatTile label="Failed payments" value="23"      sub="Today"             neg />
        <StatTile label="Active trips"    value="67"      sub="Across all SACCOs" />
        <StatTile label="Commission"      value="KES 210K" sub="This month" />
        <StatTile label="Open disputes"   value="3"       sub="Needs action"      neg />
      </div>

      <AiAgentPanel
        title="AI Platform Guardian"
        subtitle="Autonomous fraud detection, anomaly scoring, and unified decision assist"
        cols={3}
        cards={[
          {
            type: 'Fraud / Anomaly Scoring',
            icon: '🛡️',
            result: '3 bookings auto-blocked',
            detail: 'Unusual velocity pattern from 2 accounts. Payment anomalies flagged. Action: block + review. Score > 87/100.',
            confidence: 93,
            actionLabel: 'Review cases',
            onAction: () => nav('/admin/bookings'),
            accentColor: '#ef4444',
          },
          {
            type: 'Unified Decision Assist',
            icon: '🤖',
            result: 'Platform stable — 2 actions required',
            detail: 'Top action: Approve 2 pending SACCOs. Revenue trending +18% WoW. Passenger message: "All routes on time today."',
            confidence: 96,
            actionLabel: 'View summary',
            onAction: () => nav('/admin/analytics'),
            accentColor: 'var(--brand)',
          },
          {
            type: 'Dynamic Pricing Insight',
            icon: '📊',
            result: 'Active on 14 routes platform-wide',
            detail: 'AI pricing generated KES 180K additional MTD revenue. Highest demand: NBI→Mombasa Friday PM slots.',
            confidence: 88,
            actionLabel: 'View analytics',
            onAction: () => nav('/admin/analytics'),
            accentColor: '#7c3aed',
          },
        ]}
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Top routes (platform-wide)</div>
          {[['NBI→Mombasa', 100, '348'], ['NBI→Nakuru', 84, '292'], ['NBI→Kisumu', 61, '211'], ['NBI→Eldoret', 54, '187']].map(([l, p, v]) => (
            <ChartBar key={l as string} label={l as string} pct={p as number} display={v as string} val={v as string} />
          ))}
        </div>
        <div className="card">
          <div className="card-title">Pending actions</div>
          {[['SACCO approvals', 'amber', '2 pending', '/admin/saccos'], ['Fraud cases', 'red', '3 held', '/admin/bookings'], ['Open disputes', 'amber', '3 open', '/admin/support'], ['Withdrawals', 'blue', '5 pending', '/admin/payments']].map(([l, v, c, p]) => (
            <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13.5 }}>
              <span>{l}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge variant={v as any}>{c}</Badge>
                <button className="btn btn-sm" onClick={() => nav(p as string)}>Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
