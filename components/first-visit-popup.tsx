"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function FirstVisitPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const hasVisited = getCookie("hasVisitedBefore")
    const neverShow = getCookie("neverShowPopup")

    if (!hasVisited && !neverShow) {
      setIsOpen(true)
      setCookie("hasVisitedBefore", "true", 365)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)

    if (dontShowAgain) {
      setCookie("neverShowPopup", "true", 365)
    }
  }

  function setCookie(name: string, value: string, days: number) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = "; expires=" + date.toUTCString()
    document.cookie = name + "=" + value + expires + "; path=/"
  }

  function getCookie(name: string) {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl">Selamat Datang di Zkygame!</DialogTitle>
          <DialogDescription>
            Platform top up game terpercaya dengan harga termurah dan proses instan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            Zkygame menyediakan layanan top up untuk berbagai game populer dengan proses yang cepat dan aman. Nikmati
            kemudahan bertransaksi dan harga yang kompetitif!
          </p>

          <div className="bg-secondary/30 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Keuntungan Menggunakan Zkygame:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Proses instan dan otomatis</li>
              <li>Harga termurah</li>
              <li>Layanan pelanggan 24/7</li>
              <li>Metode pembayaran lengkap</li>
              <li>Transaksi aman dan terpercaya</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <Label htmlFor="dont-show">Jangan tampilkan lagi</Label>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Tutup
          </Button>
          <Button onClick={handleClose}>Mulai Jelajahi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

