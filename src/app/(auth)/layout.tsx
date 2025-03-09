import { Container } from "@/components/container";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container title="Dashboard">
      <div className="h-dvh-subtract-16 grid place-content-center">
        {children}
      </div>
    </Container>
  );
}
