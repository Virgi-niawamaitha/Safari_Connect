import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerSeats() {
  const toast = useToast();
  return (
    <DashboardLayout title="Seat Layout & Pricing" subtitle="Configure seats per vehicle"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Seat Layout & Pricing action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Seat Layout & Pricing</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
