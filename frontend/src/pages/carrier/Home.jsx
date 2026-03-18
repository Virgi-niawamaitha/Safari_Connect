import { useNavigate } from 'react-router-dom';
import { AiBanner } from '../../components/UI';

const SERVICES = [
  {
    id: 'package',
    icon: '📦',
    title: 'Package Delivery',
    desc: 'Send parcels, goods, and packages across the city or countrywide. Real-time tracking included.',
    tags: ['Same-day available', 'GPS tracked', 'Motorbike / Van / Truck'],
    color: '#0ea371',
    bg: '#d1f5e8',
    route: '/carrier/package',
  },
  {
    id: 'movers',
    icon: '🚛',
    title: 'Movers & Relocation',
    desc: 'Moving house or office? Book professional movers with the right vehicle and manpower.',
    tags: ['Full-service packing', 'AI price estimate', 'Insured'],
    color: '#3b82f6',
    bg: '#dbeafe',
    route: '/carrier/movers',
  },
  {
    id: 'courier',
    icon: '✉️',
    title: 'Document Courier',
    desc: 'Fast, secure delivery of documents, contracts, and legal papers with signature confirmation.',
    tags: ['Signature on delivery', 'Express 2hr', 'Secure handling'],
    color: '#f59e0b',
    bg: '#fef3c7',
    route: '/carrier/courier',
  },
];

export default function CarrierHome() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Carrier Services</div>
          <div className="page-sub">Choose the type of delivery or moving service you need</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-sm" onClick={() => navigate('/user/mybookings')}>My orders</button>
        </div>
      </div>

      <div className="page-body">
        <AiBanner
          text="<strong>AI routing active.</strong> Live traffic data from Nairobi roads is being used to optimise delivery times and pricing. Current avg delivery time: 28 minutes."
        />

        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
          What do you need delivered or moved?
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>
          Select a service below to get started
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, marginBottom: 32 }}>
          {SERVICES.map(s => (
            <div
              key={s.id}
              onClick={() => navigate(s.route)}
              style={{
                background: '#fff',
                border: `2px solid var(--gray-200)`,
                borderRadius: 16,
                padding: 28,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 64, height: 64, background: s.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 16 }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--gray-900)' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {s.tags.map(t => (
                  <span key={t} style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{t}</span>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ background: s.color, borderColor: s.color, width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(s.route)}
              >
                Book now →
              </button>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="card">
          <div className="card-title">How it works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16 }}>
            {[
              { step: '1', icon: '📍', title: 'Set locations', desc: 'Pin your pickup and drop-off on the map' },
              { step: '2', icon: '🤖', title: 'Get AI quote', desc: 'Instant pricing based on distance and load' },
              { step: '3', icon: '💳', title: 'Pay via M-Pesa', desc: 'Secure STK push payment in seconds' },
              { step: '4', icon: '📡', title: 'Track live', desc: 'Watch your delivery on a live map' },
            ].map(h => (
              <div key={h.step} style={{ textAlign: 'center', padding: '8px 4px' }}>
                <div style={{ width: 48, height: 48, background: 'var(--green-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>{h.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.5 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
