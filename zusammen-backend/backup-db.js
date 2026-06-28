const db   = require("./database/db");
const fs   = require("fs");
const path = require("path");

async function backup() {
  await db.initDb();

  const tours = db.prepare("SELECT * FROM tours ORDER BY id").all();
  const blogs = db.prepare("SELECT * FROM blogs ORDER BY id").all();
  const faqs  = db.prepare("SELECT * FROM faqs  ORDER BY sort_order, id").all();

  const payload = {
    exported_at: new Date().toISOString(),
    counts: { tours: tours.length, blogs: blogs.length, faqs: faqs.length },
    tours,
    blogs,
    faqs,
  };

  const backupsDir = path.join(__dirname, "backups");
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  const stamp    = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `backup-${stamp}.json`;
  const outPath  = path.join(backupsDir, filename);

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(`\nBackup written: backups/${filename}`);
  console.log(`  tours: ${tours.length}`);
  console.log(`  blogs: ${blogs.length}`);
  console.log(`  faqs:  ${faqs.length}\n`);
}

backup().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
