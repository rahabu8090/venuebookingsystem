"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Wifi,
  Monitor,
  Snowflake,
  Volume2,
  PresentationIcon as PresentationChart,
  Lightbulb,
} from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const amenityIcons = {
  "Wi-Fi": Wifi,
  Projector: Monitor,
  AC: Snowflake,
  "Sound System": Volume2,
  Whiteboard: PresentationChart,
  "TV Screen": Monitor,
  Stage: PresentationChart,
  Lighting: Lightbulb,
}

export default function BookVenuePage() {
  const { user } = useAuth()
  const { searchVenues, createBooking } = useBooking()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [searchCriteria, setSearchCriteria] = useState({
    date: "",
    startTime: "",
    endTime: "",
    guests: "",
    amenities: [] as string[],
  })
  const [availableVenues, setAvailableVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const availableAmenities = [
    "Wi-Fi",
    "Projector",
    "AC",
    "Sound System",
    "Whiteboard",
    "TV Screen",
    "Stage",
    "Lighting",
  ]

  const handleSearch = async () => {
    if (!searchCriteria.date || !searchCriteria.startTime || !searchCriteria.endTime || !searchCriteria.guests) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const venues = await searchVenues({
        ...searchCriteria,
        guests: Number.parseInt(searchCriteria.guests),
      })
      setAvailableVenues(venues)
      setStep(2)
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search venues. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue)
    setStep(3)
  }

  const handleBookingSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a description for your booking",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createBooking({
        userId: user.id,
        venueId: selectedVenue.id,
        date: searchCriteria.date,
        startTime: searchCriteria.startTime,
        endTime: searchCriteria.endTime,
        guests: Number.parseInt(searchCriteria.guests),
        description,
        amenities: searchCriteria.amenities,
      })

      if (result.success) {
        toast({
          title: "Booking Submitted",
          description: "Your booking request has been submitted for admin review",
        })
        router.push("/dashboard/bookings")
      } else {
        toast({
          title: "Booking Failed",
          description: result.error || "Failed to create booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "An error occurred while creating your booking",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleAmenityToggle = (amenity: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book a Venue</h1>
          <p className="text-gray-600">Find and book the perfect venue for your event</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Search Criteria */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Search for Available Venues</CardTitle>
              <CardDescription>Enter your requirements to find suitable venues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchCriteria.date}
                    onChange={(e) => setSearchCriteria((prev) => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={searchCriteria.guests}
                    onChange={(e) => setSearchCriteria((prev) => ({ ...prev, guests: e.target.value }))}
                    placeholder="Enter number of guests"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={searchCriteria.startTime}
                    onChange={(e) => setSearchCriteria((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={searchCriteria.endTime}
                    onChange={(e) => setSearchCriteria((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Required Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableAmenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Monitor
                    return (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={searchCriteria.amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label htmlFor={amenity} className="flex items-center gap-2 text-sm">
                          <IconComponent className="h-4 w-4" />
                          {amenity}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? "Searching..." : "Search Available Venues"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Venue Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Venues</h2>
              <Button variant="outline" onClick={() => setStep(1)}>
                Modify Search
              </Button>
            </div>

            {availableVenues.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No venues available for your selected criteria. Please try different dates or requirements.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableVenues.map((venue) => (
                  <Card key={venue.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{venue.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {venue.location}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">${venue.hourlyRate}/hour</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <img
                          src={venue.images[0] || "/placeholder.svg"}
                          alt={venue.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />

                        <p className="text-sm text-gray-600">{venue.description}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Up to {venue.capacity} guests
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Amenities</Label>
                          <div className="flex flex-wrap gap-2">
                            {venue.amenities.map((amenity) => {
                              const IconComponent = amenityIcons[amenity] || Monitor
                              return (
                                <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                                  <IconComponent className="h-3 w-3" />
                                  {amenity}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>

                        <Button onClick={() => handleVenueSelect(venue)} className="w-full">
                          Select This Venue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === 3 && selectedVenue && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <Button variant="outline" onClick={() => setStep(2)}>
                Change Venue
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedVenue.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedVenue.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{searchCriteria.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {searchCriteria.startTime} - {searchCriteria.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{searchCriteria.guests} guests</span>
                    </div>
                  </div>

                  {searchCriteria.amenities.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Requested Amenities</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {searchCriteria.amenities.map((amenity) => {
                          const IconComponent = amenityIcons[amenity] || Monitor
                          return (
                            <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                              <IconComponent className="h-3 w-3" />
                              {amenity}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Description</CardTitle>
                  <CardDescription>Provide details about your event for admin review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Event Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your event, its purpose, and any special requirements..."
                        rows={6}
                      />
                    </div>

                    <Alert>
                      <AlertDescription>
                        Your booking request will be reviewed by an administrator. You will receive pricing and payment
                        instructions once approved.
                      </AlertDescription>
                    </Alert>

                    <Button onClick={handleBookingSubmit} disabled={loading} className="w-full">
                      {loading ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
