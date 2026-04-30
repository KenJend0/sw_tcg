import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const decks = await prisma.deck.findMany({
    where: { user_id: session.user.id },
    include: {
      _count: { select: { deck_cards: true } },
      deck_cards: { select: { quantity: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  const result = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    updated_at: d.updated_at,
    card_count: d.deck_cards.reduce((sum, c) => sum + c.quantity, 0),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const deck = await prisma.deck.create({
    data: { user_id: session.user.id, name: name.trim(), description },
    select: { id: true, name: true, description: true, created_at: true },
  });

  return NextResponse.json(deck, { status: 201 });
}
