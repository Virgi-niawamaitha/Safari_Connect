import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminSaccos() {
  const toast = useToast();
  return (
    <DashboardLayout title="SACCO management" subtitle="Approve and manage operators"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('SACCO management action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>SACCO management</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
