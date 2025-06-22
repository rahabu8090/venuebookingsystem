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
import { Loader2, User, Mail, Phone, Building, GraduationCap, Upload, Camera } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  full_name: string
  email: string
  image_path: string | null
  role: string
  phone_number: string
  registration_number: string | null
  address: string | null
  profile_picture: string | null
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use ref to track original values that can be updated
  const originalDataRef = useRef({
    full_name: "",
    email: "",
    phone_number: "",
  })

  const [originalData, setOriginalData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  })

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  })

  // Get API base URL from environment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  // Fetch user profile from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in again",
            variant: "destructive",
          })
          return
        }

        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data.user) {
          const user = result.data.user
          setUserProfile(user)
          
          // Set form data with correct field names
          const userData = {
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
          }
          
          setOriginalData(userData)
          setFormData(userData)
          
          // Update ref
          originalDataRef.current = userData
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch user profile",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchUserProfile()
    }
  }, [authUser, toast, API_BASE_URL])

  if (!authUser || !userProfile) {
    if (loading) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      )
    }
    return null
  }

  // Helper function to get user image URL
  const getUserImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || API_BASE_URL
    return `${baseUrl}${imagePath}`
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPG, JPEG, or PNG file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to upload",
        variant: "destructive",
      })
      return
    }

    setImageLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch(`${API_BASE_URL}/user/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data.user) {
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        })
        
        // Update user profile with new image
        setUserProfile(result.data.user)
        
        // Clear selection and preview
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast({
          title: "Upload Failed",
          description: result.message || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the image",
        variant: "destructive",
      })
    } finally {
      setImageLoading(false)
    }
  }

  // Helper function to get only changed fields
  const getChangedFields = () => {
    const changedFields: any = {}
    
    if (formData.full_name !== originalData.full_name) {
      changedFields.full_name = formData.full_name
    }
    if (formData.email !== originalData.email) {
      changedFields.email = formData.email
    }
    if (formData.phone_number !== originalData.phone_number) {
      changedFields.phone_number = formData.phone_number
    }
    
    return changedFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const changedFields = getChangedFields()
      
      // Check if any fields have changed
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected. Please modify at least one field before updating.",
          variant: "destructive",
        })
        setProfileLoading(false)
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        })
        setProfileLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data.user) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        })
        
        // Update user profile with new data from response
        const updatedUser = result.data.user
        setUserProfile(updatedUser)
        
        // Update form data with new values
        const userData = {
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
        }
        
        setOriginalData(userData)
        setFormData(userData)
        
        // Update ref
        originalDataRef.current = userData
        
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    }

    setProfileLoading(false)
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

  const RoleIcon = getRoleIcon(userProfile.role)

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
              <div className="relative w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 overflow-hidden group">
                {/* Profile Image */}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={userProfile.full_name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : userProfile.image_path ? (
                  <img
                    src={getUserImageUrl(userProfile.image_path) || ''}
                    alt={userProfile.full_name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                
                {/* Fallback Icon */}
                <div className={`w-full h-full flex items-center justify-center ${(imagePreview || userProfile.image_path) ? 'hidden' : ''}`}>
                  <User className="w-24 h-24 text-gray-600" />
                </div>
                <div className="w-full h-full flex items-center justify-center hidden">
                  <User className="w-24 h-24 text-gray-600" />
                </div>

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>

                {selectedImage && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Selected: {selectedImage.name}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleImageUpload}
                        disabled={imageLoading}
                        className="flex-1"
                      >
                        {imageLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <CardTitle>{userProfile.full_name || "User"}</CardTitle>
              <CardDescription>{userProfile.email || "No email"}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Badge className={`${getRoleColor(userProfile.role)} flex items-center gap-2 justify-center`}>
                <RoleIcon className="w-4 h-4" />
                {getRoleDisplayName(userProfile.role)}
              </Badge>

              {userProfile.registration_number && (
                <div className="text-sm">
                  <span className="font-medium">Student ID:</span> {userProfile.registration_number}
                </div>
              )}

              {userProfile.address && (
                <div className="text-sm">
                  <span className="font-medium">Address:</span> {userProfile.address}
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
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                      {hasFieldChanged('full_name') && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Modified
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={hasFieldChanged('full_name') ? 'border-blue-500' : ''}
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
                    <Label htmlFor="phone_number" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                      {hasFieldChanged('phone_number') && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Modified
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className={hasFieldChanged('phone_number') ? 'border-blue-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      Role
                    </Label>
                    <Input
                      value={getRoleDisplayName(userProfile.role)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Read-only Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.registration_number && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                          value={userProfile.registration_number}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    {userProfile.address && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={userProfile.address}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="status">Account Status</Label>
                      <Input
                        id="status"
                        value={userProfile.is_active ? "Active" : "Inactive"}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createdAt">Member Since</Label>
                      <Input
                        id="createdAt"
                        value={new Date(userProfile.created_at).toLocaleDateString()}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  </div>

                <Alert>
                  <AlertDescription>
                    You can update your full name, email, and phone number individually. Only modified fields will be sent to the server. Other information like your role, student ID, and account status cannot be changed. Contact administration if you need to update these details.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={profileLoading} className="w-full">
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
