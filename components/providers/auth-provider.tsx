"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { PersonelRol } from "@prisma/client"

interface User {
  id: string
  visibleId: string
  ad: string
  soyad: string
  rol: PersonelRol
  fotograf: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useUser must be used within an AuthProvider")
  }
  return context
}
