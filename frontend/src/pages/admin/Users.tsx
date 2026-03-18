import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminUsers() {
  const toast = useToast();
  return (
    <DashboardLayout title="User management" subtitle="Monitor all platform users"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('User management action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>User management</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
