-- Add paid status column to session_players table
ALTER TABLE session_players
ADD COLUMN paid BOOLEAN DEFAULT false;

-- Create index for paid status lookups
CREATE INDEX idx_session_players_paid ON session_players(session_id, paid);
