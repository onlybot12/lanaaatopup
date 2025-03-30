"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen sudah di-mount sebelum mengakses localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      const adminAuth = localStorage.getItem("adminAuth")
      if (!adminAuth) {
        router.push("/admin/login")
      } else {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Authentication error:", error)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }, [router, mounted])

  if (!mounted || isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Mengalihkan ke halaman login...</div>
  }

  return <>{children}</>
}

