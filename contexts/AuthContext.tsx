"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/services/authService"

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "staff" | "external" | "admin"
  phone?: string
  organization?: string
  studentId?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password)
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem("user", JSON.stringify(result.user))
      }
      return result
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  const register = async (userData: any) => {
    try {
      const result = await authService.register(userData)
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem("user", JSON.stringify(result.user))
      }
      return result
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) return { success: false, error: "No user logged in" }

      const result = await authService.updateProfile(user.id, userData)
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem("user", JSON.stringify(result.user))
      }
      return result
    } catch (error) {
      return { success: false, error: "Profile update failed" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
