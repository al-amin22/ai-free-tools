import type { Metadata } from 'next'
import { generateHomeMetadata } from '@/lib/seo/metadata'
import { homeSchema } from '@/lib/seo/schema'
import SchemaMarkup from '@/components/seo/SchemaMarkup'
import AdManager from '@/components/ads/AdManager'
import HeroSection from '@/components/home/HeroSection'
import FeaturedTools from '@/components/home/FeaturedTools'
import CategoryGrid from '@/components/home/CategoryGrid'
import HowItWorks from '@/components/home/HowItWorks'
import PopularByCategory from '@/components/home/PopularByCategory'
import { getAllCategories } from '@/lib/db/categories'
import { getAllTools, getFeaturedTools } from '@/lib/db/tools'
import { getTotalUsageCount } from '@/components/ui/UsageCounter'
import type { Tool } from '@/types/database'

export const metadata: Metadata = generateHomeMetadata()

// Revalidate every 6 hours — DB content changes infrequently
export const revalidate = 21600

export default async function HomePage() {
  // Parallel data fetching — all queries run simultaneously
  const [categories, allTools, featuredTools, totalGenerates] = await Promise.all([
    getAllCategories(),
    getAllTools(),
    getFeaturedTools(6),
    getTotalUsageCount(),
  ])

  // Build tool count per category from the single getAllTools() result
  const toolCounts: Record<string, number> = {}
  for (const tool of allTools) {
    toolCounts[tool.category_id] = (toolCounts[tool.category_id] ?? 0) + 1
  }

  // Build top-4 tools per category (ordered by sort_order from DB)
  const toolsByCategory: Record<string, Tool[]> = {}
  for (const cat of categories) {
    toolsByCategory[cat.id] = allTools
      .filter((t) => t.category_id === cat.id)
      .slice(0, 4)
  }

  return (
    <>
      <SchemaMarkup schemas={homeSchema()} />

      {/* 1. Hero */}
      <HeroSection
        totalTools={allTools.length || 65}
        totalGenerates={totalGenerates}
      />

      {/* 2. Featured tools */}
      <FeaturedTools tools={featuredTools} />

      {/* 3. AdSense — Rectangle between featured and categories */}
      <div className="flex justify-center py-4 bg-white border-t border-gray-50">
        <AdManager placement="mid" categorySlug="default" toolSlug="homepage" />
      </div>

      {/* 4. Category grid */}
      <CategoryGrid categories={categories} toolCounts={toolCounts} />

      {/* 5. How it works */}
      <HowItWorks />

      {/* 6. Popular tools by category tabs */}
      <PopularByCategory
        categories={categories}
        toolsByCategory={toolsByCategory}
      />

      {/* 7. AdSense — Leaderboard bottom */}
      <div className="flex justify-center py-6 bg-gray-50 border-t border-gray-100">
        <AdManager placement="bottom" categorySlug="default" toolSlug="homepage" />
      </div>
    </>
  )
}
