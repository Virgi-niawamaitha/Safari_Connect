import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge } from '../../components/UI';
import type { BadgeVariant } from '../../types';

interface BookingRow {
  ref: string; route: string; sacco: string;
  date: string; seat: string; fare: string;
  status: string; variant: BadgeVariant;
}

const BOOKINGS: BookingRow[] = [
  { ref:'SC-2026-00892', route:'Nairobi → Nakuru',   sacco:'Modern Coast', date:'18 Mar 2026', seat:'14B Economy', fare:'KES 850',   status:'Upcoming',  variant:'amber' },
  { ref:'SC-2026-00788', route:'Nairobi → Mombasa',  sacco:'Easy Coach',   date:'20 Mar 2026', seat:'5A VIP',      fare:'KES 2,200', status:'Confirmed', variant:'green' },
  { ref:'SC-2026-00541', route:'Nairobi → Kisumu',   sacco:'Modern Coast', date:'10 Mar 2026', seat:'22C Economy', fare:'KES 1,100', status:'Completed', variant:'gray'  },
  { ref:'SC-2026-00399', route:'Nairobi → Nakuru',   sacco:'Eldoret Exp',  date:'2 Mar 2026',  seat:'8A Business', fare:'KES 1,200', status:'Completed', variant:'gray'  },
  { ref:'SC-2026-00211', route:'Nairobi → Eldoret',  sacco:'Easy Coach',   date:'14 Feb 2026', seat:'3C Economy',  fare:'KES 900',   status:'Completed', variant:'gray'  },
];

export default function MyBookings() {
  const navigate = useNavigate();
  return (
    <DashboardLayout
      title="My bookings"
      subtitle="All your trip history and upcoming journeys"
      actions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/passenger/search')}>+ Book new trip</button>}
    >
      <div className="table-wrap">
        <table className="sc-table">
          <thead>
            <tr>
              <th>Booking ref</th><th>Route</th><th>SACCO</th><th>Date</th>
              <th>Seat</th><th>Fare</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map(b => (
              <tr key={b.ref}>
                <td className="td-primary">{b.ref}</td>
                <td style={{ fontWeight:500 }}>{b.route}</td>
                <td>{b.sacco}</td>
                <td>{b.date}</td>
                <td>{b.seat}</td>
                <td style={{ fontWeight:600 }}>{b.fare}</td>
                <td><Badge variant={b.variant}>{b.status}</Badge></td>
                <td>
                  <button className="btn btn-sm" onClick={() => navigate('/passenger/ticket')}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
