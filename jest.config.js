/**
 * Jest configuration for Droppii Training OS
 * Test all API endpoints with supertest, coverage ≥ 70%
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*-jest.test.js', '**/test/**/e2e-smoke.test.js'],
  testPathIgnorePatterns: [
    'test/auth.test.js',
    'test/members.test.js',
    'test/habits.test.js',
    'test/kpi.test.js',
    'test/kpi-simple.test.js',
    'test/members-table.test.js',
    'test/frontend/',
    'test/alerts-smoke.test.js',
    '.claude/worktrees/'
  ],
  collectCoverageFrom: [
    'src/api/**/*.js',
    'src/auth/**/*.js',
    'src/middleware/**/*.js',
    'src/models/**/*.js',
    'src/utils/**/*.js',
    '!src/dashboard/**',
    '!src/server.js',
    '!src/api/mock/**'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 60,
      lines: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 15000
};