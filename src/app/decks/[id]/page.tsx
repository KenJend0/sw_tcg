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
      },
    },
  });

  if (!deck) notFound();

  const initialCards = deck.deck_cards.map((dc) => ({
    card: dc.card,
    quantity: dc.quantity,
  }));

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <Link
        href="/decks"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-yellow-400 mb-4 transition-colors"
      >
        ← Mes decks
      </Link>

      <h1 className="text-xl font-bold text-yellow-400 mb-4">{deck.name}</h1>

      <DeckBuilder deckId={deck.id} initialCards={initialCards} />
    </div>
  );
}
