"use client";
import { PageContainer } from "@/components/ui/__layout__/PageContainer/PageContainer";
import { useAuth } from "@/hooks/useAuth";
function AdminDashboard() {
  const { isLoading } = useAuth();

  return (
    <PageContainer>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      </div>
    </PageContainer>
  );
}

export default AdminDashboard;
