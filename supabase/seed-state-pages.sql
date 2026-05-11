-- ─── seed-state-pages.sql ────────────────────────────────────────────────────
-- Creates 70 state-specific pages: 7 tools × 10 priority states
-- Run AFTER seed-categories.sql and after tools have been seeded.
--
-- Adjust tool slugs in the WHERE clause if your actual slugs differ.
-- Tool slugs targeted:
--   Legal Documents  : lease-agreement, eviction-notice,
--                      non-compete-agreement, llc-operating-agreement
--   Real Estate      : lease-agreement (RE), eviction-notice (RE),
--                      property-management-agreement
--
-- The (tool_id, state_code) unique constraint must exist.
-- If it does not, run the ALTER TABLE below first.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 0. Ensure unique constraint ───────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'uq_state_pages_tool_state'
  ) THEN
    ALTER TABLE state_pages
      ADD CONSTRAINT uq_state_pages_tool_state
      UNIQUE (tool_id, state_code);
  END IF;
END $$;

-- ── 1. Build state values CTE ─────────────────────────────────────────────────

WITH priority_states (state_code, state_name) AS (
  VALUES
    ('CA', 'California'),
    ('TX', 'Texas'),
    ('FL', 'Florida'),
    ('NY', 'New York'),
    ('PA', 'Pennsylvania'),
    ('IL', 'Illinois'),
    ('OH', 'Ohio'),
    ('GA', 'Georgia'),
    ('NC', 'North Carolina'),
    ('MI', 'Michigan')
),

-- ── 2. Target tools ───────────────────────────────────────────────────────────
-- Matches by slug. Both "lease-agreement" in legal-documents AND real-estate
-- will be included because we join on slug only (not category).

target_tools AS (
  SELECT t.id, t.name, t.slug
    FROM tools t
   WHERE t.slug IN (
     'lease-agreement',
     'eviction-notice',
     'non-compete-agreement',
     'llc-operating-agreement',
     'property-management-agreement'
   )
     AND t.is_active = true
)

-- ── 3. Insert (skip duplicates) ───────────────────────────────────────────────

INSERT INTO state_pages (
  tool_id,
  state_code,
  state_name,
  content,
  meta_title,
  meta_description,
  is_active,
  created_at,
  updated_at
)
SELECT
  tt.id                                                              AS tool_id,
  ps.state_code,
  ps.state_name,
  NULL                                                               AS content,
  'Free ' || tt.name || ' for ' || ps.state_name
    || ' — AI Powered | AI Free Tools'                              AS meta_title,
  'Generate a free '
    || LOWER(tt.name)
    || ' specific to '
    || ps.state_name
    || ' in seconds. AI-powered, state law compliant. No sign up required.'
                                                                    AS meta_description,
  true                                                               AS is_active,
  NOW()                                                              AS created_at,
  NOW()                                                              AS updated_at
FROM target_tools tt
CROSS JOIN priority_states ps
ON CONFLICT (tool_id, state_code)
DO UPDATE SET
  meta_title       = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at       = NOW();

-- ── 4. Verify ─────────────────────────────────────────────────────────────────

SELECT
  c.name                       AS category,
  t.name                       AS tool,
  t.slug                       AS tool_slug,
  sp.state_name,
  sp.state_code,
  sp.meta_title
FROM state_pages sp
JOIN tools     t ON t.id = sp.tool_id
JOIN categories c ON c.id = t.category_id
WHERE sp.is_active = true
ORDER BY c.name, t.name, sp.state_name;
