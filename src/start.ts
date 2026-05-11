// Importing propertyConfig runs config/property.json validation at module load.
// If invalid, the throw propagates out and the server fails fast — see
// src/config/property.ts for rationale. Reading a field below keeps vite from
// tree-shaking this import (package.json has sideEffects: false).
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
