"use client";

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

type Props = {
  sets: { code: string; name: string }[];
  active: { set: string; type: string; rarity: string; aspect: string };
};

export default function FiltersBar({ sets, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const hasActive = !!(active.set || active.type || active.rarity || active.aspect);

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
    <div className="flex flex-col gap-2 mb-4">
      {/* Sets */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {sets.map((s) => chip("set", s.code))}
      </div>

      {/* Type + Rarity */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TYPES.map((t) => chip("type", t))}
        <div className="w-px shrink-0 bg-space-700 mx-1" />
        {RARITIES.map((r) => chip("rarity", r))}
      </div>

      {/* Aspects */}
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

      {hasActive && (
        <button
          onClick={clear}
          className="self-start text-xs text-sand-dim hover:text-holo transition-colors duration-150"
        >
          ✕ Effacer les filtres
        </button>
      )}
    </div>
  );
}
