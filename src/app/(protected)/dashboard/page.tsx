import UserDashboard from "./UserDashboard";
import {
  verifyClientSession,
  verifyServerSession,
} from "@/lib/data_access_layer";
import { redirect } from "next/navigation";

async function DashboardPage() {
  const session = await verifyClientSession();
  const userId = session?.userId;
  // TODO: do the user role idea and render the correct dashboard

  if (userId) {
    // probably would put this in middleware or somewhere, where if the route requires database user access
    // const serverSession = await verifyServerSession();
    // console.log("Dashboard serverSession", serverSession);
    // if (!serverSession) {
    //   return redirect("/login");
    // }
    return <UserDashboard />;
  } else {
    return redirect("/login");
  }
}

export default DashboardPage;
// export default withAuth(DashboardPage);
