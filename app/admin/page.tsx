"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Building2, CreditCard, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { bookings, venues, payments } = useBooking()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  // Calculate statistics
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === "pending").length
  const approvedBookings = bookings.filter((b) => b.status === "approved").length
  const paidBookings = bookings.filter((b) => b.status === "paid").length
  const completedBookings = bookings.filter((b) => b.status === "completed").length

  const totalRevenue = payments.filter((p) => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter((p) => p.status === "pending").length
  const overduePayments = payments.filter((p) => p.status === "pending" && new Date() > new Date(p.deadline)).length

  // Recent activity
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

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

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId)
    return venue?.name || "Unknown Venue"
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
              <div className="text-3xl font-bold university-text-navy">{totalBookings}</div>
              <p className="text-xs text-gray-600 mt-1">{pendingBookings} pending approval</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Venues</CardTitle>
              <Building2 className="h-5 w-5 university-text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold university-text-navy">{venues.length}</div>
              <p className="text-xs text-gray-600 mt-1">Available for booking</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${totalRevenue}</div>
              <p className="text-xs text-gray-600 mt-1">From confirmed payments</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingPayments}</div>
              <p className="text-xs text-gray-600 mt-1">
                {overduePayments > 0 && (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {overduePayments} overdue
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
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{approvedBookings}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Payment Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidBookings}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{completedBookings}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {bookings.filter((b) => b.status === "rejected").length}
              </div>
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
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent booking activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="university-card p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold university-text-navy">{getVenueName(booking.venueId)}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.guests} attendees
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{booking.description}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
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
