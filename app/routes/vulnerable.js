/**
 * INTENTIONALLY VULNERABLE LAB — RavenShop / RavenTrade / RavenBlog
 * Realistic UI + real vulnerability surfaces. Training only.
 */
const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

const comments = [];
const blogPosts = [
  { id: 1, uuid: 'a1b2c3d4-0001', title: 'شروع سرمایه‌گذاری در کریپتو', public: true, body: 'در این مطلب با اصول اولیه بازار آشنا می‌شوید...', author: 'سارا', date: '۱۴۰۳/۰۷/۱۲' },
  { id: 2, uuid: 'a1b2c3d4-0002', title: 'تحلیل تکنیکال بیت‌کوین', public: true, body: 'نمودار هفتگی و سطوح حمایت...', author: 'رضا', date: '۱۴۰۳/۰۷/۱۰' },
  { id: 3, uuid: 'a1b2c3d4-0003', title: 'یادداشت محرمانه هیئت مدیره', public: false, body: 'FLAG{idor_uuid_private_post}', author: 'admin', date: '۱۴۰۳/۰۷/۰۱' }
];
const usersLab = [
  { id: 1, username: 'alice', email: 'alice@shop.lab', role: 'user', bio: 'علاقه‌مند به گجت', password: 'alice123' },
  { id: 2, username: 'bob', email: 'bob@shop.lab', role: 'user', bio: 'فروشنده رسمی', password: 'bob123' },
  { id: 3, username: 'admin', email: 'admin@shop.lab', role: 'admin', bio: 'FLAG{idor_is_everywhere}', password: 'admin123' }
];
const orders = [
  { id: 1001, userId: 1, total: 2490000, items: 'هدفون بی‌سیم Pro', status: 'تحویل شده' },
  { id: 1002, userId: 2, total: 890000, items: 'کابل USB-C', status: 'در ارسال' },
  { id: 1003, userId: 3, total: 0, items: 'FLAG{idor_orders_admin_secret}', status: 'داخلی' }
];

function shell(app, title, content, opts = {}) {
  const themes = {
    shop: {
      brand: 'RavenShop', icon: '🛒',
      nav: [
        { href: '/lab/shop', label: 'خانه' },
        { href: '/lab/shop/search', label: 'جستجو' },
        { href: '/lab/shop/product', label: 'محصولات' },
        { href: '/lab/shop/cart', label: 'سبد' },
        { href: '/lab/shop/orders', label: 'سفارش' },
        { href: '/lab/shop/profile?id=1', label: 'پروفایل' }
      ]
    },
    trade: {
      brand: 'RavenTrade', icon: '📈',
      nav: [
        { href: '/lab/trade', label: 'بازار' },
        { href: '/lab/trade/dashboard', label: 'داشبورد' },
        { href: '/lab/trade/transfer', label: 'انتقال' },
        { href: '/lab/trade/login', label: 'ورود' }
      ]
    },
    blog: {
      brand: 'RavenBlog', icon: '✍️',
      nav: [
        { href: '/lab/blog', label: 'خانه' },
        { href: '/lab/blog/posts', label: 'مطالب' },
        { href: '/lab/blog/register', label: 'عضویت' },
        { href: '/lab/blog/graphql', label: 'GraphQL' }
      ]
    },
    war: {
      brand: 'WarOps', icon: '⚔️',
      nav: [
        { href: '/lab/war', label: 'مرکز فرمان' },
        { href: '/lab/war/search', label: 'لاگ' },
        { href: '/lab/war/login', label: 'ورود' },
        { href: '/lab/war/intel?id=1', label: 'Intel' },
        { href: '/lab/war/relay', label: 'Relay' },
        { href: '/lab/war/command', label: 'Command' },
        { href: '/lab/war/vault', label: 'Vault' }
      ]
    },
    network: {
      brand: 'NetLab', icon: '🌐',
      nav: [
        { href: '/lab/network', label: 'خانه' },
        { href: '/lab/network/scan', label: 'Scan' },
        { href: '/lab/network/dns', label: 'DNS' },
        { href: '/lab/network/port/8080', label: ':8080' }
      ]
    }
  };
  const t = themes[app] || themes.shop;
  const navHtml = t.nav.map(n =>
    `<a href="${n.href}" class="px-2.5 py-1.5 rounded-lg text-xs opacity-80 hover:opacity-100 hover:bg-white/10">${n.label}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title || t.brand} | Viking Lab</title>
  <script>
    document.documentElement.classList.add('dark');
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={darkMode:'class'}</script>
  <link rel="stylesheet" href="/css/viking.css">
  <style>@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap');</style>
</head>
<body class="viking min-h-screen flex flex-col">
  <header class="vk-nav sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-2">
      <a href="/lab/${app === 'network' ? 'network' : app}" class="flex items-center gap-2 font-bold text-sm">
        <span>${t.icon}</span>
        <span class="vk-brand-gold">${t.brand}</span>
      </a>
      <nav class="flex items-center gap-0.5 overflow-x-auto max-w-[55vw] sm:max-w-none scrollbar-none">${navHtml}</nav>
      <div class="flex items-center gap-2 text-xs shrink-0">
        <a href="/lab" class="opacity-70">هدف‌ها</a>
        <a href="/dashboard" class="opacity-70">داشبورد</a>
      </div>
    </div>
  </header>
  <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
    ${opts.hideTitle ? '' : (title ? `<h1 class="text-xl font-bold mb-4">${title}</h1>` : '')}
    ${content}
  </main>
  <footer class="border-t border-[var(--vk-border)] py-4 text-center text-[10px] opacity-50">
    ${t.brand} — محیط تمرینی آسیب‌پذیر · بخشی از Viking Lab
  </footer>
  <script>document.documentElement.classList.add('dark');</script>
</body>
</html>`;
}

// ========== LAB INDEX ==========
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="fa" dir="rtl"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>محیط‌های هدف | Viking Lab</title>
    <script>(function(){try{var t=localStorage.getItem('itdevx-theme')||'dark';document.documentElement.classList.add(t==='light'?'light':'dark');if(t==='light')document.documentElement.classList.remove('dark');}catch(e){}})();</script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/css/viking.css">
    <style>@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap');</style>
  </head><body class="viking min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <div class="vk-rune text-3xl mb-2">⚔️</div>
        <h1 class="text-2xl font-extrabold vk-brand-gold mb-2">محیط‌های هدف Viking Lab</h1>
        <p class="text-sm" style="color:var(--vk-muted)">هر کارت یک برنامه جدا است و فقط منوی همان برنامه را دارد</p>
      </div>
      <div class="lab-grid">
        <a href="/lab/shop" class="lab-card"><span class="icon">🛒</span><h3>RavenShop</h3><p>فروشگاه — XSS، SQLi، IDOR، SSRF</p></a>
        <a href="/lab/trade" class="lab-card"><span class="icon">📈</span><h3>RavenTrade</h3><p>ترید — JWT، Race، MFA</p></a>
        <a href="/lab/blog" class="lab-card"><span class="icon">✍️</span><h3>RavenBlog</h3><p>بلاگ — UUID، GraphQL، OAuth</p></a>
        <a href="/lab/war" class="lab-card"><span class="icon">⚔️</span><h3>WarOps</h3><p>جنگ کلَن — فقط WAR</p></a>
        <a href="/lab/network" class="lab-card"><span class="icon">🌐</span><h3>NetLab</h3><p>پورت، DNS، سرویس داخلی</p></a>
        <a href="/lab/tools/burp" class="lab-card"><span class="icon">🛠️</span><h3>Tools</h3><p>تمرین Burp و ابزارها</p></a>
      </div>
      <div class="text-center mt-8 text-sm"><a href="/dashboard" class="opacity-60 hover:opacity-100">← داشبورد</a></div>
    </div>
    <script>
    (function(){var t=localStorage.getItem('itdevx-theme')||'dark';
      if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}
      else document.documentElement.classList.add('dark');
    })();
    </script>
  </body></html>`);
});

router.get('/shop', (req, res) => {
  res.set('X-Powered-By', 'Express-Vulnerable/1.2.3');
  res.set('X-Lab-Flag-Header', 'FLAG{verbose_headers_leak}');
  res.send(shell('shop', '', `
    <div class="relative rounded-3xl overflow-hidden mb-10 border border-white/10">
      <div class="absolute inset-0 bg-gradient-to-l from-indigo-600/40 via-violet-600/20 to-transparent"></div>
      <div class="relative p-10 md:p-14">
        <p class="text-indigo-300 text-sm font-medium mb-2">مجموعه پاییز ۱۴۰۳</p>
        <h2 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">گجت‌هایی که<br>روزمره‌ات را عوض می‌کنند</h2>
        <p class="text-slate-300 max-w-md mb-6">هدفون، شارژر، کابل و لوازم جانبی با گارانتی اصالت.</p>
        <div class="flex flex-wrap gap-3">
          <a href="/lab/shop/product" class="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition">مشاهده محصولات</a>
          <a href="/lab/shop/search" class="border border-white/20 px-6 py-3 rounded-xl hover:bg-white/5 transition">جستجو</a>
        </div>
      </div>
    </div>
    <div class="grid sm:grid-cols-3 gap-4 mb-10">
      ${[
        { t: 'هدفون بی‌سیم Pro', p: '۲٬۴۹۰٬۰۰۰', href: '/lab/shop/product' },
        { t: 'شارژر ۶۵ وات GaN', p: '۱٬۲۹۰٬۰۰۰', href: '/lab/shop/product' },
        { t: 'کابل USB-C بافته', p: '۲۸۹٬۰۰۰', href: '/lab/shop/product' }
      ].map(x => `
        <a href="${x.href}" class="block bg-slate-900/80 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/40 transition group">
          <div class="h-32 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition">🎧</div>
          <div class="font-semibold">${x.t}</div>
          <div class="text-indigo-400 text-sm mt-1">${x.p} تومان</div>
        </a>`).join('')}
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
      <a href="/lab/shop/admin-login" class="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-red-500/30">🔐 ورود ادمین</a>
      <a href="/lab/shop/tools/ping" class="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30">📡 ابزار شبکه</a>
      <a href="/lab/shop/preview" class="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30">🔗 پیش‌نمایش لینک</a>
      <a href="/lab/shop/admin" class="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-amber-500/30">⚙️ پنل مدیریت</a>
    </div>
    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <!-- FLAG{outdated_jquery_and_no_sri} -->
  `, { hideTitle: true }));
});

router.get('/shop/search', (req, res) => {
  const q = req.query.q || '';
  let extra = '';
  if (/<script|onerror|onload|svg\/onload/i.test(q)) {
    extra = `<div class="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">XSS اجرا شد — FLAG{reflected_xss_is_still_alive_2024}</div>`;
  }
  if (q.includes("'") && /union|or\s+1/i.test(q)) {
    extra += `<div class="mt-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">الگوی SQLi — FLAG{sqli_in_search_api}</div>`;
  }
  res.send(shell('shop', 'جستجو در فروشگاه', `
    <form method="GET" class="flex gap-2 max-w-xl mb-8">
      <input name="q" value="${String(q).replace(/"/g, '&quot;')}" placeholder="نام محصول، برند..."
        class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500">
      <button class="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-xl font-medium">جستجو</button>
    </form>
    ${q ? `<div class="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
      <p class="text-slate-400 text-sm mb-2">نتایج برای</p>
      <div class="text-lg">${q}</div>
      <p class="text-slate-500 text-sm mt-4">محصولی با این عبارت پیدا نشد.</p>
      ${extra}
    </div>` : `<p class="text-slate-500">عبارت جستجو را وارد کنید.</p>`}
  `));
});

router.get('/shop/product', (req, res) => {
  const list = comments.length
    ? comments.map(c => `<div class="flex gap-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
        <div class="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold">${(c.author || '?')[0]}</div>
        <div><div class="font-medium text-sm">${c.author}</div><div class="text-slate-300 text-sm mt-1">${c.text}</div></div>
      </div>`).join('')
    : '<p class="text-slate-500 text-sm">هنوز نظری ثبت نشده. اولین نفر باشید.</p>';
  res.send(shell('shop', '', `
    <div class="grid lg:grid-cols-2 gap-10 mb-12">
      <div class="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 h-80 flex items-center justify-center text-8xl border border-white/5">🎧</div>
      <div>
        <div class="text-sm text-indigo-400 mb-2">صوتی · پرفروش</div>
        <h1 class="text-3xl font-bold mb-3">هدفون بی‌سیم Pro</h1>
        <p class="text-slate-400 leading-relaxed mb-6">نویزکنسلینگ فعال، ۳۰ ساعت باتری، اتصال چند دستگاه. گارانتی ۱۸ ماهه فروشگاه.</p>
        <div class="text-2xl font-bold text-indigo-300 mb-6">۲٬۴۹۰٬۰۰۰ <span class="text-sm font-normal text-slate-500">تومان</span></div>
        <div class="flex gap-3">
          <a href="/lab/shop/cart" class="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-semibold">افزودن به سبد</a>
          <a href="/lab/shop/orders" class="border border-white/10 px-6 py-3 rounded-xl">پیگیری سفارش</a>
        </div>
      </div>
    </div>
    <section class="border-t border-white/5 pt-10">
      <h2 class="text-xl font-bold mb-6">نظرات خریداران</h2>
      <div class="space-y-3 mb-8">${list}</div>
      <form method="POST" class="bg-slate-900/60 border border-white/5 rounded-2xl p-6 max-w-xl space-y-3">
        <div class="text-sm font-medium mb-1">ثبت نظر</div>
        <input name="author" value="مهمان" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="نام">
        <textarea name="comment" rows="3" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm" placeholder="نظر شما..."></textarea>
        <button class="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium">ارسال نظر</button>
      </form>
    </section>
  `, { hideTitle: true }));
});

router.post('/shop/product', (req, res) => {
  const { author = 'مهمان', comment = '' } = req.body;
  comments.push({ author, text: comment });
  if (/<script|onerror|onload/i.test(comment)) {
    comments.push({ author: 'سیستم', text: 'FLAG{stored_xss_persists_forever}' });
  }
  res.redirect('/lab/shop/product');
});

router.get('/shop/admin-login', (req, res) => {
  res.send(shell('shop', 'ورود مدیران', `
    <div class="max-w-md mx-auto">
      <div class="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/40">
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mx-auto mb-3">🔐</div>
          <p class="text-slate-400 text-sm">فقط پرسنل مجاز</p>
        </div>
        <form method="POST" class="space-y-4">
          <div>
            <label class="text-xs text-slate-500 mb-1 block">نام کاربری</label>
            <input name="username" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500/50 focus:outline-none">
          </div>
          <div>
            <label class="text-xs text-slate-500 mb-1 block">رمز عبور</label>
            <input name="password" type="password" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-red-500/50 focus:outline-none">
          </div>
          <button class="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-semibold transition">ورود به پنل</button>
        </form>
      </div>
    </div>
  `));
});

router.post('/shop/admin-login', (req, res) => {
  const { username = '', password = '' } = req.body;
  const bypass = /'/.test(username + password) || /or\s+1\s*=\s*1/i.test(username + password);
  const ok = bypass || (username === 'admin' && ['admin123', 'admin', 'password'].includes(password));
  if (ok) {
    return res.send(shell('shop', 'پنل مدیریت', `
      <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
        <div class="text-4xl mb-3">✅</div>
        <p class="text-xl font-bold text-emerald-300 mb-2">ورود موفق</p>
        <p class="font-mono text-sm text-yellow-300">FLAG{classic_sqli_union_or_bypass}</p>
        <p class="font-mono text-sm text-yellow-300 mt-1">FLAG{default_admin_creds}</p>
      </div>
      <pre class="mt-6 bg-black/50 p-4 rounded-xl text-xs text-red-300/80 overflow-x-auto">Query: SELECT * FROM users WHERE user='${username}' AND pass='${password}'</pre>
    `));
  }
  const msg = username === 'admin' ? 'رمز عبور اشتباه است' : 'کاربری با این مشخصات یافت نشد';
  res.send(shell('shop', 'ورود ناموفق', `
    <div class="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
      <p class="text-red-300 mb-4">${msg}</p>
      <a href="/lab/shop/admin-login" class="text-indigo-400 text-sm">تلاش مجدد</a>
      <p class="text-xs text-slate-500 mt-6 font-mono">FLAG{user_enumeration_via_error_messages}</p>
    </div>
  `));
});

router.get('/shop/profile', (req, res) => {
  const id = parseInt(req.query.id) || 1;
  const u = usersLab.find(x => x.id === id) || usersLab[0];
  res.send(shell('shop', 'پروفایل کاربری', `
    <div class="max-w-lg">
      <div class="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        <div class="h-24 bg-gradient-to-l from-indigo-600 to-violet-600"></div>
        <div class="px-6 pb-6 -mt-10">
          <div class="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold mb-4">${u.username[0].toUpperCase()}</div>
          <h2 class="text-xl font-bold">${u.username}</h2>
          <p class="text-slate-400 text-sm">${u.email}</p>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="bg-slate-950 rounded-xl p-3"><div class="text-slate-500 text-xs">نقش</div><div>${u.role}</div></div>
            <div class="bg-slate-950 rounded-xl p-3"><div class="text-slate-500 text-xs">شناسه</div><div>#${u.id}</div></div>
          </div>
          <div class="mt-3 bg-slate-950 rounded-xl p-3 text-sm">
            <div class="text-slate-500 text-xs mb-1">درباره</div>
            <div>${u.bio}</div>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-600 mt-4">پارامتر ?id= در URL قابل تغییر است</p>
    </div>
  `));
});

router.get('/shop/orders', (req, res) => {
  const oid = parseInt(req.query.order_id);
  if (oid) {
    const o = orders.find(x => x.id === oid);
    if (o) {
      return res.send(shell('shop', `سفارش #${o.id}`, `
        <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg space-y-3">
          <div class="flex justify-between"><span class="text-slate-500">شماره</span><span class="font-mono">#${o.id}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">کاربر</span><span>${o.userId}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">مبلغ</span><span>${o.total.toLocaleString('fa-IR')} تومان</span></div>
          <div class="flex justify-between"><span class="text-slate-500">وضعیت</span><span class="text-indigo-300">${o.status}</span></div>
          <div class="pt-3 border-t border-white/5"><span class="text-slate-500 text-sm">اقلام:</span><div class="mt-1">${o.items}</div></div>
        </div>
      `));
    }
  }
  res.send(shell('shop', 'سفارش‌های من', `
    <div class="space-y-3 max-w-xl">
      ${orders.map(o => `
        <a href="?order_id=${o.id}" class="flex items-center justify-between bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-xl px-5 py-4 transition">
          <div>
            <div class="font-medium">#${o.id}</div>
            <div class="text-sm text-slate-500">${o.items}</div>
          </div>
          <div class="text-left">
            <div class="text-sm">${o.total.toLocaleString('fa-IR')} ت</div>
            <div class="text-xs text-indigo-400">${o.status}</div>
          </div>
        </a>`).join('')}
    </div>
  `));
});

router.get('/shop/cart', (req, res) => {
  res.send(shell('shop', 'سبد خرید', `
    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6">
        <div class="flex gap-4 items-center">
          <div class="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-3xl">🎧</div>
          <div class="flex-1">
            <div class="font-semibold">هدفون بی‌سیم Pro</div>
            <div class="text-sm text-slate-500">گارانتی ۱۸ ماه</div>
          </div>
          <div class="text-indigo-300 font-medium">۲٬۴۹۰٬۰۰۰ ت</div>
        </div>
      </div>
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-6 h-fit">
        <h3 class="font-bold mb-4">خلاصه سفارش</h3>
        <form method="POST" action="/lab/shop/checkout" class="space-y-3">
          <input type="hidden" name="product" value="headphone">
          <div>
            <label class="text-xs text-slate-500">تعداد</label>
            <input name="quantity" type="number" value="1" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 mt-1">
          </div>
          <div>
            <label class="text-xs text-slate-500">قیمت واحد (تومان)</label>
            <input name="price" type="number" value="2490000" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 mt-1">
          </div>
          <button class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold mt-2">تکمیل خرید</button>
        </form>
      </div>
    </div>
  `));
});

router.post('/shop/checkout', (req, res) => {
  const price = Number(req.body.price);
  const qty = Number(req.body.quantity);
  const total = price * qty;
  let flag = '';
  if (price <= 0 || qty < 0) flag = '<div class="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">FLAG{business_logic_price_qty_abuse}</div>';
  if (price > 0 && price < 1000) flag += '<div class="mt-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">FLAG{client_side_price_tampering}</div>';
  res.send(shell('shop', 'فاکتور', `
    <div class="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
      <div class="text-4xl mb-3">🧾</div>
      <p class="text-slate-400 text-sm">مبلغ قابل پرداخت</p>
      <p class="text-3xl font-bold mt-1">${Number.isFinite(total) ? total.toLocaleString('fa-IR') : total} تومان</p>
      ${flag}
    </div>
  `));
});

router.get('/shop/tools/ping', (req, res) => {
  res.send(shell('shop', 'ابزار شبکه — Ping', `
    <div class="max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6">
      <p class="text-sm text-slate-400 mb-4">وضعیت اتصال سرور به میزبان خارجی را بررسی کنید.</p>
      <form method="POST" class="flex gap-2">
        <input name="host" placeholder="مثلاً 8.8.8.8" class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
        <button class="bg-emerald-600 hover:bg-emerald-500 px-6 rounded-xl font-medium">اجرا</button>
      </form>
    </div>
  `));
});

router.post('/shop/tools/ping', (req, res) => {
  const host = req.body.host || '127.0.0.1';
  exec(`ping -c 1 ${host}`, { timeout: 4000 }, (err, stdout, stderr) => {
    const out = stdout || stderr || (err && err.message) || '';
    const flag = /;|\||&&|\$\(/.test(host)
      ? '<div class="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">FLAG{command_injection_is_dangerous}</div>' : '';
    res.send(shell('shop', 'خروجی Ping', `
      <pre class="bg-black/60 border border-white/5 rounded-2xl p-5 text-sm text-emerald-400/90 overflow-auto font-mono">${String(out).replace(/</g, '&lt;')}</pre>
      ${flag}
      <a href="/lab/shop/tools/ping" class="inline-block mt-4 text-sm text-indigo-400">بازگشت</a>
    `));
  });
});

router.get('/shop/tools/traceroute', (req, res) => {
  res.send(shell('shop', 'Traceroute', `
    <div class="max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6">
      <form method="POST" class="space-y-3">
        <input name="host" placeholder="آدرس IP (فقط عدد و نقطه)" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
        <button class="bg-emerald-600 px-6 py-2.5 rounded-xl">اجرا</button>
      </form>
      <p class="text-xs text-slate-500 mt-3">ورودی فیلتر می‌شود</p>
    </div>
  `));
});

router.post('/shop/tools/traceroute', (req, res) => {
  const host = req.body.host || '';
  if (/[;|&]/.test(host) && !/\$\(/.test(host) && !/`/.test(host)) {
    return res.send(shell('shop', 'مسدود', '<div class="text-red-400 p-4 bg-red-500/10 rounded-xl">کاراکتر غیرمجاز</div>'));
  }
  if (/\$\(|`/.test(host) || /flag/i.test(host)) {
    return res.send(shell('shop', 'خروجی', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono">FLAG{advanced_cmdi_bypass_ninja}</div>'));
  }
  res.send(shell('shop', 'خروجی', `<pre class="bg-black/50 p-4 rounded-xl text-sm">traceroute to ${host} (simulated hops...)</pre>`));
});

router.get('/shop/preview', (req, res) => {
  res.send(shell('shop', 'پیش‌نمایش لینک محصول', `
    <div class="max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-6">
      <p class="text-sm text-slate-400 mb-4">آدرس صفحه محصول رقیب یا منبع را وارد کنید تا پیش‌نمایش متا نمایش داده شود.</p>
      <form method="POST" class="space-y-3">
        <input name="url" placeholder="https://example.com/product/..." class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
        <button class="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-medium">دریافت پیش‌نمایش</button>
      </form>
    </div>
  `));
});

router.post('/shop/preview', (req, res) => {
  const url = req.body.url || '';
  if (/127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\]|169\.254\.169\.254/i.test(url)) {
    return res.send(shell('shop', 'پاسخ داخلی', `
      <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 font-mono text-sm text-emerald-300 space-y-1">
        <div>FLAG{ssrf_to_internal_service}</div>
        <div>FLAG{ssrf_cloud_metadata_credentials}</div>
      </div>`));
  }
  if (url.startsWith('file:')) {
    return res.send(shell('shop', 'فایل', `<div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-emerald-300 font-mono">FLAG{ssrf_file_protocol}</div>`));
  }
  res.send(shell('shop', 'پیش‌نمایش', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-xl">
      <div class="text-xs text-slate-500 mb-2">منبع</div>
      <div class="text-sm break-all">${url}</div>
      <div class="mt-4 h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-sm">پیش‌نمایش شبیه‌سازی‌شده</div>
    </div>`));
});

router.get('/shop/preview-safe', (req, res) => {
  res.send(shell('shop', 'پیش‌نمایش (با فیلتر)', `
    <div class="max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-6">
      <form method="POST" class="space-y-3">
        <input name="url" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="URL">
        <button class="bg-indigo-600 px-6 py-2.5 rounded-xl">Fetch</button>
      </form>
      <p class="text-xs text-slate-500 mt-3">localhost و 127.0.0.1 در لیست سیاه‌اند</p>
    </div>`));
});

router.post('/shop/preview-safe', (req, res) => {
  const url = (req.body.url || '').toLowerCase();
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return res.send(shell('shop', 'مسدود', '<div class="text-red-400 p-4 bg-red-500/10 rounded-xl">Blocked by blacklist</div>'));
  }
  if (/127\.1|0\.0\.0\.0|0x7f|2130706433|::1/.test(url)) {
    return res.send(shell('shop', 'Bypass', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono">FLAG{ssrf_blacklist_bypass}</div>'));
  }
  res.send(shell('shop', 'OK', `<p class="text-slate-400">${url}</p>`));
});

router.get('/shop/stock', (req, res) => {
  const id = req.query.id || '1';
  let available = true;
  if (/1\s*=\s*2|'1'\s*=\s*'2'|and\s+0/i.test(id)) available = false;
  if (/substr|length|flag|secret/i.test(id) && /1\s*=\s*1/i.test(id)) {
    return res.send(shell('shop', 'موجودی', '<div class="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 font-mono">FLAG{blind_sqli_boolean_based_extraction}</div>'));
  }
  res.send(shell('shop', 'استعلام موجودی انبار', `
    <form method="GET" class="flex gap-2 max-w-md mb-6">
      <input name="id" value="${String(id).replace(/"/g, '&quot;')}" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3">
      <button class="bg-indigo-600 px-5 rounded-xl">بررسی</button>
    </form>
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full ${available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}">
      ${available ? '● موجود در انبار' : '○ ناموجود'}
    </div>
  `));
});

router.get('/shop/download', (req, res) => {
  const file = req.query.file || 'invoice.pdf';
  if (file.includes('..') || /flag|etc/i.test(file)) {
    return res.send(shell('shop', 'دانلود', `<pre class="bg-black/50 p-5 rounded-2xl text-emerald-300 text-sm">Content of ${file}:\nFLAG{path_traversal_download}</pre>`));
  }
  res.send(shell('shop', 'دانلود فاکتور', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md">
      <p class="text-sm text-slate-400 mb-2">فایل درخواستی</p>
      <p class="font-mono text-indigo-300">${file}</p>
      <p class="text-xs text-slate-600 mt-4">?file=invoice.pdf</p>
    </div>`));
});

router.get('/shop/admin', (req, res) => {
  res.send(shell('shop', 'پنل مدیریت', `
    <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto">
      <div class="text-4xl mb-3">⚠️</div>
      <p class="text-lg font-bold text-amber-200">دسترسی با Force Browsing</p>
      <p class="font-mono text-yellow-300 mt-3">FLAG{force_browsing_works}</p>
    </div>`));
});

router.get('/shop/uploads', (req, res) => {
  res.send(shell('shop', 'Index of /uploads/', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden font-mono text-sm">
      <div class="px-4 py-3 border-b border-white/5 text-slate-500">Directory listing</div>
      <a href="/lab/shop/uploads/avatar1.png" class="block px-4 py-2.5 hover:bg-white/5 border-b border-white/5">avatar1.png</a>
      <a href="/lab/shop/uploads/secret-backup.txt" class="block px-4 py-2.5 hover:bg-white/5 border-b border-white/5 text-amber-300">secret-backup.txt</a>
      <a href="/lab/shop/uploads/notes.txt" class="block px-4 py-2.5 hover:bg-white/5">notes.txt</a>
    </div>`));
});

router.get('/shop/uploads/secret-backup.txt', (req, res) => {
  res.type('text').send('FLAG{directory_listing_sensitive_file}\nadmin_hash=5f4dcc3b5aa765d61d8327deb882cf99\n');
});

router.get('/shop/leaked-db', (req, res) => {
  res.send(shell('shop', 'نشت دیتابیس (شبیه‌سازی)', `
    <pre class="bg-black/60 border border-white/10 rounded-2xl p-6 text-sm text-red-300/90">admin:5f4dcc3b5aa765d61d8327deb882cf99
# MD5("password")
FLAG{weak_password_hash_md5}</pre>`));
});

router.get('/shop/monitoring', (req, res) => {
  res.send(shell('shop', 'مانیتورینگ', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6">
      <p class="text-slate-400">لاگ ورود ناموفق: <span class="text-slate-600">(خالی)</span></p>
      <p class="text-emerald-400 font-mono text-sm mt-4">FLAG{no_failed_login_logging}</p>
    </div>`));
});

router.get('/shop/soc', (req, res) => {
  res.send(shell('shop', 'مرکز عملیات امنیت', `
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-slate-900 rounded-xl p-4 border border-white/5"><div class="text-2xl font-bold">0</div><div class="text-xs text-slate-500">هشدار امروز</div></div>
      <div class="bg-slate-900 rounded-xl p-4 border border-white/5"><div class="text-2xl font-bold">۱۲۴</div><div class="text-xs text-slate-500">تلاش لاگین</div></div>
      <div class="bg-slate-900 rounded-xl p-4 border border-white/5"><div class="text-2xl font-bold text-red-400">—</div><div class="text-xs text-slate-500">قفل حساب</div></div>
    </div>
    <p class="font-mono text-sm text-emerald-400">FLAG{no_alerting_on_bruteforce}</p>`));
});

router.get('/shop/contact', (req, res) => {
  res.send(shell('shop', 'تماس با پشتیبانی', `
    <form method="POST" class="max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-3">
      <input name="email" placeholder="ایمیل" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5">
      <textarea name="msg" rows="4" placeholder="پیام شما" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5"></textarea>
      <button class="bg-indigo-600 px-6 py-2.5 rounded-xl">ارسال</button>
    </form>`));
});

router.post('/shop/contact', (req, res) => {
  const msg = req.body.msg || '';
  if (msg.includes('\n') || msg.includes('%0a') || msg.includes('\\n')) {
    return res.send(shell('shop', 'ثبت شد', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300">FLAG{log_injection_forged_entry}</div>'));
  }
  res.send(shell('shop', 'ثبت شد', '<p class="text-slate-400">پیام شما دریافت شد.</p>'));
});

router.get('/shop/register', (req, res) => {
  res.send(shell('shop', 'ساخت حساب', `
    <form method="POST" class="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-4">
      <input name="username" placeholder="نام کاربری" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <input name="password" placeholder="رمز عبور" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <button class="w-full bg-indigo-600 py-3 rounded-xl font-semibold">ثبت‌نام</button>
    </form>`));
});

router.post('/shop/register', (req, res) => {
  const u = req.body.username || '';
  if (u.includes("'")) {
    return res.send(shell('shop', 'ثبت شد', '<p class="text-emerald-300 font-mono">FLAG{second_order_sqli_is_sneaky}</p>'));
  }
  res.send(shell('shop', 'ثبت شد', '<p class="text-slate-300">حساب ساخته شد.</p><p class="text-emerald-400 text-sm font-mono mt-2">FLAG{captcha_bypass_client_only}</p>'));
});

router.get('/shop/webhook/payment', (req, res) => {
  res.send(shell('shop', 'Webhook پرداخت', '<p class="text-slate-400 text-sm">POST رویداد پرداخت — بدون بررسی امضا</p>'));
});

router.post('/shop/webhook/payment', (req, res) => {
  res.json({ ok: true, flag: 'FLAG{webhook_no_signature_verification}', received: req.body });
});

router.get('/shop/build-info', (req, res) => {
  res.send(shell('shop', 'اطلاعات بیلد', `<pre class="bg-black/50 p-5 rounded-2xl text-sm">@ravenshop/internal-logger ← public registry
FLAG{dependency_confusion_sim}</pre>`));
});

router.get('/shop/package-info', (req, res) => {
  res.send(shell('shop', 'package.json', `<pre class="bg-black/50 p-5 rounded-2xl text-sm text-amber-200/90">"postinstall": "node -e \\"...FLAG{npm_postinstall_hijack}...\\""</pre>`));
});

router.get('/shop/changelog', (req, res) => {
  res.send(shell('shop', 'Changelog', '<p class="text-slate-300">v1.2.3 — CVE-2024-DEMO</p><p class="font-mono text-emerald-400 text-sm mt-2">FLAG{outdated_component_version_in_header}</p>'));
});

router.get('/shop/api/debug', (req, res) => {
  const x = req.query.x;
  if (x === undefined) return res.json({ error: 'missing x' });
  try {
    JSON.parse(x);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).send(`<pre style="background:#0f172a;color:#fca5a5;padding:1.5rem;border-radius:1rem;font-family:monospace">Error: ${e.message}\n  at VulnerableParser (/app/lab/parser.js:42)\n  FLAG{stack_trace_information_disclosure}</pre>`);
  }
});

// ========== RAVEN TRADE ==========
router.get('/trade', (req, res) => {
  res.send(shell('trade', '', `
    <div class="grid lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-slate-900/80 border border-white/5 rounded-3xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="text-sm text-slate-500">BTC / USDT</div>
            <div class="text-3xl font-bold text-emerald-400">۶۷٬۲۴۰٫۵۰</div>
            <div class="text-sm text-emerald-400/80">+۲٫۴٪ امروز</div>
          </div>
          <div class="flex gap-2">
            <a href="/lab/trade/login" class="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-sm font-semibold">ورود / معامله</a>
          </div>
        </div>
        <div class="h-48 rounded-2xl bg-gradient-to-t from-emerald-500/10 to-transparent border border-white/5 flex items-end justify-around px-4 pb-4 gap-1">
          ${[40,55,45,70,60,80,65,90,75,85,95,70].map(h =>
            `<div class="flex-1 bg-emerald-500/40 rounded-t" style="height:${h}%"></div>`).join('')}
        </div>
      </div>
      <div class="space-y-3">
        <div class="bg-slate-900 border border-white/5 rounded-2xl p-4">
          <div class="text-xs text-slate-500">موجودی نمونه</div>
          <div class="text-xl font-bold">۱٬۰۰۰ USDT</div>
        </div>
        <a href="/lab/trade/transfer" class="block bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30">انتقال وجه →</a>
        <a href="/lab/trade/dashboard" class="block bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30">داشبورد →</a>
        <a href="/lab/trade/debug" class="block bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-amber-500/30 text-sm text-slate-400">Debug</a>
      </div>
    </div>
    <script>window.TRADE_CONFIG={jwtSecret:"supersecret",apiKey:"FLAG{hardcoded_secret_in_js}"}</script>
  `, { hideTitle: true }));
});

router.get('/trade/login', (req, res) => {
  res.send(shell('trade', 'ورود به RavenTrade', `
    <div class="max-w-md mx-auto bg-slate-900 border border-white/10 rounded-2xl p-8">
      <form method="POST" class="space-y-4">
        <input name="username" placeholder="نام کاربری" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
        <input name="password" type="password" placeholder="رمز" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
        <button class="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-semibold">ورود</button>
      </form>
      <p class="text-xs text-slate-600 mt-4 text-center">نمونه: trader / trader</p>
    </div>`));
});

router.post('/trade/login', (req, res) => {
  const { username = '', password = '' } = req.body;
  if (String(username).includes('${') || String(username).includes('jndi')) {
    return res.send(shell('trade', 'لاگ', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300">FLAG{log4j_style_injection}</div>'));
  }
  if (typeof username === 'object' || String(username).includes('$ne') || String(password).includes('$ne')) {
    return res.send(shell('trade', 'ورود', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300">FLAG{nosql_injection_login}</div>'));
  }
  if (username === 'trader' && password === 'trader') {
    const token = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url') + '.' +
      Buffer.from(JSON.stringify({ sub: 'trader', role: 'user', exp: null })).toString('base64url') + '.';
    return res.send(shell('trade', 'ورود موفق', `
      <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg">
        <p class="text-emerald-400 font-semibold mb-3">توکن صادر شد</p>
        <code class="text-xs break-all text-slate-400 block bg-black/40 p-3 rounded-xl">${token}</code>
        <p class="text-emerald-300 font-mono text-sm mt-4">FLAG{jwt_no_expiry}</p>
        <a href="/lab/trade/dashboard" class="inline-block mt-4 text-emerald-400 text-sm">رفتن به داشبورد →</a>
      </div>`));
  }
  res.send(shell('trade', 'ناموفق', '<p class="text-red-400">ورود ناموفق — قفل حساب وجود ندارد</p>'));
});

router.get('/trade/dashboard', (req, res) => {
  res.send(shell('trade', 'داشبورد معاملات', `
    <div class="grid sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-5"><div class="text-xs text-slate-500">موجودی</div><div class="text-2xl font-bold">۱٬۰۰۰ <span class="text-sm text-slate-500">USDT</span></div></div>
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-5"><div class="text-xs text-slate-500">سود امروز</div><div class="text-2xl font-bold text-emerald-400">+۲۴٫۵</div></div>
      <div class="bg-slate-900 border border-white/5 rounded-2xl p-5"><div class="text-xs text-slate-500">سفارش باز</div><div class="text-2xl font-bold">۳</div></div>
    </div>
    <p class="text-sm text-slate-500">JWT با alg:none یا secret ضعیف قابل جعل است ← <span class="text-emerald-400 font-mono">FLAG{jwt_alg_none_bypass}</span></p>
  `));
});

router.get('/trade/transfer', (req, res) => {
  res.send(shell('trade', 'انتقال دارایی', `
    <form method="POST" class="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
      <div>
        <label class="text-xs text-slate-500">شناسه مقصد</label>
        <input name="to" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 mt-1">
      </div>
      <div>
        <label class="text-xs text-slate-500">مبلغ (USDT)</label>
        <input name="amount" type="number" value="100" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 mt-1">
      </div>
      <button class="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-semibold">ارسال</button>
      <p class="text-xs text-slate-600">بدون قفل موجودی — مناسب تست race</p>
    </form>`));
});

router.post('/trade/transfer', (req, res) => {
  const amount = Number(req.body.amount) || 0;
  res.send(shell('trade', 'نتیجه انتقال', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md">
      <p>مبلغ ${amount} USDT ثبت شد.</p>
      <p class="text-emerald-400 text-sm font-mono mt-3">FLAG{race_condition_double_spend}</p>
    </div>`));
});

router.get('/trade/welcome', (req, res) => {
  res.send(shell('trade', 'خوش آمدید', `
    <div id="box" class="bg-slate-900 border border-white/10 rounded-2xl p-8 text-lg"></div>
    <p class="text-xs text-slate-600 mt-3">از # در URL استفاده کنید: /lab/trade/welcome#نام</p>
    <script>
      function sanitize(s){ return s.replace(/script/gi,''); }
      var h = decodeURIComponent(location.hash.slice(1)||'معامله‌گر');
      document.getElementById('box').innerHTML = 'سلام <b class="text-emerald-400">'+sanitize(h)+'</b>، به RavenTrade خوش آمدید.';
      window.reveal=function(){document.getElementById('box').innerHTML+='<p class="text-yellow-300 mt-3 font-mono text-sm">FLAG{dom_xss_filter_bypass_master}</p>';};
    </script>`));
});

router.get('/trade/debug', (req, res) => {
  res.send(shell('trade', 'Actuator / Debug', `
    <pre class="bg-black/60 border border-white/10 rounded-2xl p-6 text-sm text-amber-200/90">env.JWT_SECRET=weaksecret
env.FLAG=FLAG{debug_endpoint_exposed}</pre>`));
});

router.get('/trade/logs', (req, res) => {
  res.send(shell('trade', 'لاگ سرور', `
    <pre class="bg-black/60 border border-red-500/20 rounded-2xl p-6 text-xs text-red-300/90 overflow-auto">2024-01-01T12:00:00 login user=admin password=admin123 ip=10.0.0.1
FLAG{sensitive_data_in_logs}</pre>`));
});

router.get('/trade/admin', (req, res) => {
  res.send(shell('trade', 'مدیریت RavenTrade', `
    <div class="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 font-mono">FLAG{admin_panel_no_ip_restriction}</div>`));
});

router.get('/trade/api/me', (req, res) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.json({ user: 'trader', balance: 1000, flag: 'FLAG{cors_misconfiguration_steal}' });
});

router.get('/trade/api/login', (req, res) => {
  res.json({ hint: 'POST JSON with operators' });
});

router.post('/trade/api/login', (req, res) => {
  const b = req.body || {};
  if (b.username && typeof b.username === 'object') {
    return res.json({ ok: true, flag: 'FLAG{nosql_injection_login}' });
  }
  res.status(401).json({ ok: false });
});

router.get('/trade/tls-info', (req, res) => {
  res.send(shell('trade', 'TLS', '<p class="text-slate-400">Cipher: TLS_RSA_WITH_3DES_EDE_CBC_SHA</p><p class="font-mono text-emerald-400 text-sm mt-2">FLAG{weak_cipher_suite_accepted}</p>'));
});

router.get('/trade/mfa', (req, res) => {
  res.send(shell('trade', 'تأیید دو مرحله‌ای', `
    <div class="max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 text-center">
      <p class="text-sm text-slate-400 mb-4">کد ارسال‌شده به موبایل را وارد کنید</p>
      <input class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest mb-4" placeholder="••••••" maxlength="6">
      <button id="b" class="w-full bg-emerald-600 py-3 rounded-xl font-semibold">تأیید</button>
    </div>
    <script>
      document.getElementById('b').onclick=function(){
        fetch('/lab/trade/mfa/verify',{method:'POST'}).then(r=>r.json()).then(d=>{
          if(d.success) location='/lab/trade/dashboard';
          else alert('کد نامعتبر — پاسخ را در Burp ببینید');
        });
      };
    </script>`));
});

router.post('/trade/mfa/verify', (req, res) => {
  res.json({ success: false, flag_if_bypassed: 'FLAG{mfa_bypass_response_manipulation}' });
});

router.get('/trade/audit', (req, res) => {
  res.send(shell('trade', 'گزارش حسابرسی', '<p class="text-slate-500">انتقال‌ها ثبت نشده‌اند.</p><p class="font-mono text-emerald-400 text-sm mt-2">FLAG{insufficient_audit_logging}</p>'));
});

router.get('/trade/health-check', (req, res) => {
  const host = req.query.host || '';
  res.send(shell('trade', 'بررسی سلامت سرویس', `
    <form method="GET" class="flex gap-2 max-w-md mb-4">
      <input name="host" value="${String(host).replace(/"/g,'&quot;')}" placeholder="hostname" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3">
      <button class="bg-emerald-600 px-5 rounded-xl">Check</button>
    </form>
    ${host ? `<p class="text-sm">Host: <code>${host}</code></p>
      ${/127|localhost|internal/i.test(host) ? '<p class="font-mono text-emerald-400 text-sm mt-2">FLAG{partial_ssrf_host_header}</p>' : ''}` : ''}`));
});

router.get('/trade/webhook-test', (req, res) => {
  res.send(shell('trade', 'تست Webhook', `
    <form method="POST" class="max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-3">
      <input name="callback" placeholder="https://..." class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <button class="bg-emerald-600 px-6 py-2.5 rounded-xl">ارسال تست</button>
    </form>`));
});

router.post('/trade/webhook-test', (req, res) => {
  const u = req.body.callback || '';
  if (/169\.254\.169\.254|metadata/i.test(u)) {
    return res.send(shell('trade', 'Metadata', '<pre class="bg-black/50 p-5 rounded-2xl text-emerald-300 text-sm">FLAG{ssrf_cloud_metadata}</pre>'));
  }
  res.send(shell('trade', 'OK', `<p class="text-slate-400">Called ${u}</p>`));
});

// ========== RAVEN BLOG ==========
router.get('/blog', (req, res) => {
  res.send(shell('blog', '', `
    <div class="mb-10">
      <h1 class="text-4xl font-extrabold mb-3 bg-gradient-to-l from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">روایت‌های بازار و تکنولوژی</h1>
      <p class="text-slate-400 max-w-xl">مقالات تحلیلی، آموزش و یادداشت‌های تیم Raven.</p>
    </div>
    <div class="grid md:grid-cols-2 gap-6 mb-10">
      ${blogPosts.filter(p => p.public).map(p => `
        <a href="/lab/blog/posts?uuid=${p.uuid}" class="block bg-slate-900/80 border border-white/5 rounded-2xl p-6 hover:border-violet-500/40 transition">
          <div class="text-xs text-violet-400 mb-2">${p.date} · ${p.author}</div>
          <h2 class="text-lg font-bold mb-2">${p.title}</h2>
          <p class="text-sm text-slate-400 line-clamp-2">${p.body}</p>
        </a>`).join('')}
    </div>
    <div class="flex flex-wrap gap-3 text-sm">
      <a href="/lab/blog/register" class="px-4 py-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">عضویت</a>
      <a href="/lab/blog/forgot" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10">بازیابی رمز</a>
      <a href="/lab/blog/graphql" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10">GraphQL API</a>
      <a href="/lab/blog/ci-logs" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10">CI Logs</a>
    </div>
    <script>console.log('security event'); /* FLAG{client_only_security_logging} */</script>
  `, { hideTitle: true }));
});

router.get('/blog/posts', (req, res) => {
  const uuid = req.query.uuid;
  if (uuid) {
    const p = blogPosts.find(x => x.uuid === uuid);
    if (p) {
      return res.send(shell('blog', p.title, `
        <article class="max-w-2xl">
          <div class="text-sm text-slate-500 mb-4">${p.date} · ${p.author} ${p.public ? '' : '· <span class="text-amber-400">خصوصی</span>'}</div>
          <div class="prose prose-invert text-slate-300 leading-relaxed">${p.body}</div>
          ${!p.public ? '<p class="mt-6 font-mono text-emerald-400 text-sm">FLAG{idor_uuid_guessable}</p>' : ''}
        </article>`));
    }
  }
  res.send(shell('blog', 'همه مطالب', `
    <div class="space-y-4 max-w-2xl">
      ${blogPosts.filter(p => p.public).map(p => `
        <a href="?uuid=${p.uuid}" class="block p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-violet-500/30">
          <div class="font-semibold">${p.title}</div>
          <div class="text-xs text-slate-500 mt-1">${p.uuid}</div>
        </a>`).join('')}
    </div>
    <p class="text-xs text-slate-600 mt-6">پست‌های خصوصی با دانستن UUID مستقیم باز می‌شوند</p>`));
});

router.get('/blog/register', (req, res) => {
  res.send(shell('blog', 'عضویت در RavenBlog', `
    <form method="POST" class="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-4">
      <input name="user" placeholder="نام کاربری" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <input name="pass" placeholder="رمز عبور" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <button class="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold">ساخت حساب</button>
    </form>`));
});

router.post('/blog/register', (req, res) => {
  const pass = req.body.pass || '';
  if (pass.length < 4) {
    return res.send(shell('blog', 'خوش آمدید', '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono">FLAG{weak_password_policy}</div>'));
  }
  res.send(shell('blog', 'ثبت شد', '<p class="text-slate-300">حساب شما فعال است.</p>'));
});

router.get('/blog/forgot', (req, res) => {
  res.send(shell('blog', 'بازیابی رمز عبور', `
    <form method="POST" class="max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-4">
      <p class="text-sm text-slate-400">ایمیل حساب خود را وارد کنید تا لینک بازیابی ارسال شود.</p>
      <input name="email" type="email" placeholder="you@email.com" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3">
      <button class="w-full bg-violet-600 py-3 rounded-xl font-semibold">ارسال لینک</button>
    </form>`));
});

router.post('/blog/forgot', (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'lab';
  const token = 'reset-' + String(req.body.email || 'user').length + '-predictable';
  res.send(shell('blog', 'ایمیل ارسال شد', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg text-sm space-y-2">
      <p class="text-slate-400">لینک بازیابی (بر اساس Host):</p>
      <code class="block bg-black/40 p-3 rounded-xl break-all text-violet-300">http://${host}/lab/blog/reset?token=${token}</code>
      <p class="font-mono text-emerald-400 text-xs pt-2">FLAG{password_reset_token_predictable}</p>
      <p class="font-mono text-emerald-400 text-xs">FLAG{host_header_poisoning_reset}</p>
    </div>`));
});

router.get('/blog/reset', (req, res) => {
  res.send(shell('blog', 'تنظیم رمز جدید', `
    <p class="text-sm text-slate-400 mb-2">token=${req.query.token || '—'}</p>
    <p class="font-mono text-emerald-400 text-sm">FLAG{sensitive_token_in_url}</p>`));
});

router.get('/blog/graphql', (req, res) => {
  res.send(shell('blog', 'GraphQL Explorer', `
    <form method="POST" class="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-3">
      <textarea name="query" rows="6" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm">{ __schema { types { name } } }</textarea>
      <button class="bg-violet-600 px-6 py-2.5 rounded-xl font-medium">اجرای Query</button>
    </form>`));
});

router.post('/blog/graphql', (req, res) => {
  const q = req.body.query || '';
  if (q.includes('__schema') || q.includes('adminSecret') || q.includes('flag')) {
    return res.json({ data: { adminSecret: 'FLAG{graphql_broken_authorization}', types: [{ name: 'User' }, { name: 'Secret' }] } });
  }
  res.json({ data: null });
});

router.get('/blog/ci-logs', (req, res) => {
  res.send(shell('blog', 'لاگ CI/CD', `
    <pre class="bg-black/60 border border-white/10 rounded-2xl p-6 text-xs text-amber-200/90 overflow-auto">export API_KEY=sk_live_FLAG{ci_secret_in_logs}
npm run build
✓ built in 12.4s</pre>`));
});

router.get('/blog/invite', (req, res) => {
  res.send(shell('blog', 'دعوت دوستان', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md text-center">
      <p class="text-slate-400 text-sm mb-2">کد دعوت شما</p>
      <p class="text-2xl font-mono font-bold tracking-wider text-violet-300">RAVEN-2024</p>
      <p class="text-xs text-slate-600 mt-3">بدون محدودیت تعداد استفاده</p>
      <p class="font-mono text-emerald-400 text-sm mt-4">FLAG{unlimited_invite_code}</p>
    </div>`));
});

router.get('/blog/oauth', (req, res) => {
  const redirect = req.query.redirect_uri || '';
  res.send(shell('blog', 'ورود با OAuth', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg">
      <p class="text-sm text-slate-400 mb-2">redirect_uri</p>
      <code class="text-violet-300 break-all">${redirect || '(خالی)'}</code>
      ${redirect && !redirect.includes('vikinglab') ? '<p class="font-mono text-emerald-400 text-sm mt-4">FLAG{oauth_redirect_uri_manipulation}</p>' : ''}
      <p class="text-xs text-slate-600 mt-4">مثال: ?redirect_uri=https://evil.example</p>
    </div>`));
});

router.post('/blog/api/settings', (req, res) => {
  const body = req.body || {};
  if (body.__proto__ || (body.constructor && body.constructor.prototype)) {
    return res.json({ ok: true, admin: true, flag: 'FLAG{prototype_pollution_to_admin}' });
  }
  res.json({ ok: true, settings: body });
});

router.get('/blog/avatar', (req, res) => {
  res.send(shell('blog', 'آپلود آواتار', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md text-center">
      <div class="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center text-3xl">🖼️</div>
      <p class="text-sm text-slate-400 mb-4">SVG مجاز است (XXE/SSRF)</p>
      <form method="POST"><button class="bg-violet-600 px-6 py-2.5 rounded-xl">شبیه‌سازی آپلود مخرب</button></form>
    </div>`));
});

router.post('/blog/avatar', (req, res) => {
  res.send(shell('blog', 'آواتار', '<p class="font-mono text-emerald-400">FLAG{svg_xxe_ssrf}</p>'));
});


// ========== NETWORK LAB ==========
router.get('/network', (req, res) => {
  res.send(shell('network', 'Network Lab · TargetCorp', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8">
      <p class="text-slate-400 text-sm mb-4 leading-relaxed">Recon شبکه روی دامنه <code class="text-cyan-400">targetcorp.lab</code>. با curl/nmap-style از ترمینال به همین مسیرها بزن.</p>
      <pre class="bg-black/50 p-4 rounded-xl text-xs text-left text-cyan-300/90 overflow-x-auto" dir="ltr">curl http://localhost:3000/lab/network/scan
curl http://localhost:3000/lab/network/dns
curl http://localhost:3000/lab/network/hosts</pre>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <a href="/lab/network/scan" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-cyan-500/40"><div class="text-2xl mb-2">📡</div><div class="font-semibold">Port Scan</div></a>
      <a href="/lab/network/dns" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-cyan-500/40"><div class="text-2xl mb-2">🌍</div><div class="font-semibold">DNS</div></a>
      <a href="/lab/network/port/8080" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">🔓</div><div class="font-semibold">:8080 Admin</div></a>
      <a href="/lab/network/port/3306" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">🗄️</div><div class="font-semibold">:3306 MySQL</div></a>
    </div>
  `));
});
router.get('/network/scan', (req, res) => {
  res.type('text').send('PORT STATE SERVICE\\n22 open ssh\\n80 open http\\n3306 open mysql\\n6379 open redis\\n8080 open http-admin\\n\\nFLAG{network_port_scan_complete}\\n');
});
router.get('/network/dns', (req, res) => {
  res.type('text').send('targetcorp.lab A 10.10.5.10\\nadmin.targetcorp.lab A 10.10.5.40\\ndev.targetcorp.lab TXT FLAG{subdomain_enum_secret_dev}\\n');
});
router.get('/network/port/22', (req, res) => res.type('text').send('SSH-2.0-OpenSSH_7.4\\n'));
router.get('/network/port/3306', (req, res) => res.type('text').send('MySQL 5.7.33\\nFLAG{mysql_banner_info_leak}\\n'));
router.get('/network/mysql', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (q.includes('select') || q.includes('flag')) return res.type('text').send('FLAG{mysql_query_injection_sim}\\n');
  res.type('text').send('Usage: ?q=SELECT\\n');
});
router.get('/network/port/6379', (req, res) => {
  res.type('text').send('+PONG\nFLAG{redis_unauthenticated_access}\n');
});
router.get('/network/port/8080', (req, res) => {
  res.send(shell('network', 'Ops :8080', `
    <div class="max-w-md mx-auto bg-slate-900 border border-amber-500/30 rounded-2xl p-8">
      <h2 class="text-xl font-bold text-center mb-6">TargetCorp Ops</h2>
      <form method="POST" action="/lab/network/port/8080/login" class="space-y-3">
        <input name="user" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="user">
        <input name="pass" type="password" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="pass">
        <button class="w-full bg-amber-600 py-3 rounded-xl font-semibold">Login</button>
      </form>
      <p class="text-xs text-slate-600 text-center mt-3">admin/admin · ops/ops123</p>
    </div>
  `));
});
router.post('/network/port/8080/login', (req, res) => {
  const u = req.body.user || '', p = req.body.pass || '';
  if ((u==='admin'&&p==='admin')||(u==='ops'&&p==='ops123')||u.includes("'")) {
    return res.send(shell('shop', 'Ops', `
      <div class="text-center p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-lg mx-auto">
        <p class="font-mono text-yellow-300">FLAG{internal_admin_port_8080}</p>
        <p class="font-mono text-amber-300 mt-2">FLAG{arena_network_pwn_100}</p>
      </div>
    `));
  }
  res.send(shell('network', 'Fail', '<p class="text-red-400 text-center">Invalid</p>'));
});
router.get('/network/hosts', (req, res) => {
  res.json({ domain: 'targetcorp.lab', flag: 'FLAG{host_inventory_json}', hosts: [
    { host: '10.10.5.40', name: 'admin', ports: [8080, 22] },
    { host: '10.10.5.50', name: 'dev', ports: [3306, 6379] }
  ]});
});


// ========== WAR OPS — Clan War exclusive lab ==========
router.get('/war', (req, res) => {
  res.send(shell('war', 'WarOps · مرکز عملیات جنگ کلَن', `
    <div class="rounded-3xl border border-red-500/30 bg-gradient-to-l from-red-600/20 to-slate-900 p-8 mb-8">
      <p class="text-red-300 text-sm font-medium mb-2">CLAN WAR EXCLUSIVE</p>
      <h2 class="text-3xl font-extrabold mb-3">WarOps Command Center</h2>
      <p class="text-slate-400 max-w-xl text-sm leading-relaxed">اپ مخصوص جنگ کلَن. فقط چالش‌های دسته WAR اینجا امتیاز جنگ می‌دهند. راهنما داخل چالش با کسر امتیاز است.</p>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <a href="/lab/war/search" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500/40"><div class="text-2xl mb-2">🔍</div><div class="font-semibold">جستجوی لاگ</div><div class="text-xs text-slate-500">XSS</div></a>
      <a href="/lab/war/login" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500/40"><div class="text-2xl mb-2">🔐</div><div class="font-semibold">لاگین Ops</div><div class="text-xs text-slate-500">SQLi</div></a>
      <a href="/lab/war/intel?id=1" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500/40"><div class="text-2xl mb-2">📁</div><div class="font-semibold">Intel</div><div class="text-xs text-slate-500">IDOR</div></a>
      <a href="/lab/war/relay" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500/40"><div class="text-2xl mb-2">📡</div><div class="font-semibold">Relay</div><div class="text-xs text-slate-500">SSRF</div></a>
      <a href="/lab/war/command" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">🎖️</div><div class="font-semibold">Command</div><div class="text-xs text-slate-500">JWT</div></a>
      <a href="/lab/war/supply" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">📦</div><div class="font-semibold">Supply</div><div class="text-xs text-slate-500">Race</div></a>
      <a href="/lab/war/beacon" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">📶</div><div class="font-semibold">Beacon</div><div class="text-xs text-slate-500">CMDi</div></a>
      <a href="/lab/war/vault" class="p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-500/40"><div class="text-2xl mb-2">🔒</div><div class="font-semibold">Vault</div><div class="text-xs text-slate-500">Final</div></a>
    </div>
    <script>window.WAR_SECRET="warops-weak-secret";window.WAR_HINT="FLAG related challenges under category WAR";</script>
  `));
});

router.get('/war/search', (req, res) => {
  const q = req.query.q || '';
  let flag = '';
  if (/<script|onerror|onload|svg/i.test(q)) flag = '<div class="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-sm">FLAG{war_gateway_xss_ops}</div>';
  res.send(shell('war', 'WarOps · جستجوی لاگ', `
    <form method="GET" class="flex gap-2 max-w-xl mb-6">
      <input name="q" value="${String(q).replace(/"/g,'&quot;')}" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3" placeholder="جستجو در لاگ عملیات...">
      <button class="bg-red-600 px-5 rounded-xl">Search</button>
    </form>
    <div class="bg-slate-900 border border-white/5 rounded-2xl p-5">نتایج: ${q || '—'}</div>
    ${flag}
  `));
});

router.get('/war/login', (req, res) => {
  res.send(shell('war', 'WarOps Login', `
    <form method="POST" class="max-w-md bg-slate-900 border border-red-500/20 rounded-2xl p-8 space-y-4 mx-auto">
      <input name="user" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="username">
      <input name="pass" type="password" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="password">
      <button class="w-full bg-red-600 py-3 rounded-xl font-semibold">ورود عملیات</button>
    </form>
  `));
});

router.post('/war/login', (req, res) => {
  const u = req.body.user || '', p = req.body.pass || '';
  const bypass = /'/.test(u+p) || /or\s+1\s*=\s*1/i.test(u+p);
  if (bypass || (u==='ops' && p==='ops')) {
    return res.send(shell('war', 'Ops OK', `
      <div class="text-center p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-lg mx-auto">
        <p class="font-mono text-emerald-300">FLAG{war_ops_sqli_login}</p>
        <p class="text-xs text-slate-500 mt-2">Token preview: role=operator</p>
      </div>
    `));
  }
  res.send(shell('network', 'Fail', '<p class="text-red-400 text-center">Login failed</p>'));
});

router.get('/war/intel', (req, res) => {
  const id = parseInt(req.query.id) || 1;
  const files = {
    1: { title: 'گزارش عمومی', body: 'وضعیت جبهه آرام است.' },
    2: { title: 'گزارش داخلی', body: 'مختصات واحد B.' },
    3: { title: 'SECRET', body: 'FLAG{war_intel_idor_secret}' }
  };
  const f = files[id] || files[1];
  res.send(shell('war', 'Intel #' + id, `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg">
      <div class="text-xs text-slate-500 mb-1">پرونده</div>
      <h2 class="text-xl font-bold mb-3">${f.title}</h2>
      <p class="text-slate-300">${f.body}</p>
    </div>
    <p class="text-xs text-slate-600 mt-3">?id=</p>
  `));
});

router.get('/war/relay', (req, res) => {
  res.send(shell('war', 'War Relay', `
    <form method="POST" class="max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-3">
      <input name="url" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="http://...">
      <button class="bg-red-600 px-6 py-2.5 rounded-xl">Fetch</button>
    </form>
  `));
});

router.post('/war/relay', (req, res) => {
  const url = req.body.url || '';
  if (/127\.0\.0\.1|localhost|0\.0\.0\.0/i.test(url)) {
    return res.send(shell('war', 'Relay', `<pre class="bg-black/50 p-5 rounded-2xl text-emerald-300 text-sm">Internal: FLAG{war_relay_ssrf}
X-War-Token: war-internal-token-9f3a</pre>`));
  }
  res.send(shell('war', 'Relay', `<p class="text-slate-400">${url}</p>`));
});

router.get('/war/internal', (req, res) => {
  res.json({ service: 'war-internal', token: 'war-internal-token-9f3a', flag: 'FLAG{war_relay_ssrf}' });
});

router.get('/war/command', (req, res) => {
  res.send(shell('war', 'Command JWT', `
    <p class="text-sm text-slate-400 mb-4">توکن را در هدر یا کوکی بفرست. secret در سورس صفحه است.</p>
    <form method="POST" class="max-w-lg space-y-3">
      <textarea name="token" rows="3" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs" placeholder="header.payload.sig"></textarea>
      <button class="bg-amber-600 px-6 py-2.5 rounded-xl">بررسی دسترسی</button>
    </form>
    <script>window.WAR_JWT_SECRET="warops-weak-secret";</script>
  `));
});

router.post('/war/command', (req, res) => {
  const token = req.body.token || '';
  let role = '';
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString() || '{}');
      role = payload.role || '';
      if (parts[0] && parts[0].includes('none')) role = payload.role || role;
    }
  } catch(e) {}
  if (role === 'commander' || token.includes('commander')) {
    return res.send(shell('war', 'Commander', `<div class="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-mono text-emerald-300">FLAG{war_jwt_commander}</div>`));
  }
  res.send(shell('war', 'Denied', '<p class="text-red-400">role کافی نیست</p>'));
});

let warSupply = { stock: 100 };
router.get('/war/supply', (req, res) => {
  res.send(shell('war', 'Supply Depot', `
    <p class="text-sm text-slate-400 mb-2">موجودی: <strong id="s">${warSupply.stock}</strong></p>
    <form method="POST" class="flex gap-2 max-w-md">
      <input name="amount" type="number" value="60" class="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 w-32">
      <button class="bg-amber-600 px-5 rounded-xl">برداشت</button>
    </form>
    <p class="text-xs text-slate-600 mt-3">بدون قفل — race ممکن است</p>
  `));
});

router.post('/war/supply', (req, res) => {
  const amount = Number(req.body.amount) || 0;
  // intentionally non-atomic check
  if (warSupply.stock >= amount && amount > 0) {
    const before = warSupply.stock;
    // delay window for race simulation: still deduct
    warSupply.stock -= amount;
    let flag = '';
    if (before < 100 || warSupply.stock < 0 || amount > before) {
      flag = '<p class="text-emerald-300 font-mono mt-3">FLAG{war_supply_race}</p>';
    }
    if (amount >= 60 && before >= 60) {
      // second successful large withdraw in spirit of race
      flag = '<p class="text-emerald-300 font-mono mt-3">FLAG{war_supply_race}</p>';
    }
    return res.send(shell('war', 'Supply', `<p>برداشت ${amount} · مانده ${warSupply.stock}</p>${flag}
      <a class="text-indigo-400 text-sm" href="/lab/war/supply">بازگشت</a>`));
  }
  // allow overdraw message as race win
  if (amount > warSupply.stock && amount > 0) {
    warSupply.stock -= amount;
    return res.send(shell('war', 'Supply', `<p class="text-amber-300">Overdraw sim</p><p class="font-mono text-emerald-300">FLAG{war_supply_race}</p>`));
  }
  res.send(shell('war', 'Supply', '<p class="text-red-400">موجودی کافی نیست</p>'));
});

router.get('/war/beacon', (req, res) => {
  res.send(shell('war', 'Beacon', `
    <form method="POST" class="max-w-lg flex gap-2">
      <input name="host" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3" placeholder="target host">
      <button class="bg-red-600 px-5 rounded-xl">Ping</button>
    </form>
  `));
});

router.post('/war/beacon', (req, res) => {
  const host = req.body.host || '';
  if (/[;|&]/.test(host) && !/\$\(/.test(host) && !/`/.test(host)) {
    return res.send(shell('war', 'Beacon', '<p class="text-red-400">Filtered</p>'));
  }
  if (/\$\(|`/.test(host) || /flag/i.test(host)) {
    return res.send(shell('war', 'Beacon', '<pre class="text-emerald-300">FLAG{war_beacon_cmdi}</pre>'));
  }
  const { exec } = require('child_process');
  exec('ping -c 1 127.0.0.1', { timeout: 2000 }, () => {
    res.send(shell('war', 'Beacon', `<pre class="text-sm text-slate-400">beacon to ${String(host).replace(/</g,'')}</pre>`));
  });
});

router.get('/war/vault', (req, res) => {
  const role = req.headers['x-role'] || req.query.role || '';
  const token = req.headers['x-war-token'] || req.query.token || '';
  if ((role === 'commander' || req.query.commander === '1') && (token === 'war-internal-token-9f3a' || token.includes('war-internal'))) {
    return res.send(shell('war', 'Vault', `<div class="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center font-mono text-emerald-300">FLAG{war_vault_final}</div>`));
  }
  res.send(shell('war', 'Vault Locked', `
    <p class="text-slate-400 text-sm mb-4">نیاز به role=commander و X-War-Token</p>
    <form method="GET" class="max-w-md space-y-3">
      <input name="role" placeholder="role" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3">
      <input name="token" placeholder="X-War-Token value" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3">
      <button class="bg-amber-600 px-5 py-2.5 rounded-xl">باز کردن</button>
    </form>
  `));
});



// ========== TOOLS LAB ==========
router.get('/tools/burp', (req, res) => {
  const dbg = req.headers['x-lab-debug'] || req.query.debug;
  if (dbg === '1' || dbg === 'true') {
    return res.json({ ok: true, flag: 'FLAG{tool_burp_repeater_master}', msg: 'Repeater/header debug OK' });
  }
  res.send(shell('war', 'Burp Practice', `
    <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg">
      <p class="text-sm text-slate-400 mb-3">این درخواست را در Burp Intercept/Repeater بگیر و هدر <code class="text-cyan-400">X-Lab-Debug: 1</code> اضافه کن یا <code>?debug=1</code>.</p>
      <a href="?debug=0" class="text-indigo-400 text-sm">درخواست نمونه</a>
    </div>
  `));
});


module.exports = router;
