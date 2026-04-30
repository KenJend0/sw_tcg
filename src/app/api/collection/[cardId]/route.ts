import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ cardId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { cardId } = await params;
  const { quantity } = await req.json();

  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
  }

  const item = await prisma.collection.update({
    where: { user_id_card_id: { user_id: session.user.id, card_id: cardId } },
    data: { quantity },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { cardId } = await params;

  await prisma.collection.delete({
    where: { user_id_card_id: { user_id: session.user.id, card_id: cardId } },
  });

  return new NextResponse(null, { status: 204 });
}
