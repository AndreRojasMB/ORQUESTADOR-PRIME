import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

requireEnv("OPENAI_API_KEY");

export const MODELS = {
  planner: process.env.PLANNER_MODEL || "gpt-5.4",
  specialist: process.env.SPECIALIST_MODEL || "gpt-5.4",
  synthesis: process.env.SYNTHESIS_MODEL || "gpt-5.4",
};

export { requireEnv };