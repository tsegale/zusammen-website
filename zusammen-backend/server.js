require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const toursRouter = require("./routes/tours");
const blogsRouter = require("./routes/blogs");
const faqsRouter = require("./routes/faqs");
const enquiriesRouter = require("./routes/enquiries");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

/* ── CORS ─────────────────────────────────────────────────────── */
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "http://localhost:5502",
      "http://127.0.0.1:5502",
      "http://localhost",
      "http://127.0.0.1",
      "https://zusammentravels.com",
      "https://www.zusammentravels.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    console.warn("CORS blocked origin:", origin);
    callback(new Error("CORS: origin not allowed - " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ── BODY PARSER ──────────────────────────────────────────────── */
app.use(express.json());

/* ── SESSION ──────────────────────────────────────────────────── */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "zusammen-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

/* ── CROSS-ORIGIN HEADERS ─────────────────────────────────────── */
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

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
  if (
    req.session?.admin ||
    req.headers["x-admin-key"] === process.env.ADMIN_KEY
  ) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

function parseTour(t) {
  return {
    ...t,
    includes:       JSON.parse(t.includes       || "[]"),
    excludes:       JSON.parse(t.excludes       || "[]"),
    highlights:     JSON.parse(t.highlights     || "[]"),
    gallery_images: JSON.parse(t.gallery_images || "[]"),
    active:         Boolean(t.active),
  };
}

/* ── FILE UPLOADS ─────────────────────────────────────────────── */
const uploadsDir = path.join(__dirname, "..", "assets", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const clean = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    cb(null, Date.now() + "-" + clean);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

/* ── HEALTH CHECK ─────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── ADMIN AUTH ───────────────────────────────────────────────── */
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zusammentours.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  console.log(`[login] received email="${email}" | expected="${adminEmail}"`);

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  if (email !== adminEmail)
    return res.status(401).json({ error: "Invalid credentials" });

  const valid = adminPassword.startsWith("$2")
    ? bcrypt.compareSync(password, adminPassword)
    : password === adminPassword;

  console.log(`[login] password valid=${valid}`);

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
    const tours = db
      .prepare("SELECT COUNT(*) AS n FROM tours WHERE active = 1")
      .get().n;
    const blogs = db
      .prepare("SELECT COUNT(*) AS n FROM blogs WHERE active = 1")
      .get().n;
    const faqs = db
      .prepare("SELECT COUNT(*) AS n FROM faqs WHERE active = 1")
      .get().n;
    const newEnquiries = db
      .prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'")
      .get().n;
    res.json({ tours, blogs, faqs, newEnquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/admin/tours", requireAdmin, (_req, res) => {
  try {
    const data = db
      .prepare("SELECT * FROM tours ORDER BY id DESC")
      .all()
      .map(parseTour);
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

app.get("/api/admin/blogs", requireAdmin, (_req, res) => {
  try {
    const data = db
      .prepare("SELECT * FROM blogs ORDER BY id DESC")
      .all()
      .map((b) => ({
        ...b,
        active: Boolean(b.active),
      }));
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

app.get("/api/admin/faqs", requireAdmin, (_req, res) => {
  try {
    const data = db
      .prepare("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC")
      .all()
      .map((f) => ({
        ...f,
        active: Boolean(f.active),
      }));
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

/* ── IMAGE UPLOAD ─────────────────────────────────────────────── */
app.post("/api/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = "/assets/uploads/" + req.file.filename;
  console.log("Image uploaded:", url);
  res.json({ success: true, url, filename: req.file.filename });
});

app.post("/api/upload/multiple", requireAdmin, upload.array("images", 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "No files uploaded" });
  const images = req.files.map((f) => ({
    url: "/assets/uploads/" + f.filename,
    filename: f.filename,
  }));
  res.json({ success: true, images });
});

/* ── ENQUIRY STATUS UPDATE (admin panel convenience) ──────────── */
// Handles PUT /api/enquiries/:id — must be registered BEFORE the router
app.put("/api/enquiries/:id", requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "in-progress", "replied", "closed"];
    if (!status || !valid.includes(status))
      return res
        .status(400)
        .json({ error: `Status must be one of: ${valid.join(", ")}` });

    const existing = db
      .prepare("SELECT id FROM enquiries WHERE id = ?")
      .get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Enquiry not found" });

    db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(
      status,
      req.params.id,
    );
    res.json(
      db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update enquiry" });
  }
});

/* ── API ROUTES ───────────────────────────────────────────────── */
app.use("/api/tours", toursRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api/enquiries", enquiriesRouter);

/* ── DEBUG ENDPOINT ───────────────────────────────────────────── */
app.get("/api/debug", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is connected",
    endpoints: {
      tours: "/api/tours",
      blogs: "/api/blogs",
      faqs: "/api/faqs",
      enquiries: "/api/enquiries",
      admin: "/admin",
    },
  });
});

/* ── FRONTEND STATIC FILES ────────────────────────────────────── */
app.use("/assets/uploads", express.static(uploadsDir));
app.use(express.static(path.join(__dirname, "..")));

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
    const server = app
      .listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
        console.log(`🔗 API: http://localhost:${PORT}/api\n`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(`❌ Port ${PORT} is already in use.`);
          console.error(`   Run this to fix: taskkill /F /IM node.exe`);
          console.error(`   Or change PORT in .env to a different number`);
          setImmediate(() => process.exit(1));
        }
      });
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
