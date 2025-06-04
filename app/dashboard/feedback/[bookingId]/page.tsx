"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Clock, MapPin, Users } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function FeedbackPage({ params }: { params: { bookingId: string } }) {
  const { user } = useAuth()
  const { bookings, venues, submitFeedback } = useBooking()
  const router = useRouter()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const booking = bookings.find((b) => b.id === params.bookingId)
  const venue = booking ? venues.find((v) => v.id === booking.venueId) : null

  if (!user || !booking || !venue) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Booking information not found</p>
        </div>
      </DashboardLayout>
    )
  }

  if (booking.userId !== user.id || booking.status !== "paid") {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Feedback not available for this booking</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Missing Rating",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Missing Comment",
        description: "Please provide your feedback comment",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await submitFeedback(booking.id, {
        rating,
        comment: comment.trim(),
      })

      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        })
        router.push("/dashboard/bookings")
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit feedback",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting feedback",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Feedback</h1>
          <p className="text-gray-600">Share your experience with this venue</p>
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
                  <Label className="text-sm font-medium">Amenities Used</Label>
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

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback</CardTitle>
              <CardDescription>Rate your experience and leave a comment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 rounded transition-colors ${
                          star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                        }`}
                      >
                        <Star className={`h-8 w-8 ${star <= rating ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-gray-600">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Your Comments</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this venue. What did you like? Any suggestions for improvement?"
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/bookings")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
