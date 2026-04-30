"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de l'inscription.");
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <p className="font-[family-name:var(--font-orbitron)] text-holo text-xl tracking-widest">
            HOLOGRAPHIC
          </p>
          <p className="text-xs tracking-[0.4em] text-sand-dim uppercase mt-1">Archive</p>
        </div>

        <div className="bg-space-900 border border-space-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/40 to-transparent" />
          <p className="font-[family-name:var(--font-rajdhani)] text-lg font-bold text-sand mb-4 tracking-wide">
            Créer un compte
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl bg-space-800 border border-space-700 px-4 py-3 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all"
            />
            <input
              type="password"
              placeholder="Mot de passe (min 6 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-xl bg-space-800 border border-space-700 px-4 py-3 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all"
            />
            {error && <p className="text-xs text-alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-holo text-space-950 font-bold py-3 text-sm hover:bg-holo-dim disabled:opacity-50 transition-all active:scale-[0.98] mt-1 glow-holo"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sand-dim mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-holo hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
