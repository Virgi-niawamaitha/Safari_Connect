import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerCustomers() {
  const toast = useToast();
  return (
    <DashboardLayout title="Customers" subtitle="Passenger data and history"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Customers action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Customers</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
