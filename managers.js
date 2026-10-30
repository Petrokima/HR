// Manager guide: Arabic / English switch (in a file: the security policy forbids code inside pages)
(function(){
  var b = document.body, KEY = 'pk_guide_lang';
  function set(l){ b.classList.toggle('en', l === 'en'); document.documentElement.lang = l; document.documentElement.dir = l === 'en' ? 'ltr' : 'rtl';
    try { localStorage.setItem(KEY, l); } catch (e) {} }
  var q = (location.search.match(/lang=(ar|en)/) || [])[1], s = null;
  try { s = localStorage.getItem(KEY); } catch (e) {}
  set(q || s || 'ar');
  document.getElementById('lang').addEventListener('click', function(){ set(b.classList.contains('en') ? 'ar' : 'en'); });
})();
