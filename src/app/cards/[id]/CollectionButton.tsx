"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { cardId: string; inCollection: boolean; quantity: number; pinned?: boolean };

export default function CollectionButton({ cardId, inCollection, quantity, pinned = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(quantity);
  const [owned, setOwned] = useState(inCollection);
  const [isPinned, setIsPinned] = useState(pinned);

  async function add() {
    setLoading(true);
    await fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: cardId, quantity: 1 }),
    });
    setQty((q) => q + 1);
    setOwned(true);
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    setLoading(true);
    if (qty > 1) {
      await fetch(`/api/collection/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty - 1 }),
      });
      setQty((q) => q - 1);
    } else {
      await fetch(`/api/collection/${cardId}`, { method: "DELETE" });
      setOwned(false);
      setIsPinned(false);
      setQty(0);
    }
    setLoading(false);
    router.refresh();
  }

  async function togglePin() {
    setLoading(true);
    await fetch(`/api/collection/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !isPinned }),
    });
    setIsPinned((p) => !p);
    setLoading(false);
    router.refresh();
  }

  if (!owned) {
    return (
      <button
        onClick={add}
        disabled={loading}
        className="w-full rounded-xl bg-holo text-space-950 font-semibold py-3 text-sm hover:bg-holo-dim disabled:opacity-50 transition-all duration-150 active:scale-[0.98] glow-holo"
      >
        {loading ? "..." : "+ Ajouter à ma collection"}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between bg-space-900 border border-holo/30 rounded-xl px-4 py-3">
      <div>
        <p className="text-[10px] text-sand-dim uppercase tracking-wider mb-0.5">Collection</p>
        <p className="text-sm font-bold text-holo">{qty} exemplaire{qty > 1 ? "s" : ""}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePin}
          disabled={loading}
          title={isPinned ? "Retirer des favoris" : "Épingler comme favori"}
          className={`w-9 h-9 rounded-lg border text-lg transition-all duration-150 disabled:opacity-50 ${
            isPinned
              ? "bg-burn/20 border-burn/50 text-burn"
              : "bg-space-800 border-space-700 text-sand-dim hover:border-burn/40 hover:text-burn"
          }`}
        >
          {isPinned ? "★" : "☆"}
        </button>
        <button
          onClick={remove}
          disabled={loading}
          className="w-9 h-9 rounded-lg bg-space-800 border border-space-700 hover:border-holo text-sand-dim font-bold disabled:opacity-50 transition-all duration-150"
        >
          −
        </button>
        <button
          onClick={add}
          disabled={loading}
          className="w-9 h-9 rounded-lg bg-space-800 border border-space-700 hover:border-holo text-sand-dim font-bold disabled:opacity-50 transition-all duration-150"
        >
          +
        </button>
      </div>
    </div>
  );
}
