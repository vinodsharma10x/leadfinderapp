export interface MedicalProfessional {
  id?: string
  name: string
  address: string
  workplace: string
  phone: string
  latitude: number
  longitude: number
  specialty: string
  distance?: number // Distance from user's location in miles
  created_at?: string
}

export interface SearchParams {
  address: string
  radius: number
  specialty: string
}

export interface FilterConfig {
  excludeEmptyFields: boolean
  excludedKeywords: string[]
}

export interface FilteredResults {
  included: MedicalProfessional[]
  excluded: MedicalProfessional[]
}

export interface GeoLocation {
  lat: number
  lng: number
}
