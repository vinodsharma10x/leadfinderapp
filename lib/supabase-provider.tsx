"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

type SupabaseContext = {
  supabase: SupabaseClient | null
  isLoading: boolean
  error: string | null
}

const SupabaseContext = createContext<SupabaseContext>({
  supabase: null,
  isLoading: true,
  error: null,
})

export const useSupabase = () => useContext(SupabaseContext)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSupabase = () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase URL or Anon Key is missing. Please check your environment variables.")
        }

        const client = createClient(supabaseUrl, supabaseAnonKey)
        setSupabase(client)
        setError(null)
      } catch (err) {
        console.error("Error initializing Supabase client:", err)
        setError("Failed to initialize database connection. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  return <SupabaseContext.Provider value={{ supabase, isLoading, error }}>{children}</SupabaseContext.Provider>
}
