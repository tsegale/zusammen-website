require("dotenv").config();
const express = require("express");
const cors = require("cors");

const toursRouter = require("./routes/tours");
const blogsRouter = require("./routes/blogs");
const faqsRouter = require("./routes/faqs");
const enquiriesRouter = require("./routes/enquiries");

const app = express();
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
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS: origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

/* ── BODY PARSER ──────────────────────────────────────────────── */
app.use(express.json());

/* ── REQUEST LOGGER ───────────────────────────────────────────── */
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ── HEALTH CHECK ─────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── ROUTES ───────────────────────────────────────────────────── */
app.use("/api/tours", toursRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api/enquiries", enquiriesRouter);

/* ── 404 ──────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ── GLOBAL ERROR HANDLER ─────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message && err.message.startsWith("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

/* ── START ────────────────────────────────────────────────────── */
const db = require("./database/db");

db.initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nZusammen Tours API → http://localhost:${PORT}`);
      console.log(`Health check    → http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
