"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TYPES = ["Leader", "Base", "Unit", "Event", "Upgrade"];
const RARITIES = ["Common", "Uncommon", "Rare", "Legendary", "Special"];
const ASPECTS = ["Aggression", "Command", "Cunning", "Vigilance", "Villainy", "Heroism"];

const ASPECT_COLOR: Record<string, string> = {
  Aggression: "bg-red-900 text-red-200 border-red-700",
  Command:    "bg-green-900 text-green-200 border-green-700",
  Cunning:    "bg-yellow-900 text-yellow-200 border-yellow-700",
  Vigilance:  "bg-blue-900 text-blue-200 border-blue-700",
  Villainy:   "bg-zinc-800 text-zinc-200 border-zinc-600",
  Heroism:    "bg-white/10 text-zinc-100 border-zinc-400",
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
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clear() {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const hasActive = !!(active.set || active.type || active.rarity || active.aspect);

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Sets */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {sets.map((s) => (
          <button
            key={s.code}
            onClick={() => toggle("set", s.code)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              active.set === s.code
                ? "bg-yellow-400 text-zinc-950 border-yellow-400"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {s.code}
          </button>
        ))}
      </div>

      {/* Type + Rarity */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggle("type", t)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              active.type === t
                ? "bg-yellow-400 text-zinc-950 border-yellow-400"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="w-px shrink-0 bg-zinc-700 mx-1" />
        {RARITIES.map((r) => (
          <button
            key={r}
            onClick={() => toggle("rarity", r)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              active.rarity === r
                ? "bg-yellow-400 text-zinc-950 border-yellow-400"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Aspects */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {ASPECTS.map((a) => (
          <button
            key={a}
            onClick={() => toggle("aspect", a)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              active.aspect === a
                ? ASPECT_COLOR[a]
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {hasActive && (
        <button
          onClick={clear}
          className="self-start text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
        >
          ✕ Effacer les filtres
        </button>
      )}
    </div>
  );
}
