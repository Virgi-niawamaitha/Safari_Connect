import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerRoutes() {
  const toast = useToast();
  return (
    <DashboardLayout title="Routes" subtitle="Manage all service routes"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Routes action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Routes</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
