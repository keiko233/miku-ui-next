import Link from "next/link";
import { Container } from "@/components/container";
import { TaskButton } from "./_modules/task-button";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container title="Miku UI Download" rightContent={<TaskButton />}>
      <div className="mx-auto max-w-7xl">
        {children}

        <div className="my-4 flex justify-center gap-4 px-4">
          <Link
            href={{ pathname: "/dashboard" }}
            className="text-on-surface-variant/30 hover:text-on-surface-variant text-sm hover:underline"
          >
            Admin Dashboard
          </Link>

          <a
            className="text-on-surface-variant/30 hover:text-on-surface-variant text-sm hover:underline"
            href="https://github.com/keiko233/miku-ui-next/"
            target="_blank"
          >
            Source Code
          </a>
        </div>
      </div>
    </Container>
  );
}
