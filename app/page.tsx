"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchForm from "@/components/search-form"
import ResultsList from "@/components/results-list"
import ResultsMap from "@/components/results-map"
import SavedResults from "@/components/saved-results"
import ExcludedResults from "@/components/excluded-results"
import FilterSettings from "@/components/filter-settings"
import type { MedicalProfessional, SearchParams, FilterConfig } from "@/lib/types"
import { searchMedicalProfessionals } from "./actions"
import { filterResults } from "@/lib/filter-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Filter, Search, MapIcon } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const { error: supabaseError } = useSupabase()
  const [results, setResults] = useState<MedicalProfessional[]>([])
  const [filteredResults, setFilteredResults] = useState<{
    included: MedicalProfessional[]
    excluded: MedicalProfessional[]
  }>({ included: [], excluded: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined)
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    excludeEmptyFields: true,
    excludedKeywords: ["cloudnine", "apollo"],
  })
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const [quickSearchTerm, setQuickSearchTerm] = useState("")
  const [showMap, setShowMap] = useState(true)

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const professionals = await searchMedicalProfessionals(params)
      setResults(professionals)

      // Apply filters
      const filtered = filterResults(professionals, filterConfig)
      setFilteredResults(filtered)

      // If we have results, set the map center to the first result
      if (filtered.included.length > 0) {
        setMapCenter({
          lat: filtered.included[0].latitude,
          lng: filtered.included[0].longitude,
        })
      } else if (professionals.length > 0) {
        setMapCenter({
          lat: professionals[0].latitude,
          lng: professionals[0].longitude,
        })
      }

      // Collapse options panel after successful search
      setIsOptionsExpanded(false)
    } catch (err) {
      console.error("Error searching:", err)
      setError("An error occurred while searching. Please try again.")
      setResults([])
      setFilteredResults({ included: [], excluded: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilterConfig = (newConfig: FilterConfig) => {
    setFilterConfig(newConfig)
    // Re-apply filters when config changes
    if (results.length > 0) {
      setFilteredResults(filterResults(results, newConfig))
    }
  }

  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setQuickSearchTerm(term)

    if (results.length > 0) {
      if (!term) {
        // If search term is empty, just apply the regular filters
        setFilteredResults(filterResults(results, filterConfig))
      } else {
        // Filter results based on the search term and regular filters
        const regularFiltered = filterResults(results, filterConfig)

        const quickFiltered = {
          included: regularFiltered.included.filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.specialty.toLowerCase().includes(term) ||
              p.workplace.toLowerCase().includes(term) ||
              p.address.toLowerCase().includes(term),
          ),
          excluded: regularFiltered.excluded,
        }

        setFilteredResults(quickFiltered)
      }
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-[1400px]">
      <h1 className="text-3xl font-bold mb-6 text-center">Medical Professional Finder</h1>

      {supabaseError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{supabaseError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="saved">Saved Results</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Options
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)} className="whitespace-nowrap">
              <MapIcon className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>

          {/* Combined Search and Filter Panel */}
          {isOptionsExpanded && (
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Search Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Search Options</h3>
                  <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {/* Filter Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Filter Settings</h3>

                  {/* Quick search moved here, above filter settings */}
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Quick filter results..."
                      className="pl-8"
                      value={quickSearchTerm}
                      onChange={handleQuickSearch}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Filter displayed results by name, specialty, workplace, or address
                    </p>
                  </div>

                  <FilterSettings config={filterConfig} onConfigChange={updateFilterConfig} />
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - Full Width */}
          <div className="w-full">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {!isLoading && results.length === 0 && !error && (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">
                  Use the Filter Options button to search for medical professionals.
                </p>
              </div>
            )}

            {!isLoading && filteredResults.included.length > 0 && (
              <>
                <ResultsList results={filteredResults.included} />
                {showMap && <ResultsMap results={filteredResults.included} center={mapCenter} />}
              </>
            )}

            {!isLoading && filteredResults.excluded.length > 0 && (
              <ExcludedResults results={filteredResults.excluded} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <SavedResults />
        </TabsContent>
      </Tabs>
    </main>
  )
}
