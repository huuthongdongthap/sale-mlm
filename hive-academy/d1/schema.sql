-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  level TEXT,
  phone TEXT,
  team_id TEXT,
  referrer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- habits (daily check-in)
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date DATE,
  habit_type TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- lessons
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  level TEXT,
  title TEXT,
  content TEXT,
  video_url TEXT,
  quiz_json TEXT,
  order_num INTEGER
);

-- progress
CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  lesson_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- points
CREATE TABLE IF NOT EXISTS points (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  points INTEGER,
  date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT,
  channel TEXT DEFAULT 'Chia sẻ kinh nghiệm',
  likes INTEGER DEFAULT 0,
  likes_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- alerts
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  level TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
