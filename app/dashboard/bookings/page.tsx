"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Star, CreditCard, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function BookingsPage() {
  const { user } = useAuth()
  const { getUserBookings, venues, payments } = useBooking()

  if (!user) return null

  const userBookings = getUserBookings(user.id)

  const pendingBookings = userBookings.filter((b) => b.status === "pending")
  const approvedBookings = userBookings.filter((b) => b.status === "approved")
  const paidBookings = userBookings.filter((b) => b.status === "paid")
  const completedBookings = userBookings.filter((b) => b.status === "completed")
  const rejectedBookings = userBookings.filter((b) => b.status === "rejected")

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

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId)
    return venue?.name || "Unknown Venue"
  }

  const getPaymentForBooking = (bookingId: string) => {
    return payments.find((p) => p.bookingId === bookingId)
  }

  const BookingCard = ({ booking }: { booking: any }) => {
    const payment = getPaymentForBooking(booking.id)

    return (
      <Card key={booking.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getVenueName(booking.venueId)}
                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {venues.find((v) => v.id === booking.venueId)?.location}
              </CardDescription>
            </div>
            {booking.price && (
              <Badge variant="outline" className="text-lg font-semibold">
                ${booking.price}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{booking.guests} guests</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">{booking.description}</p>

            {booking.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {booking.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            )}

            {booking.controlNumber && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Control Number: {booking.controlNumber}</span>
                </div>
                {booking.paymentDeadline && (
                  <p className="text-xs text-gray-600 mt-1">
                    Payment deadline: {new Date(booking.paymentDeadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {booking.feedback && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">Your Feedback</span>
                  <Badge variant="outline">{booking.feedback.rating}/5</Badge>
                </div>
                <p className="text-sm text-gray-600">{booking.feedback.comment}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Link href={`/dashboard/bookings/${booking.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>

              {booking.status === "approved" && payment && payment.status === "pending" && (
                <Link href={`/dashboard/payment/${booking.id}`}>
                  <Button size="sm">Make Payment</Button>
                </Link>
              )}

              {booking.status === "paid" && !booking.feedback && (
                <Link href={`/dashboard/feedback/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Leave Feedback
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Manage your venue booking requests</p>
          </div>
          <Link href="/dashboard/book">
            <Button>Book New Venue</Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({userBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {userBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bookings found</p>
                  <Link href="/dashboard/book">
                    <Button>Make Your First Booking</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No pending bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No approved bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paidBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No paid bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {paidBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No completed bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No rejected bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
