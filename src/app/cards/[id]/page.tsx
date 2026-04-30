import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CollectionButton from "./CollectionButton";
import AddToDeckButton from "./AddToDeckButton";

type Props = { params: Promise<{ id: string }> };

const RARITY_STYLE: Record<string, string> = {
  Common:    "border-sand-dim/30 text-sand-dim",
  Uncommon:  "border-emerald-500/40 text-emerald-400",
  Rare:      "border-holo/40 text-holo",
  Legendary: "border-burn/50 text-burn",
  Special:   "border-void/50 text-violet-400",
};

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const [card, collectionItem, otherVersions, userDecks] = await Promise.all([
    prisma.card.findUnique({ where: { id }, include: { set: true } }),
    session?.user?.id
      ? prisma.collection.findUnique({
          where: { user_id_card_id: { user_id: session.user.id, card_id: id } },
        })
      : null,
    prisma.card.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true, set_code: true, image_url: true },
      take: 0, // filled below once we have card.name
    }),
    session?.user?.id
      ? prisma.deck.findMany({
          where: { user_id: session.user.id },
          select: { id: true, name: true },
          orderBy: { updated_at: "desc" },
        })
      : Promise.resolve([]),
  ]);

  if (!card) notFound();

  const versions = await prisma.card.findMany({
    where: { name: card.name, id: { not: card.id } },
    select: { id: true, name: true, set_code: true, image_url: true },
    take: 8,
  });

  const raw      = card.raw_data as Record<string, unknown>;
  const aspects  = Array.isArray(raw.aspects)  ? (raw.aspects  as string[]) : [];
  const traits   = Array.isArray(raw.traits)   ? (raw.traits   as string[]) : [];
  const keywords = Array.isArray(raw.keywords) ? (raw.keywords as string[]) : [];

  return (
    <div className="max-w-lg mx-auto px-3 py-4 fade-in">
      <Link
        href="/cards"
        className="inline-flex items-center gap-1.5 text-xs text-sand-dim hover:text-holo mb-5 transition-colors tracking-wider uppercase"
      >
        ← Archive
      </Link>

      {/* Hero */}
      <div className="flex gap-4 mb-6">
        <div className="holo-card relative w-36 shrink-0 rounded-xl overflow-hidden bg-space-800 border border-space-700 aspect-[63/88]">
          {card.image_url ? (
            <Image src={card.image_url} alt={card.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-space-700 text-xs">—</div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0 pt-1">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-holo-dim uppercase mb-0.5">
              {card.set?.name ?? card.set_code}
            </p>
            <h1 className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-sand leading-tight">
              {card.name}
            </h1>
            {!!raw.subtitle && (
              <p className="text-xs text-sand-dim mt-0.5 italic">{String(raw.subtitle)}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded border border-space-700 text-sand-dim">{card.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${RARITY_STYLE[card.rarity] ?? "border-space-700 text-sand-dim"}`}>
              {card.rarity}
            </span>
          </div>

          <div className="flex gap-3 text-sm">
            {raw.cost !== undefined && (
              <div className="text-center">
                <p className="text-[10px] text-sand-dim uppercase tracking-wider">Coût</p>
                <p className="font-bold text-holo">{String(raw.cost)}</p>
              </div>
            )}
            {raw.power !== undefined && (
              <div className="text-center">
                <p className="text-[10px] text-sand-dim uppercase tracking-wider">Force</p>
                <p className="font-bold text-burn">{String(raw.power)}</p>
              </div>
            )}
            {raw.hp !== undefined && (
              <div className="text-center">
                <p className="text-[10px] text-sand-dim uppercase tracking-wider">PV</p>
                <p className="font-bold text-emerald-400">{String(raw.hp)}</p>
              </div>
            )}
          </div>

          {aspects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {aspects.map((a) => (
                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-space-800 border border-holo/20 text-holo">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card text */}
      {(!!raw.front_text || !!raw.back_text) && (
        <div className="rounded-xl bg-space-900 border border-space-700 p-4 mb-3 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/30 to-transparent" />
          {!!raw.front_text && (
            <p className="text-sm text-sand/80 whitespace-pre-line leading-relaxed">{String(raw.front_text)}</p>
          )}
          {!!raw.back_text && (
            <p className="text-sm text-sand-dim whitespace-pre-line mt-2 leading-relaxed">{String(raw.back_text)}</p>
          )}
        </div>
      )}

      {/* Traits + Keywords */}
      {(traits.length > 0 || keywords.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {traits.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-space-700 text-sand-dim">{t}</span>
          ))}
          {keywords.map((k) => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-burn/10 border border-burn/30 text-burn">{k}</span>
          ))}
        </div>
      )}

      {!!raw.artist && (
        <p className="text-[10px] text-space-700 mb-4">Illustration : {String(raw.artist)}</p>
      )}

      {/* Actions */}
      {session?.user ? (
        <div className="flex flex-col gap-2">
          <CollectionButton cardId={card.id} inCollection={!!collectionItem} quantity={collectionItem?.quantity ?? 0} pinned={collectionItem?.pinned ?? false} />
          {userDecks.length > 0 && (
            <AddToDeckButton cardId={card.id} decks={userDecks} />
          )}
          {userDecks.length === 0 && (
            <Link href="/decks" className="block text-center text-xs text-sand-dim hover:text-burn transition-colors mt-1">
              Crée un deck pour ajouter cette carte →
            </Link>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="block w-full rounded-xl border border-space-700 text-sand-dim text-sm text-center py-3 hover:border-holo hover:text-holo transition-all duration-150"
        >
          Connecte-toi pour gérer ta collection
        </Link>
      )}

      {/* Autres versions */}
      {versions.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em] mb-3">
            Autres versions ({versions.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {versions.map((v) => (
              <Link
                key={v.id}
                href={`/cards/${v.id}`}
                className="shrink-0 group"
              >
                <div className="relative w-20 rounded-lg overflow-hidden bg-space-800 border border-space-700 hover:border-holo aspect-[63/88] transition-all duration-150">
                  {v.image_url ? (
                    <Image src={v.image_url} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" unoptimized sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-space-700 text-[10px]">—</div>
                  )}
                </div>
                <p className="text-[10px] text-sand-dim text-center mt-1 group-hover:text-holo transition-colors">{v.set_code}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
