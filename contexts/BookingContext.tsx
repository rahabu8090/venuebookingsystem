"use client"

import React, { createContext, useContext, useState } from "react"
import { mockBookingService } from "@/services/mockBookingService"

export interface Venue {
  id: string
  name: string
  capacity: number
  amenities: string[]
  description: string
  images: string[]
  hourlyRate: number
  location: string
}

export interface Booking {
  id: string
  userId: string
  venueId: string
  date: string
  startTime: string
  endTime: string
  guests: number
  description: string
  amenities: string[]
  status: "pending" | "approved" | "rejected" | "paid" | "completed"
  price?: number
  controlNumber?: string
  paymentDeadline?: string
  createdAt: string
  feedback?: {
    rating: number
    comment: string
    createdAt: string
  }
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  controlNumber: string
  status: "pending" | "confirmed" | "overdue"
  deadline: string
  transactionId?: string
  receipt?: string
  paidAt?: string
}

interface BookingContextType {
  venues: Venue[]
  bookings: Booking[]
  payments: Payment[]
  searchVenues: (criteria: any) => Promise<Venue[]>
  createBooking: (bookingData: any) => Promise<{ success: boolean; booking?: Booking; error?: string }>
  updateBookingStatus: (
    bookingId: string,
    status: string,
    price?: number,
  ) => Promise<{ success: boolean; error?: string }>
  submitPayment: (bookingId: string, paymentData: any) => Promise<{ success: boolean; error?: string }>
  submitFeedback: (bookingId: string, feedback: any) => Promise<{ success: boolean; error?: string }>
  getUserBookings: (userId: string) => Booking[]
  refreshData: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  React.useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    const [venuesData, bookingsData, paymentsData] = await Promise.all([
      mockBookingService.getVenues(),
      mockBookingService.getBookings(),
      mockBookingService.getPayments(),
    ])
    setVenues(venuesData)
    setBookings(bookingsData)
    setPayments(paymentsData)
  }

  const searchVenues = async (criteria: any) => {
    return await mockBookingService.searchVenues(criteria)
  }

  const createBooking = async (bookingData: any) => {
    const result = await mockBookingService.createBooking(bookingData)
    if (result.success) {
      await refreshData()
    }
    return result
  }

  const updateBookingStatus = async (bookingId: string, status: string, price?: number) => {
    const result = await mockBookingService.updateBookingStatus(bookingId, status, price)
    if (result.success) {
      await refreshData()
    }
    return result
  }

  const submitPayment = async (bookingId: string, paymentData: any) => {
    const result = await mockBookingService.submitPayment(bookingId, paymentData)
    if (result.success) {
      await refreshData()
    }
    return result
  }

  const submitFeedback = async (bookingId: string, feedback: any) => {
    const result = await mockBookingService.submitFeedback(bookingId, feedback)
    if (result.success) {
      await refreshData()
    }
    return result
  }

  const getUserBookings = (userId: string) => {
    return bookings.filter((booking) => booking.userId === userId)
  }

  return (
    <BookingContext.Provider
      value={{
        venues,
        bookings,
        payments,
        searchVenues,
        createBooking,
        updateBookingStatus,
        submitPayment,
        submitFeedback,
        getUserBookings,
        refreshData,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
