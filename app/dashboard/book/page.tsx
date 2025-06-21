"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Calendar, Clock, Users, Wifi, Monitor, PresentationIcon, Snowflake, Volume2 } from "lucide-react"
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

export default function BookVenuePage() {
  const [step, setStep] = useState(1)
  const [searchParams, setSearchParams] = useState({
    booking_date: "",
    start_time: "",
    end_time: "",
    required_capacity: 1,
    required_amenities: [] as string[],
  })
  const [venues, setVenues] = useState<Venue[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await bookingService.searchVenues(searchParams)

    if (result.success && result.venues) {
      setVenues(result.venues)
      setStep(2)
    } else {
      setError(result.error || "Failed to search venues")
    }

    setLoading(false)
  }

  const handleAmenityToggle = (amenityId: string) => {
    setSearchParams((prev) => ({
      ...prev,
      required_amenities: prev.required_amenities.includes(amenityId)
        ? prev.required_amenities.filter((id) => id !== amenityId)
        : [...prev.required_amenities, amenityId],
    }))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Search Criteria */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Search for Available Venues</CardTitle>
              <CardDescription>Enter your requirements to find suitable venues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSearch} className="space-y-6">
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
                        value={searchParams.booking_date}
                        onChange={(e) => setSearchParams((prev) => ({ ...prev, booking_date: e.target.value }))}
                        required
                        className="pl-10"
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
                        value={searchParams.required_capacity || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 1 : parseInt(e.target.value)
                          setSearchParams((prev) => ({ ...prev, required_capacity: value }))
                        }}
                        required
                        className="pl-10"
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
                        value={searchParams.start_time}
                        onChange={(e) => setSearchParams((prev) => ({ ...prev, start_time: e.target.value }))}
                        required
                        className="pl-10"
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
                        value={searchParams.end_time}
                        onChange={(e) => setSearchParams((prev) => ({ ...prev, end_time: e.target.value }))}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
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
                          variant={searchParams.required_amenities.includes(amenity.id) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleAmenityToggle(amenity.id)}
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
                  <Search className="mr-2 h-4 w-4" />
                  Search Venues
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Venue Results */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Venues</h2>
              <Button variant="outline" onClick={() => setStep(1)}>
                Modify Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map((venue) => (
                <Card key={venue.id}>
                  <CardHeader>
                    <CardTitle>{venue.name}</CardTitle>
                    <CardDescription>{venue.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                      {venue.images[0] ? (
                        <img src={venue.images[0]} alt={venue.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No image available
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{venue.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Capacity</p>
                        <p className="text-sm text-gray-600">{venue.capacity} people</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hourly Rate</p>
                        <p className="text-sm text-gray-600">TZS {venue.hourlyRate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {venue.amenities.map((amenity) => {
                          const amenityInfo = AMENITIES.find((a) => a.id === amenity)
                          if (!amenityInfo) return null
                          const Icon = amenityInfo.icon
                          return (
                            <span
                              key={amenity}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <Icon className="mr-1 h-3 w-3" />
                              {amenityInfo.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        localStorage.setItem("selectedVenue", JSON.stringify(venue))
                        localStorage.setItem("searchParams", JSON.stringify(searchParams))
                        router.push(`/dashboard/book/${venue.id}`)
                      }}
                    >
                      Book This Venue
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
