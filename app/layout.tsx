import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseProvider } from "@/lib/supabase-provider"
import GoogleMapsScript from "@/components/google-maps-script"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Medical Professional Finder",
  description: "Search for medical professionals near you",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            {children}
          </SupabaseProvider>
        </ThemeProvider>
        <GoogleMapsScript />
      </body>
    </html>
  )
}
