require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const session = require("express-session");
const bcrypt  = require("bcryptjs");

const toursRouter     = require("./routes/tours");
const blogsRouter     = require("./routes/blogs");
const faqsRouter      = require("./routes/faqs");
const enquiriesRouter = require("./routes/enquiries");
const db              = require("./database/db");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── CORS ─────────────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://127.0.0.1:5500",
  "https://zusammentravels.com",
  "https://www.zusammentravels.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS: origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
    credentials: true,
  })
);

/* ── BODY PARSER ──────────────────────────────────────────────── */
app.use(express.json());

/* ── SESSION ──────────────────────────────────────────────────── */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "zusammen-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 },
  })
);

/* ── REQUEST LOGGER ───────────────────────────────────────────── */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ── ADMIN STATIC FILES ───────────────────────────────────────── */
app.get("/admin", (req, res) => {
  res.redirect(req.session?.admin ? "/admin/index.html" : "/admin/login.html");
});
app.use("/admin", express.static(path.join(__dirname, "admin")));

/* ── SESSION → ADMIN KEY INJECTION ───────────────────────────── */
// Authenticated sessions automatically receive admin privileges on all API routes
app.use((req, res, next) => {
  if (req.session?.admin && !req.headers["x-admin-key"]) {
    req.headers["x-admin-key"] = process.env.ADMIN_KEY;
  }
  next();
});

/* ── ADMIN MIDDLEWARE ─────────────────────────────────────────── */
function requireAdmin(req, res, next) {
  if (req.session?.admin || req.headers["x-admin-key"] === process.env.ADMIN_KEY) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

function parseTour(t) {
  return {
    ...t,
    includes:   JSON.parse(t.includes   || "[]"),
    excludes:   JSON.parse(t.excludes   || "[]"),
    highlights: JSON.parse(t.highlights || "[]"),
    active:     Boolean(t.active),
  };
}

/* ── HEALTH CHECK ─────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── ADMIN AUTH ───────────────────────────────────────────────── */
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const adminEmail    = process.env.ADMIN_EMAIL    || "admin@zusammentours.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  if (email !== adminEmail)
    return res.status(401).json({ error: "Invalid credentials" });

  const valid = adminPassword.startsWith("$2")
    ? bcrypt.compareSync(password, adminPassword)
    : password === adminPassword;

  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  req.session.admin = true;
  req.session.email = email;
  res.json({ success: true });
});

app.get("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get("/api/admin/check", (req, res) => {
  res.json({ authenticated: Boolean(req.session?.admin) });
});

/* ── ADMIN DATA ROUTES ────────────────────────────────────────── */
app.get("/api/admin/stats", requireAdmin, (_req, res) => {
  try {
    const tours       = db.prepare("SELECT COUNT(*) AS n FROM tours WHERE active = 1").get().n;
    const blogs       = db.prepare("SELECT COUNT(*) AS n FROM blogs WHERE active = 1").get().n;
    const faqs        = db.prepare("SELECT COUNT(*) AS n FROM faqs WHERE active = 1").get().n;
    const newEnquiries = db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'").get().n;
    res.json({ tours, blogs, faqs, newEnquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/admin/tours", requireAdmin, (_req, res) => {
  try {
    const data = db.prepare("SELECT * FROM tours ORDER BY id DESC").all().map(parseTour);
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

app.get("/api/admin/blogs", requireAdmin, (_req, res) => {
  try {
    const data = db.prepare("SELECT * FROM blogs ORDER BY id DESC").all().map(b => ({
      ...b, active: Boolean(b.active),
    }));
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

app.get("/api/admin/faqs", requireAdmin, (_req, res) => {
  try {
    const data = db.prepare("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC").all().map(f => ({
      ...f, active: Boolean(f.active),
    }));
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

/* ── ENQUIRY STATUS UPDATE (admin panel convenience) ──────────── */
// Handles PUT /api/enquiries/:id — must be registered BEFORE the router
app.put("/api/enquiries/:id", requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "in-progress", "replied", "closed"];
    if (!status || !valid.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${valid.join(", ")}` });

    const existing = db.prepare("SELECT id FROM enquiries WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Enquiry not found" });

    db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json(db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update enquiry" });
  }
});

/* ── API ROUTES ───────────────────────────────────────────────── */
app.use("/api/tours",     toursRouter);
app.use("/api/blogs",     blogsRouter);
app.use("/api/faqs",      faqsRouter);
app.use("/api/enquiries", enquiriesRouter);

/* ── 404 ──────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

/* ── GLOBAL ERROR HANDLER ─────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.startsWith("CORS"))
    return res.status(403).json({ error: err.message });
  res.status(500).json({ error: "Internal server error" });
});

/* ── START ────────────────────────────────────────────────────── */
db.initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nZusammen Tours API  → http://localhost:${PORT}`);
      console.log(`Admin Panel         → http://localhost:${PORT}/admin`);
      console.log(`Health check        → http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
