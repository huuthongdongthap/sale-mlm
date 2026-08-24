/**
 * Channel learning engine — captures performance snapshots against the
 * channel's own history, scores deltas, and proposes pending
 * recommendations that require explicit operator approval before they can
 * influence anything downstream.
 *
 * Design adapted from darkzOGx/youtube-automation-agent (MIT):
 * - Simulated analytics are stored but flagged; they never enter baselines
 *   or recommendations and are never eligible for learning.
 * - Baseline = median of prior reliable same-window snapshots, not a
 *   universal view-count target.
 */
const { SnapshotStore } = require('./store');

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const METRIC_KEYS = ['views', 'ctr', 'retention', 'watchMinutes', 'engagementRate'];

class LearningEngine {
  constructor(dbPath) {
    this.store = new SnapshotStore(dbPath);
  }

  /**
   * @param {object} report — { videoId, publishedAt?, windowHours?, capturedAt?,
   *   metrics: {views, ctr, retention, watchMinutes, engagementRate},
   *   attributes: {niche, hookStyle, titleStyle, durationSec, surface?},
   *   simulated?: boolean, costVND? }
   */
  capture(report) {
    const windowHours = report.windowHours || 24;
    const snapshot = {
      videoId: report.videoId,
      publishedAt: report.publishedAt || null,
      windowHours,
      capturedAt: report.capturedAt || new Date().toISOString(),
      metrics: this.normalizeMetrics(report.metrics),
      attributes: report.attributes || {},
      simulated: !!report.simulated,
      costVND: report.costVND ?? null,
    };

    // Simulated data is persisted as unverified evidence and excluded from
    // everything downstream — mirroring "simulated analytics never learn".
    if (!snapshot.simulated) {
      const prior = this.store.listReliableSnapshots(windowHours, report.videoId);
      snapshot.baseline = this.calculateBaseline(prior);
      snapshot.deltas = this.calculateDeltas(snapshot.metrics, snapshot.baseline);
      snapshot.confidence = this.confidenceFor(prior.length);
    } else {
      snapshot.baseline = null;
      snapshot.deltas = null;
      snapshot.confidence = 'unverified';
    }

    const saved = this.store.saveSnapshot(snapshot);
    const recommendations = snapshot.simulated ? [] : this.refreshRecommendations(windowHours);
    return { snapshot: saved, recommendations };
  }

  normalizeMetrics(raw = {}) {
    const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    return {
      views: num(raw.views),
      // CTR/retention/engagement are ratios clamped to [0,1]; upstream feeds percent sometimes.
      ctr: Math.min(Math.max(num(raw.ctr), 0), 1),
      retention: Math.min(Math.max(num(raw.retention), 0), 1),
      watchMinutes: num(raw.watchMinutes),
      engagementRate: Math.min(Math.max(num(raw.engagementRate), 0), 1),
    };
  }

  calculateBaseline(priorSnapshots) {
    // No channel history yet → no baseline at all (not an all-null object),
    // so downstream delta scoring stays disabled until evidence exists.
    if (!priorSnapshots.length) return null;
    const baseline = {};
    for (const key of METRIC_KEYS) {
      baseline[key] = median(priorSnapshots.map(s => s.metrics[key]).filter(v => v != null));
    }
    return baseline;
  }

  calculateDeltas(metrics, baseline) {
    if (!baseline) return null;
    const deltas = {};
    for (const key of METRIC_KEYS) {
      const base = baseline[key];
      deltas[key] = base == null || base === 0
        ? null
        : Number(((metrics[key] - base) / base).toFixed(4));
    }
    return deltas;
  }

  /** Confidence grows with the size of the channel's own history. */
  confidenceFor(sampleCount) {
    if (sampleCount < 3) return 'low';
    if (sampleCount < 10) return 'medium';
    return 'high';
  }

  /**
   * Propose a recommendation when a metric beats its baseline by ≥25% with
   * medium+ confidence. Recommendations are always created pending — they
   * cannot guide planning until decideRecommendation() approves them.
   */
  refreshRecommendations(windowHours) {
    const created = [];
    const latest = this.latestSnapshot(windowHours);
    if (!latest || !latest.deltas || latest.confidence === 'low') return created;

    for (const [key, delta] of Object.entries(latest.deltas)) {
      if (delta == null || delta < 0.25) continue;
      const id = `outperform:${latest.videoId}:${windowHours}h:${key}`;
      const existing = this.store.getRecommendation(id);
      if (existing && existing.status !== 'pending') continue;
      const rec = this.store.saveRecommendation({
        id,
        createdAt: new Date().toISOString(),
        kind: 'outperform',
        evidence: {
          videoId: latest.videoId,
          windowHours,
          metric: key,
          delta,
          confidence: latest.confidence,
          attributes: latest.attributes,
        },
      });
      if (rec.status === 'pending') created.push(rec);
    }
    return created.filter(Boolean);
  }

  latestSnapshot(windowHours = 24) {
    const all = this.store.listReliableSnapshots(windowHours);
    return all.length ? all[all.length - 1] : null;
  }

  /** Explicit human decision — the only path from pending to actionable. */
  decide(id, status, note) {
    return this.store.decideRecommendation(id, status, note);
  }

  listApprovedLearnings(kind = null) {
    return this.store.listRecommendations('approved')
      .filter(r => !kind || r.kind === kind)
      .map(r => ({ ...r, evidence: r.evidence }));
  }

  close() { this.store.close(); }
}

module.exports = { LearningEngine, median, METRIC_KEYS };
