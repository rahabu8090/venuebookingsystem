"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Users, Shield, GraduationCap, BookOpen, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  if (!mounted) return null

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="university-header h-20 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-university-blue rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-700">UNIVERSITY</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide">VENUE BOOKING SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="outline" className="btn-outline">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-white">Register</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section text-white py-24 px-6">
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">University Venue Booking System</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Streamlined venue management for students, staff, and external partners
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="bg-white text-university-blue hover:bg-gray-100 px-8 py-4 text-lg rounded-lg font-medium">
                Access System
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-university-blue px-8 py-4 text-lg rounded-lg font-medium">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-700 mb-4">System Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive venue booking platform provides a seamless experience for the entire university
              community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="university-card p-6 text-center">
              <div className="feature-icon blue mx-auto mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <CardTitle className="text-blue-700 mb-3">Multiple Venues</CardTitle>
              <CardDescription className="text-gray-600">
                Choose from a variety of venues with different capacities and amenities across campus
              </CardDescription>
            </Card>

            <Card className="university-card p-6 text-center">
              <div className="feature-icon green mx-auto mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <CardTitle className="text-blue-700 mb-3">Easy Booking</CardTitle>
              <CardDescription className="text-gray-600">
                Simple booking process with real-time availability checking and calendar integration
              </CardDescription>
            </Card>

            <Card className="university-card p-6 text-center">
              <div className="feature-icon purple mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <CardTitle className="text-blue-700 mb-3">Role-Based Access</CardTitle>
              <CardDescription className="text-gray-600">
                Different access levels for Students, Staff, and External users with appropriate permissions
              </CardDescription>
            </Card>

            <Card className="university-card p-6 text-center">
              <div className="feature-icon orange mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <CardTitle className="text-blue-700 mb-3">Admin Control</CardTitle>
              <CardDescription className="text-gray-600">
                Comprehensive admin panel for managing bookings, venues, users, and payments
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Can Use The System */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-700 mb-4">Who Can Use The System</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform serves the entire university community with tailored features for each user type
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="university-card p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-university-blue" />
              </div>
              <CardTitle className="text-blue-700 mb-4">Students</CardTitle>
              <CardDescription className="text-gray-600 mb-6">
                Book study rooms, meeting spaces, and event venues for academic and extracurricular activities
              </CardDescription>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Student ID Required
              </div>
            </Card>

            <Card className="university-card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-university-green" />
              </div>
              <CardTitle className="text-blue-700 mb-4">Faculty & Staff</CardTitle>
              <CardDescription className="text-gray-600 mb-6">
                Reserve classrooms, conference rooms, and auditoriums for lectures, meetings, and departmental events
              </CardDescription>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Staff Credentials
              </div>
            </Card>

            <Card className="university-card p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-university-purple" />
              </div>
              <CardTitle className="text-blue-700 mb-4">External Partners</CardTitle>
              <CardDescription className="text-gray-600 mb-6">
                Access university facilities for conferences, workshops, and collaborative events with the institution
              </CardDescription>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Organization Required
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ready to Get Started */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join our platform and start booking venues for your academic and professional needs
          </p>

          <Link href="/auth/register">
            <Button className="btn-primary px-12 py-4 text-lg">Create Your Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-university-blue text-white py-8 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-university-blue" />
              </div>
              <div>
                <h3 className="font-bold">UNIVERSITY</h3>
                <p className="text-xs text-blue-200 uppercase tracking-wide">VENUE BOOKING SYSTEM</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm">© 2025 University Venue Booking System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
