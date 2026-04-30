"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  cardId: string;
  inCollection: boolean;
  quantity: number;
};

export default function CollectionButton({ cardId, inCollection, quantity }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(quantity);
  const [owned, setOwned] = useState(inCollection);

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
      setQty(0);
    }
    setLoading(false);
    router.refresh();
  }

  if (!owned) {
    return (
      <button
        onClick={add}
        disabled={loading}
        className="w-full mt-4 rounded-xl bg-yellow-400 text-zinc-950 font-semibold py-3 text-sm hover:bg-yellow-300 disabled:opacity-50 transition-colors"
      >
        + Ajouter à ma collection
      </button>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3">
      <span className="text-sm text-zinc-300">
        Dans ma collection : <span className="font-bold text-yellow-400">{qty}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={remove}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold disabled:opacity-50 transition-colors"
        >
          −
        </button>
        <button
          onClick={add}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold disabled:opacity-50 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
