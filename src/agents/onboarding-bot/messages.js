/**
 * Onboarding Bot — daily nudge messages and action items
 *
 * Content tables for 4 weeks × 7 days, looked up by current
 * session week/day.
 */

const DAY_MESSAGES = {
  1: [ // Week 1: Mindset
    '🌅 Chào buổi sáng! Hôm nay là ngày 1 của hành trình 5AM Club. Bạn đã sẵn sàng thức dậy lúc 5:00 AM chưa?',
    '⏰ Ngày 2: Công thức 20/20/20 — 20 phút vận động, 20 phút suy ngẫm, 20 phút phát triển!',
    '📝 Ngày 3: Journaling time! Viết 3 điều biết ơn và mục tiêu hôm nay.',
    '💪 Ngày 4: Kaizen — cải thiện 1% mỗi ngày. Hôm nay bạn sẽ cải thiện điều gì?',
    '🎯 Ngày 5: Thiết lập mục tiêu rõ ràng cho hành trình Droppii của bạn.',
    '🔥 Ngày 6: Building discipline — kỷ luật là cầu nối giữa mục tiêu và thành tựu.',
    '🏆 Ngày 7: Week 1 complete! Review thói quen và chuẩn bị cho Week 2.'
  ],
  2: [ // Week 2: Product
    '🧪 Week 2: Product Mastery! Hôm nay bạn sẽ học về hệ sinh thái Droppii.',
    '📦 Ngày 2: Deep-dive vào sản phẩm chủ lực — lợi ích và cách sử dụng.',
    '👨‍👩‍👧‍👦 Ngày 3: Sản phẩm cho gia đình — từ bé 3 tuổi đến người lớn.',
    '🔬 Ngày 4: Medicine 3.0 — chăm sóc sức khỏe chủ động qua Droppii.',
    '💡 Ngày 5: Cách trình bày sản phẩm — storytelling và social proof.',
    '📱 Ngày 6: Digital tools — app, website, và resources cho thành viên.',
    '🎓 Ngày 7: Product quiz — test kiến thức của bạn!'
  ],
  3: [ // Week 3: Connect
    '🤝 Week 3: Connect Engine! Mục tiêu: 15 connects/ngày.',
    '📋 Ngày 2: Warm Market — lập danh sách 50 người.',
    '💬 Ngày 3: Lukewarm Market — Facebook/Zalo groups strategy.',
    '📣 Ngày 4: Cold Market — Social media content engine.',
    '🎪 Ngày 5: Offline connects — sự kiện và networking.',
    '🔄 Ngày 6: Follow-up engine — 3-7-14 framework.',
    '📊 Ngày 7: Connect review — tính conversion rates.'
  ],
  4: [ // Week 4: Close
    '🎯 Week 4: First Close! Follow-up sequence mastery.',
    '📩 Ngày 2: First touch follow-up — reconnect sau connect.',
    '💎 Ngày 3: Value add — share personal story và tips.',
    '🛡️ Ngày 4: Xử lý từ chối — 5 objections phổ biến.',
    '⚡ Ngày 5: Tạo urgency tự nhiên — không áp lực.',
    '🏆 Ngày 6: THE ASK — close đơn hàng đầu tiên!',
    '🎉 Ngày 7: Graduation review — bạn đã sẵn sàng cho Tier 2!'
  ]
};

const DAY_ACTION_ITEMS = {
  1: { // Mindset
    1: ['Đặt đồng hồ 5:00 AM', 'Chuẩn bị journal + bút', 'Tắt điện thoại trước 21:30'],
    2: ['20 phút vận động buổi sáng', '20 phút meditation/journaling', '20 phút đọc sách/phát triển'],
    3: ['Viết 3 điều biết ơn', 'Viết mục tiêu hôm nay', 'Review journal của tuần'],
    4: ['Identify 1% improvement area', 'Thực hành improvement', 'Viết Kaizen journal'],
    5: ['Viết mục tiêu Droppii 30 ngày', 'Chia sẻ mục tiêu với buddy', 'Break down thành weekly targets'],
    6: ['Review discipline habits', 'Identify weak points', 'Create accountability plan'],
    7: ['Week 1 review', 'Calculate habit score average', 'Prepare for Week 2']
  },
  2: { // Product
    1: ['Đọc overview hệ sinh thái Droppii', 'Identify 3 sản phẩm quan tâm', 'Viết questions cho leader'],
    2: ['Deep-dive 1 sản phẩm chủ lực', 'Thực hành presentation', 'Share với buddy'],
    3: ['Nghiên cứu sản phẩm cho gia đình', 'List benefits cho từng độ tuổi', 'Practice family pitch'],
    4: ['Học về Medicine 3.0', 'Connect với Droppii products', 'Write personal health story'],
    5: ['Practice product storytelling', 'Record 2-min pitch', 'Get feedback from buddy'],
    6: ['Download Droppii app', 'Explore website resources', 'Join member community'],
    7: ['Take product knowledge quiz', 'Review weak areas', 'Prepare for Week 3']
  },
  3: { // Connect
    1: ['Understand 15 connects/day goal', 'Plan warm/lukewarm/cold split', 'Prepare connect scripts'],
    2: ['Create warm market list (50 people)', 'Send 5 warm connects', 'Track responses'],
    3: ['Join 2 Facebook/Zalo groups', 'Comment有价值的 in 2 posts', 'Inbox 2 people'],
    4: ['Write 1 personal story post', 'Write 1 educational post', 'Engage with comments'],
    5: ['Attend 1 event/meetup', 'Connect with 5 new people', 'Get Zalo contacts'],
    6: ['Follow-up all connects (3-7-14)', 'Update CRM sheet', 'Schedule next follow-ups'],
    7: ['Calculate connect conversion rates', 'Identify top channels', 'Plan Week 4 strategy']
  },
  4: { // Close
    1: ['Review 3-7-14 framework', 'List all pending follow-ups', 'Prioritize hot leads'],
    2: ['Send 10 first touch follow-ups', 'Track responses', 'Schedule conversations'],
    3: ['Send 10 value add messages', 'Share personal stories', 'Track engagement'],
    4: ['Role-play 5 objections with buddy', 'Practice responses', 'Identify hardest objection'],
    5: ['Write 3 urgency messages', 'Practice with buddy feedback', 'Send to 3 leads'],
    6: ['Send "The Ask" to 5 leads', 'Follow-up responses same day', 'Celebrate every yes!'],
    7: ['Complete graduation review', 'Calculate all metrics', 'Register for Tier 2']
  }
};

/**
 * Get message for current day
 */
function getDayMessage(session) {
  const week = session.currentWeek;
  const day = session.currentDay;
  return (DAY_MESSAGES[week] || DAY_MESSAGES[1])[day - 1] || 'Tiếp tục practice hôm nay!';
}

/**
 * Get action items for current day
 */
function getDayActionItems(session) {
  const week = session.currentWeek;
  const day = session.currentDay;
  return (DAY_ACTION_ITEMS[week] || {})[day] || ['Continue daily habits', '15 connects', 'Journal'];
}

module.exports = { getDayMessage, getDayActionItems, DAY_MESSAGES, DAY_ACTION_ITEMS };
