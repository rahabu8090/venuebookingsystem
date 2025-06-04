"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Clock, Users, Wifi, Monitor, PresentationIcon, Snowflake, Volume2 } from "lucide-react"
import { bookingService } from "@/services/bookingService"
import type { Venue } from "@/contexts/BookingContext"

const AMENITIES = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "projector", label: "Projector", icon: Monitor },
  { id: "whiteboard", label: "Whiteboard", icon: PresentationIcon },
  { id: "ac", label: "Air Conditioning", icon: Snowflake },
  { id: "podium", label: "Podium", icon: PresentationIcon },
  { id: "sound_system", label: "Sound System", icon: Volume2 },
]

export default function BookVenuePage({ params }: { params: { venueId: string } }) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [bookingData, setBookingData] = useState({
    booking_date: "",
    start_time: "",
    end_time: "",
    required_capacity: 1,
    required_amenities: [] as string[],
    purpose: "",
    event_details: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get venue and search data from localStorage
    const venueData = localStorage.getItem("selectedVenue")
    const searchData = localStorage.getItem("searchParams")
    
    if (venueData) {
      setVenue(JSON.parse(venueData))
    }
    
    if (searchData) {
      const { booking_date, start_time, end_time, required_capacity, required_amenities } = JSON.parse(searchData)
      setBookingData(prev => ({
        ...prev,
        booking_date,
        start_time,
        end_time,
        required_capacity,
        required_amenities,
      }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await bookingService.createBooking({
      venue_id: params.venueId,
      ...bookingData,
    })

    if (result.success) {
      // Clear the stored data after successful booking
      localStorage.removeItem("selectedVenue")
      localStorage.removeItem("searchParams")
      router.push("/dashboard/bookings")
    } else {
      setError(result.error || "Failed to create booking")
    }

    setLoading(false)
  }

  const handleAmenityToggle = (amenityId: string) => {
    setBookingData((prev) => ({
      ...prev,
      required_amenities: prev.required_amenities.includes(amenityId)
        ? prev.required_amenities.filter((id) => id !== amenityId)
        : [...prev.required_amenities, amenityId],
    }))
  }

  if (!venue) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Venue not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Book {venue.name}</CardTitle>
            <CardDescription>{venue.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={bookingData.booking_date}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, booking_date: e.target.value }))}
                      required
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Required Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={bookingData.required_capacity || ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 1 : parseInt(e.target.value)
                        setBookingData((prev) => ({ ...prev, required_capacity: value }))
                      }}
                      required
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startTime"
                      type="time"
                      value={bookingData.start_time}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, start_time: e.target.value }))}
                      required
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endTime"
                      type="time"
                      value={bookingData.end_time}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, end_time: e.target.value }))}
                      required
                      className="pl-10"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="e.g., Team meeting, Workshop, Conference"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDetails">Event Details</Label>
                <Textarea
                  id="eventDetails"
                  value={bookingData.event_details}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, event_details: e.target.value }))}
                  placeholder="Please provide details about your event, including agenda, expected number of participants, and any special requirements."
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Required Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => {
                    const Icon = amenity.icon
                    return (
                      <Button
                        key={amenity.id}
                        type="button"
                        variant={bookingData.required_amenities.includes(amenity.id) ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => handleAmenityToggle(amenity.id)}
                        disabled
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {amenity.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 