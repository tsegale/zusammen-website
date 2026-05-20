const express = require("express");
const router = express.Router();
const db = require("../database/db");

/* ── HELPERS ──────────────────────────────────────────────────── */
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTour(row) {
  if (!row) return null;
  return {
    ...row,
    includes: JSON.parse(row.includes || "[]"),
    excludes: JSON.parse(row.excludes || "[]"),
    highlights: JSON.parse(row.highlights || "[]"),
    active: Boolean(row.active),
  };
}

function adminOnly(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── GET /api/tours ───────────────────────────────────────────── */
router.get("/", (req, res) => {
  try {
    const { category, location, q } = req.query;
    let sql = "SELECT * FROM tours WHERE 1=1";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (location) {
      sql += " AND location = ?";
      params.push(location);
    }
    if (q) {
      sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    sql += " ORDER BY id ASC";

    const tours = db.prepare(sql).all(...params).map(parseTour);
    res.json({ count: tours.length, data: tours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

/* ── GET /api/tours/:id ───────────────────────────────────────── */
router.get("/:id", (req, res) => {
  try {
    const tour = db
      .prepare("SELECT * FROM tours WHERE id = ? AND active = 1")
      .get(req.params.id);

    if (!tour) return res.status(404).json({ error: "Tour not found" });
    res.json(parseTour(tour));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

/* ── POST /api/tours — admin ──────────────────────────────────── */
router.post("/", adminOnly, (req, res) => {
  try {
    const {
      title,
      location,
      category,
      rating = 5,
      reviews = 0,
      price,
      old_price,
      days,
      nights,
      guests = 12,
      min_age = 0,
      min_people = 2,
      max_people = 12,
      description,
      destinations,
      includes = [],
      excludes = [],
      highlights = [],
      available_dates,
      image_url,
    } = req.body;

    if (!title || !location || !category || !price || !days || !nights) {
      return res.status(400).json({
        error: "Required fields: title, location, category, price, days, nights",
      });
    }

    const slug = toSlug(title);

    const result = db
      .prepare(
        `INSERT INTO tours (
          title, slug, location, category, rating, reviews,
          price, old_price, days, nights, guests, min_age,
          min_people, max_people, description, destinations,
          includes, excludes, highlights, available_dates, image_url
        ) VALUES (
          @title, @slug, @location, @category, @rating, @reviews,
          @price, @old_price, @days, @nights, @guests, @min_age,
          @min_people, @max_people, @description, @destinations,
          @includes, @excludes, @highlights, @available_dates, @image_url
        )`
      )
      .run({
        title,
        slug,
        location,
        category,
        rating,
        reviews,
        price,
        old_price: old_price ?? null,
        days,
        nights,
        guests,
        min_age,
        min_people,
        max_people,
        description: description ?? null,
        destinations: destinations ?? null,
        includes: JSON.stringify(includes),
        excludes: JSON.stringify(excludes),
        highlights: JSON.stringify(highlights),
        available_dates: available_dates ?? null,
        image_url: image_url ?? null,
      });

    const created = db
      .prepare("SELECT * FROM tours WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(parseTour(created));
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "A tour with this title already exists" });
    }
    res.status(500).json({ error: "Failed to create tour" });
  }
});

/* ── PUT /api/tours/:id — admin ───────────────────────────────── */
router.put("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM tours WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "Tour not found" });

    const fields = [
      "title",
      "location",
      "category",
      "rating",
      "reviews",
      "price",
      "old_price",
      "days",
      "nights",
      "guests",
      "min_age",
      "min_people",
      "max_people",
      "description",
      "destinations",
      "available_dates",
      "image_url",
      "active",
    ];

    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    // JSON fields
    if (req.body.includes !== undefined)
      updates.includes = JSON.stringify(req.body.includes);
    if (req.body.excludes !== undefined)
      updates.excludes = JSON.stringify(req.body.excludes);
    if (req.body.highlights !== undefined)
      updates.highlights = JSON.stringify(req.body.highlights);

    // Regenerate slug if title changed
    if (updates.title) updates.slug = toSlug(updates.title);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = Object.keys(updates)
      .map((k) => `${k} = @${k}`)
      .join(", ");

    db.prepare(`UPDATE tours SET ${setClauses} WHERE id = @id`).run({
      ...updates,
      id: req.params.id,
    });

    const updated = db
      .prepare("SELECT * FROM tours WHERE id = ?")
      .get(req.params.id);

    res.json(parseTour(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

/* ── DELETE /api/tours/:id — admin (soft delete) ─────────────── */
router.delete("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT id FROM tours WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "Tour not found" });

    db.prepare("UPDATE tours SET active = 0 WHERE id = ?").run(req.params.id);
    res.json({ message: "Tour deactivated successfully", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate tour" });
  }
});

module.exports = router;
