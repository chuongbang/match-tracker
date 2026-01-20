-- Migration: Update session_players schema to track wins/losses directly
-- Date: 2026-01-20
-- Description: Simplify tracking by storing wins/losses in session_players instead of computing from matches
-- Also add player_name for temporary players

-- Step 1: Add new columns (wins, losses, player_name) to session_players if they don't exist
ALTER TABLE session_players
ADD COLUMN IF NOT EXISTS wins INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS player_name VARCHAR(255);

-- Step 2: Drop old per_match_reward column if it exists (optional - comment out if you want to keep it)
ALTER TABLE session_players
DROP COLUMN IF EXISTS per_match_reward CASCADE;

-- Step 3: Recreate the player_session_stats VIEW with simplified logic and player_name support
DROP VIEW IF EXISTS player_session_stats CASCADE;

CREATE VIEW player_session_stats AS
SELECT
  sp.id,
  sp.session_id,
  sp.player_id,
  sp.fee,
  sp.wins,
  sp.losses,
  s.per_match_reward,
  COALESCE(p.name, sp.player_name, 'Unknown') AS player_name,
  sp.fee + (sp.wins - sp.losses) * s.per_match_reward AS total_payable,
  sp.created_at
FROM session_players sp
JOIN sessions s ON sp.session_id = s.id
LEFT JOIN players p ON sp.player_id = p.id
ORDER BY sp.created_at DESC;

-- Verification queries (uncomment to check results)
-- SELECT * FROM session_players LIMIT 5;
-- SELECT * FROM player_session_stats LIMIT 5;
