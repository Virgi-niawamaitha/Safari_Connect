import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Steps, Modal } from '../../components/UI';
import { useBooking } from '../../context/BookingContext';
import { tripsApi } from '../../services/api';
import type { ApiSeat } from '../../services/api';
import type { SeatClass, PassengerDetails } from '../../types';

// Map backend class → frontend class
const toFrontClass = (c: string): SeatClass => {
  if (c === 'VIP')      return 'vip';
  if (c === 'BUSINESS') return 'business';
  return 'economy';
};

const CLASS_META: Record<SeatClass, { label: string; icon: string; color: string; bg: string; perks: string[] }> = {
  vip:      { label: 'VIP',      icon: '👑', color: '#7c3aed', bg: '#f5f3ff', perks: ['Fully reclining seat','Complimentary snacks','Extra legroom','Priority boarding'] },
  business: { label: 'Business', icon: '💼', color: '#3b82f6', bg: '#eff6ff', perks: ['Extra legroom','Priority boarding','Dedicated overhead storage'] },
  economy:  { label: 'Economy',  icon: '🎫', color: 'var(--brand)', bg: 'var(--brand-light)', perks: ['Standard comfortable seating','Window & aisle options','Overhead storage'] },
};

const EMPTY_PAX: PassengerDetails = { firstName: '', lastName: '', idNumber: '', residence: '', email: '' };

export default function SeatSelection() {
  const navigate = useNavigate();
  const { booking, selectSeat, setPassenger } = useBooking();

  const [seats, setSeats]       = useState<ApiSeat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [seatClass, setSeatClass] = useState<SeatClass>('economy');
  const [selectedSeat, setSelectedSeat] = useState<ApiSeat | null>(null);
  const [paxOpen, setPaxOpen]   = useState(false);
  const [pax, setPax]           = useState<PassengerDetails>(EMPTY_PAX);
  const [paxSaved, setPaxSaved] = useState(false);
  const [tripInfo, setTripInfo] = useState<{ sacco: string; route: string; departs: string; plate: string } | null>(null);

  const tripId = booking.selectedBus?.id ?? '';

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    tripsApi.getSeats(tripId)
      .then(res => {
        setSeats(res.data.seats);
        const t = res.data.trip;
        setTripInfo({
          sacco:   t.sacco.name,
          route:   `${t.route.origin} → ${t.route.destination}`,
          departs: new Date(t.departureTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
          plate:   t.bus.plateNumber,
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  const cls = CLASS_META[seatClass];

  // Group seats by class for available count
  const counts = seats.reduce((acc, s) => {
    const fc = toFrontClass(s.seatClass);
    if (!acc[fc]) acc[fc] = { total: 0, avail: 0 };
    acc[fc].total++;
    if (!s.isBooked) acc[fc].avail++;
    return acc;
  }, {} as Record<SeatClass, { total: number; avail: number }>);

  const handleSeatClick = (seat: ApiSeat) => {
    if (seat.isBooked) return;
    const fc = toFrontClass(seat.seatClass);
    setSeatClass(fc);
    setSelectedSeat(seat);
    setPaxOpen(true);
  };

  const savePax = () => {
    if (!selectedSeat) return;
    const fc = toFrontClass(selectedSeat.seatClass);
    const fare = parseFloat(String(selectedSeat.price));
    selectSeat(selectedSeat.seatNumber, fc, fare, selectedSeat.id);
    setPassenger(pax);
    setPaxSaved(true);
    setPaxOpen(false);
  };

  // Render seats in a bus layout (4 columns: A B | C D)
  const renderSeatMap = () => {
    const filtered = seats.filter(s => {
      const fc = toFrontClass(s.seatClass);
      return fc === seatClass || seats.filter(x => toFrontClass(x.seatClass) === seatClass).length === 0;
    });

    // Sort by seat number
    const sorted = [...seats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, ''));
      const numB = parseInt(b.seatNumber.replace(/\D/g, ''));
      return numA - numB || a.seatNumber.localeCompare(b.seatNumber);
    });

    void filtered;

    // Group into rows of 4
    const rows: ApiSeat[][] = [];
    for (let i = 0; i < sorted.length; i += 4) {
      rows.push(sorted.slice(i, i + 4));
    }

    return (
      <div className="seatmap-v2">
        {/* Driver cabin */}
        <div className="seatmap-cabin">
          <span style={{ fontSize: 18 }}>🚌</span>
          <span className="seatmap-cabin-text">Driver · Front of Bus</span>
        </div>

        {/* Column headers */}
        <div className="seatmap-col-headers">
          <div className="seatmap-col-hdr" />
          <div className="seatmap-col-hdr">A</div>
          <div className="seatmap-col-hdr">B</div>
          <div className="seatmap-col-hdr" style={{ color: 'transparent' }}>·</div>
          <div className="seatmap-col-hdr">C</div>
          <div className="seatmap-col-hdr">D</div>
        </div>

        {rows.map((row, ri) => {
          const [a, b, c, d] = row;
          return (
            <div key={ri} className="seatmap-row">
              <div className="seatmap-row-num">{ri + 1}</div>
              {[a, b].map((seat, si) => seat ? (
                <SeatBtn key={si} seat={seat} selected={selectedSeat?.id === seat.id}
                  seatClass={seatClass} onClick={() => handleSeatClick(seat)} />
              ) : <div key={si} style={{ width: 36 }} />)}
              <div className="seatmap-aisle-col"><div className="seatmap-aisle-dot" /></div>
              {[c, d].map((seat, si) => seat ? (
                <SeatBtn key={si + 2} seat={seat} selected={selectedSeat?.id === seat.id}
                  seatClass={seatClass} onClick={() => handleSeatClick(seat)} />
              ) : <div key={si + 2} style={{ width: 36 }} />)}
            </div>
          );
        })}

        <div className="seatmap-back">Back of Bus</div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          {([['#f5f3ff', '#c4b5fd', 'VIP 👑'], ['#dbeafe', '#93c5fd', 'Business 💼'], ['#dcfce7', '#86efac', 'Available'], ['#fee2e2', '#fca5a5', 'Booked'], ['var(--brand)', 'var(--brand-dark)', 'Your pick']] as [string, string, string][]).map(([bg, bc, lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--gray-500)' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: `1.5px solid ${bc}` }} />
              {lbl}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Seat selection"
      subtitle={tripInfo ? `${tripInfo.sacco} · ${tripInfo.route} · ${tripInfo.departs}` : 'Select your seat'}
    >
      <Steps steps={['Search', 'Results', 'Seat', 'Confirm', 'Payment', 'Ticket']} current={2} />

      {loading && (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div className="pulse-icon" style={{ fontSize: 32, marginBottom: 12 }}>🚌</div>
          <div>Loading seat map…</div>
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>Failed to load seats</div>
          <div className="text-muted" style={{ fontSize: 13 }}>{error}</div>
          <button className="btn btn-sm btn-ghost mt-3" onClick={() => navigate('/passenger/results')}>← Back</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* LEFT — Class selector */}
          <div className="card" style={{ padding: '20px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: 14 }}>Select class</div>
            {(Object.entries(CLASS_META) as [SeatClass, typeof CLASS_META[SeatClass]][]).map(([id, m]) => {
              const avail = counts[id]?.avail ?? 0;
              if (avail === 0 && seats.length > 0) return null;
              return (
                <div key={id} onClick={() => setSeatClass(id)}
                  style={{ padding: '14px', borderRadius: 10, border: `2px solid ${seatClass === id ? m.color : 'var(--gray-200)'}`,
                    background: seatClass === id ? m.bg : '#fff', cursor: 'pointer', marginBottom: 10, transition: 'all .15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: seatClass === id ? m.color : 'var(--gray-800)' }}>{m.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gray-400)' }}>{avail} avail.</span>
                  </div>
                  {seatClass === id && (
                    <ul style={{ margin: '6px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                      {m.perks.map(p => (
                        <li key={p} style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2, display: 'flex', gap: 5 }}>
                          <span style={{ color: m.color }}>✓</span>{p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* CENTER — Seat map */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Bus map — {tripInfo?.plate ?? '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Click any available seat to select</div>
              </div>
              {selectedSeat && (
                <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-mid)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700, color: 'var(--brand-dark)' }}>
                  💺 Seat {selectedSeat.seatNumber} selected
                </div>
              )}
            </div>
            {renderSeatMap()}
          </div>

          {/* RIGHT — Summary */}
          <div>
            <div className="card" style={{ padding: '20px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: 14 }}>Booking summary</div>
              {[
                ['Route',   tripInfo?.route ?? '—'],
                ['Date',    booking.searchQuery?.date ?? '—'],
                ['Departs', tripInfo?.departs ?? '—'],
                ['SACCO',   tripInfo?.sacco ?? '—'],
                ['Class',   cls.label],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                  <span style={{ color: 'var(--gray-400)' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                <span style={{ color: 'var(--gray-400)' }}>Seat</span>
                <span style={{ fontWeight: 600, color: selectedSeat ? 'var(--brand)' : 'var(--gray-300)' }}>
                  {selectedSeat ? `Seat ${selectedSeat.seatNumber}` : 'Not selected'}
                </span>
              </div>
              <div style={{ padding: '14px 0 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Total fare</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: cls.color, lineHeight: 1 }}>
                  KES {selectedSeat ? parseFloat(String(selectedSeat.price)).toLocaleString() : '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Incl. taxes & M-Pesa</div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" disabled={!paxSaved}
                style={{ opacity: paxSaved ? 1 : 0.4, background: cls.color, borderColor: cls.color }}
                onClick={() => navigate('/passenger/confirm')}>
                Continue to confirm →
              </button>
              {!paxSaved && (
                <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                  {selectedSeat ? 'Complete passenger details above' : 'Select a seat on the map'}
                </p>
              )}
              {paxSaved && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--brand-light)', borderRadius: 8, fontSize: 12, color: 'var(--brand-dark)', display: 'flex', gap: 6 }}>
                  <span>✓</span><span>Seat {selectedSeat?.seatNumber} reserved for {pax.firstName} {pax.lastName}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 10, fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18 }}>💳</span>
              <span>Payment via M-Pesa STK push. You'll confirm on your phone after this step.</span>
            </div>
          </div>
        </div>
      )}

      {/* Passenger details modal */}
      <Modal open={paxOpen} onClose={() => setPaxOpen(false)} title={`Passenger details — Seat ${selectedSeat?.seatNumber ?? ''} · ${cls.label}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 12px', background: cls.bg, borderRadius: 8 }}>
          <span style={{ fontSize: 20 }}>{cls.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: cls.color }}>{cls.label} class</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              KES {selectedSeat ? parseFloat(String(selectedSeat.price)).toLocaleString() : '—'} · {cls.perks[0]}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First name</label>
            <input className="input" placeholder="Jane" value={pax.firstName}
              onChange={e => setPax(p => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Last name</label>
            <input className="input" placeholder="Mwangi" value={pax.lastName}
              onChange={e => setPax(p => ({ ...p, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">National ID number</label>
          <input className="input" placeholder="23456789" value={pax.idNumber}
            onChange={e => setPax(p => ({ ...p, idNumber: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Residence</label>
            <input className="input" placeholder="Nairobi" value={pax.residence}
              onChange={e => setPax(p => ({ ...p, residence: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="input" type="email" placeholder="jane@email.com" value={pax.email}
              onChange={e => setPax(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg"
          style={{ background: cls.color, borderColor: cls.color }}
          disabled={!pax.firstName || !pax.lastName || !pax.idNumber}
          onClick={savePax}>
          Reserve Seat {selectedSeat?.seatNumber} →
        </button>
      </Modal>
    </DashboardLayout>
  );
}

// Small seat button component
function SeatBtn({ seat, selected, seatClass, onClick }: {
  seat: ApiSeat; selected: boolean; seatClass: SeatClass; onClick: () => void;
}) {
  const fc = toFrontClass(seat.seatClass);
  let cls = 'available';
  if (seat.isBooked) cls = 'booked';
  else if (selected) cls = 'selected';
  else if (fc === 'vip') cls = 'vip';
  else if (fc === 'business') cls = 'business';

  const outOfClass = !seat.isBooked && fc !== seatClass && !selected;

  return (
    <div
      className={`seat-v2 ${cls}`}
      style={{ opacity: outOfClass ? 0.35 : 1, cursor: seat.isBooked ? 'not-allowed' : 'pointer' }}
      title={`${seat.seatNumber} · ${seat.seatClass} · KES ${parseFloat(String(seat.price)).toLocaleString()}${seat.isBooked ? ' (Booked)' : ''}`}
      onClick={seat.isBooked ? undefined : onClick}
    >
      {seat.seatNumber}
    </div>
  );
}
