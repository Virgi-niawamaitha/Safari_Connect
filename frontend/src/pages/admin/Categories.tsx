import DashboardLayout from '../../components/DashboardLayout';

import { useToast } from '../../hooks/useToast';

export default function AdminCategories() {
  const toast = useToast();
  return (
    <DashboardLayout title="Category management" subtitle="Control transport categories"
      actions={<button className="btn btn-primary btn-sm" onClick={()=>toast('Category management action done!')}>Action</button>}>
      <div className="card"><p className="text-muted">This is the <strong>Category management</strong> admin page. Connect to your backend API to populate data.</p></div>
    </DashboardLayout>
  );
}
