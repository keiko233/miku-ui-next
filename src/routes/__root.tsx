import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { startInstance as StartInstance } from "@/start";

import "@/styles/globals.css";

type RouterContext = { startInstance: typeof StartInstance };

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Miku UI" },
      {
        name: "description",
        content: "Third-party Miku UI download sites",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
