"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Building2, CreditCard, TrendingUp, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  users: {
    total: number
    active: number
    by_role: {
      admin: number
      staff: number
      student: number
      "external user": number
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
    total: number
    today: number
    this_week: number
    this_month: number
  }
  recent_bookings: Array<{
    id: string
    venue: {
      name: string
    }
    user: {
      name: string
    }
    status: string
    start_time: string
    end_time: string
    created_at: string
    description?: string
  }>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || user.role !== "admin") return

      try {
        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        const result = await response.json()

        if (result.success) {
          setStats(result.data)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch admin statistics",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch admin statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, toast])

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading admin statistics...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Statistics</h2>
            <p className="text-gray-600">Unable to fetch admin dashboard data</p>
          </div>
        </div>
      </AdminLayout>
    )
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
              <div className="text-3xl font-bold university-text-navy">{stats.venues.active}</div>
              <p className="text-xs text-gray-600 mt-1">of {stats.venues.total} total venues</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenue.total)}</div>
              <p className="text-xs text-gray-600 mt-1">From approved bookings</p>
            </CardContent>
          </Card>

          <Card className="university-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.users.active}</div>
              <p className="text-xs text-gray-600 mt-1">of {stats.users.total} total users</p>
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
              <CardTitle className="text-sm university-text-navy">Today's Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.bookings.today}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.bookings.this_week}</div>
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

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">Today's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue.today)}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">This Week's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue.this_week)}</div>
            </CardContent>
          </Card>

          <Card className="university-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm university-text-navy">This Month's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.revenue.this_month)}</div>
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
                            {new Date(booking.start_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.user.name}
                          </div>
                        </div>
                        {booking.description && (
                          <p className="text-sm text-gray-600">{booking.description}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDateTime(booking.created_at)}
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
