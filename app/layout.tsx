import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { WebsiteSettingsProvider } from "@/components/website-settings-provider"
import { AlertProvider } from "@/components/custom-alert"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: {
    default: "Zkygame - Game Top Up Store",
    template: `%s | Zkygame`,
  },
  description: "Website topup murah cepat dan terpecaya di Indonesia 100% Legal.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WebsiteSettingsProvider>
            <AlertProvider>
              <LoadingScreen />
              {children}
            </AlertProvider>
          </WebsiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'