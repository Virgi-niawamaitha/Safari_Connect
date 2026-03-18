import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerFleet() {
  const toast = useToast();
  return (
    <DashboardLayout title="Fleet / Vehicles" subtitle="Manage all registered vehicles"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Fleet / Vehicles action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Fleet / Vehicles</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
