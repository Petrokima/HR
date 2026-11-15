// The page the "choose a new password" e-mail opens (app.petrokima-hr.com/reset-password.html#t=…&l=ar) — database file 134,
// edge function password-reset. The link's secret is read from the part of the address after "#" (never sent to any server by the
// browser) and removed from the address bar at once; it is then sent only to our own function. English / Arabic.
(function () {
  'use strict';
  var FN = 'https://hckkrzghxxhauotyqlqr.supabase.co/functions/v1/password-reset';
  var T = {
    en: { other: 'العربية', wait: 'Checking the link…', deadTitle: 'This link no longer works',
      dead: 'It was already used, or more than 30 minutes have passed, or a newer link was sent. On the sign-in screen press “Forgot your password?” to get a new one.',
      title: 'Choose a new password', forCode: 'Employee code {c} · this link works for {m} more minute(s).', l1: 'New password', l2: 'The same password again',
      show: 'Show the passwords', rules: 'At least 8 characters, with letters AND numbers (for example Cairo2026). Do not use your first password.',
      go: 'Save the new password', saving: 'Saving…', fill: 'Type the new password in both boxes.', same: 'The two passwords are not the same.',
      short: 'The password must be at least 8 characters.', long: 'The password can be at most 72 characters.', letters: 'The password must contain letters and numbers (for example Cairo2026).',
      first: 'Choose a password different from your first one.', expired: 'This link no longer works — ask for a new one on the sign-in screen.',
      error: 'The password could not be saved (no internet or the server is busy). Try again in a minute.',
      doneTitle: 'Your password has been changed', done: 'Sign in with your employee code and the new password on the Petrokima app or at hr.petrokima-hr.com.',
      doneMore: 'You were signed out on your other phones and computers. An e-mail confirms the change.' },
    ar: { other: 'English', wait: 'جارٍ التحقق من الرابط…', deadTitle: 'هذا الرابط لم يعد يعمل',
      dead: 'إما أنه استُخدم من قبل، أو مرّت أكثر من 30 دقيقة، أو أُرسل رابط أحدث. اضغط «نسيت كلمة المرور؟» في شاشة تسجيل الدخول للحصول على رابط جديد.',
      title: 'اختيار كلمة مرور جديدة', forCode: 'كود الموظف {c} · يعمل هذا الرابط {m} دقيقة أخرى.', l1: 'كلمة المرور الجديدة', l2: 'أعد كتابة كلمة المرور',
      show: 'إظهار كلمتي المرور', rules: '8 أحرف على الأقل، تحتوي على حروف وأرقام (مثال Cairo2026). لا تستخدم كلمة المرور الأولى.',
      go: 'حفظ كلمة المرور الجديدة', saving: 'جارٍ الحفظ…', fill: 'اكتب كلمة المرور الجديدة في الخانتين.', same: 'كلمتا المرور غير متطابقتين.',
      short: 'يجب ألا تقل كلمة المرور عن 8 أحرف.', long: 'يجب ألا تزيد كلمة المرور عن 72 حرفاً.', letters: 'يجب أن تحتوي كلمة المرور على حروف وأرقام (مثال Cairo2026).',
      first: 'اختر كلمة مرور مختلفة عن كلمة المرور الأولى.', expired: 'هذا الرابط لم يعد يعمل — اطلب رابطاً جديداً من شاشة تسجيل الدخول.',
      error: 'تعذّر حفظ كلمة المرور (لا يوجد إنترنت أو الخادم مشغول). حاول مرة أخرى بعد دقيقة.',
      doneTitle: 'تم تغيير كلمة المرور', done: 'سجّل الدخول بكود الموظف وكلمة المرور الجديدة في تطبيق بتروكيما أو على hr.petrokima-hr.com.',
      doneMore: 'تم تسجيل خروجك من هواتفك وأجهزتك الأخرى. ستصلك رسالة بريد تؤكد التغيير.' }
  };
  var $ = function (id) { return document.getElementById(id); };
  var hash = new URLSearchParams((location.hash || '').replace(/^#/, ''));
  var token = hash.get('t') || '';
  var lang = hash.get('l') === 'ar' ? 'ar' : 'en';
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* the address bar keeps it — nothing else changes */ }
  var state = { code: '', minutes: 0, err: '', offline: false };

  function t(k) { return T[lang][k]; }
  function paint() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $('rp-lang').textContent = t('other'); $('rp-wait-text').textContent = t('wait');
    $('rp-dead-title').textContent = t(state.offline ? 'title' : 'deadTitle'); $('rp-dead-text').textContent = t(state.offline ? 'error' : 'dead');
    $('rp-title').textContent = t('title'); $('rp-for').textContent = t('forCode').replace('{c}', state.code).replace('{m}', String(state.minutes));
    $('rp-l1').textContent = t('l1'); $('rp-l2').textContent = t('l2'); $('rp-show-text').textContent = t('show'); $('rp-rules').textContent = t('rules');
    if (!$('rp-go').disabled) $('rp-go').textContent = t('go');
    $('rp-err').textContent = state.err ? t(state.err) : ''; $('rp-err').hidden = !state.err;
    $('rp-done-title').textContent = t('doneTitle'); $('rp-done-text').textContent = t('done'); $('rp-done-more').textContent = t('doneMore');
  }
  function show(part) { ['rp-wait', 'rp-dead', 'rp-form', 'rp-done'].forEach(function (id) { $(id).hidden = id !== part; }); }
  function call(body) {
    return fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), referrerPolicy: 'no-referrer', cache: 'no-store' })
      .then(function (r) { return r.json(); });
  }

  $('rp-lang').addEventListener('click', function () { lang = lang === 'ar' ? 'en' : 'ar'; paint(); });
  $('rp-show').addEventListener('change', function () { var ty = $('rp-show').checked ? 'text' : 'password'; $('rp-p1').type = ty; $('rp-p2').type = ty; });
  $('rp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var a = $('rp-p1').value, b = $('rp-p2').value;
    state.err = !a || !b ? 'fill' : a !== b ? 'same' : a.length < 8 ? 'short' : a.length > 72 ? 'long' : !/[A-Za-z]/.test(a) || !/[0-9]/.test(a) ? 'letters' : '';
    if (state.err) { paint(); return; }
    $('rp-go').disabled = true; $('rp-go').textContent = t('saving');
    call({ step: 'set', token: token, password: a }).then(function (d) {
      $('rp-go').disabled = false;
      if (d && d.ok) { token = ''; $('rp-p1').value = ''; $('rp-p2').value = ''; show('rp-done'); state.err = ''; paint(); return; }
      var why = d && d.why;
      if (why === 'expired') { show('rp-dead'); paint(); return; }
      state.err = T.en[why] && ['short', 'long', 'letters', 'first'].indexOf(why) >= 0 ? why : 'error'; paint();
    }, function () { $('rp-go').disabled = false; state.err = 'error'; paint(); });
  });

  paint();
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) { show('rp-dead'); return; }
  call({ step: 'check', token: token }).then(function (d) {
    if (d && d.ok && d.valid) { state.code = d.code || ''; state.minutes = d.minutes || 1; show('rp-form'); paint(); $('rp-p1').focus(); }
    else { show('rp-dead'); paint(); }
  }, function () { state.offline = true; show('rp-dead'); paint(); });
}());
