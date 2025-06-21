"use client"

import { useState, useEffect } from "react"
import { useAuth, type User } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User as UserIcon, Mail, Phone, Building, GraduationCap, Search } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { mockAuthService } from "@/services/mockAuthService"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      const userData = await mockAuthService.getAllUsers()
      setUsers(userData)
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }

  if (!user || user.role !== "admin") {
    return null
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
              {getRoleDisplayName(userData.role)}
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

            {userData.department && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span>Department: {userData.department}</span>
              </div>
            )}

            {userData.organization && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span>Organization: {userData.organization}</span>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="external user">External Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="student">Students ({studentUsers.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({staffUsers.length})</TabsTrigger>
            <TabsTrigger value="external">External ({externalUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((userData) => (
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
        </Tabs>
      </div>
    </AdminLayout>
  )
}
