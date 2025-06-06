import type { Venue } from "@/contexts/BookingContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface SearchVenueParams {
  booking_date: string
  start_time: string
  end_time: string
  required_capacity: number
  required_amenities: string[]
}

export interface VenueAvailability {
  date: string
  time_slots: string[]
}

export interface VenueResponse {
  id: string
  name: string
  description: string
  capacity: number
  cost_amount: string
  location: string
  image_path: string
  is_active: boolean
  availability_schedule: VenueAvailability[]
  amenities: string[]
  created_at: string
  updated_at: string
  is_available: boolean
  occupied_slots: string[]
  has_required_amenities: boolean
}

export interface CreateBookingParams {
  venue_id: string
  booking_date: string
  start_time: string
  end_time: string
  required_capacity: number
  required_amenities: string[]
  purpose: string
  event_details: string
}

export interface BookingResponse {
  success: boolean
  message: string
  data: {
    booking: {
      id: string
      user_id: string
      venue_id: string
      booking_date: string
      start_time: string
      end_time: string
      required_capacity: number
      required_amenities: string[]
      purpose: string
      status: string
      created_at: string
      updated_at: string
    }
  }
}

export interface Booking {
  id: string
  user_id: string
  venue_id: string
  booking_date: string
  start_time: string
  end_time: string
  required_capacity: number
  required_amenities: string[]
  status: string
  control_number: string | null
  rejection_reason: string | null
  purpose: string
  event_details: string | null
  created_at: string
  updated_at: string
  venue: {
    id: string
    name: string
    description: string
    capacity: number
    cost_amount: string
    location: string
    image_path: string
    is_active: boolean
    availability_schedule: Array<{
      date: string
      time_slots: string[]
    }>
    amenities: string[]
    created_at: string
    updated_at: string
  }
}

interface BookingsResponse {
  success: boolean
  message: string
  data: Booking[]
}

interface UserStats {
  total_bookings: number
  pending_bookings: number
  approved_bookings: number
  rejected_bookings: number
  completed_bookings: number
}

interface UserStatsResponse {
  success: boolean
  message: string
  data: {
    stats: UserStats
    recent_bookings: Booking[]
  }
}

export const bookingService = {
  async searchVenues(params: SearchVenueParams): Promise<{ success: boolean; venues?: Venue[]; error?: string }> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/bookings/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to search venues" }
      }

      // Transform API venue data to match our Venue type
      const venues: Venue[] = Object.values(data.data).map((venue: VenueResponse) => ({
        id: venue.id,
        name: venue.name,
        capacity: venue.capacity,
        amenities: venue.amenities,
        description: venue.description,
        images: [venue.image_path],
        hourlyRate: parseFloat(venue.cost_amount),
        location: venue.location,
      }))

      return { success: true, venues }
    } catch (error) {
      return { success: false, error: "Failed to search venues" }
    }
  },

  async createBooking(params: CreateBookingParams) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to create booking" }
      }

      return { success: true, booking: data.data.booking }
    } catch (error) {
      console.error("Error creating booking:", error)
      return { success: false, error: "Failed to create booking" }
    }
  },

  async getUserBookings() {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to fetch bookings" }
      }

      return { success: true, bookings: data.data }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      return { success: false, error: "Failed to fetch bookings" }
    }
  },

  async getUserStats() {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/user/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to fetch user stats" }
      }

      return { success: true, stats: data.data.stats, recentBookings: data.data.recent_bookings }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return { success: false, error: "Failed to fetch user stats" }
    }
  },
} 