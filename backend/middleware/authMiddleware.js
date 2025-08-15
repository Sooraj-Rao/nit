const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to authenticate user via JWT token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Example: { id: '...', role: 'admin' or 'responder' or 'volunteer' }
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

// Middleware to allow only admin users
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied - Admins only" })
  }
  next()
}

const requireApprovedResponder = async (req, res, next) => {
  try {
    // Skip approval check for admin users
    if (req.user?.role === "admin") {
      return next()
    }

    // Only check approval for responders
    if (req.user?.role === "responder") {
      const user = await User.findById(req.user.id)

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      if (!user.isApproved) {
        return res.status(403).json({
          error: "Account pending approval",
          message:
            "Your responder account is pending admin approval. Please wait for approval before accessing responder features.",
        })
      }
    }

    next()
  } catch (err) {
    console.error("Approval check error:", err)
    return res.status(500).json({ error: "Server error during approval check" })
  }
}

const requireApprovedUser = async (req, res, next) => {
  try {
    // Skip approval check for admin users
    if (req.user?.role === "admin") {
      return next()
    }

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (!user.isApproved) {
      return res.status(403).json({
        error: "Account pending approval",
        message:
          user.role === "responder"
            ? "Your responder account is pending admin approval. Please wait for approval before accessing responder features."
            : "Your account is pending approval. Please contact an administrator.",
      })
    }

    next()
  } catch (err) {
    console.error("Approval check error:", err)
    return res.status(500).json({ error: "Server error during approval check" })
  }
}

module.exports = { authenticate, authorizeAdmin, requireApprovedResponder, requireApprovedUser }
