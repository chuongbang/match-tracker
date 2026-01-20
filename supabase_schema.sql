-- Supabase Schema for Match Tracker
-- Copy & paste into Supabase SQL Editor to set up

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  service_fee FLOAT DEFAULT 0,
  per_match_reward FLOAT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  fee FLOAT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player_a_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player_b_id UUID REFERENCES players(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES players(id),
  amount FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_matches_session ON matches(session_id);

-- Views for reporting
CREATE VIEW player_session_stats AS
SELECT
  sp.session_id,
  sp.player_id,
  p.name,
  sp.fee,
  s.per_match_reward,
  sp.wins,
  sp.losses,
  sp.fee + (sp.wins - sp.losses) * s.per_match_reward AS total_payable
FROM session_players sp
JOIN sessions s ON s.id = sp.session_id
JOIN players p ON p.id = sp.player_id;
