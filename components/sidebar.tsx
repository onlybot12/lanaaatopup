"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Receipt, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  onClose?: () => void
  className?: string
}

interface Type {
  _id?: string
  id: string
  name: string
  icon: string
  count: number
}

interface Category {
  _id?: string
  id: string
  name: string
  typeId: string
  count: number
}

function SidebarItem({
  item,
  subItems = [],
}: {
  item: { icon: React.ElementType; label: string; href: string }
  subItems?: { label: string; href: string }[]
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname === item.href
  const hasSubItems = subItems && subItems.length > 0

  return (
    <div className="mb-1">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start text-sm", hasSubItems && "justify-between")}
        onClick={() => hasSubItems && setIsOpen(!isOpen)}
        asChild={!hasSubItems}
      >
        {hasSubItems ? (
          <div className="flex items-center w-full">
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
            <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        ) : (
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )}
      </Button>

      <AnimatePresence initial={false}>
        {isOpen && hasSubItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="overflow-hidden"
          >
            <div className="pl-6 mt-1 space-y-1">
              {subItems.map((subItem) => (
                <Button
                  key={subItem.href}
                  variant={pathname === subItem.href ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs"
                  asChild
                >
                  <Link href={subItem.href}>
                    <ChevronRight className="mr-2 h-3 w-3" />
                    <span>{subItem.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const [types, setTypes] = useState<Type[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Tambahkan timestamp untuk menghindari cache
        const timestamp = new Date().getTime()
        const [typesResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/types?t=${timestamp}`),
          fetch(`/api/categories?t=${timestamp}`),
        ])

        if (typesResponse.ok && categoriesResponse.ok) {
          const typesData = await typesResponse.json()
          const categoriesData = await categoriesResponse.json()

          setTypes(typesData)
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Buat item sidebar statis
  const staticItems = [
    { icon: Home, label: "Beranda", href: "/" },
    { icon: Receipt, label: "Cek Transaksi", href: "/invoice" }, // Diubah dari /cek-transaksi ke /invoice
  ]

  // Buat item sidebar dinamis dari types dan categories
  const dynamicItems = types.map((type) => {
    const typeCategories = categories.filter((cat) => cat.typeId === type.id)

    // Tentukan icon berdasarkan type.icon
    const IconComponent = getIconComponent(type.icon)

    return {
      icon: IconComponent,
      label: type.name,
      href: `/kategori/${type.id}`,
      subItems: typeCategories.map((cat) => ({
        label: cat.name,
        href: `/beli/${cat.id}`,
      })),
    }
  })

  // Gabungkan item statis dan dinamis
  const sidebarItems = [...staticItems, ...dynamicItems]

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-sm font-semibold">Menu</h2>
            <div className="space-y-1">
              {loading
                ? // Tampilkan skeleton loader saat loading
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="h-9 w-full animate-pulse rounded-md bg-secondary/50 mb-1"></div>
                    ))
                : // Tampilkan item sidebar
                  sidebarItems.map((item, index) => <SidebarItem key={index} item={item} subItems={item.subItems} />)}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// Fungsi untuk mendapatkan komponen icon berdasarkan nama
function getIconComponent(iconName: string): React.ElementType {
  // Import dinamis tidak bisa dilakukan di sini, jadi kita gunakan pendekatan switch
  switch (iconName) {
    case "Gamepad2":
      return function GamepadIcon(props: React.SVGProps<SVGSVGElement>) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
          >
            <line x1="6" x2="10" y1="12" y2="12" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="15" x2="15.01" y1="13" y2="13" />
            <line x1="18" x2="18.01" y1="11" y2="11" />
            <rect width="20" height="12" x="2" y="6" rx="2" />
          </svg>
        )
      }
    case "Smartphone":
      return function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
          >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        )
      }
    case "Zap":
      return function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        )
      }
    default:
      return Home
  }
}

