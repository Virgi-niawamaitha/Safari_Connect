import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../../components/MapView';
import { Steps, showToast } from '../../components/UI';

const PICKUP = { lat: -1.2921, lng: 36.8219, color: '#f59e0b', label: 'Pickup', popup: 'Pickup: Upper Hill' };
const DROPOFF = { lat: -1.2635, lng: 36.8024, color: '#ef4444', label: 'Drop-off', popup: 'Drop-off: Westlands' };
const ROUTE = [[-1.2921, 36.8219], [-1.2800, 36.8180], [-1.2700, 36.8100], [-1.2635, 36.8024]];

const SPEEDS = [
  { id: 'express', icon: '⚡', label: 'Express 2hr', price: 'KES 400–600', desc: 'Guaranteed delivery within 2 hours' },
  { id: 'sameday', icon: '📅', label: 'Same-day', price: 'KES 200–350', desc: 'Delivered by end of business day' },
  { id: 'scheduled', icon: '🕐', label: 'Scheduled', price: 'KES 150–250', desc: 'Choose your preferred time window' },
];

export default function DocumentCourier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState('express');
  const [signature, setSignature] = useState(true);
  const [confidential, setConfidential] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">✉️ Document Courier</div>
          <div className="page-sub">Fast, secure delivery of documents, contracts, and legal papers</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => navigate('/carrier')}>← Back</button>
        </div>
      </div>

      <div className="page-body">
        <Steps steps={['Route', 'Details', 'Speed', 'Pay']} current={step} />

        {step === 0 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">📍 Pickup & delivery address</div>
              <div className="form-group"><label className="form-label">Pickup address</label><input className="form-input" defaultValue="Upper Hill, Nairobi" /></div>
              <div className="form-group"><label className="form-label">Pickup contact name</label><input className="form-input" placeholder="Who to collect from" defaultValue="Jane Mwangi" /></div>
              <div className="form-group"><label className="form-label">Pickup contact phone</label><input className="form-input" defaultValue="0712 345 678" /></div>
              <div style={{ height: 1, background: 'var(--gray-200)', margin: '14px 0' }} />
              <div className="form-group"><label className="form-label">Drop-off address</label><input className="form-input" defaultValue="Westlands, Nairobi" /></div>
              <div className="form-group"><label className="form-label">Recipient name</label><input className="form-input" placeholder="Who to deliver to" /></div>
              <div className="form-group"><label className="form-label">Recipient phone</label><input className="form-input" placeholder="07XX XXX XXX" /></div>
              <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>Next →</button>
            </div>
            <div>
              <MapView height={360} markers={[PICKUP, DROPOFF]} route={ROUTE} center={[-1.278, 36.812]} zoom={13} />
              <div className="card card-sm" style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--gray-400)' }}>Distance</span><strong>7.2 km</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--gray-400)' }}>Min delivery time</span><strong style={{ color: 'var(--amber)' }}>~25 min (express)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">📄 Document details</div>
              <div className="form-group">
                <label className="form-label">Document type</label>
                <select className="form-input">
                  {['Legal contracts / agreements', 'Government documents', 'Medical records', 'Financial documents', 'Academic certificates', 'Business letters', 'Passports / IDs (copies)', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of pages / items</label>
                <input className="form-input" type="number" placeholder="e.g. 10" />
              </div>
              <div className="form-group">
                <label className="form-label">Special instructions</label>
                <textarea className="form-input" rows={3} style={{ resize: 'vertical' }} placeholder="e.g. Do not fold, keep dry, deliver to reception only..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={signature} onChange={e => setSignature(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
                  ✍️ Require signature on delivery (confirmation sent to you)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={confidential} onChange={e => setConfidential(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
                  🔒 Confidential — sealed envelope handling only
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--amber)' }} />
                  📸 Photo proof of delivery required
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Choose speed →</button>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔒 Security & compliance</div>
              {[
                { icon: '🛡️', title: 'Vetted couriers', desc: 'All couriers are background-checked and ID-verified' },
                { icon: '📱', title: 'Live tracking', desc: 'Track your document in real-time on the map' },
                { icon: '✍️', title: 'Digital signature', desc: 'E-signature confirmation sent instantly' },
                { icon: '📋', title: 'Chain of custody', desc: 'Full audit trail from pickup to delivery' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</div><div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{f.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">⚡ Delivery speed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {SPEEDS.map(s => (
                  <div key={s.id} onClick={() => setSpeed(s.id)}
                    style={{ padding: '16px 18px', border: `2px solid ${speed === s.id ? '#f59e0b' : 'var(--gray-200)'}`, borderRadius: 12, cursor: 'pointer', background: speed === s.id ? '#fef3c7' : '#fff', display: 'flex', alignItems: 'center', gap: 16, transition: 'all .12s' }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{s.desc}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#92400e' }}>{s.price}</div>
                    {speed === s.id && <div style={{ width: 20, height: 20, background: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>✓</div>}
                  </div>
                ))}
              </div>
              {speed === 'scheduled' && (
                <div className="form-row" style={{ marginBottom: 16 }}>
                  <div className="form-group"><label className="form-label">Delivery date</label><input className="form-input" type="date" /></div>
                  <div className="form-group"><label className="form-label">Time window</label><select className="form-input"><option>8:00 AM – 10:00 AM</option><option>10:00 AM – 12:00 PM</option><option>2:00 PM – 4:00 PM</option><option>4:00 PM – 6:00 PM</option></select></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>Confirm & pay →</button>
              </div>
            </div>
            <div>
              <MapView height={260} markers={[PICKUP, DROPOFF]} route={ROUTE} center={[-1.278, 36.812]} zoom={13} />
              <div className="card card-sm" style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Order summary</div>
                {[['From', 'Upper Hill'], ['To', 'Westlands'], ['Speed', SPEEDS.find(s => s.id === speed)?.label], ['Signature', signature ? 'Required' : 'Not required'], ['Confidential', confidential ? 'Yes' : 'No'], ['Est. price', SPEEDS.find(s => s.id === speed)?.price]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--gray-400)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ maxWidth: 480 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }} className="pulse">📱</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>KES 500</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>Express 2hr delivery · Upper Hill → Westlands</div>
              <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 14, marginBottom: 20, border: '1px solid #fcd34d' }}>
                <div style={{ fontSize: 13, color: '#92400e', fontWeight: 700 }}>STK push sent to 0712 345 678</div>
                <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>Enter your M-Pesa PIN to dispatch courier</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1, justifyContent: 'center' }}>Resend</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { showToast('Courier dispatched! Track in My Orders.'); navigate('/carrier'); }}>Confirm ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
