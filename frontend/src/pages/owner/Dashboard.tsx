import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { AiBanner, StatTile, ChartBar, Badge, AiAgentPanel } from '../../components/UI';

export default function OwnerDashboard() {
  const nav = useNavigate();
  return (
    <DashboardLayout title="Dashboard" subtitle="Modern Coast Sacco"
      actions={<button className="btn btn-primary btn-sm" onClick={() => nav('/owner/schedules')}>+ Create trip</button>}>
      <AiBanner text="<strong>Friday Nakuru route will be 96% full.</strong> Deploy an extra vehicle by Thursday. AI projects KES 42,500 additional revenue. Dynamic pricing active on 4 routes."
        action={<button className="btn btn-primary btn-sm" onClick={() => nav('/owner/fleet')}>Add vehicle</button>} />
      <div className="stat-grid mb-6">
        <StatTile label="Trips today"     value="8"       sub="2 on route now" />
        <StatTile label="Bookings today"  value="87"      sub="+12% vs yesterday" />
        <StatTile label="Revenue today"   value="KES 74K" sub="Net after commission" />
        <StatTile label="Occupancy"       value="81%"     sub="AI optimised" />
      </div>
      <div className="stat-grid mb-6">
        <StatTile label="Pending payments" value="3"        sub="Needs follow-up" neg />
        <StatTile label="Cancelled"        value="2"        sub="KES 1,700 refunded" />
        <StatTile label="Active vehicles"  value="6"        sub="2 in transit" />
        <StatTile label="Monthly revenue"  value="KES 1.2M" sub="Net this month" />
      </div>

      <AiAgentPanel
        title="AI Operations Agent"
        subtitle="Autonomous dispatch decisions and revenue optimisation"
        cols={3}
        cards={[
          {
            type: 'Dispatch Planner',
            icon: '🚌',
            result: 'Deploy standby vehicle — Nakuru 2 PM',
            detail: 'Friday route at 96% capacity. AI recommends deploying KBZ 789B as standby to avoid turning away 22 passengers.',
            confidence: 91,
            actionLabel: 'Deploy vehicle',
            onAction: () => nav('/owner/fleet'),
            accentColor: 'var(--brand)',
          },
          {
            type: 'Dynamic Pricing',
            icon: '💰',
            result: 'Raise Nakuru fare +8% (KES 920)',
            detail: 'Peak demand detected Thursday–Sunday. AI projects KES 42,500 additional revenue with dynamic pricing on 4 routes.',
            confidence: 85,
            actionLabel: 'Apply pricing',
            onAction: () => nav('/owner/seats'),
            accentColor: '#f59e0b',
          },
          {
            type: 'Delay Risk',
            icon: '⚠️',
            result: 'Medium risk on Mombasa 6 AM',
            detail: 'Traffic congestion on Mombasa road. Estimated 25 min delay. Consider notifying passengers proactively.',
            confidence: 76,
            actionLabel: 'Notify passengers',
            accentColor: '#ef4444',
          },
        ]}
      />

      <h4 className="mb-3">Quick actions</h4>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {[['🚌 Add vehicle', '/owner/fleet'], ['📅 Schedule', '/owner/schedules'], ['🗺️ Routes', '/owner/routes'], ['🎫 Bookings', '/owner/bookings'], ['📈 Analytics', '/owner/analytics']].map(([l, p]) => (
          <button key={l as string} className="btn" style={{ fontSize: 13 }} onClick={() => nav(p as string)}>{l}</button>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Today's trips</div>
          {[['NBI → Nakuru · 8:00 AM', 'On route', 'green'], ['NBI → Mombasa · 6:00 AM', 'On route', 'green'], ['NBI → Kisumu · 9:00 AM', 'Boarding', 'amber'], ['NBI → Nakuru · 2:00 PM', 'Scheduled', 'blue'], ['NBI → Eldoret · 3:00 PM', 'Scheduled', 'blue']].map(([t, s, v]) => (
            <div key={t as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13.5 }}>
              <span>{t}</span>
              <Badge variant={v as any}>{s}</Badge>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Route occupancy</div>
          <div className="chart-wrap mt-2">
            {[['NBI→Nakuru', 92, '46/50'], ['NBI→Mombasa', 76, '38/50'], ['NBI→Kisumu', 58, '29/50'], ['NBI→Eldoret', 38, '19/50']].map(([l, p, v]) => (
              <ChartBar key={l as string} label={l as string} pct={p as number} display={`${p}%`} val={v as string} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
