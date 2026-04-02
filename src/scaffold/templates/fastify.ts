// src/scaffold/templates/fastify.ts

import type { StackTemplate } from "../templates.js";

export const fastifyTemplate: StackTemplate = {
  "package.json": JSON.stringify({
    name: "api",
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
    },
    dependencies: {
      fastify: "^5.0.0",
      "@fastify/cors": "^10.0.0",
      "@fastify/sensible": "^6.0.0",
      dotenv: "^16.0.0",
      zod: "^3.22.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      tsx: "^4.0.0",
      "@types/node": "^20.0.0",
    },
  }, null, 2),

  "tsconfig.json": JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      outDir: "dist",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
    },
    include: ["src"],
    exclude: ["node_modules", "dist"],
  }, null, 2),

  "src/index.ts": `import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import "dotenv/config";
import { healthRoute } from "./routes/health.js";

const app = Fastify({ logger: true });

await app.register(sensible);
await app.register(cors);
await app.register(healthRoute);

const port = Number(process.env["PORT"] ?? 3000);

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
`,

  "src/routes/health.ts": `import type { FastifyPluginAsync } from "fastify";

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
};
`,

  "src/types/index.ts": `export interface ApiResponse<T> {
  data: T;
  error?: string;
}
`,
};
