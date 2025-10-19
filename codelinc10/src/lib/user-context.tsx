"use client"

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { isBrowser } from "./window"

interface AppUser {
  name: string
  isGuest?: boolean
  createdAt: string
}

interface UserContextValue {
  user: AppUser | null
  isLoading: boolean
  login: (input: Pick<AppUser, "name"> & Partial<Omit<AppUser, "name">>) => void
  logout: () => void
  setUser: Dispatch<SetStateAction<AppUser | null>>
}

const STORAGE_KEY = "lifelens-user-session"

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => isBrowser())

  useEffect(() => {
    if (!isBrowser()) {
      setIsLoading(false)
      return
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AppUser
        setUser(parsed)
      }
    } catch (error) {
      console.warn("Failed to restore LifeLens user", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login: UserContextValue["login"] = (input) => {
    const nextUser: AppUser = {
      name: input.name,
      isGuest: input.isGuest ?? false,
      createdAt: input.createdAt ?? new Date().toISOString(),
    }
    setUser(nextUser)
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      } catch (error) {
        console.warn("Failed to persist LifeLens user", error)
      }
    }
  }

  const logout = () => {
    setUser(null)
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.warn("Failed to clear LifeLens user", error)
      }
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      setUser,
    }),
    [user, isLoading]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
