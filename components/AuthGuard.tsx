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

    // If not logged in, redirect to login except on /, /auth/login, or /auth/register
    if (!token || !user) {
      if (pathname !== "/" && pathname !== "/auth/login" && pathname !== "/auth/register") {
        router.replace("/auth/login")
      }
      return
    }

    // If logged in and on home or login/register, redirect to dashboard
    if (token && user) {
      if (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/register") {
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