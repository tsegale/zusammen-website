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

function parseBlog(row) {
  if (!row) return null;
  return { ...row, active: Boolean(row.active) };
}

function adminOnly(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── GET /api/blogs ─────────────────────── paginated ─────────── */
router.get("/", (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const { tag } = req.query;

    let countSql = "SELECT COUNT(*) AS total FROM blogs WHERE active = 1";
    let dataSql =
      "SELECT * FROM blogs WHERE active = 1";
    const params = [];

    if (tag) {
      countSql += " AND tag = ?";
      dataSql += " AND tag = ?";
      params.push(tag);
    }

    dataSql += " ORDER BY published_at DESC LIMIT ? OFFSET ?";

    const { total } = db.prepare(countSql).get(...params);
    const blogs = db
      .prepare(dataSql)
      .all(...params, limit, offset)
      .map(parseBlog);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

/* ── GET /api/blogs/:id ───────────────────────────────────────── */
router.get("/:id", (req, res) => {
  try {
    const blog = db
      .prepare("SELECT * FROM blogs WHERE id = ? AND active = 1")
      .get(req.params.id);

    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(parseBlog(blog));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

/* ── POST /api/blogs — admin ──────────────────────────────────── */
router.post("/", adminOnly, (req, res) => {
  try {
    const {
      title,
      tag,
      excerpt,
      content,
      image_url,
      author = "Zusammen Tours",
      read_time,
      published_at,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Field 'title' is required" });
    }

    const slug = toSlug(title);

    const result = db
      .prepare(
        `INSERT INTO blogs (title, slug, tag, excerpt, content, image_url, author, read_time, published_at)
         VALUES (@title, @slug, @tag, @excerpt, @content, @image_url, @author, @read_time, @published_at)`
      )
      .run({
        title,
        slug,
        tag: tag ?? null,
        excerpt: excerpt ?? null,
        content: content ?? null,
        image_url: image_url ?? null,
        author,
        read_time: read_time ?? null,
        published_at: published_at ?? new Date().toISOString(),
      });

    const created = db
      .prepare("SELECT * FROM blogs WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(parseBlog(created));
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "A blog with this title already exists" });
    }
    res.status(500).json({ error: "Failed to create blog" });
  }
});

/* ── PUT /api/blogs/:id — admin ───────────────────────────────── */
router.put("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM blogs WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "Blog not found" });

    const fields = [
      "title",
      "tag",
      "excerpt",
      "content",
      "image_url",
      "author",
      "read_time",
      "published_at",
      "active",
    ];

    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (updates.title) updates.slug = toSlug(updates.title);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = Object.keys(updates)
      .map((k) => `${k} = @${k}`)
      .join(", ");

    db.prepare(`UPDATE blogs SET ${setClauses} WHERE id = @id`).run({
      ...updates,
      id: req.params.id,
    });

    const updated = db
      .prepare("SELECT * FROM blogs WHERE id = ?")
      .get(req.params.id);

    res.json(parseBlog(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update blog" });
  }
});

/* ── DELETE /api/blogs/:id — admin (soft delete) ─────────────── */
router.delete("/:id", adminOnly, (req, res) => {
  try {
    const existing = db
      .prepare("SELECT id FROM blogs WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "Blog not found" });

    db.prepare("UPDATE blogs SET active = 0 WHERE id = ?").run(req.params.id);
    res.json({ message: "Blog deactivated successfully", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate blog" });
  }
});

module.exports = router;
