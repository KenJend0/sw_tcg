import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RARITY_COLOR: Record<string, string> = {
  Common: "bg-zinc-600 text-zinc-200",
  Uncommon: "bg-emerald-800 text-emerald-200",
  Rare: "bg-blue-800 text-blue-200",
  Legendary: "bg-yellow-700 text-yellow-200",
  Special: "bg-purple-800 text-purple-200",
};

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Legendary", "Special"];

export default async function CollectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [items, sets, totalInDb] = await Promise.all([
    prisma.collection.findMany({
      where: { user_id: session.user.id },
      include: {
        card: {
          select: {
            id: true,
            name: true,
            set_code: true,
            type: true,
            rarity: true,
            image_url: true,
          },
        },
      },
      orderBy: { card: { name: "asc" } },
    }),
    prisma.set.findMany({
      include: { _count: { select: { cards: true } } },
      orderBy: { code: "asc" },
    }),
    prisma.card.count(),
  ]);

  const uniqueOwned = items.length;
  const totalCopies = items.reduce((s, i) => s + i.quantity, 0);
  const completionPct = totalInDb > 0 ? Math.round((uniqueOwned / totalInDb) * 100) : 0;

  // Aggregate owned unique cards per set
  const ownedBySet = items.reduce<Record<string, number>>((acc, { card }) => {
    acc[card.set_code] = (acc[card.set_code] ?? 0) + 1;
    return acc;
  }, {});

  // Sets where user owns at least 1 card, sorted by % desc
  const setStats = sets
    .filter((s) => ownedBySet[s.code])
    .map((s) => ({
      code: s.code,
      name: s.name,
      owned: ownedBySet[s.code] ?? 0,
      total: s._count.cards,
      pct: s._count.cards > 0 ? Math.round(((ownedBySet[s.code] ?? 0) / s._count.cards) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  // Rarity breakdown
  const byRarity = items.reduce<Record<string, number>>((acc, { card }) => {
    acc[card.rarity] = (acc[card.rarity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <h1 className="text-xl font-bold text-yellow-400 mb-4">Ma Collection</h1>

      {/* Hero stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{uniqueOwned}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Uniques</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-100">{totalCopies}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Exemplaires</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completionPct}%</p>
          <p className="text-xs text-zinc-500 mt-0.5">Complété</p>
        </div>
      </div>

      {items.length > 0 && (
        <>
          {/* Rarity breakdown */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Par rareté</p>
            <div className="flex flex-wrap gap-2">
              {RARITY_ORDER.filter((r) => byRarity[r]).map((r) => (
                <span key={r} className={`text-xs px-2.5 py-1 rounded-full font-medium ${RARITY_COLOR[r]}`}>
                  {byRarity[r]} {r}
                </span>
              ))}
            </div>
          </div>

          {/* Set completion */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              Complétion par set ({setStats.length} set{setStats.length > 1 ? "s" : ""})
            </p>
            <div className="flex flex-col gap-2">
              {setStats.map((s) => (
                <div key={s.code} className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-zinc-400 shrink-0">{s.code}</span>
                      <span className="text-xs text-zinc-500 truncate">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 shrink-0 ml-2">
                      {s.owned}/{s.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="text-right text-[10px] text-zinc-600 mt-0.5">{s.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card grid */}
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Cartes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(({ card, quantity }) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="group rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-yellow-500 transition-colors relative"
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
                  <span className="absolute top-1.5 right-1.5 bg-yellow-400 text-zinc-950 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                    ×{quantity}
                  </span>
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
        </>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <p className="mb-3">Aucune carte dans ta collection.</p>
          <Link href="/cards" className="text-yellow-400 hover:underline text-sm">
            Parcourir le catalogue →
          </Link>
        </div>
      )}
    </div>
  );
}
