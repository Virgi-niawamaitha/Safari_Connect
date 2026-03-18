import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerAnalytics() {
  const toast = useToast();
  return (
    <DashboardLayout title="Analytics" subtitle="Performance insights"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Analytics action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Analytics</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
