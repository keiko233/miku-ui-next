import { Container } from "@/components/container";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container title="Dashboard">
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </Container>
  );
}
