import { AdminAuthWrapper } from "@/components/admin/admin-auth-wrapper"
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content"

export default function AdminDashboard() {
  return (
    <AdminAuthWrapper>
      <AdminDashboardContent />
    </AdminAuthWrapper>
  )
}

