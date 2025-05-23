"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MedicalProfessional } from "@/lib/types"

interface ResultsMapProps {
  results: MedicalProfessional[]
  center?: { lat: number; lng: number }
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function ResultsMap({ results, center }: ResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Skip if no results or if Google Maps is not loaded
    if (results.length === 0 || !window.google) return

    // Initialize map if not already initialized
    if (!mapInstanceRef.current && mapRef.current) {
      const mapCenter = center || {
        lat: results[0].latitude,
        lng: results[0].longitude,
      }

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        mapTypeControl: false,
      })
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add markers for each result
    results.forEach((professional, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: professional.latitude, lng: professional.longitude },
        map: mapInstanceRef.current,
        title: professional.name,
        label: `${index + 1}`,
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 200px;">
            <h3 style="margin: 0 0 5px; font-size: 16px;">${professional.name}</h3>
            <p style="margin: 0 0 5px; font-size: 14px;">${professional.specialty}</p>
            <p style="margin: 0 0 5px; font-size: 12px;">${professional.address}</p>
            <p style="margin: 0; font-size: 12px;">${professional.phone}</p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition())
      })
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [results, center])

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Map View</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-[400px] rounded-md" style={{ background: "#f0f0f0" }}>
          {!window.google && (
            <div className="flex items-center justify-center h-full">
              <p>Loading map...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
