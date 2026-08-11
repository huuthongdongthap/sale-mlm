#!/usr/bin/env node
/**
 * kanban.js — Thin CLI để CTO + workers tương tác với .mekong/tasks.json.
 * Không phụ thuộc thư viện ngoài (node core only).
 *
 * Usage:
 *   node bin/kanban.js list [--verbose] [--epic E5-content]
 *   node bin/kanban.js ready                     # liệt kê task đã unlock
 *   node bin/kanban.js get T-001                 # in 1 task dạng JSON
 *   node bin/kanban.js update T-001 in_progress <worker>
 *   node bin/kanban.js comment T-001 "msg"
 *   node bin/kanban.js lock T-001 "src/a.js,src/b.js"
 *   node bin/kanban.js unlock T-001
 *   node bin/kanban.js summary                   # 1-liner progress
 */

const fs = require('fs');
const path = require('path');

const TASKS_PATH = path.resolve(__dirname, '..', '.mekong', 'tasks.json');
const STATUS_ICON = { todo: '·', in_progress: '⟳', review: '◇', done: '✓', blocked: '✗' };
const STATUS_COLUMNS = ['todo', 'in_progress', 'review', 'done', 'blocked'];

function load() {
  const raw = fs.readFileSync(TASKS_PATH, 'utf8');
  return JSON.parse(raw);
}
function save(db) {
  db.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(TASKS_PATH, JSON.stringify(db, null, 2) + '\n');
}
function ts() { return new Date().toISOString(); }
function findTask(db, id) {
  const t = db.tasks.find(x => x.id === id);
  if (!t) {
    console.error(`Task ${id} not found.`);
    process.exit(2);
  }
  return t;
}
function isReady(task, db) {
  if (task.status !== 'todo') return false;
  const map = new Map(db.tasks.map(t => [t.id, t.status]));
  return (task.blockedBy || []).every(dep => map.get(dep) === 'done');
}
function hasLockConflict(db, paths) {
  const wanted = new Set(paths);
  for (const ev of db.events || []) {
    if (ev.kind !== 'lock') continue;
    if (ev.released) continue;
    for (const p of ev.paths) if (wanted.has(p)) return ev;
  }
  return null;
}

const cmd = process.argv[2];
const args = process.argv.slice(3);

switch (cmd) {
  case 'list': {
    const db = load();
    const verbose = args.includes('--verbose');
    const epicFlag = args.indexOf('--epic');
    const epic = epicFlag >= 0 ? args[epicFlag + 1] : null;

    const buckets = {};
    for (const col of STATUS_COLUMNS) buckets[col] = [];
    for (const t of db.tasks) {
      if (epic && t.epic !== epic) continue;
      buckets[t.status].push(t);
    }

    for (const col of STATUS_COLUMNS) {
      const rows = buckets[col];
      if (!rows.length) continue;
      console.log(`\n  ${STATUS_ICON[col]} ${col.toUpperCase()} (${rows.length})`);
      for (const t of rows) {
        const ready = col === 'todo' && isReady(t, db) ? ' [READY]' : '';
        const worker = t._worker_claim ? ` <${t._worker_claim}>` : '';
        console.log(`    ${t.id}  ${t.title}${ready}${worker}`);
        if (verbose) {
          console.log(`           epic=${t.epic}  est=${t.estimate_min}m  blockedBy=[${(t.blockedBy || []).join(', ')}]`);
        }
      }
    }

    const total = db.tasks.length;
    const done = db.tasks.filter(t => t.status === 'done').length;
    const ready = db.tasks.filter(t => isReady(t, db)).length;
    console.log(`\n  Σ  ${done}/${total} done   |   ready-next: ${ready}   |   project=${db.project}\n`);
    break;
  }

  case 'ready': {
    const db = load();
    const rows = db.tasks.filter(t => isReady(t, db));
    for (const t of rows) console.log(`${t.id}\t${t.worker}\t${t.title}`);
    break;
  }

  case 'get': {
    const db = load();
    const t = findTask(db, args[0]);
    console.log(JSON.stringify(t, null, 2));
    break;
  }

  case 'update': {
    const db = load();
    const [id, status, worker] = args;
    if (!STATUS_COLUMNS.includes(status)) {
      console.error(`Unknown status ${status}. Allowed: ${STATUS_COLUMNS.join(', ')}`);
      process.exit(2);
    }
    const t = findTask(db, id);
    const from = t.status;
    t.status = status;
    if (worker) t._worker_claim = worker;
    if (status === 'done') delete t._worker_claim;
    db.events = db.events || [];
    db.events.push({ ts: ts(), kind: 'status', task: id, from, to: status, actor: worker || 'cto' });
    save(db);
    console.log(`${id}: ${from} → ${status}${worker ? ' by ' + worker : ''}`);
    break;
  }

  case 'comment': {
    const db = load();
    const [id, ...rest] = args;
    const msg = rest.join(' ');
    const t = findTask(db, id);
    t.notes = (t.notes ? t.notes + '\n' : '') + `[${ts()}] ${msg}`;
    db.events = db.events || [];
    db.events.push({ ts: ts(), kind: 'comment', task: id, msg });
    save(db);
    console.log(`commented on ${id}`);
    break;
  }

  case 'lock': {
    const db = load();
    const [id, pathsCsv] = args;
    const paths = pathsCsv.split(',').map(s => s.trim()).filter(Boolean);
    const existing = hasLockConflict(db, paths);
    if (existing) {
      console.error(`LOCK CONFLICT: task ${existing.task} already locks ${existing.paths.join(', ')}`);
      process.exit(3);
    }
    db.events = db.events || [];
    db.events.push({ ts: ts(), kind: 'lock', task: id, paths });
    save(db);
    console.log(`locked ${paths.length} paths for ${id}`);
    break;
  }

  case 'unlock': {
    const db = load();
    const [id] = args;
    let n = 0;
    for (const ev of db.events || []) {
      if (ev.kind === 'lock' && ev.task === id && !ev.released) {
        ev.released = ts();
        n++;
      }
    }
    save(db);
    console.log(`unlocked ${n} lock(s) for ${id}`);
    break;
  }

  case 'summary': {
    const db = load();
    const by = Object.fromEntries(STATUS_COLUMNS.map(c => [c, 0]));
    for (const t of db.tasks) by[t.status]++;
    const parts = STATUS_COLUMNS.map(c => `${c}:${by[c]}`);
    console.log(parts.join(' | ') + ` | Σ ${db.tasks.length}`);
    break;
  }

  default:
    console.error('Usage: kanban.js <list|ready|get|update|comment|lock|unlock|summary> [args]');
    process.exit(1);
}
