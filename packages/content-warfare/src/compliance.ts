/**
 * Compliance Guardrails for TPCN/TPBVSK Content
 *
 * Ensures all generated content complies with Vietnamese regulations:
 * - Nghị định 15/2018/NĐ-CP
 * - Nghị quyết 21/2026/NQ-CP
 *
 * MUST be applied to every script before publishing.
 */

/** Words absolutely banned in TPCN content */
export const BANNED_WORDS = [
  'chữa', 'trị', 'khỏi bệnh', 'thay thế thuốc', 'điều trị',
  'cam kết hiệu quả', 'chắc chắn', '100%', 'loại bỏ hoàn toàn',
  'thuốc', 'dược phẩm', 'bác sĩ khuyên dùng', 'bệnh viện khuyên',
  'chữa khỏi', 'đặc trị', 'tiêu diệt', 'triệt tiêu',
  'không cần đi khám', 'thay thế bác sĩ', 'FDA approved',
];

/** Required disclaimer for all TPCN content */
export const DISCLAIMER_VI =
  'Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.';

export const DISCLAIMER_NO_DIACRITICS =
  'San pham nay khong phai la thuoc va khong co tac dung thay the thuoc chua benh.';

/** Safe word substitutions */
export const SAFE_ALTERNATIVES: Record<string, string> = {
  'chữa bệnh': 'hỗ trợ sức khỏe',
  'trị mất ngủ': 'hỗ trợ giấc ngủ ngon hơn',
  'giảm cân nhanh': 'hỗ trợ quản lý cân nặng',
  'trẻ hóa': 'hỗ trợ duy trì sức khỏe làn da',
  'khỏi đau': 'hỗ trợ vận động linh hoạt',
  'tăng cường miễn dịch': 'hỗ trợ sức đề kháng',
  'chống ung thư': 'hỗ trợ bảo vệ tế bào',
  'hạ đường huyết': 'hỗ trợ ổn định đường huyết',
  'giảm cholesterol': 'hỗ trợ duy trì mỡ máu ở mức bình thường',
  'trị tiểu đường': 'hỗ trợ chế độ dinh dưỡng cho người có đường huyết cao',
};

export interface ComplianceResult {
  passed: boolean;
  violations: string[];
  suggestions: string[];
  sanitized_text?: string;
}

/**
 * Check text for compliance violations.
 */
export function checkCompliance(text: string): ComplianceResult {
  const lowerText = text.toLowerCase();
  const violations: string[] = [];
  const suggestions: string[] = [];

  // Check banned words
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      violations.push(`Banned word: "${word}"`);
      const safe = SAFE_ALTERNATIVES[word];
      if (safe) {
        suggestions.push(`Replace "${word}" → "${safe}"`);
      } else {
        suggestions.push(`Remove or rephrase: "${word}"`);
      }
    }
  }

  // Check for before/after implications
  if (lowerText.includes('before') && lowerText.includes('after') ||
      lowerText.includes('trước') && lowerText.includes('sau')) {
    // Only flag if it implies medical cure
    const medicalTerms = ['bệnh', 'khỏi', 'hết', 'chữa', 'trị'];
    for (const term of medicalTerms) {
      if (lowerText.includes(term)) {
        violations.push(`Before/After with medical implication: "${term}"`);
        suggestions.push('Use "journey log" format instead of medical before/after');
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    suggestions,
  };
}

/**
 * Auto-sanitize text by replacing banned words with safe alternatives.
 */
export function sanitize(text: string): string {
  let result = text;
  for (const [banned, safe] of Object.entries(SAFE_ALTERNATIVES)) {
    const regex = new RegExp(banned, 'gi');
    result = result.replace(regex, safe);
  }
  return result;
}

/**
 * Ensure disclaimer is appended to video caption/description.
 */
export function appendDisclaimer(text: string, useDiacritics = false): string {
  const disclaimer = useDiacritics ? DISCLAIMER_VI : DISCLAIMER_NO_DIACRITICS;
  if (text.includes(disclaimer)) return text;
  return `${text}\n\n⚠️ ${disclaimer}`;
}
