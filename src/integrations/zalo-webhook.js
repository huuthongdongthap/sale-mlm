/**
 * PHASE 4: Zalo Webhook Integration
 *
 * Handles incoming Zalo webhook events for:
 *   - Alert notifications delivery
 *   - Member responses to nudges
 *   - Two-way communication
 *
 * Setup:
 *   1. Create Zalo OA (Official Account)
 *   2. Configure webhook URL in Zalo OA settings
 *   3. Set ZALO_OA_TOKEN and ZALO_OA_SECRET env vars
 */

const crypto = require('crypto');

class ZaloWebhookHandler {
  constructor(config = {}) {
    this.oaToken = config.oaToken || process.env.ZALO_OA_TOKEN;
    this.oaSecret = config.oaSecret || process.env.ZALO_OA_SECRET;
    this.apiUrl = 'https://openapi.zalo.me/v3.0/oa';
  }

  /**
   * Verify webhook signature from Zalo
   */
  verifySignature(payload, signature) {
    const expected = crypto
      .createHmac('sha256', this.oaSecret)
      .update(payload)
      .digest('hex');
    return signature === expected;
  }

  /**
   * Handle incoming webhook event
   */
  async handleEvent(event) {
    const { type, sender, message } = event;

    switch (type) {
      case 'message':
        return this.handleMessage(sender, message);
      case 'follow':
        return this.handleFollow(sender);
      case 'unfollow':
        return this.handleUnfollow(sender);
      default:
        console.log(`[Zalo] Unknown event type: ${type}`);
        return { status: 'ignored' };
    }
  }

  /**
   * Handle incoming message from member
   */
  async handleMessage(sender, message) {
    const text = message.text?.toLowerCase() || '';

    // Auto-responses for common keywords
    if (text.includes('checkin') || text.includes('điểm danh')) {
      return this.sendCheckinPrompt(sender);
    }
    if (text.includes('streak') || text.includes('chuỗi')) {
      return this.sendStreakInfo(sender);
    }
    if (text.includes('help') || text.includes('trợ giúp')) {
      return this.sendHelpMessage(sender);
    }
    if (text.includes('nudge') || text.includes('nhắc nhở')) {
      return this.sendDailyNudge(sender);
    }

    // Default: log message for leader review
    console.log(`[Zalo] Message from ${sender}: ${message.text}`);
    return { status: 'logged' };
  }

  /**
   * Handle new follower
   */
  async handleFollow(sender) {
    console.log(`[Zalo] New follower: ${sender}`);
    return this.sendWelcomeMessage(sender);
  }

  /**
   * Handle unfollow
   */
  async handleUnfollow(sender) {
    console.log(`[Zalo] Unfollow: ${sender}`);
    // Log for retention tracking
    return { status: 'logged' };
  }

  /**
   * Send message via Zalo OA API
   */
  async sendMessage(userId, message, type = 'text') {
    const payload = {
      recipient_id: userId,
      message: {
        attachment: type === 'text'
          ? { type: 'text', text: message }
          : { type: 'template', template_type: 'basic', elements: [{ type: 'text', text: message }] }
      }
    };

    // In production: fetch(`${this.apiUrl}/message`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Access-Token': this.oaToken
    //   },
    //   body: JSON.stringify(payload)
    // });

    console.log(`[Zalo] Sending to ${userId}: ${message}`);
    return { status: 'sent', userId, message };
  }

  /**
   * Send welcome message to new follower
   */
  async sendWelcomeMessage(userId) {
    return this.sendMessage(userId,
      '🐝 Chào mừng bạn đến với Hive Warfare Academy!\n\n' +
      'Reply với các từ khóa:\n' +
      '• "checkin" — Điểm danh thói quen hôm nay\n' +
      '• "streak" — Xem chuỗi thói quen\n' +
      '• "nudge" — Nhận nhắc nhở hôm nay\n' +
      '• "help" — Trợ giúp'
    );
  }

  /**
   * Send check-in prompt
   */
  async sendCheckinPrompt(userId) {
    return this.sendMessage(userId,
      '📝 Check-in thói quen hôm nay:\n\n' +
      'Reply với các items:\n' +
      '• 5am — Thức dậy lúc 5:00\n' +
      '• zoom — Tham gia Zoom\n' +
      '• kaizen — Kaizen journaling\n' +
      '• [số] — Số connects hôm nay\n\n' +
      'Ví dụ: "5am zoom kaizen 15"'
    );
  }

  /**
   * Send streak info
   */
  async sendStreakInfo(userId) {
    // In production: fetch streak from database
    return this.sendMessage(userId, '🔥 Chuỗi thói quen hiện tại: 7 ngày! Tiếp tục duy trì nhé!');
  }

  /**
   * Send help message
  */
  async sendHelpMessage(userId) {
    return this.sendMessage(userId,
      '📖 Trợ giúp — Hive Warfare Academy:\n\n' +
      'Lệnh Zalo:\n' +
      '• checkin — Điểm danh thói quen\n' +
      '• streak — Xem chuỗi thói quen\n' +
      '• nudge — Nhận nhắc nhở\n' +
      '• help — Trợ giúp\n\n' +
      'Liên hệ leader nếu cần hỗ trợ thêm!'
    );
  }

  /**
   * Send daily nudge
   */
  async sendDailyNudge(userId) {
    // In production: fetch nudge from onboarding bot
    return this.sendMessage(userId,
      '🌅 Chào buổi sáng! Hôm nay là ngày mới để phát triển bản thân.\n\n' +
      'Nhắc nhở:\n' +
      '• Thức dậy lúc 5:00 AM\n' +
      '• Hoàn thành Kaizen journal\n' +
      '• 15 connects hôm nay\n' +
      '• Follow-up leads cũ\n\n' +
      'Reply "checkin" khi hoàn thành!'
    );
  }

  /**
   * Send alert notification to leader
   */
  async sendAlertNotification(leaderPhone, alert) {
    return this.sendMessage(leaderPhone,
      `🚨 CẢNH BÁO PSN\n\n` +
      `Mức độ: ${alert.severity.toUpperCase()}\n` +
      `Nội dung: ${alert.message}\n` +
      `PSN: ${alert.psnId}\n` +
      `Thời gian: ${alert.firedAt}\n\n` +
      `Reply "ack" để xác nhận đã nhận.`
    );
  }
}

module.exports = ZaloWebhookHandler;
