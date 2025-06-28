"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    const user = userStr ? JSON.parse(userStr) : null

    // Define public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/auth/login",
      "/auth/register",
      "/auth/reset-password",
      "/auth/reset-password/verify"
    ]

    // If not logged in, redirect to login except for public routes
    if (!token || !user) {
      if (!publicRoutes.includes(pathname)) {
        router.replace("/auth/login")
      }
      return
    }

    // If logged in and on public routes, redirect to dashboard
    if (token && user) {
      if (publicRoutes.includes(pathname)) {
        if (user.role === "admin") {
          router.replace("/admin")
        } else {
          router.replace("/dashboard")
        }
        return
      }
      // If on a dashboard page, but role doesn't match, redirect
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        router.replace("/dashboard")
        return
      }
      if (pathname.startsWith("/dashboard") && user.role === "admin") {
        router.replace("/admin")
        return
      }
    }
  }, [router, pathname])

  return <>{children}</>
} 