"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Mail, Phone, Building, GraduationCap, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"

interface User {
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
  department?: string
  organization?: string
}

interface PaginationData {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface UsersResponse {
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: PaginationData
  }
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user, currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        })
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "15"
      })

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result: UsersResponse = await response.json()

      if (result.success) {
        setUsers(result.data.users)
        setPagination(result.data.pagination)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      // The useEffect will handle the API call
    }, 500)

    setSearchTimeout(timeout)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  // Helper function to get user image URL
  const getUserImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${imagePath}`
  }

  const studentUsers = users.filter((u) => u.role === "student")
  const staffUsers = users.filter((u) => u.role === "staff")
  const externalUsers = users.filter((u) => u.role === "external user")

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
        return UserIcon
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const UserCard = ({ userData }: { userData: User }) => {
    const RoleIcon = getRoleIcon(userData.role)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {userData.image_path ? (
                  <img
                    src={getUserImageUrl(userData.image_path) || ''}
                    alt={userData.full_name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${userData.image_path ? 'hidden' : ''}`}>
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="w-full h-full flex items-center justify-center hidden">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">{userData.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {userData.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
            <Badge className={`${getRoleColor(userData.role)} flex items-center gap-1`}>
              <RoleIcon className="w-4 h-4" />
                {getRoleDisplayName(userData.role)}
              </Badge>
              <Badge className={`${getStatusColor(userData.is_active)} text-xs`}>
                {userData.is_active ? "Active" : "Inactive"}
            </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {userData.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{userData.phone_number}</span>
              </div>
            )}

            {userData.registration_number && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span>Student ID: {userData.registration_number}</span>
              </div>
            )}

            {userData.address && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span>Address: {userData.address}</span>
              </div>
            )}

              <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span>Member since: {new Date(userData.created_at).toLocaleDateString()}</span>
              </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const Pagination = () => {
    if (!pagination) return null

    const { current_page, last_page, total } = pagination

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {pagination.from} to {pagination.to} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current_page - 1)}
            disabled={current_page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, last_page) }, (_, i) => {
              const page = Math.max(1, Math.min(last_page - 4, current_page - 2)) + i
              if (page > last_page) return null
              
              return (
                <Button
                  key={page}
                  variant={page === current_page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current_page + 1)}
            disabled={current_page === last_page}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="external user">External Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Users ({pagination?.total || 0})</TabsTrigger>
            <TabsTrigger value="student">Students ({studentUsers.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({staffUsers.length})</TabsTrigger>
            <TabsTrigger value="external">External ({externalUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((userData) => (
                <UserCard key={userData.id} userData={userData} />
              ))}
            </div>
                <Pagination />
          </TabsContent>

          <TabsContent value="student" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentUsers.map((userData) => (
                <UserCard key={userData.id} userData={userData} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffUsers.map((userData) => (
                <UserCard key={userData.id} userData={userData} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalUsers.map((userData) => (
                <UserCard key={userData.id} userData={userData} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
