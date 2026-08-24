/**
 * Learning engine tests — baseline math, simulated-data exclusion,
 * approval gating, recommendation state machine.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { LearningEngine, median } = require('../src/index');

function tmpDb() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'yco-')), 'ops.db');
}

function report(overrides = {}) {
  return {
    videoId: 'vid-' + Math.random().toString(36).slice(2, 8),
    publishedAt: '2026-08-20T00:00:00Z',
    windowHours: 24,
    metrics: { views: 1000, ctr: 0.05, retention: 0.5, watchMinutes: 400, engagementRate: 0.08 },
    attributes: { niche: 'health', hookStyle: 'question', titleStyle: 'listicle' },
    ...overrides,
  };
}

describe('median', () => {
  it('returns null for empty input and midpoint for even counts', () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe('LearningEngine.capture', () => {
  let engine;
  beforeEach(() => { engine = new LearningEngine(tmpDb()); });
  afterEach(() => engine.close());

  it('first snapshot has no baseline (no history) and low confidence', () => {
    const { snapshot } = engine.capture(report());
    expect(snapshot.baseline).toBeNull();
    expect(snapshot.deltas).toBeNull();
    expect(snapshot.confidence).toBe('low');
    expect(snapshot.simulated).toBe(false);
  });

  it('computes baseline from channel own history and clamps ratios', () => {
    engine.capture(report({ metrics: { views: 100, ctr: 1.5, retention: 0.4, watchMinutes: 40, engagementRate: 0.05 } }));
    const second = engine.capture(report({ metrics: { views: 200, ctr: 0.06, retention: 0.6, watchMinutes: 80, engagementRate: 0.07 } }));
    // Baseline views = median of [100] = 100; delta = (200-100)/100 = 1.0
    expect(second.snapshot.baseline.views).toBe(100);
    expect(second.snapshot.deltas.views).toBe(1);
    // CTR 1.5 was clamped to 1 at capture time, so baseline ctr is 1
    expect(second.snapshot.baseline.ctr).toBe(1);
  });

  it('excludes simulated snapshots from baselines and recommendations', () => {
    engine.capture(report()); // real, baseline seed
    const sim = engine.capture(report({ simulated: true }));
    expect(sim.snapshot.confidence).toBe('unverified');
    expect(sim.snapshot.baseline).toBeNull();
    expect(sim.recommendations).toHaveLength(0);

    // A later real snapshot must not see the simulated one in its baseline
    const third = engine.capture(report({ metrics: { views: 1000, ctr: 0.05, retention: 0.5, watchMinutes: 400, engagementRate: 0.08 } }));
    expect(third.snapshot.baseline.views).toBe(1000); // only the first real snapshot counted
  });

  it('flags unverified confidence when simulated regardless of history size', () => {
    for (let i = 0; i < 12; i++) engine.capture(report());
    const sim = engine.capture(report({ simulated: true }));
    expect(sim.snapshot.confidence).toBe('unverified');
  });

  it('persists and reloads snapshots across engine instances', () => {
    const dbPath = tmpDb();
    const e1 = new LearningEngine(dbPath);
    e1.capture(report({ videoId: 'persist-1' }));
    e1.close();

    const e2 = new LearningEngine(dbPath);
    const snap = e2.store.getSnapshot('persist-1');
    expect(snap.metrics.views).toBe(1000);
    expect(snap.attributes.niche).toBe('health');
    e2.close();
  });
});

describe('recommendation lifecycle', () => {
  let engine;
  beforeEach(() => { engine = new LearningEngine(tmpDb()); });
  afterEach(() => engine.close());

  function seedOutperformer() {
    // Seed 3 reliable snapshots to reach medium confidence
    for (let i = 0; i < 3; i++) {
      engine.capture(report({ metrics: { views: 500, ctr: 0.04, retention: 0.4, watchMinutes: 200, engagementRate: 0.05 } }));
    }
    // Outlier that beats every metric by ≥25%
    return engine.capture(report({
      videoId: 'star-video',
      metrics: { views: 1500, ctr: 0.08, retention: 0.7, watchMinutes: 600, engagementRate: 0.09 },
    }));
  }

  it('creates pending recommendations for ≥25% outperformance with medium+ confidence', () => {
    const { recommendations } = seedOutperformer();
    expect(recommendations.length).toBeGreaterThan(0);
    for (const rec of recommendations) {
      expect(rec.status).toBe('pending');
      expect(rec.kind).toBe('outperform');
      expect(rec.evidence.videoId).toBe('star-video');
      expect(rec.evidence.delta).toBeGreaterThanOrEqual(0.25);
    }
  });

  it('does not recommend below threshold or at low confidence', () => {
    engine.capture(report()); // history of 1 → low confidence
    const { recommendations } = engine.capture(report({
      metrics: { views: 9999, ctr: 0.9, retention: 0.9, watchMinutes: 9999, engagementRate: 0.9 },
    }));
    expect(recommendations).toHaveLength(0);
  });

  it('approve moves pending → approved; decided rows are not re-created', () => {
    const { recommendations } = seedOutperformer();
    const id = recommendations[0].id;
    const approved = engine.decide(id, 'approved', 'validated against niche data');
    expect(approved.status).toBe('approved');
    expect(approved.decisionNote).toBe('validated against niche data');

    // Re-capturing the same outperformer must not resurrect a decided row
    seedOutperformer();
    expect(engine.store.getRecommendation(id).status).toBe('approved');

    const learnings = engine.listApprovedLearnings();
    expect(learnings.some(l => l.id === id)).toBe(true);
  });

  it('reject works and decision requires pending status', () => {
    const { recommendations } = seedOutperformer();
    const id = recommendations[0].id;
    expect(engine.decide(id, 'rejected').status).toBe('rejected');
    expect(() => engine.decide(id, 'approved')).toThrow(/No pending/);
  });

  it('rejects invalid decision statuses', () => {
    const { recommendations } = seedOutperformer();
    expect(() => engine.decide(recommendations[0].id, 'maybe')).toThrow(/Invalid decision status/);
  });
});
