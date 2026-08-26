/**
 * Mock PSN Health API endpoint for frontend development
 *
 * This mock generates realistic 9-state health data since T-005 (PSN health score) is blocked.
 *
 * States mapping (Cửu Địa - Sun Tzu's Nine Grounds):
 * 1. Tản Địa (Dispersive) - Low cohesion, scattered
 * 2. Khinh Địa (Light) - Easy territory, good conditions
 * 3. Tranh Địa (Contentious) - Competitive area, mixed results
 * 4. Giao Địa (Open) - Good connections, moderate growth
 * 5. Cù Địa (Focal) - Central hub, multiple partnerships
 * 6. Trọng Địa (Heavy) - Strong foundation, serious commitment
 * 7. Bì Địa (Bad) - Difficult terrain, needs support
 * 8. Vi Địa (Enclosed) - Limited options, urgent action needed
 * 9. Tử Địa (Death) - Critical situation, do or die
 *
 * Implementation lives in src/api/mock/psn-health/ (ESM sub-modules).
 * This file is a thin re-export barrel preserving the original public API.
 */
export { generateMockPSNHealth, generateTrajectory, handlePSNHealthRequest, mockPSNHealthData } from './psn-health/index.js';
