import type { ExampleOutput } from '@/types/database'

interface ExampleGalleryProps {
  examples:   ExampleOutput[]
  toolName:   string
  className?: string
}

export default function ExampleGallery({ examples, toolName, className = '' }: ExampleGalleryProps) {
  if (!examples.length) return null

  return (
    <section aria-labelledby="examples-heading" className={className}>
      <h2 id="examples-heading" className="text-xl font-bold text-gray-900 mb-5">
        Example {toolName} Outputs
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((ex, i) => (
          <article
            key={ex.id}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Example {i + 1}
              </span>
              {ex.quality_score >= 90 && (
                <span className="text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-100 px-2 py-0.5">
                  ★ Top Quality
                </span>
              )}
            </div>

            {/* Show first 300 chars of the output */}
            <p className="text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
              {ex.output_text.slice(0, 300)}
              {ex.output_text.length > 300 && '…'}
            </p>

            {/* Input context chips */}
            {Object.keys(ex.input_data ?? {}).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(ex.input_data as Record<string, string>)
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-block rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] text-gray-500"
                    >
                      {String(v).slice(0, 30)}
                    </span>
                  ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
