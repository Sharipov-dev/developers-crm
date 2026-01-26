-- =============================================================================
-- PostgreSQL Initialization Script
-- =============================================================================
-- This script runs automatically on first database initialization.
-- It sets up extensions and basic configuration.
-- =============================================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity (for search)
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN index support

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Database initialized successfully with extensions: uuid-ossp, pg_trgm, btree_gin';
END $$;
