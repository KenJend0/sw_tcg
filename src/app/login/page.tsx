"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/cards");
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
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl bg-space-800 border border-space-700 px-4 py-3 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all"
            />
            {error && <p className="text-xs text-alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-holo text-space-950 font-bold py-3 text-sm hover:bg-holo-dim disabled:opacity-50 transition-all duration-150 active:scale-[0.98] mt-1 glow-holo"
            >
              {loading ? "Connexion..." : "Accéder à l'archive"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sand-dim mt-4">
          Pas de compte ?{" "}
          <Link href="/register" className="text-holo hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
