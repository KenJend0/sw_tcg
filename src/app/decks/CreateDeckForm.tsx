"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDeckForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const deck = await res.json();
      router.push(`/decks/${deck.id}`);
    } else {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-zinc-700 py-4 text-sm text-zinc-500 hover:border-yellow-400 hover:text-yellow-400 transition-colors"
      >
        + Nouveau deck
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-zinc-900 border border-zinc-700 p-4 flex flex-col gap-3">
      <input
        type="text"
        placeholder="Nom du deck"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 rounded-lg bg-yellow-400 text-zinc-950 font-semibold py-2 text-sm hover:bg-yellow-300 disabled:opacity-50 transition-colors"
        >
          {loading ? "Création..." : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setName(""); }}
          className="px-4 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
