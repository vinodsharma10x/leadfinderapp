"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SearchParams } from "@/lib/types"

// List of medical specialties
const specialties = [
  { value: "cardiologist", label: "Cardiologist" },
  { value: "dermatologist", label: "Dermatologist" },
  { value: "family physician", label: "Family Physician" },
  { value: "gynecologist", label: "Gynecologist" },
  { value: "neurologist", label: "Neurologist" },
  { value: "obstetrician", label: "Obstetrician" },
  { value: "ophthalmologist", label: "Ophthalmologist" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "surgeon", label: "Surgeon" },
  { value: "urologist", label: "Urologist" },
]

interface SearchFormProps {
  onSearch: (params: SearchParams) => Promise<void>
  isLoading: boolean
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [address, setAddress] = useState("")
  const [radius, setRadius] = useState("10")
  const [specialty, setSpecialty] = useState("")
  const [customSpecialty, setCustomSpecialty] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address || !radius || !(specialty || customSpecialty)) {
      return
    }

    await onSearch({
      address,
      radius: Number(radius),
      specialty: isCustom ? customSpecialty : specialty,
    })
  }

  const handleSpecialtyChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true)
      setSpecialty("")
    } else {
      setIsCustom(false)
      setSpecialty(value)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter an address or location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radius">Search Radius (km)</Label>
        <Input
          id="radius"
          type="number"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">Medical Specialty</Label>
        <Select value={isCustom ? "custom" : specialty} onValueChange={handleSpecialtyChange}>
          <SelectTrigger id="specialty">
            <SelectValue placeholder="Select a specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {specialties.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Other (specify)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isCustom && (
        <div className="space-y-2">
          <Label htmlFor="custom-specialty">Specify Specialty</Label>
          <Input
            id="custom-specialty"
            placeholder="Enter specialty"
            value={customSpecialty}
            onChange={(e) => setCustomSpecialty(e.target.value)}
            required={isCustom}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || (!specialty && (!isCustom || !customSpecialty))}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
