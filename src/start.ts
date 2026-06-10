import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";

const requestLogger = createMiddleware().server(async ({ next, request }) => {
  console.log(`${request.method} ${request.url}`);
  return next();
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger, csrfMiddleware],
}));
