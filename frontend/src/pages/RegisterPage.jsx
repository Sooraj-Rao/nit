"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { toast } from "react-toastify"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    place: "",
    pincode: "",
    phone: "",
  })

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const sendOtp = async () => {
    const { email, name } = formData
    if (!email || !name) {
      toast.warning("Name and Email are required to send OTP")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { email, name })
      if (res.data.success) {
        setOtpSent(true)
        setError("")
        toast.success("OTP sent to your email successfully!")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter the OTP")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp,
      })
      if (res.data.verified) {
        setVerified(true)
        toast.success("OTP verified successfully! You can now complete registration.")
      } else {
        toast.error("Invalid OTP. Please try again.")
      }
    } catch (err) {
      toast.error("OTP verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!verified) {
      toast.warning("Please verify your OTP before registering.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData)
      const { requiresApproval: needsApproval } = response.data

      setRegistrationComplete(true)
      setRequiresApproval(needsApproval)

      if (needsApproval) {
        toast.success("Registration successful! Your responder account is pending admin approval.")
      } else {
        toast.success("Registration successful! You can now sign in.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: "user", label: "User", description: "Report emergencies and get help" },
    { value: "responder", label: "Responder", description: "Respond to emergency alerts" },
  ]

  if (registrationComplete) {
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
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  requiresApproval ? "bg-orange-100 dark:bg-orange-950/20" : "bg-green-100 dark:bg-green-950/20"
                }`}
              >
                {requiresApproval ? (
                  <Clock className="h-8 w-8 text-orange-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {requiresApproval ? "Registration Pending" : "Registration Complete"}
                </CardTitle>
                <CardDescription className="text-base">
                  {requiresApproval
                    ? "Your responder account is awaiting approval"
                    : "Welcome to Emergency Response System"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                {requiresApproval ? (
                  <>
                    <p className="text-muted-foreground">
                      Thank you for registering as a responder! Your account has been created successfully, but it
                      requires admin approval before you can access responder features.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      Your account has been created successfully! You can now sign in and start using the Emergency
                      Response System.
                    </p>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Welcome to our community of emergency responders and users working together to save lives.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate("/")} className="w-full">
                  {requiresApproval ? "Back to Login" : "Sign In Now"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {requiresApproval
                    ? "You can still sign in, but responder features will be available after approval."
                    : "Ready to make a difference in emergency situations."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      {/* Status Messages */}
      

      {/* Registration Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Join Emergency Response</CardTitle>
              <CardDescription className="text-base">Create your account to help save lives</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

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
              </div>

              {/* OTP Section */}
              {!otpSent ? (
                <Button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || !formData.name || !formData.email}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send OTP to Email</span>
                    </div>
                  )}
                </Button>
              ) : !verified ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="pl-10"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading || !otp}
                    className="w-full"
                    variant="success"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="loading-spinner" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verify OTP</span>
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Email verified successfully!
                  </span>
                </div>
              )}

              {/* Additional Fields - Only show after verification */}
              {verified && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a strong password"
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Place</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          name="place"
                          placeholder="Enter your city/town"
                          className="pl-10"
                          value={formData.place}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          name="pincode"
                          placeholder="Enter your pincode"
                          className="pl-10"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Your Role</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roleOptions.map((role) => (
                        <label
                          key={role.value}
                          className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                            formData.role === role.value
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/20 hover:border-muted-foreground/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-sm">
                                <div className="font-medium">{role.label}</div>
                                <div className="text-muted-foreground">{role.description}</div>
                                {role.value === "responder" && (
                                  <div className="text-xs text-orange-600 mt-1">Requires admin approval</div>
                                )}
                              </div>
                            </div>
                            {formData.role === role.value && (
                              <Badge variant="default" className="ml-2">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="loading-spinner" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </Button>
                </>
              )}

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage
