DROP TABLE IF EXISTS simulation_results;
CREATE TABLE simulation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coalition TEXT, -- JSON string of coalition party IDs
  cabinet TEXT, -- JSON string of ministry assignments
  selected_policies TEXT, -- JSON string of selected policy IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS game_sessions;
CREATE TABLE game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  pm_party TEXT NOT NULL,
  coalition TEXT NOT NULL,
  coalition_seats INTEGER NOT NULL,
  selected_policies TEXT NOT NULL,
  policy_count INTEGER NOT NULL,
  cabinet TEXT NOT NULL,
  chat_questions TEXT,
  chat_count INTEGER DEFAULT 0,
  score_total INTEGER,
  score_coalition INTEGER,
  score_diversity INTEGER,
  score_cabinet INTEGER,
  score_engagement INTEGER,
  grade TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
