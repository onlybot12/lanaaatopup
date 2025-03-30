"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

interface NavItemProps {
  href: string
  children: React.ReactNode
}

export function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className="relative px-3 py-2">
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 w-full bg-primary"
          layoutId="navbar-underline"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}

