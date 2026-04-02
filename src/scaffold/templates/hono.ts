// src/scaffold/templates/hono.ts

import type { StackTemplate } from "../templates.js";

export const honoTemplate: StackTemplate = {
  "package.json": JSON.stringify({
    name: "api",
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "wrangler dev src/index.ts",
      deploy: "wrangler deploy",
      "dev:node": "tsx watch src/index.ts",
    },
    dependencies: {
      hono: "^4.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      tsx: "^4.0.0",
      wrangler: "^3.0.0",
      "@types/node": "^20.0.0",
    },
  }, null, 2),

  "tsconfig.json": JSON.stringify({
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      skipLibCheck: true,
      lib: ["ESNext"],
      types: ["@cloudflare/workers-types"],
      jsx: "react-jsx",
      jsxImportSource: "hono/jsx",
    },
    include: ["src"],
    exclude: ["node_modules"],
  }, null, 2),

  "wrangler.toml": `name = "api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
`,

  "src/index.ts": `import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.route("/", health);

export default app;
`,

  "src/routes/health.ts": `import { Hono } from "hono";

export const health = new Hono();

health.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);
`,

  "src/types/index.ts": `export interface ApiResponse<T> {
  data: T;
  error?: string;
}
`,
};
