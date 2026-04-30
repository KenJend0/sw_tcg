import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cardAspect } from "@/lib/cardUtils";

const RARITY_STYLE: Record<string, string> = {
  Common:    "border-sand-dim/30 text-sand-dim",
  Uncommon:  "border-emerald-500/40 text-emerald-400",
  Rare:      "border-holo/40 text-holo",
  Legendary: "border-burn/50 text-burn",
  Special:   "border-void/50 text-violet-400",
};

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Legendary", "Special"];

const RARITY_BAR: Record<string, string> = {
  Common:    "bg-sand-dim/40",
  Uncommon:  "bg-emerald-500",
  Rare:      "bg-holo",
  Legendary: "bg-burn",
  Special:   "bg-violet-500",
};

export default async function CollectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [items, sets, totalInDb] = await Promise.all([
    prisma.collection.findMany({
      where: { user_id: session.user.id },
      include: {
        card: {
          select: { id: true, name: true, set_code: true, type: true, rarity: true, image_url: true },
        },
      },
      orderBy: { card: { name: "asc" } },
    }),  // includes pinned field automatically
    prisma.set.findMany({
      include: { _count: { select: { cards: true } } },
      orderBy: { code: "asc" },
    }),
    prisma.card.count(),
  ]);

  const uniqueOwned  = items.length;
  const totalCopies  = items.reduce((s, i) => s + i.quantity, 0);
  const completionPct = totalInDb > 0 ? Math.round((uniqueOwned / totalInDb) * 100) : 0;

  const ownedBySet = items.reduce<Record<string, number>>((acc, { card }) => {
    acc[card.set_code] = (acc[card.set_code] ?? 0) + 1;
    return acc;
  }, {});

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

  const byRarity = items.reduce<Record<string, number>>((acc, { card }) => {
    acc[card.rarity] = (acc[card.rarity] ?? 0) + 1;
    return acc;
  }, {});

  const pinnedItems = items.filter((i) => i.pinned);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 fade-in">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs tracking-[0.3em] text-holo-dim uppercase mb-0.5">Holographic Archive</p>
        <p className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-sand tracking-wide">
          Collection
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { value: uniqueOwned.toLocaleString(), label: "Uniques",     color: "text-holo" },
          { value: totalCopies.toLocaleString(), label: "Exemplaires", color: "text-sand" },
          { value: `${completionPct}%`,           label: "Complété",   color: "text-emerald-400" },
        ].map(({ value, label, color }) => (
          <div key={label} className="rounded-xl bg-space-900 border border-space-700 p-3 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/20 to-transparent" />
            <p className={`text-2xl font-bold ${color} font-[family-name:var(--font-rajdhani)]`}>{value}</p>
            <p className="text-[10px] text-sand-dim mt-0.5 tracking-wider uppercase">{label}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sand-dim mb-3 text-sm">Aucune carte dans ta collection.</p>
          <Link href="/cards" className="text-holo hover:underline text-sm">
            Parcourir le catalogue →
          </Link>
        </div>
      ) : (
        <>
          {/* Favoris */}
          {pinnedItems.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                <span className="text-burn">★</span> Favoris
              </p>
              <div className="flex gap-3">
                {pinnedItems.map(({ card, quantity }) => (
                  <Link
                    key={card.id}
                    href={`/cards/${card.id}`}
                    className="group flex-1 max-w-[140px] holo-card rounded-xl overflow-hidden bg-space-900 border border-burn/30 hover:border-burn transition-all duration-200 relative"
                  >
                    <div className={`relative ${cardAspect(card.type)} bg-space-800`}>
                      {card.image_url ? (
                        <Image src={card.image_url} alt={card.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-200" sizes="140px" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-space-700 text-xs">—</div>
                      )}
                      <span className="absolute top-1.5 right-1.5 text-burn text-sm z-10">★</span>
                      <span className="absolute bottom-1.5 right-1.5 bg-holo text-space-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                        ×{quantity}
                      </span>
                    </div>
                    <div className="p-2 border-t border-burn/20">
                      <p className="text-xs font-semibold text-sand truncate group-hover:text-burn transition-colors">{card.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rarity breakdown */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em] mb-3">
              Par rareté
            </p>
            <div className="flex flex-wrap gap-2">
              {RARITY_ORDER.filter((r) => byRarity[r]).map((r) => (
                <span key={r} className={`text-xs px-2.5 py-1 rounded border font-medium ${RARITY_STYLE[r]}`}>
                  {byRarity[r]} {r}
                </span>
              ))}
            </div>
          </div>

          {/* Set completion */}
          <div className="mb-6">
            <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em] mb-3">
              Complétion — {setStats.length} set{setStats.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {setStats.map((s) => (
                <Link key={s.code} href={`/collection/sets/${s.code}`} className="group rounded-xl bg-space-900 border border-space-700 hover:border-holo px-3 py-2.5 relative overflow-hidden transition-all duration-150">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/10 to-transparent" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-holo shrink-0 font-[family-name:var(--font-rajdhani)]">
                        {s.code}
                      </span>
                      <span className="text-xs text-sand-dim truncate group-hover:text-sand transition-colors">{s.name}</span>
                    </div>
                    <span className="text-xs text-sand shrink-0 ml-2 tabular-nums">
                      {s.owned}/{s.total}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-space-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-holo transition-all duration-500"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="text-right text-[10px] text-sand-dim mt-0.5">{s.pct}% · <span className="text-holo/60">Voir →</span></p>
                </Link>
              ))}
            </div>
          </div>

          {/* Card grid */}
          <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em] mb-3">
            Cartes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(({ card, quantity }) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="group holo-card rounded-xl overflow-hidden bg-space-900 border border-space-700 hover:border-holo transition-all duration-200 relative"
              >
                <div className="relative bg-space-800">
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
                    <div className="absolute inset-0 flex items-center justify-center text-space-700 text-xs">—</div>
                  )}
                  <span className="absolute top-1.5 right-1.5 bg-holo text-space-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                    ×{quantity}
                  </span>
                </div>
                <div className="p-2 border-t border-space-700">
                  <p className="text-xs font-semibold text-sand truncate group-hover:text-holo transition-colors">
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
        </>
      )}
    </div>
  );
}
