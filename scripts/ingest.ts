import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_BASE = "https://api.swuapi.com";
const BATCH_SIZE = 200;

async function fetchSets() {
  const res = await fetch(`${API_BASE}/sets`);
  if (!res.ok) throw new Error(`Sets fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.sets ?? []);
}

async function fetchCardsPage(offset: number) {
  const params = new URLSearchParams({ limit: String(BATCH_SIZE), offset: String(offset) });
  const res = await fetch(`${API_BASE}/cards?${params}`);
  if (!res.ok) throw new Error(`Cards fetch failed: ${res.status}`);
  return res.json();
}

async function upsertSets(sets: any[]) {
  for (const set of sets) {
    await prisma.set.upsert({
      where: { code: set.code },
      create: {
        code: set.code,
        name: set.name,
        release_date: set.release_date ? new Date(set.release_date) : null,
        raw_data: set,
      },
      update: {
        name: set.name,
        release_date: set.release_date ? new Date(set.release_date) : null,
        raw_data: set,
      },
    });
  }
  console.log(`✓ ${sets.length} sets upserted`);
}

async function upsertCards(cards: any[]) {
  let ok = 0;
  let skipped = 0;

  for (const card of cards) {
    if (!card.uuid || !card.set_code) {
      skipped++;
      continue;
    }
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

  return { ok, skipped };
}

async function main() {
  console.log("🚀 Full ingestion starting...\n");

  // 1. Sets first (cards have FK on set_code)
  console.log("→ Fetching sets...");
  const sets = await fetchSets();
  await upsertSets(sets);

  // 2. Cards (offset-based pagination — gets all 8071 cards)
  console.log("\n→ Fetching cards...");
  let offset = 0;
  let totalCards = 0;
  let apiTotal = 0;
  let page = 0;

  do {
    page++;
    const data = await fetchCardsPage(offset);
    const cards: any[] = data.cards ?? [];
    const pagination = data.pagination ?? {};
    apiTotal = pagination.total ?? 0;

    if (cards.length === 0) break;

    const { ok, skipped } = await upsertCards(cards);
    totalCards += ok;
    offset += cards.length;

    const pct = apiTotal ? Math.round((offset / apiTotal) * 100) : "?";
    console.log(
      `  Page ${page}: +${ok} cards${skipped ? ` (${skipped} skipped)` : ""} — total ${totalCards}/${apiTotal} (${pct}%)`
    );
  } while (offset < apiTotal);

  // 3. Save sync state
  await prisma.syncState.upsert({
    where: { resource: "cards" },
    create: { resource: "cards", last_sync_at: new Date(), status: "idle" },
    update: { last_sync_at: new Date(), status: "idle", error: null },
  });

  console.log(
    `\n✅ Done: ${totalCards} cards, ${sets.length} sets ingested.`
  );
}

main()
  .catch((e) => {
    console.error("\n❌ Ingestion failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
