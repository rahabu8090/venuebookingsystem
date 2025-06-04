import type { Venue, Booking, Payment } from "@/contexts/BookingContext"

// Mock data
const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Conference Hall A",
    capacity: 100,
    amenities: ["Wi-Fi", "Projector", "AC", "Sound System", "Whiteboard"],
    description: "Large conference hall perfect for seminars and presentations",
    images: ["/placeholder.svg?height=300&width=400"],
    hourlyRate: 50,
    location: "Building A, Floor 2",
  },
  {
    id: "2",
    name: "Meeting Room B",
    capacity: 20,
    amenities: ["Wi-Fi", "TV Screen", "AC", "Whiteboard"],
    description: "Intimate meeting room for small group discussions",
    images: ["/placeholder.svg?height=300&width=400"],
    hourlyRate: 25,
    location: "Building B, Floor 1",
  },
  {
    id: "3",
    name: "Auditorium",
    capacity: 300,
    amenities: ["Wi-Fi", "Projector", "AC", "Sound System", "Stage", "Lighting"],
    description: "Large auditorium for major events and presentations",
    images: ["/placeholder.svg?height=300&width=400"],
    hourlyRate: 100,
    location: "Main Building, Ground Floor",
  },
  {
    id: "4",
    name: "Study Room C",
    capacity: 10,
    amenities: ["Wi-Fi", "Whiteboard", "AC"],
    description: "Quiet study room for small groups",
    images: ["/placeholder.svg?height=300&width=400"],
    hourlyRate: 15,
    location: "Library, Floor 3",
  },
  {
    id: "5",
    name: "Executive Boardroom",
    capacity: 15,
    amenities: ["Wi-Fi", "TV Screen", "AC", "Whiteboard", "Sound System"],
    description: "Premium boardroom for executive meetings",
    images: ["/placeholder.svg?height=300&width=400"],
    hourlyRate: 75,
    location: "Executive Building, Floor 5",
  },
]

// Add some sample bookings for demonstration
const mockBookings: Booking[] = [
  {
    id: "1",
    userId: "2",
    venueId: "1",
    date: "2024-02-15",
    startTime: "09:00",
    endTime: "11:00",
    guests: 50,
    description: "Computer Science Department Seminar on AI and Machine Learning",
    amenities: ["Wi-Fi", "Projector", "AC", "Sound System"],
    status: "pending",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    userId: "3",
    venueId: "2",
    date: "2024-02-20",
    startTime: "14:00",
    endTime: "16:00",
    guests: 15,
    description: "Staff Meeting - Budget Planning Session",
    amenities: ["Wi-Fi", "TV Screen", "AC"],
    status: "approved",
    price: 50,
    controlNumber: "CN1706789123",
    paymentDeadline: "2024-02-18T23:59:59Z",
    createdAt: "2024-01-12T14:30:00Z",
  },
  {
    id: "3",
    userId: "4",
    venueId: "3",
    date: "2024-02-25",
    startTime: "18:00",
    endTime: "21:00",
    guests: 200,
    description: "Tech Corp Annual Product Launch Event",
    amenities: ["Wi-Fi", "Projector", "AC", "Sound System", "Stage", "Lighting"],
    status: "paid",
    price: 300,
    controlNumber: "CN1706789456",
    paymentDeadline: "2024-02-23T23:59:59Z",
    createdAt: "2024-01-15T09:15:00Z",
  },
]

const mockPayments: Payment[] = [
  {
    id: "1",
    bookingId: "2",
    amount: 50,
    controlNumber: "CN1706789123",
    status: "pending",
    deadline: "2024-02-18T23:59:59Z",
  },
  {
    id: "2",
    bookingId: "3",
    amount: 300,
    controlNumber: "CN1706789456",
    status: "confirmed",
    deadline: "2024-02-23T23:59:59Z",
    transactionId: "TXN789456123",
    paidAt: "2024-02-22T10:30:00Z",
  },
]

export const mockBookingService = {
  async getVenues(): Promise<Venue[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockVenues
  },

  async getBookings(): Promise<Booking[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockBookings
  },

  async getPayments(): Promise<Payment[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockPayments
  },

  async searchVenues(criteria: {
    date: string
    startTime: string
    endTime: string
    guests: number
    amenities: string[]
  }): Promise<Venue[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Filter venues based on criteria
    return mockVenues.filter((venue) => {
      // Check capacity
      if (venue.capacity < criteria.guests) return false

      // Check amenities
      const hasRequiredAmenities = criteria.amenities.every((amenity) => venue.amenities.includes(amenity))
      if (!hasRequiredAmenities) return false

      // Check availability (mock logic)
      const conflictingBooking = mockBookings.find(
        (booking) =>
          booking.venueId === venue.id &&
          booking.date === criteria.date &&
          booking.status !== "rejected" &&
          ((criteria.startTime >= booking.startTime && criteria.startTime < booking.endTime) ||
            (criteria.endTime > booking.startTime && criteria.endTime <= booking.endTime) ||
            (criteria.startTime <= booking.startTime && criteria.endTime >= booking.endTime)),
      )

      return !conflictingBooking
    })
  },

  async createBooking(bookingData: any): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newBooking: Booking = {
      id: Date.now().toString(),
      ...bookingData,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    mockBookings.push(newBooking)
    return { success: true, booking: newBooking }
  },

  async updateBookingStatus(
    bookingId: string,
    status: string,
    price?: number,
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const bookingIndex = mockBookings.findIndex((b) => b.id === bookingId)
    if (bookingIndex === -1) {
      return { success: false, error: "Booking not found" }
    }

    mockBookings[bookingIndex].status = status as any

    if (status === "approved" && price) {
      mockBookings[bookingIndex].price = price
      mockBookings[bookingIndex].controlNumber = `CN${Date.now()}`
      mockBookings[bookingIndex].paymentDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      // Create payment record
      const payment: Payment = {
        id: Date.now().toString(),
        bookingId,
        amount: price,
        controlNumber: mockBookings[bookingIndex].controlNumber!,
        status: "pending",
        deadline: mockBookings[bookingIndex].paymentDeadline!,
      }
      mockPayments.push(payment)
    }

    return { success: true }
  },

  async submitPayment(
    bookingId: string,
    paymentData: { transactionId: string; receipt?: string },
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const paymentIndex = mockPayments.findIndex((p) => p.bookingId === bookingId)
    if (paymentIndex === -1) {
      return { success: false, error: "Payment record not found" }
    }

    mockPayments[paymentIndex].status = "confirmed"
    mockPayments[paymentIndex].transactionId = paymentData.transactionId
    mockPayments[paymentIndex].receipt = paymentData.receipt
    mockPayments[paymentIndex].paidAt = new Date().toISOString()

    // Update booking status
    const bookingIndex = mockBookings.findIndex((b) => b.id === bookingId)
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex].status = "paid"
    }

    return { success: true }
  },

  async submitFeedback(
    bookingId: string,
    feedback: { rating: number; comment: string },
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const bookingIndex = mockBookings.findIndex((b) => b.id === bookingId)
    if (bookingIndex === -1) {
      return { success: false, error: "Booking not found" }
    }

    mockBookings[bookingIndex].feedback = {
      ...feedback,
      createdAt: new Date().toISOString(),
    }

    return { success: true }
  },
}
