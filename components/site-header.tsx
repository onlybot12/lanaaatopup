"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function SiteHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/" className="ml-4 md:ml-0">
          <span className="font-bold text-lg">Zkygame</span>
        </Link>

        <div className="flex-1 flex items-center justify-end md:justify-center">
          <div className="w-full max-w-[600px] hidden md:block">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="search" placeholder="Search games..." className="w-full bg-muted pl-9 pr-4 text-sm" />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-8 w-8" />
          </Button>
        </div>

        <Button variant="default" size="sm" className="hidden md:flex text-sm ml-4">
          Masuk
        </Button>
      </div>
      {isSearchOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-t">
          <div className="container py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type="search" placeholder="Search games..." className="w-full bg-muted pl-9 pr-4 text-sm" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

