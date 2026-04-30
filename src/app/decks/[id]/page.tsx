import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DeckBuilder from "./DeckBuilder";

type Props = { params: Promise<{ id: string }> };

export default async function DeckPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deck = await prisma.deck.findUnique({
    where: { id, user_id: session.user.id },
    include: {
      deck_cards: {
        include: {
          card: {
            select: { id: true, name: true, set_code: true, type: true, rarity: true, image_url: true },
          },
        },
        orderBy: { card: { name: "asc" } },
      },
    },
  });

  if (!deck) notFound();

  const initialCards = deck.deck_cards.map((dc) => ({
    card: dc.card,
    quantity: dc.quantity,
  }));

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 fade-in">
      <Link
        href="/decks"
        className="inline-flex items-center gap-1.5 text-xs text-sand-dim hover:text-holo mb-5 transition-colors tracking-wider uppercase"
      >
        ← Mes decks
      </Link>

      <div className="mb-5">
        <p className="text-xs tracking-[0.3em] text-holo-dim uppercase mb-0.5">Deck Builder</p>
        <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-sand tracking-wide">
          {deck.name}
        </h1>
      </div>

      <DeckBuilder deckId={deck.id} initialCards={initialCards} />
    </div>
  );
}
