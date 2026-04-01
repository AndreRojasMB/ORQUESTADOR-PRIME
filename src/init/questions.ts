// src/init/questions.ts
// Preguntas interactivas para el CLI init.
// Cada pregunta mapea a una dimensión del proyecto.
// V2 extension: agregar preguntas por stack cuando se agreguen templates.

import {
  input,
  select,
  checkbox,
} from "@inquirer/prompts";

export interface InitAnswers {
  projectName:  string;
  projectType:  string;
  stack:        string;
  features:     string[];
  outputDir:    string;
  description:  string;
}

export async function askInitQuestions(): Promise<InitAnswers> {

  console.log("\n🤖 ORQUESTADOR-PRIME — Project Init\n");

  const projectName = await input({
    message: "Project name:",
    default: "my-project",
    validate: (v) =>
      v.trim().length > 0 ? true : "Project name cannot be empty",
  });

  const projectType = await select({
    message: "Project type:",
    choices: [
      { name: "SaaS Application",       value: "saas"      },
      { name: "REST API",               value: "api"       },
      { name: "E-Commerce",             value: "ecommerce" },
      { name: "Dashboard / Admin",      value: "dashboard" },
      { name: "Landing Page",           value: "landing"   },
      { name: "ERP System",             value: "erp"       },
      { name: "Generic / Other",        value: "generic"   },
    ],
  });

  const stack = await select({
    message: "Primary stack:",
    choices: getStackChoices(projectType),
  });

  const features = await checkbox({
    message: "Features to include:",
    choices: getFeatureChoices(projectType),
  });

  const description = await input({
    message: "Brief description (optional):",
    default: "",
  });

  const outputDir = await input({
    message: "Output directory:",
    default: `./${projectName}`,
  });

  return {
    projectName,
    projectType,
    stack,
    features,
    outputDir,
    description,
  };
}

// ─── Opciones de stack por tipo de proyecto ───────────────────────

function getStackChoices(projectType: string) {
  const stacks: Record<string, Array<{ name: string; value: string }>> = {
    saas: [
      { name: "Next.js + TypeScript",           value: "nextjs-ts"     },
      { name: "Next.js + TypeScript + Prisma",  value: "nextjs-prisma" },
      { name: "Remix + TypeScript",             value: "remix-ts"      },
    ],
    api: [
      { name: "Express + TypeScript",           value: "express-ts"    },
      { name: "Fastify + TypeScript",           value: "fastify-ts"    },
      { name: "Hono + TypeScript",              value: "hono-ts"       },
    ],
    ecommerce: [
      { name: "Next.js + TypeScript",           value: "nextjs-ts"     },
      { name: "Next.js + Medusa.js",            value: "nextjs-medusa" },
    ],
    dashboard: [
      { name: "Next.js + TypeScript",           value: "nextjs-ts"     },
      { name: "Vite + React + TypeScript",      value: "vite-react-ts" },
    ],
    landing: [
      { name: "Next.js + TypeScript",           value: "nextjs-ts"     },
      { name: "Astro + TypeScript",             value: "astro-ts"      },
      { name: "Vite + React + TypeScript",      value: "vite-react-ts" },
    ],
    erp: [
      { name: "Next.js + TypeScript + Prisma",  value: "nextjs-prisma" },
    ],
    generic: [
      { name: "Next.js + TypeScript",           value: "nextjs-ts"     },
      { name: "Express + TypeScript",           value: "express-ts"    },
      { name: "Vite + React + TypeScript",      value: "vite-react-ts" },
    ],
  };

  return stacks[projectType] ?? stacks["generic"]!;
}

// ─── Features por tipo de proyecto ───────────────────────────────

function getFeatureChoices(projectType: string) {
  const common = [
    { name: "Authentication (JWT / OAuth)",  value: "auth",          checked: true  },
    { name: "Role-based access (RBAC)",      value: "rbac",          checked: false },
    { name: "REST API",                      value: "api",           checked: true  },
    { name: "Database integration",          value: "database",      checked: true  },
    { name: "File uploads",                  value: "uploads",       checked: false },
    { name: "Email (transactional)",         value: "email",         checked: false },
    { name: "Real-time (WebSockets)",        value: "realtime",      checked: false },
    { name: "Search",                        value: "search",        checked: false },
    { name: "Analytics / tracking",         value: "analytics",     checked: false },
    { name: "Admin panel",                   value: "admin",         checked: false },
    { name: "Internationalization (i18n)",   value: "i18n",          checked: false },
    { name: "Dark mode / theming",           value: "theming",       checked: false },
    { name: "CI/CD pipeline",               value: "cicd",          checked: false },
    { name: "Docker support",               value: "docker",         checked: false },
  ];

  const extras: Record<string, Array<{ name: string; value: string; checked: boolean }>> = {
    ecommerce: [
      { name: "Payments (Stripe)",           value: "payments",      checked: true  },
      { name: "Product catalog",             value: "catalog",       checked: true  },
      { name: "Cart & checkout",             value: "cart",          checked: true  },
      { name: "Order management",            value: "orders",        checked: true  },
    ],
    saas: [
      { name: "Payments / subscriptions",    value: "payments",      checked: false },
      { name: "Multi-tenancy",              value: "multitenancy",  checked: false },
      { name: "Onboarding flow",            value: "onboarding",    checked: false },
    ],
    erp: [
      { name: "Inventory management",       value: "inventory",     checked: true  },
      { name: "Invoicing / billing",        value: "invoicing",     checked: true  },
      { name: "Reporting / BI",             value: "reporting",     checked: false },
    ],
  };

  const typeExtras = extras[projectType] ?? [];
  return [...typeExtras, ...common];
}