"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-holo-dim text-sm select-none">
        ⌕
      </span>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Rechercher une carte..."
        className={`w-full rounded-xl bg-space-900 border pl-8 pr-4 py-3 text-sm text-sand placeholder-sand-dim outline-none focus:border-holo focus:ring-1 focus:ring-holo/30 transition-all duration-150 ${
          isPending ? "border-holo/40" : "border-space-700"
        }`}
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-holo border-t-transparent animate-spin" />
      )}
    </div>
  );
}
