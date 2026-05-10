import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_MODEL = 'gemini-1.5-flash'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function callGemini(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const resultPromise = model.generateContent(prompt)

    const raceResult = await Promise.race([
      resultPromise,
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener('abort', () =>
          reject(new Error(`Gemini timeout after 60s`))
        )
      ),
    ])

    const output = raceResult.response.text()
    if (!output) throw new Error('Gemini returned an empty response')

    return output
  } catch (err) {
    if (err instanceof Error && err.message.includes('timeout')) throw err
    if (err instanceof Error) {
      throw new Error(`Gemini error: ${err.message}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
