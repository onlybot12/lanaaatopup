"use client"

import { useState, useEffect } from "react"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WelcomeBoxProps {
  className?: string
}

export function WelcomeBox({ className = "" }: WelcomeBoxProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const welcomeBoxHidden = localStorage.getItem("welcomeBoxHidden")
    if (welcomeBoxHidden === "true") {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("welcomeBoxHidden", "true")
  }

  if (!isVisible) return null

  return (
    <div className={`relative p-6 rounded-lg bg-secondary overflow-hidden ${className}`}>
      <ParticlesBackground />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-white">Selamat Datang di Zkygame</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-white/80 mb-4">
          Platform top up game terpercaya dengan harga termurah dan proses instan. Nikmati pengalaman bermain game tanpa
          gangguan!
        </p>
        <Button className="bg-primary hover:bg-primary/90">Mulai Top Up</Button>
      </div>
    </div>
  )
}

