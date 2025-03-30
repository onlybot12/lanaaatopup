"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Package,
  Settings,
  FileText,
  Image,
  LogOut,
  ChevronLeft,
  Globe,
  CreditCard,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Produk", href: "/admin/products" },
  { icon: FileText, label: "Transaksi", href: "/admin/transactions" },
  { icon: Image, label: "Slide", href: "/admin/slides" },
  { icon: CreditCard, label: "Pembayaran", href: "/admin/payments" },
  { icon: Globe, label: "Website", href: "/admin/website" },
  { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest(".admin-sidebar") && isMobile) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, isMobile])

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, isMobile])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    window.location.href = "/admin/login"
  }

  return (
    <>
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
          )}
        </AnimatePresence>
      )}

      <motion.div
        className={cn(
          "admin-sidebar fixed top-0 bottom-0 left-0 z-50 w-64 bg-secondary border-r border-border flex flex-col h-full",
          "lg:relative lg:z-0",
        )}
        initial={false}
        animate={{
          width: isOpen ? 256 : 80,
          x: isOpen || !isMobile ? 0 : -320,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1.0],
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg text-primary"
              >
                Zkygame Admin
              </motion.span>
            )}
          </AnimatePresence>
          <Button variant="ghost" size="icon" className={isOpen ? "ml-auto" : "mx-auto"} onClick={onClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${!isOpen ? "px-2" : ""}`}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={`h-4 w-4 ${isOpen ? "mr-2" : ""}`} />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive hover:text-destructive ${!isOpen ? "px-2" : ""}`}
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${isOpen ? "mr-2" : ""}`} />
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.div>
    </>
  )
}

