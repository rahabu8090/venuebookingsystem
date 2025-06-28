"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Building2, Calendar, Users, Shield, GraduationCap, BookOpen, Award, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FeaturedVenue {
  id: string
  name: string
  description: string
  capacity: number
  location: string
  image_path: string | null
  cost_amount: number
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [featuredVenues, setFeaturedVenues] = useState<FeaturedVenue[]>([])
  const [loading, setLoading] = useState(true)

  // Debug log for environment variables
  useEffect(() => {
    console.log('Environment Variables:', {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL
    })
  }, [])

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

  useEffect(() => {
    const fetchFeaturedVenues = async () => {
      try {
        // Use URL constructor to ensure proper URL formation
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || ''
        const apiUrl = new URL('/api/venues/featured', baseUrl).toString()
        
        console.log('Attempting to fetch featured venues from:', apiUrl)

        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('API Response:', result)
        
        if (result.success) {
          setFeaturedVenues(result.data)
        } else {
          console.error('API returned error:', result.message)
          setFeaturedVenues([])
        }
      } catch (error) {
        console.error('Failed to fetch featured venues:', error)
        setFeaturedVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedVenues()
  }, []) // Only fetch on mount

  // Add a useEffect to trigger initial load
  useEffect(() => {
    setLoading(true)
  }, [])

  if (!mounted) return null

  if (user) {
    return null // Will redirect
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getVenueImage = (imagePath: string | null) => {
    try {
      if (!imagePath) return '/images/venue-placeholder.jpg'
      // Ensure the path starts with a slash
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
      return new URL(normalizedPath, process.env.NEXT_PUBLIC_IMAGE_URL).toString()
    } catch (error) {
      console.error('Invalid image path:', imagePath)
      return '/images/venue-placeholder.jpg'
    }
  }

  const FeaturedVenuesSection = () => (
    <section className="py-12 px-6 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Featured Venues</h2>
            <p className="text-lg text-gray-600">
              Discover our most popular venues available for booking
            </p>
          </div>
          
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVenues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={getVenueImage(venue.image_path)}
                    alt={venue.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/venue-placeholder.jpg'
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{venue.name}</CardTitle>
                  <div className="flex items-center text-gray-600 mb-2 text-sm">
                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                    <span className="truncate">{venue.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3 text-sm">
                    <Users className="h-4 w-4 mr-1 shrink-0" />
                    <span>Capacity: {venue.capacity} people</span>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm mb-3">
                    {venue.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-blue-700">
                      {formatCurrency(venue.cost_amount)}
                    </span>
                    <Link href="/auth/login">
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )

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

      {/* Featured Venues */}
      <FeaturedVenuesSection />

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
