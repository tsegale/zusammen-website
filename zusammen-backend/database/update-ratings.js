// One-time script: set Group Travel rating=4, is_top_rated=0 on all tours.
// Run from project root: node zusammen-backend/database/update-ratings.js
"use strict";

const path = require("path");
const fs   = require("fs");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbPath = path.resolve(
  process.env.DATABASE_URL || path.join(__dirname, "zusammen.db")
);

async function run() {
  const initSqlJs = require("sql.js/dist/sql-asm.js");
  const SQL = await initSqlJs();

  if (!fs.existsSync(dbPath)) {
    console.error("DB not found at:", dbPath);
    process.exit(1);
  }

  const db = new SQL.Database(fs.readFileSync(dbPath));

  function query(sql, ...params) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function exec(sql, ...params) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    stmt.step();
    stmt.free();
  }

  // ── BEFORE ────────────────────────────────────────────────────
  const before = query(
    "SELECT id, title, category, rating, is_top_rated FROM tours WHERE category IN ('Self-Drive', 'Group Travel') ORDER BY category, id"
  );

  console.log("\n=== BEFORE ===");
  if (before.length === 0) {
    console.log("  (no Self-Drive or Group Travel tours found)");
  } else {
    console.table(before);
  }

  // ── ALL tours: reset is_top_rated to 0 ────────────────────────
  exec("UPDATE tours SET is_top_rated = 0");
  console.log("\n[1] Reset is_top_rated = 0 on ALL tours. Rows modified:", db.getRowsModified());

  // ── Group Travel: rating = 4 ───────────────────────────────────
  exec("UPDATE tours SET rating = 4 WHERE category = 'Group Travel'");
  console.log("[2] Set rating = 4 on Group Travel tours. Rows modified:", db.getRowsModified());

  // ── AFTER ─────────────────────────────────────────────────────
  const after = query(
    "SELECT id, title, category, rating, is_top_rated FROM tours WHERE category IN ('Self-Drive', 'Group Travel') ORDER BY category, id"
  );

  console.log("\n=== AFTER ===");
  if (after.length === 0) {
    console.log("  (no Self-Drive or Group Travel tours found)");
  } else {
    console.table(after);
  }

  // Spot-check: confirm no tour has is_top_rated = 1
  const topRated = query("SELECT id, title, is_top_rated FROM tours WHERE is_top_rated = 1");
  console.log("\n=== Tours with is_top_rated = 1 (should be empty) ===");
  if (topRated.length === 0) {
    console.log("  OK — none");
  } else {
    console.table(topRated);
  }

  // Save
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log("\nDB saved to:", dbPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
