import { API_URL } from "@/lib/constants"

export interface ReportsData {
  overview: {
    total_revenue: number
    total_users: number
    average_booking_value: number
  }
  bookings_by_role: {
    student: number
    staff: number
    "external user": number
  }
  venue_utilization: Array<{
    venue_id: number
    venue_name: string
    total_bookings: number
    total_revenue: number
    utilization_rate: number
  }>
  booking_status_distribution: {
    pending: number
    approved: number
    rejected: number
    paid?: number
    completed?: number
  }
  monthly_trends: Array<{
    month: string
    total_bookings: number
    total_revenue: number
  }>
}

export interface ReportsResponse {
  success: boolean
  message: string
  data: ReportsData
}

export const reportsService = {
  async getReports(year?: number): Promise<ReportsResponse> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const url = new URL(`${API_URL}/admin/reports`)
      if (year) {
        url.searchParams.append('year', year.toString())
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch reports")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching reports:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch reports",
        data: {
          overview: {
            total_revenue: 0,
            total_users: 0,
            average_booking_value: 0
          },
          bookings_by_role: {
            student: 0,
            staff: 0,
            "external user": 0
          },
          venue_utilization: [],
          booking_status_distribution: {
            pending: 0,
            approved: 0,
            rejected: 0
          },
          monthly_trends: []
        }
      }
    }
  }
} 