"use client"

import { useState } from "react"
import { Bell, User, Moon, Sun, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminHeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AdminHeader({ onToggleSidebar, isSidebarOpen }: AdminHeaderProps) {
  const [notifications] = useState(3)
  const { setTheme, theme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    window.location.href = "/admin/login"
  }

  return (
    <header className="border-b border-border bg-background p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-2 transition-transform duration-300"
        >
          <PanelRight className={`h-5 w-5 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
        </Button>

        <h1 className="text-xl font-bold hidden md:block">Dashboard Admin</h1>
        <div className="relative ml-4 md:ml-8 hidden md:block">
          <Input type="search" placeholder="Cari..." className="w-[200px] lg:w-[300px] pl-4 h-9 bg-secondary/50" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Pesanan baru #12345</span>
                <span className="text-xs text-muted-foreground">2 menit yang lalu</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Pembayaran berhasil #54321</span>
                <span className="text-xs text-muted-foreground">10 menit yang lalu</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Stok produk hampir habis</span>
                <span className="text-xs text-muted-foreground">30 menit yang lalu</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium text-primary">
              Lihat Semua Notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2">
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2">
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive py-2" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

