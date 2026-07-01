/*
  Email diagnostic script — run on the production server:
    node test-email.js

  Reports exactly where SMTP breaks and tries port 587 as fallback.
*/

require("dotenv").config();
const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env;

console.log("\n=== SMTP CONFIG ===");
console.log("SMTP_HOST    :", SMTP_HOST    || "(not set)");
console.log("SMTP_PORT    :", SMTP_PORT    || "(not set)");
console.log("SMTP_USER    :", SMTP_USER    || "(not set)");
console.log("SMTP_PASS    :", SMTP_PASS    ? `${SMTP_PASS.slice(0, 3)}***` : "(not set)");
console.log("CONTACT_EMAIL:", CONTACT_EMAIL || "(not set)");

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("\n❌ FATAL: One or more SMTP env vars are missing. Cannot proceed.");
  process.exit(1);
}

/* ── Test 1: Port 465, implicit SSL (current config) ──────────── */
async function testTransporter(label, config) {
  console.log(`\n--- ${label} ---`);
  console.log("Config:", JSON.stringify({ host: config.host, port: config.port, secure: config.secure }));
  const t = nodemailer.createTransport({ ...config, tls: { rejectUnauthorized: false } });
  try {
    await t.verify();
    console.log("✅ SMTP verify: connected and authenticated");
    return t;
  } catch (err) {
    console.error("❌ SMTP verify failed:", err.message);
    console.error("   Code:", err.code || "(none)");
    return null;
  }
}

async function trySend(transporter, toAddress, label) {
  console.log(`\n--- Send test email: ${label} ---`);
  try {
    const info = await transporter.sendMail({
      from:    `"Zusammen Test" <${SMTP_USER}>`,
      to:      toAddress,
      subject: `[TEST] Email diagnostic — ${new Date().toISOString()}`,
      text:    "This is a test email from the Zusammen backend diagnostic script.",
    });
    console.log("✅ Email sent. MessageId:", info.messageId);
    console.log("   Response:", info.response);
  } catch (err) {
    console.error("❌ sendMail failed:", err.message);
    console.error("   Code:", err.code || "(none)");
  }
}

(async () => {
  // Test 1: current config (port 465, secure: true)
  let t = await testTransporter("Test 1 — port 465, secure: true", {
    host:   SMTP_HOST,
    port:   465,
    secure: true,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  if (t) {
    await trySend(t, CONTACT_EMAIL, `to CONTACT_EMAIL (${CONTACT_EMAIL})`);
  } else {
    // Test 2: fallback — port 587, STARTTLS
    t = await testTransporter("Test 2 — port 587, secure: false (STARTTLS)", {
      host:   SMTP_HOST,
      port:   587,
      secure: false,
      auth:   { user: SMTP_USER, pass: SMTP_PASS },
    });

    if (t) {
      console.log("\n⚠️  Port 465 is broken but port 587 works.");
      console.log("   → Change SMTP_PORT=587 in .env and restart the server.");
      await trySend(t, CONTACT_EMAIL, `to CONTACT_EMAIL (${CONTACT_EMAIL})`);
    } else {
      // Test 3: try port 25 (last resort — usually blocked on VPS)
      t = await testTransporter("Test 3 — port 25, secure: false", {
        host:   SMTP_HOST,
        port:   25,
        secure: false,
        auth:   { user: SMTP_USER, pass: SMTP_PASS },
      });

      if (t) {
        console.log("\n⚠️  Only port 25 works (unusual). Change SMTP_PORT=25 in .env.");
        await trySend(t, CONTACT_EMAIL, `to CONTACT_EMAIL (${CONTACT_EMAIL})`);
      } else {
        console.error("\n❌ All three ports (465, 587, 25) failed.");
        console.error("   Possible causes:");
        console.error("   1. VPS firewall blocks outbound SMTP — contact hosting to allow outbound 465/587");
        console.error("   2. Wrong SMTP credentials — verify in cPanel > Email Accounts");
        console.error("   3. hera.namhost.com only accepts connections from its own server IP");
        console.error("      → Use a relay like SendGrid, Mailgun, or Brevo instead");
      }
    }
  }

  console.log("\n=== Done ===\n");
})();
