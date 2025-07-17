"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        {/* Mobile sidebar trigger */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px] md:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg text-primary">Lana store</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-[240px] h-full">
          <Sidebar />
        </div>

        {/* Logo */}
        <Link href="/" className="ml-4 md:ml-0 flex-1 md:flex-none">
          <span className="font-bold text-lg text-primary">Lana store</span>
        </Link>

        {/* Search */}
        <div className="flex-1 flex items-center justify-end">
          <div className="w-full max-w-[400px] hidden md:block">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search games..."
                className="w-full bg-muted pl-8 pr-4 text-sm focus:ring-0 focus:ring-offset-0"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="md:hidden absolute top-20 left-0 right-0 bg-background border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container py-2">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search games..."
                  className="w-full bg-muted pl-8 pr-4 text-sm focus:ring-0 focus:ring-offset-0"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

