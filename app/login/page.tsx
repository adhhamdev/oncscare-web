"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Eye, EyeOff, Heart, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")

  const router = useRouter()
  const { login, resetPassword, user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.")
          break
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.")
          break
        case "auth/invalid-email":
          setError("Please enter a valid email address.")
          break
        case "auth/user-disabled":
          setError("This account has been disabled. Please contact support.")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.")
          break
        default:
          setError("Login failed. Please check your credentials and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResetMessage("")

    if (!resetEmail) {
      setError("Please enter your email address.")
      return
    }

    try {
      await resetPassword(resetEmail)
      setResetMessage("Password reset email sent! Check your inbox.")
      setShowForgotPassword(false)
      setResetEmail("")
    } catch (error: any) {
      console.error("Reset password error:", error)

      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.")
          break
        case "auth/invalid-email":
          setError("Please enter a valid email address.")
          break
        default:
          setError("Failed to send reset email. Please try again.")
      }
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <Heart className="w-6 h-6 text-white fill-white" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-6 border-2 border-white rounded-full transform rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-teal-400">OncsCare</h1>
            <p className="text-gray-400 text-lg">
              {showForgotPassword
                ? "Enter your email to reset your password"
                : "Let's get started by filling out the form below."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {resetMessage && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-transparent border-gray-600 border-2 rounded-full text-white placeholder-gray-400 focus:border-teal-400 focus:ring-teal-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 bg-transparent border-gray-600 border-2 rounded-full text-white placeholder-gray-400 focus:border-teal-400 focus:ring-teal-400"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full text-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="sr-only">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-14 bg-transparent border-gray-600 border-2 rounded-full text-white placeholder-gray-400 focus:border-teal-400 focus:ring-teal-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full text-lg transition-colors"
              >
                Send Reset Email
              </Button>

              {/* Back to Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setError("")
                    setResetMessage("")
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-teal-500 items-center justify-center p-8 relative overflow-hidden">
        <div className="relative">
          {/* Mobile Device Illustration */}
          <div className="w-80 h-96 bg-teal-600 rounded-3xl shadow-2xl relative">
            {/* Screen */}
            <div className="absolute inset-4 bg-teal-400 rounded-2xl">
              {/* Keypad Grid */}
              <div className="p-8 grid grid-cols-3 gap-4 h-3/4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-white rounded-full opacity-90" />
                ))}
              </div>

              {/* Bottom Screen Area */}
              <div className="absolute bottom-4 left-4 right-4 h-20 bg-white rounded-xl shadow-inner">
                <div className="p-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>

            {/* Side Elements */}
            <div className="absolute -right-8 top-20 w-16 h-32 bg-teal-400 rounded-l-2xl" />
            <div className="absolute -right-12 top-32 w-20 h-16 bg-teal-300 rounded-l-2xl" />
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-400 rounded-full opacity-30" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-teal-600 rounded-full opacity-40" />
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 right-8 text-teal-200 text-sm opacity-60">Secure Access</div>
      </div>

      {/* Mobile Background for smaller screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 opacity-10 pointer-events-none" />
    </div>
  )
}
