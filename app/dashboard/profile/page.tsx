"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, Building, GraduationCap } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Use ref to track original values that can be updated
  const originalDataRef = useRef({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  })

  const [originalData, setOriginalData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
  })

  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
  })
  const [loading, setLoading] = useState(false)

  // Update original data when user changes
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.full_name,
        email: user.email,
        phone: user.phone_number,
      }
      setOriginalData(userData)
      setFormData(userData)
    }
  }, [user])

  if (!user) return null

  // Helper function to get only changed fields
  const getChangedFields = () => {
    const changedFields: any = {}
    
    if (formData.name !== originalData.name) {
      changedFields.name = formData.name
    }
    if (formData.email !== originalData.email) {
      changedFields.email = formData.email
    }
    if (formData.phone !== originalData.phone) {
      changedFields.phone = formData.phone
    }
    
    return changedFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const changedFields = getChangedFields()
      
      // Check if any fields have changed
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected. Please modify at least one field before updating.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(changedFields),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        })
        
        // Update local storage with new user data
        const updatedUser = { ...user, ...result.data.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update the original data to reflect the new values
        originalDataRef.current = {
          full_name: result.data.user.full_name || result.data.user.name || formData.name,
          email: result.data.user.email || formData.email,
          phone_number: result.data.user.phone_number || result.data.user.phone || formData.phone,
        }
        
        // Update form data to match the new original values
        setFormData({
          name: originalDataRef.current.full_name,
          email: originalDataRef.current.email,
          phone: originalDataRef.current.phone_number,
        })
        
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Helper function to check if a field has changed
  const hasFieldChanged = (field: keyof typeof formData) => {
    return formData[field] !== originalData[field]
  }

  // Helper function to get field status
  const getFieldStatus = (field: keyof typeof formData) => {
    return hasFieldChanged(field) ? "modified" : "unchanged"
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      case "external user":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "student":
        return "Student"
      case "staff":
        return "Staff"
      case "external user":
        return "External User"
      case "admin":
        return "Admin"
      default:
        return "Unknown"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return GraduationCap
      case "staff":
        return Building
      case "external user":
        return Building
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(user.role)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-600" />
              </div>
              <CardTitle>{user.full_name || "User"}</CardTitle>
              <CardDescription>{user.email || "No email"}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Badge className={`${getRoleColor(user.role)} flex items-center gap-2 justify-center`}>
                <RoleIcon className="w-4 h-4" />
                {getRoleDisplayName(user.role)}
              </Badge>

              {user.registration_number && (
                <div className="text-sm">
                  <span className="font-medium">Student ID:</span> {user.registration_number}
                </div>
              )}

              {user.department && (
                <div className="text-sm">
                  <span className="font-medium">Department:</span> {user.department}
                </div>
              )}

              {user.organization && (
                <div className="text-sm">
                  <span className="font-medium">Organization:</span> {user.organization}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                      {hasFieldChanged('name') && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Modified
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={hasFieldChanged('name') ? 'border-blue-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                      {hasFieldChanged('email') && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Modified
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={hasFieldChanged('email') ? 'border-blue-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                      {hasFieldChanged('phone') && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Modified
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={hasFieldChanged('phone') ? 'border-blue-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      Role
                    </Label>
                    <Input
                      value={getRoleDisplayName(user.role)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Read-only Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.registration_number && (
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={user.registration_number}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    {user.department && (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={user.department}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    {user.organization && (
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          value={user.organization}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    You can update your name, email, and phone number individually. Only modified fields will be sent to the server. Other information like your role, student ID, department, and organization cannot be changed. Contact administration if you need to update these details.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
