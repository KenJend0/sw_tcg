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
    <div className="max-w-2xl mx-auto px-3 py-4 fade-in">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs tracking-[0.3em] text-holo-dim uppercase mb-0.5">Holographic Archive</p>
        <p className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-sand tracking-wide">
          Decks
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CreateDeckForm />

        {decks.length === 0 ? (
          <p className="text-center text-sand-dim py-8 text-sm">
            Aucun deck. Crée-en un !
          </p>
        ) : (
          decks.map((deck) => {
            const total = deck.deck_cards.reduce((s, c) => s + c.quantity, 0);
            const isValid = total === 52; // 1 leader + 1 base + 50
            return (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="group flex items-center justify-between rounded-xl bg-space-900 border border-space-700 hover:border-holo px-4 py-3 transition-all duration-150 relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-sand group-hover:text-holo transition-colors tracking-wide">
                    {deck.name}
                  </p>
                  <p className="text-xs text-sand-dim mt-0.5">
                    {total} carte{total > 1 ? "s" : ""}
                    {isValid && <span className="ml-2 text-emerald-400">· Valide</span>}
                  </p>
                </div>
                <span className="text-sand-dim group-hover:text-holo transition-colors text-lg">›</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
