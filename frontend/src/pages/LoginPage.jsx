"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReCAPTCHA from "react-google-recaptcha"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { toast } from "react-toastify"

const SITE_KEY = "6LerupwrAAAAADPDCl36QU7N5DxCl8zqMtzGmLtr"

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [captchaToken, setCaptchaToken] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCaptcha = (token) => {
    setCaptchaToken(token)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      toast.warning("Please complete the CAPTCHA verification")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData)
      const { token, role, isApproved, requiresApproval } = res.data
      localStorage.setItem("token", token)

      if (requiresApproval) {
        setPendingApproval(true)
        toast.warning(
          "Your responder account is pending admin approval. Please wait for approval to access responder features.",
        )
        return
      }

      setSuccess(true)
      toast.success("Login successful! Redirecting...")
      setTimeout(() => {
        setSuccess(false)
        if (role === "admin") navigate("/admin")
        else if (role === "responder") navigate("/responder")
        else navigate("/user")
      }, 1500)
    } catch (err) {
      console.error(err)
      toast.error("Invalid credentials. Please check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  if (pendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
                <CardDescription className="text-base">
                  Your responder account is awaiting admin approval
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Thank you for registering as a responder! Your account has been created successfully, but it requires
                  admin approval before you can access responder features.
                </p>
                
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    localStorage.removeItem("token")
                    setPendingApproval(false)
                  }}
                  className="w-full"
                >
                  Back to Login
                </Button>
             
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
    
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
