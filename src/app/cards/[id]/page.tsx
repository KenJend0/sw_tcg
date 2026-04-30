import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CollectionButton from "./CollectionButton";

type Props = {
  params: Promise<{ id: string }>;
};

const RARITY_COLOR: Record<string, string> = {
  Common: "bg-zinc-600 text-zinc-200",
  Uncommon: "bg-emerald-800 text-emerald-200",
  Rare: "bg-blue-800 text-blue-200",
  Legendary: "bg-yellow-700 text-yellow-200",
  Special: "bg-purple-800 text-purple-200",
};

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const [card, collectionItem] = await Promise.all([
    prisma.card.findUnique({ where: { id }, include: { set: true } }),
    session?.user?.id
      ? prisma.collection.findUnique({
          where: { user_id_card_id: { user_id: session.user.id, card_id: id } },
        })
      : null,
  ]);

  if (!card) notFound();

  const raw = card.raw_data as Record<string, unknown>;

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <Link
        href="/cards"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-yellow-400 mb-4 transition-colors"
      >
        ← Retour
      </Link>

      <div className="flex gap-4">
        <div className="relative w-36 shrink-0 rounded-xl overflow-hidden bg-zinc-800 aspect-[63/88]">
          {card.image_url ? (
            <Image
              src={card.image_url}
              alt={card.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-lg font-bold text-yellow-400 leading-tight">
            {card.name}
          </h1>
          {raw.subtitle && (
            <p className="text-sm text-zinc-400 -mt-1">{String(raw.subtitle)}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              {card.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RARITY_COLOR[card.rarity] ?? "bg-zinc-700 text-zinc-300"}`}>
              {card.rarity}
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-500">Set </span>
            {card.set?.name ?? card.set_code}
          </p>
          {raw.cost !== undefined && (
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Coût </span>{String(raw.cost)}
            </p>
          )}
          {raw.power !== undefined && raw.hp !== undefined && (
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Force / PV </span>
              {String(raw.power)} / {String(raw.hp)}
            </p>
          )}
        </div>
      </div>

      {(raw.front_text || raw.back_text) && (
        <div className="mt-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          {raw.front_text && (
            <p className="text-sm text-zinc-300 whitespace-pre-line">{String(raw.front_text)}</p>
          )}
          {raw.back_text && (
            <p className="text-sm text-zinc-400 whitespace-pre-line mt-2">{String(raw.back_text)}</p>
          )}
        </div>
      )}

      {Array.isArray(raw.aspects) && raw.aspects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(raw.aspects as string[]).map((a) => (
            <span key={a} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              {a}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(raw.traits) && raw.traits.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(raw.traits as string[]).map((t) => (
            <span key={t} className="text-xs bg-zinc-800/50 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
              {t}
            </span>
          ))}
        </div>
      )}

      {raw.artist && (
        <p className="mt-4 text-xs text-zinc-600">Illustration : {String(raw.artist)}</p>
      )}

      {session?.user ? (
        <CollectionButton
          cardId={card.id}
          inCollection={!!collectionItem}
          quantity={collectionItem?.quantity ?? 0}
        />
      ) : (
        <Link
          href="/login"
          className="block w-full mt-4 rounded-xl border border-zinc-700 text-zinc-400 text-sm text-center py-3 hover:border-yellow-400 hover:text-yellow-400 transition-colors"
        >
          Connecte-toi pour gérer ta collection
        </Link>
      )}
    </div>
  );
}
