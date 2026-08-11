# Hive Academy Web - SPEC.md

## 1. PROJECT OVERVIEW

**Project Name:** Hive Academy  
**Type:** Web Application (Training & Habit Management System)  
**Tech Stack:** Next.js 14 + Cloudflare (Workers, D1, KV, Pages)

## 2. CORE FEATURES

### 2.1 Check-in Module
- 6 habits/ngày tracking (5AM, SP, Connect, Close, Review, Bonus)
- Zoom 1 bam integration
- Streak counter
- Activity status (active/inactive trong 24h)

### 2.2 Learning Module
- Bài học theo cấp (Khám phá → Tân Binh → Chiến Binh → Chỉ Huy → Tướng Quân)
- Video + Quiz per bài
- Progress tracking
- "Hôm nay học gì" - clear path

### 2.3 Community Module
- Feed chia sẻ thành tựu
- Chuyên môn channels riêng
- Q&A / hỏi đáp

### 2.4 Dashboard & Management
- Leader dashboard: all members in 1 view
- Auto alerts (3 cấp: Xanh, Vàng, Đỏ)
- Auto reports (tuần)
- Data analytics

### 2.5 Gamification
- Points system (+3 check-in, +5 bài học, +20 chốt đơn...)
- 9 levels
- Leaderboards (tuần/tháng/năm)

## 3. USER ROLES

| Role | Level | Access |
|------|-------|--------|
| CTV | Khám phá (7 ngày) | Basic check-in |
| Đại lý | Tân Binh (28 ngày) | + Learning |
| Coach 1S | Chiến Binh (8 tuần) | + Recruit |
| Coach 2-3S | Chỉ Huy (8-12 tuần) | + Campaign |
| Mentor | Tướng Quân | Full admin |

## 4. TECH ARCHITECTURE (Cloudflare)

```
┌─────────────────────────────────────┐
│         Cloudflare Pages              │
│         (Frontend - Next.js)        │
└─────────────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼             ▼
┌───────────┐   ┌───────────┐
│  D1 DB   │   │   KV      │
│ (SQLite)  │   │ (Cache)  │
└───────────┘   └───────────┘
        │
┌───────────┐
│ Workers   │
│ (API)     │
└───────────┘
```

### Database Schema (D1)

```sql
-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  level TEXT,
  phone TEXT,
  team_id TEXT,
  referrer_id TEXT,
  created_at DATETIME
);

-- habits (daily check-in)
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date DATE,
  habit_type TEXT,
  completed BOOLEAN,
  completed_at DATETIME
);

-- lessons
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  level TEXT,
  title TEXT,
  content TEXT,
  video_url TEXT,
  quiz_json TEXT,
  order_num INTEGER
);

-- progress
CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  lesson_id TEXT,
  completed BOOLEAN,
  score INTEGER,
  completed_at DATETIME
);

-- points
CREATE TABLE points (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  points INTEGER,
  date DATE
);

-- posts
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT,
  likes INTEGER,
  created_at DATETIME
);

-- alerts
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  level TEXT,
  reason TEXT,
  created_at DATETIME,
  resolved_at DATETIME
);
```

## 5. API ENDPOINTS

### Auth
- `POST /api/auth/login` - Phone + password
- `POST /api/auth/register` - Sign up

### Users
- `GET /api/users` - List team members
- `GET /api/users/:id` - User profile

### Habits
- `GET /api/habits/today` - Today's habits
- `POST /api/habits/checkin` - Check-in habit

### Learning
- `GET /api/lessons` - List lessons by level
- `GET /api/lessons/:id` - Lesson detail
- `POST /api/progress/complete` - Mark complete

### Community
- `GET /api/posts` - Feed posts
- `POST /api/posts` - Create post

### Dashboard
- `GET /api/dashboard` - Leader dashboard
- `GET /api/alerts` - Alert list

### Gamification
- `GET /api/points` - Points history
- `GET /api/leaderboard` - Rankings

## 6. UI/UX DESIGN

### Color Palette
```css
--primary: #004CE3;      /* Xanh dương */
--secondary: #FFC734;    /* Vàng */
--success: #57d697;      /* Xanh lá */
--warning: #ba7517;      /* Vàng cam */
--danger: #d7263d;       /* Đỏ */
--gray: #999;
--light: #f8f9fa;
```

### Pages
1. `/` - Landing (public)
2. `/login` - Login
3. `/dashboard` - Main dashboard
4. `/checkin` - Daily check-in
5. `/learn` - Learning path
6. `/community` - Community feed
7. `/profile` - User profile
8. `/admin` - Admin panel (Leader only)

## 7. MILESTONES

### Phase 1: MVP (2-4 tuần)
- [ ] Auth + basic user profile
- [ ] Check-in 6 habits
- [ ] Basic Dashboard
- [ ] 20 TV pilot

### Phase 2: Enhanced (2-4 tuần)
- [ ] Gamification
- [ ] Quiz system
- [ ] Auto alerts
- [ ] Reports

### Phase 3: Scale (4-8 tuần)
- [ ] 50-100 TV
- [ ] DISC integration
- [ ] Campaign tools
- [ ] Certificates

### Phase 4: Expand (4-12 tuần)
- [ ] License to other teams
- [ ] 5+ teams
- [ ] Mobile app

## 8. BUDGET

| Phase | Cost | Notes |
|-------|------|-------|
| MVP | ~500k VND | Domain, free tier |
| Phase 2 | ~0 | Free tier |
| Phase 3 | ~600k/month | DB upgrade |
| Phase 4 | TBD | License fees |