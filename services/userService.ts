import { API_URL } from "@/lib/constants"

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

interface Pagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface GetUsersResponse {
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: Pagination
  }
}

interface GetUsersParams {
  search?: string
  role?: string
  per_page?: number
  page?: number
}

export const userService = {
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const queryParams = new URLSearchParams()
      if (params.search) queryParams.append("search", params.search)
      if (params.role) queryParams.append("role", params.role)
      if (params.per_page) queryParams.append("per_page", params.per_page.toString())
      if (params.page) queryParams.append("page", params.page.toString())

      const response = await fetch(`${API_URL}/admin/users?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }
} 