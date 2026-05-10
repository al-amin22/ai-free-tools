-- =============================================================
-- AI FREE TOOLS USA — SEED: 6 Categories
-- Run AFTER schema.sql
-- =============================================================

INSERT INTO categories (
  name,
  slug,
  description,
  meta_title,
  meta_description,
  icon,
  color,
  is_active,
  sort_order
) VALUES

-- 1. Legal Documents (RPM $50-80, highest value)
(
  'Legal Documents',
  'legal-documents',
  'Free AI-powered legal document generators for the United States. Create NDAs, contracts, lease agreements, and more in minutes — no lawyer required.',
  'Free AI Legal Document Generator — US',
  'Generate professional US legal documents instantly with AI. NDAs, contracts, leases & more. 100% free, no sign up required.',
  '⚖️',
  '#1E40AF',
  TRUE,
  1
),

-- 2. Real Estate (RPM $40-70)
(
  'Real Estate',
  'real-estate',
  'AI tools for real estate professionals and home buyers in the United States. Generate listing descriptions, offer letters, lease agreements, and property reports.',
  'Free AI Real Estate Tools — United States',
  'AI-powered real estate document tools for US buyers, sellers & agents. Listing copy, offers, leases & more. Free, instant, no login.',
  '🏠',
  '#0F766E',
  TRUE,
  2
),

-- 3. HR & Recruitment (RPM $25-50)
(
  'HR & Recruitment',
  'hr-recruitment',
  'Free AI HR tools for US businesses. Generate job descriptions, offer letters, performance reviews, termination letters, and employee policies instantly.',
  'Free AI HR & Recruitment Tools — US',
  'AI-generated job descriptions, offer letters & HR documents for US companies. Save hours on hiring paperwork. 100% free.',
  '👥',
  '#7C3AED',
  TRUE,
  3
),

-- 4. Finance & Tax (RPM $50-100, highest RPM)
(
  'Finance & Tax',
  'finance-tax',
  'Free AI finance and tax tools built for the United States tax code. Generate invoices, financial summaries, IRS letter responses, and budget plans.',
  'Free AI Finance & Tax Tools — United States',
  'AI tools for US taxes, invoices & financial docs. IRS-ready formats, plain English explanations. Free, no sign up needed.',
  '💰',
  '#B45309',
  TRUE,
  4
),

-- 5. Small Business (RPM $20-40)
(
  'Small Business',
  'small-business',
  'AI tools designed for US small business owners. Create business plans, partnership agreements, vendor contracts, and marketing copy in seconds.',
  'Free AI Small Business Tools — US',
  'AI-powered tools for US small business owners. Business plans, contracts, policies & more. 100% free, no account needed.',
  '🏢',
  '#15803D',
  TRUE,
  5
),

-- 6. Copywriting & Content (RPM $15-30)
(
  'Copywriting & Content',
  'copywriting-content',
  'Free AI copywriting tools for US marketers, bloggers, and entrepreneurs. Generate ad copy, blog posts, email campaigns, and social media content.',
  'Free AI Copywriting & Content Tools — US',
  'AI copywriting tools for US marketers & creators. Ad copy, emails, blog posts & social content. Free, instant, no login.',
  '✍️',
  '#DC2626',
  TRUE,
  6
)

ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  meta_title       = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  icon             = EXCLUDED.icon,
  color            = EXCLUDED.color,
  is_active        = EXCLUDED.is_active,
  sort_order       = EXCLUDED.sort_order,
  updated_at       = NOW();
