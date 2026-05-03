import { listenViernesBridgeHttpServer } from "../src/viernesBridge/server/httpServer.ts";

async function main(): Promise<number> {
  const handle = await listenViernesBridgeHttpServer({
    env: process.env,
  });

  console.log("Viernes bridge HTTP server:");
  console.log(`- url: ${handle.url}`);
  console.log("- bind: 127.0.0.1");
  console.log(
    `- token required: ${process.env.ORQUESTADOR_VIERNES_BRIDGE_TOKEN ? "yes" : "no"}`,
  );
  console.log("- endpoint: POST /viernes/request");
  console.log("- provider writes: none");

  const shutdown = (): void => {
    handle.server.close(() => {
      process.exit(0);
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return 0;
}

process.exitCode = await main();
