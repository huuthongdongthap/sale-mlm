/**
 * Performance snapshot store — SQLite persistence for the learning loop.
 *
 * better-sqlite3 v13 notes baked into this file: statements are prepared
 * fresh per call (a statement object may only be bound once), and reads use
 * .get()/.all() — there is no .first().
 */
const path = require('path');
const fs = require('fs');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT NOT NULL,
  published_at TEXT,
  window_hours INTEGER NOT NULL DEFAULT 24,
  captured_at TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  attributes_json TEXT NOT NULL,
  baseline_json TEXT,
  deltas_json TEXT,
  confidence TEXT NOT NULL DEFAULT 'unverified',
  simulated INTEGER NOT NULL DEFAULT 0,
  cost_vnd REAL,
  UNIQUE(video_id, window_hours)
);
CREATE INDEX IF NOT EXISTS idx_snapshots_window
  ON performance_snapshots(window_hours);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_at TEXT,
  decision_note TEXT
);
`;

class SnapshotStore {
  constructor(dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Lazy require so the module can be loaded in dry environments without the native dep.
    const Database = require('better-sqlite3');
    this.db = new Database(dbPath);
    this.db.exec(SCHEMA);
  }

  saveSnapshot(snap) {
    const stmt = this.db.prepare(`
      INSERT INTO performance_snapshots
        (video_id, published_at, window_hours, captured_at, metrics_json, attributes_json,
         baseline_json, deltas_json, confidence, simulated, cost_vnd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(video_id, window_hours) DO UPDATE SET
        metrics_json=excluded.metrics_json, baseline_json=excluded.baseline_json,
        deltas_json=excluded.deltas_json, confidence=excluded.confidence,
        captured_at=excluded.captured_at
    `);
    stmt.run(
      snap.videoId, snap.publishedAt || null, snap.windowHours || 24, snap.capturedAt,
      JSON.stringify(snap.metrics), JSON.stringify(snap.attributes),
      snap.baseline ? JSON.stringify(snap.baseline) : null,
      snap.deltas ? JSON.stringify(snap.deltas) : null,
      snap.confidence || 'unverified', snap.simulated ? 1 : 0, snap.costVND ?? null
    );
    return this.getSnapshot(snap.videoId, snap.windowHours || 24);
  }

  getSnapshot(videoId, windowHours = 24) {
    const row = this.db.prepare(
      'SELECT * FROM performance_snapshots WHERE video_id = ? AND window_hours = ?'
    ).get(videoId, windowHours);
    return row ? this.hydrate(row) : null;
  }

  /**
   * Prior reliable snapshots used as the channel's own-history baseline.
   * Simulated rows are never eligible — enforced here AND by callers.
   */
  listReliableSnapshots(windowHours = 24, excludeVideoId = null) {
    let sql = 'SELECT * FROM performance_snapshots WHERE simulated = 0 AND window_hours = ?';
    const params = [windowHours];
    if (excludeVideoId) { sql += ' AND video_id != ?'; params.push(excludeVideoId); }
    sql += ' ORDER BY captured_at ASC';
    return this.db.prepare(sql).all(...params).map(r => this.hydrate(r));
  }

  saveRecommendation(rec) {
    this.db.prepare(`
      INSERT INTO recommendations (id, created_at, kind, evidence_json, status)
      VALUES (?, ?, ?, ?, 'pending')
      ON CONFLICT(id) DO UPDATE SET evidence_json=excluded.evidence_json
      WHERE status = 'pending'
    `).run(rec.id, rec.createdAt, rec.kind, JSON.stringify(rec.evidence));
    return this.getRecommendation(rec.id);
  }

  getRecommendation(id) {
    const row = this.db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id);
    return row ? this.hydrateRec(row) : null;
  }

  decideRecommendation(id, status, note) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error(`Invalid decision status: ${status}`);
    }
    const info = this.db.prepare(`
      UPDATE recommendations SET status = ?, decided_at = ?, decision_note = ?
      WHERE id = ? AND status = 'pending'
    `).run(status, new Date().toISOString(), note || null, id);
    if (info.changes === 0) throw new Error(`No pending recommendation ${id}`);
    return this.getRecommendation(id);
  }

  listRecommendations(status = null) {
    const rows = status
      ? this.db.prepare('SELECT * FROM recommendations WHERE status = ? ORDER BY created_at').all(status)
      : this.db.prepare('SELECT * FROM recommendations ORDER BY created_at').all();
    return rows.map(r => this.hydrateRec(r));
  }

  hydrate(row) {
    return {
      videoId: row.video_id, publishedAt: row.published_at, windowHours: row.window_hours,
      capturedAt: row.captured_at, metrics: JSON.parse(row.metrics_json),
      attributes: JSON.parse(row.attributes_json),
      baseline: row.baseline_json ? JSON.parse(row.baseline_json) : null,
      deltas: row.deltas_json ? JSON.parse(row.deltas_json) : null,
      confidence: row.confidence, simulated: !!row.simulated, costVND: row.cost_vnd,
    };
  }

  hydrateRec(row) {
    return {
      id: row.id, createdAt: row.created_at, kind: row.kind,
      evidence: JSON.parse(row.evidence_json), status: row.status,
      decidedAt: row.decided_at, decisionNote: row.decision_note,
    };
  }

  close() { this.db.close(); }
}

module.exports = { SnapshotStore };
