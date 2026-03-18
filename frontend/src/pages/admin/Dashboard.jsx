import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiBanner, AiDecisionGrid, Metric, ChartBar } from '../../components/UI';
import { requestSafe } from '../../lib/api';
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState('<strong>Platform autonomous guardrails active.</strong> AI is continuously balancing fraud prevention, trip reliability, and pricing fairness.');
  const [decisions, setDecisions] = useState([
    { id: 'fraud', label: 'Fraud Watch', status: 'Auto-Hold', value: '3 risky transactions blocked', detail: 'Rapid retries and card mismatch patterns', tone: 'red' },
    { id: 'ops', label: 'Operations', status: 'Rebalance', value: '2 routes need standby buses', detail: 'Forecasted occupancy above 92%', tone: 'amber' },
    { id: 'pricing', label: 'Pricing AI', status: 'Live', value: '14 routes dynamically priced', detail: 'Demand surge managed without cancelation spike', tone: 'green' }
  ]);
  const routes = [{l:'NBI→Mombasa',pct:100,v:'348'},{l:'NBI→Nakuru',pct:84,v:'292'},{l:'NBI→Kisumu',pct:61,v:'211'},{l:'NBI→Eldoret',pct:54,v:'187'}];

  useEffect(() => {
    let mounted = true;

    const loadPlatformAi = async () => {
      const response = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: 'Platform-Wide',
          departureTime: new Date().toISOString(),
          currentPrice: 1200,
          totalSeats: 1800,
          bookedSeats: 1520,
          noShowRate: 0.09,
          trips: [
            { id: 'PLAT-1', price: 1100, travelMinutes: 220, reliabilityScore: 0.88 },
            { id: 'PLAT-2', price: 980, travelMinutes: 260, reliabilityScore: 0.76 }
          ],
          intent: { maxBudget: 1400, maxTravelMinutes: 320 },
          riskFactors: { weatherRisk: 0.24, trafficRisk: 0.61, routeRisk: 0.37 },
          fraudSignals: { attemptsLast24h: 7, cardMismatch: true, rapidRetries: 4, geoMismatch: true },
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
          tone: modules.fraud?.decision === 'block' ? 'red' : modules.fraud?.decision === 'review' ? 'amber' : 'green'
        },
        {
          id: 'ops',
          label: 'Operations',
          status: modules.operations?.action === 'add_vehicle' ? 'Scale Up' : 'Stable',
          value: modules.operations?.dispatchAdvice || 'Fleet scheduling is stable',
          detail: `Demand ${modules.operations?.demandLevel || '-'} · Risk ${modules.operations?.riskLevel || '-'}`,
          tone: modules.operations?.action === 'add_vehicle' ? 'amber' : 'blue'
        },
        {
          id: 'pricing',
          label: 'Pricing AI',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'No alternative window detected',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green'
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