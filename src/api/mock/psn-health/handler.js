/**
 * Mock PSN Health API — request handler
 */
import { generateMockPSNHealth } from './states.js';

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

export { handlePSNHealthRequest };