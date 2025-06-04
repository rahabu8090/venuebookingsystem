"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { bookingService } from "@/services/bookingService"
import type { Booking } from "@/services/bookingService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await bookingService.getUserBookings()
      if (result.success) {
        setBookings(result.bookings)
      } else {
        setError(result.error || "Failed to fetch bookings")
      }
      setLoading(false)
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  if (!user) return null

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const approvedBookings = bookings.filter((b) => b.status === "approved")
  const paidBookings = bookings.filter((b) => b.status === "paid")
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const rejectedBookings = bookings.filter((b) => b.status === "rejected")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{booking.venue.name}</CardTitle>
              <CardDescription>{booking.venue.location}</CardDescription>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-gray-600">{formatDate(booking.booking_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-gray-600">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Purpose</p>
              <p className="text-sm text-gray-600">{booking.purpose}</p>
            </div>

            {booking.event_details && (
              <div>
                <p className="text-sm font-medium">Event Details</p>
                <p className="text-sm text-gray-600">{booking.event_details}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium">Required Amenities</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {booking.required_amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {booking.rejection_reason && (
              <div>
                <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                <p className="text-sm text-red-600">{booking.rejection_reason}</p>
              </div>
            )}

            {booking.control_number && (
              <div>
                <p className="text-sm font-medium">Control Number</p>
                <p className="text-sm text-gray-600">{booking.control_number}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <Link href="/dashboard/book">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Book a Venue
            </button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">You haven't made any bookings yet.</p>
            <Link href="/dashboard/book" className="text-blue-600 hover:underline mt-2 inline-block">
              Book your first venue
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {approvedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Approved Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {approvedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {paidBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Paid Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paidBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {completedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Completed Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {rejectedBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Rejected Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rejectedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
