import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { isDev } from "./consts";

const requestLogger = createMiddleware().server(async ({ next, request }) => {
  if (isDev) {
    console.log(`${request.method} ${request.url}`);
  }
  return next();
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger, csrfMiddleware],
}));
