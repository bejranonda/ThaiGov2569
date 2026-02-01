DROP TABLE IF EXISTS simulation_results;
CREATE TABLE simulation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coalition TEXT, -- JSON string of coalition party IDs
  cabinet TEXT, -- JSON string of ministry assignments
  selected_policies TEXT, -- JSON string of selected policy IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
