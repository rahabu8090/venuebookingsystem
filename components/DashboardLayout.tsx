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
import { Calendar, Home, User, LogOut, Building2, GraduationCap, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Book Venue", href: "/dashboard/book", icon: Building2 },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="university-header h-20 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-university-blue rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-university-blue">UNIVERSITY</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide">VENUE BOOKING SYSTEM</p>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-blue-700">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <Link href="/dashboard/book" className="flex items-center text-gray-600 hover:text-blue-700">
            <Building2 className="w-4 h-4 mr-2" />
            Book Venue
          </Link>
          <Link href="/dashboard/bookings" className="flex items-center text-gray-600 hover:text-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            My Bookings
          </Link>
          <Link href="/dashboard/profile" className="flex items-center text-gray-600 hover:text-blue-700">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                  <AvatarFallback className="bg-university-blue text-white text-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`university-sidebar ${sidebarOpen ? "open" : ""} md:relative md:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <div className="flex-1 p-4">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-university-blue mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Navigation
                </h3>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* User Info */}
            <div className="user-info">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-university-blue mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  User Info
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {user.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                {user.studentId && (
                  <div>
                    <span className="font-medium">ID:</span> {user.studentId}
                  </div>
                )}
                {user.department && (
                  <div>
                    <span className="font-medium">Dept:</span> {user.department}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 university-main p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
