import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "./SearchBar";
import FiltersBar from "./FiltersBar";
import type { Prisma } from "@prisma/client";

const LIMIT = 20;

const RARITY_STYLE: Record<string, string> = {
  Common:    "border-sand-dim/30 text-sand-dim",
  Uncommon:  "border-emerald-500/40 text-emerald-400",
  Rare:      "border-holo/40 text-holo",
  Legendary: "border-burn/50 text-burn",
  Special:   "border-void/50 text-violet-400",
};

type Props = {
  searchParams: Promise<{
    search?: string; page?: string;
    set?: string; type?: string; rarity?: string; aspect?: string;
  }>;
};

export default async function CardsPage({ searchParams }: Props) {
  const {
    search = "", page: pageParam = "1",
    set = "", type = "", rarity = "", aspect = "",
  } = await searchParams;

  const page = Math.max(1, Number(pageParam));
  const skip = (page - 1) * LIMIT;

  const where: Prisma.CardWhereInput = {
    ...(search  ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(set     ? { set_code: set }  : {}),
    ...(type    ? { type }           : {}),
    ...(rarity  ? { rarity }         : {}),
    ...(aspect  ? { raw_data: { path: ["aspects"], array_contains: aspect } } : {}),
  };

  const [cards, total, sets] = await Promise.all([
    prisma.card.findMany({
      where,
      select: { id: true, name: true, set_code: true, type: true, rarity: true, image_url: true },
      orderBy: { name: "asc" },
      skip,
      take: LIMIT,
    }),
    prisma.card.count({ where }),
    prisma.set.findMany({ select: { code: true, name: true }, orderBy: { code: "asc" } }),
  ]);

  const pages = Math.ceil(total / LIMIT);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (set)    params.set("set", set);
    if (type)   params.set("type", type);
    if (rarity) params.set("rarity", rarity);
    if (aspect) params.set("aspect", aspect);
    params.set("page", String(p));
    return `/cards?${params.toString()}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xs tracking-[0.3em] text-holo-dim uppercase mb-0.5">
          Holographic Archive
        </h1>
        <p className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-sand tracking-wide">
          Catalogue
        </p>
      </div>

      <div className="mb-2">
        <SearchBar defaultValue={search} />
      </div>

      <Suspense>
        <FiltersBar sets={sets} active={{ set, type, rarity, aspect }} />
      </Suspense>

      <p className="text-xs text-sand-dim mb-4">
        {total.toLocaleString()} carte{total > 1 ? "s" : ""}
        {search && <span className="text-holo"> · "{search}"</span>}
      </p>

      {cards.length === 0 ? (
        <p className="text-center text-sand-dim py-16 text-sm">
          Aucune carte trouvée.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 fade-in">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.id}`}
              className="group holo-card rounded-xl overflow-hidden bg-space-900 border border-space-700 hover:border-holo hover:glow-holo transition-all duration-200"
            >
              <div className="relative aspect-[63/88] bg-space-800">
                {card.image_url ? (
                  <Image
                    src={card.image_url}
                    alt={card.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 45vw, 30vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-space-700 text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-space-700">
                <p className="text-xs font-semibold text-sand truncate group-hover:text-holo transition-colors duration-150">
                  {card.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-sand-dim">{card.set_code}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${RARITY_STYLE[card.rarity] ?? "border-space-700 text-sand-dim"}`}>
                    {card.rarity}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          {page > 1 && (
            <Link href={pageUrl(page - 1)} className="px-4 py-2 rounded-lg bg-space-900 border border-space-700 text-sm text-sand-dim hover:border-holo hover:text-holo transition-all duration-150">
              ← Précédent
            </Link>
          )}
          <span className="text-xs text-sand-dim tabular-nums">{page} / {pages}</span>
          {page < pages && (
            <Link href={pageUrl(page + 1)} className="px-4 py-2 rounded-lg bg-space-900 border border-space-700 text-sm text-sand-dim hover:border-holo hover:text-holo transition-all duration-150">
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
