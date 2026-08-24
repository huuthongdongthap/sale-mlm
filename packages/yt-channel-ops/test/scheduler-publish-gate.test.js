/**
 * Scheduler + publish gate tests — cron-like due logic, single-use
 * approval tokens, expiry, videoId binding.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { OpsScheduler, PublishGate } = require('../src/index');

function tmpFile(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'yco-')), name);
}

describe('OpsScheduler', () => {
  it('fires fixed-minute jobs once per matching hour', async () => {
    const sched = new OpsScheduler();
    let runs = 0;
    sched.register('nightly', '35', () => { runs++; });

    const at35 = new Date('2026-08-24T09:35:00Z');
    expect(await sched.runDue(at35)).toEqual(['nightly']);
    // Same hour again → no refire
    expect(await sched.runDue(new Date('2026-08-24T09:36:00Z'))).toEqual([]);
    expect(runs).toBe(1);
    // Next hour at :35 → fires again
    expect(await sched.runDue(new Date('2026-08-24T10:35:00Z'))).toEqual(['nightly']);
    expect(runs).toBe(2);
  });

  it('interval jobs fire only after the interval elapses', async () => {
    const sched = new OpsScheduler();
    let runs = 0;
    sched.register('queue', '*/15', () => { runs++; });

    const t0 = new Date('2026-08-24T09:00:00Z');
    expect(await sched.runDue(t0)).toEqual(['queue']);
    expect(await sched.runDue(new Date(t0.getTime() + 10 * 60000))).toEqual([]);
    expect(await sched.runDue(new Date(t0.getTime() + 15 * 60000))).toEqual(['queue']);
    expect(runs).toBe(2);
  });

  it('respects dayOfWeek gating and enabled=false', async () => {
    const sched = new OpsScheduler();
    let weekly = 0, disabled = 0;
    // 2026-08-23 is a Sunday
    sched.register('weekly-review', '30', () => { weekly++; }, { dayOfWeek: 0 });
    sched.register('off', '30', () => { disabled++; }, { enabled: false });

    const sunday = new Date('2026-08-23T09:30:00Z');
    expect(sunday.getDay()).toBe(0);
    const fired = await sched.runDue(sunday);
    expect(fired).toEqual(['weekly-review']);
    expect(weekly).toBe(1);
    expect(disabled).toBe(0);

    // Monday → nothing
    expect(await sched.runDue(new Date('2026-08-24T09:30:00Z'))).toEqual([]);
  });

  it('continues past a failing job and records state', async () => {
    const statePath = tmpFile('sched-state.json');
    const logs = [];
    const sched = new OpsScheduler({ statePath, logger: (...a) => logs.push(a.join(' ')) });
    sched.register('bad', '10', () => { throw new Error('boom'); });
    sched.register('good', '10', () => 'ok');

    const fired = await sched.runDue(new Date('2026-08-24T09:10:00Z'));
    expect(fired).toEqual(['bad', 'good']);
    expect(logs.some(l => l.includes('job failed: bad'))).toBe(true);

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    expect(Object.keys(persisted).length).toBeGreaterThan(0);
  });

  it('rejects duplicate names and invalid specs', () => {
    const sched = new OpsScheduler();
    sched.register('x', '5', () => {});
    expect(() => sched.register('x', '6', () => {})).toThrow(/already registered/);
    expect(() => sched.register('y', '*/0', () => {})).toThrow(/Invalid/);
    expect(() => sched.register('z', '99', () => {})).toThrow(/Invalid/);
  });
});

describe('PublishGate', () => {
  let gate, storePath;
  beforeEach(() => { storePath = tmpFile('publish-tokens.json'); gate = new PublishGate(storePath); });

  it('mints token only with a substantive note (who + why)', () => {
    expect(() => gate.approve('vid-1', 'ok')).toThrow(/at least 10 characters/);
    const token = gate.approve('vid-1', 'approved by Thong after factual review');
    expect(token).toMatch(/^pub_[0-9a-f]{32}$/);
  });

  it('consumes single-use token bound to its videoId', () => {
    const token = gate.approve('vid-1', 'approved by Thong after factual review');
    const rec = gate.consume(token, 'vid-1');
    expect(rec.videoId).toBe('vid-1');
    expect(gate.check(token, 'vid-1')).toBe(false); // now used

    expect(() => gate.consume(token, 'vid-1')).toThrow(/already used/);
    expect(() => gate.consume(token, 'vid-2')).toThrow(/different video/);
  });

  it('rejects unknown tokens outright', () => {
    expect(() => gate.consume('pub_nope', 'vid-1')).toThrow(/unknown token/);
  });

  it('tokens persist across instances', () => {
    const token = gate.approve('vid-persist', 'approved by Thong after factual review');
    const reloaded = new PublishGate(storePath);
    expect(reloaded.check(token, 'vid-persist')).toBe(true);
    expect(reloaded.consume(token, 'vid-persist').note).toContain('Thong');
  });
});
