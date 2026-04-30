import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RARITY_COLOR: Record<string, string> = {
  Common: "bg-zinc-600 text-zinc-200",
  Uncommon: "bg-emerald-800 text-emerald-200",
  Rare: "bg-blue-800 text-blue-200",
  Legendary: "bg-yellow-700 text-yellow-200",
  Special: "bg-purple-800 text-purple-200",
};

export default async function CollectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const items = await prisma.collection.findMany({
    where: { user_id: session.user.id },
    include: {
      card: {
        select: {
          id: true,
          name: true,
          set_code: true,
          type: true,
          rarity: true,
          image_url: true,
        },
      },
    },
    orderBy: { card: { name: "asc" } },
  });

  const total = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <h1 className="text-xl font-bold text-yellow-400 mb-1">Ma Collection</h1>
      <p className="text-xs text-zinc-500 mb-4">
        {items.length} carte{items.length > 1 ? "s" : ""} · {total} exemplaire{total > 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="mb-3">Aucune carte dans ta collection.</p>
          <Link href="/cards" className="text-yellow-400 hover:underline text-sm">
            Parcourir le catalogue →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(({ card, quantity }) => (
            <Link
              key={card.id}
              href={`/cards/${card.id}`}
              className="group rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-yellow-500 transition-colors relative"
            >
              <div className="relative aspect-[63/88] bg-zinc-800">
                {card.image_url ? (
                  <Image
                    src={card.image_url}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, 30vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                    No image
                  </div>
                )}
                <span className="absolute top-1.5 right-1.5 bg-yellow-400 text-zinc-950 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  ×{quantity}
                </span>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-yellow-400 transition-colors">
                  {card.name}
                </p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-xs text-zinc-500">{card.set_code}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLOR[card.rarity] ?? "bg-zinc-700 text-zinc-300"}`}>
                    {card.rarity}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
