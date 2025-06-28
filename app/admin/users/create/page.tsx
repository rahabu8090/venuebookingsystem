"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
    address: "",
    department: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  // Validation functions
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

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0\d{9}$/
    return phoneRegex.test(phone)
  }

  const passwordValidation = validatePassword(formData.password)
  const phoneValidation = validatePhoneNumber(formData.phone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Client-side validation
    if (!passwordValidation.isValid) {
      setError("Password must be at least 8 characters long and contain letters and either numbers or special characters")
      setLoading(false)
      return
    }

    if (!phoneValidation) {
      setError("Phone number must be 10 digits long and start with 0")
      setLoading(false)
      return
    }

    if (formData.password !== formData.passwordConfirmation) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Add the admin role to the form data
    const adminData = {
      ...formData,
      role: "admin"
    }

    const result = await register(adminData)

    if (result.success) {
      router.push("/admin/users")
    } else {
      setError(result.error || "Failed to create admin user")
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Admin User</CardTitle>
            <CardDescription>Create a new administrator account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="Enter email address"
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
                    required
                    placeholder="Enter password"
                    className={formData.password ? (passwordValidation.isValid ? "border-green-500" : "border-red-500") : ""}
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
                
                {formData.password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}>
                      {passwordValidation.minLength ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasLetter ? "text-green-600" : "text-red-600"}`}>
                      {passwordValidation.hasLetter ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Contains letters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasNumberOrSpecial ? "text-green-600" : "text-red-600"}`}>
                      {passwordValidation.hasNumberOrSpecial ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Contains numbers or special characters
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={formData.passwordConfirmation}
                    onChange={(e) => handleInputChange("passwordConfirmation", e.target.value)}
                    required
                    placeholder="Confirm password"
                    className={formData.passwordConfirmation ? (formData.password === formData.passwordConfirmation ? "border-green-500" : "border-red-500") : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  >
                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {formData.passwordConfirmation && (
                  <div className={`flex items-center gap-1 text-xs ${formData.password === formData.passwordConfirmation ? "text-green-600" : "text-red-600"}`}>
                    {formData.password === formData.passwordConfirmation ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    Passwords match
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  placeholder="e.g., 0912345678"
                  maxLength={10}
                  className={formData.phone ? (phoneValidation ? "border-green-500" : "border-red-500") : ""}
                />
                <p className="text-xs text-gray-500">
                  Must be 10 digits starting with 0 (e.g., 0912345678)
                </p>
                {formData.phone && !phoneValidation && (
                  <p className="text-xs text-red-600">
                    Phone number must be 10 digits long and start with 0
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  placeholder="Enter address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  required
                  placeholder="Enter department"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !passwordValidation.isValid || !phoneValidation || formData.password !== formData.passwordConfirmation}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin User
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 