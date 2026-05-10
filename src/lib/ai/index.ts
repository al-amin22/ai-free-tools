import { callGroq, GROQ_MODEL_FAST, GROQ_MODEL_LONG } from './groq'
import { callGemini } from './gemini'

export interface AIOptions {
  model?: 'groq' | 'gemini'
  long?: boolean        // true → output > 1000 words, forces Gemini
}

export interface AIResult {
  output: string
  model: string
  responseTime: number  // ms
}

export async function callAI(
  prompt: string,
  options: AIOptions = {}
): Promise<AIResult> {
  const { model, long = false } = options
  const start = Date.now()

  // Long output or explicit gemini → go straight to Gemini
  if (long || model === 'gemini') {
    const output = await callGemini(prompt)
    const responseTime = Date.now() - start
    console.log(`[AI] gemini-1.5-flash — ${responseTime}ms`)
    return { output, model: 'gemini-1.5-flash', responseTime }
  }

  // Explicit groq → no fallback
  if (model === 'groq') {
    const groqModel = GROQ_MODEL_FAST
    const output = await callGroq(prompt, groqModel)
    const responseTime = Date.now() - start
    console.log(`[AI] ${groqModel} — ${responseTime}ms`)
    return { output, model: groqModel, responseTime }
  }

  // Default: try Groq first, fall back to Gemini on any error
  try {
    const groqModel = GROQ_MODEL_FAST
    const output = await callGroq(prompt, groqModel)
    const responseTime = Date.now() - start
    console.log(`[AI] ${groqModel} — ${responseTime}ms`)
    return { output, model: groqModel, responseTime }
  } catch (groqErr) {
    const groqMsg = groqErr instanceof Error ? groqErr.message : String(groqErr)
    console.warn(`[AI] Groq failed (${groqMsg}), falling back to Gemini`)

    const output = await callGemini(prompt)
    const responseTime = Date.now() - start
    console.log(`[AI] gemini-1.5-flash (fallback) — ${responseTime}ms`)
    return { output, model: 'gemini-1.5-flash (fallback)', responseTime }
  }
}

export { callGroq, callGemini, GROQ_MODEL_FAST, GROQ_MODEL_LONG }
