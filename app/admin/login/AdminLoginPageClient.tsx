"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle } from "lucide-react"

export default function AdminLoginPageClient() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen sudah di-mount sebelum mengakses localStorage
  useEffect(() => {
    setMounted(true)

    // Cek apakah sudah login
    if (typeof window !== "undefined") {
      const adminAuth = localStorage.getItem("adminAuth")
      if (adminAuth) {
        router.push("/admin/dashboard")
      }
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (username === "admin" && password === "admin123") {
      setTimeout(() => {
        localStorage.setItem("adminAuth", "true")
        router.push("/admin/dashboard")
      }, 1000)
    } else {
      setError("Username atau password salah")
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null // Tidak menampilkan apa-apa sampai komponen di-mount
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background">
      <ParticlesBackground />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Masuk ke dashboard admin Zkygame</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button className="w-full mt-6" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center w-full text-muted-foreground flex items-center justify-center">
            <Lock className="h-3 w-3 mr-1" /> Hanya untuk admin Zkygame
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

