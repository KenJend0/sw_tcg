import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ code: string }> };

const RARITY_STYLE: Record<string, string> = {
  Common:    "border-sand-dim/30 text-sand-dim",
  Uncommon:  "border-emerald-500/40 text-emerald-400",
  Rare:      "border-holo/40 text-holo",
  Legendary: "border-burn/50 text-burn",
  Special:   "border-void/50 text-violet-400",
};

export default async function SetCollectionPage({ params }: Props) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [set, allCards, ownedItems] = await Promise.all([
    prisma.set.findUnique({ where: { code } }),
    prisma.card.findMany({
      where: { set_code: code },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, rarity: true, image_url: true },
    }),
    prisma.collection.findMany({
      where: { user_id: session.user.id, card: { set_code: code } },
      select: { card_id: true, quantity: true },
    }),
  ]);

  if (!set) notFound();

  const ownedMap = new Map(ownedItems.map((i) => [i.card_id, i.quantity]));
  const ownedCount = ownedMap.size;
  const pct = allCards.length > 0 ? Math.round((ownedCount / allCards.length) * 100) : 0;

  // Group by type
  const groups = ["Leader", "Base", "Unit", "Event", "Upgrade"].map((type) => ({
    type,
    cards: allCards.filter((c) => c.type === type),
  })).filter((g) => g.cards.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 fade-in">
      <Link
        href="/collection"
        className="inline-flex items-center gap-1.5 text-xs text-sand-dim hover:text-holo mb-5 transition-colors tracking-wider uppercase"
      >
        ← Collection
      </Link>

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs tracking-[0.3em] text-holo-dim uppercase mb-0.5">Set</p>
        <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-sand tracking-wide">
          {set.name}
        </h1>
        <p className="text-xs text-sand-dim mt-0.5">{set.code}</p>
      </div>

      {/* Completion bar */}
      <div className="rounded-xl bg-space-900 border border-space-700 p-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/20 to-transparent" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-sand">Complétion</span>
          <span className="font-[family-name:var(--font-rajdhani)] font-bold text-holo text-lg">
            {ownedCount}/{allCards.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-space-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-holo transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-sand-dim mt-1">{pct}%</p>
      </div>

      {/* Cards grouped by type */}
      {groups.map(({ type, cards }) => (
        <div key={type} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em]">{type}</p>
            <p className="text-[10px] text-sand-dim">
              {cards.filter((c) => ownedMap.has(c.id)).length}/{cards.length}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cards.map((card) => {
              const qty = ownedMap.get(card.id);
              const owned = qty !== undefined;
              return (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className={`group rounded-xl overflow-hidden border transition-all duration-200 ${
                    owned
                      ? "bg-space-900 border-space-700 hover:border-holo"
                      : "bg-space-950 border-space-800 opacity-40 hover:opacity-60"
                  }`}
                >
                  <div className="relative aspect-[63/88] bg-space-800">
                    {card.image_url ? (
                      <Image
                        src={card.image_url}
                        alt={card.name}
                        fill
                        className={`object-cover transition-all duration-200 ${
                          owned ? "group-hover:scale-[1.03]" : "grayscale"
                        }`}
                        sizes="(max-width: 640px) 45vw, 30vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-space-700 text-xs">—</div>
                    )}
                    {owned && (
                      <span className="absolute top-1.5 right-1.5 bg-holo text-space-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                        ×{qty}
                      </span>
                    )}
                  </div>
                  <div className="p-2 border-t border-space-700/50">
                    <p className={`text-xs font-semibold truncate transition-colors ${
                      owned ? "text-sand group-hover:text-holo" : "text-sand-dim"
                    }`}>
                      {card.name}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium mt-1 inline-block ${
                      RARITY_STYLE[card.rarity] ?? "border-space-700 text-sand-dim"
                    }`}>
                      {card.rarity}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
