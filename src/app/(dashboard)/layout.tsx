import { Container } from "@/components/container";
import { RouterButtons } from "./dashboard/_modules/router-buttons";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container title="Dashboard" centerContent={<RouterButtons />}>
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </Container>
  );
}
