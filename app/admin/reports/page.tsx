"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, Building2, Calendar, DollarSign } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { mockAuthService } from "@/services/mockAuthService"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const { bookings, venues, payments } = useBooking()
  const [users, setUsers] = useState([])
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    mockAuthService.getAllUsers().then(setUsers)
  }, [])

  if (!user || user.role !== "admin") {
    return null
  }

  // Calculate statistics
  const totalRevenue = payments.filter((p) => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0)
  const averageBookingValue = totalRevenue / Math.max(payments.filter((p) => p.status === "confirmed").length, 1)

  // Bookings by user type
  const bookingsByUserType = {
    student: bookings.filter((b) => {
      const userData = users.find((u) => u.id === b.userId)
      return userData?.role === "student"
    }).length,
    staff: bookings.filter((b) => {
      const userData = users.find((u) => u.id === b.userId)
      return userData?.role === "staff"
    }).length,
    external: bookings.filter((b) => {
      const userData = users.find((u) => u.id === b.userId)
      return userData?.role === "external"
    }).length,
  }

  // Venue utilization
  const venueUtilization = venues.map((venue) => {
    const venueBookings = bookings.filter((b) => b.venueId === venue.id)
    return {
      venue: venue.name,
      bookings: venueBookings.length,
      revenue: payments
        .filter((p) => {
          const booking = bookings.find((b) => b.id === p.bookingId)
          return booking?.venueId === venue.id && p.status === "confirmed"
        })
        .reduce((sum, p) => sum + p.amount, 0),
    }
  })

  // Booking status distribution
  const statusDistribution = {
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    paid: bookings.filter((b) => b.status === "paid").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  }

  // Payment status
  const paymentStats = {
    pending: payments.filter((p) => p.status === "pending").length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    overdue: payments.filter((p) => p.status === "pending" && new Date() > new Date(p.deadline)).length,
  }

  // Monthly trends (mock data for demonstration)
  const monthlyData = [
    { month: "Jan", bookings: 12, revenue: 2400 },
    { month: "Feb", bookings: 19, revenue: 3800 },
    { month: "Mar", bookings: 15, revenue: 3000 },
    { month: "Apr", bookings: 22, revenue: 4400 },
    { month: "May", bookings: 18, revenue: 3600 },
    { month: "Jun", bookings: 25, revenue: 5000 },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">System performance and usage statistics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From confirmed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageBookingValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per confirmed booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{venues.length}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by User Type */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by User Type</CardTitle>
            <CardDescription>Distribution of bookings across different user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{bookingsByUserType.student}</div>
                <div className="text-sm text-gray-600">Student Bookings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{bookingsByUserType.staff}</div>
                <div className="text-sm text-gray-600">Staff Bookings</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{bookingsByUserType.external}</div>
                <div className="text-sm text-gray-600">External Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venue Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Utilization</CardTitle>
            <CardDescription>Booking frequency and revenue by venue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {venueUtilization.map((venue, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{venue.venue}</h3>
                    <p className="text-sm text-gray-600">{venue.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${venue.revenue}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Current status of all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {status}
                      </Badge>
                    </div>
                    <div className="font-semibold">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Current payment status overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  <div className="font-semibold">{paymentStats.pending}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="font-semibold">{paymentStats.confirmed}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      Overdue
                    </Badge>
                  </div>
                  <div className="font-semibold">{paymentStats.overdue}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Booking and revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold w-12">{month.month}</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{month.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">${month.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
