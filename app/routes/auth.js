const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../models/store');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'ورود', error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.findUserByEmail(email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('auth/login', { title: 'ورود', error: 'ایمیل یا رمز عبور اشتباه است' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    clan_id: user.clan_id || null
  };
  res.redirect('/dashboard');
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'ثبت‌نام', error: null });
});

router.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password || password.length < 6) {
    return res.render('auth/register', { title: 'ثبت‌نام', error: 'همه فیلدها الزامی و رمز حداقل ۶ کاراکتر' });
  }

  if (store.findUserByEmail(email)) {
    return res.render('auth/register', { title: 'ثبت‌نام', error: 'این ایمیل قبلاً ثبت شده' });
  }

  const user = store.createUser({ email, username, password });
  req.session.user = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    clan_id: user.clan_id || null
  };
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
