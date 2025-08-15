// File: controllers/authController.js
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, place, pincode, phone } = req.body
    if (email === ADMIN_EMAIL || role === "admin") {
      return res.status(403).json({ error: "Admin cannot be registered manually." })
    }
    if (!name || !email || !password || !role || !place || !pincode || !phone) {
      return res.status(400).json({ error: "Please fill all required fields" })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password: hashedPassword, role, place, pincode, phone })
    await newUser.save()

    const message =
      role === "responder"
        ? "Responder registered successfully! Your account is pending admin approval."
        : "User registered successfully!"

    res.status(201).json({
      message,
      requiresApproval: role === "responder",
    })
  } catch (err) {
    console.error("Registration Error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  if (email === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid admin password" })
    }
    const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" })
    return res.json({ token, role: "admin" })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: "Invalid credentials" })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({
      token,
      role: user.role,
      isApproved: user.isApproved,
      requiresApproval: user.role === "responder" && !user.isApproved,
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get current logged-in user (for /me route)
exports.getCurrentUser = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json({ id: "admin", name: "Admin", role: "admin", isApproved: true })
    }

    const user = await User.findById(req.user.id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })

    res.json(user)
  } catch (err) {
    console.error("Get current user error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

exports.updateResponderApproval = async (req, res) => {
  try {
    const { userId } = req.params
    const { isApproved } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.role !== "responder") {
      return res.status(400).json({ error: "User is not a responder" })
    }

    user.isApproved = isApproved
    await user.save()

    res.json({
      message: `Responder ${isApproved ? "approved" : "disapproved"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
      },
    })
  } catch (err) {
    console.error("Update responder approval error:", err)
    res.status(500).json({ error: "Server error" })
  }
}
