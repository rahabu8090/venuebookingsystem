"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Info } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "",
    registration_number: "",
    address: "",
    password: "",
    password_confirmation: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const router = useRouter()

  // Validation functions
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(phone)) {
      return "Phone number must be 10 digits long and start with 0"
    }
    return ""
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
    if (!passwordRegex.test(password)) {
      return "Password must contain at least one letter and either a number or special character"
    }
    return ""
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required field validations
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required"
    } else {
      const phoneError = validatePhoneNumber(formData.phone_number)
      if (phoneError) {
        errors.phone_number = phoneError
      }
    }

    if (!formData.role) {
      errors.role = "Role is required"
    }

    if (formData.role === "student" && !formData.registration_number.trim()) {
      errors.registration_number = "Registration number is required for students"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        errors.password = passwordError
      }
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = "Password confirmation is required"
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = "Passwords do not match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setValidationErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    const result = await register(formData)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Registration failed")
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getInputClassName = (fieldName: string) => {
    return `w-full ${validationErrors[fieldName] ? 'border-red-500 focus:border-red-500' : ''}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Fill in your details to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className={getInputClassName("full_name")}
                required
                placeholder="Enter your full name"
              />
              {validationErrors.full_name && (
                <p className="text-sm text-red-600">{validationErrors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={getInputClassName("email")}
                required
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                className={getInputClassName("phone_number")}
                required
                placeholder="e.g., 0912345678"
                maxLength={10}
              />
              {validationErrors.phone_number && (
                <p className="text-sm text-red-600">{validationErrors.phone_number}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                <span>Must be 10 digits starting with 0</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => handleInputChange("role", value)} required>
                <SelectTrigger className={getInputClassName("role")}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="external user">External User</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.role && (
                <p className="text-sm text-red-600">{validationErrors.role}</p>
              )}
            </div>

            {formData.role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange("registration_number", e.target.value)}
                  className={getInputClassName("registration_number")}
                  required
                  placeholder="Enter your registration number"
                />
                {validationErrors.registration_number && (
                  <p className="text-sm text-red-600">{validationErrors.registration_number}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your address (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={getInputClassName("password")}
                  required
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">{validationErrors.password}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                <span>Minimum 8 characters, must contain letters and either numbers or special characters</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                  className={getInputClassName("password_confirmation")}
                  required
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationErrors.password_confirmation && (
                <p className="text-sm text-red-600">{validationErrors.password_confirmation}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
