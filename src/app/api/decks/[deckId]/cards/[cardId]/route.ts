import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ deckId: string; cardId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { deckId, cardId } = await params;
  const { quantity } = await req.json();

  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
  }

  const deck = await prisma.deck.findUnique({
    where: { id: deckId, user_id: session.user.id },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  const item = await prisma.deckCard.update({
    where: { deck_id_card_id: { deck_id: deckId, card_id: cardId } },
    data: { quantity },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { deckId, cardId } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id: deckId, user_id: session.user.id },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  await prisma.deckCard.delete({
    where: { deck_id_card_id: { deck_id: deckId, card_id: cardId } },
  });

  await prisma.deck.update({
    where: { id: deckId },
    data: { updated_at: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
