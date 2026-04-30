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
        className="w-full rounded-xl border border-dashed border-space-700 py-4 text-sm text-sand-dim hover:border-holo hover:text-holo transition-all duration-150 flex items-center justify-center gap-2"
      >
        <span className="text-lg leading-none">+</span>
        Nouveau deck
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-space-900 border border-holo/30 p-4 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/40 to-transparent" />
      <input
        type="text"
        placeholder="Nom du deck"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
        className="rounded-lg bg-space-800 border border-space-700 px-3 py-2.5 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 rounded-lg bg-holo text-space-950 font-bold py-2.5 text-sm hover:bg-holo-dim disabled:opacity-50 transition-all active:scale-[0.98] glow-holo"
        >
          {loading ? "Création..." : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setName(""); }}
          className="px-4 rounded-lg bg-space-800 border border-space-700 text-sand-dim text-sm hover:border-holo hover:text-sand transition-all"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
