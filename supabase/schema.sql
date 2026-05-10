-- =============================================================
-- AI FREE TOOLS USA — SUPABASE SCHEMA
-- 15 tables | UUID PKs | RLS | Indexes | Auto-updated_at
-- =============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- UTILITY: auto-update updated_at trigger function
-- =============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper macro to attach the trigger to any table
-- Usage: SELECT attach_updated_at_trigger('table_name');
CREATE OR REPLACE FUNCTION attach_updated_at_trigger(tbl TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'CREATE OR REPLACE TRIGGER set_updated_at
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
    tbl
  );
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- 1. CATEGORIES
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  meta_title      TEXT,                         -- max 60 chars
  meta_description TEXT,                        -- max 155 chars
  icon            TEXT,                         -- emoji
  color           TEXT,                         -- hex e.g. #3B82F6
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug       ON categories(slug);
CREATE INDEX idx_categories_is_active  ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read"  ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_admin_all"    ON categories USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('categories');


-- =============================================================
-- 2. TOOLS
-- =============================================================
CREATE TABLE IF NOT EXISTS tools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  meta_title          TEXT,                     -- max 60 chars
  meta_description    TEXT,                     -- max 155 chars
  h1_text             TEXT,
  primary_keyword     TEXT,
  secondary_keywords  TEXT[] DEFAULT '{}',
  ai_prompt           TEXT NOT NULL,
  ai_model            TEXT NOT NULL DEFAULT 'groq-8b',  -- groq-8b | groq-70b | gemini-flash
  min_output_length   INT NOT NULL DEFAULT 300,
  required_elements   TEXT[] DEFAULT '{}',      -- e.g. ['signature_block','governing_law']
  form_fields         JSONB NOT NULL DEFAULT '[]',
  how_it_works        TEXT[] DEFAULT '{}',
  faq                 JSONB NOT NULL DEFAULT '[]',   -- [{q,a}]
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order          INT NOT NULL DEFAULT 0,
  view_count          BIGINT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tools_category_id  ON tools(category_id);
CREATE INDEX idx_tools_slug         ON tools(slug);
CREATE INDEX idx_tools_is_active    ON tools(is_active);
CREATE INDEX idx_tools_is_featured  ON tools(is_featured);
CREATE INDEX idx_tools_sort_order   ON tools(sort_order);
CREATE INDEX idx_tools_primary_kw   ON tools(primary_keyword);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tools_public_read" ON tools FOR SELECT USING (is_active = TRUE);
CREATE POLICY "tools_admin_all"   ON tools USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('tools');


-- =============================================================
-- 3. ARTICLES
-- =============================================================
CREATE TABLE IF NOT EXISTS articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL,
  meta_title       TEXT,
  meta_description TEXT,
  keywords         TEXT[] DEFAULT '{}',
  tool_id          UUID REFERENCES tools(id) ON DELETE SET NULL,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  word_count       INT DEFAULT 0,
  ai_model         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_slug         ON articles(slug);
CREATE INDEX idx_articles_tool_id      ON articles(tool_id);
CREATE INDEX idx_articles_category_id  ON articles(category_id);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON articles FOR SELECT USING (is_published = TRUE);
CREATE POLICY "articles_admin_all"   ON articles USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('articles');


-- =============================================================
-- 4. KEYWORDS
-- =============================================================
CREATE TABLE IF NOT EXISTS keywords (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword        TEXT NOT NULL UNIQUE,
  search_volume  INT DEFAULT 0,
  difficulty     INT DEFAULT 0,               -- 0-100
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  tool_id        UUID REFERENCES tools(id) ON DELETE SET NULL,
  is_target      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_keywords_keyword       ON keywords(keyword);
CREATE INDEX idx_keywords_category_id   ON keywords(category_id);
CREATE INDEX idx_keywords_tool_id       ON keywords(tool_id);
CREATE INDEX idx_keywords_is_target     ON keywords(is_target);
CREATE INDEX idx_keywords_search_volume ON keywords(search_volume DESC);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keywords_admin_all" ON keywords USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('keywords');


-- =============================================================
-- 5. RANKING_HISTORY
-- =============================================================
CREATE TABLE IF NOT EXISTS ranking_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id  UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  position    INT,                            -- null = not ranking
  url         TEXT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ranking_keyword_id  ON ranking_history(keyword_id);
CREATE INDEX idx_ranking_checked_at  ON ranking_history(checked_at DESC);
CREATE INDEX idx_ranking_position    ON ranking_history(position);

ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ranking_admin_all" ON ranking_history USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('ranking_history');


-- =============================================================
-- 6. SEO_AUDITS
-- =============================================================
CREATE TABLE IF NOT EXISTS seo_audits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url              TEXT NOT NULL,
  tool_id          UUID REFERENCES tools(id) ON DELETE SET NULL,
  score            INT DEFAULT 0,             -- 0-100
  issues           JSONB NOT NULL DEFAULT '[]',
  recommendations  JSONB NOT NULL DEFAULT '[]',
  audited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_audits_tool_id    ON seo_audits(tool_id);
CREATE INDEX idx_seo_audits_url        ON seo_audits(url);
CREATE INDEX idx_seo_audits_audited_at ON seo_audits(audited_at DESC);
CREATE INDEX idx_seo_audits_score      ON seo_audits(score);

ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_audits_admin_all" ON seo_audits USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('seo_audits');


-- =============================================================
-- 7. AI_JOBS
-- =============================================================
CREATE TABLE IF NOT EXISTS ai_jobs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type       TEXT NOT NULL,               -- keyword-monitor | generate-article | etc.
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','running','completed','failed')),
  input_data     JSONB NOT NULL DEFAULT '{}',
  output_data    JSONB DEFAULT '{}',
  error_message  TEXT,
  ai_model       TEXT,
  duration_ms    INT,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_jobs_job_type    ON ai_jobs(job_type);
CREATE INDEX idx_ai_jobs_status      ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_created_at  ON ai_jobs(created_at DESC);

ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_jobs_admin_all" ON ai_jobs USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('ai_jobs');


-- =============================================================
-- 8. TOOL_USAGE  (rate limiting)
-- =============================================================
CREATE TABLE IF NOT EXISTS tool_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id       UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  ip_address    TEXT NOT NULL,
  user_id       UUID,                         -- null = anonymous
  request_count INT NOT NULL DEFAULT 1,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tool_usage_tool_id      ON tool_usage(tool_id);
CREATE INDEX idx_tool_usage_ip           ON tool_usage(ip_address);
CREATE INDEX idx_tool_usage_window_start ON tool_usage(window_start);
CREATE INDEX idx_tool_usage_ip_window    ON tool_usage(ip_address, window_start);

ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;
-- Only service_role reads; anon inserts via API route (server-side only)
CREATE POLICY "tool_usage_admin_all" ON tool_usage USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('tool_usage');


-- =============================================================
-- 9. FEEDBACK
-- =============================================================
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id     UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  ip_address  TEXT NOT NULL,
  rating      TEXT NOT NULL CHECK (rating IN ('thumbs_up','thumbs_down')),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_tool_id   ON feedback(tool_id);
CREATE INDEX idx_feedback_rating    ON feedback(rating);
CREATE INDEX idx_feedback_created   ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- Anon users can insert (via API), admin reads all
CREATE POLICY "feedback_anon_insert" ON feedback FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "feedback_admin_all"   ON feedback USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('feedback');


-- =============================================================
-- 10. SUBSCRIBERS
-- =============================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  tool_id     UUID REFERENCES tools(id) ON DELETE SET NULL,  -- tool that triggered signup
  ip_address  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email     ON subscribers(email);
CREATE INDEX idx_subscribers_tool_id   ON subscribers(tool_id);
CREATE INDEX idx_subscribers_is_active ON subscribers(is_active);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers_anon_insert" ON subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "subscribers_admin_all"   ON subscribers USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('subscribers');


-- =============================================================
-- 11. EXAMPLE_OUTPUTS
-- =============================================================
CREATE TABLE IF NOT EXISTS example_outputs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id        UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  input_data     JSONB NOT NULL DEFAULT '{}',
  output_text    TEXT NOT NULL,
  quality_score  INT DEFAULT 0,               -- 0-100
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_example_outputs_tool_id    ON example_outputs(tool_id);
CREATE INDEX idx_example_outputs_featured   ON example_outputs(is_featured);
CREATE INDEX idx_example_outputs_quality    ON example_outputs(quality_score DESC);

ALTER TABLE example_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "example_outputs_public_read" ON example_outputs FOR SELECT USING (TRUE);
CREATE POLICY "example_outputs_admin_all"   ON example_outputs USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('example_outputs');


-- =============================================================
-- 12. SITE_CONFIG
-- =============================================================
CREATE TABLE IF NOT EXISTS site_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_config_key ON site_config(key);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
-- Public can read config (AdSense IDs etc. fetched server-side only)
CREATE POLICY "site_config_public_read" ON site_config FOR SELECT USING (TRUE);
CREATE POLICY "site_config_admin_all"   ON site_config USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('site_config');


-- =============================================================
-- 13. PERFORMANCE_LOGS  (Core Web Vitals)
-- =============================================================
CREATE TABLE IF NOT EXISTS performance_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT NOT NULL,
  lcp         NUMERIC(8,3),                   -- Largest Contentful Paint (ms)
  fid         NUMERIC(8,3),                   -- First Input Delay (ms)
  cls         NUMERIC(8,4),                   -- Cumulative Layout Shift
  fcp         NUMERIC(8,3),                   -- First Contentful Paint (ms)
  ttfb        NUMERIC(8,3),                   -- Time To First Byte (ms)
  device      TEXT CHECK (device IN ('mobile','desktop','tablet')),
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_logs_url        ON performance_logs(url);
CREATE INDEX idx_perf_logs_created_at ON performance_logs(created_at DESC);
CREATE INDEX idx_perf_logs_device     ON performance_logs(device);

ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf_logs_anon_insert" ON performance_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "perf_logs_admin_all"   ON performance_logs USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('performance_logs');


-- =============================================================
-- 14. BACKLINK_OPPORTUNITIES
-- =============================================================
CREATE TABLE IF NOT EXISTS backlink_opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform      TEXT NOT NULL,                -- reddit | quora | medium | etc.
  url           TEXT NOT NULL,
  title         TEXT,
  tool_id       UUID REFERENCES tools(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','submitted','approved','rejected','ignored')),
  notes         TEXT,
  found_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backlink_tool_id   ON backlink_opportunities(tool_id);
CREATE INDEX idx_backlink_platform  ON backlink_opportunities(platform);
CREATE INDEX idx_backlink_status    ON backlink_opportunities(status);
CREATE INDEX idx_backlink_found_at  ON backlink_opportunities(found_at DESC);

ALTER TABLE backlink_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backlink_admin_all" ON backlink_opportunities USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('backlink_opportunities');


-- =============================================================
-- 15. STATE_PAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS state_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id          UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  state_code       TEXT NOT NULL,             -- e.g. CA, TX, NY
  state_name       TEXT NOT NULL,
  content          TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, state_code)
);

CREATE INDEX idx_state_pages_tool_id    ON state_pages(tool_id);
CREATE INDEX idx_state_pages_state_code ON state_pages(state_code);
CREATE INDEX idx_state_pages_is_active  ON state_pages(is_active);

ALTER TABLE state_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "state_pages_public_read" ON state_pages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "state_pages_admin_all"   ON state_pages USING (auth.role() = 'service_role');

SELECT attach_updated_at_trigger('state_pages');


-- =============================================================
-- SEED: default site_config keys
-- =============================================================
INSERT INTO site_config (key, value, description) VALUES
  ('adsense_publisher_id',    '',    'Google AdSense publisher ID (ca-pub-XXXXXXXX)'),
  ('adsense_slot_top',        '',    'AdSense slot ID — top of page'),
  ('adsense_slot_sidebar',    '',    'AdSense slot ID — sidebar next to output'),
  ('adsense_slot_below_out',  '',    'AdSense slot ID — below output'),
  ('adsense_slot_mid',        '',    'AdSense slot ID — mid content'),
  ('adsense_slot_bottom',     '',    'AdSense slot ID — bottom of page'),
  ('site_url',                'https://aifreetools.us', 'Canonical site URL'),
  ('site_name',               'AI Free Tools',          'Site display name'),
  ('groq_model_fast',         'llama3-8b-8192',         'Groq model for short output'),
  ('groq_model_long',         'llama3-70b-8192',        'Groq model for long output'),
  ('gemini_model',            'gemini-1.5-flash',       'Gemini model for 1000+ word output'),
  ('rate_limit_anon',         '5',                      'Max requests per hour for anonymous users'),
  ('rate_limit_registered',   '20',                     'Max requests per hour for registered users'),
  ('anon_rate_window_hours',  '1',                      'Rate limit window in hours')
ON CONFLICT (key) DO NOTHING;
