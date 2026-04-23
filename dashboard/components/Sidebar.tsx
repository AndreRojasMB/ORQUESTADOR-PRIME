"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: "~" },
  { label: "Runs", href: "/runs", icon: ">" },
  { label: "Agents", href: "/agents", icon: "#" },
  { label: "Config", href: "/config", icon: "*" },
  { label: "Integrations", href: "/integrations", icon: "+" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <Link href="/" className="block">
          <span className="text-sm font-bold tracking-widest text-zinc-100">
            ORQUESTADOR
          </span>
          <span className="block text-xs font-medium tracking-widest text-zinc-500">
            PRIME
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <span className="w-4 text-center font-mono text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">v24A</p>
      </div>
    </aside>
  );
}
