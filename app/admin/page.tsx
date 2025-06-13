"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { adminService } from "@/services/adminService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Building2, CreditCard, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"

interface AdminStats {
  users: {
    total: number
    active: number
    by_role: {
      admin: number
      staff: number
      student: number
      external: number
    }
  }
  venues: {
    total: number
    active: number
    total_capacity: number
    average_capacity: number
  }
  bookings: {
    total: number
    pending: number
    approved: number
    rejected: number
    today: number
    this_week: number
    this_month: number
  }
  revenue: {
    total: string
    today: number
    this_week: number
    this_month: string
  }
  recent_bookings: Array<{
    id: string
    venue: {
      name: string
    }
    user: {
      full_name: string
    }
    booking_date: string
    start_time: string
    end_time: string
    status: string
    required_capacity: number
    purpose: string
    created_at: string
  }>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    const fetchStats = async () => {
      try {
        const response = await adminService.getStats()
        if (response.success) {
          setStats(response.data)
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        setError("Failed to fetch statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "university-badge-pending"
      case "approved":
        return "university-badge-approved"
      case "rejected":
        return "university-badge-rejected"
      case "paid":
        return "university-badge-paid"
      case "completed":
        return "university-badge-completed"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="university-breadcrumb">
          <span>Admin Dashboard</span>
        </div>

        {/* Header */}
        <Card className="university-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold university-text-navy mb-2">Administrative Dashboard</h1>
                <p className="text-gray-600 text-lg">University venue booking system overview and management</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <Calendar className="h-5 w-5 university-text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold university-text-navy">{stats.bookings.total}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.bookings.pending} pending approval</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Venues</CardTitle>
              <Building2 className="h-5 w-5 university-text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold university-text-navy">{stats.venues.total}</div>
              <p className="text-xs text-gray-600 mt-1">Available for booking</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.revenue.total}</div>
              <p className="text-xs text-gray-600 mt-1">From confirmed payments</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.bookings.pending}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.bookings.pending > 0 && (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {stats.bookings.pending} pending
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.bookings.pending}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.bookings.approved}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Payment Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.bookings.approved}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.bookings.approved}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.bookings.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="university-card">
          <CardHeader>
            <CardTitle className="university-text-navy">Recent Booking Requests</CardTitle>
            <CardDescription>Latest booking requests requiring administrative attention</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recent_bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent booking activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_bookings.map((booking) => (
                  <div key={booking.id} className="university-card p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold university-text-navy">{booking.venue.name}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.required_capacity} attendees
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{booking.purpose}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
