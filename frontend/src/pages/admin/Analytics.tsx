import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminAnalytics() {
  const toast = useToast();
  return (
    <DashboardLayout title="Reports & analytics" subtitle="Platform-wide performance"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Reports & analytics action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Reports & analytics</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
