/**
 * Viking Lab by itdevx — JSON store + Clans
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function load() {
  if (!fs.existsSync(DB_FILE)) {
    return {
      users: [], challenges: [], progress: [], reports: [], badges: [],
      hintUnlocks: [], clans: [], joinRequests: [], notifications: [], wars: [],
      nextIds: { users: 1, challenges: 1, progress: 1, reports: 1, badges: 1, hintUnlocks: 1, clans: 1, joinRequests: 1, notifications: 1, wars: 1 }
    };
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!data.hintUnlocks) data.hintUnlocks = [];
  if (!data.clans) data.clans = [];
  if (!data.joinRequests) data.joinRequests = [];
  if (!data.notifications) data.notifications = [];
  if (!data.wars) data.wars = [];
  if (!data.nextIds) data.nextIds = {};
  if (!data.nextIds.hintUnlocks) data.nextIds.hintUnlocks = 1;
  if (!data.nextIds.clans) data.nextIds.clans = 1;
  if (!data.nextIds.joinRequests) data.nextIds.joinRequests = 1;
  if (!data.nextIds.notifications) data.nextIds.notifications = 1;
  if (!data.nextIds.wars) data.nextIds.wars = 1;
  return data;
}
function save(db) {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
let db = load();

const store = {
  findUserByEmail(email) { return db.users.find(u => u.email === email) || null; },
  findUserById(id) { return db.users.find(u => u.id === id) || null; },
  createUser({ email, username, password, role = 'hunter' }) {
    const user = {
      id: db.nextIds.users++, email, username,
      password: bcrypt.hashSync(password, 10), role,
      clan_id: null, trophies: 0,
      created_at: new Date().toISOString()
    };
    db.users.push(user); save(db); return user;
  },
  updateUser(id, patch) {
    const u = db.users.find(x => x.id === id);
    if (!u) return null;
    Object.assign(u, patch); save(db); return u;
  },

  getAllChallenges() { return db.challenges.filter(c => c.is_active !== 0); },
  getChallengeBySlug(slug) { return db.challenges.find(c => c.slug === slug) || null; },
  getChallengeById(id) { return db.challenges.find(c => c.id === Number(id)) || null; },
  getChallengesByCategory(category) {
    return db.challenges.filter(c => c.category === category && c.is_active !== 0)
      .sort((a, b) => a.order_index - b.order_index);
  },
  insertChallenge(ch) {
    if (db.challenges.find(c => c.slug === ch.slug)) return;
    ch.id = db.nextIds.challenges++; ch.is_active = 1;
    db.challenges.push(ch); save(db);
  },
  clearChallenges() { db.challenges = []; db.nextIds.challenges = 1; save(db); },

  getProgress(userId) { return db.progress.filter(p => p.user_id === userId); },
  isSolved(userId, challengeId) {
    return !!db.progress.find(p => p.user_id === userId && p.challenge_id === challengeId);
  },
  markSolved(userId, challengeId, flag) {
    if (this.isSolved(userId, challengeId)) return false;
    db.progress.push({
      id: db.nextIds.progress++, user_id: userId, challenge_id: challengeId,
      flag_submitted: flag, solved_at: new Date().toISOString()
    });
    const ch = this.getChallengeById(challengeId);
    const pts = ch ? (ch.points || 0) : 0;
    const u = this.findUserById(userId);
    if (u) {
      u.trophies = (u.trophies || 0) + pts;
      if (u.clan_id) {
        const clan = this.getClan(u.clan_id);
        if (clan) {
          clan.xp = (clan.xp || 0) + pts;
          clan.trophies = (clan.trophies || 0) + pts;
          clan.level = Math.min(20, 1 + Math.floor((clan.xp || 0) / 200));
        }
      }
    }
    save(db);
    try { this.recordWarSolve(userId, challengeId, pts); } catch (e) {}
    return true;
  },
  countSolvedInCategory(userId, category) {
    const ids = db.challenges.filter(c => c.category === category).map(c => c.id);
    return db.progress.filter(p => p.user_id === userId && ids.includes(p.challenge_id)).length;
  },

  getUnlockedHints(userId, challengeId) {
    return db.hintUnlocks.filter(h => h.user_id === userId && h.challenge_id === challengeId)
      .map(h => h.hint_index).sort((a, b) => a - b);
  },
  isHintUnlocked(userId, challengeId, hintIndex) {
    return !!db.hintUnlocks.find(h => h.user_id === userId && h.challenge_id === challengeId && h.hint_index === hintIndex);
  },
  unlockHint(userId, challengeId, hintIndex, cost) {
    if (this.isHintUnlocked(userId, challengeId, hintIndex))
      return { success: false, message: 'این راهنمایی قبلاً باز شده' };
    if (hintIndex > 0 && !this.isHintUnlocked(userId, challengeId, hintIndex - 1))
      return { success: false, message: 'ابتدا راهنمایی قبلی را باز کن' };
    db.hintUnlocks.push({
      id: db.nextIds.hintUnlocks++, user_id: userId, challenge_id: challengeId,
      hint_index: hintIndex, cost, unlocked_at: new Date().toISOString()
    });
    save(db);
    return { success: true, cost };
  },
  getTotalHintCost(userId) {
    return db.hintUnlocks.filter(h => h.user_id === userId).reduce((s, h) => s + (h.cost || 0), 0);
  },
  getHintCostForChallenge(userId, challengeId) {
    return db.hintUnlocks.filter(h => h.user_id === userId && h.challenge_id === challengeId)
      .reduce((s, h) => s + (h.cost || 0), 0);
  },
  getUserPoints(userId) {
    let earned = 0;
    this.getProgress(userId).forEach(p => {
      const ch = this.getChallengeById(p.challenge_id);
      if (ch) earned += ch.points || 0;
    });
    return Math.max(0, earned - this.getTotalHintCost(userId));
  },

  // ---- Clans (Clash-style) ----
  getAllClans() {
    return db.clans.slice().sort((a, b) => (b.trophies || 0) - (a.trophies || 0));
  },
  getClan(id) { return db.clans.find(c => c.id === Number(id)) || null; },
  getClanByTag(tag) {
    return db.clans.find(c => c.tag.toUpperCase() === String(tag).toUpperCase()) || null;
  },
  createClan({ name, tag, description, leaderId, badge }) {
    if (this.getClanByTag(tag)) return { error: 'این تگ کلَن قبلاً استفاده شده' };
    const clan = {
      id: db.nextIds.clans++,
      name: name.slice(0, 32),
      tag: tag.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5),
      description: (description || '').slice(0, 200),
      leader_id: leaderId,
      badge: badge || '⚔️',
      xp: 0, trophies: 0, level: 1,
      member_ids: [leaderId],
      created_at: new Date().toISOString()
    };
    if (!clan.tag) return { error: 'تگ نامعتبر' };
    db.clans.push(clan);
    const u = this.findUserById(leaderId);
    if (u) u.clan_id = clan.id;
    save(db);
    return { clan };
  },
  // Direct join only used after leader accept
  _addMemberToClan(userId, clanId) {
    const u = this.findUserById(userId);
    const clan = this.getClan(clanId);
    if (!u || !clan) return { error: 'یافت نشد' };
    if (u.clan_id) return { error: 'کاربر در کلَن دیگری است' };
    if ((clan.member_ids || []).length >= 30) return { error: 'کلَن پر است' };
    if (!clan.member_ids.includes(userId)) clan.member_ids.push(userId);
    u.clan_id = clan.id;
    save(db);
    return { ok: true };
  },

  requestJoinClan(userId, clanId) {
    const u = this.findUserById(userId);
    const clan = this.getClan(clanId);
    if (!u || !clan) return { error: 'یافت نشد' };
    if (u.clan_id) return { error: 'اول از کلَن فعلی خارج شو' };
    if ((clan.member_ids || []).length >= 30) return { error: 'کلَن پر است' };
    const exists = db.joinRequests.find(r => r.clan_id === clan.id && r.user_id === userId && r.status === 'pending');
    if (exists) return { error: 'درخواست قبلی در انتظار است' };
    const req = {
      id: db.nextIds.joinRequests++,
      clan_id: clan.id,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.joinRequests.push(req);
    this.addNotification(clan.leader_id, {
      type: 'join_request',
      title: 'درخواست عضویت کلَن',
      message: (u.username || 'کاربر') + ' درخواست پیوستن به «' + clan.name + '» را داده است.',
      link: '/clans/requests',
      meta: { request_id: req.id, clan_id: clan.id }
    });
    save(db);
    return { ok: true, request: req };
  },

  getPendingRequestsForLeader(leaderId) {
    const leaderClans = db.clans.filter(c => c.leader_id === leaderId).map(c => c.id);
    return db.joinRequests
      .filter(r => r.status === 'pending' && leaderClans.includes(r.clan_id))
      .map(r => {
        const u = this.findUserById(r.user_id);
        const clan = this.getClan(r.clan_id);
        return {
          ...r,
          username: u ? u.username : '?',
          trophies: u ? (u.trophies || 0) : 0,
          clan_name: clan ? clan.name : '?',
          clan_tag: clan ? clan.tag : '?'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  acceptJoinRequest(leaderId, requestId) {
    const req = db.joinRequests.find(r => r.id === Number(requestId));
    if (!req || req.status !== 'pending') return { error: 'درخواست معتبر نیست' };
    const clan = this.getClan(req.clan_id);
    if (!clan || clan.leader_id !== leaderId) return { error: 'فقط لیدر کلَن می‌تواند قبول کند' };
    const result = this._addMemberToClan(req.user_id, clan.id);
    if (result.error) return result;
    req.status = 'accepted';
    req.resolved_at = new Date().toISOString();
    this.addNotification(req.user_id, {
      type: 'join_accepted',
      title: 'عضویت پذیرفته شد',
      message: 'درخواست پیوستن به «' + clan.name + '» قبول شد. خوش آمدی!',
      link: '/clans/' + clan.id
    });
    save(db);
    return { ok: true };
  },

  rejectJoinRequest(leaderId, requestId) {
    const req = db.joinRequests.find(r => r.id === Number(requestId));
    if (!req || req.status !== 'pending') return { error: 'درخواست معتبر نیست' };
    const clan = this.getClan(req.clan_id);
    if (!clan || clan.leader_id !== leaderId) return { error: 'فقط لیدر می‌تواند رد کند' };
    req.status = 'rejected';
    req.resolved_at = new Date().toISOString();
    this.addNotification(req.user_id, {
      type: 'join_rejected',
      title: 'درخواست رد شد',
      message: 'درخواست پیوستن به «' + clan.name + '» رد شد.',
      link: '/clans'
    });
    save(db);
    return { ok: true };
  },

  addNotification(userId, { type, title, message, link, meta }) {
    if (!db.notifications) db.notifications = [];
    db.notifications.push({
      id: db.nextIds.notifications++,
      user_id: userId,
      type: type || 'info',
      title: title || '',
      message: message || '',
      link: link || '/clans',
      meta: meta || null,
      read: false,
      created_at: new Date().toISOString()
    });
    save(db);
  },

  getNotifications(userId, limit = 30) {
    return (db.notifications || [])
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  getUnreadNotificationCount(userId) {
    return (db.notifications || []).filter(n => n.user_id === userId && !n.read).length;
  },

  markNotificationsRead(userId) {
    (db.notifications || []).forEach(n => {
      if (n.user_id === userId) n.read = true;
    });
    save(db);
  },

  
  // Random medium–hard challenges for a war (both teams same pool)
  pickWarChallengePool(count = 8) {
    const pool = this.getAllChallenges().filter(ch => {
      const d = (ch.difficulty || '').toLowerCase();
      if (d !== 'medium' && d !== 'hard') return false;
      // exclude pure easy tool fluff if any; keep OWASP + WAR + TOOLS medium/hard
      return true;
    });
    // shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(0, Math.min(count, pool.length));
    return selected.map(ch => ({
      id: ch.id,
      slug: ch.slug,
      title: ch.title,
      category: ch.category,
      difficulty: ch.difficulty,
      points: ch.points,
      lab_path: ch.lab_path || null
    }));
  },

  // ---- Clan Wars: score = challenges solved during war window ----
  declareWar(leaderId, attackerClanId, defenderClanId, hours = 2) {
    const attacker = this.getClan(attackerClanId);
    const defender = this.getClan(defenderClanId);
    if (!attacker || !defender) return { error: 'کلَن یافت نشد' };
    if (attacker.id === defender.id) return { error: 'نمی‌توانی به کلَن خودت حمله کنی' };
    if (attacker.leader_id !== leaderId) return { error: 'فقط لیدر می‌تواند درخواست جنگ بفرستد' };
    const busy = (db.wars || []).find(w =>
      (w.status === 'active' || w.status === 'pending') &&
      (w.attacker_id === attacker.id || w.defender_id === attacker.id ||
       w.attacker_id === defender.id || w.defender_id === defender.id)
    );
    if (busy) return { error: 'یکی از کلَن‌ها در جنگ یا درخواست جنگ باز دارد' };
    const h = Math.min(2, Math.max(0.5, Number(hours) || 2));
    const war = {
      id: db.nextIds.wars++,
      attacker_id: attacker.id,
      defender_id: defender.id,
      status: 'pending',
      hours: h,
      start_at: null,
      end_at: null,
      score_attacker: 0,
      score_defender: 0,
      solves: [],
      created_at: new Date().toISOString()
    };
    db.wars.push(war);
    this.addNotification(defender.leader_id, {
      type: 'war_request',
      title: 'درخواست جنگ!',
      message: 'کلَن «' + attacker.name + '» (# ' + attacker.tag + ') درخواست نبرد داده. قبول یا رد کن.',
      link: '/clans/wars/' + war.id
    });
    save(db);
    return { ok: true, war };
  },

  acceptWar(leaderId, warId) {
    const war = (db.wars || []).find(w => w.id === Number(warId));
    if (!war || war.status !== 'pending') return { error: 'درخواست جنگ معتبر نیست' };
    const defender = this.getClan(war.defender_id);
    const attacker = this.getClan(war.attacker_id);
    if (!defender || defender.leader_id !== leaderId) return { error: 'فقط لیدر مدافع می‌تواند قبول کند' };
    const start = new Date();
    const h = war.hours || 2;
    war.status = 'active';
    war.start_at = start.toISOString();
    war.end_at = new Date(start.getTime() + h * 3600 * 1000).toISOString();
    war.accepted_at = start.toISOString();
    // هر جنگ بسته رندوم جدا (متوسط تا سخت، همه نوع)
    war.challenge_pool = this.pickWarChallengePool(8);
    war.challenge_ids = (war.challenge_pool || []).map(x => x.id);
    // notify both clans
    const notifyAll = (clan, title, msg) => {
      (clan.member_ids || []).forEach(uid => {
        this.addNotification(uid, { type: 'war_started', title, message: msg, link: '/clans/wars/' + war.id });
      });
    };
    if (attacker) notifyAll(attacker, 'جنگ شروع شد!', 'نبرد با «' + defender.name + '» آغاز شد. حمله کنید!');
    notifyAll(defender, 'جنگ شروع شد!', 'دفاع در برابر «' + (attacker && attacker.name) + '» — چالش WAR را حل کنید.');
    save(db);
    return { ok: true, war };
  },

  rejectWar(leaderId, warId) {
    const war = (db.wars || []).find(w => w.id === Number(warId));
    if (!war || war.status !== 'pending') return { error: 'درخواست معتبر نیست' };
    const defender = this.getClan(war.defender_id);
    if (!defender || defender.leader_id !== leaderId) return { error: 'فقط لیدر مدافع می‌تواند رد کند' };
    war.status = 'rejected';
    war.rejected_at = new Date().toISOString();
    const attacker = this.getClan(war.attacker_id);
    if (attacker) {
      this.addNotification(attacker.leader_id, {
        type: 'war_rejected',
        title: 'درخواست جنگ رد شد',
        message: 'کلَن «' + defender.name + '» درخواست نبرد را رد کرد.',
        link: '/clans/wars'
      });
    }
    save(db);
    return { ok: true };
  },


  getActiveWars() {
    this._finalizeExpiredWars();
    return (db.wars || []).filter(w => w.status === 'active');
  },

  getPendingWars() {
    return (db.wars || []).filter(w => w.status === 'pending');
  },


  getWar(id) {
    this._finalizeExpiredWars();
    return (db.wars || []).find(w => w.id === Number(id)) || null;
  },

  getWarsForClan(clanId) {
    this._finalizeExpiredWars();
    return (db.wars || [])
      .filter(w => w.attacker_id === Number(clanId) || w.defender_id === Number(clanId))
      .sort((a, b) => new Date(b.start_at) - new Date(a.start_at));
  },

  // Called when a user solves a challenge during an active war
  recordWarSolve(userId, challengeId, points) {
    const u = this.findUserById(userId);
    if (!u || !u.clan_id) return;
    const ch = this.getChallengeById(challengeId);
    if (!ch) return;
    const wars = (db.wars || []).filter(w =>
      w.status === 'active' &&
      (w.attacker_id === u.clan_id || w.defender_id === u.clan_id) &&
      w.start_at && w.end_at &&
      new Date(w.start_at) <= new Date() && new Date(w.end_at) >= new Date()
    );
    wars.forEach(w => {
      // must be in this war's random pool (or legacy WAR-only wars)
      if (w.challenge_ids && w.challenge_ids.length) {
        if (!w.challenge_ids.includes(challengeId) && !w.challenge_ids.includes(Number(challengeId))) return;
      } else if (ch.category !== 'WAR') {
        return;
      }
      if ((w.solves || []).some(s => s.user_id === userId && s.challenge_id === challengeId)) return;
      const pts = points || 0;
      w.solves = w.solves || [];
      w.solves.push({ user_id: userId, clan_id: u.clan_id, challenge_id: challengeId, points: pts, at: new Date().toISOString() });
      if (u.clan_id === w.attacker_id) w.score_attacker = (w.score_attacker || 0) + pts;
      else w.score_defender = (w.score_defender || 0) + pts;
    });
    save(db);
  },

  _finalizeExpiredWars() {
    const now = new Date();
    (db.wars || []).forEach(w => {
      if (w.status !== 'active') return;
      if (!w.end_at || new Date(w.end_at) > now) return;
      w.status = 'finished';
      if (w.score_attacker > w.score_defender) w.winner_id = w.attacker_id;
      else if (w.score_defender > w.score_attacker) w.winner_id = w.defender_id;
      else w.winner_id = null; // draw
      if (w.winner_id) {
        const winner = this.getClan(w.winner_id);
        if (winner) {
          winner.trophies = (winner.trophies || 0) + 50;
          winner.xp = (winner.xp || 0) + 100;
          winner.level = Math.min(20, 1 + Math.floor((winner.xp || 0) / 200));
        }
      }
    });
    save(db);
  },

  joinClan(userId, clanId) {
    // deprecated direct join — use requestJoinClan
    return this.requestJoinClan(userId, clanId);
  },

  leaveClan(userId) {
    const u = this.findUserById(userId);
    if (!u || !u.clan_id) return { error: 'در کلَنی نیستی' };
    const clan = this.getClan(u.clan_id);
    if (clan) {
      clan.member_ids = clan.member_ids.filter(id => id !== userId);
      if (clan.leader_id === userId && clan.member_ids.length) {
        clan.leader_id = clan.member_ids[0];
      }
      if (!clan.member_ids.length) {
        db.clans = db.clans.filter(c => c.id !== clan.id);
      }
    }
    u.clan_id = null;
    save(db);
    return { ok: true };
  },
  getClanMembers(clanId) {
    const clan = this.getClan(clanId);
    if (!clan) return [];
    return clan.member_ids.map(id => {
      const u = this.findUserById(id);
      if (!u) return null;
      return {
        id: u.id, username: u.username, trophies: u.trophies || 0,
        isLeader: clan.leader_id === u.id,
        points: this.getUserPoints(u.id),
        solved: this.getProgress(u.id).length
      };
    }).filter(Boolean).sort((a, b) => b.trophies - a.trophies);
  },

  getReportsByUser(userId) {
    return db.reports.filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getReport(id, userId) {
    return db.reports.find(r => r.id === Number(id) && r.user_id === userId) || null;
  },
  createReport(data) {
    const report = { id: db.nextIds.reports++, ...data, status: 'pending', created_at: new Date().toISOString() };
    db.reports.push(report); save(db); return report;
  },
  addBadge(userId, key, name) {
    if (db.badges.find(b => b.user_id === userId && b.badge_key === key)) return;
    db.badges.push({ id: db.nextIds.badges++, user_id: userId, badge_key: key, badge_name: name, earned_at: new Date().toISOString() });
    save(db);
  },
  _db: () => db,
  _save: () => save(db)
};
module.exports = store;
