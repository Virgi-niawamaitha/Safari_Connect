import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Steps } from '../../components/UI';
import { requestSafe } from '../../lib/api';
import { showToast } from '../../components/UI';

export default function ConfirmBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = useMemo(() => location.state || {}, [location.state]);

  const [phoneNumber, setPhoneNumber] = useState(booking.phoneNumber || '0712345678');
  const [riskStatus, setRiskStatus] = useState('Passed — Trust score 94/100');
  const [riskColor, setRiskColor] = useState('var(--green)');
  const [checkingRisk, setCheckingRisk] = useState(false);

  const passengerName = `${booking.passenger?.firstName || 'Jane'} ${booking.passenger?.lastName || 'Mwangi'}`.trim();
  const seat = booking.selectedSeat || '14B — Economy';
  const amount = Number(booking.amount || 850);
  const route = `${booking.from || 'Nairobi'} → ${booking.to || 'Nakuru'}`;
  const date = booking.date || 'Wed 18 Mar 2026';
  const departure = booking.departure || booking.selectedTrip?.dep || '8:00 AM';
  const arrival = booking.selectedTrip?.arr || '11:30 AM';
  const duration = booking.selectedTrip?.dur || '3h 30m';
  const sacco = booking.selectedTrip?.sacco || 'Modern Coast';

  const runFraudCheck = async () => {
    setCheckingRisk(true);
    try {
      const response = await requestSafe('/ai/assist', {
        method: 'POST',
        body: JSON.stringify({
          route: route.replace(' → ', '-'),
          departureTime: new Date().toISOString(),
          currentPrice: amount,
          trips: [{ id: booking.selectedTrip?.id || 'TRIP', price: amount, travelMinutes: 210, reliabilityScore: 0.82 }],
          intent: { maxBudget: amount, maxTravelMinutes: 360 },
          riskFactors: { weatherRisk: 0.12, trafficRisk: 0.33, routeRisk: 0.18 },
          fraudSignals: {
            attemptsLast24h: 0,
            cardMismatch: false,
            rapidRetries: 0,
            geoMismatch: false
          },
          prompt: `Assess booking risk for ${passengerName} on ${route}`,
          language: 'en'
        })
      });

      const fraud = response?.data?.modules?.fraud;
      if (!fraud) return;

      if (fraud.decision === 'block') {
        setRiskStatus('High risk — verification required before payment');
        setRiskColor('var(--red)');
      } else if (fraud.decision === 'review') {
        setRiskStatus('Under review — additional checks recommended');
        setRiskColor('var(--amber)');
      } else {
        const trustScore = Math.max(0, Math.min(100, Math.round((1 - Number(fraud.fraudScore || 0)) * 100)));
        setRiskStatus(`Passed — Trust score ${trustScore}/100`);
        setRiskColor('var(--green)');
      }
    } finally {
      setCheckingRisk(false);
    }
  };

  const proceedToPayment = async () => {
    await runFraudCheck();
    navigate('/user/payment', {
      state: {
        amount,
        phoneNumber,
        bookingRef: booking.bookingRef || `SC-${Date.now().toString().slice(-8)}`,
        route,
        date,
        departure,
        arrival,
        seat,
        sacco,
        passengerName,
        idNumber: booking.passenger?.idNumber || 'N/A'
      }
    });
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Confirm booking</div></div>
      <div className="page-body">
        <Steps steps={['Search','Results','Seat','Confirm','Pay']} current={3} />
        <div className="two-col">
          <div className="card">
            <div className="card-title">Booking form</div>
            <div className="form-group"><label className="form-label">Passenger name</label><input className="form-input" value={passengerName} readOnly/></div>
            <div className="form-group"><label className="form-label">ID number</label><input className="form-input" value={booking.passenger?.idNumber || '23456789'} readOnly/></div>
            <div className="form-group"><label className="form-label">Seat number</label><input className="form-input" value={seat} readOnly/></div>
            <div className="form-group"><label className="form-label">Amount</label><input className="form-input" value={`KES ${amount}`} readOnly/></div>
            <div className="form-group"><label className="form-label">Travel date</label><input className="form-input" value={date} readOnly/></div>
            <div className="form-group"><label className="form-label">M-Pesa phone number</label><input className="form-input" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="07XX XXX XXX"/></div>
            <button className="btn btn-primary btn-full" onClick={proceedToPayment} disabled={checkingRisk}>{checkingRisk ? 'Checking AI risk...' : 'Proceed to payment →'}</button>
          </div>
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div style={{background:'var(--green)',borderRadius:10,padding:'14px 16px',marginBottom:14}}>
                <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif"}}>{route}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.8)',marginTop:3}}>{date} · {departure} departure</div>
              </div>
              {[['SACCO',sacco],['Arrives',arrival],['Duration',duration],['Seat',seat]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8}}>
                  <span style={{color:'var(--gray-400)'}}>{l}</span><span>{v}</span>
                </div>
              ))}
              <div className="sep"/>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontWeight:700}}>Total</span>
                <span style={{fontSize:18,fontWeight:800,color:'var(--green)'}}>KES {amount}</span>
              </div>
            </div>
            <div className="card card-sm">
              <div style={{fontSize:11,color:'var(--gray-400)',fontWeight:600,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>AI Fraud Check</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:riskColor,fontSize:18}}>✓</span>
                <div><div style={{fontSize:13,fontWeight:600}}>{riskStatus}</div><div style={{fontSize:11,color:'var(--gray-400)'}}>ID verified · AI checks refreshed at payment step</div></div>
              </div>
              <button className="btn btn-sm" style={{marginTop:10}} onClick={() => { runFraudCheck(); showToast('AI risk check refreshed'); }}>Refresh AI check</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}