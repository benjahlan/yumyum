'use strict';
(() => {
  const entries=[...new URLSearchParams(location.search).entries()];
  const valid=entries.length===1&&['post','profile'].includes(entries[0][0])&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entries[0][1])&&!location.hash;
  const get=id=>document.getElementById(id);
  if(!valid){get('heading').textContent='لنبحث عن الرابط الصحيح.';get('description').hidden=true;get('invalid').hidden=false;get('help').hidden=true;return;}
  const [kind,id]=entries[0];
  get('heading').textContent=kind==='post'?'لحظة طعام تمت مشاركتها معك.':'تعرّف على أحد أعضاء يم يم.';
  const android=/Android/i.test(navigator.userAgent);
  const home=location.hostname==='benjahlan.github.io'?'https://benjahlan.github.io/yumyum/':location.origin+'/';
  // On Android an intent link opens the installed app, or falls back to the site home page when it is missing.
  get('open').href=android?'intent://'+kind+'/'+id+'#Intent;scheme=yumyum;package=io.github.benjahlan.yumyum;S.browser_fallback_url='+encodeURIComponent(home)+';end':'yumyum://'+kind+'/'+id;get('open').hidden=false;
  const canonical=location.hostname==='benjahlan.github.io'?'https://benjahlan.github.io/yumyum/share/?'+kind+'='+id:location.origin+'/share/?'+kind+'='+id;
  get('link').value=canonical;
  if(kind==='profile')get('description').textContent='افتح الحساب في يم يم وسجّل الدخول للمتابعة.';
  get('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(canonical);get('status').textContent='تم نسخ الرابط';}catch{get('link').focus();get('link').select();get('status').textContent='حدّد الرابط أعلاه وانسخه.';}});
})();
