import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Container } from "@/components/container";
import { getSession } from "@/lib/auth";
import { RouterButtons } from "@/routes/dashboard/-components/router-buttons";
import { UserRole } from "@/schema";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
    if (session.user.role !== UserRole.ADMIN) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <Container title="Dashboard" centerContent={<RouterButtons />}>
      <div className="mx-auto max-w-7xl p-4">
        <Outlet />
      </div>
    </Container>
  );
}
