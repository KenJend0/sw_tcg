import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const aspects    = searchParams.get("aspects")?.split(",").filter(Boolean) ?? [];
  const excludeDeck = searchParams.get("exclude_deck") ?? "";

  // Get cards already in the deck to exclude them
  const deckCardIds = excludeDeck
    ? (await prisma.deckCard.findMany({
        where: { deck_id: excludeDeck },
        select: { card_id: true },
      })).map((d) => d.card_id)
    : [];

  const items = await prisma.collection.findMany({
    where: {
      user_id: session.user.id,
      ...(deckCardIds.length > 0 ? { card_id: { notIn: deckCardIds } } : {}),
      card: {
        type: { notIn: ["Leader", "Base"] },
        ...(aspects.length > 0
          ? { raw_data: { path: ["aspects"], array_contains: aspects[0] } }
          : {}),
      },
    },
    include: {
      card: {
        select: { id: true, name: true, set_code: true, type: true, rarity: true, image_url: true },
      },
    },
    orderBy: [{ card: { type: "asc" } }, { card: { name: "asc" } }],
    take: 30,
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { card_id, quantity = 1 } = await req.json();
  if (!card_id) {
    return NextResponse.json({ error: "card_id requis" }, { status: 400 });
  }

  const item = await prisma.collection.upsert({
    where: { user_id_card_id: { user_id: session.user.id, card_id } },
    create: { user_id: session.user.id, card_id, quantity },
    update: { quantity: { increment: quantity } },
  });

  return NextResponse.json(item, { status: 201 });
}
