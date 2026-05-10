# AI FREE TOOLS USA — PROJECT CONTEXT

## PROJECT OVERVIEW
Website dengan 65 AI-powered tools target pasar USA 
untuk monetisasi Google AdSense. 
Semua tools gratis untuk user, revenue dari AdSense.

## TECH STACK
- Next.js 14 App Router + TypeScript
- Tailwind CSS untuk styling
- Supabase untuk database (semua data dinamis)
- Groq API untuk AI utama (gratis, cepat)
- Gemini Flash API untuk AI backup dan output panjang
- Google AdSense untuk monetisasi
- Vercel untuk deploy dan cron jobs

## CRITICAL RULES — SELALU IKUTI INI

### 1. TIDAK ADA HARDCODE
Semua data dari Supabase database:
- Tool names, descriptions, prompts → dari tabel tools
- Category info → dari tabel categories  
- Meta tags, FAQ, how-it-works → dari database
- AdSense slot IDs → dari tabel site_config
- Tidak ada string konten yang hardcode di kode

### 2. SETIAP HALAMAN TOOL HARUS PUNYA
- Meta title dengan keyword (max 60 karakter)
- Meta description benefit-focused (max 155 karakter)
- hreflang="en-us" tag
- H1 exact/close match primary keyword
- Schema markup: WebApplication + FAQPage + BreadcrumbList
- FAQ minimum 7 pertanyaan dari database
- Related tools minimum 3
- AdSense placement: atas, samping output, bawah output, 
  tengah konten, bawah halaman
- Trust badges: No Sign Up, 100% Free, AI Powered
- Privacy notice di bawah form

### 3. AI OUTPUT HARUS DIVALIDASI
Sebelum output tampil ke user:
- Cek minimum length per kategori
- Cek required elements (signature block, governing law, dll)
- Cek tidak ada placeholder yang belum diganti
- Maximum 3 retry kalau gagal validasi
- Fallback ke template kalau semua retry gagal

### 4. RATE LIMITING
- Anonymous: 5 request per jam per IP
- Registered: 20 request per jam
- Kalau hit limit: tampilkan modal signup yang friendly
- JANGAN tampilkan error keras

### 5. ERROR HANDLING
- Semua error harus user-friendly
- Tidak boleh tampilkan technical error ke user
- Selalu ada next step yang jelas
- Log semua error ke console dan database

### 6. PERFORMANCE
- Target LCP < 2.5 detik
- Tool form harus ada above the fold
- AdSense harus fixed dimensions (hindari CLS)
- Gunakan Next.js caching untuk database queries

### 7. USA TARGETING
- Semua output AI dalam American English
- Format tanggal: MM/DD/YYYY
- Currency: USD ($)
- Referensi hukum: US federal dan state law
- Mention "United States" atau "US" minimal 2x per halaman

## FOLDER STRUCTURE
```
/src
  /app                    → Next.js pages dan API routes
    /api
      /tools/generate     → AI generation endpoint
      /feedback           → User feedback endpoint
      /subscribe          → Email signup endpoint
      /cron               → SEO automation cron jobs
      /admin              → Admin endpoints
      /analytics          → Web vitals tracking
      /og                 → OG image generator
    /tools/[category]/[slug]        → Tool pages
    /tools/[category]/[slug]/[state] → State-specific pages
    /blog/[slug]          → Blog article pages
    /admin                → Admin dashboard
  /components
    /ads                  → AdSense components
    /tools                → Tool form, output, feedback
    /blog                 → Blog components
    /layout               → Header, footer
    /seo                  → Schema, breadcrumb, TOC
    /ui                   → Trust badges, loading, error
    /analytics            → Web vitals tracker
  /lib
    /supabase             → Database clients
    /ai                   → Groq, Gemini, validator, A/B test
    /db                   → Database query functions
    /seo                  → Metadata, schema generators
    /cache                → Caching utilities
    /rate-limit           → Rate limiting logic
    /data                 → US states data
```

## DATABASE TABLES
- categories: 6 kategori tools
- tools: 65 tools dengan semua data SEO dan AI config
- articles: blog articles yang AI generate
- keywords: keyword tracking untuk SEO
- ranking_history: history posisi keyword
- seo_audits: hasil audit SEO per halaman
- ai_jobs: log semua AI automation jobs
- tool_usage: tracking usage per IP untuk rate limiting
- feedback: thumbs up/down dari user
- subscribers: email list dari rate limit signups
- example_outputs: contoh output terbaik per tool
- site_config: konfigurasi global (AdSense, SEO)
- performance_logs: Core Web Vitals data
- backlink_opportunities: Reddit/Quora opportunities
- state_pages: state-specific page content

## TOOL CATEGORIES & RPM
- Legal Documents: RPM $50-80
- Real Estate: RPM $40-70  
- HR & Recruitment: RPM $25-50
- Finance & Tax: RPM $50-100
- Small Business: RPM $20-40
- Copywriting & Content: RPM $15-30

## AI MODEL SELECTION
- Groq (llama3-8b): output pendek-menengah, < 500 kata
- Groq (llama3-70b): output menengah-panjang, 500-1000 kata
- Gemini Flash: output panjang > 1000 kata, artikel blog
- Fallback: kalau Groq gagal → otomatis ke Gemini

## CRON JOBS SCHEDULE (via Vercel)
- keyword-monitor: 0 6 * * * (daily 6am)
- trend-monitor: 0 7 * * * (daily 7am)
- generate-article: 0 8 * * * (daily 8am)
- ranking-tracker: 0 9 * * * (daily 9am)
- backlink-finder: 0 10 * * * (daily 10am)
- optimize-pages: 0 0 * * 1 (weekly Monday)
- content-updater: 0 0 * * 3 (weekly Wednesday)
- legal-monitor: 0 0 * * 5 (weekly Friday)
- competitor-analysis: 0 0 1 * * (monthly)

## LOCAL DEVELOPMENT NOTES
- Gunakan .env.local untuk semua secrets
- Supabase local atau cloud project untuk development
- Cron jobs tidak jalan di local — test via manual trigger
- Seed database dulu sebelum test halaman tools
