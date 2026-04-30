"use client";

import { useState } from "react";

type Deck = { id: string; name: string };

export default function AddToDeckButton({ cardId, decks }: { cardId: string; decks: Deck[] }) {
  const [selectedDeck, setSelectedDeck] = useState(decks[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (decks.length === 0) return null;

  async function handleAdd() {
    if (!selectedDeck) return;
    setLoading(true);
    await fetch(`/api/decks/${selectedDeck}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: cardId, quantity: 1 }),
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div className="flex gap-2 mt-3">
      <select
        value={selectedDeck}
        onChange={(e) => setSelectedDeck(e.target.value)}
        className="flex-1 rounded-xl bg-space-900 border border-space-700 px-3 py-2.5 text-sm text-sand outline-none focus:border-holo transition-all min-w-0"
      >
        {decks.map((d) => (
          <option key={d.id} value={d.id} className="bg-space-900">
            {d.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAdd}
        disabled={loading || done}
        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all duration-150 active:scale-[0.98] ${
          done
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            : "bg-space-900 border-burn/40 text-burn hover:bg-burn/10 disabled:opacity-50"
        }`}
      >
        {done ? "✓ Ajouté" : loading ? "..." : "+ Deck"}
      </button>
    </div>
  );
}
