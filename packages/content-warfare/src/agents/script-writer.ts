/**
 * Script Writer Agent
 * Takes trending topics + niche config → generates video scripts
 * with Droppii CTA and UTM tracking.
 *
 * Uses LLM (Claude Haiku via Mekong CLI) for script generation.
 * Falls back to template-based generation if LLM unavailable.
 */

import type { Niche, VideoScript, SpyResult, ContentFormat } from '../types.js';
import niches from '../config/niches.json' assert { type: 'json' };
import schedule from '../config/schedule.json' assert { type: 'json' };

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.anthropic.com';
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-3-haiku-20240307';

/**
 * Generate UTM parameters for tracking video→lead conversion.
 */
function buildUtm(nicheId: string, format: ContentFormat, date: string): Record<string, string> {
  return {
    utm_source: 'content_warfare',
    utm_medium: 'video',
    utm_campaign: `${nicheId}_${format}_${date}`,
    utm_content: `cw_${Date.now()}`,
  };
}

/**
 * Build CTA link with UTM tracking.
 */
function buildCtaLink(niche: Niche, utm: Record<string, string>): string {
  const base = schedule.utm_base;
  const path = (schedule.cta_links as Record<string, string>)[niche.cta_template] || '/quiz/khoi-dau';
  const params = new URLSearchParams(utm).toString();
  return `https://${base}${path}?${params}`;
}

/**
 * Template-based script generation (no LLM required).
 * Used as fallback or for MVP testing.
 */
function generateFromTemplate(
  niche: Niche,
  angle: string,
  duration: 30 | 45 | 60,
  format: ContentFormat
): VideoScript {
  const today = new Date().toISOString().split('T')[0];
  const utm = buildUtm(niche.id, format, today);
  const ctaLink = buildCtaLink(niche, utm);

  const templates: Record<number, { hook: string; body: string; cta: string }> = {
    30: {
      hook: `Ban co biet? ${angle}`,
      body: `Day la nhung dieu it nguoi biet ve ${niche.name.toLowerCase()}. Nhieu nguoi da thay doi cuoc song chi bang nhung thoi quen don gian moi ngay.`,
      cta: `Lam quiz suc khoe 30 giay de nhan phan tich mien phi. Link trong bio.`,
    },
    45: {
      hook: `${angle} — ban da thu chua?`,
      body: `Theo cac chuyen gia, ${niche.name.toLowerCase()} la xu huong duoc quan tam nhat nam 2026. Hang ngan nguoi da bat dau va thay ket qua chi sau 2 tuan. Bi quyet la su dung dung san pham va phuong phap khoa hoc.`,
      cta: `Muon biet san pham phu hop voi ban? Lam quiz mien phi o link bio. Chi mat 30 giay.`,
    },
    60: {
      hook: `Cau chuyen nay se thay doi cach ban nghi ve ${niche.name.toLowerCase()}.`,
      body: `3 thang truoc, mot nguoi khach chi la nguoi mua thu. Sau 30 ngay, ho thay ket qua ro ret. Sau 90 ngay, ho khong chi khoe hon ma con kiem them thu nhap bang cach chia se trai nghiem. Day khong phai la quang cao — day la cau chuyen that cua nhung nguoi that.`,
      cta: `Ban cung co the bat dau. Buoc dau tien: lam quiz suc khoe mien phi de biet tinh trang hien tai. Link trong bio — chi mat 30 giay.`,
    },
  };

  const t = templates[duration];

  return {
    id: `script_${niche.id}_${duration}s_${Date.now()}`,
    niche_id: niche.id,
    title: angle,
    duration_seconds: duration,
    hook: t.hook,
    body: t.body,
    cta: t.cta,
    cta_link: ctaLink,
    utm_params: utm,
    target_product_ids: niche.droppii_products,
    funnel_level: niche.funnel_level,
    format,
    status: 'draft',
    created_at: new Date().toISOString(),
  };
}

/**
 * LLM-powered script generation.
 * Sends niche context + trending data to Claude Haiku.
 */
async function generateWithLLM(
  niche: Niche,
  angle: string,
  duration: 30 | 45 | 60,
  format: ContentFormat
): Promise<VideoScript> {
  if (!LLM_API_KEY) {
    console.log('   ⚠️  No LLM API key — falling back to template');
    return generateFromTemplate(niche, angle, duration, format);
  }

  const systemPrompt = `Bạn là chuyên gia viết script video ngắn viral cho mạng xã hội Việt Nam.
Ngách: ${niche.name} (${niche.target_audience})
Sản phẩm liên kết: ${niche.droppii_products.join(', ')}
Level phễu: ${niche.funnel_level}

Quy tắc:
- Viết bằng tiếng Việt không dấu (cho AI voice-over)
- Hook mạnh trong 3 giây đầu
- Không hard-sell, dùng storytelling + giá trị thực
- CTA nhẹ nhàng: "Link trong bio" hoặc "Lam quiz mien phi"
- Tone: thân thiện, chuyên gia, đáng tin
- Không dùng từ y khoa quá mức (TPCN compliance)`;

  const userPrompt = `Viết 1 script video ${duration} giây, format "${format}", chủ đề: "${angle}"
Trả về JSON: { "hook": "...", "body": "...", "cta": "..." }`;

  try {
    const response = await fetch(`${LLM_BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LLM_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) throw new Error(`LLM API ${response.status}`);
    const data = await response.json() as { content: Array<{ text: string }> };
    const text = data.content[0].text;

    // Parse JSON from LLM response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in LLM response');
    const parsed = JSON.parse(jsonMatch[0]) as { hook: string; body: string; cta: string };

    const today = new Date().toISOString().split('T')[0];
    const utm = buildUtm(niche.id, format, today);

    return {
      id: `script_${niche.id}_${duration}s_${Date.now()}`,
      niche_id: niche.id,
      title: angle,
      duration_seconds: duration,
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      cta_link: buildCtaLink(niche, utm),
      utm_params: utm,
      target_product_ids: niche.droppii_products,
      funnel_level: niche.funnel_level,
      format,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    console.log(`   ⚠️  LLM failed: ${err}. Using template.`);
    return generateFromTemplate(niche, angle, duration, format);
  }
}

/**
 * Generate 3 scripts for a niche (30s, 45s, 60s).
 */
export async function generateScripts(
  spyResult: SpyResult,
  niche: Niche,
  useLLM = true
): Promise<VideoScript[]> {
  console.log(`\n✍️  [Script Writer] Generating scripts for "${niche.name}"...`);

  const angles = spyResult.recommended_angles;
  const durations: Array<30 | 45 | 60> = [30, 45, 60];
  const formats: ContentFormat[] = niche.content_formats.slice(0, 3);

  const scripts: VideoScript[] = [];
  for (let i = 0; i < durations.length; i++) {
    const angle = angles[i % angles.length];
    const format = formats[i % formats.length];
    const duration = durations[i];

    const script = useLLM
      ? await generateWithLLM(niche, angle, duration, format)
      : generateFromTemplate(niche, angle, duration, format);

    scripts.push(script);
    console.log(`   ✅ ${duration}s "${angle}" → ${script.cta_link}`);
  }

  return scripts;
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = niches as { niches: Niche[] };
  const testNiche = config.niches[0]; // detox-giam-can
  const mockSpy: SpyResult = {
    niche_id: testNiche.id,
    date: new Date().toISOString().split('T')[0],
    topics: [],
    recommended_angles: [
      'Top 3 nuoc detox uong moi sang',
      'Sai lam giam can 90% nguoi mac phai',
      'Thu thach 7 ngay detox',
    ],
  };

  generateScripts(mockSpy, testNiche, false)
    .then(scripts => {
      console.log('\n📝 SCRIPTS GENERATED:');
      scripts.forEach(s => {
        console.log(`\n--- ${s.duration_seconds}s | ${s.title} ---`);
        console.log(`Hook: ${s.hook}`);
        console.log(`Body: ${s.body.substring(0, 100)}...`);
        console.log(`CTA: ${s.cta}`);
        console.log(`Link: ${s.cta_link}`);
      });
    })
    .catch(console.error);
}
