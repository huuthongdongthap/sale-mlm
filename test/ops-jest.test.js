/**
 * T-018: Jest test suite for monitoring + onboarding + training ops
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { monitoring, errorMiddleware, notFoundMiddleware, getHealthStatus } = require('../src/utils/monitoring');
const { startOnboarding, advanceDay, recordHabitScore, recordOrder, generateNudge, getProgress, checkGraduation, WEEKS } = require('../src/agents/onboardingBot');
const { assignCurriculum, updateProgress, getProgress: getTrainingProgress, getActiveTrainees, getTraineesNeedingAttention, CURRICULUM } = require('../src/agents/trainingOps');

process.env.JWT_SECRET = 'test-secret';

describe('T-018: Monitoring', () => {
  test('captureException', () => {
    const err = new Error('Test error');
    const id = monitoring.captureException(err, { test: true });
    expect(id).toBeTruthy();
  });

  test('captureMessage', () => {
    const id = monitoring.captureMessage('Test message', 'info', { test: true });
    expect(id).toBeTruthy();
  });

  test('getErrorLog', () => {
    const logs = monitoring.getErrorLog(10);
    expect(Array.isArray(logs)).toBe(true);
  });

  test('getErrorSummary', () => {
    const summary = monitoring.getErrorSummary();
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('errors');
    expect(summary).toHaveProperty('byLevel');
  });

  test('getHealthStatus', () => {
    const health = getHealthStatus();
    expect(health.status).toBe('healthy');
    expect(health.subsystems).toHaveProperty('api');
    expect(health.subsystems).toHaveProperty('database');
  });

  test('notFoundMiddleware', () => {
    const req = { originalUrl: '/test', method: 'GET' };
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    notFoundMiddleware(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('T-018: Onboarding Bot', () => {
  test('start onboarding', () => {
    const session = startOnboarding('test-onboard-1', { name: 'Test', tier: 1, phone: '+84901' });
    expect(session.memberId).toBe('test-onboard-1');
    expect(session.currentWeek).toBe(1);
    expect(session.currentDay).toBe(1);
  });

  test('advance day', () => {
    startOnboarding('test-advance-1', { name: 'Test', tier: 1 });
    const result = advanceDay('test-advance-1');
    expect(result.currentDay).toBe(2);
  });

  test('record habit score', () => {
    startOnboarding('test-habit-1', { name: 'Test', tier: 1 });
    const result = recordHabitScore('test-habit-1', 5);
    expect(result.success).toBe(true);
  });

  test('record order', () => {
    startOnboarding('test-order-1', { name: 'Test', tier: 1 });
    const result = recordOrder('test-order-1');
    expect(result.success).toBe(true);
    expect(result.orders).toBe(1);
  });

  test('generate nudge', () => {
    startOnboarding('test-nudge-1', { name: 'Test', tier: 1, phone: '+84901' });
    const nudge = generateNudge('test-nudge-1');
    expect(nudge.type).toBe('onboarding_nudge');
    expect(nudge.week).toBe(1);
  });

  test('get progress', () => {
    startOnboarding('test-progress-1', { name: 'Test', tier: 1 });
    const progress = getProgress('test-progress-1');
    expect(progress.memberId).toBe('test-progress-1');
    expect(progress).toHaveProperty('progress_percent');
  });

  test('WEEKS config has 4 weeks', () => {
    expect(Object.keys(WEEKS).length).toBe(4);
    expect(WEEKS[1].module).toBe('M1');
    expect(WEEKS[4].module).toBe('M4');
  });

  test('check graduation — not ready', () => {
    startOnboarding('test-grad-1', { name: 'Test', tier: 1 });
    const ready = checkGraduation({ habitScores: [], orders: 0 });
    expect(ready).toBe(false);
  });
});

describe('T-018: Training Ops', () => {
  test('assign curriculum', () => {
    const record = assignCurriculum('test-train-1', { name: 'Test', tier: 1 });
    expect(record.memberId).toBe('test-train-1');
    expect(record.tier).toBe(1);
    expect(record.curriculum_name).toBe(CURRICULUM[1].name);
  });

  test('update progress — day_complete', () => {
    assignCurriculum('test-progress-1', { name: 'Test', tier: 1 });
    const result = updateProgress('test-progress-1', { type: 'day_complete' });
    expect(result.success).toBe(true);
  });

  test('update progress — habit_score', () => {
    assignCurriculum('test-habit-2', { name: 'Test', tier: 1 });
    const result = updateProgress('test-habit-2', { type: 'habit_score', value: 5 });
    expect(result.success).toBe(true);
  });

  test('update progress — order', () => {
    assignCurriculum('test-order-2', { name: 'Test', tier: 1 });
    const result = updateProgress('test-order-2', { type: 'order' });
    expect(result.success).toBe(true);
  });

  test('get training progress', () => {
    assignCurriculum('test-train-progress', { name: 'Test', tier: 1 });
    const progress = getTrainingProgress('test-train-progress');
    expect(progress.memberId).toBe('test-train-progress');
    expect(progress).toHaveProperty('progress_percent');
  });

  test('get active trainees', () => {
    assignCurriculum('test-active-1', { name: 'Test 1', tier: 1 });
    const trainees = getActiveTrainees();
    expect(Array.isArray(trainees)).toBe(true);
  });

  test('get trainees needing attention', () => {
    const attention = getTraineesNeedingAttention();
    expect(Array.isArray(attention)).toBe(true);
  });

  test('CURRICULUM has 3 tiers', () => {
    expect(Object.keys(CURRICULUM).length).toBe(3);
    expect(CURRICULUM[1].modules.length).toBe(4);
  });
});

describe('T-018: API — monitoring + onboarding + training', () => {
  // Note: API routes are tested in e2e-smoke.test.js
  // Here we just verify the modules export correctly

  test('monitoring exports', () => {
    expect(monitoring.captureException).toBeDefined();
    expect(monitoring.captureMessage).toBeDefined();
    expect(monitoring.getErrorLog).toBeDefined();
    expect(monitoring.getErrorSummary).toBeDefined();
  });

  test('errorMiddleware exists', () => {
    expect(errorMiddleware).toBeDefined();
    expect(typeof errorMiddleware).toBe('function');
  });

  test('getHealthStatus returns valid object', () => {
    const health = getHealthStatus();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('subsystems');
  });
});
