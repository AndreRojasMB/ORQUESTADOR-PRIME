import type { AgentDomain, AgentTier } from "@/lib/types";

const MODE_COLORS: Record<string, string> = {
  plan: "bg-blue-900/50 text-blue-300",
  route: "bg-purple-900/50 text-purple-300",
  blueprint: "bg-cyan-900/50 text-cyan-300",
  audit: "bg-amber-900/50 text-amber-300",
  scaffold: "bg-green-900/50 text-green-300",
  execute: "bg-red-900/50 text-red-300",
  memory: "bg-zinc-700/50 text-zinc-300",
  init: "bg-zinc-700/50 text-zinc-300",
  chat: "bg-zinc-700/50 text-zinc-300",
};

const DOMAIN_COLORS: Record<AgentDomain, string> = {
  architecture: "bg-blue-900/50 text-blue-300",
  frontend: "bg-cyan-900/50 text-cyan-300",
  backend: "bg-green-900/50 text-green-300",
  quality: "bg-amber-900/50 text-amber-300",
  data: "bg-purple-900/50 text-purple-300",
  security: "bg-red-900/50 text-red-300",
  infrastructure: "bg-orange-900/50 text-orange-300",
  integration: "bg-pink-900/50 text-pink-300",
  design: "bg-violet-900/50 text-violet-300",
  ai: "bg-emerald-900/50 text-emerald-300",
};

const TIER_COLORS: Record<AgentTier, string> = {
  core: "bg-zinc-700/50 text-zinc-200",
  specialized: "bg-zinc-700/50 text-zinc-300",
  advanced: "bg-zinc-700/50 text-zinc-300",
  design: "bg-zinc-700/50 text-zinc-300",
};

interface BadgeProps {
  children: string;
  variant?: "mode" | "domain" | "tier" | "tag";
}

export function Badge({ children, variant = "tag" }: BadgeProps) {
  let colorClass = "bg-zinc-800 text-zinc-400";

  if (variant === "mode") {
    colorClass = MODE_COLORS[children] ?? colorClass;
  } else if (variant === "domain") {
    colorClass = DOMAIN_COLORS[children as AgentDomain] ?? colorClass;
  } else if (variant === "tier") {
    colorClass = TIER_COLORS[children as AgentTier] ?? colorClass;
  }

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {children}
    </span>
  );
}
