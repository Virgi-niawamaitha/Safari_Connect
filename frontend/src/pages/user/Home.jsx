import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiBanner, AiDecisionGrid, Modal } from '../../components/UI';
import { requestSafe } from '../../lib/api';

export default function UserHome() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [tripType, setTripType] = useState('one');
  const [from, setFrom] = useState('Nairobi CBD');
  const [to, setTo] = useState('Nakuru');
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('08:00');
  const [aiText, setAiText] = useState('<strong>Good morning, Jane!</strong> Based on your history, Nairobi → Nakuru is your top route. Next departure in 42 minutes — 14 seats left.');
  const [decisions, setDecisions] = useState([
    {
      id: 'best',
      label: 'Best Trip',
      status: 'Recommended',
      value: 'Nairobi → Nakuru 08:00',
      detail: 'Balanced fare, fastest travel, strong reliability',
      tone: 'green',
      confidence: '84%',
      updatedAt: 'now',
      evidence: ['Route history', 'Price-fit', 'Reliability score']
    },
    {
      id: 'price',
      label: 'Price Timing',
      status: 'Save',
      value: 'Book before 7:30 AM to save ~KES 120',
      detail: 'Demand is rising for morning departures',
      tone: 'amber',
      confidence: '77%',
      updatedAt: 'now',
      evidence: ['Demand trend', 'Time window', 'Fare baseline']
    },
    {
      id: 'risk',
      label: 'Trip Risk',
      status: 'Low',
      value: 'Delay risk currently low',
      detail: 'Weather and route risk under threshold',
      tone: 'blue',
      confidence: '73%',
      updatedAt: 'now',
      evidence: ['Traffic index', 'Weather', 'Route risk']
    }
  ]);

  const cats = [
    { id: 'bus', icon: '🚌', name: 'Buses', desc: 'Long-distance · AC · Comfortable' },
    { id: 'matatu', icon: '🚐', name: 'Matatu', desc: 'City & town routes' },
    { id: 'motorbike', icon: '🏍️', name: 'Motorbikes', desc: 'Fast · Last mile · Boda boda' },
    { id: 'carrier', icon: '🚚', name: 'Carrier Services', desc: 'Packages · Moving · Documents' },
  ];

  const handleBrowse = (catId) => {
    if (catId === 'carrier') {
      navigate('/carrier');
    } else {
      setSearchOpen(true);
    }
  };

  const runAiHint = async () => {
    const response = await requestSafe('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        text: `Share one short travel tip for ${from} to ${to} around ${travelTime}`,
        language: 'en'
      })
    });

    const message = response?.data?.message || response?.message;
    if (message) {
      setAiText(`<strong>AI tip:</strong> ${message}`);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadAutonomousUserDecision = async () => {
      const [tripResponse, bookingResponse] = await Promise.all([
        requestSafe(`/trips/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`),
        requestSafe('/bookings/me')
      ]);

      const liveTrips = tripResponse?.data || [];
      const myBookings = bookingResponse?.data || [];
      const avgPrice = liveTrips.length
        ? liveTrips.reduce((sum, trip) => sum + Number(trip.basePrice || 0), 0) / liveTrips.length
        : 980;
      const totalSeats = liveTrips.reduce((sum, trip) => sum + Number(trip.bus?.seatCapacity || 0), 0);
      const availableSeats = liveTrips.reduce((sum, trip) => sum + Number(trip.availableSeatsCount || 0), 0);

      const response = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: `${from}-${to}`,
          departureTime: travelDate ? `${travelDate}T${travelTime || '08:00'}:00.000Z` : new Date().toISOString(),
          currentPrice: Math.round(avgPrice || 980),
          totalSeats: totalSeats || 50,
          bookedSeats: Math.max(totalSeats - availableSeats, 0) || 34,
          noShowRate: 0.1,
          trips: liveTrips.slice(0, 12).map((trip) => ({
            id: trip.id,
            price: Number(trip.basePrice || 0),
            travelMinutes: Number(trip.route?.estimatedTime || 240),
            reliabilityScore: Number(trip.availableSeatsCount || 0) < 5 ? 0.74 : 0.86
          })),
          intent: { maxBudget: 1200, maxTravelMinutes: 260, bookingHistoryCount: myBookings.length },
          riskFactors: { weatherRisk: 0.16, trafficRisk: 0.44, routeRisk: 0.25 },
          fraudSignals: {
            attemptsLast24h: Math.min(myBookings.length, 4),
            cardMismatch: false,
            rapidRetries: 0,
            geoMismatch: false
          },
          prompt: `Recommend the best autonomous travel decision for ${from} to ${to}`,
          language: 'en'
        })
      });

      if (!mounted || !response?.data?.modules) return;

      const modules = response.data.modules;
      const summaryText = response?.data?.summary?.passengerMessage;
      if (summaryText) {
        setAiText(`<strong>Autonomous travel brief:</strong> ${summaryText}`);
      }

      setDecisions([
        {
          id: 'best',
          label: 'Best Trip',
          status: modules.recommendation?.topPick ? 'Recommended' : 'Needs Input',
          value: modules.recommendation?.topPick || `${from} → ${to}`,
          detail: modules.recommendation?.rationale || 'Provide date and budget for stronger match',
          tone: modules.recommendation?.topPick ? 'green' : 'amber',
          confidence: `${Math.round((modules.recommendation?.confidence || 0.8) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.recommendation?.signalsUsed?.slice(0, 3) || ['Budget fit', 'Travel duration', 'Reliability']
        },
        {
          id: 'price',
          label: 'Price Timing',
          status: modules.pricing?.demandLevel || 'Normal',
          value: `Predicted fare KES ${Math.round(Number(modules.pricing?.predictedPrice || 0)).toLocaleString()}`,
          detail: modules.pricing?.cheaperWindowSuggestion || 'No cheaper window detected',
          tone: modules.pricing?.demandLevel === 'high' ? 'amber' : 'green',
          confidence: `${Math.round((modules.pricing?.confidence || 0.76) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.pricing?.signalsUsed?.slice(0, 3) || ['Demand level', 'Departure window', 'Historic fare']
        },
        {
          id: 'risk',
          label: 'Trip Risk',
          status: modules.delayRisk?.riskLevel || 'Low',
          value: modules.delayRisk?.recommendation || 'Trip conditions look stable',
          detail: `Risk score ${modules.delayRisk?.riskScore ?? '-'}`,
          tone: modules.delayRisk?.riskLevel === 'high' ? 'red' : modules.delayRisk?.riskLevel === 'medium' ? 'amber' : 'blue',
          confidence: `${Math.round((modules.delayRisk?.confidence || 0.71) * 100)}%`,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence: modules.delayRisk?.signalsUsed?.slice(0, 3) || ['Traffic', 'Weather', 'Route risk']
        }
      ]);
    };

    loadAutonomousUserDecision();

    return () => {
      mounted = false;
    };
  }, [from, to, travelDate, travelTime]);

  const submitSearch = async () => {
    setSearchOpen(false);
    await runAiHint();
    navigate('/user/results', {
      state: {
        origin: from,
        destination: to,
        date: travelDate,
        time: travelTime,
        tripType
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Find your trip</div>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => navigate('/user/mybookings')}>My bookings</button>
        </div>
      </div>
      <div className="page-body">
        <AiBanner
          text={aiText}
          action={<button className="btn btn-primary btn-sm" onClick={submitSearch}>Quick book →</button>}
        />
        <AiDecisionGrid title="Autonomous Trip Decisions" decisions={decisions} />

        {/* Transport Categories */}
        <div className="section-title">Transport categories</div>
        <div className="cat-grid">
          {cats.map(c => (
            <div key={c.id} className="cat-card">
              <div className="cat-icon">{c.icon}</div>
              <div className="cat-name">{c.name}</div>
              <div className="cat-desc">{c.desc}</div>
              <button className="btn-browse" onClick={() => handleBrowse(c.id)}>
                Browse →
              </button>
            </div>
          ))}
        </div>

        {/* Popular routes */}
        <div className="section-title" style={{ marginTop: 8 }}>Popular routes today</div>
        <div className="three-col" style={{ marginBottom: 24 }}>
          {[['Nairobi → Nakuru', 'From KES 850 · 4 trips'], ['Nairobi → Mombasa', 'From KES 1,500 · 2 trips'], ['Nairobi → Kisumu', 'From KES 1,100 · 3 trips']].map(([r, s]) => (
            <div
              key={r}
              className="card card-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const [origin, destination] = r.split(' → ');
                navigate('/user/results', { state: { origin, destination, date: travelDate, time: travelTime, tripType } });
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r}</div>
              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search trips modal */}
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="🔍 Search trips">
        <div className="form-row">
          <div className="form-group"><label className="form-label">From</label><input className="form-input" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
          <div className="form-group"><label className="form-label">To</label><input className="form-input" value={to} onChange={(event) => setTo(event.target.value)} placeholder="Destination" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Travel date</label><input className="form-input" type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} /></div>
          <div className="form-group"><label className="form-label">Travel time</label><input className="form-input" type="time" value={travelTime} onChange={(event) => setTravelTime(event.target.value)} /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Trip type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm${tripType === 'one' ? ' btn-primary' : ''}`} onClick={() => setTripType('one')}>One-way</button>
            <button className={`btn btn-sm${tripType === 'two' ? ' btn-primary' : ''}`} onClick={() => setTripType('two')}>Two-way</button>
          </div>
        </div>
        {tripType === 'two' && (
          <div className="form-row">
            <div className="form-group"><label className="form-label">Return date</label><input className="form-input" type="date" /></div>
            <div className="form-group"><label className="form-label">Return time</label><input className="form-input" type="time" defaultValue="14:00" /></div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSearchOpen(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={submitSearch}>Search trips →</button>
        </div>
      </Modal>
    </div>
  );
}