-- ============================================================
-- AI FREE TOOLS USA — Database Schema
-- ============================================================

-- Tool categories
CREATE TYPE tool_category AS ENUM (
  'legal', 'real_estate', 'hr', 'business', 'content',
  'calculator', 'writing', 'marketing', 'finance', 'education'
);

-- AI model choices
CREATE TYPE ai_model AS ENUM (
  'groq-llama-70b', 'groq-llama-8b', 'gemini-flash'
);

-- Article status
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- ============================================================
-- TOOLS TABLE — the 65 AI tools
-- ============================================================
CREATE TABLE tools (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(120) UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  category        tool_category NOT NULL,
  icon            VARCHAR(60),                    -- lucide icon name
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,

  -- SEO
  meta_title      VARCHAR(60) NOT NULL,
  meta_description VARCHAR(155) NOT NULL,
  schema_type     VARCHAR(60) DEFAULT 'WebApplication',

  -- AI config
  ai_model        ai_model NOT NULL DEFAULT 'groq-llama-70b',
  temperature     NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  min_words       INTEGER NOT NULL DEFAULT 300,
  system_prompt_id INTEGER,                       -- FK added below

  -- Tool config (JSON: input fields, options, etc.)
  config          JSONB NOT NULL DEFAULT '{}',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_active ON tools(is_active);

-- ============================================================
-- PROMPTS TABLE — all prompts stored in DB
-- ============================================================
CREATE TABLE prompts (
  id          SERIAL PRIMARY KEY,
  tool_id     INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,              -- e.g. 'system', 'user_template'
  content     TEXT NOT NULL,
  version     INTEGER DEFAULT 1,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_tool ON prompts(tool_id, is_active);

-- Add FK after prompts table exists
ALTER TABLE tools ADD CONSTRAINT fk_system_prompt
  FOREIGN KEY (system_prompt_id) REFERENCES prompts(id) ON DELETE SET NULL;

-- ============================================================
-- FAQ TABLE — per-tool FAQs for schema markup
-- ============================================================
CREATE TABLE faqs (
  id        SERIAL PRIMARY KEY,
  tool_id   INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_faqs_tool ON faqs(tool_id);

-- ============================================================
-- ARTICLES TABLE — AI-generated daily articles
-- ============================================================
CREATE TABLE articles (
  id              SERIAL PRIMARY KEY,
  tool_id         INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  slug            VARCHAR(200) UNIQUE NOT NULL,
  title           VARCHAR(300) NOT NULL,
  content         TEXT NOT NULL,
  excerpt         TEXT NOT NULL,
  status          article_status DEFAULT 'draft',

  -- SEO
  meta_title      VARCHAR(60) NOT NULL,
  meta_description VARCHAR(155) NOT NULL,
  focus_keyword   VARCHAR(100),

  -- Trend data snapshot
  trend_keyword   VARCHAR(200),
  trend_score     INTEGER,
  angle           VARCHAR(200),                   -- which angle was used
  angle_index     INTEGER,                        -- 0-9

  -- Anti-duplication
  content_hash    VARCHAR(64) UNIQUE,             -- SHA256 of content

  word_count      INTEGER,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_tool ON articles(tool_id, status);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_keyword ON articles(focus_keyword);

-- ============================================================
-- ARTICLE ANGLES — track used angles per tool (30-day rule)
-- ============================================================
CREATE TABLE article_angles (
  id          SERIAL PRIMARY KEY,
  tool_id     INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  angle_index INTEGER NOT NULL,                   -- 0-9
  keyword     VARCHAR(200),
  used_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_angles_tool_used ON article_angles(tool_id, used_at DESC);

-- ============================================================
-- SITEMAP URLS — auto-managed for Google Indexing API
-- ============================================================
CREATE TABLE sitemap_urls (
  id              SERIAL PRIMARY KEY,
  url             VARCHAR(500) UNIQUE NOT NULL,
  page_type       VARCHAR(50) NOT NULL,           -- 'tool', 'article', 'category'
  priority        NUMERIC(2,1) DEFAULT 0.8,
  change_freq     VARCHAR(20) DEFAULT 'weekly',
  last_modified   TIMESTAMPTZ DEFAULT NOW(),
  indexed_at      TIMESTAMPTZ,                    -- when submitted to Google
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sitemap_type ON sitemap_urls(page_type);
CREATE INDEX idx_sitemap_indexed ON sitemap_urls(indexed_at);

-- ============================================================
-- TOOL USAGE — lightweight analytics (no PII)
-- ============================================================
CREATE TABLE tool_usage (
  id        BIGSERIAL PRIMARY KEY,
  tool_id   INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  used_date DATE DEFAULT CURRENT_DATE,
  count     INTEGER DEFAULT 1
);

CREATE UNIQUE INDEX idx_usage_tool_date ON tool_usage(tool_id, used_date);

-- ============================================================
-- CACHE METADATA — track in-DB cache invalidation timestamps
-- ============================================================
CREATE TABLE cache_meta (
  key         VARCHAR(200) PRIMARY KEY,
  invalidated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Upsert tool usage count
CREATE OR REPLACE FUNCTION increment_tool_usage(p_tool_id INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tool_usage(tool_id, used_date, count)
  VALUES (p_tool_id, CURRENT_DATE, 1)
  ON CONFLICT (tool_id, used_date)
  DO UPDATE SET count = tool_usage.count + 1;
END;
$$ LANGUAGE plpgsql;
