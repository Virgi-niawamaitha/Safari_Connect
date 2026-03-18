import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerBookings() {
  const toast = useToast();
  return (
    <DashboardLayout title="Bookings" subtitle="All passenger reservations"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Bookings action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Bookings</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
