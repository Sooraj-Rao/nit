"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReCAPTCHA from "react-google-recaptcha"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"

const SITE_KEY = "6LerupwrAAAAADPDCl36QU7N5DxCl8zqMtzGmLtr"

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [captchaToken, setCaptchaToken] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCaptcha = (token) => {
    setCaptchaToken(token)
  }
console.log('hi')
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification")
      setTimeout(() => setError(""), 3000)
      return
    }

    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData)
      const { token, role } = res.data
      localStorage.setItem("token", token)

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        if (role === "admin") navigate("/admin")
        else if (role === "responder") navigate("/responder")
        else navigate("/user")
      }, 1500)
    } catch (err) {
      console.error(err)
      setError("Invalid credentials. Please check your email and password.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Login successful! Redirecting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">Sign in to your Emergency Response account</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA sitekey={SITE_KEY} onChange={handleCaptcha} theme="light" />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create one here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-3 text-primary">Emergency Contacts</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  Fire: <span className="font-bold text-red-500">101</span>
                </div>
                <div>
                  Police: <span className="font-bold text-blue-500">100</span>
                </div>
                <div>
                  Medical: <span className="font-bold text-green-500">108</span>
                </div>
                <div>
                  Disaster: <span className="font-bold text-orange-500">1077</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
