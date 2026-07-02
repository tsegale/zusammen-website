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

// Used internally and for admin routes (snake_case, matches DB columns)
function parseTour(row) {
  if (!row) return null;
  return {
    ...row,
    includes:       JSON.parse(row.includes       || "[]"),
    excludes:       JSON.parse(row.excludes       || "[]"),
    highlights:     JSON.parse(row.highlights     || "[]"),
    gallery_images: JSON.parse(row.gallery_images || "[]"),
    active:         Boolean(row.active),
  };
}

function safeParseJSON(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); }
  catch {
    return value.split("\n").map(s => s.trim()).filter(Boolean);
  }
}

// Used for public API — maps to camelCase names that main.js and api.js expect
function mapForFrontend(row) {
  if (!row) return null;
  return {
    id:             row.id,
    title:          row.title,
    location:       row.location,
    category:       row.category,
    rating:         Number(row.rating)     || 5,
    reviews:        Number(row.reviews)    || 0,
    price:          Number(row.price)      || 0,
    oldPrice:       row.old_price ? Number(row.old_price) : null,
    days:           Number(row.days)       || 0,
    nights:         Number(row.nights)     || 0,
    guests:         Number(row.guests)     || 0,
    minAge:         Number(row.min_age)    || 6,
    minPeople:      Number(row.min_people) || 2,
    maxPeople:      Number(row.max_people) || 12,
    img:            row.image_url          || null,
    image_url:      row.image_url          || null,
    description:    row.description        || null,
    destinations:   row.destinations       || null,
    includes:       safeParseJSON(row.includes),
    excludes:       safeParseJSON(row.excludes),
    highlights:     safeParseJSON(row.highlights),
    galleryImages:  safeParseJSON(row.gallery_images),
    availableDates: row.available_dates    || null,
    active:         row.active,
    introduction:   row.introduction       || '',
    activities:     safeParseJSON(row.activities),
    itinerary:      safeParseJSON(row.itinerary),
    pickupAddress:  row.pickup_address     || '',
    dropoffAddress: row.dropoff_address    || '',
    city:           row.city               || '',
    region:         row.region             || '',
    zip:            row.zip                || '',
    country:        row.country            || '',
    isTopRated:     row.is_top_rated === 1 || row.is_top_rated === true,
  };
}

function adminOnly(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── GET /api/tours — returns camelCase array for frontend ────── */
router.get("/", (req, res) => {
  try {
    const { category, location, q } = req.query;
    let sql = "SELECT * FROM tours WHERE active = 1";
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

    const tours = db.prepare(sql).all(...params).map(mapForFrontend);
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

/* ── GET /api/tours/:id — returns camelCase for frontend ─────── */
router.get("/:id", (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM tours WHERE id = ? AND active = 1")
      .get(req.params.id);

    if (!row) return res.status(404).json({ error: "Tour not found" });
    res.json(mapForFrontend(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

/* ── POST /api/tours — admin ──────────────────────────────────── */
router.post("/", adminOnly, (req, res) => {
  console.log("POST /api/tours body:", req.body);
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
      gallery_images = [],
      active = 1,
      introduction = '',
      activities = [],
      itinerary = [],
      pickup_address,
      pickupAddress,
      dropoff_address,
      dropoffAddress,
      city = '',
      region = '',
      zip = '',
      country = '',
    } = req.body;

    if (!title || !location || !category || !price || !days || !nights) {
      return res.status(400).json({
        error: "Required fields: title, location, category, price, days, nights",
      });
    }

    const slug = toSlug(title);

    const includesStr      = Array.isArray(includes)       ? JSON.stringify(includes)       : (includes       || "[]");
    const excludesStr      = Array.isArray(excludes)       ? JSON.stringify(excludes)       : (excludes       || "[]");
    const highlightsStr    = Array.isArray(highlights)     ? JSON.stringify(highlights)     : (highlights     || "[]");
    const galleryImagesStr = Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : (gallery_images || "[]");
    const activitiesStr    = Array.isArray(activities)     ? JSON.stringify(activities)     : (activities     || "[]");
    const itineraryStr     = Array.isArray(itinerary)      ? JSON.stringify(itinerary)      : (itinerary      || "[]");
    const pickupAddr  = pickup_address  || pickupAddress  || '';
    const dropoffAddr = dropoff_address || dropoffAddress || '';

    const result = db
      .prepare(
        `INSERT INTO tours (
          title, slug, location, category, rating, reviews,
          price, old_price, days, nights, guests, min_age,
          min_people, max_people, description, destinations,
          includes, excludes, highlights, available_dates, image_url, gallery_images, active,
          introduction, activities, itinerary, pickup_address, dropoff_address,
          city, region, zip, country, is_top_rated
        ) VALUES (
          @title, @slug, @location, @category, @rating, @reviews,
          @price, @old_price, @days, @nights, @guests, @min_age,
          @min_people, @max_people, @description, @destinations,
          @includes, @excludes, @highlights, @available_dates, @image_url, @gallery_images, @active,
          @introduction, @activities, @itinerary, @pickup_address, @dropoff_address,
          @city, @region, @zip, @country, @is_top_rated
        )`
      )
      .run({
        title, slug, location, category,
        rating: Number(rating), reviews: Number(reviews),
        price: Number(price),
        old_price:   old_price != null ? Number(old_price) : null,
        days: Number(days), nights: Number(nights),
        guests: Number(guests), min_age: Number(min_age),
        min_people: Number(min_people), max_people: Number(max_people),
        description:     description     ?? null,
        destinations:    destinations    ?? null,
        includes:        includesStr,
        excludes:        excludesStr,
        highlights:      highlightsStr,
        available_dates: available_dates ?? null,
        image_url:       image_url       ?? null,
        gallery_images:  galleryImagesStr,
        active:          Number(active),
        introduction:    introduction    || '',
        activities:      activitiesStr,
        itinerary:       itineraryStr,
        pickup_address:  pickupAddr,
        dropoff_address: dropoffAddr,
        city:    city    || '',
        region:  region  || '',
        zip:     zip     || '',
        country: country || '',
        is_top_rated: req.body.is_top_rated != null ? Number(req.body.is_top_rated) : 0,
      });

    const created = db.prepare("SELECT * FROM tours WHERE id = ?").get(result.lastInsertRowid);
    console.log("POST /api/tours created id:", created.id);
    res.status(201).json({ success: true, tour: parseTour(created) });
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
    const existing = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Tour not found" });

    const fields = [
      "title", "location", "category", "rating", "reviews", "price",
      "old_price", "days", "nights", "guests", "min_age", "min_people",
      "max_people", "description", "destinations", "available_dates",
      "image_url", "active", "introduction", "is_top_rated",
      "city", "region", "zip", "country", "pickup_address", "dropoff_address",
    ];

    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    // Accept camelCase aliases for location fields
    if (req.body.pickupAddress !== undefined && updates.pickup_address === undefined)
      updates.pickup_address = req.body.pickupAddress;
    if (req.body.dropoffAddress !== undefined && updates.dropoff_address === undefined)
      updates.dropoff_address = req.body.dropoffAddress;

    if (req.body.includes !== undefined)
      updates.includes = Array.isArray(req.body.includes)
        ? JSON.stringify(req.body.includes)
        : req.body.includes;
    if (req.body.excludes !== undefined)
      updates.excludes = Array.isArray(req.body.excludes)
        ? JSON.stringify(req.body.excludes)
        : req.body.excludes;
    if (req.body.highlights !== undefined)
      updates.highlights = Array.isArray(req.body.highlights)
        ? JSON.stringify(req.body.highlights)
        : req.body.highlights;
    if (req.body.gallery_images !== undefined)
      updates.gallery_images = Array.isArray(req.body.gallery_images)
        ? JSON.stringify(req.body.gallery_images)
        : req.body.gallery_images;
    if (req.body.activities !== undefined)
      updates.activities = Array.isArray(req.body.activities)
        ? JSON.stringify(req.body.activities)
        : req.body.activities;
    if (req.body.itinerary !== undefined)
      updates.itinerary = Array.isArray(req.body.itinerary)
        ? JSON.stringify(req.body.itinerary)
        : req.body.itinerary;

    if (updates.title) updates.slug = toSlug(updates.title);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = @${k}`).join(", ");
    db.prepare(`UPDATE tours SET ${setClauses} WHERE id = @id`).run({ ...updates, id: req.params.id });

    const updated = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
    res.json(parseTour(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

/* ── DELETE /api/tours/:id — admin (hard delete) ─────────────── */
router.delete("/:id", adminOnly, (req, res) => {
  try {
    const existing = db.prepare("SELECT id FROM tours WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Tour not found" });

    db.prepare("DELETE FROM tours WHERE id = ?").run(req.params.id);
    res.json({ message: "Tour deleted", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

module.exports = router;
