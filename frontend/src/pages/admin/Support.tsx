import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminSupport() {
  const toast = useToast();
  return (
    <DashboardLayout title="Support & disputes" subtitle="Handle complaints and disputes"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Support & disputes action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Support & disputes</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
