/**
 * yt-channel-ops — post-publish YouTube channel operations.
 * Public surface:
 * - LearningEngine: performance learning loop with approval gates
 * - OpsScheduler: minute-tick recurring jobs (analytics capture, reviews)
 * - PublishGate: single-use upload approval tokens for yt-shorts-pipeline
 */
const { LearningEngine, median, METRIC_KEYS } = require('./learning/engine');
const { SnapshotStore } = require('./learning/store');
const { OpsScheduler } = require('./scheduler');
const { PublishGate } = require('./publish-gate');

module.exports = { LearningEngine, SnapshotStore, median, METRIC_KEYS, OpsScheduler, PublishGate };
