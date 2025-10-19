"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email?: string
  isGuest: boolean
  createdAt: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (userData: Omit<User, "id" | "createdAt">) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USER_STORAGE_KEY = "lifelens-user"

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Failed to load user data", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    
    setUser(newUser)
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}