import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiBanner, AiDecisionGrid, AiPlanningBoard, Badge, showToast } from '../../components/UI';
import { requestSafe } from '../../lib/api';

const buses = [
  { sacco:'Modern Coast Sacco', plate:'KBZ 123A · 50 seats · ⭐ 4.8', price:'KES 1,050', priceLabel:'AI dynamic price', dep:'8:00 AM', arr:'11:30 AM', dur:'3h 30m', seats:18, classes:['Economy','Business','VIP'], left:'green', priceNum:1050 },
  { sacco:'Easy Coach Sacco', plate:'KCA 456B · 50 seats · ⭐ 4.6', price:'KES 850', priceLabel:'Standard fare', dep:'10:00 AM', arr:'1:30 PM', dur:'3h 30m', seats:4, classes:['Economy','Business'], left:'amber', priceNum:850 },
  { sacco:'Eldoret Express', plate:'KDB 789C · 33 seats · ⭐ 4.3', price:'KES 780', priceLabel:'Budget fare', dep:'2:00 PM', arr:'5:45 PM', dur:'3h 45m', seats:27, classes:['Economy'], left:'green', dim:true, priceNum:780 },
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchSacco, setSearchSacco] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedClass, setSelectedClass] = useState('');
  const [items, setItems] = useState(buses);
  const [aiText, setAiText] = useState('<strong>High demand detected.</strong> Fares dynamically priced up 24% today — 89% of seats already filled. Book now to secure your seat.');
  const [decisions, setDecisions] = useState([
    { id: 'best', label: 'Best Offer', status: 'Recommended', value: 'Balanced price + reliability', detail: 'Top route match for your search', tone: 'green', confidence: '82%', updatedAt: 'now', evidence: ['Budget fit', 'Travel time', 'Reliability'] },
    { id: 'price', label: 'Price Window', status: 'Monitor', value: 'Fare pressure rising', detail: 'Book earlier to avoid surge', tone: 'amber', confidence: '75%', updatedAt: 'now', evidence: ['Demand trend', 'Fare baseline', 'Time window'] },
    { id: 'risk', label: 'Delay Risk', status: 'Low', value: 'Current delay risk manageable', detail: 'Route conditions stable', tone: 'blue', confidence: '71%', updatedAt: 'now', evidence: ['Traffic', 'Weather', 'Route risk'] }
  ]);
  const [plans, setPlans] = useState([
    { id: 'book_cheapest', scenario: 'Budget lock', impact: 'Save up to KES 180', risk: 'Low risk', eta: 'Now', action: 'Auto-focus cheapest reliable options in current route.', tone: 'green' },
    { id: 'faster_trip', scenario: 'Time priority', impact: 'Reduce travel by ~35 minutes', risk: 'Medium risk', eta: 'Next departure', action: 'Prioritize low-duration trips over lowest fare.', tone: 'amber' },
    { id: 'seat_secure', scenario: 'Seat security', impact: 'Lower sell-out risk', risk: 'Medium risk', eta: 'Immediate', action: 'Prioritize trips with low available seats for immediate booking.', tone: 'blue' }
  ]);

  const origin = useMemo(() => location.state?.origin || 'Nairobi', [location.state]);
  const destination = useMemo(() => location.state?.destination || 'Nakuru', [location.state]);
  const date = useMemo(() => location.state?.date || '', [location.state]);
  const time = useMemo(() => location.state?.time || '', [location.state]);
  const tripType = useMemo(() => (location.state?.tripType === 'two' ? 'ROUND_TRIP' : 'ONE_WAY'), [location.state]);

  useEffect(() => {
    let mounted = true;
    const loadTrips = async () => {
      const response = await requestSafe(`/trips/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&tripType=${encodeURIComponent(tripType)}`);
      const list = response?.data;
      if (!mounted || !Array.isArray(list) || !list.length) return;

      const mapped = list.map((trip) => {
        const basePrice = Number(trip.basePrice || 0);
        return {
          id: trip.id,
          sacco: trip.sacco?.name || 'Sacco',
          plate: `${trip.bus?.plateNumber || '-'} · ${trip.bus?.seatCapacity || '-'} seats`,
          price: `KES ${basePrice.toLocaleString()}`,
          priceLabel: 'Live fare',
          dep: new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arr: new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dur: trip.duration || '-',
          seats: Number(trip.availableSeatsCount || 0),
          classes: trip.seatClasses || ['Economy'],
          left: Number(trip.availableSeatsCount || 0) < 5 ? 'amber' : 'green',
          priceNum: basePrice,
          apiTrip: trip
        };
      });

      setItems(mapped);

      const avgPrice = list.reduce((sum, trip) => sum + Number(trip.basePrice || 0), 0) / list.length;
      const totalSeats = list.reduce((sum, trip) => sum + Number(trip.bus?.seatCapacity || 0), 0);
      const bookedSeats = list.reduce((sum, trip) => sum + (Number(trip.bus?.seatCapacity || 0) - Number(trip.availableSeatsCount || 0)), 0);

      const assist = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: `${origin}-${destination}`,
          departureTime: date ? `${date}T${time || '08:00'}:00.000Z` : new Date().toISOString(),
          currentPrice: Math.round(avgPrice || 1200),
          totalSeats: totalSeats || 50,
          bookedSeats: bookedSeats || 20,
          noShowRate: 0.1,
          riskFactors: { weatherRisk: 0.2, trafficRisk: 0.5, routeRisk: 0.3 },
          fraudSignals: { attemptsLast24h: 0, cardMismatch: false, rapidRetries: 0, geoMismatch: false },
          prompt: `Suggest the best booking strategy for ${origin} to ${destination}`,
          language: 'en',
          trips: list.slice(0, 12).map((trip) => ({
            id: trip.id,
            price: Number(trip.basePrice || 0),
            travelMinutes: Number(trip.route?.estimatedTime || 240),
            reliabilityScore: Number(trip.availableSeatsCount || 0) < 5 ? 0.74 : 0.86
          })),
          intent: { maxBudget: maxPrice, maxTravelMinutes: 300 }
        })
      });

      const message = assist?.data?.summary?.passengerMessage;
      if (message && mounted) {
        setAiText(`<strong>AI guidance:</strong> ${message}`);
      }

      const modules = assist?.data?.modules;
      if (!modules || !mounted) return;

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDecisions([
        {
          id: 'best',
          label: 'Best Offer',
          status: modules.recommendation?.topPick ? 'Recommended' : 'Needs input',
          value: modules.recommendation?.topPick || 'Best route pending',
          detail: modules.recommendation?.rationale || 'Add tighter budget/time preference',
          tone: modules.recommendation?.topPick ? 'green' : 'amber',
          confidence: `${Math.round((modules.recommendation?.confidence || 0.8) * 100)}%`,
          updatedAt: now,
          evidence: modules.recommendation?.signalsUsed?.slice(0, 3) || ['Budget fit', 'Duration', 'Reliability']
        },
        {
          id: 'price',
          label: 'Price Window',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'No cheaper window detected',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green',
          confidence: `${Math.round((modules.pricing?.confidence || 0.75) * 100)}%`,
          updatedAt: now,
          evidence: modules.pricing?.signalsUsed?.slice(0, 3) || ['Demand trend', 'Fare baseline', 'Window timing']
        },
        {
          id: 'risk',
          label: 'Delay Risk',
          status: modules.delayRisk?.riskLevel || 'Low',
          value: modules.delayRisk?.recommendation || 'Route risk stable',
          detail: `Risk score ${modules.delayRisk?.riskScore ?? '-'}`,
          tone: modules.delayRisk?.riskLevel === 'high' ? 'red' : modules.delayRisk?.riskLevel === 'medium' ? 'amber' : 'blue',
          confidence: `${Math.round((modules.delayRisk?.confidence || 0.72) * 100)}%`,
          updatedAt: now,
          evidence: modules.delayRisk?.signalsUsed?.slice(0, 3) || ['Traffic', 'Weather', 'Route risk']
        }
      ]);

      setPlans([
        {
          id: 'book_cheapest',
          scenario: 'Budget lock',
          impact: `Target at or below KES ${Math.round((modules.pricing?.predictedPrice || avgPrice) * 0.95).toLocaleString()}`,
          risk: modules.pricing?.demandLevel === 'high' ? 'Medium risk' : 'Low risk',
          eta: 'Now',
          action: modules.pricing?.cheaperWindowSuggestion || 'Filter to lower fare trips and confirm quickly.',
          tone: 'green'
        },
        {
          id: 'faster_trip',
          scenario: 'Time priority',
          impact: 'Cut estimated travel time by selecting top reliability trips',
          risk: modules.delayRisk?.riskLevel === 'high' ? 'High risk' : 'Medium risk',
          eta: 'Next departure',
          action: modules.delayRisk?.recommendation || 'Prioritize trips with lower route risk.',
          tone: modules.delayRisk?.riskLevel === 'high' ? 'red' : 'amber'
        },
        {
          id: 'seat_secure',
          scenario: 'Seat security',
          impact: 'Reduce chance of sell-out during demand spike',
          risk: 'Medium risk',
          eta: 'Immediate',
          action: 'Focus on departures with fewer seats left and book immediately.',
          tone: 'blue'
        }
      ]);
    };

    loadTrips();

    return () => {
      mounted = false;
    };
  }, [origin, destination, date, time, tripType, maxPrice]);

  const filteredBuses = items.filter(b => {
    const matchesSacco = b.sacco.toLowerCase().includes(searchSacco.toLowerCase());
    const matchesPrice = b.priceNum <= maxPrice;
    const matchesClass = !selectedClass || b.classes.includes(selectedClass);
    return matchesSacco && matchesPrice && matchesClass;
  });

  const runPlan = (plan) => {
    if (plan.id === 'book_cheapest') {
      const cheapest = Math.min(...items.map((item) => item.priceNum));
      if (Number.isFinite(cheapest)) {
        setMaxPrice(cheapest);
        setSelectedClass('Economy');
      }
      showToast('Budget lock plan applied');
      return;
    }

    if (plan.id === 'faster_trip') {
      setSelectedClass('Business');
      showToast('Time-priority plan applied');
      return;
    }

    if (plan.id === 'seat_secure') {
      const scarce = items.find((item) => item.seats <= 5);
      if (scarce) {
        navigate('/user/seat', { state: { selectedTrip: scarce.apiTrip || scarce, from: origin, to: destination, date } });
      }
      showToast('Seat-security plan executed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">{origin} → {destination}</div><div className="page-sub">{date || 'Today'} · Buses · {filteredBuses.length} results</div></div>
        <div className="page-actions"><button className="btn btn-sm" onClick={() => navigate('/user')}>Change search</button></div>
      </div>
      <div className="page-body">
        {/* Hero search bar */}
        <div className="search-hero">
          <div className="search-hero-icon">🔍</div>
          <input
            className="search-hero-input"
            type="text"
            placeholder="Search trips by SACCO name, route, or time..."
            value={searchSacco}
            onChange={(e) => setSearchSacco(e.target.value)}
            autoFocus
          />
          {searchSacco && (
            <button className="search-hero-clear" onClick={() => setSearchSacco('')}>✕</button>
          )}
        </div>

        <AiBanner text={aiText} />
        <AiDecisionGrid title="Autonomous Booking Decisions" decisions={decisions} />
        <AiPlanningBoard title="User Smart Planning" plans={plans} onRunPlan={runPlan} />
        
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--gray-700)' }}>Filter trips</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Search SACCO</label>
              <input 
                className="form-input" 
                placeholder="SACCO name..." 
                value={searchSacco}
                onChange={(e) => setSearchSacco(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max price: KES {maxPrice}</label>
              <input 
                type="range" 
                min="500" 
                max="2000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Seat class</label>
              <select 
                className="form-input" 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All classes</option>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBuses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No trips match your filters</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search criteria</div>
          </div>
        ) : (
          filteredBuses.map((b,i) => (
          <div key={i} className="bus-card" style={b.dim?{opacity:.75}:{}}>
            <div className="bus-header">
              <div><div className="sacco-name">{b.sacco}</div><div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>{b.plate}</div></div>
              <div style={{textAlign:'right'}}><div className="bus-price">{b.price}</div><div className="bus-price-label">{b.priceLabel}</div></div>
            </div>
            <div className="bus-timing">
              <div className="time-block"><div className="time-val">{b.dep}</div><div className="time-label">Departs</div></div>
              <div className="time-arrow" style={{flex:1,textAlign:'center',color:'var(--gray-300)',fontSize:18}}>——→</div>
              <div className="duration-pill">{b.dur}</div>
              <div className="time-arrow" style={{flex:1,textAlign:'center',color:'var(--gray-300)',fontSize:18}}>——→</div>
              <div className="time-block"><div className="time-val">{b.arr}</div><div className="time-label">Arrives</div></div>
            </div>
            <div className="bus-footer">
              <Badge variant={b.left}>{b.seats} seats left</Badge>
              {b.classes.map(c => <Badge key={c} variant="blue">{c}</Badge>)}
              <button
                className={`btn${i===0?' btn-primary':''}`}
                style={{marginLeft:'auto'}}
                onClick={() => navigate('/user/seat', { state: { selectedTrip: b.apiTrip || b, from: origin, to: destination, date } })}
              >
                Select bus →
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}