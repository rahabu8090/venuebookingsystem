"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { reportsService, type ReportsData } from "@/services/reportsService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, Building2, Calendar, DollarSign, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchReports()
    }
  }, [user, selectedYear])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsService.getReports(selectedYear)
      if (response.success) {
        setReportsData(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch reports",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reports...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!reportsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Reports Available</h2>
            <p className="text-gray-600">Unable to load report data</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">System performance and usage statistics</p>
          </div>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={new Date().getFullYear().toString()}>This Year</SelectItem>
              <SelectItem value={(new Date().getFullYear() - 1).toString()}>Last Year</SelectItem>
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
              <div className="text-2xl font-bold">{formatCurrency(reportsData.overview.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">From approved bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportsData.overview.average_booking_value)}</div>
              <p className="text-xs text-muted-foreground">Per approved booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsData.overview.total_users}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsData.venue_utilization.length}</div>
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
                <div className="text-2xl font-bold text-blue-600">{reportsData.bookings_by_role.student}</div>
                <div className="text-sm text-gray-600">Student Bookings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportsData.bookings_by_role.staff}</div>
                <div className="text-sm text-gray-600">Staff Bookings</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{reportsData.bookings_by_role["external user"]}</div>
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
              {reportsData.venue_utilization.map((venue, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{venue.venue_name}</h3>
                    <p className="text-sm text-gray-600">{venue.total_bookings} bookings</p>
                    <p className="text-xs text-gray-500">Utilization: {venue.utilization_rate}%</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(venue.total_revenue)}</div>
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
                {Object.entries(reportsData.booking_status_distribution).map(([status, count]) => (
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
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Booking and revenue trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsData.monthly_trends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-semibold w-20">{formatMonth(month.month)}</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{month.total_bookings} bookings</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{formatCurrency(month.total_revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
