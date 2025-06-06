"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { venueService, type Venue } from "@/services/venueService"
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
  DialogFooter,
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
  Loader2,
} from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  projector: Monitor,
  ac: Snowflake,
  sound_system: Volume2,
  whiteboard: PresentationChart,
  tv_screen: Monitor,
  stage: PresentationChart,
  lighting: Lightbulb,
  video_wall: Monitor,
  refreshment_area: Lightbulb,
  display_walls: Monitor,
  natural_lighting: Lightbulb,
  video_conferencing: Monitor,
  coffee_service: Lightbulb,
  multiple_screens: Monitor,
  high_speed_internet: Wifi,
  interactive_displays: Monitor,
  quiet_environment: Lightbulb,
  outdoor_seating: Lightbulb,
  covered_area: Lightbulb,
  document_camera: Monitor,
  podium: PresentationChart,
}

interface FormData {
  name: string
  description: string
  capacity: string
  location: string
  cost_amount: string
  image: File | null
  is_active: boolean
  amenities: string[]
}

export default function AdminVenuesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [venues, setVenues] = useState<Venue[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    capacity: "",
    location: "",
    cost_amount: "",
    image: null,
    is_active: true,
    amenities: [],
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    } else {
      fetchVenues()
    }
  }, [user, router])

  const fetchVenues = async () => {
    try {
      const response = await venueService.getVenues()
      if (response.success) {
        setVenues(response.data)
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive",
      })
    }
  }

  const availableAmenities = [
    "wifi",
    "projector",
    "whiteboard",
    "ac",
    "podium",
    "sound_system",
  ]

  if (!user || user.role !== "admin") {
    return null
  }

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      location: "",
      cost_amount: "",
      image: null,
      is_active: true,
      amenities: [],
    })
    setError("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.image) {
        setError("Please select an image")
        setLoading(false)
        return
      }

      const result = await venueService.createVenue({
        name: formData.name,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        location: formData.location,
        cost_amount: parseFloat(formData.cost_amount),
        image: formData.image,
        is_active: formData.is_active,
        amenities: formData.amenities,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Venue created successfully",
        })
        setIsAddDialogOpen(false)
        resetForm()
        await fetchVenues()
      }
    } catch (err) {
      console.error("Error creating venue:", err)
      setError(err instanceof Error ? err.message : "An error occurred while creating the venue")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (venue: Venue) => {
    if (confirm(`Are you sure you want to delete ${venue.name}?`)) {
      toast({
        title: "Venue Deleted",
        description: `${venue.name} has been deleted`,
      })
      await router.refresh()
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Venue</DialogTitle>
                <DialogDescription>Enter the details of the new venue.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter venue name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter venue description"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="Enter venue capacity"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter venue location"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost_amount">Cost Amount</Label>
                    <Input
                      id="cost_amount"
                      name="cost_amount"
                      type="number"
                      step="0.01"
                      value={formData.cost_amount}
                      onChange={handleInputChange}
                      placeholder="Enter venue cost"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Venue Image</Label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableAmenities.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() => handleAmenityChange(amenity)}
                          />
                          <Label
                            htmlFor={amenity}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Venue"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {venue.image_path ? (
                  <img
                    src={venue.image_path}
                    alt={venue.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={venue.is_active ? "default" : "secondary"}>
                    {venue.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>{venue.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{venue.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Cost: ${venue.cost_amount}</span>
                    </div>
                  </div>
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity] || MapPin
                        return (
                          <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(venue)}>
                      <Trash2 className="h-4 w-4 mr-2" />
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
