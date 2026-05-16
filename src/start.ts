// Importing propertyConfig runs config/property.json validation at module
// load. If invalid, the throw propagates out — see src/config/property.ts.
// Reading a field below keeps vite from tree-shaking this import
// (package.json has sideEffects: false).
//
// Note: getIcalUrl() (env loader) is intentionally NOT called here. start.ts
// is served to the browser by Vite's dev mode via the route tree's type
// imports, so anything evaluated at this file's top level runs client-side
// too. process.env.ICAL_URL is undefined in the browser, so eager
// validation would throw and break hydration. The env loader is invoked
// server-side by the iCal fetcher (Task 3) instead.
import { propertyConfig } from "./config/property";

import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const _bootProperty = propertyConfig.propertyName;
void _bootProperty;

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
