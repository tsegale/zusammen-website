/**
 * Read-only database inspection script.
 * Prints row counts and content for tours, blogs, faqs, and enquiries.
 * Makes zero writes — all operations use prepare().all() / prepare().get().
 */

const db = require("./database/db");

function truncate(str, len) {
  if (!str) return "(empty)";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function hr(char = "-", width = 70) {
  return char.repeat(width);
}

async function inspect() {
  await db.initDb();

  // ── Row counts ────────────────────────────────────────────────────────
  const counts = {
    tours:     db.prepare("SELECT COUNT(*) AS n FROM tours").get().n,
    blogs:     db.prepare("SELECT COUNT(*) AS n FROM blogs").get().n,
    faqs:      db.prepare("SELECT COUNT(*) AS n FROM faqs").get().n,
    enquiries: db.prepare("SELECT COUNT(*) AS n FROM enquiries").get().n,
  };

  console.log("\n" + hr("="));
  console.log("DATABASE INSPECTION REPORT");
  console.log(hr("="));
  console.log("\nROW COUNTS:");
  for (const [table, n] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(12)} ${n} row(s)`);
  }

  // ── Tours ─────────────────────────────────────────────────────────────
  const tours = db.prepare(
    "SELECT id, title, location, category, created_at FROM tours ORDER BY id"
  ).all();

  console.log("\n" + hr());
  console.log(`TOURS (${tours.length} total)`);
  console.log(hr());
  if (tours.length === 0) {
    console.log("  (no rows)");
  } else {
    tours.forEach(t => {
      console.log(`  [${String(t.id).padStart(3)}] ${t.title}`);
      console.log(`        Location : ${t.location}`);
      console.log(`        Category : ${t.category}`);
      console.log(`        Created  : ${t.created_at}`);
    });
  }

  // ── Blogs ─────────────────────────────────────────────────────────────
  const blogs = db.prepare(
    "SELECT id, title, published_at FROM blogs ORDER BY id"
  ).all();

  console.log("\n" + hr());
  console.log(`BLOGS (${blogs.length} total)`);
  console.log(hr());
  if (blogs.length === 0) {
    console.log("  (no rows)");
  } else {
    blogs.forEach(b => {
      console.log(`  [${String(b.id).padStart(3)}] ${b.title}`);
      console.log(`        Published: ${b.published_at}`);
    });
  }

  // ── FAQs ──────────────────────────────────────────────────────────────
  const faqs = db.prepare(
    "SELECT id, question FROM faqs ORDER BY sort_order, id"
  ).all();

  console.log("\n" + hr());
  console.log(`FAQS (${faqs.length} total)`);
  console.log(hr());
  if (faqs.length === 0) {
    console.log("  (no rows)");
  } else {
    faqs.forEach(f => {
      console.log(`  [${String(f.id).padStart(3)}] ${truncate(f.question, 60)}`);
    });
  }

  // ── Enquiries (count + IDs only — no PII printed) ─────────────────────
  console.log("\n" + hr());
  console.log(`ENQUIRIES (${counts.enquiries} total — PII not printed)`);
  console.log(hr());
  if (counts.enquiries > 0) {
    const ids = db.prepare("SELECT id, created_at FROM enquiries ORDER BY id").all();
    ids.forEach(e => {
      console.log(`  [${String(e.id).padStart(3)}] created: ${e.created_at}`);
    });
  }

  console.log("\n" + hr("="));
  console.log("END OF REPORT — no data was modified.");
  console.log(hr("=") + "\n");
}

inspect().catch(err => {
  console.error("Inspection failed:", err);
  process.exit(1);
});
