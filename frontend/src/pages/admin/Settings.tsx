import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminSettings() {
  const toast = useToast();
  return (
    <DashboardLayout title="Platform settings" subtitle="Configure AI and system settings"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Platform settings action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Platform settings</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
