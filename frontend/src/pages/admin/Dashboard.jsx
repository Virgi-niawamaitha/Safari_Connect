import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiBanner, AiDecisionGrid, Metric, ChartBar } from '../../components/UI';
import { requestSafe } from '../../lib/api';
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState('<strong>Platform autonomous guardrails active.</strong> AI is continuously balancing fraud prevention, trip reliability, and pricing fairness.');
  const [decisions, setDecisions] = useState([
    {
      id: 'fraud',
      label: 'Fraud Watch',
      status: 'Auto-Hold',
      value: '3 risky transactions blocked',
      detail: 'Rapid retries and card mismatch patterns',
      tone: 'red',
      confidence: '88%',
      updatedAt: 'now',
      evidence: ['Retry burst', 'Geo mismatch', 'Card mismatch']
    },
    {
      id: 'ops',
      label: 'Operations',
      status: 'Rebalance',
      value: '2 routes need standby buses',
      detail: 'Forecasted occupancy above 92%',
      tone: 'amber',
      confidence: '82%',
      updatedAt: 'now',
      evidence: ['Seat pressure', 'Peak-hour demand', 'Route ETA variance']
    },
    {
      id: 'pricing',
      label: 'Pricing AI',
      status: 'Live',
      value: '14 routes dynamically priced',
      detail: 'Demand surge managed without cancelation spike',
      tone: 'green',
      confidence: '79%',
      updatedAt: 'now',
      evidence: ['Fare trend', 'Booking velocity', 'Cancellation delta']
    }
  ]);
  const routes = [{l:'NBI→Mombasa',pct:100,v:'348'},{l:'NBI→Nakuru',pct:84,v:'292'},{l:'NBI→Kisumu',pct:61,v:'211'},{l:'NBI→Eldoret',pct:54,v:'187'}];

  useEffect(() => {
    let mounted = true;

    const loadPlatformAi = async () => {
      const routePairs = [
        ['Nairobi', 'Mombasa'],
        ['Nairobi', 'Nakuru'],
        ['Nairobi', 'Kisumu'],
        ['Nairobi', 'Eldoret']
      ];

      const snapshots = await Promise.all(
        routePairs.map(([origin, destination]) => requestSafe(`/trips/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`))
      );

      const allTrips = snapshots
        .flatMap((item) => item?.data || [])
        .filter(Boolean);

      const avgPrice = allTrips.length
        ? allTrips.reduce((sum, trip) => sum + Number(trip.basePrice || 0), 0) / allTrips.length
        : 1200;
      const totalSeats = allTrips.reduce((sum, trip) => sum + Number(trip.bus?.seatCapacity || 0), 0);
      const availableSeats = allTrips.reduce((sum, trip) => sum + Number(trip.availableSeatsCount || 0), 0);
      const bookedSeats = Math.max(totalSeats - availableSeats, 0);
      const lowSeatTrips = allTrips.filter((trip) => Number(trip.availableSeatsCount || 0) < 6).length;

      const response = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: 'Platform-Wide',
          departureTime: new Date().toISOString(),
          currentPrice: Math.round(avgPrice || 1200),
          totalSeats: totalSeats || 1800,
          bookedSeats: bookedSeats || 1520,
          noShowRate: 0.09,
          trips: allTrips.slice(0, 12).map((trip) => ({
            id: trip.id,
            price: Number(trip.basePrice || 0),
            travelMinutes: Number(trip.route?.estimatedTime || 240),
            reliabilityScore: Number(trip.availableSeatsCount || 0) < 5 ? 0.72 : 0.88
          })),
          intent: { maxBudget: 1400, maxTravelMinutes: 320 },
          riskFactors: { weatherRisk: 0.24, trafficRisk: 0.61, routeRisk: 0.37 },
          fraudSignals: {
            attemptsLast24h: Math.max(lowSeatTrips, 2),
            cardMismatch: lowSeatTrips > 1,
            rapidRetries: Math.min(lowSeatTrips, 5),
            geoMismatch: lowSeatTrips > 2
          },
          prompt: 'Give one short autonomous platform summary for admin operators.',
          language: 'en'
        })
      });

      if (!mounted || !response?.data?.modules) return;

      const modules = response.data.modules;
      const summaryText = response?.data?.summary?.passengerMessage;
      if (summaryText) {
        setAiText(`<strong>Autonomous admin brief:</strong> ${summaryText}`);
      }

      setDecisions([
        {
          id: 'fraud',
          label: 'Fraud Watch',
          status: modules.fraud?.decision === 'block' ? 'Block' : modules.fraud?.decision === 'review' ? 'Review' : 'Allow',
          value: `Risk score ${modules.fraud?.fraudScore ?? '-'}`,
          detail: modules.fraud?.reason || 'Live fraud policy running',
          tone: modules.fraud?.decision === 'block' ? 'red' : modules.fraud?.decision === 'review' ? 'amber' : 'green',
          confidence: `${Math.round((modules.fraud?.confidence || 0.8) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.fraud?.signalsUsed?.slice(0, 3) || ['Retry burst', 'Mismatch signal', 'Geo anomaly']
        },
        {
          id: 'ops',
          label: 'Operations',
          status: modules.operations?.action === 'add_vehicle' ? 'Scale Up' : 'Stable',
          value: modules.operations?.dispatchAdvice || 'Fleet scheduling is stable',
          detail: `Demand ${modules.operations?.demandLevel || '-'} · Risk ${modules.operations?.riskLevel || '-'}`,
          tone: modules.operations?.action === 'add_vehicle' ? 'amber' : 'blue',
          confidence: `${Math.round((modules.operations?.confidence || 0.78) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.operations?.signalsUsed?.slice(0, 3) || ['Occupancy pressure', 'Traffic forecast', 'No-show trend']
        },
        {
          id: 'pricing',
          label: 'Pricing AI',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'No alternative window detected',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green',
          confidence: `${Math.round((modules.pricing?.confidence || 0.74) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.pricing?.signalsUsed?.slice(0, 3) || ['Demand level', 'Departure window', 'Route pressure']
        }
      ]);
    };

    loadPlatformAi();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Platform overview</div><div className="page-sub">Super Admin</div></div></div>
      <div className="page-body">
        <AiBanner text={aiText} action={<button className="btn btn-primary btn-sm" onClick={()=>navigate('/admin/saccos')}>Review SACCOs</button>}/>
        <AiDecisionGrid title="Autonomous Platform Decisions" decisions={decisions} />
        <div className="metric-grid">
          <Metric label="Total users" value="8,910" sub="+204 this week"/>
          <Metric label="Active SACCOs" value="34" sub="2 pending"/>
          <Metric label="Bookings today" value="1,240" sub="+18% WoW"/>
          <Metric label="Gross revenue (MTD)" value="4.2M" sub="KES"/>
        </div>
        <div className="metric-grid">
          <Metric label="Failed payments" value="23" sub="STK failures" neg/>
          <Metric label="Active trips now" value="67" sub="All SACCOs"/>
          <Metric label="Commission earned" value="210K" sub="KES this month"/>
          <Metric label="Open disputes" value="3" sub="Needs action" neg/>
        </div>
        <div className="two-col">
          <div className="card"><div className="card-title">Top routes (platform-wide)</div><div className="chart-wrap">{routes.map(r=><ChartBar key={r.l} label={r.l} pct={r.pct} display={r.v} val={r.v}/>)}</div></div>
          <div className="card">
            <div className="card-title">Pending actions</div>
            {[['SACCO approvals','amber','2 pending','/admin/saccos'],['Fraud cases held','red','3 cases','/admin/bookings'],['Open disputes','amber','3 open','/admin/support'],['Withdrawal requests','blue','5 pending','/admin/payments']].map(([l,v,c,p])=>(
              <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--gray-100)',fontSize:13}}>
                <span>{l}</span>
                <div style={{display:'flex',gap:8,alignItems:'center'}}><span className={`badge badge-${v}`}>{c}</span><button className="btn btn-sm" onClick={()=>navigate(p)}>Review</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}