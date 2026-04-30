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
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-400 text-center mb-8">
          Créer un compte
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl bg-zinc-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="password"
            placeholder="Mot de passe (min 6 caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-xl bg-zinc-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-yellow-400 text-zinc-950 font-semibold py-3 text-sm hover:bg-yellow-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
