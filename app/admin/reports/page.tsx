"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, Building2, Calendar, DollarSign } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { adminService, type AdminReport } from "@/services/adminService"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [report, setReport] = useState<AdminReport | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await adminService.getReports()
      if (response.success && response.data) {
        setReport(response.data)
      } else {
        setError(response.error || "Failed to load reports")
      }
    } catch (error) {
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500">{error}</div>
      </AdminLayout>
    )
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-500">No report data available</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">View system-wide statistics and trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${report.overview.total_revenue}</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overview.total_users}</div>
              <p className="text-xs text-gray-500">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${report.overview.average_booking_value}</div>
              <p className="text-xs text-gray-500">Per booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(report.booking_status_distribution).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by User Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.bookings_by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{role}</Badge>
                    </div>
                    <span className="font-medium">{count} bookings</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.booking_status_distribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{status}</Badge>
                    </div>
                    <span className="font-medium">{count} bookings</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Venue Utilization</CardTitle>
            <CardDescription>Booking and revenue statistics by venue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.venue_utilization
                .filter((venue) => venue.total_bookings > 0)
                .map((venue) => (
                  <div key={venue.venue_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{venue.venue_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{venue.total_bookings} bookings</span>
                      <span className="text-sm text-gray-500">${venue.total_revenue}</span>
                      <Badge>{venue.utilization_rate}% utilization</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Booking and revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.monthly_trends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{trend.month}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{trend.total_bookings} bookings</span>
                    <span className="text-sm text-gray-500">${trend.total_revenue}</span>
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
