import { API_URL } from "@/lib/constants"

export interface Venue {
  id: string
  name: string
  description: string
  capacity: number
  location: string
  cost_amount: string
  is_active: boolean
  availability_schedule: Array<{
    date: string
    time_slots: string[]
  }>
  image_path: string | null
  amenities: string[] | null
  created_at: string
  updated_at: string
}

export interface VenuesResponse {
  success: boolean
  message: string
  data: Venue[]
}

export interface CreateVenueParams {
  name: string
  description: string
  capacity: number
  location: string
  cost_amount: number
  image: File
  is_active: boolean
  amenities: string[]
}

export interface CreateVenueResponse {
  success: boolean
  message: string
  data: Venue
}

export const venueService = {
  async getVenues(): Promise<VenuesResponse> {
    try {
      const response = await fetch(`${API_URL}/venues`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch venues")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching venues:", error)
      throw error
    }
  },

  async createVenue(params: CreateVenueParams): Promise<CreateVenueResponse> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const formData = new FormData()
      formData.append("name", params.name)
      formData.append("description", params.description)
      formData.append("capacity", params.capacity.toString())
      formData.append("location", params.location)
      formData.append("cost_amount", params.cost_amount.toString())
      formData.append("image", params.image)
      formData.append("is_active", params.is_active.toString())
      params.amenities.forEach((amenity) => {
        formData.append("amenities[]", amenity)
      })

      const response = await fetch(`${API_URL}/venues`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create venue")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating venue:", error)
      throw error
    }
  },
} 