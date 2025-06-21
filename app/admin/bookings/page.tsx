"use client"

import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { bookingService, type Booking } from "@/services/bookingService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, Check, X, User, Phone, Mail } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface BookingCardProps {
  booking: Booking
  controlNumber: string
  approvedCost: string
  isLoading: boolean
  onControlNumberChange: (value: string) => void
  onApprovedCostChange: (value: string) => void
  onApprove: (booking: Booking) => void
  onReject: (booking: Booking, rejectionReason: string) => void
  formatCurrency: (amount: number) => string
}

const BookingCard = memo(({ 
  booking, 
  controlNumber, 
  approvedCost,
  isLoading, 
  onControlNumberChange, 
  onApprovedCostChange,
  onApprove, 
  onReject,
  formatCurrency
}: BookingCardProps) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM d, yyyy")
  }

  const formatTime = (time: string) => {
    return format(new Date(time), "h:mm a")
  }

  const handleRejectClick = () => {
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      return
    }
    onReject(booking, rejectionReason)
    setRejectionReason("")
    setShowRejectDialog(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{booking.venue.name}</CardTitle>
            <CardDescription>{booking.venue.location}</CardDescription>
            {booking.approved_cost !== undefined && booking.status === "approved" && (
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Approved Cost: {formatCurrency(booking.approved_cost)}
                </Badge>
              </div>
            )}
            {booking.rejection_reason && booking.status === "rejected" && (
              <div className="mt-2">
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Rejection Reason: {booking.rejection_reason}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            {booking.control_number && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  CN: {booking.control_number}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatDate(booking.booking_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Required Capacity: {booking.required_capacity}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{booking.venue.location}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Booking Details</h4>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Purpose:</span> {booking.purpose}
            </p>
            {booking.event_details && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Event Details:</span> {booking.event_details}
              </p>
            )}
            {booking.approved_cost !== undefined && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Approved Cost:</span> {formatCurrency(booking.approved_cost)}
              </p>
            )}
            {booking.control_number && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Control Number:</span> {booking.control_number}
              </p>
            )}
            {booking.rejection_reason && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Rejection Reason:</span> {booking.rejection_reason}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">User Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{booking.user.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{booking.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{booking.user.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{booking.user.registration_number}</span>
              </div>
            </div>
          </div>

          {booking.status === "pending" && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`approved-cost-${booking.id}`}>Approved Cost (TZS)</Label>
                    <Input
                      id={`approved-cost-${booking.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={approvedCost}
                      onChange={(e) => onApprovedCostChange(e.target.value)}
                      placeholder="Enter approved cost (0 for free)"
                    />
                  </div>
                  {parseFloat(approvedCost) > 0 && (
                    <div>
                      <Label htmlFor={`control-number-${booking.id}`}>Control Number</Label>
                      <Input
                        id={`control-number-${booking.id}`}
                        value={controlNumber}
                        onChange={(e) => onControlNumberChange(e.target.value)}
                        placeholder="Enter control number (e.g., CN-12345678)"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleRejectClick}>
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Booking</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this booking request.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                          <Textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter the reason for rejection..."
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim()}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    onClick={() => onApprove(booking)}
                    disabled={isLoading || (parseFloat(approvedCost) > 0 && !controlNumber.trim())}
                  >
                    {isLoading ? "Approving..." : "Approve"}
                  </Button>
                </div>
                {parseFloat(approvedCost) > 0 && !controlNumber.trim() && (
                  <p className="text-sm text-red-600">
                    Control number is required when approved cost is greater than 0.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

BookingCard.displayName = "BookingCard"

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [controlNumbers, setControlNumbers] = useState<Record<string, string>>({})
  const [approvedCosts, setApprovedCosts] = useState<Record<string, string>>({})
  const [loadingBookings, setLoadingBookings] = useState<Record<string, boolean>>({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    } else {
      fetchBookings()
    }
  }, [user, router])

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getAdminBookings()
      if (response.success) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const approvedBookings = bookings.filter((booking) => booking.status === "approved")
  const paidBookings = bookings.filter((booking) => booking.status === "paid")
  const completedBookings = bookings.filter((booking) => booking.status === "completed")
  const rejectedBookings = bookings.filter((booking) => booking.status === "rejected")

  const handleApprove = async (booking: Booking) => {
    const controlNumber = controlNumbers[booking.id]
    const approvedCost = parseFloat(approvedCosts[booking.id] || "0")
    
    if (approvedCost > 0 && !controlNumber) {
      toast({
        title: "Error",
        description: "Please enter a control number when approved cost is greater than 0",
        variant: "destructive",
      })
      return
    }

    if (approvedCost < 0) {
      toast({
        title: "Error",
        description: "Approved cost cannot be negative",
        variant: "destructive",
      })
      return
    }

    setLoadingBookings(prev => ({ ...prev, [booking.id]: true }))
    try {
      const result = await bookingService.updateBookingStatus(booking.id, "approved", controlNumber, approvedCost)
      if (result.success) {
        toast({
          title: "Success",
          description: "Booking approved successfully",
        })
        // Clear the form data for this booking
        setControlNumbers(prev => {
          const newState = { ...prev }
          delete newState[booking.id]
          return newState
        })
        setApprovedCosts(prev => {
          const newState = { ...prev }
          delete newState[booking.id]
          return newState
        })
        await fetchBookings()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      })
    } finally {
      setLoadingBookings(prev => ({ ...prev, [booking.id]: false }))
    }
  }

  const handleReject = async (booking: Booking, rejectionReason: string) => {
    setLoadingBookings(prev => ({ ...prev, [booking.id]: true }))
    try {
      const result = await bookingService.updateBookingStatus(booking.id, "rejected", null, null, rejectionReason)
      if (result.success) {
        toast({
          title: "Success",
          description: "Booking rejected successfully",
        })
        await fetchBookings()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      })
    } finally {
      setLoadingBookings(prev => ({ ...prev, [booking.id]: false }))
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Review and manage venue booking requests</p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{pendingBookings.length}</div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{approvedBookings.length}</div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{paidBookings.length}</div>
              <p className="text-sm text-gray-600">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(approvedBookings
                  .reduce((total, booking) => total + (booking.approved_cost || 0), 0))}
              </div>
              <p className="text-sm text-gray-600">Total Approved Cost</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
          </TabsList>

          {["pending", "approved", "paid", "completed", "rejected"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid grid-cols-1 gap-6">
                {bookings
                  .filter((booking) => booking.status === status)
                  .map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      controlNumber={controlNumbers[booking.id] || ""}
                      approvedCost={approvedCosts[booking.id] || ""}
                      isLoading={loadingBookings[booking.id] || false}
                      onControlNumberChange={(value) => setControlNumbers(prev => ({
                        ...prev,
                        [booking.id]: value
                      }))}
                      onApprovedCostChange={(value) => setApprovedCosts(prev => ({
                        ...prev,
                        [booking.id]: value
                      }))}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      formatCurrency={formatCurrency}
                    />
                ))}
              </div>
          </TabsContent>
              ))}
        </Tabs>
      </div>
    </AdminLayout>
  )
}
