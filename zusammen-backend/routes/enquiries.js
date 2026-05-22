const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const db = require("../database/db");

/* ── HELPERS ──────────────────────────────────────────────── */
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

/* ── EMAIL: business notification ─────────────────────────── */
function buildBusinessEmail(e) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
  .hdr{background:#1F3A6D;padding:28px 32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}
  .hdr p{color:rgba(255,255,255,.75);margin:6px 0 0;font-size:13px}
  .body{padding:28px 32px}
  .sec-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#F7941D;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid #e8e8e8}
  .row{display:flex;margin-bottom:8px}
  .lbl{color:#666;font-size:13px;min-width:150px;flex-shrink:0}
  .val{color:#1F3A6D;font-size:13px;font-weight:600}
  .msg-box{background:#F8FAFC;border-left:3px solid #F7941D;padding:14px 16px;border-radius:0 4px 4px 0;font-size:13px;color:#444;line-height:1.6;margin-top:6px;white-space:pre-wrap}
  .note{background:#fffbec;border:1px solid #f0d060;border-radius:4px;padding:12px 16px;font-size:12px;color:#856404;margin-top:20px}
  .ftr{background:#F7F9FC;padding:16px 32px;text-align:center;border-top:1px solid #e8e8e8}
  .ftr p{color:#666;font-size:12px;margin:0 0 4px}
  .ftr a{color:#1F3A6D;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>New Safari Enquiry — Zusammen Tours</h1>
    <p>A client has requested information about a tour</p>
  </div>
  <div class="body">
    <div class="sec-title">Client Details</div>
    <div class="row"><span class="lbl">Full Name</span><span class="val">${e.first_name} ${e.last_name}</span></div>
    <div class="row"><span class="lbl">Email</span><span class="val"><a href="mailto:${e.email}" style="color:#1F3A6D">${e.email}</a></span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${e.phone || "—"}</span></div>

    <div class="sec-title">Tour Details</div>
    <div class="row"><span class="lbl">Tour</span><span class="val">${e.tour_name || "General Enquiry"}</span></div>
    <div class="row"><span class="lbl">Travel From</span><span class="val">${e.travel_from || "—"}</span></div>
    <div class="row"><span class="lbl">Travel To</span><span class="val">${e.travel_to || "—"}</span></div>
    <div class="row"><span class="lbl">Adults</span><span class="val">${e.adults} (at full rate)</span></div>
    <div class="row"><span class="lbl">Children (3–12)</span><span class="val">${e.children} (at 60% of adult rate)</span></div>

    ${e.message ? `<div class="sec-title">Message</div><div class="msg-box">${e.message.replace(/\n/g, "<br>")}</div>` : ""}

    <div class="note"><strong>Child Pricing:</strong> Children aged 3–12 travel at <strong>60% of the adult rate</strong>. Please apply the discount when preparing the quote.</div>
  </div>
  <div class="ftr">
    <p>Reply directly to this email to respond to the client.</p>
    <p>Zusammen Tours &nbsp;|&nbsp; <a href="tel:+264812455852">+264 81 245 5852</a> &nbsp;|&nbsp; <a href="mailto:info@zusammentravels.com">info@zusammentravels.com</a></p>
  </div>
</div>
</body></html>`;
}

/* ── EMAIL: client confirmation ───────────────────────────── */
function buildClientEmail(e) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
  .hdr{background:#1F3A6D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:24px;letter-spacing:.5px}
  .hdr p{color:rgba(255,255,255,.75);margin:8px 0 0;font-size:14px}
  .body{padding:32px}
  .body p{color:#444;font-size:14px;line-height:1.7;margin:0 0 14px}
  .summary{background:#F8FAFC;border-radius:8px;padding:20px 24px;margin:20px 0}
  .summary h3{color:#1F3A6D;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin:0 0 12px}
  .sum-row{display:flex;margin-bottom:8px;font-size:13px}
  .sum-lbl{color:#666;min-width:130px;flex-shrink:0}
  .sum-val{color:#1F3A6D;font-weight:600}
  .contact-box{background:#1F3A6D;border-radius:8px;padding:20px 24px;margin:20px 0;text-align:center}
  .contact-box p{color:rgba(255,255,255,.8);font-size:13px;margin:0 0 10px}
  .contact-box a{color:#F7941D;font-weight:700;text-decoration:none;font-size:14px}
  .ftr{background:#F7F9FC;padding:20px 32px;text-align:center;border-top:1px solid #e8e8e8}
  .ftr p{color:#666;font-size:12px;margin:0}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>Thank You for Your Enquiry</h1>
    <p>Zusammen Tours &amp; Travel Agency</p>
  </div>
  <div class="body">
    <p>Dear <strong>${e.first_name}</strong>,</p>
    <p>Thank you for your interest in the <strong>${e.tour_name || "safari experience"}</strong> with Zusammen Tours. We are thrilled that you are considering exploring Africa with us.</p>
    <p>Our team will review your enquiry and be in touch within <strong>24 hours</strong> to discuss your safari in detail, answer any questions, and prepare a personalised quote.</p>

    <div class="summary">
      <h3>Your Enquiry Summary</h3>
      <div class="sum-row"><span class="sum-lbl">Tour</span><span class="sum-val">${e.tour_name || "General Enquiry"}</span></div>
      <div class="sum-row"><span class="sum-lbl">Travel From</span><span class="sum-val">${e.travel_from || "—"}</span></div>
      <div class="sum-row"><span class="sum-lbl">Travel To</span><span class="sum-val">${e.travel_to || "—"}</span></div>
      <div class="sum-row"><span class="sum-lbl">Adults</span><span class="sum-val">${e.adults}</span></div>
      <div class="sum-row"><span class="sum-lbl">Children (3–12)</span><span class="sum-val">${e.children}</span></div>
    </div>

    <p>In the meantime, if you have any urgent questions, please don't hesitate to reach out:</p>

    <div class="contact-box">
      <p>We're happy to help</p>
      <a href="tel:+264812455852">+264 81 245 5852</a><br><br>
      <a href="mailto:info@zusammentravels.com">info@zusammentravels.com</a>
    </div>

    <p>We look forward to helping you plan your perfect African safari.</p>
    <p>Warm regards,<br><strong>The Zusammen Tours Team</strong></p>
  </div>
  <div class="ftr">
    <p>Zusammen Tours &amp; Travel Agency &nbsp;|&nbsp; Namibia &nbsp;|&nbsp; <a href="https://zusammentravels.com" style="color:#1F3A6D">zusammentravels.com</a></p>
  </div>
</div>
</body></html>`;
}

/* ── POST /api/enquiries ──────────────────────────────────── */
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

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        error: "Required fields: first_name, last_name, email",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email address" });
    }

    const result = db
      .prepare(
        `INSERT INTO enquiries (tour_id, tour_name, first_name, last_name, email, phone, travel_from, travel_to, adults, children, message)
         VALUES (@tour_id, @tour_name, @first_name, @last_name, @email, @phone, @travel_from, @travel_to, @adults, @children, @message)`
      )
      .run({
        tour_id:     tour_id     ?? null,
        tour_name:   tour_name   ?? null,
        first_name,
        last_name,
        email,
        phone:       phone       ?? null,
        travel_from: travel_from ?? null,
        travel_to:   travel_to   ?? null,
        adults:      Number(adults),
        children:    Number(children),
        message:     message     ?? null,
      });

    const enquiry = db
      .prepare("SELECT * FROM enquiries WHERE id = ?")
      .get(result.lastInsertRowid);

    // Send emails — errors are logged but never fail the response
    if (process.env.SMTP_USER && process.env.SMTP_PASS &&
        process.env.SMTP_USER !== 'your-gmail@gmail.com') {
      const transporter = createTransporter();

      // Email 1: business notification
      transporter.sendMail({
        from:    `"Zusammen Tours Website" <${process.env.SMTP_USER}>`,
        to:      process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `New Safari Enquiry: ${tour_name || "General"} — Zusammen Tours`,
        html:    buildBusinessEmail(enquiry),
      })
      .then(() => console.log(`[email] Business notification #${enquiry.id} sent`))
      .catch(err => console.error("[email] Business email failed:", err.message));

      // Email 2: client confirmation
      transporter.sendMail({
        from:    `"Zusammen Tours" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: "Thank you for your enquiry — Zusammen Tours",
        html:    buildClientEmail(enquiry),
      })
      .then(() => console.log(`[email] Client confirmation sent to ${email}`))
      .catch(err => console.error("[email] Client email failed:", err.message));
    } else {
      console.warn("[email] SMTP not configured — emails skipped");
    }

    res.status(201).json({ success: true, id: enquiry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to submit enquiry" });
  }
});

/* ── GET /api/enquiries — admin ───────────────────────────── */
router.get("/", adminOnly, (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let countSql = "SELECT COUNT(*) AS total FROM enquiries";
    let dataSql  = "SELECT * FROM enquiries";
    const params = [];

    if (status) {
      countSql += " WHERE status = ?";
      dataSql  += " WHERE status = ?";
      params.push(status);
    }

    dataSql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    const { total } = db.prepare(countSql).get(...params);
    const enquiries = db.prepare(dataSql).all(...params, limit, offset);

    res.json({ total, page, limit, pages: Math.ceil(total / limit), count: total, data: enquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

/* ── PUT /api/enquiries/:id — admin ───────────────────────── */
router.put("/:id", adminOnly, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["new", "in-progress", "replied", "closed"];

    if (!status || !valid.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${valid.join(", ")}` });
    }

    const existing = db.prepare("SELECT id FROM enquiries WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Enquiry not found" });

    db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json(db.prepare("SELECT * FROM enquiries WHERE id = ?").get(req.params.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
});

/* ── DELETE /api/enquiries/:id — admin (hard delete) ─────── */
router.delete("/:id", adminOnly, (req, res) => {
  try {
    const existing = db.prepare("SELECT id FROM enquiries WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Enquiry not found" });

    db.prepare("DELETE FROM enquiries WHERE id = ?").run(req.params.id);
    res.json({ message: "Enquiry deleted", id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete enquiry" });
  }
});

module.exports = router;
