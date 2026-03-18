import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerSettings() {
  const toast = useToast();
  return (
    <DashboardLayout title="Settings" subtitle="SACCO profile and preferences"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Settings action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Settings</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
