const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const db = require("../database/db");

/* ── HELPERS ──────────────────────────────────────────────────── */
function adminOnly(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildEmailHtml(enquiry) {
  const childPrice = enquiry.adults > 0
    ? `N$${(
        (enquiry.price_per_adult || 0) * 0.6
      ).toLocaleString("en-ZA")}`
    : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 620px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .header { background: #1a1a2e; padding: 28px 32px; text-align: center; }
    .header h1 { color: #c9a84c; margin: 0; font-size: 22px; letter-spacing: 1px; }
    .header p { color: #ccc; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .section-title { font-size: 13px; font-weight: 700; color: #c9a84c; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #e8e8e8; padding-bottom: 6px; }
    .row { display: flex; margin-bottom: 10px; }
    .label { color: #666; font-size: 13px; min-width: 160px; flex-shrink: 0; }
    .value { color: #1a1a2e; font-size: 13px; font-weight: 600; }
    .message-box { background: #f9f9f9; border-left: 3px solid #c9a84c; padding: 14px 16px; border-radius: 0 4px 4px 0; font-size: 13px; color: #444; line-height: 1.6; margin-top: 8px; }
    .note { background: #fffbec; border: 1px solid #f0d060; border-radius: 4px; padding: 12px 16px; font-size: 12px; color: #856404; margin-top: 20px; }
    .footer { background: #1a1a2e; padding: 18px 32px; text-align: center; color: #888; font-size: 11px; }
    .footer a { color: #c9a84c; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Zusammen Tours &amp; Travel</h1>
      <p>New Safari Enquiry Received</p>
    </div>
    <div class="body">

      <div class="section-title">Tour Details</div>
      <div class="row"><span class="label">Tour Name</span><span class="value">${enquiry.tour_name || "General Enquiry"}</span></div>
      <div class="row"><span class="label">Travel From</span><span class="value">${enquiry.travel_from || "—"}</span></div>
      <div class="row"><span class="label">Travel To (Return)</span><span class="value">${enquiry.travel_to || "—"}</span></div>

      <div class="section-title">Guest Breakdown</div>
      <div class="row"><span class="label">Adults</span><span class="value">${enquiry.adults}</span></div>
      <div class="row"><span class="label">Children (aged 3–12)</span><span class="value">${enquiry.children}</span></div>
      <div class="row"><span class="label">Total Travellers</span><span class="value">${Number(enquiry.adults) + Number(enquiry.children)}</span></div>

      <div class="section-title">Client Contact</div>
      <div class="row"><span class="label">Full Name</span><span class="value">${enquiry.first_name} ${enquiry.last_name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${enquiry.email}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${enquiry.phone || "—"}</span></div>

      ${
        enquiry.message
          ? `<div class="section-title">Message</div>
             <div class="message-box">${enquiry.message.replace(/\n/g, "<br>")}</div>`
          : ""
      }

      <div class="note">
        <strong>Child Pricing Reminder:</strong> Children aged 3–12 travel at
        <strong>60% of the adult rate</strong>. Children under 3 travel free
        (subject to lodge policy). Please apply the discount when preparing the
        quote for this client.
      </div>
    </div>
    <div class="footer">
      Zusammen Tours &amp; Travel Agency &nbsp;|&nbsp;
      <a href="mailto:info@zusammentravels.com">info@zusammentravels.com</a> &nbsp;|&nbsp;
      +264 81 245 5852
    </div>
  </div>
</body>
</html>`;
}

/* ── POST /api/enquiries ──────────────────────────────────────── */
router.post("/", async (req, res) => {
  try {
    const {
      tour_id,
      tour_name,
      first_name,
      last_name,
      email,
      phone,
      travel_from,
      travel_to,
      adults = 1,
      children = 0,
      message,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        error: "Required fields: first_name, last_name, email",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Save to database
    const result = db
      .prepare(
        `INSERT INTO enquiries (tour_id, tour_name, first_name, last_name, email, phone, travel_from, travel_to, adults, children, message)
         VALUES (@tour_id, @tour_name, @first_name, @last_name, @email, @phone, @travel_from, @travel_to, @adults, @children, @message)`
      )
      .run({
        tour_id: tour_id ?? null,
        tour_name: tour_name ?? null,
        first_name,
        last_name,
        email,
        phone: phone ?? null,
        travel_from: travel_from ?? null,
        travel_to: travel_to ?? null,
        adults: Number(adults),
        children: Number(children),
        message: message ?? null,
      });

    const enquiry = db
      .prepare("SELECT * FROM enquiries WHERE id = ?")
      .get(result.lastInsertRowid);

    // Send email (non-blocking — don't fail the response if SMTP is misconfigured)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();
      const subject = tour_name
        ? `Safari Enquiry: ${tour_name} — Zusammen Tours`
        : "General Enquiry — Zusammen Tours";

      transporter
        .sendMail({
          from: `"Zusammen Tours Website" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL,
          replyTo: email,
          subject,
          html: buildEmailHtml(enquiry),
        })
        .then(() => console.log(`[email] Enquiry #${enquiry.id} sent to ${process.env.CONTACT_EMAIL}`))
        .catch((err) => console.error("[email] Send failed:", err.message));
    } else {
      console.warn("[email] SMTP credentials not configured — email skipped");
    }

    res.status(201).json({
      message: "Enquiry received. We will be in touch within 24 hours.",
      id: enquiry.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

/* ── GET /api/enquiries — admin ───────────────────────────────── */
router.get("/", adminOnly, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let countSql = "SELECT COUNT(*) AS total FROM enquiries";
    let dataSql = "SELECT * FROM enquiries";
    const params = [];

    if (status) {
      countSql += " WHERE status = ?";
      dataSql += " WHERE status = ?";
      params.push(status);
    }

    dataSql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    const { total } = db.prepare(countSql).get(...params);
    const enquiries = db.prepare(dataSql).all(...params, limit, offset);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: enquiries,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

/* ── PUT /api/enquiries/:id/status — admin ────────────────────── */
router.put("/:id/status", adminOnly, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "in_progress", "responded", "closed"];

    if (!status || !valid.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${valid.join(", ")}` });
    }

    const existing = db
      .prepare("SELECT id FROM enquiries WHERE id = ?")
      .get(req.params.id);

    if (!existing) return res.status(404).json({ error: "Enquiry not found" });

    db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(
      status,
      req.params.id
    );

    const updated = db
      .prepare("SELECT * FROM enquiries WHERE id = ?")
      .get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
});

module.exports = router;
