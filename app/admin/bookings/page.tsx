"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, Check, X } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import { mockAuthService } from "@/services/mockAuthService"

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const { bookings, venues, updateBookingStatus, refreshData } = useBooking()
  const { toast } = useToast()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])

  // Load users data
  useState(() => {
    mockAuthService.getAllUsers().then(setUsers)
  })

  if (!user || user.role !== "admin") {
    return null
  }

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

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId)
    return venue?.name || "Unknown Venue"
  }

  const getUserName = (userId: string) => {
    const userData = users.find((u) => u.id === userId)
    return userData?.name || "Unknown User"
  }

  const getUserRole = (userId: string) => {
    const userData = users.find((u) => u.id === userId)
    return userData?.role || "unknown"
  }

  const handleApprove = async (booking: any) => {
    if (!price || Number.parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await updateBookingStatus(booking.id, "approved", Number.parseFloat(price))
      if (result.success) {
        toast({
          title: "Booking Approved",
          description: "Booking has been approved and payment details sent to user",
        })
        setSelectedBooking(null)
        setPrice("")
        await refreshData()
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "An error occurred while approving the booking",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleReject = async (booking: any) => {
    setLoading(true)
    try {
      const result = await updateBookingStatus(booking.id, "rejected")
      if (result.success) {
        toast({
          title: "Booking Rejected",
          description: "Booking has been rejected",
        })
        setSelectedBooking(null)
        await refreshData()
      } else {
        toast({
          title: "Rejection Failed",
          description: result.error || "Failed to reject booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "An error occurred while rejecting the booking",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const BookingCard = ({ booking }: { booking: any }) => (
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
            <div>
              <span className="font-medium">User:</span> {getUserName(booking.userId)} ({getUserRole(booking.userId)})
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
                <span className="font-medium">Control Number: {booking.controlNumber}</span>
              </div>
              {booking.paymentDeadline && (
                <p className="text-xs text-gray-600 mt-1">
                  Payment deadline: {new Date(booking.paymentDeadline).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {booking.status === "pending" && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedBooking(booking)}>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Booking</DialogTitle>
                      <DialogDescription>Set the price for this booking and approve the request</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="Enter booking price"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(booking)} disabled={loading}>
                          {loading ? "Approving..." : "Approve Booking"}
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" size="sm" onClick={() => handleReject(booking)} disabled={loading}>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
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
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Review and manage venue booking requests</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          </TabsList>

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

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
