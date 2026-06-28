const db = require("./database/db");

function hr(char = "-", width = 70) {
  return char.repeat(width);
}

async function main() {
  await db.initDb();

  // ── Fix 1: Typo on tour ID 27 ────────────────────────────────────────
  const before = db.prepare("SELECT id, location FROM tours WHERE id = 27").get();
  if (!before) {
    console.error("ERROR: Tour ID 27 not found.");
    process.exit(1);
  }

  if (before.location === "Botswana") {
    console.log("Tour ID 27 location is already 'Botswana' — no change needed.");
  } else {
    db.prepare("UPDATE tours SET location = 'Botswana' WHERE id = 27").run();
    const after = db.prepare("SELECT id, location FROM tours WHERE id = 27").get();
    console.log(`Tour ID 27 location: "${before.location}" → "${after.location}"`);
  }

  // ── Fix 2: Correct titles (and slugs) for tours 58 and 59 ───────────
  const titleFixes = [
    {
      id: 58,
      title: "Ultimate Kenyan Safari: Maasai Mara & Diani Beach Adventure",
      slug:  "ultimate-kenyan-safari-maasai-mara-diani-beach-adventure",
    },
    {
      id: 59,
      title: "Luxury Kenya Safari & Coastal Escape",
      slug:  "luxury-kenya-safari-coastal-escape",
    },
  ];

  const updateTitle = db.prepare(
    "UPDATE tours SET title = @title, slug = @slug WHERE id = @id"
  );

  console.log("\n" + hr("="));
  console.log("TITLE FIXES (IDs 58 and 59)");
  console.log(hr("="));

  for (const fix of titleFixes) {
    const before = db.prepare("SELECT title, slug FROM tours WHERE id = ?").get(fix.id);
    if (!before) {
      console.error(`ERROR: Tour ID ${fix.id} not found.`);
      process.exit(1);
    }
    updateTitle.run(fix);
    const after = db.prepare("SELECT title, slug FROM tours WHERE id = ?").get(fix.id);
    console.log(`\n[ID ${fix.id}]`);
    console.log(`  Title : "${before.title}"`);
    console.log(`       → "${after.title}"`);
    console.log(`  Slug  : "${before.slug}"`);
    console.log(`       → "${after.slug}"`);
  }
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
