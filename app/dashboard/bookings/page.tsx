"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { bookingService } from "@/services/bookingService"
import type { Booking } from "@/services/bookingService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, X, AlertTriangle, Upload, FileText, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BookingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  
  // Payment evidence upload states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [uploadingBooking, setUploadingBooking] = useState<Booking | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")

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
      case "cancelled":
        return "bg-gray-100 text-gray-800"
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleCancelBooking = (booking: Booking) => {
    setCancellingBooking(booking)
    setCancellationReason("")
    setIsCancelDialogOpen(true)
  }

  const confirmCancelBooking = async () => {
    if (!cancellingBooking || !cancellationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive",
      })
      return
    }

    setCancelLoading(true)
    try {
      const result = await bookingService.cancelBooking(cancellingBooking.id, cancellationReason)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        })
        
        // Refresh the bookings list
        const updatedResult = await bookingService.getUserBookings()
        if (updatedResult.success) {
          setBookings(updatedResult.bookings)
        }
        
        setIsCancelDialogOpen(false)
        setCancellingBooking(null)
        setCancellationReason("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCancelLoading(false)
    }
  }

  // Payment evidence upload functions
  const handlePaymentUpload = (booking: Booking) => {
    setUploadingBooking(booking)
    setSelectedFile(null)
    setIsPaymentDialogOpen(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, image, or Word document",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handlePaymentUploadSubmit = async () => {
    if (!uploadingBooking || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setUploadLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append('payment_evidence', selectedFile)

      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${uploadingBooking.id}/payment-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment evidence uploaded successfully",
        })
        
        // Refresh the bookings list
        const updatedResult = await bookingService.getUserBookings()
        if (updatedResult.success) {
          setBookings(updatedResult.bookings)
        }
        
        setIsPaymentDialogOpen(false)
        setUploadingBooking(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast({
          title: "Upload Failed",
          description: result.message || "Failed to upload payment evidence",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the file",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
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
            <div className="flex flex-col gap-2 items-end">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {booking.status === "approved" && booking.approved_cost && booking.approved_cost > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Cost: {formatCurrency(booking.approved_cost)}
                </Badge>
              )}
            </div>
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
                {booking.required_amenities && booking.required_amenities.length > 0 ? (
                  booking.required_amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No amenities required</span>
                )}
              </div>
            </div>

            {booking.approved_cost && booking.approved_cost > 0 && (
              <div>
                <p className="text-sm font-medium">Approved Cost</p>
                <p className="text-sm text-gray-600">{formatCurrency(booking.approved_cost)}</p>
              </div>
            )}

            {booking.control_number && (
              <div>
                <p className="text-sm font-medium">Control Number</p>
                <p className="text-sm text-gray-600">{booking.control_number}</p>
              </div>
            )}

            {booking.rejection_reason && (
              <div>
                <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                <p className="text-sm text-red-600">{booking.rejection_reason}</p>
              </div>
            )}

            {booking.cancellation_reason && (
              <div>
                <p className="text-sm font-medium text-gray-600">Cancellation Reason</p>
                <p className="text-sm text-gray-600">{booking.cancellation_reason}</p>
              </div>
            )}

            {booking.payment_evidence && (
              <div>
                <p className="text-sm font-medium text-green-600">Payment Evidence</p>
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Payment evidence uploaded
                </p>
              </div>
            )}

            <div className="pt-2 space-y-2">
              {booking.status === "pending" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelBooking(booking)}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}

              {booking.status === "approved" && booking.approved_cost && booking.approved_cost > 0 && !booking.payment_evidence && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePaymentUpload(booking)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Payment Evidence
                </Button>
              )}
            </div>
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

            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Cancelled Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cancelledBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancel Booking Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Cancel Booking
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {cancellingBooking && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900">{cancellingBooking.venue.name}</h3>
                      <p className="text-sm text-red-700">{formatDate(cancellingBooking.booking_date)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
                    <Textarea
                      id="cancellation-reason"
                      placeholder="Please provide a reason for cancelling this booking..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelDialogOpen(false)
                  setCancellingBooking(null)
                  setCancellationReason("")
                }}
                disabled={cancelLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                disabled={cancelLoading || !cancellationReason.trim()}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Evidence Upload Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Upload Payment Evidence
              </DialogTitle>
              <DialogDescription>
                Please upload proof of payment for your approved booking. Accepted formats: PDF, JPG, PNG, GIF, BMP, TIFF, DOC, DOCX (max 10MB).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {uploadingBooking && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">{uploadingBooking.venue.name}</h3>
                      <p className="text-sm text-green-700">
                        Amount: {uploadingBooking.approved_cost ? formatCurrency(uploadingBooking.approved_cost) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-evidence">Payment Evidence File *</Label>
                    <Input
                      ref={fileInputRef}
                      id="payment-evidence"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.doc,.docx"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Accepted formats: PDF, JPG, PNG, GIF, BMP, TIFF, DOC, DOCX (max 10MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Selected File:</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">{selectedFile.name}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false)
                  setUploadingBooking(null)
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                disabled={uploadLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentUploadSubmit}
                disabled={uploadLoading || !selectedFile}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Evidence
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

