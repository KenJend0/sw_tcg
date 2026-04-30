import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get("search") ?? "";
  const set = searchParams.get("set") ?? "";
  const type = searchParams.get("type") ?? "";
  const rarity = searchParams.get("rarity") ?? "";
  const aspect = searchParams.get("aspect") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where: Prisma.CardWhereInput = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(set ? { set_code: set } : {}),
    ...(type ? { type } : {}),
    ...(rarity ? { rarity } : {}),
    ...(aspect ? { raw_data: { path: ["aspects"], array_contains: aspect } } : {}),
  };

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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
