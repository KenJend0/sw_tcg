"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TYPES    = ["Leader", "Base", "Unit", "Event", "Upgrade"];
const RARITIES = ["Common", "Uncommon", "Rare", "Legendary", "Special"];
const ASPECTS  = ["Aggression", "Command", "Cunning", "Vigilance", "Villainy", "Heroism"];

const ASPECT_STYLE: Record<string, string> = {
  Aggression: "border-red-600/60 text-red-400 bg-red-950/40",
  Command:    "border-emerald-600/60 text-emerald-400 bg-emerald-950/40",
  Cunning:    "border-yellow-600/60 text-yellow-400 bg-yellow-950/40",
  Vigilance:  "border-holo/60 text-holo bg-holo/10",
  Villainy:   "border-sand-dim/40 text-sand-dim bg-space-800/60",
  Heroism:    "border-sand/30 text-sand bg-space-800/60",
};

type Active = { set: string; type: string; rarity: string; aspect: string };
type Props  = { sets: { code: string; name: string }[]; active: Active };

export default function FiltersBar({ sets, active }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeCount = [active.set, active.type, active.rarity, active.aspect].filter(Boolean).length;

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clear() {
    const params = new URLSearchParams();
    const s = searchParams.get("search");
    if (s) params.set("search", s);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const chip = (key: string, value: string, activeStyle?: string) => {
    const isActive = (active as Record<string, string>)[key] === value;
    return (
      <button
        key={value}
        onClick={() => toggle(key, value)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 ${
          isActive
            ? activeStyle ?? "bg-holo text-space-950 border-holo"
            : "bg-space-900 text-sand-dim border-space-700 hover:border-holo/50 hover:text-sand"
        }`}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition-all duration-150 ${
            open || activeCount > 0
              ? "bg-space-900 border-holo/40 text-holo"
              : "bg-space-900 border-space-700 text-sand-dim hover:border-holo/40 hover:text-sand"
          }`}
        >
          <span>{open ? "▲" : "▼"}</span>
          Filtres
          {activeCount > 0 && (
            <span className="bg-holo text-space-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clear}
            className="text-xs text-sand-dim hover:text-holo transition-colors duration-150"
          >
            ✕ Effacer
          </button>
        )}
      </div>

      {/* Collapsible panel */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-xl bg-space-900 border border-space-700 p-3 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/20 to-transparent" />

          {/* Sets */}
          <div>
            <p className="text-[10px] text-sand-dim uppercase tracking-widest mb-1.5">Set</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {sets.map((s) => chip("set", s.code))}
            </div>
          </div>

          {/* Type + Rarity */}
          <div>
            <p className="text-[10px] text-sand-dim uppercase tracking-widest mb-1.5">Type · Rareté</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TYPES.map((t) => chip("type", t))}
              <div className="w-px shrink-0 bg-space-700 mx-1" />
              {RARITIES.map((r) => chip("rarity", r))}
            </div>
          </div>

          {/* Aspects */}
          <div>
            <p className="text-[10px] text-sand-dim uppercase tracking-widest mb-1.5">Aspect</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {ASPECTS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggle("aspect", a)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 ${
                    active.aspect === a
                      ? ASPECT_STYLE[a]
                      : "bg-space-900 text-sand-dim border-space-700 hover:border-holo/50 hover:text-sand"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
