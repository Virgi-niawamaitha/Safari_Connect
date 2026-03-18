import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiBanner, AiDecisionGrid, Metric, ChartBar } from '../../components/UI';
import { requestSafe } from '../../lib/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [aiText, setAiText] = useState('<strong>Friday Nakuru route will be 96% full.</strong> Deploy extra vehicle by Thursday. Projected extra revenue: KES 42,500. Dynamic pricing raised fares 24% — zero cancellations.');
  const [aiAction, setAiAction] = useState(() => () => navigate('/owner/fleet'));
  const [decisions, setDecisions] = useState([
    { id: 'dispatch', label: 'Dispatch', status: 'Standby', value: 'Add one standby bus on Nakuru line', detail: 'Projected occupancy above 92%', tone: 'amber' },
    { id: 'pricing', label: 'Pricing', status: 'Surge', value: 'Increase fare by 6-8% for evening slot', detail: 'High demand with low cancellation risk', tone: 'green' },
    { id: 'risk', label: 'Delay Risk', status: 'Monitor', value: 'Traffic risk medium after 6 PM', detail: 'Shift departure window by 10 minutes', tone: 'blue' }
  ]);

  useEffect(() => {
    let mounted = true;

    const loadOpsBrief = async () => {
      const response = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: 'Nairobi-Nakuru',
          departureTime: new Date().toISOString(),
          currentPrice: 1050,
          totalSeats: 50,
          bookedSeats: 44,
          noShowRate: 0.08,
          trips: [
            { id: 'TRIP-1', price: 1050, travelMinutes: 210, reliabilityScore: 0.86 },
            { id: 'TRIP-2', price: 900, travelMinutes: 230, reliabilityScore: 0.79 }
          ],
          intent: { maxBudget: 1200, maxTravelMinutes: 240 },
          riskFactors: { weatherRisk: 0.2, trafficRisk: 0.58, routeRisk: 0.26 },
          fraudSignals: { attemptsLast24h: 0, cardMismatch: false, rapidRetries: 0, geoMismatch: false },
          prompt: 'Provide one short sacco operations recommendation for today peak routes.',
          language: 'en'
        })
      });

      const topAction = response?.data?.summary?.topAction;
      const message = response?.data?.summary?.passengerMessage;
      const operations = response?.data?.modules?.operations;
      if (!mounted) return;

      if (message || operations?.dispatchAdvice) {
        const headline = operations?.action === 'add_vehicle'
          ? '<strong>AI operations alert:</strong> Peak seat pressure detected.'
          : '<strong>AI operations insight:</strong> Live planning recommendation ready.';
        const detail = operations?.dispatchAdvice || message;
        setAiText(`${headline} ${detail}`);
      }

      if (topAction === 'add_standby_vehicle') {
        setAiAction(() => () => navigate('/owner/fleet'));
      } else if (topAction === 'suggest_alternate_schedule') {
        setAiAction(() => () => navigate('/owner/schedules'));
      } else {
        setAiAction(() => () => navigate('/owner/analytics'));
      }

      setDecisions([
        {
          id: 'dispatch',
          label: 'Dispatch',
          status: operations?.action === 'add_vehicle' ? 'Scale Up' : 'Stable',
          value: operations?.dispatchAdvice || 'No dispatch changes required',
          detail: `Demand ${operations?.demandLevel || '-'} · Occupancy ${Math.round((operations?.occupancyRate || 0) * 100)}%`,
          tone: operations?.action === 'add_vehicle' ? 'amber' : 'green'
        },
        {
          id: 'pricing',
          label: 'Pricing',
          status: response?.data?.modules?.pricing?.demandLevel || 'Normal',
          value: `Predicted KES ${Math.round(Number(response?.data?.modules?.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: response?.data?.modules?.pricing?.cheaperWindowSuggestion || 'No better window detected',
          tone: response?.data?.modules?.pricing?.demandLevel === 'high' ? 'amber' : 'green'
        },
        {
          id: 'risk',
          label: 'Delay Risk',
          status: response?.data?.modules?.delayRisk?.riskLevel || 'Low',
          value: response?.data?.modules?.delayRisk?.recommendation || 'Routes stable',
          detail: `Risk score ${response?.data?.modules?.delayRisk?.riskScore ?? '-'}`,
          tone: response?.data?.modules?.delayRisk?.riskLevel === 'high' ? 'red' : response?.data?.modules?.delayRisk?.riskLevel === 'medium' ? 'amber' : 'blue'
        }
      ]);
    };

    loadOpsBrief();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const trips = [
    {name:'NBI → Nakuru 8:00 AM · KBZ 123A',status:'green',label:'On route'},
    {name:'NBI → Mombasa 6:00 AM · KCA 456B',status:'green',label:'On route'},
    {name:'NBI → Kisumu 9:00 AM · KDB 789C',status:'amber',label:'Boarding'},
    {name:'NBI → Nakuru 2:00 PM · KCA 456B',status:'blue',label:'Scheduled'},
    {name:'NBI → Eldoret 3:00 PM · KBZ 123A',status:'blue',label:'Scheduled'},
  ];
  const routes = [{l:'NBI→Nakuru',pct:92,v:'46/50'},{l:'NBI→Mombasa',pct:76,v:'38/50'},{l:'NBI→Kisumu',pct:58,v:'29/50'},{l:'NBI→Eldoret',pct:38,v:'19/50'}];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Dashboard</div><div className="page-sub">Modern Coast Sacco</div></div>
        <div className="page-actions"><button className="btn btn-primary btn-sm" onClick={()=>navigate('/owner/schedules')}>+ Create trip</button></div>
      </div>
      <div className="page-body">
        <AiBanner text={aiText} action={<button className="btn btn-primary btn-sm" onClick={aiAction}>AI Action →</button>} />
        <AiDecisionGrid title="Autonomous Fleet Decisions" decisions={decisions} />
        <div className="metric-grid">
          <Metric label="Trips today" value="8" sub="2 on route now"/>
          <Metric label="Bookings today" value="87" sub="+12% vs yesterday"/>
          <Metric label="Revenue today" value="74K" sub="KES 74,200"/>
          <Metric label="Occupancy rate" value="81%" sub="AI optimised"/>
        </div>
        <div className="metric-grid">
          <Metric label="Seats booked" value="348" sub="Of 430 available"/>
          <Metric label="Pending payments" value="3" sub="Needs attention" neg/>
          <Metric label="Cancelled today" value="2" sub="KES 1,700 refunded"/>
          <Metric label="Monthly revenue" value="1.2M" sub="KES net"/>
        </div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:10,color:'var(--gray-700)'}}>Quick actions</div>
        <div className="quick-actions">
          {[['🚌 Add new bus','/owner/fleet'],['📅 Create trip','/owner/schedules'],['🗺️ Routes','/owner/routes'],['🎫 Bookings','/owner/bookings'],['📈 Analytics','/owner/analytics']].map(([l,p])=>(
            <div key={l} className="quick-action" onClick={()=>navigate(p)}>{l}</div>
          ))}
        </div>
        <div className="two-col">
          <div className="card">
            <div className="card-title">Today's trips</div>
            {trips.map(t=>(
              <div key={t.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--gray-100)',fontSize:13}}>
                <span><strong>{t.name.split(' ')[0]+' '+t.name.split(' ')[1]+' '+t.name.split(' ')[2]}</strong> {t.name.split(' ').slice(3).join(' ')}</span>
                <span className={`badge badge-${t.status}`}>{t.label}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Route occupancy</div>
            <div className="chart-wrap">{routes.map(r=><ChartBar key={r.l} label={r.l} pct={r.pct} display={r.pct+"%"} val={r.v}/>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}