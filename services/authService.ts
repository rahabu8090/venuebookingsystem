import type { User } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Login failed" }
      }

      // Store token
      localStorage.setItem("token", data.data.token)

      // Transform API user data to match our User type
      const user: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.full_name,
        role: data.data.user.role,
        phone: data.data.user.phone_number,
        studentId: data.data.user.registration_number,
        department: data.data.user.department,
        organization: data.data.user.organization,
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  },

  async register(userData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          full_name: userData.name,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.passwordConfirmation,
          role: userData.role,
          phone_number: userData.phone,
          registration_number: userData.studentId,
          address: userData.address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Registration failed" }
      }

      // Store token
      localStorage.setItem("token", data.data.token)

      // Transform API user data to match our User type
      const user: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.full_name,
        role: data.data.user.role,
        phone: data.data.user.phone_number,
        studentId: data.data.user.registration_number,
        department: data.data.user.department,
        organization: data.data.user.organization,
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, error: "Not authenticated" }
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Profile update failed" }
      }

      // Transform API user data to match our User type
      const user: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.full_name,
        role: data.data.user.role,
        phone: data.data.user.phone_number,
        studentId: data.data.user.registration_number,
        department: data.data.user.department,
        organization: data.data.user.organization,
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Profile update failed" }
    }
  },
} 