import Groq from 'groq-sdk'

export const GROQ_MODEL_FAST = 'llama3-8b-8192'
export const GROQ_MODEL_LONG = 'llama3-70b-8192'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function callGroq(
  prompt: string,
  model: string = GROQ_MODEL_FAST
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const completion = await groq.chat.completions.create(
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      },
      { signal: controller.signal }
    )

    const output = completion.choices[0]?.message?.content
    if (!output) throw new Error('Groq returned an empty response')

    return output
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Groq timeout after 30s (model: ${model})`)
    }
    if (err instanceof Groq.APIError) {
      throw new Error(`Groq API error ${err.status}: ${err.message}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
