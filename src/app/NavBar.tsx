"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/cards",      icon: "⬡", label: "Archive" },
  { href: "/collection", icon: "◈", label: "Collection" },
  { href: "/decks",      icon: "◧", label: "Decks" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex border-t border-space-800 bg-space-950/95 backdrop-blur-sm">
      {NAV.map(({ href, icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-150 ${
              active ? "text-holo" : "text-sand-dim hover:text-sand"
            }`}
          >
            <span
              className={`text-lg leading-none transition-all duration-150 ${
                active ? "drop-shadow-[0_0_6px_#5BC0EB]" : ""
              }`}
            >
              {icon}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-widest uppercase ${
                active ? "font-[family-name:var(--font-rajdhani)]" : ""
              }`}
            >
              {label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-holo rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
