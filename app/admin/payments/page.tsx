"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
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
import { mockAuthService } from "@/services/mockAuthService"

export default function AdminPaymentsPage() {
  const { user } = useAuth()
  const { bookings, venues, payments, refreshData } = useBooking()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    mockAuthService.getAllUsers().then(setUsers)
  }, [])

  if (!user || user.role !== "admin") {
    return null
  }

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const confirmedPayments = payments.filter((p) => p.status === "confirmed")
  const overduePayments = payments.filter((p) => p.status === "pending" && new Date() > new Date(p.deadline))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBookingDetails = (bookingId: string) => {
    return bookings.find((b) => b.id === bookingId)
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

  const handleConfirmPayment = async (payment) => {
    // Mock payment confirmation
    toast({
      title: "Payment Confirmed",
      description: "Payment has been confirmed and booking updated",
    })
    setSelectedPayment(null)
    await refreshData()
  }

  const handleRejectPayment = async (payment) => {
    // Mock payment rejection
    toast({
      title: "Payment Rejected",
      description: "Payment has been rejected",
    })
    setSelectedPayment(null)
    await refreshData()
  }

  const PaymentCard = ({ payment }: { payment: any }) => {
    const booking = getBookingDetails(payment.bookingId)
    const isOverdue = new Date() > new Date(payment.deadline)
    const actualStatus = payment.status === "pending" && isOverdue ? "overdue" : payment.status

    if (!booking) return null

    return (
      <Card key={payment.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getVenueName(booking.venueId)}
                <Badge className={getStatusColor(actualStatus)}>
                  {actualStatus}
                  {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {venues.find((v) => v.id === booking.venueId)?.location}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg font-semibold">
              ${payment.amount}
            </Badge>
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

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Control Number: {payment.controlNumber}</span>
              </div>
              <div className="text-xs text-gray-600">
                Deadline: {new Date(payment.deadline).toLocaleDateString()} at{" "}
                {new Date(payment.deadline).toLocaleTimeString()}
              </div>
              {payment.transactionId && (
                <div className="text-xs text-gray-600 mt-1">Transaction ID: {payment.transactionId}</div>
              )}
              {payment.paidAt && (
                <div className="text-xs text-gray-600 mt-1">Paid: {new Date(payment.paidAt).toLocaleDateString()}</div>
              )}
            </div>

            {payment.status === "pending" && payment.transactionId && (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setSelectedPayment(payment)}>
                      <Check className="h-4 w-4 mr-1" />
                      Confirm Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Payment</DialogTitle>
                      <DialogDescription>Confirm that the payment has been received and is valid</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Amount:</strong> ${payment.amount}
                          </div>
                          <div>
                            <strong>Control Number:</strong> {payment.controlNumber}
                          </div>
                          <div>
                            <strong>Transaction ID:</strong> {payment.transactionId}
                          </div>
                          <div>
                            <strong>User:</strong> {getUserName(booking.userId)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleConfirmPayment(payment)}>Confirm Payment</Button>
                        <Button variant="destructive" onClick={() => handleRejectPayment(payment)}>
                          Reject Payment
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage booking payments</p>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedPayments.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overduePayments.length})</TabsTrigger>
            <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
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
                {pendingPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
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
                {confirmedPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overduePayments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No overdue payments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {overduePayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
