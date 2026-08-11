class PSN {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.leaderId = data.leaderId || null;
    this.members = data.members || [];     // array of member IDs
    this.score = data.score || 0;          // PSN health score 0-100
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  get memberCount() { return this.members.length; }

  addMember(memberId) {
    if (!this.members.includes(memberId)) this.members.push(memberId);
  }

  toJSON() {
    return { ...this, memberCount: this.memberCount };
  }
}

module.exports = PSN;
