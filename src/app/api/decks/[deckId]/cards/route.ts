import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ deckId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { deckId } = await params;
  const { card_id, quantity = 1 } = await req.json();

  if (!card_id) {
    return NextResponse.json({ error: "card_id requis" }, { status: 400 });
  }

  const deck = await prisma.deck.findUnique({
    where: { id: deckId, user_id: session.user.id },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  const item = await prisma.deckCard.upsert({
    where: { deck_id_card_id: { deck_id: deckId, card_id } },
    create: { deck_id: deckId, card_id, quantity },
    update: { quantity: { increment: quantity } },
  });

  await prisma.deck.update({
    where: { id: deckId },
    data: { updated_at: new Date() },
  });

  return NextResponse.json(item, { status: 201 });
}
