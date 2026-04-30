import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      select: {
        id: true,
        external_id: true,
        name: true,
        set_code: true,
        type: true,
        rarity: true,
        image_url: true,
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.card.count({ where }),
  ]);

  return NextResponse.json({
    data: cards,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
