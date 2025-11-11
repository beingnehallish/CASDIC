// routes/authRoutes.js
import "dotenv/config";                // ensure env is loaded even if imported before server.js
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "yourSecretKey";
const otpStore = {}; // { [email]: { otp, name, password, expires } }

const normEmail = (e) => String(e || "").trim().toLowerCase();
const normText  = (s) => String(s || "").trim();
const genOtp    = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit STRING

// Create transporter once
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  // optional: verify SMTP at boot
  transporter.verify()
    .then(() => console.log("✅ SMTP transporter ready"))
    .catch((e) => console.error("❌ SMTP verify failed:", e?.message || e));
}

/* =========================
   SEND OTP (register step)
========================= */
router.post("/send-otp", async (req, res) => {
  try {
    const name = normText(req.body.name);
    const email = normEmail(req.body.email);
    const password = normText(req.body.password); // raw for now; we hash on verify

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    const otp = genOtp();
    otpStore[email] = { otp, name, password, expires: Date.now() + 5 * 60 * 1000 };

    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for CASDIC Registration",
        text: `Hello ${name},\n\nYour OTP is: ${otp}\nValid for 5 minutes.\n\nCASDIC Team`,
      });
    } else {
      console.log(`[DEV][SEND-OTP] No transporter configured. OTP for ${email}: ${otp}`);
    }

    // if you want to see OTP in dev, uncomment next 2 lines:
    // const payload = { message: "OTP sent successfully" };
    // if (!transporter || process.env.NODE_ENV !== "production") payload.devOtp = otp, res.json(payload); else
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ /send-otp error:", err?.message || err);
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json({ message: "OTP generated (dev)" });
    }
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* =========================
   RESEND OTP (email only)
========================= */
router.post("/resend-otp", async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    if (!email) return res.status(400).json({ error: "Email required" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "No OTP record found for this email" });

    record.otp = genOtp();
    record.expires = Date.now() + 5 * 60 * 1000;

    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for CASDIC Registration",
        text: `Hello ${record.name},\n\nYour new OTP is: ${record.otp}\nValid for 5 minutes.\n\nCASDIC Team`,
      });
    } else {
      console.log(`[DEV][RESEND-OTP] No transporter configured. OTP for ${email}: ${record.otp}`);
    }

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("❌ /resend-otp error:", err?.message || err);
    if (process.env.NODE_ENV !== "production") {
      return res.status(200).json({ message: "OTP regenerated (dev)" });
    }
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

/* =========================
   VERIFY OTP  (hash & upsert)
========================= */
router.post("/verify-otp", (req, res) => {
  const email = normEmail(req.body.email);
  const otp   = normText(req.body.otp);

  const record = otpStore[email];
  if (!record) return res.status(400).json({ error: "OTP not found" });
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }
  if (otp !== record.otp) return res.status(400).json({ error: "Invalid OTP" });

  // Hash the password now
  bcrypt.hash(record.password, 10, (hashErr, hash) => {
    if (hashErr) {
      console.error("❌ bcrypt hash error:", hashErr);
      return res.status(500).json({ error: "Hashing error" });
    }

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role)
    `;

    db.query(sql, [record.name, email, hash, "user"], (dbErr) => {
      if (dbErr) {
        console.error("❌ /verify-otp DB error:", dbErr);
        return res.status(500).json({ error: "Database error" });
      }
      delete otpStore[email];
      res.json({ message: "User registered/updated successfully!" });
    });
  });
});

/* =========================
   LOGIN (bcrypt compare)
========================= */
router.post("/login", (req, res) => {
  const email    = normEmail(req.body.email);
  const password = normText(req.body.password);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("❌ /login DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];
    bcrypt.compare(password, String(user.password), (cmpErr, match) => {
      if (cmpErr) {
        console.error("❌ bcrypt compare error:", cmpErr);
        return res.status(500).json({ error: "Hash compare error" });
      }
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({ token, role: user.role, name: user.name });
    });
  });
});

/* =========================
   CHANGE PASSWORD (bcrypt)
========================= 
router.put("/change-password", verifyToken, (req, res) => {
   const { currentPassword, newPassword } = req.body;
   const userId = req.user?.id;
   if (!userId) return res.status(401).json({ message: "Unauthorized: user id missing" });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(422).json({ message: "New password must be at least 8 characters" });
    }

    db.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!results.length) return res.status(404).json({ message: "User not found" });

      const user = results[0];
      bcrypt.compare(String(currentPassword || ""), String(user.password), (cmpErr, ok) => {
        if (cmpErr) return res.status(500).json({ message: "Hash compare error" });
        if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

        bcrypt.hash(String(newPassword || "").trim(), 10, (hashErr, hash) => {
          if (hashErr) return res.status(500).json({ message: "Hashing error" });

          db.query(
            "UPDATE users SET password = ? WHERE user_id = ?",
            [hash, userId],
            (updErr) => {
              if (updErr) return res.status(500).json({ message: "DB error" });
-             res.json({ message: "Password updated successfully" });
+             res.json({ message: "Password updated successfully" });
            }
          );
        });
      });
    });
  });
*/
export default router;
