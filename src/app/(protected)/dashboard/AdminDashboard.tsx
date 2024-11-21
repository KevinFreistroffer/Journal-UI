"use client";
import DashboardContainer from "@/components/ui/__layout__/DashboardContainer/DashboardContainer";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import { useAuth } from "@/hooks/useAuth";
function AdminDashboard() {
  const { isLoading } = useAuth();

  return (
    <DashboardContainer isSidebarOpen={false}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      </div>
    </DashboardContainer>
  );
}

export default AdminDashboard;
