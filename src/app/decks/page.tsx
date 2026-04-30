import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateDeckForm from "./CreateDeckForm";

export default async function DecksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const decks = await prisma.deck.findMany({
    where: { user_id: session.user.id },
    include: { deck_cards: { select: { quantity: true } } },
    orderBy: { updated_at: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <h1 className="text-xl font-bold text-yellow-400 mb-4">Mes Decks</h1>

      <div className="flex flex-col gap-3">
        <CreateDeckForm />

        {decks.length === 0 ? (
          <p className="text-center text-zinc-500 py-8 text-sm">
            Aucun deck. Crée-en un !
          </p>
        ) : (
          decks.map((deck) => {
            const total = deck.deck_cards.reduce((s, c) => s + c.quantity, 0);
            return (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500 px-4 py-3 transition-colors"
              >
                <div>
                  <p className="font-semibold text-zinc-100">{deck.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {total} carte{total > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-zinc-600 text-lg">›</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
