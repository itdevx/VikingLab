const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const { seedAll } = require('./models/seed');
const { connectMongo } = require('./models/mongo');

const authRoutes = require('./routes/auth');
const mainRoutes = require('./routes/main');
const challengeRoutes = require('./routes/challenges');
const reportRoutes = require('./routes/reports');
const vulnerableRoutes = require('./routes/vulnerable');
const clanRoutes = require('./routes/clans');


// --- Platform hardening (not applied to intentional /lab vulns) ---
const loginAttempts = new Map();
function authRateLimit(req, res, next) {
  if (req.path !== '/login' || req.method !== 'POST') return next();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let rec = loginAttempts.get(ip) || { count: 0, start: now };
  if (now - rec.start > 15 * 60 * 1000) rec = { count: 0, start: now };
  rec.count++;
  loginAttempts.set(ip, rec);
  if (rec.count > 30) {
    return res.status(429).send('Too many login attempts. Try later.');
  }
  next();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'vikinglab-super-secret-change-in-prod-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', mainRoutes);
app.use('/auth', authRateLimit, authRoutes);
app.use('/challenges', challengeRoutes);
app.use('/reports', reportRoutes);
app.use('/lab', vulnerableRoutes);
app.use('/clans', clanRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'صفحه پیدا نشد' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'خطا', error: process.env.NODE_ENV==='production' ? 'خطای داخلی' : err.message });
});

// Force re-seed if needed via env, else smart seed
connectMongo().finally(() => seedAll(process.env.FORCE_SEED === '1'));

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║           ⚔️  Viking Lab is running!              ║
║                                                      ║
║   Local:   http://localhost:${PORT}                    ║
║   ~100 challenges · Shop · Trade · Blog              ║
║                                                      ║
║   Register at /auth/register                         ║
╚══════════════════════════════════════════════════════╝
  `);
});
