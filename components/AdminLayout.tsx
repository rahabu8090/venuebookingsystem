"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Venues", href: "/admin/venues", icon: Building2 },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen university-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") return null

  return (
    <div className="min-h-screen university-bg">
      {/* Header */}
      <header className="university-header shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="university-seal">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold university-logo-text">Admin Portal</h1>
                  <p className="text-sm text-gray-200">University Management System</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden lg:flex items-center space-x-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`university-nav-item flex items-center px-3 py-2 rounded-md transition-all text-sm ${
                        isActive ? "active" : ""
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name || "Admin"} />
                      <AvatarFallback className="bg-white text-gray-900 font-semibold">
                        {user.name ? user.name.charAt(0) : "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 university-card" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium leading-none university-text-navy">{user.name || "Administrator"}</p>
                      <p className="text-xs leading-none text-gray-600">{user.email || ""}</p>
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-xs font-medium text-red-700 w-fit border border-red-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b university-border">
        <div className="flex overflow-x-auto p-4 space-x-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive ? "bg-red-50 text-red-700 border border-red-200" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
