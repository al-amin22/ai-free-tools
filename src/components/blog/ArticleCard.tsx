import Link from 'next/link'
import { Clock, Calendar } from 'lucide-react'
import type { Article, Category } from '@/types/database'

interface ArticleCardProps {
  article:   Article
  category?: Category | null
  featured?: boolean
  className?: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function ArticleCard({
  article,
  category,
  featured  = false,
  className = '',
}: ArticleCardProps) {
  const readTime = Math.max(1, Math.ceil((article.word_count ?? 0) / 200))
  const excerpt  = article.meta_description ?? article.content.replace(/<[^>]+>/g, '').slice(0, 150) + '…'
  const date     = article.published_at ?? article.created_at

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={`group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ${className}`}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: category?.color ?? '#3B82F6' }}
        aria-hidden
      />

      <div className={`flex flex-col flex-1 p-5 ${featured ? 'sm:p-7' : ''}`}>
        {/* Category + read time */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${category.color}15`,
                color:           category.color ?? '#3B82F6',
              }}
            >
              <span aria-hidden>{category.icon}</span>
              {category.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} aria-hidden />
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-2 ${
            featured ? 'text-xl sm:text-2xl' : 'text-base'
          }`}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className={`text-gray-500 leading-relaxed flex-1 ${featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
          <Calendar size={11} aria-hidden />
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
      </div>
    </Link>
  )
}
