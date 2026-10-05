const express = require('express');
const store = require('../models/store');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

// Hint costs by index (first hint cheaper)
const HINT_COSTS = [5, 10, 15];

router.get('/category/:code', requireAuth, (req, res) => {
  const code = req.params.code.toUpperCase();
  const userId = req.session.user.id;
  const challenges = store.getChallengesByCategory(code).map(ch => ({
    ...ch,
    solved: store.isSolved(userId, ch.id) ? 1 : 0
  }));

  if (challenges.length === 0) {
    return res.status(404).render('404', { title: 'دسته پیدا نشد' });
  }

  const categoryName = challenges[0].category_name;
  const solved = challenges.filter(c => c.solved).length;
  const percent = Math.round((solved / challenges.length) * 100);

  res.render('challenges/category', {
    title: `${code} - ${categoryName}`,
    code,
    categoryName,
    challenges,
    solved,
    total: challenges.length,
    percent
  });
});

router.get('/:slug', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const challenge = store.getChallengeBySlug(req.params.slug);
  if (!challenge) {
    return res.status(404).render('404', { title: 'چالش پیدا نشد' });
  }

  const solved = store.isSolved(userId, challenge.id);
  const unlockedIndexes = store.getUnlockedHints(userId, challenge.id);
  const hints = Array.isArray(challenge.hints) ? challenge.hints : [];
  const unlockedHints = unlockedIndexes.map(i => ({ index: i, text: hints[i], cost: HINT_COSTS[i] || 10 }));
  const nextHintIndex = unlockedIndexes.length < hints.length ? unlockedIndexes.length : null;
  const nextHintCost = nextHintIndex !== null ? (HINT_COSTS[nextHintIndex] || 10) : null;
  const hintPenalty = store.getHintCostForChallenge(userId, challenge.id);
  const userPoints = store.getUserPoints(userId);

  res.render('challenges/detail', {
    title: challenge.title,
    challenge: { ...challenge, solved: solved ? 1 : 0 },
    unlockedHints,
    nextHintIndex,
    nextHintCost,
    totalHints: hints.length,
    hintPenalty,
    userPoints,
    message: null,
    error: null
  });
});

// Unlock next hint (costs points)
router.post('/:slug/hint', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const challenge = store.getChallengeBySlug(req.params.slug);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'چالش پیدا نشد' });
  }

  const hints = Array.isArray(challenge.hints) ? challenge.hints : [];
  const unlocked = store.getUnlockedHints(userId, challenge.id);
  const nextIndex = unlocked.length;

  if (nextIndex >= hints.length) {
    return res.json({ success: false, message: 'همه راهنمایی‌ها باز شده‌اند' });
  }

  const cost = HINT_COSTS[nextIndex] || 10;
  // Allow going negative conceptually but store tracks cost; points calculated as earned - spent
  const result = store.unlockHint(userId, challenge.id, nextIndex, cost);
  if (!result.success) {
    return res.json(result);
  }

  return res.json({
    success: true,
    hint: hints[nextIndex],
    index: nextIndex,
    cost,
    message: `راهنمایی باز شد. ${cost} امتیاز کم شد.`,
    remainingHints: hints.length - nextIndex - 1
  });
});

router.post('/:slug/flag', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const { flag } = req.body;
  const challenge = store.getChallengeBySlug(req.params.slug);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'چالش پیدا نشد' });
  }

  if (store.isSolved(userId, challenge.id)) {
    return res.json({ success: true, message: 'قبلاً حل کرده‌ای!', already: true });
  }

  const normalized = (flag || '').trim().replace(/^['"]|['"]$/g, '');
  const expected = (challenge.flag || '').trim();
  if (normalized && expected && normalized === expected) {
    store.markSolved(userId, challenge.id, flag.trim());

    const solvedInCat = store.countSolvedInCategory(userId, challenge.category);
    const totalInCat = store.getChallengesByCategory(challenge.category).length;

    if (solvedInCat === totalInCat) {
      store.addBadge(userId, `master_${challenge.category.toLowerCase()}`, `${challenge.category_name} Master`);
    }

    const penalty = store.getHintCostForChallenge(userId, challenge.id);
    const net = Math.max(0, (challenge.points || 0) - penalty);

    return res.json({
      success: true,
      message: '🎉 فلگ صحیح است! چالش حل شد.',
      points: challenge.points,
      penalty,
      net
    });
  }

  return res.json({ success: false, message: 'فلگ اشتباه است. دوباره تلاش کن.' });
});

module.exports = router;
