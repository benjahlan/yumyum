'use strict';
(() => {
  const entries=[...new URLSearchParams(location.search).entries()];
  const valid=entries.length===1&&['post','profile'].includes(entries[0][0])&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entries[0][1])&&!location.hash;
  const get=id=>document.getElementById(id);
  const en=(document.documentElement.lang||'').startsWith('en');const t=(a,e)=>en?e:a;
  const sw=get('langSwitch');if(sw)sw.href=sw.getAttribute('href')+location.search;
  if(!valid){get('heading').textContent=t('لنبحث عن الرابط الصحيح.','Let’s find the right link.');get('description').hidden=true;get('invalid').hidden=false;get('help').hidden=true;return;}
  const [kind,id]=entries[0];
  get('heading').textContent=kind==='post'?t('لحظة طعام تمت مشاركتها معك.','A food moment shared with you.'):t('تعرّف على أحد أعضاء يم يم.','Meet a YumYum member.');
  const android=/Android/i.test(navigator.userAgent);
  const home=(location.hostname==='benjahlan.github.io'?'https://benjahlan.github.io/yumyum/':location.origin+'/')+(en?'en/':'');
  // On Android an intent link opens the installed app, or falls back to the site home page when it is missing.
  get('open').href=android?'intent://'+kind+'/'+id+'#Intent;scheme=yumyum;package=io.github.benjahlan.yumyum;S.browser_fallback_url='+encodeURIComponent(home)+';end':'yumyum://'+kind+'/'+id;get('open').hidden=false;
  const canonical=location.hostname==='benjahlan.github.io'?'https://benjahlan.github.io/yumyum/share/?'+kind+'='+id:location.origin+'/share/?'+kind+'='+id;
  get('link').value=canonical;
  if(kind==='profile')get('description').textContent=t('افتح الحساب في يم يم وسجّل الدخول للمتابعة.','Open the profile in YumYum and sign in to follow.');
  get('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(canonical);get('status').textContent=t('تم نسخ الرابط','Link copied');}catch{get('link').focus();get('link').select();get('status').textContent=t('حدّد الرابط أعلاه وانسخه.','Select the link above and copy it.');}});
  // Watch-only: a post its cook opened to guests plays right here; anything else asks to sign in in the app.
  if(kind==='post'&&window.YYWatch)window.YYWatch.mountShare(id,get('open').href).then(r=>{if(!r.shown&&r.memberOnly)get('description').textContent=t('سجّل الدخول في التطبيق لرؤية هذا المنشور.','Sign in in the app to see this post.');});
})();
