import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AiGenerateOptions, AiResult, AiModel } from '@/types'

let _groq: Groq | null = null
let _gemini: GoogleGenerativeAI | null = null

function groqClient(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  return _groq
}

function geminiClient(): GoogleGenerativeAI {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  return _gemini
}

const GROQ_MODEL_IDS: Record<AiModel, string> = {
  'groq-llama-70b': 'llama-3.3-70b-versatile',
  'groq-llama-8b': 'llama-3.1-8b-instant',
  'gemini-flash': '', // handled separately
}

async function generateWithGroq(opts: AiGenerateOptions): Promise<AiResult> {
  const modelId = GROQ_MODEL_IDS[opts.model]
  const completion = await groqClient().chat.completions.create({
    model: modelId,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens ?? 4096,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
  })

  const content = completion.choices[0]?.message?.content ?? ''
  return {
    content,
    model: modelId,
    wordCount: content.split(/\s+/).filter(Boolean).length,
    inputTokens: completion.usage?.prompt_tokens,
    outputTokens: completion.usage?.completion_tokens,
  }
}

async function generateWithGemini(opts: AiGenerateOptions): Promise<AiResult> {
  const model = geminiClient().getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: opts.temperature, maxOutputTokens: opts.maxTokens ?? 8192 },
    systemInstruction: opts.systemPrompt,
  })

  const result = await model.generateContent(opts.userPrompt)
  const content = result.response.text()
  return {
    content,
    model: 'gemini-1.5-flash',
    wordCount: content.split(/\s+/).filter(Boolean).length,
  }
}

export async function generate(opts: AiGenerateOptions): Promise<AiResult> {
  if (opts.model === 'gemini-flash') {
    return generateWithGemini(opts)
  }
  return generateWithGroq(opts)
}

/** Generate with automatic Gemini fallback if Groq fails */
export async function generateWithFallback(opts: AiGenerateOptions): Promise<AiResult> {
  if (opts.model !== 'gemini-flash') {
    try {
      return await generateWithGroq(opts)
    } catch (err) {
      console.warn('[AI] Groq failed, falling back to Gemini:', (err as Error).message)
      return generateWithGemini({ ...opts, model: 'gemini-flash' })
    }
  }
  return generateWithGemini(opts)
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}
