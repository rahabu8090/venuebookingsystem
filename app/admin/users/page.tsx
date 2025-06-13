"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { userService, type User } from "@/services/userService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User as UserIcon, Mail, Phone, Building, GraduationCap, Search } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    loadUsers()
  }, [user, router])

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true)
      const params: any = {
        page,
        per_page: pagination.per_page
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (roleFilter !== "all") {
        params.role = roleFilter
      }

      const response = await userService.getUsers(params)
      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    loadUsers(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    loadUsers(1)
  }

  const handlePageChange = (page: number) => {
    loadUsers(page)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const studentUsers = users.filter((u) => u.role === "student")
  const staffUsers = users.filter((u) => u.role === "staff")
  const externalUsers = users.filter((u) => u.role === "external")

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      case "external":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return GraduationCap
      case "staff":
        return Building
      case "external":
        return Building
      default:
        return UserIcon
    }
  }

  const UserCard = ({ userData }: { userData: User }) => {
    const RoleIcon = getRoleIcon(userData.role)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{userData.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {userData.email}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${getRoleColor(userData.role)} flex items-center gap-1`}>
              <RoleIcon className="w-4 h-4" />
              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
            </Badge>
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
          </div>
        </CardContent>
      </Card>
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
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="external">External Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  )
}
