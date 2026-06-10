import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/container";
import { GitHub } from "@/routes/auth/-components/github";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <Container title="Authenticate">
      <div className="grid flex-1 place-content-center">
        <div className="bg-card text-card-foreground w-96 space-y-4 rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold">Authenticate</h2>
          <GitHub />
        </div>
      </div>
    </Container>
  );
}
