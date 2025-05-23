import type { MedicalProfessional } from "./types"

/**
 * Converts an array of medical professionals to CSV format
 * @param data Array of medical professionals
 * @returns CSV string
 */
export function convertToCSV(data: MedicalProfessional[]): string {
  if (data.length === 0) return ""

  // Define the headers
  const headers = ["Name", "Specialty", "Workplace", "Phone", "Address", "Distance (km)", "Latitude", "Longitude"]

  // Create CSV header row
  let csvContent = headers.join(",") + "\n"

  // Add data rows
  data.forEach((professional) => {
    const row = [
      escapeCsvValue(professional.name),
      escapeCsvValue(professional.specialty),
      escapeCsvValue(professional.workplace),
      escapeCsvValue(professional.phone),
      escapeCsvValue(professional.address),
      professional.distance !== undefined ? professional.distance.toString() : "",
      professional.latitude.toString(),
      professional.longitude.toString(),
    ]
    csvContent += row.join(",") + "\n"
  })

  return csvContent
}

/**
 * Escapes a value for CSV format
 * @param value String value to escape
 * @returns Escaped string
 */
function escapeCsvValue(value: string): string {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
    // Replace any double quotes with two double quotes
    value = value.replace(/"/g, '""')
    // Wrap the value in double quotes
    return `"${value}"`
  }
  return value || ""
}

/**
 * Exports data to a CSV file
 * @param data Array of medical professionals
 * @param filename Filename for the downloaded file
 */
export function exportToCSV(data: MedicalProfessional[], filename = "medical-professionals.csv"): void {
  const csvContent = convertToCSV(data)

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const link = document.createElement("a")

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Append the link to the document
  document.body.appendChild(link)

  // Click the link to trigger the download
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports data to an Excel file (XLSX format)
 * Note: This is a simplified version that actually creates a CSV that Excel can open
 * For true XLSX format, you would need a library like xlsx or exceljs
 * @param data Array of medical professionals
 * @param filename Filename for the downloaded file
 */
export function exportToExcel(data: MedicalProfessional[], filename = "medical-professionals.xlsx"): void {
  // For simplicity, we're just changing the extension
  // In a production app, you might want to use a library to create actual XLSX files
  exportToCSV(data, filename)
}
