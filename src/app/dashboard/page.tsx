import UserDashboard from "./UserDashboard";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

async function DashboardPage() {
  const session = await verifySession();
  const userId = session?.userId;
  // TODO: do the user role idea and render the correct dashboard

  if (userId) {
    return <UserDashboard />;
  } else {
    redirect("/login");
  }
}

export default DashboardPage;
// export default withAuth(DashboardPage);
