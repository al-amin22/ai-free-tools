export interface ValidationResult {
  ok: boolean
  reason?: string
  sanitized?: string
}

/** Strip common AI preamble phrases */
function stripPreamble(text: string): string {
  return text
    .replace(/^(here is|here's|certainly|sure,?|of course,?|absolutely,?)[^.!?\n]*[.!?\n]/gi, '')
    .replace(/^(as an ai|as a legal|as a[n]? \w+)[^.!?\n]*[.!?\n]/gi, '')
    .trim()
}

/** Check if output meets quality bar */
export function validateAiOutput(
  content: string,
  minWords: number
): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { ok: false, reason: 'Empty response from AI' }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  if (wordCount < minWords) {
    return { ok: false, reason: `Output too short: ${wordCount} words (min: ${minWords})` }
  }

  // Refuse if AI says it cannot help
  const refusalPatterns = [
    /i (can't|cannot|won't|am not able to) (provide|help|assist|generate)/i,
    /as an ai (language model|assistant), i/i,
    /i don't have (access|the ability) to/i,
  ]
  for (const pattern of refusalPatterns) {
    if (pattern.test(content)) {
      return { ok: false, reason: 'AI refused to generate content' }
    }
  }

  return { ok: true, sanitized: stripPreamble(content) }
}

/** Validate AI output and throw a user-friendly error if invalid */
export function assertValidOutput(content: string, minWords: number): string {
  const result = validateAiOutput(content, minWords)
  if (!result.ok) {
    throw new Error('Unable to generate a quality response right now. Please try again.')
  }
  return result.sanitized!
}
