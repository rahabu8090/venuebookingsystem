import type { Venue } from "@/contexts/BookingContext"
import { API_URL } from "@/lib/constants"

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

export interface User {
  id: string
  full_name: string
  email: string
  image_path: string | null
  role: string
  phone_number: string
  registration_number: string
  address: string
  profile_picture: string | null
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user: {
    id: string
    full_name: string
    email: string
    phone_number: string
    registration_number: string
    role: string
  }
  venue: {
    id: string
    name: string
    location: string
  }
  booking_date: string
  start_time: string
  end_time: string
  required_capacity: number
  purpose: string
  event_details?: string
  status: "pending" | "approved" | "paid" | "completed" | "rejected" | "cancelled"
  price?: number
  approved_cost?: number
  control_number?: string
  rejection_reason?: string
  cancellation_reason?: string
  required_amenities?: string[]
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

export interface AdminBookingsResponse {
  success: boolean
  message: string
  data: Booking[]
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
      const venues: Venue[] = Object.values(data.data).map((venue: any) => ({
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

  async getAdminBookings(): Promise<AdminBookingsResponse> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`${API_URL}/admin/bookings`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching admin bookings:", error)
      throw error
    }
  },

  async updateBookingStatus(
    bookingId: string,
    status: Booking["status"],
    controlNumber?: string,
    approvedCost?: number,
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      let endpoint = `${API_URL}/admin/bookings/${bookingId}`
      let method = "PUT"
      let body: any = { status }

      // Use the approve endpoint for approved status
      if (status === "approved") {
        endpoint = `${API_URL}/admin/bookings/${bookingId}/approve`
        method = "POST"
        body = { 
          approved_cost: approvedCost || 0,
          ...(approvedCost && approvedCost > 0 && controlNumber ? { control_number: controlNumber } : {})
        }
      }

      // Use the reject endpoint for rejected status
      if (status === "rejected") {
        endpoint = `${API_URL}/admin/bookings/${bookingId}/reject`
        method = "POST"
        body = { 
          rejection_reason: rejectionReason
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking status")
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating booking status:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update booking status",
      }
    }
  },

  async cancelBooking(bookingId: string, cancellationReason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cancellation_reason: cancellationReason }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking")
      }

      return { success: true }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel booking",
      }
    }
  },
} 