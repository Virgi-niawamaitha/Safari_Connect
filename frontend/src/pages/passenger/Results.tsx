import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { AiBanner, Badge } from '../../components/UI';
import { useBooking } from '../../context/BookingContext';
import { tripsApi } from '../../services/api';
import type { ApiTrip } from '../../services/api';
import type { BusResult, SeatClass } from '../../types';

const CLASS_LABEL: Record<string, string> = {
  economy: 'Economy', business: 'Business', vip: 'VIP',
  FIRST_CLASS: 'Economy', BUSINESS: 'Business', VIP: 'VIP',
};

// Backend FIRST_CLASS → frontend economy, BUSINESS → business, VIP → vip
const mapClass = (c: string): SeatClass => {
  if (c === 'VIP') return 'vip';
  if (c === 'BUSINESS') return 'business';
  return 'economy';
};

const mapTrip = (t: ApiTrip, idx: number): BusResult => ({
  id: t.id,
  saccoName: t.sacco.name,
  plateInfo: `${t.bus.plateNumber} · ${t.bus.seatCapacity} seats`,
  rating: 4.5 - idx * 0.15,
  departureTime: new Date(t.departureTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
  arrivalTime:   new Date(t.arrivalTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
  duration: t.duration,
  price: parseFloat(t.basePrice),
  priceLabel: 'From base price',
  seatsLeft: t.availableSeatsCount,
  classes: [...new Set(t.seatClasses.map(mapClass))],
  highlighted: idx === 0,
});

export default function Results() {
  const navigate = useNavigate();
  const { booking, selectBus } = useBooking();
  const q = booking.searchQuery;

  const [buses, setBuses]   = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    tripsApi.search({
      origin:      q?.from,
      destination: q?.to,
      date:        q?.date,
      time:        q?.time,
      tripType:    q?.tripType === 'return' ? 'ROUND_TRIP' : 'ONE_WAY',
    })
      .then(res => setBuses((res.data ?? []).map(mapTrip)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [q?.from, q?.to, q?.date]);

  const handleSelect = (bus: BusResult) => {
    selectBus(bus);
    navigate('/passenger/seat');
  };

  return (
    <DashboardLayout
      title="Available buses"
      subtitle={`${q?.from ?? 'Nairobi'} → ${q?.to ?? 'Nakuru'} · ${q?.date ?? 'Today'}`}
      actions={<button className="btn btn-sm" onClick={() => navigate('/passenger/search')}>← Modify search</button>}
    >
      <AiBanner text="<strong>AI Insight:</strong> Fares may rise as departure approaches. Book now to secure your seat." />

      {loading && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div>Searching available trips…</div>
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>Could not load trips</div>
          <div className="text-muted" style={{ fontSize: 13 }}>{error}</div>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/passenger/search')}>← Back to search</button>
        </div>
      )}

      {!loading && !error && buses.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚌</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No trips found</div>
          <div className="text-muted" style={{ fontSize: 13 }}>Try a different date or route.</div>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/passenger/search')}>← Modify search</button>
        </div>
      )}

      {buses.map(bus => (
        <div key={bus.id} className="bus-card"
          style={bus.highlighted ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 3px rgba(14,163,113,.08)' } : {}}
          onClick={() => handleSelect(bus)}
        >
          {bus.highlighted && (
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.07em' }}>
              ⭐ Best option on this route
            </div>
          )}
          <div className="bus-card-head">
            <div>
              <div className="bus-sacco">{bus.saccoName}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3 }}>{bus.plateInfo}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="bus-price">KES {bus.price.toLocaleString()}</div>
              <div className="bus-price-lbl">{bus.priceLabel}</div>
            </div>
          </div>
          <div className="bus-timing">
            <div style={{ textAlign: 'center' }}>
              <div className="bus-time-val">{bus.departureTime}</div>
              <div className="bus-time-lbl">Departs</div>
            </div>
            <div className="bus-arrow" style={{ flex: 1, margin: '0 12px' }} />
            <div className="duration-tag">{bus.duration}</div>
            <div className="bus-arrow" style={{ flex: 1, margin: '0 12px' }} />
            <div style={{ textAlign: 'center' }}>
              <div className="bus-time-val">{bus.arrivalTime}</div>
              <div className="bus-time-lbl">Arrives</div>
            </div>
          </div>
          <div className="bus-footer">
            <Badge variant={bus.seatsLeft <= 5 ? 'amber' : 'green'}>{bus.seatsLeft} seats left</Badge>
            {bus.classes.map(c => <Badge key={c} variant="blue">{CLASS_LABEL[c]}</Badge>)}
            <button className={`btn btn-sm${bus.highlighted ? ' btn-primary' : ''}`} style={{ marginLeft: 'auto' }}>
              Select →
            </button>
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
}
