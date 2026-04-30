"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  frontUrl: string;
  backUrl: string;
  name: string;
  epicAction: string;
};

export default function LeaderFlip({ frontUrl, backUrl, name, epicAction }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="mb-6">
      {/* Flip button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-sand-dim uppercase tracking-[0.2em]">
          {flipped ? "Déployé" : "Leader"}
        </p>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="flex items-center gap-1.5 text-xs text-holo border border-holo/30 hover:border-holo bg-space-900 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          ↺ {flipped ? "Voir recto" : "Voir déployé"}
        </button>
      </div>

      {/* Images */}
      <div className="flex gap-3">
        {/* Front — landscape */}
        <div className={`holo-card relative rounded-xl overflow-hidden bg-space-800 border transition-all duration-200 flex-1 aspect-[400/286] ${!flipped ? "border-holo/50" : "border-space-700 opacity-50"}`}>
          <Image src={frontUrl} alt={name} fill className="object-cover" unoptimized sizes="50vw" />
          {!flipped && <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-holo/40 to-transparent" />}
        </div>
        {/* Back — portrait */}
        <div className={`holo-card relative rounded-xl overflow-hidden bg-space-800 border transition-all duration-200 w-28 aspect-[287/400] ${flipped ? "border-holo/50" : "border-space-700 opacity-50"}`}>
          <Image src={backUrl} alt={`${name} déployé`} fill className="object-cover" unoptimized sizes="112px" />
          {flipped && <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-holo/40 to-transparent" />}
        </div>
      </div>

      {/* Epic action */}
      <div className="mt-3 rounded-xl bg-space-900 border border-holo/20 p-3 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-holo/30 to-transparent" />
        <p className="text-[10px] text-holo uppercase tracking-widest mb-1">Epic Action</p>
        <p className="text-sm text-sand/80 leading-relaxed">{epicAction}</p>
      </div>
    </div>
  );
}
