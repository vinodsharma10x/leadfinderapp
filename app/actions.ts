"use server"

import type { SearchParams, MedicalProfessional, GeoLocation } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"

// This would be your Google Maps API key - server-side only
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Create a server-side Supabase client
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Please check your environment variables.")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function searchMedicalProfessionals(params: SearchParams): Promise<MedicalProfessional[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key is not configured")
    }

    // First, geocode the address to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${GOOGLE_MAPS_API_KEY}`
    const geocodeResponse = await fetch(geocodeUrl)
    const geocodeData = await geocodeResponse.json()
    if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
      throw new Error("Failed to geocode address")
    }

    // Store the user's location
    const userLocation: GeoLocation = geocodeData.results[0].geometry.location

    // Convert radius from miles to meters (1 mile = 1609.34 meters)
    // Note: Google Places API uses meters for radius
    const radiusInMeters = params.radius * 1609.34

    // Now search for medical professionals near this location
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.lat},${userLocation.lng}&radius=${radiusInMeters}&type=doctor&keyword=${encodeURIComponent(params.specialty)}&key=${GOOGLE_MAPS_API_KEY}`
    const placesResponse = await fetch(placesUrl)
    const placesData = await placesResponse.json()

    if (placesData.status !== "OK") {
      throw new Error(`Places API error: ${placesData.status}`)
    }

    // Process and format the results
    const professionals: MedicalProfessional[] = await Promise.all(
      placesData.results.map(async (place: any) => {
        // Get additional details for each place
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,geometry&key=${GOOGLE_MAPS_API_KEY}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status !== "OK") {
          return null
        }

        const details = detailsData.result
        const latitude = details.geometry?.location.lat || place.geometry.location.lat
        const longitude = details.geometry?.location.lng || place.geometry.location.lng

        // Calculate distance from user's location in kilometers
        // const distance = calculateDistance(userLocation.lat, userLocation.lng, latitude, longitude)
        let distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${`${userLocation.lat},${userLocation.lng}`}&destinations=${`${latitude},${longitude}`}&key=${GOOGLE_MAPS_API_KEY}`

        const distanceResponse = await (await fetch(distanceUrl)).json();
        const distance = findSmallestDistance(distanceResponse);

        return {
          name: details.name || place.name,
          address: details.formatted_address || place.vicinity,
          workplace: place.name,
          phone: details.formatted_phone_number || "Not available",
          specialty: params.specialty,
          latitude,
          longitude,
          distance: Number(distance.distance / 1000), // Distance in kilometers
        }
      }),
    )

    // console.log(professionals)

    // Filter out null values and sort by distance
    const validProfessionals = professionals.filter(Boolean) as MedicalProfessional[]
    return validProfessionals.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  } catch (error) {
    console.error("Error searching for medical professionals:", error)
    throw error
  }
}

export async function saveProfessional(professional: MedicalProfessional) {
  try {
    const supabase = getServerSupabaseClient()
    const { data, error } = await supabase.from("medical_professionals").insert(professional).select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error saving professional:", error)
    return { success: false, error: (error as Error).message }
  }
}


function findSmallestDistance(response: any) {
    let minDistance = Infinity;
    let minOrigin = -1;
    let minDestination = -1;

    // Loop through each origin
    for (let i = 0; i < response.rows.length; i++) {
        // Loop through each destination for this origin
        for (let j = 0; j < response.rows[i].elements.length; j++) {
            const element = response.rows[i].elements[j];
            // Check if the element has a valid distance and status is OK
            if (element.status === "OK" && element.distance.value < minDistance) {
                minDistance = element.distance.value;
                minOrigin = i;
                minDestination = j;
            }
        }
    }

    return {
        distance: minDistance,
        originIndex: minOrigin,
        destinationIndex: minDestination
    };
}
