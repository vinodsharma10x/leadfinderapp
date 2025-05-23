"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MapPin, Phone, Navigation, Copy, Check } from "lucide-react"
import type { MedicalProfessional } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface ExcludedResultsProps {
  results: MedicalProfessional[]
}

export default function ExcludedResults({ results }: ExcludedResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (results.length === 0) {
    return null
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

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Excluded Results</CardTitle>
            <CardDescription>{results.length} results were excluded based on your filter settings</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
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
                {results.map((professional, index) => {
                  const id = `excluded-${professional.name}-${professional.address}`.replace(/\s+/g, "")
                  const contactCopyId = `contact-${id}`
                  const addressCopyId = `address-${id}`

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium p-2 break-words" title={professional.name}>
                        {professional.name || "N/A"}
                      </TableCell>
                      <TableCell className="p-2 break-words" title={professional.specialty}>
                        {professional.specialty}
                      </TableCell>
                      <TableCell className="p-2 break-words" title={professional.workplace}>
                        {professional.workplace || "N/A"}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span className="break-words" title={professional.phone}>
                            {professional.phone || "N/A"}
                          </span>
                          {professional.phone && (
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
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="break-words" title={professional.address}>
                            {professional.address || "N/A"}
                          </span>
                          {professional.address && (
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
                          )}
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
      )}
    </Card>
  )
}
