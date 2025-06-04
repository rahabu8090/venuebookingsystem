"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Wifi,
  Monitor,
  Snowflake,
  Volume2,
  PresentationIcon as PresentationChart,
  Lightbulb,
} from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
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

export default function AdminVenuesPage() {
  const { user } = useAuth()
  const { venues, refreshData } = useBooking()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
    description: "",
    hourlyRate: "",
    amenities: [],
  })

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

  if (!user || user.role !== "admin") {
    return null
  }

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      location: "",
      description: "",
      hourlyRate: "",
      amenities: [],
    })
    setEditingVenue(null)
  }

  const handleEdit = (venue) => {
    setFormData({
      name: venue.name,
      capacity: venue.capacity.toString(),
      location: venue.location,
      description: venue.description,
      hourlyRate: venue.hourlyRate.toString(),
      amenities: venue.amenities,
    })
    setEditingVenue(venue)
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.capacity || !formData.location || !formData.hourlyRate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Mock venue creation/update
    const venueData = {
      id: editingVenue?.id || Date.now().toString(),
      name: formData.name,
      capacity: Number.parseInt(formData.capacity),
      location: formData.location,
      description: formData.description,
      hourlyRate: Number.parseFloat(formData.hourlyRate),
      amenities: formData.amenities,
      images: ["/placeholder.svg?height=300&width=400"],
    }

    toast({
      title: editingVenue ? "Venue Updated" : "Venue Added",
      description: `${venueData.name} has been ${editingVenue ? "updated" : "added"} successfully`,
    })

    resetForm()
    setIsAddDialogOpen(false)
    await refreshData()
  }

  const handleDelete = async (venue) => {
    if (confirm(`Are you sure you want to delete ${venue.name}?`)) {
      toast({
        title: "Venue Deleted",
        description: `${venue.name} has been deleted`,
      })
      await refreshData()
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
            <p className="text-gray-600">Manage venues and their details</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingVenue ? "Edit Venue" : "Add New Venue"}</DialogTitle>
                <DialogDescription>
                  {editingVenue ? "Update venue information" : "Create a new venue for booking"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableAmenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Monitor
                      return (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() => handleAmenityToggle(amenity)}
                          />
                          <Label htmlFor={`amenity-${amenity}`} className="flex items-center gap-2 text-sm">
                            <IconComponent className="h-4 w-4" />
                            {amenity}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingVenue ? "Update Venue" : "Add Venue"}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{venue.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {venue.location}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {venue.hourlyRate}/hr
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={venue.images[0] || "/placeholder.svg"}
                    alt={venue.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  <p className="text-sm text-gray-600">{venue.description}</p>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Up to {venue.capacity} guests</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Amenities</Label>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Monitor
                        return (
                          <Badge key={amenity} variant="outline" className="flex items-center gap-1 text-xs">
                            <IconComponent className="h-3 w-3" />
                            {amenity}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEdit(venue)
                        setIsAddDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(venue)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
