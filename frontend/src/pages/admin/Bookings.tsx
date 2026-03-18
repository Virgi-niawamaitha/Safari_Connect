import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminBookings() {
  const toast = useToast();
  return (
    <DashboardLayout title="Booking oversight" subtitle="All bookings across all SACCOs"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Booking oversight action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Booking oversight</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
