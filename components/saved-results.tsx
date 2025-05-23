"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MedicalProfessional } from "@/lib/types"
import { MapPin, Phone, Navigation, Copy, Check, Download, FileSpreadsheet } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

export default function SavedResults() {
  const { supabase, isLoading: isSupabaseLoading, error: supabaseError } = useSupabase()
  const [savedProfessionals, setSavedProfessionals] = useState<MedicalProfessional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSavedResults() {
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from("medical_professionals")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        setSavedProfessionals(data || [])
      } catch (err) {
        console.error("Error fetching saved results:", err)
        setError("Failed to load saved professionals. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (supabase) {
      fetchSavedResults()
    }
  }, [supabase])

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000) // Reset after 2 seconds
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy text: ", error)
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleExport = (format: "csv" | "excel") => {
    try {
      if (savedProfessionals.length === 0) {
        toast({
          title: "No records to export",
          description: "There are no saved professionals to export.",
        })
        return
      }

      if (format === "csv") {
        exportToCSV(savedProfessionals, "saved-medical-professionals.csv")
      } else {
        exportToExcel(savedProfessionals, "saved-medical-professionals.xlsx")
      }

      toast({
        title: "Export successful",
        description: `${savedProfessionals.length} records have been exported to ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      })
    }
  }

  if (isSupabaseLoading || (isLoading && !error)) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Saved Professionals</CardTitle>
          <CardDescription>Loading saved results...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (supabaseError || error) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Saved Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{supabaseError || error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (savedProfessionals.length === 0) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Saved Professionals</CardTitle>
          <CardDescription>You haven't saved any medical professionals yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Saved Professionals</CardTitle>
            <CardDescription>You have saved {savedProfessionals.length} medical professionals</CardDescription>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export to Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%]">Name</TableHead>
                <TableHead className="w-[10%]">Specialty</TableHead>
                <TableHead className="w-[15%]">Work Place</TableHead>
                <TableHead className="w-[15%]">Contact</TableHead>
                <TableHead className="w-[25%]">Address</TableHead>
                <TableHead className="w-[10%]">Distance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedProfessionals.map((professional) => {
                const id = `saved-${professional.id}`
                const contactCopyId = `contact-${id}`
                const addressCopyId = `address-${id}`

                return (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium p-2 break-words" title={professional.name}>
                      {professional.name}
                    </TableCell>
                    <TableCell className="p-2 break-words" title={professional.specialty}>
                      {professional.specialty}
                    </TableCell>
                    <TableCell className="p-2 break-words" title={professional.workplace}>
                      {professional.workplace}
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span className="break-words" title={professional.phone}>
                          {professional.phone}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full flex-shrink-0"
                          onClick={() => handleCopy(professional.phone, contactCopyId)}
                          aria-label="Copy phone number"
                        >
                          {copiedField === contactCopyId ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="break-words" title={professional.address}>
                          {professional.address}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full flex-shrink-0"
                          onClick={() => handleCopy(professional.address, addressCopyId)}
                          aria-label="Copy address"
                        >
                          {copiedField === addressCopyId ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      {professional.distance !== undefined && (
                        <div className="flex items-center gap-1">
                          <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                          <Badge variant="outline" className="font-normal">
                            {professional.distance} km
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
