"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { MedicalProfessional } from "@/lib/types"
import { useSupabase } from "@/lib/supabase-provider"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  MapPin,
  Phone,
  Save,
  Check,
  AlertCircle,
  Navigation,
  Copy,
  CheckSquare,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

interface ResultsListProps {
  results: MedicalProfessional[]
}

export default function ResultsList({ results }: ResultsListProps) {
  const { supabase, error: supabaseError } = useSupabase()
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSavingSelected, setIsSavingSelected] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (results.length === 0) {
    return null
  }

  if (supabaseError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>{supabaseError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

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

  const handleSave = async (professional: MedicalProfessional) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    const id = `${professional.name}-${professional.address}`.replace(/\s+/g, "")
    setSavingIds((prev) => new Set(prev).add(id))

    try {
      const { error } = await supabase.from("medical_professionals").insert(professional)

      if (error) {
        throw error
      }

      toast({
        title: "Saved successfully",
        description: `${professional.name} has been saved to your database.`,
      })
      setSavedIds((prev) => new Set(prev).add(id))
    } catch (error) {
      console.error("Error saving professional:", error)
      toast({
        title: "Error saving",
        description: "There was an error saving this professional.",
        variant: "destructive",
      })
    } finally {
      setSavingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === results.length) {
      // If all are selected, deselect all
      setSelectedIds(new Set())
    } else {
      // Otherwise, select all
      const allIds = results.map((p) => `${p.name}-${p.address}`.replace(/\s+/g, ""))
      setSelectedIds(new Set(allIds))
    }
  }

  const handleSaveSelected = async () => {
    if (!supabase || selectedIds.size === 0) return

    setIsSavingSelected(true)

    try {
      const selectedProfessionals = results.filter((p) => {
        const id = `${p.name}-${p.address}`.replace(/\s+/g, "")
        return selectedIds.has(id) && !savedIds.has(id)
      })

      if (selectedProfessionals.length === 0) {
        toast({
          title: "No new records to save",
          description: "All selected records have already been saved.",
        })
        setIsSavingSelected(false)
        return
      }

      const { error } = await supabase.from("medical_professionals").insert(selectedProfessionals)

      if (error) {
        throw error
      }

      // Update saved IDs
      const newSavedIds = new Set(savedIds)
      selectedProfessionals.forEach((p) => {
        const id = `${p.name}-${p.address}`.replace(/\s+/g, "")
        newSavedIds.add(id)
      })
      setSavedIds(newSavedIds)

      toast({
        title: "Saved successfully",
        description: `${selectedProfessionals.length} records have been saved to your database.`,
      })
    } catch (error) {
      console.error("Error saving selected professionals:", error)
      toast({
        title: "Error saving",
        description: "There was an error saving the selected records.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSelected(false)
    }
  }

  const handleExportAll = (format: "csv" | "excel") => {
    try {
      if (format === "csv") {
        exportToCSV(results)
      } else {
        exportToExcel(results)
      }

      toast({
        title: "Export successful",
        description: `${results.length} records have been exported to ${format.toUpperCase()}.`,
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

  const handleExportSelected = (format: "csv" | "excel") => {
    try {
      if (selectedIds.size === 0) {
        toast({
          title: "No records selected",
          description: "Please select at least one record to export.",
        })
        return
      }

      const selectedProfessionals = results.filter((p) => {
        const id = `${p.name}-${p.address}`.replace(/\s+/g, "")
        return selectedIds.has(id)
      })

      if (format === "csv") {
        exportToCSV(selectedProfessionals, "selected-medical-professionals.csv")
      } else {
        exportToExcel(selectedProfessionals, "selected-medical-professionals.xlsx")
      }

      toast({
        title: "Export successful",
        description: `${selectedProfessionals.length} selected records have been exported to ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the selected data.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {results.length} medical professionals matching your criteria</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="w-full sm:w-auto">
              <Checkbox checked={selectedIds.size === results.length && results.length > 0} className="mr-2 h-4 w-4" />
              {selectedIds.size === results.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveSelected}
              disabled={selectedIds.size === 0 || isSavingSelected}
              className="w-full sm:w-auto"
            >
              {isSavingSelected ? (
                "Saving..."
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" /> Save Selected ({selectedIds.size})
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export All to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAll("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export All to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSelected("csv")} disabled={selectedIds.size === 0}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Selected to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSelected("excel")} disabled={selectedIds.size === 0}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Selected to Excel
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
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead className="w-[15%]">Name</TableHead>
                <TableHead className="w-[10%]">Specialty</TableHead>
                <TableHead className="w-[15%]">Work Place</TableHead>
                <TableHead className="w-[12%]">Contact</TableHead>
                <TableHead className="w-[20%]">Address</TableHead>
                <TableHead className="w-[10%]">Distance</TableHead>
                <TableHead className="w-[10%]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((professional, index) => {
                const id = `${professional.name}-${professional.address}`.replace(/\s+/g, "")
                const isSaving = savingIds.has(id)
                const isSaved = savedIds.has(id)
                const isSelected = selectedIds.has(id)
                const contactCopyId = `contact-${id}`
                const addressCopyId = `address-${id}`

                return (
                  <TableRow key={index}>
                    <TableCell className="p-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(id)}
                        aria-label={`Select ${professional.name}`}
                        className="h-5 w-5"
                      />
                    </TableCell>
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
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                        <Badge variant="outline" className="font-normal">
                          {professional.distance} km
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        variant={isSaved ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleSave(professional)}
                        disabled={isSaving || isSaved || !supabase}
                        className="w-full"
                      >
                        {isSaved ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Saved
                          </>
                        ) : isSaving ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" /> Save
                          </>
                        )}
                      </Button>
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
