const express = require("express");
const router = express.Router();
const db = require("../database/db");

/* ── HELPERS ──────────────────────────────────────────────────── */
function parseFaq(row) {
  if (!row) return null;
  return { ...row, active: Boolean(row.active) };
}

function adminOnly(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── GET /api/faqs ────────────────────────────────────────────── */
router.get("/", (_req, res) => {
  try {
    const faqs = db
      .prepare("SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order ASC, id ASC")
      .all()
      .map(parseFaq);

    res.json({ count: faqs.length, data: faqs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

/* ── POST /api/faqs — admin ───────────────────────────────────── */
router.post("/", adminOnly, (req, res) => {
  try {
    const { question, answer, sort_order = 0 } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Fields 'question' and 'answer' are required" });
    }

    const result = db
      .prepare(
        "INSERT INTO faqs (question, answer, sort_order) VALUES (@question, @answer, @sort_order)"
      )
      .run({ question, answer, sort_order });

    const created = db
      .prepare("SELECT * FROM faqs WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(parseFaq(created));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

/* ── PUT /api/faqs/:id — admin ────────────────────────────────── */
router.put("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM faqs WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "FAQ not found" });

    const fields = ["question", "answer", "sort_order", "active"];
    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = Object.keys(updates)
      .map((k) => `${k} = @${k}`)
      .join(", ");

    db.prepare(`UPDATE faqs SET ${setClauses} WHERE id = @id`).run({
      ...updates,
      id: req.params.id,
    });

    const updated = db
      .prepare("SELECT * FROM faqs WHERE id = ?")
      .get(req.params.id);

    res.json(parseFaq(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

/* ── DELETE /api/faqs/:id — admin (soft delete) ──────────────── */
router.delete("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT id FROM faqs WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "FAQ not found" });

    db.prepare("UPDATE faqs SET active = 0 WHERE id = ?").run(req.params.id);
    res.json({ message: "FAQ deactivated successfully", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate FAQ" });
  }
});

module.exports = router;
