import { useEffect, useState } from 'react';
import { AiBanner, AiDecisionGrid, AiPlanningBoard, Metric, ChartBar, PieChart, showToast } from '../../components/UI';
import { requestSafe } from '../../lib/api';
export default function OwnerAnalytics() {
  const [aiText, setAiText] = useState('<strong>Owner autopilot analytics:</strong> AI is balancing occupancy, route delay risk, and pricing windows.');
  const [decisions, setDecisions] = useState([
    { id: 'route', label: 'Route Priority', status: 'Expand', value: 'NBI→Nakuru high pressure', detail: 'Standby recommendation active', tone: 'amber', confidence: '82%', updatedAt: 'now', evidence: ['Occupancy', 'Demand trend', 'No-show rate'] },
    { id: 'price', label: 'Fare Strategy', status: 'Optimize', value: 'Predictive fare window suggested', detail: 'Preserve conversion while lifting margin', tone: 'green', confidence: '75%', updatedAt: 'now', evidence: ['Fare trend', 'Demand', 'Window timing'] },
    { id: 'delay', label: 'Delay Control', status: 'Monitor', value: 'Traffic risk medium', detail: 'Adjust departure buffers', tone: 'blue', confidence: '71%', updatedAt: 'now', evidence: ['Traffic', 'Route risk', 'Weather'] }
  ]);
  const [plans, setPlans] = useState([
    { id: 'fleet_shift', scenario: 'Fleet shift', impact: '+7% on-time arrivals', risk: 'Medium risk', eta: 'Next departure', action: 'Reassign standby bus to highest pressure route.', tone: 'amber' },
    { id: 'fare_window', scenario: 'Fare window', impact: '+KES 28K projected margin', risk: 'Low risk', eta: 'Today', action: 'Enable dynamic fare cap during top demand hour.', tone: 'green' },
    { id: 'delay_guard', scenario: 'Delay guardrail', impact: '-14% predicted delays', risk: 'Medium risk', eta: 'Immediate', action: 'Increase buffer on routes with high traffic risk.', tone: 'blue' }
  ]);

  useEffect(() => {
    let mounted = true;

    const loadOwnerPlanning = async () => {
      const tripsResponse = await requestSafe('/trips/me');
      const liveTrips = tripsResponse?.data || [];
      const totalSeats = liveTrips.reduce((sum, trip) => sum + Number(trip.bus?.seatCapacity || 0), 0);
      const bookedSeats = liveTrips.reduce((sum, trip) => sum + Number(trip.bookedSeats || 0), 0);
      const avgFare = liveTrips.length
        ? liveTrips.reduce((sum, trip) => sum + Number(trip.basePrice || 0), 0) / liveTrips.length
        : 1000;

      const assist = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: 'Owner-Analytics',
          departureTime: new Date().toISOString(),
          currentPrice: Math.round(avgFare || 1000),
          totalSeats: totalSeats || 400,
          bookedSeats: bookedSeats || 300,
          noShowRate: 0.08,
          trips: liveTrips.slice(0, 12).map((trip) => ({
            id: trip.id,
            price: Number(trip.basePrice || 0),
            travelMinutes: Number(trip.route?.estimatedTime || 240),
            reliabilityScore: Number(trip.availableSeats || 0) < 5 ? 0.74 : 0.87
          })),
          intent: { maxBudget: 1200, maxTravelMinutes: 260 },
          riskFactors: { weatherRisk: 0.2, trafficRisk: 0.55, routeRisk: 0.28 },
          fraudSignals: { attemptsLast24h: 1, cardMismatch: false, rapidRetries: 0, geoMismatch: false },
          prompt: 'Provide owner smart planning summary for route profitability and reliability.',
          language: 'en'
        })
      });

      if (!mounted || !assist?.data?.modules) return;
      const modules = assist.data.modules;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (assist?.data?.summary?.passengerMessage) {
        setAiText(`<strong>Owner AI brief:</strong> ${assist.data.summary.passengerMessage}`);
      }

      setDecisions([
        {
          id: 'route',
          label: 'Route Priority',
          status: modules.operations?.action === 'add_vehicle' ? 'Expand' : 'Stable',
          value: modules.operations?.dispatchAdvice || 'Route capacity stable',
          detail: `Demand ${modules.operations?.demandLevel || '-'} · Occupancy ${Math.round((modules.operations?.occupancyRate || 0) * 100)}%`,
          tone: modules.operations?.action === 'add_vehicle' ? 'amber' : 'green',
          confidence: `${Math.round((modules.operations?.confidence || 0.8) * 100)}%`,
          updatedAt: now,
          evidence: modules.operations?.signalsUsed?.slice(0, 3) || ['Occupancy', 'No-show', 'Traffic']
        },
        {
          id: 'price',
          label: 'Fare Strategy',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'No fare shift suggested',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green',
          confidence: `${Math.round((modules.pricing?.confidence || 0.76) * 100)}%`,
          updatedAt: now,
          evidence: modules.pricing?.signalsUsed?.slice(0, 3) || ['Demand', 'Departure window', 'Fare trend']
        },
        {
          id: 'delay',
          label: 'Delay Control',
          status: modules.delayRisk?.riskLevel || 'Low',
          value: modules.delayRisk?.recommendation || 'Delay risk stable',
          detail: `Risk score ${modules.delayRisk?.riskScore ?? '-'}`,
          tone: modules.delayRisk?.riskLevel === 'high' ? 'red' : modules.delayRisk?.riskLevel === 'medium' ? 'amber' : 'blue',
          confidence: `${Math.round((modules.delayRisk?.confidence || 0.72) * 100)}%`,
          updatedAt: now,
          evidence: modules.delayRisk?.signalsUsed?.slice(0, 3) || ['Traffic', 'Weather', 'Route risk']
        }
      ]);

      setPlans([
        {
          id: 'fleet_shift',
          scenario: 'Fleet shift',
          impact: modules.operations?.action === 'add_vehicle' ? 'Protect peak revenue by adding capacity' : 'Capacity currently optimized',
          risk: modules.operations?.riskLevel === 'high' ? 'High risk' : modules.operations?.riskLevel === 'medium' ? 'Medium risk' : 'Low risk',
          eta: 'Next departure',
          action: modules.operations?.dispatchAdvice || 'No fleet reassignment needed now.',
          tone: modules.operations?.riskLevel === 'high' ? 'red' : 'amber'
        },
        {
          id: 'fare_window',
          scenario: 'Fare window',
          impact: `Predicted fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          risk: modules.pricing?.demandLevel === 'high' ? 'Medium risk' : 'Low risk',
          eta: 'Today',
          action: modules.pricing?.cheaperWindowSuggestion || 'Maintain current pricing policy.',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green'
        },
        {
          id: 'delay_guard',
          scenario: 'Delay guardrail',
          impact: modules.delayRisk?.riskLevel === 'high' ? 'Reduce likely delays with buffer adjustments' : 'On-time performance stable',
          risk: modules.delayRisk?.riskLevel === 'high' ? 'High risk' : modules.delayRisk?.riskLevel === 'medium' ? 'Medium risk' : 'Low risk',
          eta: 'Immediate',
          action: modules.delayRisk?.recommendation || 'No routing adjustment required.',
          tone: modules.delayRisk?.riskLevel === 'high' ? 'red' : 'blue'
        }
      ]);
    };

    loadOwnerPlanning();
    return () => { mounted = false; };
  }, []);

  const daily = [{l:'Mon',pct:52,d:'KES 38K'},{l:'Tue',pct:60,d:'KES 44K'},{l:'Wed',pct:68,d:'KES 50K'},{l:'Thu',pct:79,d:'KES 58K'},{l:'Fri',pct:100,d:'KES 74K'},{l:'Sat',pct:88,d:'KES 65K'},{l:'Sun',pct:73,d:'KES 54K'}];
  const routes = [{l:'NBI→Nakuru',pct:100,v:'680'},{l:'NBI→Mombasa',pct:72,v:'490'},{l:'NBI→Kisumu',pct:55,v:'374'},{l:'NBI→Eldoret',pct:44,v:'296'}];
  const pie = [{color:'#0ea371',pct:55,offset:25,label:'Economy — 55%'},{color:'#3b82f6',pct:25,offset:-30,label:'Business — 25%'},{color:'#8b5cf6',pct:20,offset:-55,label:'VIP — 20%'}];
  const runPlan = (plan) => showToast(`Plan triggered: ${plan.scenario}`);

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Analytics</div><div className="page-sub">Modern Coast Sacco</div></div></div>
      <div className="page-body">
        <AiBanner text={aiText} />
        <AiDecisionGrid title="Owner Autonomous Decisions" decisions={decisions} />
        <AiPlanningBoard title="Owner Smart Planning" plans={plans} onRunPlan={runPlan} />
        <div className="metric-grid">
          <Metric label="Total revenue" value="1.2M" sub="KES this month"/>
          <Metric label="Total bookings" value="1,840" sub="+18% vs last month"/>
          <Metric label="Avg occupancy" value="79%" sub="Per trip"/>
          <Metric label="Cancellation rate" value="2.1%" sub="Industry avg: 4.3%"/>
        </div>
        <div className="metric-grid">
          <Metric label="Most booked route" value="NBI→Nakuru" sub="680 bookings"/>
          <Metric label="Most booked bus" value="KBZ 123A" sub="920 trips"/>
          <Metric label="Peak travel time" value="7–9 AM" sub="68% of bookings"/>
          <Metric label="AI revenue uplift" value="+84K" sub="KES from dynamic pricing"/>
        </div>
        <div className="two-col" style={{marginBottom:16}}>
          <div className="card"><div className="card-title">Revenue over time (daily)</div><div className="chart-wrap">{daily.map(d=><ChartBar key={d.l} label={d.l} pct={d.pct} display={d.d}/>)}</div></div>
          <div className="card"><div className="card-title">Route popularity</div><div className="chart-wrap">{routes.map(r=><ChartBar key={r.l} label={r.l} pct={r.pct} display={r.v} val={r.v}/>)}</div></div>
        </div>
        <div className="two-col">
          <div className="card"><div className="card-title">Seat class demand</div><PieChart segments={pie}/></div>
          <div className="card">
            <div className="card-title">Payment status</div>
            <div className="chart-wrap">
              <ChartBar label="Successful" pct={93} display="93%"/>
              <div className="chart-row"><div className="chart-label">Pending</div><div className="chart-track"><div className="chart-fill" style={{width:'4%',background:'var(--amber)'}}>4%</div></div></div>
              <div className="chart-row"><div className="chart-label">Failed</div><div className="chart-track"><div className="chart-fill" style={{width:'3%',background:'var(--red)'}}>3%</div></div></div>
            </div>
            <div className="sep"/>
            <div style={{fontSize:12,color:'var(--gray-500)'}}>🤖 AI: Peak booking hour is <strong>7–9 AM</strong>. Business class most demanded on <strong>Fridays</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}