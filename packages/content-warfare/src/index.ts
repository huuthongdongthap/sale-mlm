/**
 * Content Warfare Engine
 * @module @droppii/content-warfare
 *
 * KingContent (Spy) + Sophia AI (Production) + Funnel OS (Conversion)
 */

export { runDailySpy, spyTrending, getTodayNiches } from './agents/spy-scout.js';
export { generateScripts } from './agents/script-writer.js';
export { dispatchAll, submitToKingContent, submitToSophia } from './agents/video-dispatch.js';
export type * from './types.js';
