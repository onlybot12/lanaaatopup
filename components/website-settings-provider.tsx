"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { WebsiteSettings } from "@/lib/models"

interface WebsiteSettingsContextType {
  settings: WebsiteSettings | null
  loading: boolean
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>({
  settings: null,
  loading: true,
})

export function useWebsiteSettings() {
  return useContext(WebsiteSettingsContext)
}

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Error fetching website settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return <WebsiteSettingsContext.Provider value={{ settings, loading }}>{children}</WebsiteSettingsContext.Provider>
}

