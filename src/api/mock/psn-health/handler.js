/**
 * Mock PSN Health API — request handler
 */
const { generateMockPSNHealth } = require('./states');

// Mock API endpoint handler
function handlePSNHealthRequest(request) {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockPSNHealth();
      resolve({
        status: 200,
        data: data
      });
    }, Math.random() * 500 + 100); // 100-600ms delay
  });
}

module.exports = { handlePSNHealthRequest };