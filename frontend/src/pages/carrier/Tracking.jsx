import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../../components/MapView';

// Simulated driver positions along route
const ROUTE_POINTS = [
  [-1.2864, 36.8172],
  [-1.2890, 36.8100],
  [-1.2921, 36.8000],
  [-1.2950, 36.7800],
  [-1.2980, 36.7600],
  [-1.3010, 36.7350],
  [-1.3031, 36.7073],
];

export default function LiveTracking() {
  const navigate = useNavigate();
  const [driverPos, setDriverPos] = useState(0);
  const [eta, setEta] = useState(18);
  const [status, setStatus] = useState('picked_up');

  // Simulate driver moving
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos(prev => {
        if (prev < ROUTE_POINTS.length - 1) {
          setEta(e => Math.max(1, e - 3));
          if (prev >= ROUTE_POINTS.length - 2) setStatus('arriving');
          return prev + 1;
        }
        setStatus('delivered');
        clearInterval(interval);
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const STATUS_INFO = {
    picked_up: { label: '📦 Package picked up', color: '#3b82f6', sub: 'Driver is on the way to drop-off' },
    arriving: { label: '🚀 Driver arriving soon', color: '#f59e0b', sub: 'Almost there! Prepare to receive' },
    delivered: { label: '✅ Package delivered!', color: '#0ea371', sub: 'Your package has been delivered successfully' },
  };

  const info = STATUS_INFO[status];

  const markers = [
    { lat: ROUTE_POINTS[0][0], lng: ROUTE_POINTS[0][1], color: '#0ea371', label: 'Pickup', popup: 'Pickup: Nairobi CBD' },
    { lat: ROUTE_POINTS[ROUTE_POINTS.length - 1][0], lng: ROUTE_POINTS[ROUTE_POINTS.length - 1][1], color: '#ef4444', label: 'Drop-off', popup: 'Drop-off: Karen' },
    { lat: ROUTE_POINTS[driverPos][0], lng: ROUTE_POINTS[driverPos][1], color: '#f59e0b', label: '🏍️ Driver', popup: 'James (Driver)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📡 Live Tracking</div>
          <div className="page-sub">Order PKG-2026-001 · Nairobi CBD → Karen</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => navigate('/carrier')}>← Back</button>
        </div>
      </div>

      <div className="page-body">
        {/* Status Banner */}
        <div style={{ background: info.color, borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: '#fff' }}>{info.label}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 3 }}>{info.sub}</div>
          </div>
          {status !== 'delivered' && (
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif" }}>{eta}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)' }}>min ETA</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>
          {/* Map */}
          <div>
            <MapView
              height={480}
              markers={markers}
              route={ROUTE_POINTS.slice(0, driverPos + 1)}
              center={[-1.295, 36.762]}
              zoom={12}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#0ea371', borderRadius: '50%', display: 'inline-block' }} />Pickup</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />Drop-off</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }} />Driver</div>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Driver card */}
            <div className="card">
              <div className="card-title">Your driver</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>James Odhiambo</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>⭐ 4.9 · 234 deliveries</div>
                </div>
              </div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                {[['Vehicle', '🏍️ Motorbike'], ['Plate', 'KDA 123B'], ['Phone', '07XX XXX XXX']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-400)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>📞 Call driver</button>
                <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>💬 Message</button>
              </div>
            </div>

            {/* Delivery progress */}
            <div className="card">
              <div className="card-title">Delivery progress</div>
              {[
                { label: 'Order confirmed', done: true, time: '10:02 AM' },
                { label: 'Driver assigned', done: true, time: '10:04 AM' },
                { label: 'Package picked up', done: driverPos > 0, time: driverPos > 0 ? '10:08 AM' : '—' },
                { label: 'En route to drop-off', done: driverPos > 2, time: driverPos > 2 ? '10:14 AM' : '—' },
                { label: 'Package delivered', done: status === 'delivered', time: status === 'delivered' ? '10:32 AM' : '—' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? 'var(--green)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s.done ? '#fff' : 'var(--gray-400)', flexShrink: 0 }}>
                    {s.done ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: s.done ? 'var(--gray-900)' : 'var(--gray-400)', fontWeight: s.done ? 500 : 400 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.time}</div>
                </div>
              ))}
            </div>

            {/* Order details */}
            <div className="card card-sm">
              <div className="card-title">Order details</div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['Order ID', 'PKG-2026-001'], ['From', 'Nairobi CBD'], ['To', 'Karen'], ['Amount', 'KES 400']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-400)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
