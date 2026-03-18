import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerPayments() {
  const toast = useToast();
  return (
    <DashboardLayout title="Payments" subtitle="Payment tracking and withdrawals"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Payments action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Payments</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
