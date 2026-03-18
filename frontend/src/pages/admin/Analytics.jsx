import { useEffect, useState } from 'react';
import { AiBanner, AiDecisionGrid, AiPlanningBoard, Metric, ChartBar, PieChart, showToast } from '../../components/UI';
import { requestSafe } from '../../lib/api';
export default function AdminAnalytics() {
  const [aiText, setAiText] = useState('<strong>Autonomous analytics mode:</strong> AI is monitoring platform demand, fraud anomalies, and route pressure in real time.');
  const [decisions, setDecisions] = useState([
    { id: 'fraud', label: 'Fraud Enforcement', status: 'Review', value: '2 suspicious clusters flagged', detail: 'Retry burst and location mismatch', tone: 'amber', confidence: '81%', updatedAt: 'now', evidence: ['Geo mismatch', 'Retry burst', 'Card mismatch'] },
    { id: 'price', label: 'Market Pricing', status: 'Active', value: 'Demand surge on 3 routes', detail: 'Adaptive fare window running', tone: 'green', confidence: '77%', updatedAt: 'now', evidence: ['Booking velocity', 'Route load', 'Price elasticity'] },
    { id: 'ops', label: 'Capacity Plan', status: 'Scale', value: 'Add standby on evening peak', detail: 'Occupancy crossing 90%', tone: 'amber', confidence: '83%', updatedAt: 'now', evidence: ['Seat pressure', 'ETA variance', 'No-show trend'] }
  ]);
  const [plans, setPlans] = useState([
    { id: 'peak_evening', scenario: 'Evening peak defense', impact: '+KES 62K protected revenue', risk: 'Medium risk', eta: 'Next 2h', action: 'Shift one standby bus to Nakuru and apply adaptive fare cap.', tone: 'amber' },
    { id: 'fraud_spike', scenario: 'Fraud spike containment', impact: '-41% suspicious checkout attempts', risk: 'High risk', eta: 'Immediate', action: 'Switch high-risk checkouts to mandatory review for 30 minutes.', tone: 'red' },
    { id: 'retention', scenario: 'Retention boost', impact: '+6% conversion on low-demand routes', risk: 'Low risk', eta: 'Today', action: 'Launch targeted discount window where occupancy is below threshold.', tone: 'green' }
  ]);

  useEffect(() => {
    let mounted = true;

    const loadAdminPlanning = async () => {
      const routePairs = [
        ['Nairobi', 'Mombasa'],
        ['Nairobi', 'Nakuru'],
        ['Nairobi', 'Kisumu']
      ];
      const snapshots = await Promise.all(routePairs.map(([origin, destination]) => requestSafe(`/trips/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)));
      const allTrips = snapshots.flatMap((item) => item?.data || []);

      const assist = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: 'Admin-Analytics',
          departureTime: new Date().toISOString(),
          currentPrice: allTrips.length ? Math.round(allTrips.reduce((sum, t) => sum + Number(t.basePrice || 0), 0) / allTrips.length) : 1200,
          totalSeats: allTrips.reduce((sum, t) => sum + Number(t.bus?.seatCapacity || 0), 0) || 1200,
          bookedSeats: allTrips.reduce((sum, t) => sum + (Number(t.bus?.seatCapacity || 0) - Number(t.availableSeatsCount || 0)), 0) || 940,
          noShowRate: 0.09,
          trips: allTrips.slice(0, 10).map((trip) => ({
            id: trip.id,
            price: Number(trip.basePrice || 0),
            travelMinutes: Number(trip.route?.estimatedTime || 240),
            reliabilityScore: Number(trip.availableSeatsCount || 0) < 5 ? 0.74 : 0.86
          })),
          intent: { maxBudget: 1400, maxTravelMinutes: 320 },
          riskFactors: { weatherRisk: 0.2, trafficRisk: 0.6, routeRisk: 0.35 },
          fraudSignals: { attemptsLast24h: 6, cardMismatch: true, rapidRetries: 3, geoMismatch: true },
          prompt: 'Generate concise admin planning intelligence for autonomous operations.',
          language: 'en'
        })
      });

      if (!mounted || !assist?.data?.modules) return;
      const modules = assist.data.modules;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (assist?.data?.summary?.passengerMessage) {
        setAiText(`<strong>Admin AI brief:</strong> ${assist.data.summary.passengerMessage}`);
      }

      setDecisions([
        {
          id: 'fraud',
          label: 'Fraud Enforcement',
          status: modules.fraud?.decision === 'block' ? 'Block' : modules.fraud?.decision === 'review' ? 'Review' : 'Allow',
          value: `Risk ${modules.fraud?.fraudScore ?? '-'}`,
          detail: modules.fraud?.reason || 'Fraud engine operating',
          tone: modules.fraud?.decision === 'block' ? 'red' : modules.fraud?.decision === 'review' ? 'amber' : 'green',
          confidence: `${Math.round((modules.fraud?.confidence || 0.8) * 100)}%`,
          updatedAt: now,
          evidence: modules.fraud?.signalsUsed?.slice(0, 3) || ['Geo mismatch', 'Retry burst', 'Card mismatch']
        },
        {
          id: 'price',
          label: 'Market Pricing',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'Pricing stable',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green',
          confidence: `${Math.round((modules.pricing?.confidence || 0.76) * 100)}%`,
          updatedAt: now,
          evidence: modules.pricing?.signalsUsed?.slice(0, 3) || ['Demand index', 'Travel window', 'Fare baseline']
        },
        {
          id: 'ops',
          label: 'Capacity Plan',
          status: modules.operations?.action === 'add_vehicle' ? 'Scale' : 'Stable',
          value: modules.operations?.dispatchAdvice || 'No additional action',
          detail: `Demand ${modules.operations?.demandLevel || '-'} · Risk ${modules.operations?.riskLevel || '-'}`,
          tone: modules.operations?.action === 'add_vehicle' ? 'amber' : 'blue',
          confidence: `${Math.round((modules.operations?.confidence || 0.8) * 100)}%`,
          updatedAt: now,
          evidence: modules.operations?.signalsUsed?.slice(0, 3) || ['Occupancy', 'No-show', 'Traffic']
        }
      ]);

      setPlans([
        {
          id: 'peak_evening',
          scenario: 'Peak defense',
          impact: modules.operations?.action === 'add_vehicle' ? 'Prevent stockout on evening routes' : 'Capacity stable for current demand',
          risk: modules.operations?.riskLevel === 'high' ? 'High risk' : modules.operations?.riskLevel === 'medium' ? 'Medium risk' : 'Low risk',
          eta: 'Next 2h',
          action: modules.operations?.dispatchAdvice || 'Keep active route plan unchanged.',
          tone: modules.operations?.riskLevel === 'high' ? 'red' : 'amber'
        },
        {
          id: 'fraud_spike',
          scenario: 'Fraud containment',
          impact: modules.fraud?.decision === 'block' ? 'Immediate threat blocked' : 'Monitor and review in real-time',
          risk: modules.fraud?.decision === 'block' ? 'High risk' : 'Medium risk',
          eta: 'Immediate',
          action: modules.fraud?.reason || 'No anomaly requiring intervention.',
          tone: modules.fraud?.decision === 'block' ? 'red' : 'amber'
        },
        {
          id: 'price_window',
          scenario: 'Price window control',
          impact: `Target fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          risk: modules.pricing?.demandLevel === 'high' ? 'Medium risk' : 'Low risk',
          eta: 'Today',
          action: modules.pricing?.cheaperWindowSuggestion || 'Maintain current fare strategy.',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green'
        }
      ]);
    };

    loadAdminPlanning();
    return () => { mounted = false; };
  }, []);

  const daily = [{l:'Mon',pct:55,v:'880'},{l:'Tue',pct:62,v:'990'},{l:'Wed',pct:78,v:'1,240'},{l:'Thu',pct:70,v:'1,120'},{l:'Fri',pct:100,v:'1,600'},{l:'Sat',pct:90,v:'1,440'},{l:'Sun',pct:72,v:'1,150'}];
  const saccos = [{l:'Easy Coach',pct:100,v:'2.1M'},{l:'Modern Coast',pct:57,v:'1.2M'},{l:'NBI Matatus',pct:42,v:'880K'},{l:'Eldoret Exp.',pct:28,v:'590K'}];
  const pie = [{color:'#0ea371',pct:68,offset:25,label:'Buses — 68%'},{color:'#3b82f6',pct:18,offset:-43,label:'Matatu — 18%'},{color:'#f59e0b',pct:9,offset:-61,label:'Motorbike — 9%'},{color:'#8b5cf6',pct:5,offset:-70,label:'Carrier — 5%'}];
  const runPlan = (plan) => showToast(`Plan triggered: ${plan.scenario}`);
  return (
    <div>
      <div className="page-header"><div className="page-title">Reports & Analytics</div><div className="page-actions"><button className="btn btn-sm" onClick={()=>showToast('Report downloaded!')}>Download</button></div></div>
      <div className="page-body">
        <AiBanner text={aiText} />
        <AiDecisionGrid title="Autonomous Admin Decisions" decisions={decisions} />
        <AiPlanningBoard title="Admin Smart Planning" plans={plans} onRunPlan={runPlan} />
        <div className="metric-grid">
          <Metric label="Most active category" value="Buses 🚌" sub="68% of bookings"/>
          <Metric label="Top SACCO" value="Easy Coach" sub="KES 2.1M MTD"/>
          <Metric label="Fraud blocked" value="14" sub="AI blocked all"/>
          <Metric label="Platform occupancy" value="79%" sub="Avg per trip"/>
        </div>
        <div className="two-col" style={{marginBottom:16}}>
          <div className="card"><div className="card-title">Booking trends (daily)</div><div className="chart-wrap">{daily.map(d=><ChartBar key={d.l} label={d.l} pct={d.pct} display={d.v} val={d.v}/>)}</div></div>
          <div className="card"><div className="card-title">Revenue by SACCO</div><div className="chart-wrap">{saccos.map(s=><ChartBar key={s.l} label={s.l} pct={s.pct} display={s.v} val={s.v}/>)}</div></div>
        </div>
        <div className="two-col">
          <div className="card"><div className="card-title">Category demand split</div><PieChart segments={pie}/></div>
          <div className="card"><div className="card-title">AI autonomous decisions today</div><div style={{fontSize:12,color:'var(--gray-500)'}}>Detailed autonomous actions moved to the planning board above for run/rollback tracking.</div></div>
        </div>
      </div>
    </div>
  );
}