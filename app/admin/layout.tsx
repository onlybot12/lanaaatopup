"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { LoadingScreen } from "@/components/loading-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen sudah di-mount sebelum mengakses localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = () => {
      try {
        const adminAuth = localStorage.getItem("adminAuth")
        if (!adminAuth && pathname !== "/admin/login") {
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
    }

    checkAuth()

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [pathname, router, mounted])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Tampilkan loading screen saat komponen belum di-mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingScreen />
      </div>
    )
  }

  // Tampilkan loading screen saat sedang memeriksa autentikasi
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingScreen />
      </div>
    )
  }

  // Tampilkan halaman login tanpa layout admin
  if (pathname === "/admin/login") {
    return (
      <div className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </div>
    )
  }

  // Tampilkan pesan redirect jika belum terautentikasi
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Mengalihkan ke halaman login...</p>
      </div>
    )
  }

  // Tampilkan layout admin jika sudah terautentikasi
  return (
    <div className="bg-background text-foreground">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <AdminHeader onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </div>
  )
}

