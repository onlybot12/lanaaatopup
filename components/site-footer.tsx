"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useWebsiteSettings } from "@/components/website-settings-provider"
import { useState, useEffect } from "react"

export function SiteFooter() {
  const { settings, loading } = useWebsiteSettings()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/categories?t=${timestamp}`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return null
  }

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{settings?.siteName || "Zkygame"}</h3>
            <p className="text-sm text-muted-foreground">
              {settings?.description || "Website topup murah cepat dan terpecaya di Indonesia 100% Legal."}
            </p>
            <div className="flex space-x-2">
              {settings?.social?.facebook && (
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href={settings.social.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Facebook</span>
                  </Link>
                </Button>
              )}
              {settings?.social?.instagram && (
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href={settings.social.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                </Button>
              )}
              {settings?.social?.twitter && (
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href={settings.social.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
              )}
              {settings?.social?.youtube && (
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href={settings.social.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                    <span className="sr-only">YouTube</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Kategori</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link href={`/beli/${category.id}`} className="hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Informasi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tentang-kami" className="hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/cara-topup" className="hover:text-primary transition-colors">
                  Cara Top Up
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>
                  {settings?.contact?.address || "Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta, Indonesia"}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>{settings?.contact?.phone || "+62 812 3456 7890"}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span>{settings?.contact?.email || "info@zkygame.com"}</span>
              </li>
            </ul>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Berlangganan Newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="rounded-l-none">Kirim</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {settings?.footer?.text || "© 2023 Zkygame. All rights reserved."}
          </p>

          {settings?.footer?.showPaymentIcons && (
            <div className="flex flex-wrap justify-center gap-4">
              <img src="/placeholder.svg?height=30&width=50" alt="BCA" className="h-6" />
              <img src="/placeholder.svg?height=30&width=50" alt="Mandiri" className="h-6" />
              <img src="/placeholder.svg?height=30&width=50" alt="BNI" className="h-6" />
              <img src="/placeholder.svg?height=30&width=50" alt="DANA" className="h-6" />
              <img src="/placeholder.svg?height=30&width=50" alt="OVO" className="h-6" />
              <img src="/placeholder.svg?height=30&width=50" alt="GoPay" className="h-6" />
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

