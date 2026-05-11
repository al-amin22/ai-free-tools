import { ClipboardList, Sparkles, Copy } from 'lucide-react'

const STEPS = [
  {
    step:  '01',
    icon:  <ClipboardList size={24} className="text-blue-600" aria-hidden />,
    title: 'Input Your Details',
    body:  'Fill in a short form with your specifics — names, dates, amounts. No account needed.',
  },
  {
    step:  '02',
    icon:  <Sparkles size={24} className="text-purple-600" aria-hidden />,
    title: 'AI Generates Instantly',
    body:  'Our AI creates a professionally formatted, US-compliant document in seconds.',
  },
  {
    step:  '03',
    icon:  <Copy size={24} className="text-green-600" aria-hidden />,
    title: 'Copy, Download & Use',
    body:  'Copy to clipboard or download as .txt or .docx. Ready to use immediately.',
  },
]

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="py-16 px-4 bg-white"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 id="how-heading" className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-2 text-gray-500">
            From blank page to finished document in under 30 seconds
          </p>
        </div>

        <ol className="relative grid gap-8 sm:grid-cols-3" role="list">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden
            className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 sm:block"
          />

          {STEPS.map((s) => (
            <li key={s.step} className="relative flex flex-col items-center text-center">
              {/* Circle */}
              <div className="z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border-2 border-gray-100 shadow-sm">
                {s.icon}
              </div>

              <span className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-300">
                Step {s.step}
              </span>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
