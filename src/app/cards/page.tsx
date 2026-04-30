import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "./SearchBar";
import FiltersBar from "./FiltersBar";
import type { Prisma } from "@/generated/prisma/client";

const LIMIT = 20;

const RARITY_COLOR: Record<string, string> = {
  Common: "bg-zinc-600 text-zinc-200",
  Uncommon: "bg-emerald-800 text-emerald-200",
  Rare: "bg-blue-800 text-blue-200",
  Legendary: "bg-yellow-700 text-yellow-200",
  Special: "bg-purple-800 text-purple-200",
};

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    set?: string;
    type?: string;
    rarity?: string;
    aspect?: string;
  }>;
};

export default async function CardsPage({ searchParams }: Props) {
  const {
    search = "",
    page: pageParam = "1",
    set = "",
    type = "",
    rarity = "",
    aspect = "",
  } = await searchParams;

  const page = Math.max(1, Number(pageParam));
  const skip = (page - 1) * LIMIT;

  const where: Prisma.CardWhereInput = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(set ? { set_code: set } : {}),
    ...(type ? { type } : {}),
    ...(rarity ? { rarity } : {}),
    ...(aspect
      ? { raw_data: { path: ["aspects"], array_contains: aspect } }
      : {}),
  };

  const [cards, total, sets] = await Promise.all([
    prisma.card.findMany({
      where,
      select: {
        id: true,
        name: true,
        set_code: true,
        type: true,
        rarity: true,
        image_url: true,
      },
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
    if (set) params.set("set", set);
    if (type) params.set("type", type);
    if (rarity) params.set("rarity", rarity);
    if (aspect) params.set("aspect", aspect);
    params.set("page", String(p));
    return `/cards?${params.toString()}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <h1 className="text-xl font-bold text-yellow-400 mb-4">Cartes</h1>

      <div className="mb-2">
        <SearchBar defaultValue={search} />
      </div>

      <Suspense>
        <FiltersBar
          sets={sets}
          active={{ set, type, rarity, aspect }}
        />
      </Suspense>

      <p className="text-xs text-zinc-500 mb-4">
        {total} carte{total > 1 ? "s" : ""}
        {search && ` pour "${search}"`}
      </p>

      {cards.length === 0 ? (
        <p className="text-center text-zinc-500 py-16">Aucune carte trouvée.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.id}`}
              className="group rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-yellow-500 transition-colors"
            >
              <div className="relative aspect-[63/88] bg-zinc-800">
                {card.image_url ? (
                  <Image
                    src={card.image_url}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, 30vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-yellow-400 transition-colors">
                  {card.name}
                </p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-xs text-zinc-500">{card.set_code}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLOR[card.rarity] ?? "bg-zinc-700 text-zinc-300"}`}>
                    {card.rarity}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {page > 1 && (
            <Link href={pageUrl(page - 1)} className="px-4 py-2 rounded-lg bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors">
              ← Précédent
            </Link>
          )}
          <span className="text-sm text-zinc-500">{page} / {pages}</span>
          {page < pages && (
            <Link href={pageUrl(page + 1)} className="px-4 py-2 rounded-lg bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors">
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
