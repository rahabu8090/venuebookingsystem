import { API_URL } from "@/lib/constants"
import type { User } from "@/contexts/AuthContext"

interface UserStats {
  total: number
  active: number
  by_role: {
    admin: number
    staff: number
    student: number
    external: number
  }
}

interface VenueStats {
  total: number
  active: number
  total_capacity: number
  average_capacity: number
}

interface BookingStats {
  total: number
  pending: number
  approved: number
  rejected: number
  today: number
  this_week: number
  this_month: number
}

interface RevenueStats {
  total: string
  today: number
  this_week: number
  this_month: string
}

interface AdminStats {
  users: UserStats
  venues: VenueStats
  bookings: BookingStats
  revenue: RevenueStats
  recent_bookings: Array<{
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
    user: {
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
  }>
}

interface AdminStatsResponse {
  success: boolean
  message: string
  data: AdminStats
}

export interface AdminReport {
  overview: {
    total_revenue: string
    total_users: number
    average_booking_value: string
  }
  bookings_by_role: {
    student: number
    staff?: number
    "external user"?: number
  }
  venue_utilization: Array<{
    venue_id: string
    venue_name: string
    total_bookings: number
    total_revenue: string
    utilization_rate: number
  }>
  booking_status_distribution: {
    approved: number
    pending?: number
    rejected?: number
  }
  monthly_trends: Array<{
    month: string
    total_bookings: number
    total_revenue: string
  }>
}

export const adminService = {
  async getStats(): Promise<AdminStatsResponse> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_URL}/admin/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch admin statistics")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching admin statistics:", error)
      throw error
    }
  },

  async getReports(): Promise<{ success: boolean; data?: AdminReport; error?: string }> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/admin/reports`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to fetch reports" }
      }

      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: "Failed to fetch reports" }
    }
  },
} 