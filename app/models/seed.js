const store = require('./store');

function seedAll(force = false) {
  // If force or no challenges, re-seed
  if (force) {
    store.clearChallenges();
  }

  if (!store.findUserByEmail('admin@vikinglab.lab')) {
    store.createUser({ email: 'admin@vikinglab.lab', username: 'admin', password: 'admin123', role: 'admin' });
  }
  if (!store.findUserByEmail('hunter@vikinglab.lab')) {
    store.createUser({ email: 'hunter@vikinglab.lab', username: 'hunter', password: 'hunter123', role: 'hunter' });
  }

  const hasWar = !!store.getChallengeBySlug('war-med-1-gateway-xss');
  if (store.getAllChallenges().length >= 110 && hasWar) {
    console.log('✅ Challenges already seeded (' + store.getAllChallenges().length + ')');
    return;
  }
  if (!hasWar && store.getAllChallenges().length > 0) {
    console.log('♻️ Adding WAR pack — clearing for full reseed');
    store.clearChallenges();
  }

  // Clear old small set
  store.clearChallenges();

  const C = []; // challenges builder
  let order = {};

  function add(cat, catName, slug, title, diff, points, desc, scenario, guide, hints, labPath, flag) {
    if (!order[cat]) order[cat] = 0;
    order[cat]++;
    C.push({
      category: cat,
      category_name: catName,
      slug,
      title,
      difficulty: diff,
      points,
      description: desc,
      scenario,
      guide,
      hints,
      lab_path: labPath || null,
      flag: flag || null,
      order_index: order[cat]
    });
  }

  // ===================== A01 Broken Access Control (12) =====================
  add('A01', 'Broken Access Control', 'a01-idor-profile', 'IDOR در پروفایل کاربر', 'easy', 10,
    'با تغییر شناسه کاربر در URL می‌توان پروفایل دیگران را دید.',
    'در RavenShop صفحه پروفایل با ?id= کار می‌کند و بررسی مالکیت ندارد.',
    'به /lab/shop/profile?id=1 برو و id را تغییر بده.',
    ['id را به اعداد دیگر تغییر بده', 'id=3 مربوط به ادمین است', 'فلگ در bio ادمین است'],
    '/lab/shop/profile?id=1');

  add('A01', 'Broken Access Control', 'a01-idor-orders', 'IDOR در سفارش‌ها', 'easy', 12,
    'شماره سفارش قابل حدس است و بدون احراز مالکیت نمایش داده می‌شود.',
    'در فروشگاه تاریخچه سفارش با /orders?order_id= در دسترس است.',
    'سفارش‌های دیگران را با تغییر order_id ببین.',
    ['order_id را از ۱ به بالا تست کن', 'سفارش ادمین فلگ دارد'],
    '/lab/shop/orders');

  add('A01', 'Broken Access Control', 'a01-force-admin', 'Force Browsing پنل ادمین', 'easy', 10,
    'مسیر پنل مدیریت در UI لینک نشده اما قابل دسترسی است.',
    'فروشگاه RavenShop مسیر مخفی ادمین دارد.',
    'مسیرهای رایج /admin را کشف کن.',
    ['/lab/shop/admin را امتحان کن', 'یا /lab/shop/manage'],
    '/lab/shop');

  add('A01', 'Broken Access Control', 'a01-horizontal-role', 'Horizontal Privilege via Mass Assignment', 'medium', 20,
    'پارامتر role در آپدیت پروفایل قبول می‌شود.',
    'API آپدیت پروفایل تمام فیلدهای JSON را بدون whitelist ذخیره می‌کند.',
    'با Burp فیلد role=admin را اضافه کن.',
    ['درخواست PUT/POST پروفایل را اینترسپت کن', 'فیلد role را اضافه کن'],
    '/lab/shop/settings');

  add('A01', 'Broken Access Control', 'a01-vertical-api', 'Vertical Privilege Escalation در API', 'medium', 22,
    'endpoint ادمین فقط با role چک می‌شود و JWT قابل دستکاری است.',
    'در پلتفرم ترید، API مدیریت کاربران فقط claim نقش را می‌بیند.',
    'JWT را decode و role را عوض کن.',
    ['توکن را در localStorage یا cookie پیدا کن', 'با jwt.io نقش را تغییر بده'],
    '/lab/trade/api/users');

  add('A01', 'Broken Access Control', 'a01-idor-uuid', 'IDOR با UUID قابل حدس', 'medium', 18,
    'UUIDها ترتیبی یا قابل پیش‌بینی هستند.',
    'در بلاگ، پست‌های خصوصی با UUID در URL هستند.',
    'UUID پست خصوصی را پیدا یا حدس بزن.',
    ['از لیست پست‌های عمومی الگو بگیر', 'یک عدد کم/زیاد کن'],
    '/lab/blog/posts');

  add('A01', 'Broken Access Control', 'a01-path-traversal-download', 'Path Traversal در دانلود فایل', 'medium', 25,
    'پارامتر فایل بدون نرمال‌سازی به filesystem می‌رسد.',
    'فروشگاه اجازه دانلود فاکتور با ?file= می‌دهد.',
    'با ../ به فایل‌های خارج از پوشه مجاز برس.',
    ['file=../../etc/passwd یا فایل فلگ', 'encoding را هم امتحان کن'],
    '/lab/shop/download');

  add('A01', 'Broken Access Control', 'a01-cors-misconfig', 'CORS Misconfiguration', 'hard', 30,
    'Access-Control-Allow-Origin منعکس‌کننده Origin است و Credentials هم فعال است.',
    'API ترید هدر Origin را mirror می‌کند.',
    'از دامنه دیگر با credentials درخواست بفرست و دیتا بدزد.',
    ['Origin دلخواه بفرست', 'با XMLHttpRequest و withCredentials تست کن'],
    '/lab/trade/api/balance');

  add('A01', 'Broken Access Control', 'a01-ssrf-to-admin', 'دسترسی به پنل داخلی از طریق SSRF', 'hard', 35,
    'SSRF به سرویس داخلی ادمین می‌رسد که بدون auth است.',
    'ابزار پیش‌نمایش لینک فروشگاه به شبکه داخلی دسترسی دارد.',
    'آدرس داخلی پنل را fetch کن.',
    ['127.0.0.1 و پورت‌های رایج', 'مسیر /internal/admin'],
    '/lab/shop/preview');

  add('A01', 'Broken Access Control', 'a01-websocket-idor', 'IDOR روی WebSocket', 'hard', 32,
    'کانال WebSocket پیام‌های کاربر دیگر را با تغییر id می‌پذیرد.',
    'چت زنده ترید بر اساس userId در پیام subscribe می‌شود.',
    'subscribe به کانال کاربر دیگر بده.',
    ['پیام subscribe را دستکاری کن', 'userId دیگران را امتحان کن'],
    '/lab/trade/chat');

  add('A01', 'Broken Access Control', 'a01-graphql-authz', 'Broken AuthZ در GraphQL', 'hard', 40,
    'Queryهای حساس بدون بررسی permission در GraphQL در دسترس‌اند.',
    'بلاگ از GraphQL استفاده می‌کند و introspection و query ادمین باز است.',
    'با introspection اسکیما را ببین و query حساس بزن.',
    ['__schema را query کن', 'فیلدهای admin یا secret را پیدا کن'],
    '/lab/blog/graphql');

  add('A01', 'Broken Access Control', 'a01-jwt-alg-none', 'JWT alg:none Bypass', 'hard', 38,
    'سرور الگوریتم none را می‌پذیرد.',
    'پلتفرم ترید JWT را بدون verify سخت‌گیرانه چک می‌کند.',
    'alg را none کن و role را admin بگذار.',
    ['هدر JWT را دستکاری کن', 'امضا را خالی بگذار'],
    '/lab/trade/dashboard');

  // ===================== A02 Cryptographic Failures (10) =====================
  add('A02', 'Cryptographic Failures', 'a02-weak-password-hash', 'هش ضعیف رمز عبور', 'easy', 12,
    'رمزها با MD5 یا بدون salt ذخیره شده‌اند.',
    'دیتابیس لو رفته فروشگاه شامل هش‌های MD5 است.',
    'هش ادمین را کرک کن.',
    ['هش در /lab/shop/leaked-db است', 'از rockyou یا online cracker استفاده کن'],
    '/lab/shop/leaked-db');

  add('A02', 'Cryptographic Failures', 'a02-hardcoded-secret', 'Secret هاردکد شده', 'easy', 10,
    'کلید JWT یا API در سورس فرانت یا JS عمومی است.',
    'فایل config.js فرانت ترید secret را لو می‌دهد.',
    'سورس JS را بخوان و secret را پیدا کن.',
    ['Developer Tools → Sources', 'دنبال secret یا jwt بگرد'],
    '/lab/trade');

  add('A02', 'Cryptographic Failures', 'a02-sensitive-in-url', 'داده حساس در URL', 'easy', 10,
    'توکن ریست پسورد یا session در query string است.',
    'لینک بازیابی رمز بلاگ توکن را در URL می‌گذارد و لاگ می‌شود.',
    'توکن را از referrer یا history پیدا کن.',
    ['صفحه reset-password را ببین', 'توکن در query است'],
    '/lab/blog/reset');

  add('A02', 'Cryptographic Failures', 'a02-weak-jwt-secret', 'JWT با secret ضعیف', 'medium', 22,
    'secret JWT قابل brute-force است.',
    'ترید از HS256 با secret کوتاه استفاده می‌کند.',
    'secret را کرک کن و توکن ادمین بساز.',
    ['از jwt_tool یا hashcat استفاده کن', 'wordlist کوچک کافی است'],
    '/lab/trade/login');

  add('A02', 'Cryptographic Failures', 'a02-ecb-pattern', 'AES-ECB و الگوی قابل تشخیص', 'medium', 25,
    'رمزنگاری ECB الگوهای تکراری را حفظ می‌کند.',
    'کوکی سبد خرید فروشگاه با ECB رمز شده.',
    'با دستکاری بلوک‌ها قیمت یا آیتم را عوض کن.',
    ['کوکی cart را ببین', 'بلوک‌های تکراری را شناسایی کن'],
    '/lab/shop/cart');

  add('A02', 'Cryptographic Failures', 'a02-padding-oracle', 'Padding Oracle', 'hard', 40,
    'خطای padding به مهاجم اطلاعات می‌دهد.',
    'API رمزگشایی کوکی خطاهای متمایز برمی‌گرداند.',
    'با oracle حمله کن و داده را رمزگشایی کن.',
    ['پاسخ‌های 500 vs 400 را مقایسه کن', 'از padbuster-style استفاده کن'],
    '/lab/shop/api/decrypt');

  add('A02', 'Cryptographic Failures', 'a02-insecure-random', 'Random ناامن برای توکن', 'medium', 20,
    'توکن با Math.random یا seed قابل پیش‌بینی ساخته می‌شود.',
    'توکن دعوت بلاگ قابل حدس است.',
    'توکن بعدی را پیش‌بینی کن.',
    ['چند توکن پشت سر هم بگیر', 'الگو را پیدا کن'],
    '/lab/blog/invite');

  add('A02', 'Cryptographic Failures', 'a02-http-cleartext', 'انتقال cleartext روی HTTP', 'easy', 8,
    'لاگین روی HTTP بدون TLS است (شبیه‌سازی).',
    'صفحه لاگین فروشگاه روی کانال ناامن است.',
    'ترافیک را ببین و credential را بردار (در lab شبیه‌سازی شده).',
    ['از Burp proxy استفاده کن', 'درخواست POST لاگین را ببین'],
    '/lab/shop/login');

  add('A02', 'Cryptographic Failures', 'a02-weak-tls-sim', 'پیکربندی ضعیف (شبیه‌سازی)', 'medium', 15,
    'سرور cipherهای ضعیف را می‌پذیرد (شبیه‌سازی در lab).',
    'endpoint تست TLS در ترید cipher ضعیف را نشان می‌دهد.',
    'لیست cipher را بخوان و فلگ را پیدا کن.',
    ['به /lab/trade/tls-info برو'],
    '/lab/trade/tls-info');

  add('A02', 'Cryptographic Failures', 'a02-key-in-repo', 'کلید خصوصی در فایل عمومی', 'hard', 28,
    'فایل .pem یا private key در مسیر قابل دانلود است.',
    'در shop مسیر /.git یا /backup کلید دارد.',
    'کلید را دانلود و استفاده کن.',
    ['/lab/shop/backup/ یا مسیرهای backup', 'private.pem'],
    '/lab/shop/backup');

  // ===================== A03 Injection (15) =====================
  add('A03', 'Injection', 'a03-reflected-xss', 'Reflected XSS در جستجو', 'easy', 10,
    'پارامتر جستجو بدون encode در HTML منعکس می‌شود.',
    'جستجوی RavenShop مقدار q را مستقیم چاپ می‌کند.',
    'XSS انعکاسی بزن و فلگ را بگیر.',
    ['<script>alert(1)</script>', 'یا event handlerها'],
    '/lab/shop/search');

  add('A03', 'Injection', 'a03-stored-xss-comment', 'Stored XSS در نظرات', 'easy', 12,
    'نظرات بدون فیلتر ذخیره و نمایش داده می‌شوند.',
    'صفحه محصول فروشگاه کامنت را raw ذخیره می‌کند.',
    'کامنت XSS بگذار تا برای دیگران اجرا شود.',
    ['در فیلد comment اسکریپت بگذار', 'صفحه را رفرش کن'],
    '/lab/shop/product');

  add('A03', 'Injection', 'a03-sqli-login', 'SQL Injection در لاگین', 'easy', 12,
    'لاگین با الحاق رشته ساخته شده.',
    'فرم لاگین ادمین فروشگاه آسیب‌پذیر است.',
    'با OR 1=1 بایپس کن.',
    ["' OR 1=1 --", "admin'--"],
    '/lab/shop/admin-login');

  add('A03', 'Injection', 'a03-sqli-search', 'SQLi در جستجوی محصولات', 'easy', 14,
    'جستجو مستقیماً در کوئری می‌رود.',
    'API سرچ فروشگاه.',
    'Union-based یا error-based استخراج کن.',
    ["' UNION SELECT ...", 'تعداد ستون‌ها را پیدا کن'],
    '/lab/shop/api/search');

  add('A03', 'Injection', 'a03-cmdi-ping', 'Command Injection در Ping', 'easy', 15,
    'ورودی کاربر به shell پاس داده می‌شود.',
    'ابزار شبکه فروشگاه.',
    'دستور سیستم اجرا کن.',
    ['; یا &&', 'cat فایل فلگ'],
    '/lab/shop/tools/ping');

  add('A03', 'Injection', 'a03-stored-xss-profile', 'Stored XSS در bio پروفایل', 'medium', 20,
    'bio کاربر بدون sanitize در صفحه عمومی است.',
    'پروفایل عمومی بلاگ.',
    'XSS ماندگار در bio بگذار.',
    ['bio را با payload آپدیت کن', 'صفحه پروفایل عمومی را باز کن'],
    '/lab/blog/profile/edit');

  add('A03', 'Injection', 'a03-blind-sqli', 'Blind SQLi (Boolean)', 'medium', 25,
    'پاسخ فقط true/false است.',
    'چک موجودی محصول.',
    'دیتا را بیت‌به‌بیت استخراج کن.',
    ['AND 1=1 vs AND 1=2', 'SUBSTR و LENGTH'],
    '/lab/shop/stock');

  add('A03', 'Injection', 'a03-time-blind-sqli', 'Time-based Blind SQLi', 'medium', 28,
    'تأخیر زمانی تنها سیگنال است.',
    'API فیلتر سفارش‌ها.',
    'با SLEEP یا WAITFOR استخراج کن.',
    ['SLEEP(3)', 'تفاوت زمان پاسخ را اندازه بگیر'],
    '/lab/shop/api/orders/filter');

  add('A03', 'Injection', 'a03-ssti', 'Server-Side Template Injection', 'medium', 26,
    'نام کاربر در قالب سرور رندر می‌شود.',
    'ایمیل خوش‌آمدگویی یا صفحه پروفایل.',
    'از قالب به RCE برس.',
    ['{{7*7}} یا <%= 7*7 %>', 'سپس خواندن فایل'],
    '/lab/shop/profile/render');

  add('A03', 'Injection', 'a03-dom-xss', 'DOM XSS با فیلتر ضعیف', 'medium', 22,
    'location.hash بدون sanitize به innerHTML می‌رود.',
    'صفحه خوش‌آمدگویی ترید.',
    'فیلتر script را دور بزن.',
    ['از img onerror استفاده کن', 'یا svg'],
    '/lab/trade/welcome');

  add('A03', 'Injection', 'a03-nosql-injection', 'NoSQL Injection', 'medium', 24,
    'ورودی JSON مستقیم به کوئری Mongo-like می‌رود.',
    'لاگین ترید با JSON.',
    'با $ne یا $gt بایپس کن.',
    ['{"$ne": null}', 'operator injection'],
    '/lab/trade/api/login');

  add('A03', 'Injection', 'a03-ldap-injection', 'LDAP Injection', 'hard', 30,
    'جستجوی کاربر در LDAP بدون escape.',
    'دایرکتوری داخلی شرکت (شبیه‌سازی).',
    'فیلتر LDAP را بشکان.',
    ['*)(uid=*', 'bypass authentication'],
    '/lab/shop/directory');

  add('A03', 'Injection', 'a03-xpath-injection', 'XPath Injection', 'hard', 28,
    'جستجو در XML با XPath آسیب‌پذیر.',
    'کاتالوگ محصولات XML-based.',
    'XPath را تزریق کن.',
    ["' or '1'='1", 'extract nodes'],
    '/lab/shop/catalog-xml');

  add('A03', 'Injection', 'a03-second-order-sqli', 'Second-Order SQL Injection', 'hard', 35,
    'داده در ثبت‌نام ذخیره و بعداً در کوئری دیگر استفاده می‌شود.',
    'ثبت‌نام فروشگاه → تغییر ایمیل.',
    'payload را در username بگذار تا بعداً فعال شود.',
    ["username با '", 'بعد به change-email برو'],
    '/lab/shop/register');

  add('A03', 'Injection', 'a03-cmdi-filtered', 'Command Injection با فیلتر', 'hard', 38,
    'کاراکترهای خطرناک بلاک شده‌اند.',
    'ابزار traceroute.',
    'با تکنیک‌های bypass فیلتر را دور بزن.',
    ['$() یا backticks', 'newline / IFS'],
    '/lab/shop/tools/traceroute');

  // ===================== A04 Insecure Design (8) =====================
  add('A04', 'Insecure Design', 'a04-no-rate-limit', 'نبود Rate Limit روی لاگین', 'easy', 12,
    'لاگین بدون محدودیت تعداد تلاش.',
    'بروت‌فورس رمز ادمین ممکن است.',
    'رمز ساده را brute کن.',
    ['لیست رمزهای رایج', 'اسکریپت یا Burp Intruder'],
    '/lab/shop/admin-login');

  add('A04', 'Insecure Design', 'a04-predictable-reset', 'توکن ریست قابل پیش‌بینی', 'easy', 14,
    'توکن ریست فقط بر اساس userId یا timestamp است.',
    'بازیابی رمز بلاگ.',
    'توکن معتبر برای کاربر دیگر بساز.',
    ['الگوی توکن را ببین', 'userId را عوض کن'],
    '/lab/blog/forgot');

  add('A04', 'Insecure Design', 'a04-business-logic-price', 'دستکاری قیمت در سبد', 'medium', 22,
    'قیمت از سمت کلاینت قبول می‌شود.',
    'سبد خرید فروشگاه قیمت را از request می‌گیرد.',
    'قیمت را منفی یا صفر کن.',
    ['درخواست checkout را اینترسپت کن', 'price را تغییر بده'],
    '/lab/shop/checkout');

  add('A04', 'Insecure Design', 'a04-coupon-abuse', 'منطق کوپن قابل سوءاستفاده', 'medium', 20,
    'کوپن چندبار مصرف یا بدون سقف است.',
    'سیستم تخفیف فروشگاه.',
    'با اعمال مکرر کوپن هزینه را صفر کن.',
    ['همان کوپن را چند بار بفرست', 'race condition را امتحان کن'],
    '/lab/shop/coupon');

  add('A04', 'Insecure Design', 'a04-race-transfer', 'Race Condition در انتقال وجه', 'hard', 40,
    'برداشت مضاعف با درخواست‌های موازی.',
    'پلتفرم ترید موجودی را بدون lock چک می‌کند.',
    'با race موجودی را دوبار خرج کن.',
    ['چند درخواست همزمان', 'Turbo Intruder یا اسکریپت'],
    '/lab/trade/transfer');

  add('A04', 'Insecure Design', 'a04-invite-unlimited', 'دعوت‌نامه نامحدود', 'medium', 18,
    'کد دعوت بدون محدودیت تعداد استفاده.',
    'سیستم رفرال بلاگ.',
    'از یک کد برای ساخت چند حساب ویژه استفاده کن.',
    ['کد invite را پیدا کن', 'چندبار register کن'],
    '/lab/blog/invite');

  add('A04', 'Insecure Design', 'a04-2fa-bypass', 'بایپس 2FA با طراحی ضعیف', 'hard', 35,
    'بعد از لاگین، 2FA فقط در UI اجباری است نه در API.',
    'ترید 2FA دارد اما endpoint حساس چک نمی‌کند.',
    'مستقیماً API حساس را بعد از پسورد صدا بزن.',
    ['مرحله 2FA را skip کن', 'مستقیم به /api/withdraw برو'],
    '/lab/trade/login');

  add('A04', 'Insecure Design', 'a04-negative-qty', 'تعداد منفی در سفارش', 'medium', 16,
    'quantity منفی قبول می‌شود و موجودی/قیمت را خراب می‌کند.',
    'سبد فروشگاه.',
    'تعداد منفی بفرست و اعتبار بگیر.',
    ['quantity=-1', 'مجموع سبد را ببین'],
    '/lab/shop/cart');

  // ===================== A05 Security Misconfiguration (10) =====================
  add('A05', 'Security Misconfiguration', 'a05-default-creds', 'اطلاعات پیش‌فرض', 'easy', 8,
    'پنل با admin/admin یا مشابه باز است.',
    'پنل مدیریت فروشگاه.',
    'با رمز پیش‌فرض وارد شو.',
    ['admin/admin', 'admin/password'],
    '/lab/shop/admin-login');

  add('A05', 'Security Misconfiguration', 'a05-directory-listing', 'Directory Listing', 'easy', 10,
    'لیست فایل‌های پوشه فعال است.',
    'پوشه uploads یا backup.',
    'فایل حساس را از لیست بردار.',
    ['/lab/shop/uploads/', '/lab/shop/backup/'],
    '/lab/shop/uploads');

  add('A05', 'Security Misconfiguration', 'a05-stack-trace', 'نمایش Stack Trace', 'easy', 10,
    'خطا جزئیات داخلی و مسیر فایل را لو می‌دهد.',
    'API با ورودی بد stack نشان می‌دهد.',
    'با ورودی نامعتبر trace را بگیر و فلگ را از آن بخوان.',
    ['پارامتر را خراب کن', 'مسیر فایل یا secret در خطا'],
    '/lab/shop/api/debug');

  add('A05', 'Security Misconfiguration', 'a05-verbose-headers', 'هدرهای اطلاعاتی زیاد', 'easy', 8,
    'Server, X-Powered-By نسخه دقیق را می‌گویند.',
    'همه اپ‌ها.',
    'هدرها را بخوان؛ فلگ در یکی از آن‌هاست.',
    ['Response Headers را ببین', 'X-Flag یا مشابه'],
    '/lab/shop');

  add('A05', 'Security Misconfiguration', 'a05-cors-wildcard', 'CORS با wildcard + credentials', 'medium', 20,
    'Access-Control-Allow-Origin: * همراه credentials.',
    'API ترید.',
    'از origin دیگر دیتا بدزد.',
    ['Origin دلخواه', 'withCredentials'],
    '/lab/trade/api/me');

  add('A05', 'Security Misconfiguration', 'a05-open-s3-sim', 'باکت عمومی (شبیه‌سازی)', 'medium', 18,
    'فایل‌های خصوصی در مسیر عمومی هستند.',
    'آواتار و مدارک کاربران.',
    'مسیر مستقیم فایل دیگر کاربران را باز کن.',
    ['/lab/shop/files/user/', 'شماره را عوض کن'],
    '/lab/shop/files');

  add('A05', 'Security Misconfiguration', 'a05-debug-endpoint', 'endpoint دیباگ باز', 'medium', 22,
    '/debug یا /actuator بدون auth.',
    'ترید Spring-like actuator شبیه‌سازی.',
    'env و secret را از debug بخوان.',
    ['/lab/trade/actuator/env', '/lab/trade/debug'],
    '/lab/trade/debug');

  add('A05', 'Security Misconfiguration', 'a05-csp-none', 'نبود CSP و XSS آسان', 'medium', 15,
    'هیچ Content-Security-Policy نیست.',
    'بلاگ.',
    'XSS بزن؛ فلگ بعد از اجرا نشان داده می‌شود.',
    ['هر payload XSS', 'نبود CSP کمک می‌کند'],
    '/lab/blog');

  add('A05', 'Security Misconfiguration', 'a05-git-exposed', 'پوشه .git در دسترس', 'hard', 30,
    '.git/HEAD و objects قابل دانلود است.',
    'فروشگاه.',
    'ریپو را بازسازی کن و secret را پیدا کن.',
    ['/.git/HEAD', 'از git-dumper استفاده کن'],
    '/lab/shop/.git');

  add('A05', 'Security Misconfiguration', 'a05-admin-no-ip-restrict', 'پنل ادمین بدون محدودیت IP', 'hard', 25,
    'پنل فقط با «امن بودن شبکه» فرض شده.',
    'ادمین ترید از اینترنت باز است.',
    'مستقیم به پنل وصل شو و فلگ را بگیر.',
    ['/lab/trade/admin', 'بدون VPN هم باز است'],
    '/lab/trade/admin');

  // ===================== A06 Vulnerable Components (8) =====================
  add('A06', 'Vulnerable Components', 'a06-outdated-jquery', 'jQuery قدیمی با XSS', 'easy', 12,
    'نسخه jQuery آسیب‌پذیر به XSS.',
    'فرانت فروشگاه.',
    'از CVE شناخته‌شده استفاده کن.',
    ['نسخه jQuery را در سورس ببین', 'payload مربوط به همان نسخه'],
    '/lab/shop');

  add('A06', 'Vulnerable Components', 'a06-known-cve-header', 'نسخه آسیب‌پذیر در هدر', 'easy', 10,
    'X-Powered-By نسخه آسیب‌پذیر را اعلام می‌کند.',
    'همه سرویس‌ها.',
    'نسخه را بخوان؛ فلگ در صفحه changelog همان نسخه است.',
    ['هدر را ببین', '/lab/shop/changelog'],
    '/lab/shop');

  add('A06', 'Vulnerable Components', 'a06-log4j-sim', 'Log4Shell شبیه‌سازی', 'medium', 28,
    'ورودی کاربر لاگ می‌شود و JNDI-like پردازش می‌شود.',
    'لاگین ترید.',
    'payload شبیه ${jndi:...} بفرست.',
    ['در فیلد username', 'فلگ در پاسخ یا لاگ شبیه‌سازی شده'],
    '/lab/trade/login');

  add('A06', 'Vulnerable Components', 'a06-deserial-java-sim', 'Insecure Deserialization', 'hard', 40,
    'آبجکت سریال‌شده از کاربر deserialize می‌شود.',
    'API کوکی session فروشگاه.',
    'payload مخرب بساز (شبیه‌سازی).',
    ['کوکی session را دستکاری کن', 'gadget ساده در lab'],
    '/lab/shop/api/session');

  add('A06', 'Vulnerable Components', 'a06-prototype-pollution', 'Prototype Pollution', 'hard', 35,
    'ادغام آبجکت بدون محافظت از __proto__.',
    'API تنظیمات بلاگ.',
    'با pollution به دسترسی ادمین برس.',
    ['{"__proto__":{"admin":true}}', 'سپس صفحه ادمین'],
    '/lab/blog/api/settings');

  add('A06', 'Vulnerable Components', 'a06-xxe', 'XXE', 'hard', 38,
    'پارسر XML موجودیت خارجی را لود می‌کند.',
    'آپلود فاکتور XML فروشگاه.',
    'فایل سیستم را بخوان.',
    ['DOCTYPE با ENTITY', 'file:///'],
    '/lab/shop/upload-xml');

  add('A06', 'Vulnerable Components', 'a06-old-jwt-lib', 'کتابخانه JWT آسیب‌پذیر', 'medium', 24,
    'نسخه قدیمی که alg confusion دارد.',
    'ترید.',
    'RS256 به HS256 با public key.',
    ['alg را عوض کن', 'با public key امضا کن'],
    '/lab/trade/dashboard');

  add('A06', 'Vulnerable Components', 'a06-depend-confuse-sim', 'Dependency Confusion شبیه‌سازی', 'medium', 20,
    'بسته داخلی با نام عمومی resolve می‌شود (شبیه‌سازی).',
    'صفحه وضعیت بیلد.',
    'نام بسته و فلگ را از صفحه ببین.',
    ['/lab/shop/build-info'],
    '/lab/shop/build-info');

  // ===================== A07 Auth Failures (12) =====================
  add('A07', 'Identification and Authentication Failures', 'a07-default-admin', 'رمز پیش‌فرض ادمین', 'easy', 8,
    'ادمین با رمز ضعیف.',
    'فروشگاه.',
    'با لیست رایج وارد شو.',
    ['admin123', 'password', '123456'],
    '/lab/shop/admin-login');

  add('A07', 'Identification and Authentication Failures', 'a07-user-enum', 'User Enumeration', 'easy', 10,
    'پیام خطا برای یوزر موجود و ناموجود فرق دارد.',
    'لاگین و forgot password.',
    'لیست یوزرهای معتبر را بساز؛ فلگ نام یکی از آن‌هاست.',
    ['پیام‌های خطا را مقایسه کن', 'ایمیل‌های رایج'],
    '/lab/shop/login');

  add('A07', 'Identification and Authentication Failures', 'a07-weak-password-policy', 'سیاست رمز ضعیف', 'easy', 8,
    'رمز ۱ کاراکتری قبول می‌شود.',
    'ثبت‌نام بلاگ.',
    'حساب با رمز ضعیف بساز و فلگ خوش‌آمدگویی را بگیر.',
    ['رمز: a', 'ثبت‌نام موفق فلگ می‌دهد'],
    '/lab/blog/register');

  add('A07', 'Identification and Authentication Failures', 'a07-session-fixation', 'Session Fixation', 'medium', 22,
    'session id قبل از لاگین ثابت می‌ماند.',
    'فروشگاه.',
    'session قربانی را فیکس کن و بعد از لاگین او دسترسی بگیر (شبیه‌سازی).',
    ['session id را در URL یا cookie ببین', 'بعد از لاگین عوض نمی‌شود'],
    '/lab/shop/login');

  add('A07', 'Identification and Authentication Failures', 'a07-no-logout-invalidate', 'Logout بدون باطل کردن Session', 'medium', 18,
    'بعد از logout توکن هنوز معتبر است.',
    'ترید.',
    'با توکن قبلی بعد از logout به API وصل شو.',
    ['توکن را ذخیره کن', 'logout کن و دوباره استفاده کن'],
    '/lab/trade');

  add('A07', 'Identification and Authentication Failures', 'a07-jwt-no-exp', 'JWT بدون انقضا', 'medium', 16,
    'توکن exp ندارد یا خیلی طولانی است.',
    'ترید.',
    'توکن قدیمی را دوباره استفاده کن؛ فلگ در پاسخ است.',
    ['توکن را decode کن', 'فیلد exp را ببین'],
    '/lab/trade/api/me');

  add('A07', 'Identification and Authentication Failures', 'a07-brute-no-lockout', 'عدم قفل حساب', 'medium', 20,
    'هیچ lockout بعد از تلاش‌های ناموفق نیست.',
    'لاگین ترید.',
    'رمز کاربر هدف را brute کن.',
    ['Intruder', 'رمزهای رایج کوتاه'],
    '/lab/trade/login');

  add('A07', 'Identification and Authentication Failures', 'a07-oauth-redirect', 'OAuth Redirect URI دستکاری', 'hard', 32,
    'redirect_uri بدون whitelist دقیق.',
    'لاگین اجتماعی بلاگ.',
    'کد را به سرور خودت بفرست (شبیه‌سازی با فلگ).',
    ['redirect_uri را عوض کن', 'به دامنه دیگر'],
    '/lab/blog/oauth');

  add('A07', 'Identification and Authentication Failures', 'a07-password-reset-poison', 'Host Header Poisoning در ریست', 'hard', 35,
    'لینک ریست بر اساس Host ساخته می‌شود.',
    'بلاگ.',
    'با Host جعلی لینک را به خودت بفرست (شبیه‌سازی).',
    ['هدر Host را عوض کن', 'یا X-Forwarded-Host'],
    '/lab/blog/forgot');

  add('A07', 'Identification and Authentication Failures', 'a07-mfa-bypass-response', 'بایپس MFA با دستکاری پاسخ', 'hard', 30,
    'پاسخ کلاینت‌ساید موفقیت MFA را تعیین می‌کند.',
    'ترید.',
    'پاسخ false را به true تغییر بده.',
    ['در Burp پاسخ را modify کن', 'success: true'],
    '/lab/trade/mfa');

  add('A07', 'Identification and Authentication Failures', 'a07-remember-me-weak', 'Remember-me ناامن', 'medium', 18,
    'کوکی remember-me فقط userId است یا با الگوریتم ضعیف.',
    'فروشگاه.',
    'کوکی را برای کاربر دیگر بساز.',
    ['ساختار کوکی را بفهم', 'userId را عوض کن'],
    '/lab/shop/login');

  add('A07', 'Identification and Authentication Failures', 'a07-captcha-bypass', 'بایپس کپچا', 'medium', 15,
    'کپچا فقط در فرانت چک می‌شود یا قابل reuse است.',
    'ثبت‌نام فروشگاه.',
    'بدون کپچا یا با توکن تکراری ثبت‌نام کن.',
    ['درخواست را بدون captcha بفرست', 'یا همان توکن را دوباره استفاده کن'],
    '/lab/shop/register');

  // ===================== A08 Software and Data Integrity (8) =====================
  add('A08', 'Software and Data Integrity Failures', 'a08-insecure-deser', 'Deserialization ناامن', 'hard', 40,
    'داده کاربر deserialize می‌شود.',
    'کوکی یا پارامتر فروشگاه.',
    'آبجکت مخرب بفرست (lab ساده شده).',
    ['پارامتر data را دستکاری کن', 'فلگ در gadget ساده'],
    '/lab/shop/api/import');

  add('A08', 'Software and Data Integrity Failures', 'a08-unsigned-update', 'آپدیت بدون امضا', 'medium', 22,
    'فایل آپدیت از URL بدون verify لود می‌شود.',
    'پنل ادمین.',
    'URL آپدیت را به فایل خودت تغییر بده (شبیه‌سازی فلگ).',
    ['endpoint آپدیت', 'url را عوض کن'],
    '/lab/shop/admin/update');

  add('A08', 'Software and Data Integrity Failures', 'a08-ci-secret-leak', 'نشت secret در CI log', 'medium', 20,
    'لاگ بیلد شامل API key است.',
    'صفحه build بلاگ.',
    'از لاگ کلید را بردار.',
    ['/lab/blog/ci-logs'],
    '/lab/blog/ci-logs');

  add('A08', 'Software and Data Integrity Failures', 'a08-integrity-cdn', 'CDN بدون SRI', 'easy', 12,
    'اسکریپت خارجی بدون Subresource Integrity.',
    'فروشگاه.',
    'نام پکیج آسیب‌پذیر را ببین؛ فلگ در کامنت همان خط است.',
    ['سورس HTML را ببین', 'script src خارجی'],
    '/lab/shop');

  add('A08', 'Software and Data Integrity Failures', 'a08-auto-install-plugin', 'نصب افزونه بدون بررسی', 'hard', 32,
    'آپلود افزونه/تم بدون امضا.',
    'بلاگ.',
    'افزونه مخرب آپلود کن (شبیه‌سازی).',
    ['/lab/blog/admin/plugins', 'فایل zip با payload'],
    '/lab/blog/admin/plugins');

  add('A08', 'Software and Data Integrity Failures', 'a08-pipeline-inject', 'تزریق به pipeline', 'hard', 38,
    'پارامتر بیلد بدون sanitize به اسکریپت CI می‌رود.',
    'ترید CI.',
    'دستور را در پارامتر بیلد تزریق کن.',
    ['پارامتر branch یا env', 'command injection در CI'],
    '/lab/trade/ci/build');

  add('A08', 'Software and Data Integrity Failures', 'a08-webhook-no-secret', 'Webhook بدون secret', 'medium', 18,
    'webhook پرداخت امضا را چک نمی‌کند.',
    'فروشگاه.',
    'رویداد جعلی پرداخت موفق بفرست.',
    ['POST به /webhook/payment', 'بدون امضا'],
    '/lab/shop/webhook/payment');

  add('A08', 'Software and Data Integrity Failures', 'a08-npm-script-hijack', 'اسکریپت npm مشکوک', 'medium', 16,
    'package.json اسکریپت postinstall خطرناک دارد (قابل مشاهده).',
    'صفحه وابستگی‌ها.',
    'اسکریپت را بخوان و فلگ را از آن استخراج کن.',
    ['/lab/shop/package-info'],
    '/lab/shop/package-info');

  // ===================== A09 Logging Failures (8) =====================
  add('A09', 'Security Logging and Monitoring Failures', 'a09-no-login-log', 'عدم لاگ لاگین ناموفق', 'easy', 10,
    'تلاش‌های ناموفق ثبت نمی‌شوند.',
    'فروشگاه.',
    'صفحه وضعیت مانیتورینگ را ببین؛ نبود لاگ خودش فلگ است.',
    ['/lab/shop/monitoring', 'لاگ auth خالی است'],
    '/lab/shop/monitoring');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-sensitive-in-logs', 'داده حساس در لاگ', 'easy', 12,
    'رمز یا توکن در لاگ نوشته می‌شود.',
    'لاگ‌های ترید.',
    'لاگ را بخوان و credential را بردار.',
    ['/lab/trade/logs', 'password= در لاگ'],
    '/lab/trade/logs');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-log-injection', 'Log Injection', 'medium', 20,
    'ورودی کاربر بدون sanitize لاگ می‌شود و می‌تواند لاگ را جعل کند.',
    'فرم تماس.',
    'باnewline رکورد جعلی ادمین بساز؛ فلگ در سیستم آلرت است.',
    ['\\n یا %0a در ورودی', 'رکورد جعلی موفق'],
    '/lab/shop/contact');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-no-alert', 'نبود هشدار برای حمله', 'medium', 15,
    'صدها تلاش brute بدون alert.',
    'داشبورد SOC شبیه‌سازی.',
    'حمله کن و ببین alertی نیست؛ فلگ در صفحه SOC است.',
    ['/lab/shop/soc', 'وضعیت alert'],
    '/lab/shop/soc');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-log-tamper', 'قابل دستکاری بودن لاگ', 'hard', 28,
    'فایل لاگ از طریق اپ قابل نوشتن است.',
    'endpoint ادمین.',
    'لاگ را پاک یا تغییر بده و فلگ پنهان را ببین.',
    ['/lab/shop/admin/logs', 'حذف لاگ'],
    '/lab/shop/admin/logs');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-insufficient-audit', 'Audit ناکافی روی اعمال حساس', 'medium', 18,
    'تغییر نقش یا انتقال وجه لاگ نمی‌شود.',
    'ترید.',
    'عمل حساس انجام بده و در audit نبودش را ببین؛ فلگ آنجا است.',
    ['/lab/trade/audit'],
    '/lab/trade/audit');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-log4j-style', 'پردازش ورودی در لاگر', 'hard', 30,
    'لاگر عبارت‌های خاص را expand می‌کند.',
    'مشابه A06 log4j.',
    'payload در فیلد لاگ‌شونده بفرست.',
    ['username با ${...', 'پاسخ شامل فلگ'],
    '/lab/trade/login');

  add('A09', 'Security Logging and Monitoring Failures', 'a09-client-only-log', 'فقط لاگ کلاینت‌ساید', 'easy', 10,
    'رویدادهای امنیتی فقط در console مرورگر لاگ می‌شوند.',
    'بلاگ.',
    'سورس JS را بخوان؛ فلگ در کامنت لاگ است.',
    ['فایل app.js بلاگ', 'کامنت TODO security'],
    '/lab/blog');

  // ===================== A10 SSRF (9) =====================
  add('A10', 'Server-Side Request Forgery', 'a10-basic-fetch', 'SSRF پایه', 'easy', 12,
    'سرور URL کاربر را fetch می‌کند.',
    'پیش‌نمایش لینک فروشگاه.',
    'آدرس داخلی را بده.',
    ['http://127.0.0.1', 'localhost'],
    '/lab/shop/preview');

  add('A10', 'Server-Side Request Forgery', 'a10-file-protocol', 'SSRF با file://', 'medium', 22,
    'پروتکل file مجاز است.',
    'همان پیش‌نمایش.',
    'file:/// و مسیر فلگ را بخوان.',
    ['file:///etc/passwd', 'یا مسیر lab'],
    '/lab/shop/preview');

  add('A10', 'Server-Side Request Forgery', 'a10-blacklist-bypass', 'دور زدن blacklist', 'medium', 25,
    'localhost و 127.0.0.1 بلاک‌اند.',
    'پیش‌نمایش.',
    'با encoding یا IP جایگزین دور بزن.',
    ['0', '127.1', '[::1]', 'decimal IP'],
    '/lab/shop/preview-safe');

  add('A10', 'Server-Side Request Forgery', 'a10-cloud-metadata', 'Metadata Cloud', 'hard', 35,
    'دسترسی به 169.254.169.254 (شبیه‌سازی).',
    'ترید روی cloud.',
    'metadata را بخوان و فلگ/credentials را بگیر.',
    ['http://169.254.169.254/', 'latest/meta-data/'],
    '/lab/trade/webhook-test');

  add('A10', 'Server-Side Request Forgery', 'a10-redirect-follow', 'Follow Redirect به داخلی', 'hard', 32,
    'سرور redirect را دنبال می‌کند.',
    'fetch با follow redirects.',
    'از redirect باز به 127.0.0.1 برس.',
    ['یک URL عمومی که redirect می‌کند', 'یا open redirect خود lab'],
    '/lab/shop/preview');

  add('A10', 'Server-Side Request Forgery', 'a10-gopher-sim', 'پروتکل غیرHTTP (شبیه‌سازی)', 'hard', 38,
    'gopher یا dict پشتیبانی می‌شود (شبیه‌سازی).',
    'ابزار شبکه.',
    'با پروتکل خاص به سرویس داخلی حرف بزن.',
    ['gopher://', 'پاسخ شبیه‌سازی شده فلگ دارد'],
    '/lab/shop/tools/fetch');

  add('A10', 'Server-Side Request Forgery', 'a10-partial-ssrf', 'Partial SSRF / Host header', 'medium', 20,
    'فقط host از کاربر گرفته می‌شود.',
    'پینگ یا health check.',
    'host داخلی بده.',
    ['Host داخلی', 'پورت سرویس داخلی'],
    '/lab/trade/health-check');

  add('A10', 'Server-Side Request Forgery', 'a10-svg-xxe-ssrf', 'SSRF از طریق SVG/XXE', 'hard', 36,
    'آپلود SVG که entity خارجی دارد.',
    'آواتار بلاگ.',
    'با XXE به SSRF برس.',
    ['SVG با ENTITY', 'http داخلی'],
    '/lab/blog/avatar');

  add('A10', 'Server-Side Request Forgery', 'a10-dns-rebinding-sim', 'DNS Rebinding شبیه‌سازی', 'hard', 40,
    'چک اولیه با resolve بعدی فرق دارد (شبیه‌سازی).',
    'whitelist مبتنی بر DNS.',
    'سناریوی lab را دنبال کن و فلگ را بگیر.',
    ['/lab/shop/preview-rebind', 'دستورالعمل روی صفحه'],
    '/lab/shop/preview-rebind');


  // ===================== ARENA 100-point chains =====================
  add('ARENA', 'Red Team Arena', 'arena-chain-shop', 'زنجیره نفوذ TargetCorp Shop', 'hard', 100,
    'از recon تا SSRF و دسترسی ادمین فروشگاه — فلگ نهایی زنجیره.',
    'هدف: فروشگاه یکپارچه Lab. مسیر کامل حمله را طی کن.',
    'از /lab/shop شروع کن و زنجیره را کامل کن.',
    ['لاگین ادمین با SQLi', 'SSRF به داخلی', 'فلگ نهایی در پنل'],
    '/lab/shop');
  add('ARENA', 'Red Team Arena', 'arena-chain-network', 'از اسکن تا شل شبکه', 'hard', 100,
    'کشف پورت و دامنه تا ورود به پنل :8080',
    'آزمایشگاه شبکه TargetCorp.',
    'scan → dns → port 8080 → login',
    ['curl /lab/network/scan', 'admin/admin روی 8080'],
    '/lab/network');
  add('ARENA', 'Red Team Arena', 'arena-chain-trade', 'تسخیر کامل RavenTrade', 'hard', 100,
    'JWT + MFA + Race تا فلگ خزانه',
    'پلتفرم ترید.',
    'secret در JS، جعل توکن، race transfer',
    ['TRADE_CONFIG در سورس', 'alg none'],
    '/lab/trade');
  add('ARENA', 'Red Team Arena', 'arena-chain-blog', 'تسخیر RavenBlog', 'hard', 100,
    'IDOR + GraphQL + OAuth',
    'بلاگ.',
    'پست خصوصی تا secret گراف‌کیوال',
    ['uuid پست خصوصی', 'introspection'],
    '/lab/blog');


  // ===================== WAR — Clan War exclusive (medium → hard) =====================
  add('WAR', 'Clan War Ops', 'war-med-1-gateway-xss', 'Gateway XSS روی پنل عملیات', 'medium', 30,
    'در اپ WarOps پارامتر q بدون فیلتر در داشبورد عملیات منعکس می‌شود.',
    'اپ جدید WarOps — مرکز فرماندهی حمله کلَن. جستجوی لاگ آسیب‌پذیر است.',
    'به /lab/war برو و XSS انعکاسی بزن تا فلگ جنگ ظاهر شود.',
    ['پارامتر q را در URL دستکاری کن', 'از event handler به‌جای script استفاده کن', 'فلگ بعد از payload موفق در صفحه است'],
    '/lab/war/search');
  add('WAR', 'Clan War Ops', 'war-med-2-ops-sqli', 'SQLi در لاگین Ops', 'medium', 35,
    'لاگین واحد عملیات با الحاق SQL ساخته شده.',
    'WarOps Login برای نیروهای مهاجم/مدافع.',
    'با OR 1=1 یا مشابه وارد شو و فلگ را بردار.',
    ["' OR 1=1 --", 'admin\'--', 'پیام موفقیت شامل فلگ است'],
    '/lab/war/login');
  add('WAR', 'Clan War Ops', 'war-med-3-intel-idor', 'IDOR پرونده اطلاعاتی', 'medium', 32,
    'پرونده‌های intel با ?id= بدون بررسی مالکیت باز می‌شوند.',
    'بخش Intel در WarOps.',
    'id را عوض کن تا پرونده محرمانه و فلگ را ببینی.',
    ['id=1 عمومی است', 'idهای بالاتر را تست کن', 'پرونده سطح Secret فلگ دارد'],
    '/lab/war/intel?id=1');
  add('WAR', 'Clan War Ops', 'war-med-4-relay-ssrf', 'SSRF رله فرمان', 'medium', 38,
    'رله URL را از سرور WarOps fetch می‌کند.',
    'ابزار Relay برای هماهنگی حمله.',
    'آدرس داخلی را بده و فلگ سرویس داخلی را بگیر.',
    ['127.0.0.1 یا localhost', 'مسیر /lab/war/internal', 'blacklist ساده را دور بزن'],
    '/lab/war/relay');
  add('WAR', 'Clan War Ops', 'war-hard-1-jwt-command', 'جعل JWT فرماندهی', 'hard', 45,
    'توکن فرمان با secret ضعیف یا alg none پذیرفته می‌شود.',
    'پس از لاگین WarOps توکن role را چک می‌کند.',
    'توکن را دستکاری کن تا role=commander شود و فلگ را بگیری.',
    ['secret در JS صفحه است', 'alg:none را امتحان کن', 'به /lab/war/command با توکن برو'],
    '/lab/war/command');
  add('WAR', 'Clan War Ops', 'war-hard-2-supply-race', 'Race روی انبار مهمات', 'hard', 48,
    'برداشت از انبار بدون قفل اتمی است.',
    'Supply depot در WarOps.',
    'با درخواست‌های موازی موجودی را دوبار خرج کن و فلگ را بگیر.',
    ['چند درخواست همزمان', 'مبلغ بیشتر از موجودی', 'پاسخ موفقیت‌آمیز دوم فلگ دارد'],
    '/lab/war/supply');
  add('WAR', 'Clan War Ops', 'war-hard-3-beacon-cmdi', 'Command Injection در Beacon', 'hard', 50,
    'ابزار beacon ورودی host را به shell می‌دهد (با فیلتر ضعیف).',
    'Beacon برای چک دسترسی هدف.',
    'فیلتر را دور بزن و فلگ را از سیستم بخوان.',
    ['; بلاک است ولی $() نه', 'یا backtick', 'خروجی دستور فلگ را نشان می‌دهد'],
    '/lab/war/beacon');
  add('WAR', 'Clan War Ops', 'war-hard-4-vault-access', 'دسترسی به Vault نهایی جنگ', 'hard', 55,
    'Vault فقط با نقش commander و هدر X-War-Token باز می‌شود.',
    'گام آخر زنجیره جنگ — ترکیب یافته‌های قبلی.',
    'از JWT فرماندهی + توکن داخلی برای باز کردن Vault استفاده کن.',
    ['اول JWT commander بساز', 'X-War-Token از /lab/war/internal', 'POST یا GET با هر دو'],
    '/lab/war/vault');



  // Canonical flags (must match /lab responses)
  const FLAGS = {
    'a01-idor-profile': 'FLAG{idor_is_everywhere}',
    'a01-idor-orders': 'FLAG{idor_orders_admin_secret}',
    'a01-force-admin': 'FLAG{force_browsing_works}',
    'a01-horizontal-role': 'FLAG{mass_assignment_privilege_escalation}',
    'a01-vertical-api': 'FLAG{jwt_alg_none_bypass}',
    'a01-idor-uuid': 'FLAG{idor_uuid_guessable}',
    'a01-path-traversal-download': 'FLAG{path_traversal_download}',
    'a01-cors-misconfig': 'FLAG{cors_misconfiguration_steal}',
    'a01-ssrf-to-admin': 'FLAG{ssrf_to_internal_service}',
    'a01-websocket-idor': 'FLAG{idor_is_everywhere}',
    'a01-graphql-authz': 'FLAG{graphql_broken_authorization}',
    'a01-jwt-alg-none': 'FLAG{jwt_alg_none_bypass}',
    'a02-weak-password-hash': 'FLAG{weak_password_hash_md5}',
    'a02-hardcoded-secret': 'FLAG{hardcoded_secret_in_js}',
    'a02-sensitive-in-url': 'FLAG{sensitive_token_in_url}',
    'a02-weak-jwt-secret': 'FLAG{jwt_no_expiry}',
    'a02-ecb-pattern': 'FLAG{client_side_price_tampering}',
    'a02-padding-oracle': 'FLAG{stack_trace_information_disclosure}',
    'a02-insecure-random': 'FLAG{password_reset_token_predictable}',
    'a02-http-cleartext': 'FLAG{user_enumeration_via_error_messages}',
    'a02-weak-tls-sim': 'FLAG{weak_cipher_suite_accepted}',
    'a02-key-in-repo': 'FLAG{directory_listing_sensitive_file}',
    'a03-reflected-xss': 'FLAG{reflected_xss_is_still_alive_2024}',
    'a03-stored-xss-comment': 'FLAG{stored_xss_persists_forever}',
    'a03-sqli-login': 'FLAG{classic_sqli_union_or_bypass}',
    'a03-sqli-search': 'FLAG{sqli_in_search_api}',
    'a03-cmdi-ping': 'FLAG{command_injection_is_dangerous}',
    'a03-stored-xss-profile': 'FLAG{stored_xss_persists_forever}',
    'a03-blind-sqli': 'FLAG{blind_sqli_boolean_based_extraction}',
    'a03-time-blind-sqli': 'FLAG{blind_sqli_boolean_based_extraction}',
    'a03-ssti': 'FLAG{ssti_leads_to_rce}',
    'a03-dom-xss': 'FLAG{dom_xss_filter_bypass_master}',
    'a03-nosql-injection': 'FLAG{nosql_injection_login}',
    'a03-ldap-injection': 'FLAG{classic_sqli_union_or_bypass}',
    'a03-xpath-injection': 'FLAG{sqli_in_search_api}',
    'a03-second-order-sqli': 'FLAG{second_order_sqli_is_sneaky}',
    'a03-cmdi-filtered': 'FLAG{advanced_cmdi_bypass_ninja}',
    'a04-no-rate-limit': 'FLAG{default_admin_creds}',
    'a04-predictable-reset': 'FLAG{password_reset_token_predictable}',
    'a04-business-logic-price': 'FLAG{business_logic_price_qty_abuse}',
    'a04-coupon-abuse': 'FLAG{client_side_price_tampering}',
    'a04-race-transfer': 'FLAG{race_condition_double_spend}',
    'a04-invite-unlimited': 'FLAG{unlimited_invite_code}',
    'a04-2fa-bypass': 'FLAG{mfa_bypass_response_manipulation}',
    'a04-negative-qty': 'FLAG{business_logic_price_qty_abuse}',
    'a05-default-creds': 'FLAG{default_admin_creds}',
    'a05-directory-listing': 'FLAG{directory_listing_sensitive_file}',
    'a05-stack-trace': 'FLAG{stack_trace_information_disclosure}',
    'a05-verbose-headers': 'FLAG{verbose_headers_leak}',
    'a05-cors-wildcard': 'FLAG{cors_misconfiguration_steal}',
    'a05-open-s3-sim': 'FLAG{directory_listing_sensitive_file}',
    'a05-debug-endpoint': 'FLAG{debug_endpoint_exposed}',
    'a05-csp-none': 'FLAG{reflected_xss_is_still_alive_2024}',
    'a05-git-exposed': 'FLAG{directory_listing_sensitive_file}',
    'a05-admin-no-ip-restrict': 'FLAG{admin_panel_no_ip_restriction}',
    'a06-outdated-jquery': 'FLAG{outdated_jquery_and_no_sri}',
    'a06-known-cve-header': 'FLAG{outdated_component_version_in_header}',
    'a06-log4j-sim': 'FLAG{log4j_style_injection}',
    'a06-deserial-java-sim': 'FLAG{second_order_sqli_is_sneaky}',
    'a06-prototype-pollution': 'FLAG{prototype_pollution_to_admin}',
    'a06-xxe': 'FLAG{svg_xxe_ssrf}',
    'a06-old-jwt-lib': 'FLAG{jwt_alg_none_bypass}',
    'a06-depend-confuse-sim': 'FLAG{dependency_confusion_sim}',
    'a07-default-admin': 'FLAG{default_admin_creds}',
    'a07-user-enum': 'FLAG{user_enumeration_via_error_messages}',
    'a07-weak-password-policy': 'FLAG{weak_password_policy}',
    'a07-session-fixation': 'FLAG{captcha_bypass_client_only}',
    'a07-no-logout-invalidate': 'FLAG{jwt_no_expiry}',
    'a07-jwt-no-exp': 'FLAG{jwt_no_expiry}',
    'a07-brute-no-lockout': 'FLAG{no_alerting_on_bruteforce}',
    'a07-oauth-redirect': 'FLAG{oauth_redirect_uri_manipulation}',
    'a07-password-reset-poison': 'FLAG{host_header_poisoning_reset}',
    'a07-mfa-bypass-response': 'FLAG{mfa_bypass_response_manipulation}',
    'a07-remember-me-weak': 'FLAG{idor_is_everywhere}',
    'a07-captcha-bypass': 'FLAG{captcha_bypass_client_only}',
    'a08-insecure-deser': 'FLAG{second_order_sqli_is_sneaky}',
    'a08-unsigned-update': 'FLAG{force_browsing_works}',
    'a08-ci-secret-leak': 'FLAG{ci_secret_in_logs}',
    'a08-integrity-cdn': 'FLAG{outdated_jquery_and_no_sri}',
    'a08-auto-install-plugin': 'FLAG{prototype_pollution_to_admin}',
    'a08-pipeline-inject': 'FLAG{command_injection_is_dangerous}',
    'a08-webhook-no-secret': 'FLAG{webhook_no_signature_verification}',
    'a08-npm-script-hijack': 'FLAG{npm_postinstall_hijack}',
    'a09-no-login-log': 'FLAG{no_failed_login_logging}',
    'a09-sensitive-in-logs': 'FLAG{sensitive_data_in_logs}',
    'a09-log-injection': 'FLAG{log_injection_forged_entry}',
    'a09-no-alert': 'FLAG{no_alerting_on_bruteforce}',
    'a09-log-tamper': 'FLAG{no_failed_login_logging}',
    'a09-insufficient-audit': 'FLAG{insufficient_audit_logging}',
    'a09-log4j-style': 'FLAG{log4j_style_injection}',
    'a09-client-only-log': 'FLAG{client_only_security_logging}',
    'a10-basic-fetch': 'FLAG{ssrf_to_internal_service}',
    'a10-file-protocol': 'FLAG{ssrf_file_protocol}',
    'a10-blacklist-bypass': 'FLAG{ssrf_blacklist_bypass}',
    'a10-cloud-metadata': 'FLAG{ssrf_cloud_metadata}',
    'a10-redirect-follow': 'FLAG{ssrf_to_internal_service}',
    'a10-gopher-sim': 'FLAG{ssrf_to_internal_service}',
    'a10-partial-ssrf': 'FLAG{partial_ssrf_host_header}',
    'a10-svg-xxe-ssrf': 'FLAG{svg_xxe_ssrf}',
    'a10-dns-rebinding-sim': 'FLAG{ssrf_blacklist_bypass}',
    'arena-chain-shop': 'FLAG{arena_shop_full_chain_100}',
    'arena-chain-network': 'FLAG{arena_network_pwn_100}',
    'arena-chain-trade': 'FLAG{arena_trade_full_chain_100}',
    'arena-chain-blog': 'FLAG{arena_blog_full_chain_100}',
    'war-med-1-gateway-xss': 'FLAG{war_gateway_xss_ops}',
    'war-med-2-ops-sqli': 'FLAG{war_ops_sqli_login}',
    'war-med-3-intel-idor': 'FLAG{war_intel_idor_secret}',
    'war-med-4-relay-ssrf': 'FLAG{war_relay_ssrf}',
    'war-hard-1-jwt-command': 'FLAG{war_jwt_commander}',
    'war-hard-2-supply-race': 'FLAG{war_supply_race}',
    'war-hard-3-beacon-cmdi': 'FLAG{war_beacon_cmdi}',
    'war-hard-4-vault-access': 'FLAG{war_vault_final}',
    // tool-focused extras
    'tool-burp-repeater': 'FLAG{tool_burp_repeater_master}',
    'tool-nmap-recon': 'FLAG{network_port_scan_complete}',
    'tool-sqlmap-basic': 'FLAG{classic_sqli_union_or_bypass}',
    'tool-ffuf-admin': 'FLAG{force_browsing_works}',
    'tool-jwt-none': 'FLAG{jwt_alg_none_bypass}',
    'tool-nuclei-header': 'FLAG{verbose_headers_leak}'
  };

  C.forEach(ch => {
    if (!ch.flag) ch.flag = FLAGS[ch.slug] || ('FLAG{' + ch.slug.replace(/-/g, '_') + '}');
  });

  // Insert all
  C.forEach(ch => store.insertChallenge(ch));
  console.log('✅ Seeded ' + C.length + ' challenges across OWASP Top 10');
}

module.exports = { seedAll };
