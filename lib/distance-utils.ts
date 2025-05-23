/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Earth's radius in kilometers
  const earthRadius = 6371

  // Convert latitude and longitude from degrees to radians
  const latRad1 = (lat1 * Math.PI) / 180
  const lonRad1 = (lon1 * Math.PI) / 180
  const latRad2 = (lat2 * Math.PI) / 180
  const lonRad2 = (lon2 * Math.PI) / 180

  // Differences in coordinates
  const dLat = latRad2 - latRad1
  const dLon = lonRad2 - lonRad1

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = earthRadius * c

  // Return distance rounded to 1 decimal place
  return Math.round(distance * 10) / 10
}
