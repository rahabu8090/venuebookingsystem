"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useBooking } from "@/contexts/BookingContext"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Star, Building2, BookOpen } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function DashboardPage() {
  const { user } = useAuth()
  const { getUserBookings, venues } = useBooking()

  if (!user) return null

  const userBookings = getUserBookings(user.id)
  const recentBookings = userBookings.slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-pending"
      case "approved":
        return "badge-approved"
      case "rejected":
        return "badge-rejected"
      case "paid":
        return "badge-paid"
      case "completed":
        return "badge-completed"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVenueName = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId)
    return venue?.name || "Unknown Venue"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.name.split(" ")[0]}{" "}
                {user.role === "student" ? "Student" : user.role === "staff" ? "Staff" : ""}!
              </h1>
              <p className="text-blue-100 text-lg">Manage your venue bookings and explore available spaces</p>
            </div>
            <div className="hidden md:block">
              <Calendar className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
              <Calendar className="h-5 w-5 text-university-blue" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{userBookings.length}</div>
            <p className="text-sm text-gray-500">All time bookings</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending Approval</h3>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              {userBookings.filter((b) => b.status === "pending").length}
            </div>
            <p className="text-sm text-gray-500">Awaiting confirmation</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Completed</h3>
              <Star className="h-5 w-5 text-university-green" />
            </div>
            <div className="text-3xl font-bold text-university-green">
              {userBookings.filter((b) => b.status === "completed").length}
            </div>
            <p className="text-sm text-gray-500">Successfully completed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="university-card p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Quick Actions
          </h2>
          <p className="text-gray-600 mb-6">Get started with booking a venue or managing your existing bookings</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/book">
              <Button className="btn-primary">
                <Building2 className="w-4 h-4 mr-2" />
                Book a Venue
              </Button>
            </Link>
            <Link href="/dashboard/bookings">
              <Button className="btn-outline">View All Bookings</Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button className="btn-outline">Edit Profile</Button>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="university-card p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Bookings</h2>
          <p className="text-gray-600 mb-6">Your latest venue booking requests and their status</p>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4 text-lg">No bookings found</p>
              <Link href="/dashboard/book">
                <Button className="btn-primary">Make Your First Booking</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-blue-700 text-lg">{getVenueName(booking.venueId)}</h3>
                      <span className={getStatusColor(booking.status)}>{booking.status}</span>
                    </div>
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {booking.guests} guests
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">{booking.description}</p>
                </div>
              ))}

              {userBookings.length > 3 && (
                <div className="text-center pt-4">
                  <Link href="/dashboard/bookings">
                    <Button className="btn-outline">View All Bookings</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured Venues */}
        <div className="university-card p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Featured Venues</h2>
          <p className="text-gray-600 mb-6">Explore some of our popular venues for your next booking</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.slice(0, 3).map((venue) => (
              <div key={venue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <img
                  src={venue.images[0] || "/placeholder.svg?height=120&width=200"}
                  alt={venue.name}
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-blue-700 mb-1">{venue.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Up to {venue.capacity} guests</span>
                  <span className="font-semibold text-blue-700">${venue.hourlyRate}/hr</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/dashboard/book">
              <Button className="btn-outline">View All Venues</Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
