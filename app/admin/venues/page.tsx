"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { venueService, type Venue } from "@/services/venueService"
import { timetableService } from "@/services/timetableService"
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
  Upload,
  Download,
  Calendar,
  FileSpreadsheet,
  Check,
} from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

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

interface TimetableFormData {
  file: File | null
  start_date: string
  end_date: string
  file_type: "excel" | "csv"
}

export default function AdminVenuesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null)
  const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [successData, setSuccessData] = useState<{ processed_entries: number; total_weeks: number; updated_venues: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [timetableLoading, setTimetableLoading] = useState(false)
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
  const [editFormData, setEditFormData] = useState<FormData>({
    name: "",
    description: "",
    capacity: "",
    location: "",
    cost_amount: "",
    image: null,
    is_active: true,
    amenities: [],
  })
  const [timetableFormData, setTimetableFormData] = useState<TimetableFormData>({
    file: null,
    start_date: "",
    end_date: "",
    file_type: "excel",
  })

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

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
    setDeletingVenue(venue)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingVenue) return

    try {
      setDeleteLoading(true)
      const result = await venueService.deleteVenue(deletingVenue.id)
      if (result.success) {
        toast({
          title: "Success",
          description: `${deletingVenue.name} has been deleted successfully`,
        })
        await fetchVenues()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete venue",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting venue:", error)
      toast({
        title: "Error",
        description: "Failed to delete venue",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
      setDeletingVenue(null)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVenue) return

    setEditLoading(true)
    setError("")

    try {
      const updateParams: any = {
        name: editFormData.name,
        description: editFormData.description,
        capacity: parseInt(editFormData.capacity),
        location: editFormData.location,
        cost_amount: parseFloat(editFormData.cost_amount),
        is_active: editFormData.is_active,
        amenities: editFormData.amenities,
      }

      // Only include image if a new one is selected
      if (editFormData.image) {
        updateParams.image = editFormData.image
      }

      const result = await venueService.updateVenue(editingVenue.id, updateParams)

      if (result.success) {
        toast({
          title: "Success",
          description: "Venue updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingVenue(null)
        setEditFormData({
          name: "",
          description: "",
          capacity: "",
          location: "",
          cost_amount: "",
          image: null,
          is_active: true,
          amenities: [],
        })
        await fetchVenues()
      }
    } catch (err) {
      console.error("Error updating venue:", err)
      setError(err instanceof Error ? err.message : "An error occurred while updating the venue")
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleEditAmenityChange = (amenity: string) => {
    setEditFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleTimetableFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      // Auto-detect file type
      let fileType: "excel" | "csv" = "excel"
      if (extension === "csv") {
        fileType = "csv"
      }
      
      setTimetableFormData(prev => ({ 
        ...prev, 
        file: file,
        file_type: fileType
      }))
    }
  }

  const handleTimetableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTimetableLoading(true)
    setError("")

    try {
      if (!timetableFormData.file) {
        setError("Please select a file")
        setTimetableLoading(false)
        return
      }

      const result = await timetableService.importTimetable({
        file: timetableFormData.file,
        start_date: timetableFormData.start_date,
        end_date: timetableFormData.end_date,
        file_type: timetableFormData.file_type,
      })

      if (result.success) {
        setIsTimetableDialogOpen(false)
        setTimetableFormData({
          file: null,
          start_date: "",
          end_date: "",
          file_type: "excel",
        })
        setSuccessData(result.data)
        setIsSuccessDialogOpen(true)
        
        // Also show a toast notification
        toast({
          title: "Success",
          description: `Timetable imported successfully! Processed ${result.data.processed_entries} entries.`,
        })
      } else {
        setError(result.message || "Failed to import timetable")
      }
    } catch (err) {
      console.error("Error importing timetable:", err)
      setError(err instanceof Error ? err.message : "An error occurred while importing the timetable")
    } finally {
      setTimetableLoading(false)
    }
  }

  const handleDownloadTemplate = async (format: "excel" | "csv") => {
    try {
      const blob = await timetableService.downloadTemplate(format)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timetable_template.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Template Downloaded",
        description: `Timetable template downloaded successfully as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Error downloading template:", error)
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the template",
        variant: "destructive",
      })
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
          <div className="flex gap-2">
            <Dialog open={isTimetableDialogOpen} onOpenChange={setIsTimetableDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Import Timetable
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Timetable</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or Excel file to import venue timetable data. The file should contain columns for Day, Time Slot, Venue Name, and Course/Subject.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTimetableSubmit}>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="timetable-file">Timetable File</Label>
                      <Input
                        id="timetable-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleTimetableFileChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Supported formats: Excel (.xlsx, .xls) or CSV (.csv). Max size: 10MB
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={timetableFormData.start_date}
                          onChange={(e) => setTimetableFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={timetableFormData.end_date}
                          onChange={(e) => setTimetableFormData(prev => ({ ...prev, end_date: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file-type">File Type</Label>
                      <Select
                        value={timetableFormData.file_type}
                        onValueChange={(value: "excel" | "csv") => setTimetableFormData(prev => ({ ...prev, file_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDownloadTemplate("excel")}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel Template
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDownloadTemplate("csv")}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={timetableLoading}>
                      {timetableLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Timetable
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Venue</DialogTitle>
                  <DialogDescription>Update the venue details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        placeholder="Enter venue name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        placeholder="Enter venue description"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-capacity">Capacity</Label>
                      <Input
                        id="edit-capacity"
                        name="capacity"
                        type="number"
                        value={editFormData.capacity}
                        onChange={handleEditInputChange}
                        placeholder="Enter venue capacity"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        name="location"
                        value={editFormData.location}
                        onChange={handleEditInputChange}
                        placeholder="Enter venue location"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-cost_amount">Cost Amount</Label>
                      <Input
                        id="edit-cost_amount"
                        name="cost_amount"
                        type="number"
                        step="0.01"
                        value={editFormData.cost_amount}
                        onChange={handleEditInputChange}
                        placeholder="Enter venue cost"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-image">Venue Image (Optional)</Label>
                      <Input
                        id="edit-image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to keep the current image
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableAmenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${amenity}`}
                              checked={editFormData.amenities.includes(amenity)}
                              onCheckedChange={() => handleEditAmenityChange(amenity)}
                            />
                            <Label
                              htmlFor={`edit-${amenity}`}
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
                        id="edit-is_active"
                        checked={editFormData.is_active}
                        onCheckedChange={(checked) => setEditFormData((prev) => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="edit-is_active">Active</Label>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Venue"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    Delete Venue
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this venue? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {deletingVenue && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-900">{deletingVenue.name}</h3>
                          <p className="text-sm text-red-700">{deletingVenue.location}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>This will permanently delete:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>The venue and all its details</li>
                          <li>Any associated images</li>
                          <li>All booking history for this venue</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false)
                      setDeletingVenue(null)
                    }}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Venue
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Timetable Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Timetable Management
            </CardTitle>
            <CardDescription>
              Import venue timetable data from CSV or Excel files to automatically schedule venue availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Import Timetable</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Upload timetable files to automatically schedule venue availability based on course schedules
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsTimetableDialogOpen(true)}
                  className="w-full"
                >
                  Import Now
                </Button>
              </div>
              <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Download Templates</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Get the correct format for your timetable files with our pre-configured templates
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate("excel")}
                    className="w-full"
                  >
                    Excel Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate("csv")}
                    className="w-full"
                  >
                    CSV Template
                  </Button>
                </div>
              </div>
              <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">File Format</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Required columns: Day, Time Slot, Venue Name, Course/Subject
                </p>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Day: Monday, Tuesday, etc.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Time Slot: 09:00-11:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Venue Name: Exact venue name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Course/Subject: Course description</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

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
                      <span className="text-sm">Cost: {formatCurrency(venue.cost_amount)}</span>
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
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditDialogOpen(true)
                      setEditingVenue(venue)
                      setEditFormData({
                        name: venue.name,
                        description: venue.description,
                        capacity: venue.capacity.toString(),
                        location: venue.location,
                        cost_amount: venue.cost_amount.toString(),
                        image: null,
                        is_active: venue.is_active,
                        amenities: venue.amenities || [],
                      })
                    }}>
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

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Timetable Import Successful
            </DialogTitle>
            <DialogDescription>
              Your timetable has been successfully imported and processed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {successData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Processed Entries:</span>
                  <span className="text-lg font-bold text-green-600">{successData.processed_entries}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Total Weeks:</span>
                  <span className="text-lg font-bold text-blue-600">{successData.total_weeks}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">Updated Venues:</span>
                  <span className="text-lg font-bold text-purple-600">{successData.updated_venues}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
