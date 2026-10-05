const express = require('express');
const store = require('../models/store');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.get('/', requireAuth, (req, res) => {
  const reports = store.getReportsByUser(req.session.user.id).map(r => {
    const ch = r.challenge_id ? store.getChallengeById(r.challenge_id) : null;
    return {
      ...r,
      challenge_title: ch ? ch.title : null,
      category: ch ? ch.category : null
    };
  });
  res.render('reports/list', { title: 'گزارش‌های من', reports });
});

router.get('/new', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const challenges = store.getAllChallenges().map(c => ({
    ...c,
    solved: store.isSolved(userId, c.id) ? 1 : 0
  }));
  res.render('reports/new', {
    title: 'ثبت گزارش جدید',
    challenges,
    error: null,
    form: {}
  });
});

router.post('/new', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const {
    challenge_id, title, vulnerability_type, severity,
    url, description, impact, poc, remediation, cvss
  } = req.body;

  if (!title || !description) {
    const challenges = store.getAllChallenges();
    return res.render('reports/new', {
      title: 'ثبت گزارش جدید',
      challenges,
      error: 'عنوان و توضیحات الزامی هستند',
      form: req.body
    });
  }

  let quality = 0;
  if (title && title.length > 10) quality += 1;
  if (description && description.length > 100) quality += 2;
  if (description && description.length > 300) quality += 1;
  if (impact && impact.length > 50) quality += 2;
  if (poc && poc.length > 30) quality += 2;
  if (remediation && remediation.length > 30) quality += 2;
  if (severity) quality += 1;
  if (cvss) quality += 1;
  if (url) quality += 1;

  const report = store.createReport({
    user_id: userId,
    challenge_id: challenge_id ? Number(challenge_id) : null,
    title,
    vulnerability_type: vulnerability_type || null,
    severity: severity || null,
    url: url || null,
    description,
    impact: impact || null,
    poc: poc || null,
    remediation: remediation || null,
    cvss: cvss || null,
    quality_score: quality
  });

  res.redirect(`/reports/${report.id}?success=1`);
});

router.get('/:id', requireAuth, (req, res) => {
  const report = store.getReport(req.params.id, req.session.user.id);
  if (!report) {
    return res.status(404).render('404', { title: 'گزارش پیدا نشد' });
  }

  const ch = report.challenge_id ? store.getChallengeById(report.challenge_id) : null;
  res.render('reports/view', {
    title: report.title,
    report: {
      ...report,
      challenge_title: ch ? ch.title : null,
      challenge_slug: ch ? ch.slug : null
    },
    success: req.query.success
  });
});

module.exports = router;
