/**
 * Ops scheduler — recurring maintenance without a heavyweight cron dep.
 *
 * Uses a single setInterval tick (minute granularity) with an in-process
 * job table: { name, minuteSpec, fn, lastRun }. Minute specs support
 * "every-N" via a star-slash-N spec string (e.g. star-slash-15),
 * specific minutes ("35"), and day-of-week gating via { dayOfWeek: 0-6 }.
 * Deliberately simpler than node-cron: we only need nightly analytics
 * capture, a weekly review, and a health check — KISS.
 */
const fs = require('fs');

const MINUTE = 60 * 1000;

class OpsScheduler {
  constructor(options = {}) {
    this.jobs = new Map();
    this.timer = null;
    this.statePath = options.statePath || null; // persists lastRun across restarts
    this.logger = options.logger || ((...a) => console.log('[scheduler]', ...a));
    if (this.statePath && fs.existsSync(this.statePath)) {
      try { this.lastRun = JSON.parse(fs.readFileSync(this.statePath, 'utf8')); }
      catch { this.lastRun = {}; }
    } else {
      this.lastRun = {};
    }
  }

  /**
   * @param {string} spec — star-slash-15 = every 15 min | "35" = minute 35
   * @param {object} opts — { dayOfWeek?: 0-6 (0=Sun), enabled?: boolean }
   */
  register(name, spec, fn, opts = {}) {
    if (this.jobs.has(name)) throw new Error(`Job already registered: ${name}`);
    const [minutes, interval] = String(spec).startsWith('*/')
      ? [null, parseInt(String(spec).slice(2), 10)]
      : [parseInt(String(spec), 10), null];
    if (interval != null && (!Number.isInteger(interval) || interval < 1)) {
      throw new Error(`Invalid interval spec: ${spec}`);
    }
    if (minutes != null && !(minutes >= 0 && minutes <= 59)) {
      throw new Error(`Invalid minute spec: ${spec}`);
    }
    this.jobs.set(name, { name, spec: String(spec), minutes, interval, fn, ...opts });
  }

  /** Test seam: evaluate whether a job should fire at a given time. */
  due(job, now) {
    if (job.enabled === false) return false;
    if (job.dayOfWeek != null && now.getDay() !== job.dayOfWeek) return false;
    const minuteKey = `${job.spec}@${now.toISOString().slice(0, 13)}`; // per-hour dedupe
    if (job.interval != null) {
      const last = this.lastRun[job.name] || 0;
      return now.getTime() - last >= job.interval * MINUTE;
    }
    // Fixed-minute jobs fire once per matching hour
    if (now.getMinutes() !== job.minutes) return false;
    if (job.dayOfWeek == null && this.lastRun[`${job.name}:${minuteKey}`]) return false;
    return true;
  }

  async runDue(now = new Date()) {
    const fired = [];
    for (const [name, job] of this.jobs) {
      if (!this.due(job, now)) continue;
      fired.push(name);
      try {
        await job.fn();
        this.logger(`job ok: ${name}`);
      } catch (err) {
        this.logger(`job failed: ${name}:`, err.message);
      }
      this.markRan(name, job, now);
    }
    this.persist();
    return fired;
  }

  markRan(name, job, now) {
    if (job.interval != null) {
      this.lastRun[name] = now.getTime();
    } else {
      this.lastRun[`${job.name}:${job.spec}@${now.toISOString().slice(0, 13)}`] = now.getTime();
      this.pruneHourKeys(now);
    }
  }

  pruneHourKeys(now) {
    const currentHourPrefix = now.toISOString().slice(0, 13);
    for (const key of Object.keys(this.lastRun)) {
      if (key.includes('@') && !key.includes(currentHourPrefix)) delete this.lastRun[key];
    }
  }

  persist() {
    if (!this.statePath) return;
    try { fs.writeFileSync(this.statePath, JSON.stringify(this.lastRun)); }
    catch { /* state persistence is best-effort */ }
  }

  start(intervalMs = MINUTE) {
    if (this.timer) return;
    this.timer = setInterval(() => { this.runDue().catch(() => {}); }, intervalMs);
    if (this.timer.unref) this.timer.unref();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

module.exports = { OpsScheduler };
