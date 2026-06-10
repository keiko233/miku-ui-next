import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./route-tree.gen";
import { startInstance } from "./start";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => (
      <div className="grid h-dvh place-content-center">
        <p className="text-muted-foreground text-sm">Page not found</p>
      </div>
    ),
    context: { startInstance },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
