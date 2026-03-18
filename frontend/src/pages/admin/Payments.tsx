import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminPayments() {
  const toast = useToast();
  return (
    <DashboardLayout title="Payments overview" subtitle="Platform-wide payment monitoring"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Payments overview action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Payments overview</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
