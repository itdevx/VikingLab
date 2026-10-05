const express = require('express');
const store = require('../models/store');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.get('/', requireAuth, (req, res) => {
  const user = store.findUserById(req.session.user.id);
  const clans = store.getAllClans().map(c => ({
    ...c,
    memberCount: (c.member_ids || []).length
  }));
  let myClan = null;
  let members = [];
  if (user && user.clan_id) {
    myClan = store.getClan(user.clan_id);
    members = store.getClanMembers(user.clan_id);
  }
  const unread = store.getUnreadNotificationCount(req.session.user.id);
  res.render('clans/index', {
    title: 'کلَن‌ها',
    clans,
    myClan,
    members,
    user: req.session.user,
    unread,
    error: req.query.error || null,
    success: req.query.ok || null
  });
});


router.get('/leaderboard', requireAuth, (req, res) => {
  const warChallenges = store.getChallengesByCategory('WAR');
  const warTotal = warChallenges.length || 1;
  const warIds = new Set(warChallenges.map(ch => ch.id));
  const clans = store.getAllClans().map(clan => {
    let warSolved = 0;
    const seen = new Set();
    (clan.member_ids || []).forEach(uid => {
      store.getProgress(uid).forEach(p => {
        if (warIds.has(p.challenge_id) && !seen.has(p.challenge_id)) {
          seen.add(p.challenge_id);
          warSolved++;
        }
      });
    });
    return { ...clan, warSolved, warTotal, memberCount: (clan.member_ids || []).length };
  });
  res.render('clans/leaderboard', { title: 'لیدربورد کلَن‌ها', clans });
});

router.get('/create', requireAuth, (req, res) => {
  const user = store.findUserById(req.session.user.id);
  if (user && user.clan_id) return res.redirect('/clans?error=' + encodeURIComponent('اول از کلَن فعلی خارج شو'));
  res.render('clans/create', { title: 'ساخت کلَن', error: null });
});

router.post('/create', requireAuth, (req, res) => {
  const user = store.findUserById(req.session.user.id);
  if (user && user.clan_id) return res.redirect('/clans');
  const { name, tag, description, badge } = req.body;
  if (!name || !tag) {
    return res.render('clans/create', { title: 'ساخت کلَن', error: 'نام و تگ الزامی است' });
  }
  const result = store.createClan({
    name, tag, description,
    leaderId: req.session.user.id,
    badge: badge || '⚔️'
  });
  if (result.error) {
    return res.render('clans/create', { title: 'ساخت کلَن', error: result.error });
  }
  req.session.user.clan_id = result.clan.id;
  res.redirect('/clans?ok=1');
});

// Request to join (not instant)
router.post('/join/:id', requireAuth, (req, res) => {
  const result = store.requestJoinClan(req.session.user.id, req.params.id);
  if (result.error) return res.redirect('/clans?error=' + encodeURIComponent(result.error));
  res.redirect('/clans?ok=requested');
});

router.post('/leave', requireAuth, (req, res) => {
  store.leaveClan(req.session.user.id);
  delete req.session.user.clan_id;
  res.redirect('/clans?ok=left');
});

// Leader: pending requests
router.get('/requests', requireAuth, (req, res) => {
  const pending = store.getPendingRequestsForLeader(req.session.user.id);
  store.markNotificationsRead(req.session.user.id);
  res.render('clans/requests', { title: 'درخواست‌های عضویت', pending });
});

router.post('/requests/:id/accept', requireAuth, (req, res) => {
  const result = store.acceptJoinRequest(req.session.user.id, req.params.id);
  if (result.error) return res.redirect('/clans/requests?error=' + encodeURIComponent(result.error));
  res.redirect('/clans/requests?ok=1');
});

router.post('/requests/:id/reject', requireAuth, (req, res) => {
  const result = store.rejectJoinRequest(req.session.user.id, req.params.id);
  if (result.error) return res.redirect('/clans/requests?error=' + encodeURIComponent(result.error));
  res.redirect('/clans/requests?ok=1');
});

// Notifications
router.get('/notifications', requireAuth, (req, res) => {
  const list = store.getNotifications(req.session.user.id);
  store.markNotificationsRead(req.session.user.id);
  res.render('clans/notifications', { title: 'اعلان‌ها', list });
});

// Wars
router.get('/wars', requireAuth, (req, res) => {
  const user = store.findUserById(req.session.user.id);
  let myWars = [];
  if (user && user.clan_id) myWars = store.getWarsForClan(user.clan_id);
  const active = store.getActiveWars();
  const pending = store.getPendingWars ? store.getPendingWars() : [];
  const clans = store.getAllClans();
  const myClan = user && user.clan_id ? store.getClan(user.clan_id) : null;
  res.render('clans/wars', {
    title: 'جنگ کلَن‌ها',
    myWars,
    active,
    pending,
    clans,
    myClanId: user ? user.clan_id : null,
    isLeader: !!(myClan && myClan.leader_id === user.id),
    error: req.query.error || null
  });
});

router.post('/wars/declare', requireAuth, (req, res) => {
  const user = store.findUserById(req.session.user.id);
  if (!user || !user.clan_id) return res.redirect('/clans/wars?error=' + encodeURIComponent('اول عضو کلَن شو'));
  const defenderId = Number(req.body.defender_id);
  const hours = Number(req.body.hours) || 48;
  const result = store.declareWar(user.id, user.clan_id, defenderId, hours);
  if (result.error) return res.redirect('/clans/wars?error=' + encodeURIComponent(result.error));
  res.redirect('/clans/wars/' + result.war.id);
});


router.post('/wars/:id/accept', requireAuth, (req, res) => {
  const result = store.acceptWar(req.session.user.id, req.params.id);
  if (result.error) return res.redirect('/clans/wars/' + req.params.id + '?error=' + encodeURIComponent(result.error));
  res.redirect('/clans/wars/' + req.params.id);
});

router.post('/wars/:id/reject', requireAuth, (req, res) => {
  const result = store.rejectWar(req.session.user.id, req.params.id);
  if (result.error) return res.redirect('/clans/wars?error=' + encodeURIComponent(result.error));
  res.redirect('/clans/wars?ok=rejected');
});

router.get('/wars/:id', requireAuth, (req, res) => {
  const war = store.getWar(req.params.id);
  if (!war) return res.status(404).render('404', { title: 'جنگ پیدا نشد' });
  const attacker = store.getClan(war.attacker_id);
  const defender = store.getClan(war.defender_id);
  const user = store.findUserById(req.session.user.id);
  let myRole = null; // attacker | defender
  if (user && user.clan_id === war.attacker_id) myRole = 'attacker';
  if (user && user.clan_id === war.defender_id) myRole = 'defender';
  const isDefenderLeader = user && defender && defender.leader_id === user.id;
  const solveDetails = (war.solves || []).map(s => {
    const u = store.findUserById(s.user_id);
    const ch = store.getChallengeById(s.challenge_id);
    return {
      ...s,
      username: u ? u.username : '?',
      challenge: ch ? ch.title : '#' + s.challenge_id
    };
  }).reverse();
  let endsInHours = 0, endsInMins = 0;
  if (war.end_at) {
    const endsIn = Math.max(0, new Date(war.end_at) - new Date());
    endsInHours = Math.floor(endsIn / 3600000);
    endsInMins = Math.floor((endsIn % 3600000) / 60000);
  }
  res.render('clans/war-detail', {
    title: 'نبرد کلَن',
    war,
    attacker,
    defender,
    solveDetails,
    endsInHours,
    endsInMins,
    myRole,
    isDefenderLeader,
    error: req.query.error || null
  });
});

router.get('/:id', requireAuth, (req, res) => {
  const clan = store.getClan(req.params.id);
  if (!clan) return res.status(404).render('404', { title: 'کلَن پیدا نشد' });
  const members = store.getClanMembers(clan.id);
  const user = store.findUserById(req.session.user.id);
  res.render('clans/view', {
    title: clan.name,
    clan,
    members,
    isMember: user && user.clan_id === clan.id,
    isLeader: user && clan.leader_id === user.id
  });
});

module.exports = router;
