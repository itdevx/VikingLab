const express = require('express');
const store = require('../models/store');
const router = express.Router();


router.get('/api/notifications/unread', (req, res) => {
  if (!req.session.user) return res.json({ count: 0 });
  const count = store.getUnreadNotificationCount(req.session.user.id);
  res.json({ count });
});

router.get('/api/notifications', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'auth' });
  const list = store.getNotifications(req.session.user.id, 20);
  res.json({ items: list });
});



function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.get('/', (req, res) => {
  res.render('index', { title: 'Viking Lab' });
});

router.get('/dashboard', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const all = store.getAllChallenges();
  const progress = store.getProgress(userId);
  const solvedIds = new Set(progress.map(p => p.challenge_id));

  const categories = {};
  all.forEach(ch => {
    if (!categories[ch.category]) {
      categories[ch.category] = {
        code: ch.category,
        name: ch.category_name,
        challenges: [],
        solved: 0,
        total: 0,
        points: 0,
        maxPoints: 0
      };
    }
    const solved = solvedIds.has(ch.id);
    categories[ch.category].challenges.push({ ...ch, solved: solved ? 1 : 0 });
    categories[ch.category].total++;
    categories[ch.category].maxPoints += ch.points;
    if (solved) {
      categories[ch.category].solved++;
      categories[ch.category].points += ch.points;
    }
  });

  const totalSolved = progress.length;
  const totalChallenges = all.length;
  const earnedPoints = Object.values(categories).reduce((s, c) => s + c.points, 0);
  const maxPoints = Object.values(categories).reduce((s, c) => s + c.maxPoints, 0);
  const hintCost = store.getTotalHintCost(userId);
  const totalPoints = Math.max(0, earnedPoints - hintCost);
  const percent = totalChallenges ? Math.round((totalSolved / totalChallenges) * 100) : 0;

  const recentReports = store.getReportsByUser(userId).slice(0, 5).map(r => {
    const ch = r.challenge_id ? store.getChallengeById(r.challenge_id) : null;
    return { ...r, challenge_title: ch ? ch.title : null };
  });

  res.render('dashboard/index', {
    title: 'داشبورد',
    categories: Object.values(categories).sort((a, b) => a.code.localeCompare(b.code)),
    totalSolved,
    totalChallenges,
    totalPoints,
    earnedPoints,
    hintCost,
    maxPoints,
    percent,
    recentReports
  });
});

router.get('/guide', (req, res) => {
  res.render('guide', { title: 'راهنمای کامل' });
});


router.get('/academy', (req, res) => {
  res.render('academy', { title: 'آکادمی تست نفوذ' });
});

router.get('/arena', (req, res) => {
  res.render('arena', { title: 'آرنای ۱۰۰ امتیازی' });
});

router.get('/reporting-guide', (req, res) => {
  res.render('reporting-guide', { title: 'اصول گزارش‌نویسی حرفه‌ای' });
});

module.exports = router;
