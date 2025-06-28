"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, CreditCard, Check, AlertTriangle } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"

interface Venue {
  id: string
  name: string
  location: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

interface Booking {
  id: string
  user_id: string
  venue_id: string
  booking_date: string
  start_time: string
  end_time: string
  required_capacity: number
  status: string
  approved_cost: number
  control_number: string | null
  paid: boolean
  payment_evidence?: string | null
  rejection_reason?: string | null
  cancellation_reason?: string | null
  purpose?: string
  event_details?: string
  created_at: string
  updated_at: string
  venue: Venue
  user: User
}

export default function AdminPaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await fetch("http://127.0.0.1:8000/api/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await res.json()
        if (result.success) {
          setBookings(result.data)
        } else {
          toast({ title: "Error", description: result.message || "Failed to fetch bookings", variant: "destructive" })
        }
      } catch (e) {
        toast({ title: "Error", description: "Failed to fetch bookings", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === "admin") fetchBookings()
  }, [user, toast])

  if (!user || user.role !== "admin") return null

  // Classify bookings
  const pendingPayments = bookings.filter(b => b.status === "approved" && b.paid === false)
  const confirmedPayments = bookings.filter(b => b.paid === true)
  const allPayments = bookings

  const getStatusColor = (b: Booking) => {
    if (b.paid) return "bg-green-100 text-green-800"
    if (b.status === "approved") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const PaymentCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {booking.venue?.name || "Unknown Venue"}
              <Badge className={getStatusColor(booking)}>
                {booking.paid ? "confirmed" : booking.status}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {booking.venue?.location || "-"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {formatCurrency(booking.approved_cost || 0)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{booking.booking_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {booking.start_time} - {booking.end_time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{booking.required_capacity} guests</span>
            </div>
            <div>
              <span className="font-medium">User:</span> {booking.user?.full_name || "Unknown User"} ({booking.user?.role || "unknown"})
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Control Number: {booking.control_number || "-"}</span>
            </div>
            <div className="text-xs text-gray-600">
              Approved: {booking.status === "approved" ? "Yes" : "No"}
            </div>
            {booking.paid && (
              <div className="text-xs text-green-600 mt-1">Paid: Yes</div>
            )}
            {!booking.paid && (
              <div className="text-xs text-yellow-600 mt-1">Paid: No</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage booking payments</p>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allPayments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmedPayments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Payment ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedPayments.length})</TabsTrigger>
            <TabsTrigger value="all">All ({allPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No pending payments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((booking) => (
                  <PaymentCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedPayments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No confirmed payments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {confirmedPayments.map((booking) => (
                  <PaymentCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {allPayments.map((booking) => (
                <PaymentCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
