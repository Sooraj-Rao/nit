const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware")
const { login, register, getCurrentUser, updateResponderApproval } = require("../controllers/authController")
const User = require("../models/User")
const Alert = require("../models/Alert")
const UserAlert = require("../models/UserAlert")

// In-memory OTP store
const otpStore = {}

router.put("/responder-approval/:userId", authenticate, authorizeAdmin, updateResponderApproval)

// Stats: Count users and responders
router.get("/stats", async (req, res) => {
  try {
    const responders = await User.countDocuments({ role: "responder" })
    const users = await User.countDocuments({ role: "user" })
    const alerts = await Alert.countDocuments()
    const userAlerts = await UserAlert.countDocuments()

    res.json({ responders, users, alerts: alerts + userAlerts })
  } catch (err) {
    console.error("Stats error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Auth routes
router.post("/register", register)
router.post("/login", login)
router.get("/me", authenticate, getCurrentUser)

// OTP: Send OTP + Welcome Email
router.post("/send-otp", async (req, res) => {
  const { email, name } = req.body
  if (!email || !name) return res.status(400).json({ error: "Email and name are required" })

  const otp = crypto.randomInt(100000, 999999).toString()

  // Set up email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASSWORD,
    },
  })

  try {
    // Send OTP Email
    await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to: email,
      subject: "🛡️ Emergency System OTP Verification",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hello ${name},</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="color:#d32f2f">${otp}</h1>
          <p>This code is valid for 5 minutes.</p>
        </div>
      `,
    })

    // Send Welcome Email
    await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to: email,
      subject: "✅ Welcome to Emergency Response System!",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hi ${name},</h2>
          <p>Thank you for registering with <strong>Emergency Response System</strong>.</p>
          <p>We're excited to have you on board to make a difference in crisis situations.</p>
          <p>Stay safe, stay connected. 🚨</p>
        </div>
      `,
    })

    // Store OTP temporarily
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }

    res.json({ success: true })
  } catch (err) {
    console.error("Error sending OTP/email:", err)
    res.status(500).json({ error: "Failed to send OTP and welcome email" })
  }
})

// OTP: Verify
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" })

  const record = otpStore[email]

  if (!record) {
    return res.status(400).json({ verified: false, message: "OTP not found" })
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email]
    return res.status(400).json({ verified: false, message: "OTP expired" })
  }

  if (otp === record.code) {
    delete otpStore[email]
    return res.json({ verified: true })
  } else {
    return res.status(400).json({ verified: false, message: "Invalid OTP" })
  }
})

module.exports = router
