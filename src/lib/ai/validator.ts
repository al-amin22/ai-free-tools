export type Category =
  | 'legal'
  | 'real-estate'
  | 'hr'
  | 'finance'
  | 'business'
  | 'content'

export interface ValidationResult {
  valid: boolean
  reason?: string
  score: number   // 0-100
}

// ─── 1. Minimum word counts ──────────────────────────────────────────────────

const MIN_WORDS: Record<Category, number> = {
  'legal':       400,
  'real-estate': 350,
  'hr':          300,
  'finance':     200,
  'business':    300,
  'content':     150,
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── 2. Unfilled placeholder patterns ────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /\[YOUR\s+\w+\]/i,          // [YOUR NAME], [YOUR COMPANY]
  /\[NAME\]/i,
  /\[DATE\]/i,
  /\[ADDRESS\]/i,
  /\[[A-Z][A-Z\s]{2,}\]/,     // Any [ALL CAPS PHRASE] 3+ chars
  /\{\{[^}]+\}\}/,            // {{variable}}
  /___+/,                      // blank lines used as placeholders (3+ underscores)
  /\[INSERT\s+\w+\]/i,        // [INSERT AMOUNT]
  /\[ENTER\s+\w+\]/i,         // [ENTER DATE]
]

function findPlaceholders(text: string): string[] {
  const found: string[] = []
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, pattern.flags + 'g'))
    if (matches) found.push(...matches)
  }
  return [...new Set(found)]
}

// ─── 3. AI refusal / error phrases ───────────────────────────────────────────

const REFUSAL_PHRASES = [
  "i cannot",
  "i'm unable",
  "i am unable",
  "as an ai",
  "as an artificial intelligence",
  "i apologize",
  "i don't have the ability",
  "i cannot generate",
  "i'm not able to",
]

function hasRefusalPhrase(text: string): string | null {
  const lower = text.toLowerCase()
  for (const phrase of REFUSAL_PHRASES) {
    if (lower.includes(phrase)) return phrase
  }
  return null
}

// ─── 4. Category-specific required elements ───────────────────────────────────

interface CategoryCheck {
  test: (text: string) => boolean
  reason: string
}

const CATEGORY_CHECKS: Partial<Record<Category, CategoryCheck[]>> = {
  legal: [
    {
      test: (t) => /whereas|article\s+\d|section\s+\d|^\d+\./im.test(t),
      reason: 'Missing legal structure (WHEREAS clause or numbered sections)',
    },
    {
      test: (t) => /signature|sign\s+here|____+|\/s\//i.test(t),
      reason: 'Missing signature block',
    },
  ],
  finance: [
    {
      test: (t) => /\$[\d,]+(\.\d{2})?|\d+(\.\d+)?\s*(USD|dollars)/i.test(t),
      reason: 'Missing dollar amounts or currency figures',
    },
    {
      test: (t) => /\d/.test(t),
      reason: 'Missing numeric data',
    },
  ],
  hr: [
    {
      test: (t) =>
        /(position|role|title|job\s+title)[\s\S]{0,200}(manager|engineer|analyst|coordinator|specialist|director|assistant|representative)/i.test(t),
      reason: 'Missing job position or role name',
    },
    {
      test: (t) =>
        /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})\b/i.test(t),
      reason: 'Missing date reference',
    },
  ],
  content: [
    {
      test: (t) => {
        const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim().length > 40)
        return paragraphs.length >= 3
      },
      reason: 'Content must have at least 3 paragraphs',
    },
  ],
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateOutput(
  output: string,
  category: Category,
  toolName: string
): ValidationResult {
  const issues: string[] = []
  let score = 100

  // 1. Length check
  const wordCount = countWords(output)
  const minWords = MIN_WORDS[category]
  if (wordCount < minWords) {
    issues.push(
      `Too short: ${wordCount} words (minimum ${minWords} for ${category})`
    )
    // Proportional deduction — up to 40 points
    score -= Math.round(((minWords - wordCount) / minWords) * 40)
  }

  // 2. Placeholder check
  const placeholders = findPlaceholders(output)
  if (placeholders.length > 0) {
    issues.push(
      `Unfilled placeholders found: ${placeholders.slice(0, 5).join(', ')}`
    )
    score -= Math.min(placeholders.length * 10, 30)
  }

  // 3. Refusal check
  const refusal = hasRefusalPhrase(output)
  if (refusal) {
    issues.push(`AI refusal detected: "${refusal}"`)
    score -= 50
  }

  // 4. Category-specific checks
  const checks = CATEGORY_CHECKS[category] ?? []
  for (const check of checks) {
    if (!check.test(output)) {
      issues.push(check.reason)
      score -= 15
    }
  }

  score = Math.max(0, score)
  const valid = issues.length === 0

  if (valid) {
    return { valid: true, score }
  }

  console.warn(`[validator] "${toolName}" (${category}) failed — score ${score}:`, issues)

  return {
    valid: false,
    reason: issues[0],   // primary failure reason for retry prompt
    score,
  }
}

// ─── Retry wrapper ────────────────────────────────────────────────────────────

export async function withRetry<T extends string>(
  generateFn: (attempt: number) => Promise<T>,
  category: Category,
  toolName: string,
  maxRetries = 3
): Promise<{ output: T; attempts: number; valid: boolean }> {
  let lastOutput: T | null = null
  let lastResult: ValidationResult | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const output = await generateFn(attempt)
    const result = validateOutput(output, category, toolName)

    if (result.valid) {
      console.log(`[validator] "${toolName}" passed on attempt ${attempt}`)
      return { output, attempts: attempt, valid: true }
    }

    lastOutput = output
    lastResult = result
    console.warn(
      `[validator] Attempt ${attempt}/${maxRetries} failed — ${result.reason}`
    )
  }

  // All retries exhausted — return last output with valid: false so the
  // caller can decide to use a static fallback template
  console.error(
    `[validator] "${toolName}" failed all ${maxRetries} attempts. ` +
    `Last score: ${lastResult?.score ?? 0}`
  )
  return { output: lastOutput!, attempts: maxRetries, valid: false }
}
