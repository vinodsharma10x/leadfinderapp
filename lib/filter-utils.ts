import type { MedicalProfessional, FilterConfig, FilteredResults } from "./types"

export function filterResults(results: MedicalProfessional[], config: FilterConfig): FilteredResults {
  const included: MedicalProfessional[] = []
  const excluded: MedicalProfessional[] = []

  results.forEach((professional) => {
    let shouldExclude = false

    // Check for empty fields
    if (config.excludeEmptyFields) {
      if (!professional.name || !professional.address || !professional.workplace || !professional.phone) {
        shouldExclude = true
      }
    }

    // Check for excluded keywords in name, address, and workplace
    if (!shouldExclude && config.excludedKeywords.length > 0) {
      const nameLower = professional.name.toLowerCase()
      const addressLower = professional.address.toLowerCase()
      const workplaceLower = professional.workplace.toLowerCase()

      for (const keyword of config.excludedKeywords) {
        const keywordLower = keyword.toLowerCase()
        if (
          nameLower.includes(keywordLower) ||
          addressLower.includes(keywordLower) ||
          workplaceLower.includes(keywordLower)
        ) {
          shouldExclude = true
          break
        }
      }
    }

    // Add to appropriate array
    if (shouldExclude) {
      excluded.push(professional)
    } else {
      included.push(professional)
    }
  })

  return { included, excluded }
}
