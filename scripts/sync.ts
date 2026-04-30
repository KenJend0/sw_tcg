import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();
const API_BASE = "https://api.swuapi.com";
const BATCH_SIZE = 200;

async function fetchCardsSince(since: string, after?: string) {
  const params = new URLSearchParams({ limit: String(BATCH_SIZE), since });
  if (after) params.set("after", after);
  const res = await fetch(`${API_BASE}/cards?${params}`);
  if (!res.ok) throw new Error(`Cards fetch failed: ${res.status}`);
  return res.json();
}

async function upsertCards(cards: any[]) {
  let ok = 0;
  for (const card of cards) {
    if (!card.uuid || !card.set_code) continue;
    await prisma.card.upsert({
      where: { external_id: card.uuid },
      create: {
        external_id: card.uuid,
        name: card.name ?? "Unknown",
        set_code: card.set_code,
        type: card.type ?? "Unknown",
        rarity: card.rarity ?? "Unknown",
        image_url: card.front_image_url ?? null,
        raw_data: card,
      },
      update: {
        name: card.name ?? "Unknown",
        set_code: card.set_code,
        type: card.type ?? "Unknown",
        rarity: card.rarity ?? "Unknown",
        image_url: card.front_image_url ?? null,
        raw_data: card,
      },
    });
    ok++;
  }
  return ok;
}

async function main() {
  const syncState = await prisma.syncState.findUnique({
    where: { resource: "cards" },
  });

  if (!syncState?.last_sync_at) {
    console.error("❌ No sync state found. Run `npm run ingest` first.");
    process.exit(1);
  }

  const since = syncState.last_sync_at.toISOString();
  console.log(`🔄 Syncing cards updated since ${since}...\n`);

  await prisma.syncState.update({
    where: { resource: "cards" },
    data: { status: "running" },
  });

  let cursor: string | undefined;
  let total = 0;

  try {
    do {
      const data = await fetchCardsSince(since, cursor);
      const cards: any[] = data.cards ?? [];
      const pagination = data.pagination ?? {};

      if (cards.length === 0) break;

      const ok = await upsertCards(cards);
      total += ok;
      cursor = pagination.next_cursor ?? undefined;

      console.log(`  +${ok} cards updated (total: ${total})`);
    } while (cursor);

    await prisma.syncState.update({
      where: { resource: "cards" },
      data: { last_sync_at: new Date(), status: "idle", error: null },
    });

    console.log(`\n✅ Sync complete: ${total} cards updated.`);
  } catch (e: any) {
    await prisma.syncState.update({
      where: { resource: "cards" },
      data: { status: "error", error: e.message },
    });
    throw e;
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Sync failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
