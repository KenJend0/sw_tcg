"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type DeckCard = {
  card: {
    id: string;
    name: string;
    set_code: string;
    type: string;
    rarity: string;
    image_url: string | null;
  };
  quantity: number;
};

type SearchResult = {
  id: string;
  name: string;
  set_code: string;
  type: string;
  rarity: string;
  image_url: string | null;
};

function useDeckValidation(cards: DeckCard[]) {
  const leaders = cards.filter((c) => c.card.type === "Leader");
  const bases = cards.filter((c) => c.card.type === "Base");
  const main = cards.filter(
    (c) => c.card.type !== "Leader" && c.card.type !== "Base"
  );
  const mainTotal = main.reduce((s, c) => s + c.quantity, 0);
  const overLimit = main.filter((c) => c.quantity > 3);

  const errors: string[] = [];
  if (leaders.length === 0) errors.push("Leader manquant");
  if (leaders.length > 1) errors.push("1 seul Leader autorisé");
  if (bases.length === 0) errors.push("Base manquante");
  if (bases.length > 1) errors.push("1 seule Base autorisée");
  if (mainTotal < 50) errors.push(`${50 - mainTotal} cartes manquantes`);
  if (mainTotal > 50) errors.push(`${mainTotal - 50} cartes en trop`);
  overLimit.forEach((c) =>
    errors.push(`"${c.card.name}" : max 3 exemplaires`)
  );

  return {
    leaders,
    bases,
    mainTotal,
    overLimit,
    errors,
    isValid: errors.length === 0,
  };
}

export default function DeckBuilder({
  deckId,
  initialCards,
}: {
  deckId: string;
  initialCards: DeckCard[];
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);

  const { leaders, bases, mainTotal, errors, isValid } =
    useDeckValidation(cards);
  const total = cards.reduce((s, c) => s + c.quantity, 0);

  async function handleSearch(value: string) {
    setSearch(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const res = await fetch(
        `/api/cards?search=${encodeURIComponent(value)}&limit=10`
      );
      const data = await res.json();
      setResults(data.data ?? []);
    });
  }

  async function addCard(card: SearchResult) {
    setLoadingCardId(card.id);
    await fetch(`/api/decks/${deckId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: card.id, quantity: 1 }),
    });
    setCards((prev) => {
      const existing = prev.find((c) => c.card.id === card.id);
      if (existing)
        return prev.map((c) =>
          c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      return [...prev, { card, quantity: 1 }].sort((a, b) =>
        a.card.name.localeCompare(b.card.name)
      );
    });
    setLoadingCardId(null);
    router.refresh();
  }

  async function changeQty(cardId: string, delta: number) {
    const item = cards.find((c) => c.card.id === cardId);
    if (!item) return;
    const newQty = item.quantity + delta;
    setLoadingCardId(cardId);
    if (newQty < 1) {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.card.id !== cardId));
    } else {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      setCards((prev) =>
        prev.map((c) =>
          c.card.id === cardId ? { ...c, quantity: newQty } : c
        )
      );
    }
    setLoadingCardId(null);
    router.refresh();
  }

  // Group cards by type for display
  const cardGroups = [
    { label: "Leader", items: cards.filter((c) => c.card.type === "Leader") },
    { label: "Base", items: cards.filter((c) => c.card.type === "Base") },
    {
      label: "Deck principal",
      items: cards
        .filter((c) => c.card.type !== "Leader" && c.card.type !== "Base")
        .sort((a, b) => a.card.name.localeCompare(b.card.name)),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Validation status */}
      <div
        className={`rounded-xl border p-3 ${
          isValid
            ? "bg-emerald-950 border-emerald-700"
            : "bg-zinc-900 border-zinc-700"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isValid
                ? "bg-emerald-500 text-white"
                : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {isValid ? "✓ Deck valide" : "Deck incomplet"}
          </span>
          <span className="text-sm font-bold text-zinc-300">
            {total} carte{total > 1 ? "s" : ""}
          </span>
        </div>

        {/* Checklist */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Rule ok={leaders.length === 1} label={`Leader (${leaders.length}/1)`} />
          <Rule ok={bases.length === 1} label={`Base (${bases.length}/1)`} />
          <Rule ok={mainTotal === 50} label={`Deck (${mainTotal}/50)`} />
          <Rule ok={true} label="Max 3×" dimmed={errors.some((e) => e.includes("max 3"))} />
        </div>

        {errors.length > 0 && (
          <ul className="mt-2 flex flex-col gap-0.5">
            {errors.map((e) => (
              <li key={e} className="text-xs text-red-400">
                • {e}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
        <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
          Ajouter une carte
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {results.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {results.map((card) => (
              <button
                key={card.id}
                onClick={() => addCard(card)}
                disabled={loadingCardId === card.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
              >
                {card.image_url && (
                  <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-zinc-700">
                    <Image
                      src={card.image_url}
                      alt={card.name}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="32px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-100 truncate">{card.name}</p>
                  <p className="text-xs text-zinc-500">
                    {card.type} · {card.set_code}
                  </p>
                </div>
                <span className="ml-auto text-yellow-400 text-lg shrink-0">+</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card list grouped by type */}
      {cardGroups.length === 0 ? (
        <p className="text-center text-zinc-600 text-sm py-8">
          Aucune carte. Recherche ci-dessus.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {cardGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {group.label}
                </p>
                {group.label === "Deck principal" && (
                  <span
                    className={`text-xs font-bold ${
                      mainTotal === 50 ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {mainTotal}/50
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map(({ card, quantity }) => {
                  const overMax =
                    card.type !== "Leader" &&
                    card.type !== "Base" &&
                    quantity > 3;
                  return (
                    <div
                      key={card.id}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                        overMax
                          ? "bg-red-950 border-red-800"
                          : "bg-zinc-900 border-zinc-800"
                      }`}
                    >
                      {card.image_url && (
                        <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-zinc-700">
                          <Image
                            src={card.image_url}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="32px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-100 truncate">
                          {card.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {card.type} · {card.set_code}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => changeQty(card.id, -1)}
                          disabled={loadingCardId === card.id}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                          −
                        </button>
                        <span
                          className={`w-6 text-center text-sm font-bold ${
                            overMax ? "text-red-400" : "text-yellow-400"
                          }`}
                        >
                          {quantity}
                        </span>
                        <button
                          onClick={() => changeQty(card.id, +1)}
                          disabled={loadingCardId === card.id}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Rule({
  ok,
  label,
  dimmed = false,
}: {
  ok: boolean;
  label: string;
  dimmed?: boolean;
}) {
  return (
    <span
      className={`text-xs flex items-center gap-1 ${
        dimmed ? "text-red-400" : ok ? "text-emerald-400" : "text-zinc-500"
      }`}
    >
      {dimmed ? "✗" : ok ? "✓" : "○"} {label}
    </span>
  );
}
