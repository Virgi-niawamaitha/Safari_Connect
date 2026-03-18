import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../../components/MapView';
import { Steps, showToast } from '../../components/UI';

const PACKAGES = [
  {
    id: 'basic', icon: '🚛', label: 'Basic Move',
    price: 'KES 4,500 – 8,000',
    features: ['1 truck', '2 movers', 'Loading & offloading', 'No packing service'],
    color: '#6b7280',
  },
  {
    id: 'standard', icon: '🚛✨', label: 'Standard Move',
    price: 'KES 8,000 – 14,000',
    features: ['1 large truck', '3 movers', 'Basic packing materials', 'Loading & offloading', 'Furniture disassembly'],
    color: '#0ea371',
    recommended: true,
  },
  {
    id: 'premium', icon: '🏆', label: 'Premium Move',
    price: 'KES 14,000 – 28,000',
    features: ['1+ trucks as needed', '4–6 movers', 'Full packing service', 'Fragile item wrapping', 'Insurance included', 'Cleaning crew optional'],
    color: '#8b5cf6',
  },
];

const ROOMS = ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms', 'Office / Commercial'];
const SPECIAL_ITEMS = ['Piano / Organ', 'Large TV (60"+ )', 'Fridge / Freezer', 'Washing Machine', 'Sofa / Couch', 'Dining Table', 'Wardrobe', 'Safe / Heavy box', 'Artworks / Fragile', 'Gym Equipment'];
const FLOORS = ['Ground floor', '1st floor', '2nd floor', '3rd floor', '4th floor+'];

const PICKUP = { lat: -1.2921, lng: 36.8219, color: '#0ea371', label: 'Current home', popup: 'Pickup: Ngong Road' };
const DROPOFF = { lat: -1.2673, lng: 36.8065, color: '#ef4444', label: 'New home', popup: 'Drop-off: Kilimani' };
const ROUTE = [[-1.2921, 36.8219], [-1.2850, 36.8180], [-1.2750, 36.8120], [-1.2673, 36.8065]];

export default function Movers() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [rooms, setRooms] = useState('2 Bedrooms');
  const [specials, setSpecials] = useState([]);
  const [pkg, setPkg] = useState('standard');
  const [pickupFloor, setPickupFloor] = useState('Ground floor');
  const [dropoffFloor, setDropoffFloor] = useState('Ground floor');
  const [elevator, setElevator] = useState(false);
  const [movingDate, setMovingDate] = useState('');

  const toggleSpecial = (item) => {
    setSpecials(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const selPkg = PACKAGES.find(p => p.id === pkg);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🚛 Movers & Relocation</div>
          <div className="page-sub">Professional movers for homes, offices, and commercial spaces</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => navigate('/carrier')}>← Back</button>
        </div>
      </div>

      <div className="page-body">
        <Steps steps={['Locations', 'Inventory', 'Package', 'Confirm', 'Pay']} current={step} />

        {/* STEP 0 — LOCATIONS */}
        {step === 0 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">📍 Moving from & to</div>
              <div className="form-group">
                <label className="form-label">Current home address (pickup)</label>
                <input className="form-input" defaultValue="Ngong Road, Nairobi" />
              </div>
              <div className="form-group">
                <label className="form-label">Pickup floor level</label>
                <select className="form-input" value={pickupFloor} onChange={e => setPickupFloor(e.target.value)}>
                  {FLOORS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">New home address (drop-off)</label>
                <input className="form-input" defaultValue="Kilimani, Nairobi" />
              </div>
              <div className="form-group">
                <label className="form-label">Drop-off floor level</label>
                <select className="form-input" value={dropoffFloor} onChange={e => setDropoffFloor(e.target.value)}>
                  {FLOORS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={elevator} onChange={e => setElevator(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span>🛗 Elevator available at pickup building</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Moving date</label>
                <input className="form-input" type="date" value={movingDate} onChange={e => setMovingDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred start time</label>
                <select className="form-input">
                  {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '2:00 PM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#1e40af' }}>Distance</span><strong>8.4 km</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1e40af' }}>Est. move duration</span><strong>3–6 hours</strong>
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>Next: Add inventory →</button>
            </div>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: 'var(--gray-700)' }}>Route preview</div>
              <MapView height={380} markers={[PICKUP, DROPOFF]} route={ROUTE} center={[-1.280, 36.814]} zoom={13} />
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#0ea371', borderRadius: '50%', display: 'inline-block' }} />Current home</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />New home</div>
              </div>
              <div className="card card-sm" style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>FLOOR LEVEL IMPACT</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                  {pickupFloor !== 'Ground floor' && !elevator
                    ? `⚠️ Pickup from ${pickupFloor} without elevator adds KES 500–1,500 for stair work.`
                    : '✓ No extra floor charges based on your selections.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — INVENTORY */}
        {step === 1 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">🏠 What are you moving?</div>
              <div className="form-group">
                <label className="form-label">Number of rooms / property type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {ROOMS.map(r => (
                    <div key={r} onClick={() => setRooms(r)}
                      style={{ padding: '10px 14px', border: `2px solid ${rooms === r ? 'var(--green)' : 'var(--gray-200)'}`, borderRadius: 8, cursor: 'pointer', background: rooms === r ? 'var(--green-light)' : '#fff', fontSize: 13, fontWeight: rooms === r ? 600 : 400, transition: 'all .12s' }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Special / heavy items (select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {SPECIAL_ITEMS.map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 10px', border: `1.5px solid ${specials.includes(item) ? 'var(--green)' : 'var(--gray-200)'}`, borderRadius: 8, background: specials.includes(item) ? 'var(--green-light)' : '#fff', fontSize: 12, transition: 'all .12s' }}>
                      <input type="checkbox" checked={specials.includes(item)} onChange={() => toggleSpecial(item)} style={{ width: 14, height: 14, accentColor: 'var(--green)' }} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="form-label">Estimated number of boxes / cartons</label>
                <select className="form-input">
                  {['0–10 boxes', '10–25 boxes', '25–50 boxes', '50+ boxes', 'Not sure'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Additional notes for movers</label>
                <textarea className="form-input" rows={3} style={{ resize: 'vertical' }} placeholder="e.g. Piano on 2nd floor, parking space available, fragile artwork..." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Choose package →</button>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🤖 AI inventory estimate</div>
              <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 6 }}>Based on {rooms} + {specials.length} special items:</div>
                {[
                  ['Est. load volume', rooms === '1 Bedroom' ? '~2.5 m³' : rooms === '2 Bedrooms' ? '~4.5 m³' : '~7 m³'],
                  ['Recommended truck', rooms.includes('4') || rooms.includes('5') ? 'Large truck (8T)' : '1.5T pickup / van'],
                  ['Movers needed', specials.length > 3 ? '4 movers' : '2–3 movers'],
                  ['Est. move time', rooms === 'Studio' ? '2–3 hours' : rooms.includes('2') ? '4–6 hours' : '6–10 hours'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--green-dark)' }}>{l}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              {specials.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Special items selected:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {specials.map(s => <span key={s} className="badge badge-amber">{s}</span>)}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--amber-light)', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
                ⚠️ {specials.includes('Piano / Organ') ? 'Piano requires specialist handling — extra KES 3,000–8,000.' : 'All items within standard mover capabilities.'}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — PACKAGE */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Choose your moving package</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>All packages include insured transportation and professional movers</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, marginBottom: 20 }}>
              {PACKAGES.map(p => (
                <div key={p.id} onClick={() => setPkg(p.id)}
                  style={{
                    background: '#fff', border: `2px solid ${pkg === p.id ? p.color : 'var(--gray-200)'}`,
                    borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all .15s', position: 'relative',
                    boxShadow: pkg === p.id ? `0 6px 24px ${p.color}22` : 'none',
                  }}>
                  {p.recommended && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: p.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      ⭐ Recommended
                    </div>
                  )}
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: p.color, marginBottom: 16, fontFamily: "'Syne',sans-serif" }}>{p.price}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: p.color, fontWeight: 700 }}>✓</span>
                        <span style={{ color: 'var(--gray-600)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', maxWidth: 280 }} onClick={() => setStep(3)}>Review & confirm →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — CONFIRM */}
        {step === 3 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">📋 Moving summary</div>
              <div style={{ background: 'var(--green)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 4 }}>MOVING ROUTE</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif" }}>Ngong Road → Kilimani</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>8.4 km · Est. {rooms === 'Studio' ? '2–3' : '4–6'} hours</div>
              </div>
              {[
                ['Rooms', rooms],
                ['Special items', specials.length > 0 ? specials.slice(0, 2).join(', ') + (specials.length > 2 ? ` +${specials.length - 2} more` : '') : 'None'],
                ['Package', selPkg?.label],
                ['Pickup floor', pickupFloor],
                ['Drop-off floor', dropoffFloor],
                ['Elevator', elevator ? 'Yes' : 'No'],
                ['Moving date', movingDate || 'Not set'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ color: 'var(--gray-400)' }}>{l}</span>
                  <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0 0', padding: '12px 0', borderTop: '2px solid var(--gray-200)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>AI price estimate</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Final confirmed on the day</div>
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{selPkg?.price}</div>
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Your phone number (M-Pesa deposit)</label>
                <input className="form-input" placeholder="07XX XXX XXX" defaultValue="0712 345 678" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', background: 'var(--gray-50)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                💡 A 30% deposit is charged now to confirm your booking. The remaining balance is paid after completion.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(4)}>Pay deposit →</button>
              </div>
            </div>
            <div>
              <MapView height={280} markers={[PICKUP, DROPOFF]} route={ROUTE} center={[-1.280, 36.814]} zoom={13} />
              <div className="card card-sm" style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>What happens next</div>
                {['Deposit payment confirms your booking', 'Movers team lead calls you within 2 hours', 'Full team arrives on moving day', 'Final payment after everything is moved'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{ width: 20, height: 20, background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ color: 'var(--gray-600)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — PAYMENT */}
        {step === 4 && (
          <div style={{ maxWidth: 500 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 14 }} className="pulse">📱</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>KES 2,940</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 6 }}>30% deposit of Standard Move estimate</div>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 20 }}>Remaining KES 6,860 paid after completion</div>
              <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 14, marginBottom: 20, border: '1px solid #fcd34d' }}>
                <div style={{ fontSize: 13, color: '#92400e', fontWeight: 700 }}>STK push sent to 0712 345 678</div>
                <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>Enter your M-Pesa PIN to confirm deposit and lock your moving date</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1, justifyContent: 'center' }}>Resend</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { showToast('Moving booked! Team will call you shortly.'); navigate('/carrier'); }}>Confirm payment ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
