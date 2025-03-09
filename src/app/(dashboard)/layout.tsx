import { Container } from "@/components/container";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/schema";
import { RouterButtons } from "./dashboard/_modules/router-buttons";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (session?.user.role !== UserRole.ADMIN) {
    return (
      <div className="grid h-dvh place-content-center">
        <h1 className="dark:text-surface text-3xl font-bold">
          Permission Denied
        </h1>
      </div>
    );
  }

  return (
    <Container title="Dashboard" centerContent={<RouterButtons />}>
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </Container>
  );
}
