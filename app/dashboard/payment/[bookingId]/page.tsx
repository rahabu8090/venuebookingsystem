"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  const { user } = useAuth()
  const { bookings, venues, payments, submitPayment } = useBooking()
  const router = useRouter()
  const { toast } = useToast()

  const [transactionId, setTransactionId] = useState("")
  const [receipt, setReceipt] = useState("")
  const [loading, setLoading] = useState(false)

  const booking = bookings.find((b) => b.id === params.bookingId)
  const venue = booking ? venues.find((v) => v.id === booking.venueId) : null
  const payment = payments.find((p) => p.bookingId === params.bookingId)

  if (!user || !booking || !venue || !payment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Booking or payment information not found</p>
        </div>
      </DashboardLayout>
    )
  }

  if (booking.userId !== user.id) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Access denied</p>
        </div>
      </DashboardLayout>
    )
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the transaction ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await submitPayment(booking.id, {
        transactionId,
        receipt,
      })

      if (result.success) {
        toast({
          title: "Payment Submitted",
          description: "Your payment confirmation has been submitted for verification",
        })
        router.push("/dashboard/bookings")
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit payment confirmation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting payment confirmation",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const isOverdue = new Date() > new Date(payment.deadline)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600">Complete your booking payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
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

              <div>
                <Label className="text-sm font-medium">Event Description</Label>
                <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
              </div>

              {booking.amenities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Amenities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Complete your payment using the details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOverdue && (
                <Alert variant="destructive">
                  <AlertDescription>Payment deadline has passed. Please contact administration.</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">TZS {payment.amount}</span>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Control Number</Label>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-lg">{payment.controlNumber}</div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Payment Deadline</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {new Date(payment.deadline).toLocaleDateString()} at{" "}
                    {new Date(payment.deadline).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Use the control number above to make your payment through your preferred payment method. After
                  payment, enter the transaction details below.
                </AlertDescription>
              </Alert>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from your payment"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt/Reference (Optional)</Label>
                  <Input
                    id="receipt"
                    value={receipt}
                    onChange={(e) => setReceipt(e.target.value)}
                    placeholder="Enter receipt number or reference"
                  />
                </div>

                <Button type="submit" disabled={loading || isOverdue} className="w-full">
                  {loading ? "Submitting..." : "Submit Payment Confirmation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
