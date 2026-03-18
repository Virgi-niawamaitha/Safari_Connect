import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';


export default function OwnerSchedules() {
  const toast = useToast();
  return (
    <DashboardLayout title="Schedules / Trips" subtitle="Create and manage trip schedules"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Schedules / Trips action done!')}>Primary action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Schedules / Trips</strong> page. Connect to your backend API to populate data here.</p></div>
    </DashboardLayout>
  );
}
