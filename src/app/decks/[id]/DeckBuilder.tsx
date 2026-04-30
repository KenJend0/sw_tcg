"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type DeckCard = {
  card: {
    id: string; name: string; set_code: string;
    type: string; rarity: string; image_url: string | null;
  };
  quantity: number;
};

type SearchResult = {
  id: string; name: string; set_code: string;
  type: string; rarity: string; image_url: string | null;
};

function useDeckValidation(cards: DeckCard[]) {
  const leaders   = cards.filter((c) => c.card.type === "Leader");
  const bases     = cards.filter((c) => c.card.type === "Base");
  const main      = cards.filter((c) => c.card.type !== "Leader" && c.card.type !== "Base");
  const mainTotal = main.reduce((s, c) => s + c.quantity, 0);
  const overLimit = main.filter((c) => c.quantity > 3);

  const errors: string[] = [];
  if (leaders.length === 0) errors.push("Leader manquant");
  if (leaders.length > 1)   errors.push("1 seul Leader autorisé");
  if (bases.length === 0)   errors.push("Base manquante");
  if (bases.length > 1)     errors.push("1 seule Base autorisée");
  if (mainTotal < 50)       errors.push(`${50 - mainTotal} carte${50 - mainTotal > 1 ? "s" : ""} manquante${50 - mainTotal > 1 ? "s" : ""}`);
  if (mainTotal > 50)       errors.push(`${mainTotal - 50} carte${mainTotal - 50 > 1 ? "s" : ""} en trop`);
  overLimit.forEach((c) => errors.push(`"${c.card.name}" : max 3×`));

  return { leaders, bases, mainTotal, errors, isValid: errors.length === 0 };
}

function CardRow({
  card, quantity, overMax, loading, onMinus, onPlus,
}: {
  card: DeckCard["card"]; quantity: number; overMax: boolean;
  loading: boolean; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
      overMax ? "bg-alert/10 border-alert/40" : "bg-space-900 border-space-700"
    }`}>
      {card.image_url && (
        <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-space-800">
          <Image src={card.image_url} alt={card.name} fill className="object-cover" unoptimized sizes="32px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-sand truncate">{card.name}</p>
        <p className="text-xs text-sand-dim">{card.type} · {card.set_code}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMinus}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-space-800 border border-space-700 hover:border-holo text-sand-dim font-bold text-sm disabled:opacity-50 transition-all"
        >
          −
        </button>
        <span className={`w-6 text-center text-sm font-bold tabular-nums ${overMax ? "text-alert" : "text-holo"}`}>
          {quantity}
        </span>
        <button
          onClick={onPlus}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-space-800 border border-space-700 hover:border-holo text-sand-dim font-bold text-sm disabled:opacity-50 transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function DeckBuilder({
  deckId, initialCards,
}: {
  deckId: string; initialCards: DeckCard[];
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);

  const { leaders, bases, mainTotal, errors, isValid } = useDeckValidation(cards);

  async function handleSearch(value: string) {
    setSearch(value);
    if (!value.trim()) { setResults([]); return; }
    startTransition(async () => {
      const res = await fetch(`/api/cards?search=${encodeURIComponent(value)}&limit=10`);
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
      if (existing) return prev.map((c) => c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { card, quantity: 1 }].sort((a, b) => a.card.name.localeCompare(b.card.name));
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
      setCards((prev) => prev.map((c) => c.card.id === cardId ? { ...c, quantity: newQty } : c));
    }
    setLoadingCardId(null);
    router.refresh();
  }

  const groups = [
    { label: "Leader",         count: leaders.reduce((s,c)=>s+c.quantity,0),     need: "1/1",  items: cards.filter((c) => c.card.type === "Leader") },
    { label: "Base",           count: bases.reduce((s,c)=>s+c.quantity,0),       need: "1/1",  items: cards.filter((c) => c.card.type === "Base") },
    { label: "Deck principal", count: mainTotal, need: `${mainTotal}/50`, items: cards.filter((c) => c.card.type !== "Leader" && c.card.type !== "Base").sort((a,b) => a.card.name.localeCompare(b.card.name)) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Validation panel */}
      <div className={`rounded-xl border p-3 relative overflow-hidden transition-colors duration-300 ${
        isValid ? "bg-emerald-950/30 border-emerald-700/40" : "bg-space-900 border-space-700"
      }`}>
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${isValid ? "via-emerald-400/40" : "via-holo/20"} to-transparent`} />
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border font-[family-name:var(--font-rajdhani)] tracking-wide ${
            isValid
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-space-800 border-space-700 text-sand-dim"
          }`}>
            {isValid ? "✓ Deck valide" : "Deck incomplet"}
          </span>
          <span className="text-sm font-bold text-sand tabular-nums">
            {cards.reduce((s,c)=>s+c.quantity,0)} cartes
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { ok: leaders.length === 1, label: `Leader ${leaders.length}/1` },
            { ok: bases.length === 1,   label: `Base ${bases.length}/1` },
            { ok: mainTotal === 50,     label: `Deck ${mainTotal}/50` },
          ].map(({ ok, label }) => (
            <span key={label} className={`text-xs flex items-center gap-1 ${ok ? "text-emerald-400" : "text-sand-dim"}`}>
              {ok ? "✓" : "○"} {label}
            </span>
          ))}
        </div>
        {errors.length > 0 && (
          <ul className="mt-2 flex flex-col gap-0.5">
            {errors.map((e) => (
              <li key={e} className="text-xs text-alert/80">· {e}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Search */}
      <div className="rounded-xl bg-space-900 border border-space-700 p-3 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/15 to-transparent" />
        <p className="text-[10px] text-sand-dim uppercase tracking-[0.2em] mb-2">Ajouter une carte</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-holo-dim text-sm">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-lg bg-space-800 border border-space-700 pl-8 pr-4 py-2 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all"
          />
        </div>
        {results.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {results.map((card) => (
              <button
                key={card.id}
                onClick={() => addCard(card)}
                disabled={loadingCardId === card.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-space-800 transition-colors text-left disabled:opacity-50"
              >
                {card.image_url && (
                  <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-space-800">
                    <Image src={card.image_url} alt={card.name} fill className="object-cover" unoptimized sizes="32px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-sand truncate">{card.name}</p>
                  <p className="text-xs text-sand-dim">{card.type} · {card.set_code}</p>
                </div>
                <span className="text-holo text-lg shrink-0">+</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card list */}
      {groups.length === 0 ? (
        <p className="text-center text-sand-dim text-sm py-8">Aucune carte. Recherche ci-dessus.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-sand-dim uppercase tracking-[0.2em]">
                  {group.label}
                </p>
                <span className={`text-xs font-bold tabular-nums font-[family-name:var(--font-rajdhani)] ${
                  group.label === "Deck principal" && mainTotal === 50 ? "text-emerald-400" : "text-sand-dim"
                }`}>
                  {group.count}{group.label === "Deck principal" ? "/50" : "/1"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map(({ card, quantity }) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    quantity={quantity}
                    overMax={card.type !== "Leader" && card.type !== "Base" && quantity > 3}
                    loading={loadingCardId === card.id}
                    onMinus={() => changeQty(card.id, -1)}
                    onPlus={() => changeQty(card.id, +1)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
