/**
 * Publish approval gate — no upload leaves yt-shorts-pipeline without an
 * explicit operator approval token minted by this package.
 *
 * Mirrors the external repo's invariant: simulated/unapproved output can
 * never enter the publish path. Tokens are single-use, bound to one
 * videoId, expire, and are consumed on first use.
 */
const crypto = require('crypto');
const fs = require('fs');

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // approvals live one day

class PublishGate {
  constructor(storePath) {
    this.storePath = storePath;
    this.ttlMs = DEFAULT_TTL_MS;
    try { this.tokens = JSON.parse(fs.readFileSync(storePath, 'utf8')); }
    catch { this.tokens = {}; }
  }

  /**
   * Mint a single-use approval for one videoId. `note` records who/why —
   * approvals without provenance are as bad as none.
   */
  approve(videoId, note) {
    if (!videoId) throw new Error('videoId required');
    if (!note || note.trim().length < 10) {
      throw new Error('approval note of at least 10 characters required (who + why)');
    }
    const token = 'pub_' + crypto.randomBytes(16).toString('hex');
    this.tokens[token] = {
      videoId,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.ttlMs).toISOString(),
      usedAt: null,
    };
    this.persist();
    return token;
  }

  /**
   * Consume a token for a videoId. Returns the approval record or throws —
   * callers treat any throw as "do not upload".
   */
  consume(token, videoId) {
    const rec = this.tokens[token];
    const fail = reason => { throw new Error(`Publish blocked: ${reason}`); };
    if (!rec) fail('unknown token');
    // Video binding is checked before the used-flag so a mismatched video
    // gets the precise reason instead of a generic "already used".
    if (rec.videoId !== videoId) fail('token is bound to a different video');
    if (rec.usedAt) fail('token already used');
    if (new Date(rec.expiresAt).getTime() < Date.now()) fail('token expired');
    rec.usedAt = new Date().toISOString();
    this.persist();
    return rec;
  }

  /** Read-only check for dry-run flows. */
  check(token, videoId) {
    const rec = this.tokens[token];
    if (!rec || rec.usedAt || rec.videoId !== videoId) return false;
    return new Date(rec.expiresAt).getTime() >= Date.now();
  }

  persist() {
    fs.mkdirSync(require('path').dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.tokens, null, 2));
  }
}

module.exports = { PublishGate };
