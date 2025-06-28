"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function VerifyResetPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard')
      return
    }

    // Check for stored email
    const storedEmail = sessionStorage.getItem('reset_email')
    if (!storedEmail) {
      router.push('/auth/reset-password')
    } else {
      setEmail(storedEmail)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          password,
          password_confirmation: passwordConfirmation
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        sessionStorage.removeItem('reset_email')
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasLetter = /[A-Za-z]/.test(password)
    const hasNumberOrSpecial = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    return {
      isValid: minLength && hasLetter && hasNumberOrSpecial,
      minLength,
      hasLetter,
      hasNumberOrSpecial
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === passwordConfirmation

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter the code sent to your email and your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Reset Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="text-center tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className={`pl-10 pr-10 ${password ? (passwordValidation.isValid ? "border-green-500" : "border-red-500") : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 text-xs mt-2">
                  <div className={`flex items-center gap-1 ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.minLength ? "✓" : "✗"} At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasLetter ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.hasLetter ? "✓" : "✗"} Contains letters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordValidation.hasNumberOrSpecial ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.hasNumberOrSpecial ? "✓" : "✗"} Contains numbers or special characters
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="passwordConfirmation"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className={`pl-10 ${passwordConfirmation ? (passwordsMatch ? "border-green-500" : "border-red-500") : ""}`}
                />
              </div>
              {passwordConfirmation && (
                <div className={`flex items-center gap-1 text-xs mt-2 ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                  {passwordsMatch ? "✓" : "✗"} Passwords match
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !passwordValidation.isValid || !passwordsMatch}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>

            <div className="text-center mt-4">
              <Link 
                href="/auth/login" 
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 