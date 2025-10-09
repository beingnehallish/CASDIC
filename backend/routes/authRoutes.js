import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import db from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "yourSecretKey";

const otpStore = {}; // in-memory OTP store

// ✅ Step 1: Register - initial send OTP (saves name, email, password)
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = {
      otp,
      name,
      password,
      expires: Date.now() + 5 * 60 * 1000,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for CASDIC Registration",
      text: `Hello ${name},\n\nYour OTP is: ${otp}\nValid for 5 minutes.\n\nCASDIC Team`,
    });

    console.log("✅ OTP sent to:", email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP SEND ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Step 1b: Resend OTP using only email
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "No OTP record found for this email" });

    // Generate new OTP and update expiration
    const otp = Math.floor(100000 + Math.random() * 900000);
    record.otp = otp;
    record.expires = Date.now() + 5 * 60 * 1000;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for CASDIC Registration",
      text: `Hello ${record.name},\n\nYour new OTP is: ${otp}\nValid for 5 minutes.\n\nCASDIC Team`,
    });

    console.log("✅ OTP resent to:", email);
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("❌ OTP RESEND ERROR:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// ✅ Step 2: Verify OTP and save user
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ error: "OTP not found" });
  if (Date.now() > record.expires) return res.status(400).json({ error: "OTP expired" });
  if (Number(otp) !== record.otp) return res.status(400).json({ error: "Invalid OTP" });

  // Hash password and save user
  bcrypt.hash(record.password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err });

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [record.name, email, hash, "user"],
      (err) => {
        if (err) return res.status(500).json({ error: err });

        // Clear OTP from store
        delete otpStore[email];
        res.json({ message: "User registered successfully!" });
      }
    );
  });
});
// ✅ Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
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

// ✅ Change Password
router.put("/change-password", verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  db.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    bcrypt.compare(currentPassword, user.password, (err, match) => {
      if (!match) return res.status(400).json({ message: "Current password is incorrect" });

      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: err });

        db.query(
          "UPDATE users SET password = ? WHERE user_id = ?",
          [hash, userId],
          (err) => {
            if (err) return res.status(500).json({ message: err });
            res.json({ message: "Password updated successfully" });
          }
        );
      });
    });
  });
});

export default router;
