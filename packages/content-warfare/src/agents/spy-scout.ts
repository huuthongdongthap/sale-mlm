/**
 * Spy Scout Agent
 * Scrapes KingContent trending & ranking data for target niches.
 * Outputs: Top 5 trending topics per niche for Script Writer.
 */

import type { Niche, TrendingTopic, SpyResult } from '../types.js';
import niches from '../config/niches.json' assert { type: 'json' };

const KC_BASE = 'https://kingcontent.pro';

/**
 * Get today's niche rotation based on day of week.
 * Weekdays: rotate through niches_rotation
 * Weekends: use weekend_niches (testimonials, health journeys)
 */
export function getTodayNiches(): Niche[] {
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const config = niches as { niches: Niche[]; daily_quota: { niches_rotation: string[]; weekend_niches: string[] } };

  const targetIds = isWeekend
    ? config.daily_quota.weekend_niches
    : config.daily_quota.niches_rotation;

  return config.niches.filter((n: Niche) => targetIds.includes(n.id));
}

/**
 * Spy trending topics from KingContent ranking.
 * NOTE: This is a scaffold — actual scraping requires browser automation
 * via Mekong CLI browser agent or KC API (if available).
 *
 * For MVP, this generates spy tasks for manual execution on KC dashboard.
 */
export async function spyTrending(niche: Niche): Promise<SpyResult> {
  const today = new Date().toISOString().split('T')[0];

  console.log(`🔍 [Spy Scout] Scanning "${niche.name}" on KingContent...`);
  console.log(`   Keywords: ${niche.keywords.join(', ')}`);
  console.log(`   KC Category: ${niche.kingcontent_category}`);
  console.log(`   URL: ${KC_BASE}/bang-xep-hang → filter "${niche.kingcontent_category}"`);

  // Phase 1 (MVP): Return manual spy instructions
  // Phase 2: Browser automation via Mekong CLI agent
  // Phase 3: Direct KC API integration (if available)

  return {
    niche_id: niche.id,
    date: today,
    topics: [],  // Populated by manual spy or browser agent
    recommended_angles: generateAngles(niche),
  };
}

/**
 * Generate content angle suggestions based on niche config.
 */
function generateAngles(niche: Niche): string[] {
  const angleMap: Record<string, string[]> = {
    'detox-giam-can': [
      'Top 3 nước detox uống mỗi sáng',
      'Sai lầm giảm cân 90% người mắc phải',
      'Thử thách 7 ngày detox — kết quả bất ngờ',
      'So sánh 5 loại trà detox phổ biến nhất',
      'Bác sĩ tiết lộ: thực phẩm detox tốt nhất',
    ],
    'skincare-tu-nhien': [
      '5 thói quen sáng giúp da đẹp không mỹ phẩm',
      'Collagen uống hay bôi — cái nào hiệu quả hơn?',
      'Lộ trình skincare 0 đồng trong 30 ngày',
      'Thực phẩm giúp da sáng mịn từ bên trong',
      'Sai lầm rửa mặt khiến da ngày càng xấu',
    ],
    'gia-dung-xanh': [
      'Review máy lọc nước ion kiềm — có đáng mua?',
      'So sánh 3 loại nồi chiên không dầu bán chạy nhất',
      'Bếp sạch gia đình: 5 món đồ nên thay ngay',
      '1 triệu đồng nâng cấp bếp — nên mua gì?',
      'Test thực tế: nước ion kiềm vs nước lọc thường',
    ],
    'health-journey': [
      'Ngày 1 vs Ngày 30 — hành trình thay đổi sức khỏe',
      'Thử thách 30 ngày uống collagen — có thật sự hiệu quả?',
      'Nhật ký giảm cân: tuần 1 khó nhất',
      'Vlog: 1 ngày ăn uống lành mạnh của tôi',
      'Before/After 45 ngày dùng gói Health Active',
    ],
    'chuyen-hoa-story': [
      'Từ khách hàng giảm 8kg → đối tác kiếm 15tr/tháng',
      'Câu chuyện chị Hương: đổi đời nhờ sức khỏe',
      'Tại sao tôi quyết định trở thành đối tác Droppii',
      'Hành trình: Mẹ bỉm 35 tuổi → Top Leader',
      '3 bài học từ người kiếm 50tr/tháng với Droppii',
    ],
  };

  return angleMap[niche.id] || [`Trending content về ${niche.name}`];
}

/**
 * Run daily spy for all today's niches.
 */
export async function runDailySpy(): Promise<SpyResult[]> {
  const todayNiches = getTodayNiches();
  console.log(`\n🐝 [Spy Scout] Daily spy — ${new Date().toLocaleDateString('vi-VN')}`);
  console.log(`   Niches today: ${todayNiches.map(n => n.name).join(', ')}\n`);

  const results: SpyResult[] = [];
  for (const niche of todayNiches) {
    const result = await spyTrending(niche);
    results.push(result);
    console.log(`   ✅ ${niche.name}: ${result.recommended_angles.length} angles ready\n`);
  }

  return results;
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailySpy()
    .then(results => {
      console.log('\n📋 SPY REPORT:');
      for (const r of results) {
        console.log(`\n🎯 ${r.niche_id}:`);
        r.recommended_angles.forEach((a, i) => console.log(`   ${i + 1}. ${a}`));
      }
    })
    .catch(console.error);
}
