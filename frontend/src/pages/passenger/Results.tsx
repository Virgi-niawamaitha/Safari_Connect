import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { AiBanner, Badge } from '../../components/UI';
import { useBooking } from '../../context/BookingContext';
import type { BusResult } from '../../types';

const BUSES: BusResult[] = [
  { id:'1', saccoName:'Modern Coast Sacco', plateInfo:'KBZ 123A · 50 seats · ⭐ 4.8', rating:4.8, departureTime:'8:00 AM', arrivalTime:'11:30 AM', duration:'3h 30m', price:1050, priceLabel:'AI dynamic price', seatsLeft:18, classes:['economy','business','vip'], highlighted:true },
  { id:'2', saccoName:'Easy Coach Sacco',   plateInfo:'KCA 456B · 50 seats · ⭐ 4.6', rating:4.6, departureTime:'10:00 AM', arrivalTime:'1:30 PM',   duration:'3h 30m', price:850,  priceLabel:'Standard fare',      seatsLeft:4,  classes:['economy','business'] },
  { id:'3', saccoName:'Eldoret Express',    plateInfo:'KDB 789C · 33 seats · ⭐ 4.3', rating:4.3, departureTime:'2:00 PM',  arrivalTime:'5:45 PM',   duration:'3h 45m', price:780,  priceLabel:'Budget fare',         seatsLeft:27, classes:['economy'] },
];

const CLASS_LABEL: Record<string, string> = { economy:'Economy', business:'Business', vip:'VIP' };

export default function Results() {
  const navigate = useNavigate();
  const { booking, selectBus } = useBooking();

  const handleSelect = (bus: BusResult) => {
    selectBus(bus);
    navigate('/passenger/seat');
  };

  return (
    <DashboardLayout
      title="Available buses"
      subtitle={`${booking.searchQuery?.from ?? 'Nairobi'} → ${booking.searchQuery?.to ?? 'Nakuru'} · ${booking.searchQuery?.date ?? 'Today'}`}
      actions={<button className="btn btn-sm" onClick={() => navigate('/passenger/search')}>← Modify search</button>}
    >
      <AiBanner text="<strong>High demand detected.</strong> Fares are AI-priced up to 24% above standard — 89% of seats already filled across all buses. Book now to secure your seat." />

      {BUSES.map(bus => (
        <div key={bus.id} className="bus-card"
          style={bus.highlighted ? { borderColor:'var(--brand)', boxShadow:'0 0 0 3px rgba(14,163,113,.08)' } : {}}
          onClick={() => handleSelect(bus)}>

          {bus.highlighted && (
            <div style={{ fontSize:11, fontWeight:700, color:'var(--brand)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.07em' }}>
              ⭐ Top rated on this route
            </div>
          )}

          <div className="bus-card-head">
            <div>
              <div className="bus-sacco">{bus.saccoName}</div>
              <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:3 }}>{bus.plateInfo}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="bus-price">KES {bus.price.toLocaleString()}</div>
              <div className="bus-price-lbl">{bus.priceLabel}</div>
            </div>
          </div>

          <div className="bus-timing">
            <div style={{ textAlign:'center' }}>
              <div className="bus-time-val">{bus.departureTime}</div>
              <div className="bus-time-lbl">Departs</div>
            </div>
            <div className="bus-arrow" style={{ flex:1, margin:'0 12px' }} />
            <div className="duration-tag">{bus.duration}</div>
            <div className="bus-arrow" style={{ flex:1, margin:'0 12px' }} />
            <div style={{ textAlign:'center' }}>
              <div className="bus-time-val">{bus.arrivalTime}</div>
              <div className="bus-time-lbl">Arrives</div>
            </div>
          </div>

          <div className="bus-footer">
            <Badge variant={bus.seatsLeft <= 5 ? 'amber' : 'green'}>{bus.seatsLeft} seats left</Badge>
            {bus.classes.map(c => <Badge key={c} variant="blue">{CLASS_LABEL[c]}</Badge>)}
            <button className={`btn btn-sm${bus.highlighted ? ' btn-primary' : ''}`} style={{ marginLeft:'auto' }}>
              Select this bus →
            </button>
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
}
