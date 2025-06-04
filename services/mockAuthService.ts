import type { User } from "@/contexts/AuthContext"

// Mock user database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@venue.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "student@university.edu",
    name: "John Student",
    role: "student",
    studentId: "STU001",
    department: "Computer Science",
  },
  {
    id: "3",
    email: "staff@university.edu",
    name: "Jane Staff",
    role: "staff",
    department: "Administration",
  },
  {
    id: "4",
    email: "external@company.com",
    name: "Bob External",
    role: "external",
    organization: "Tech Corp",
  },
]

export const mockAuthService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Accept "password123" for all demo users
    if (password === "password123") {
      return { success: true, user }
    }

    return { success: false, error: "Invalid password" }
  },

  async register(userData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      organization: userData.organization,
      studentId: userData.studentId,
      department: userData.department,
    }

    mockUsers.push(newUser)
    return { success: true, user: newUser }
  },

  async updateProfile(
    userId: string,
    userData: Partial<User>,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userIndex = mockUsers.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return { success: false, error: "User not found" }
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData }
    return { success: true, user: mockUsers[userIndex] }
  },

  async getAllUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockUsers.filter((u) => u.role !== "admin")
  },
}
