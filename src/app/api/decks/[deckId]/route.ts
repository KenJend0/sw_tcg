import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ deckId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { deckId } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id: deckId, user_id: session.user.id },
    include: {
      deck_cards: {
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
      },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  return NextResponse.json(deck);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { deckId } = await params;

  await prisma.deck.delete({
    where: { id: deckId, user_id: session.user.id },
  });

  return new NextResponse(null, { status: 204 });
}
