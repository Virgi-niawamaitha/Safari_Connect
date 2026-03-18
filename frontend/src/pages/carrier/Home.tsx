import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { AiBanner } from '../../components/UI';

interface Service { id: string; icon: string; title: string; desc: string; tags: string[]; color: string; bg: string; path: string; }

const SERVICES: Service[] = [
  { id:'package', icon:'📦', title:'Package Delivery', desc:'Send parcels and goods across the city or countrywide with real-time GPS tracking included.', tags:['Same-day available','Live GPS track','Motorbike / Van / Truck'], color:'var(--brand)', bg:'var(--brand-light)', path:'/carrier/package' },
  { id:'movers',  icon:'🚛', title:'Movers & Relocation', desc:'Moving home or office? Book professional movers with the right vehicle and trained crew.', tags:['Full packing service','AI instant quote','Insurance included'], color:'var(--info)', bg:'var(--info-light)', path:'/carrier/movers' },
  { id:'courier', icon:'✉️', title:'Document Courier', desc:'Fast, secure delivery of contracts, passports, and legal papers with digital signature confirmation.', tags:['Signature on delivery','Express 2hr','Chain of custody'], color:'var(--warning)', bg:'var(--warning-light)', path:'/carrier/courier' },
];

export default function CarrierHome() {
  const navigate = useNavigate();
  return (
    <DashboardLayout title="Carrier Services" subtitle="Packages, household moves, and document delivery">
      <AiBanner text="<strong>AI routing active.</strong> Live Nairobi traffic integrated. Average delivery time right now: 28 minutes. Light traffic on Mombasa Road." />

      <h3 className="mb-2">What do you need delivered or moved?</h3>
      <p className="text-muted text-sm mb-5">Choose a service to get an instant AI price estimate</p>

      <div className="grid-3 mb-6">
        {SERVICES.map(s => (
          <div key={s.id} className="service-card"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = s.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${s.color}22`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gray-200)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            onClick={() => navigate(s.path)}>
            <div style={{ width:60, height:60, background:s.bg, borderRadius:'var(--r)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:16 }}>{s.icon}</div>
            <h3 style={{ marginBottom:8 }}>{s.title}</h3>
            <p className="text-sm text-muted mb-4">{s.desc}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
              {s.tags.map(t => <span key={t} style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>{t}</span>)}
            </div>
            <button className="btn btn-primary btn-full" style={{ background:s.color, borderColor:s.color }}>Get started →</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">How it works</div>
        <div className="grid-4">
          {[['📍','Set locations','Pin pickup & drop-off on the live map'],['🤖','Get AI quote','Instant price based on distance and cargo'],['💳','Pay via M-Pesa','One-tap STK push payment'],['📡','Track live','Watch delivery move in real-time']].map(([ic,t,d]) => (
            <div key={t} style={{ textAlign:'center', padding:'8px 4px' }}>
              <div style={{ width:52, height:52, background:'var(--brand-light)', borderRadius:'var(--r)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px' }}>{ic}</div>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{t}</div>
              <p className="text-xs text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
