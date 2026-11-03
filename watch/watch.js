'use strict';
// YumYum watch-only player: the public feed (/watch/) and a single shared post (/share/).
// A visitor watches; every interaction invites them into the app. No framework, no cookies.
(() => {
  const API = 'https://ndgoxnyemvgsjhergsym.supabase.co/functions/v1/yumyum-public/';
  const KEY = 'sb_publishable_e6nLF2w9m0HAC4MFww7DGw_fktosIPL'; // publishable: designed to be public
  const PKG = 'io.github.benjahlan.yumyum';
  const SHARE = 'https://yumyum-ye.pages.dev/share/?post=';
  const MAIL = 'mailto:doktosam@gmail.com?subject=' + encodeURIComponent('YumYum Android test');
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const MEDIA = /^media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\?t=\d{10}\.[A-Za-z0-9_-]{43}$/i;
  const en = (document.documentElement.lang || '').startsWith('en');
  const android = /Android/i.test(navigator.userAgent);
  const base = location.hostname === 'benjahlan.github.io' ? 'https://benjahlan.github.io/yumyum/' : location.origin + '/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const T = en ? {
    brand: 'YumYum', home: '/yumyum/en/', forYou: 'For you', following: 'Following', lang: 'العربية', langHref: '/yumyum/watch/', langCode: 'ar',
    feed: 'Food videos', loading: 'Plating up…', errTitle: 'Videos could not load', errText: 'Check your connection and try again.',
    limit: 'Public browsing is busy right now. Please try again in a little while.', retry: 'Try again',
    emptyTitle: 'No public videos yet', emptyText: 'Cooks are plating their first dishes. New posts appear in the YumYum app, and only the ones their cooks share with guests show here.',
    endTitle: 'That was the last dish', endText: 'More recipes and cooks are waiting in the YumYum app.',
    join: 'Join the Android test', backHome: 'Home', open: 'Open in YumYum', watchMore: 'Watch more',
    like: 'Like', comments: 'Comments', save: 'Save', share: 'Share', follow: n => 'Follow ' + n, plate: 'Sound and original dish',
    tapUnmute: 'Tap to unmute', mute: 'Mute', unmute: 'Unmute', soundOff: 'Sound unavailable', original: 'Original sound', soundBy: n => 'Sound: ' + n,
    play: 'Play', pause: 'Pause', prev: 'Previous video', next: 'Next video', copied: 'Link copied', copyFail: 'Copy the link from the address bar',
    sheetTitle: 'Keep going in YumYum', close: 'Close', notNow: 'Not now',
    ctx: {like: 'Like this dish from the app.', comment: 'Read the comments and add yours in the app.', follow: 'Follow cooks to see their new dishes first.',
      save: 'Save recipes for when you are ready to cook.', following: 'Sign in to the app to see the cooks you follow.', plate: 'Sounds and cooking along on the same plate live in the app.',
      tag: t => 'Explore ' + t + ' and every dish with it in the app.', post: 'Open this post in the app.', invite: 'Watch, like, comment and cook along in the app.'},
    noteAndroid: 'YumYum is an Android app in testing. If it does not open, join the test.', noteOther: 'YumYum is an Android app. Open this page on your Android phone, or join the test.',
    kinds: {offer: 'Pickup offer', story: 'Story', review: 'Review', recipe: 'Recipe'}, gone: 'This post is no longer open to guests.',
    memberOnly: 'Sign in in the app to see this post.', views: 'views', post: (t, n) => t + ', by ' + n, cook: 'Cook', skip: 'Skip to videos', locale: 'en'
  } : {
    brand: 'يم يم', home: '/yumyum/', forYou: 'لك', following: 'أتابعهم', lang: 'English', langHref: '/yumyum/en/watch/', langCode: 'en',
    feed: 'فيديوهات الطعام', loading: 'نجهّز الأطباق…', errTitle: 'تعذّر تحميل الفيديوهات', errText: 'تحقّق من اتصالك ثم حاول مرة أخرى.',
    limit: 'التصفح العام مزدحم الآن. حاول مرة أخرى بعد قليل.', retry: 'إعادة المحاولة',
    emptyTitle: 'لا توجد فيديوهات عامة بعد', emptyText: 'الطهاة يجهّزون أطباقهم الأولى. تُنشر الأطباق الجديدة في تطبيق يم يم، ولا يظهر هنا إلا ما يتيحه أصحابه للضيوف.',
    endTitle: 'وصلت إلى آخر طبق', endText: 'المزيد من الوصفات والطهاة بانتظارك في تطبيق يم يم.',
    join: 'انضم لاختبار أندرويد', backHome: 'الرئيسية', open: 'فتح في يم يم', watchMore: 'شاهد المزيد',
    like: 'إعجاب', comments: 'التعليقات', save: 'حفظ', share: 'مشاركة', follow: n => 'متابعة ' + n, plate: 'الصوت والطبق الأصلي',
    tapUnmute: 'اضغط لتشغيل الصوت', mute: 'كتم الصوت', unmute: 'تشغيل الصوت', soundOff: 'الصوت غير متاح', original: 'الصوت الأصلي', soundBy: n => 'الصوت: ' + n,
    play: 'تشغيل', pause: 'إيقاف مؤقت', prev: 'الفيديو السابق', next: 'الفيديو التالي', copied: 'تم نسخ الرابط', copyFail: 'انسخ الرابط من شريط العنوان',
    sheetTitle: 'كمّل في تطبيق يم يم', close: 'إغلاق', notNow: 'ليس الآن',
    ctx: {like: 'سجّل إعجابك بهذا الطبق من داخل التطبيق.', comment: 'اقرأ التعليقات وشارك رأيك من داخل التطبيق.', follow: 'تابع الطهاة لتصلك أطباقهم الجديدة أولًا.',
      save: 'احفظ الوصفات لترجع إليها وقت الطبخ.', following: 'سجّل الدخول في التطبيق لترى أطباق الطهاة الذين تتابعهم.', plate: 'الأصوات والطبخ على الطبق نفسه متاحة في التطبيق.',
      tag: t => 'استكشف ' + t + ' وكل أطباقه في التطبيق.', post: 'افتح هذا المنشور في التطبيق.', invite: 'شاهد وأعجب وعلّق واطبخ معنا في التطبيق.'},
    noteAndroid: 'يم يم تطبيق أندرويد قيد الاختبار. إن لم يفتح، انضم للاختبار.', noteOther: 'يم يم تطبيق أندرويد. افتح هذه الصفحة على هاتفك، أو انضم للاختبار.',
    kinds: {offer: 'عرض استلام', story: 'قصة', review: 'تقييم', recipe: 'وصفة'}, gone: 'هذا المنشور لم يعد متاحًا للضيوف.',
    memberOnly: 'سجّل الدخول في التطبيق لرؤية هذا المنشور.', views: 'مشاهدة', post: (t, n) => t + '، من ' + n, cook: 'طاهٍ', skip: 'انتقل إلى الفيديوهات', locale: 'ar'
  };

  // ---------- small helpers ----------
  const el = (tag, cls, attrs) => { const n = document.createElement(tag); if (cls) n.className = cls; if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const ICON = {
    heart: '<path fill="currentColor" d="M12 20.6s-7.6-4.6-9.7-9.2C.8 8 2.9 3.9 6.9 3.9c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 4 0 6.1 4.1 4.6 7.5-2.1 4.6-9.7 9.2-9.7 9.2z"/>',
    comment: '<path fill="currentColor" d="M4.5 4h15A2.5 2.5 0 0 1 22 6.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4h-.5A2.5 2.5 0 0 1 2 15.5v-9A2.5 2.5 0 0 1 4.5 4z"/><circle cx="8" cy="11" r="1.4" fill="#000" opacity=".55"/><circle cx="12" cy="11" r="1.4" fill="#000" opacity=".55"/><circle cx="16" cy="11" r="1.4" fill="#000" opacity=".55"/>',
    save: '<path fill="currentColor" d="M6.5 2.5h11A1.5 1.5 0 0 1 19 4v17.2l-7-4.6-7 4.6V4a1.5 1.5 0 0 1 1.5-1.5z"/>',
    share: '<path fill="currentColor" d="M13.5 4.2 22 11.6l-8.5 7.4v-4.3c-5.4 0-9 1.5-11.5 5.3.9-5.8 4.1-10.6 11.5-11.6z"/>',
    up: '<path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    vol: '<path fill="currentColor" d="M3.5 9h4l5-4.2v14.4l-5-4.2h-4z"/><path d="M16 8.8a4.5 4.5 0 0 1 0 6.4M18.6 6.2a8.2 8.2 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    mute: '<path fill="currentColor" d="M3.5 9h4l5-4.2v14.4l-5-4.2h-4z"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    play: '<path fill="currentColor" d="M8 4.8v14.4L19.5 12z"/>',
    pause: '<path fill="currentColor" d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/>',
    plus: '<path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    close: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
  };
  const icon = (name, size = 24) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false'); s.innerHTML = ICON[name]; return s; };
  // YumYum's plate: rim, rice, herbs and a tomato slice. It turns while a video plays.
  const plate = (size) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 48 48'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    s.innerHTML = '<circle cx="24" cy="24" r="23" fill="#f4eee2"/><circle cx="24" cy="24" r="23" fill="none" stroke="#2a211c" stroke-width="1.5"/><circle cx="24" cy="24" r="16.5" fill="#fbf7ef" stroke="#e2d8c6" stroke-width="1.2"/>' +
      '<ellipse cx="22" cy="26" rx="10" ry="7.5" fill="#ffcb78"/><circle cx="18" cy="24" r="1.3" fill="#f2b552"/><circle cx="24" cy="29" r="1.2" fill="#f2b552"/><circle cx="26.5" cy="23" r="1.2" fill="#f2b552"/>' +
      '<circle cx="29" cy="19" r="5" fill="#bb4127"/><circle cx="29" cy="19" r="3.3" fill="none" stroke="#e7826b" stroke-width="1"/><path d="M14 18c2-3 5-3.5 7-2-2 2.5-4.6 3-7 2z" fill="#91ad73"/><path d="M27 30c2.4-1 4.6-.2 5.6 1.8-2.4 1-4.4.4-5.6-1.8z" fill="#6f8f53"/>'; return s; };
  const fmt = n => { try { return new Intl.NumberFormat(T.locale, {notation: 'compact', maximumFractionDigits: 1}).format(n); } catch { return String(n); } };
  const count = v => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
  const openHref = id => (UUID.test(id || '') ? (android ? 'intent://post/' + id + '#Intent;scheme=yumyum;package=' + PKG + ';S.browser_fallback_url=' + encodeURIComponent(base) + ';end' : 'yumyum://post/' + id) : null);
  const mediaSrc = p => (p && typeof p.media_url === 'string' && MEDIA.test(p.media_url) ? API + p.media_url + '&apikey=' + encodeURIComponent(KEY) : null);

  async function api(path) {
    const r = await fetch(API + path, {headers: {apikey: KEY}, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'});
    let body = null; try { body = await r.json(); } catch { /* not JSON */ }
    if (!r.ok) { const e = new Error((body && body.error) || 'HTTP ' + r.status); e.status = r.status; throw e; }
    return body || {};
  }

  // ---------- live region + app sheet ----------
  let toastBox, sheet, sheetText, sheetOpen, lastFocus = null, current = null;
  function toast(msg) { toastBox.textContent = ''; const t = el('div', 'yy-toast'); t.textContent = msg; toastBox.appendChild(t); setTimeout(() => t.remove(), 2600); }
  function buildChrome(root) {
    toastBox = el('div', 'yy-toasts', {'aria-live': 'polite', role: 'status'}); root.appendChild(toastBox);
    sheet = el('div', 'yy-backdrop'); sheet.hidden = true;
    const box = el('section', 'yy-sheet', {role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'yy-sheet-title', 'aria-describedby': 'yy-sheet-text'});
    const grip = el('span', 'yy-grip'); const x = el('button', 'yy-sheet-x', {type: 'button', 'aria-label': T.close}); x.appendChild(icon('close', 22));
    const art = el('div', 'yy-sheet-art'); art.appendChild(plate(72));
    const h = el('h2', 'yy-sheet-title', {id: 'yy-sheet-title'}); h.textContent = T.sheetTitle;
    sheetText = el('p', 'yy-sheet-text', {id: 'yy-sheet-text'});
    sheetOpen = el('a', 'yy-btn yy-primary'); sheetOpen.textContent = T.open;
    const join = el('a', 'yy-btn yy-ghost', {href: MAIL}); join.textContent = T.join;
    const later = el('button', 'yy-link', {type: 'button'}); later.textContent = T.notNow;
    const note = el('p', 'yy-sheet-note'); note.textContent = android ? T.noteAndroid : T.noteOther;
    box.append(grip, x, art, h, sheetText, sheetOpen, join, note, later); sheet.appendChild(box); root.appendChild(sheet);
    const close = () => closeSheet();
    x.addEventListener('click', close); later.addEventListener('click', close);
    sheet.addEventListener('click', e => { if (e.target === sheet) close(); });
    sheet.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = [...box.querySelectorAll('a[href],button')].filter(n => !n.hidden && n.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  function openSheet(ctx, post, extra) {
    const t = T.ctx[ctx]; sheetText.textContent = typeof t === 'function' ? t(extra) : (t || T.ctx.invite);
    const href = openHref(post && post.id) || (current && openHref(current.id));
    if (href && android) { sheetOpen.href = href; sheetOpen.hidden = false; } else { sheetOpen.removeAttribute('href'); sheetOpen.hidden = true; }
    lastFocus = document.activeElement; sheet.hidden = false; document.body.classList.add('yy-sheet-on');
    requestAnimationFrame(() => { sheet.classList.add('yy-show'); (sheet.querySelector('.yy-primary:not([hidden])') || sheet.querySelector('.yy-ghost')).focus(); });
  }
  function closeSheet() {
    if (sheet.hidden) return; sheet.classList.remove('yy-show'); document.body.classList.remove('yy-sheet-on');
    setTimeout(() => { sheet.hidden = true; }, reduce.matches ? 0 : 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll: true});
  }
  const sheetIsOpen = () => sheet && !sheet.hidden;

  async function sharePost(p) {
    const url = SHARE + p.id;
    if (navigator.share) { try { await navigator.share({title: p.title || T.brand, url}); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(url); toast(T.copied); } catch { toast(T.copyFail); }
  }

  // ---------- player state ----------
  let muted = true, unmuteHinted = false, slides = [], posts = [], active = -1, feedBox, io, rafId = 0;
  const player = {more: null};

  function caption(p) {
    const box = el('p', 'yy-caption', {dir: 'auto'}); const text = String(p.description || '').slice(0, 600);
    const parts = text.split(/(#[\p{L}\p{N}_]+)/u); let tagged = false;
    for (const part of parts) {
      if (!part) continue;
      if (/^#[\p{L}\p{N}_]+$/u.test(part)) { tagged = true; const b = el('button', 'yy-tag', {type: 'button', dir: 'auto'}); b.textContent = part; b.addEventListener('click', e => { e.stopPropagation(); openSheet('tag', p, part); }); box.appendChild(b); }
      else box.appendChild(document.createTextNode(part));
    }
    if (!tagged && Array.isArray(p.hashtags)) for (const tag of p.hashtags.slice(0, 6)) {
      if (typeof tag !== 'string' || !tag) continue; const t = '#' + tag; const b = el('button', 'yy-tag', {type: 'button', dir: 'auto'}); b.textContent = t;
      b.addEventListener('click', e => { e.stopPropagation(); openSheet('tag', p, t); }); box.append(' ', b);
    }
    return box;
  }

  function railButton(cls, name, label, n, onClick) {
    const b = el('button', 'yy-rail-btn ' + cls, {type: 'button', 'aria-label': n === null ? label : label + ' (' + fmt(n) + ')'});
    const disc = el('span', 'yy-disc'); disc.appendChild(icon(name, 30)); const c = el('span', 'yy-count'); c.textContent = n === null ? label : fmt(n);
    b.append(disc, c); b.addEventListener('click', e => { e.stopPropagation(); onClick(); }); return b;
  }

  function buildSlide(p, i) {
    const name = String(p.name || p.username || T.cook).slice(0, 60), handle = p.username ? '@' + String(p.username).slice(0, 40) : name;
    const title = String(p.title || '').slice(0, 140);
    const art = el('article', 'yy-slide', {'aria-label': title ? T.post(title, name) : name, 'aria-posinset': i + 1, 'data-index': i, tabindex: '-1'});
    const stage = el('div', 'yy-stage'); const isVideo = p.mime === 'video/mp4';
    const media = isVideo ? el('video', 'yy-media', {playsinline: '', 'webkit-playsinline': '', loop: '', preload: 'none', disablepictureinpicture: '', 'aria-hidden': 'true'}) : el('img', 'yy-media yy-photo', {alt: title || name, decoding: 'async', loading: i < 2 ? 'eager' : 'lazy', draggable: 'false'});
    if (isVideo) media.muted = true;
    const spin = el('div', 'yy-loading'); spin.appendChild(plate(56));
    const tap = el('button', 'yy-tap', {type: 'button', 'aria-label': isVideo ? T.pause : (title || name)});
    const flash = el('div', 'yy-flash', {'aria-hidden': 'true'});
    const hint = el('button', 'yy-hint', {type: 'button'}); hint.append(icon('mute', 18), document.createTextNode(T.tapUnmute)); hint.hidden = true;
    const vol = el('button', 'yy-vol', {type: 'button', 'aria-label': T.unmute}); vol.appendChild(icon('mute', 22)); if (!isVideo) vol.hidden = true;
    const meta = el('div', 'yy-meta'); const who = el('button', 'yy-handle', {type: 'button', dir: 'auto'}); who.textContent = handle; who.addEventListener('click', e => { e.stopPropagation(); openSheet('follow', p); });
    const row = el('div', 'yy-row'); row.appendChild(who); if (T.kinds[p.kind]) { const k = el('span', 'yy-kind'); k.textContent = T.kinds[p.kind]; row.appendChild(k); }
    meta.appendChild(row);
    if (title) { const h = el('h2', 'yy-title', {dir: 'auto'}); h.textContent = title; meta.appendChild(h); }
    meta.appendChild(caption(p));
    const snd = el('p', 'yy-sound'); const sp = el('span', 'yy-sound-plate'); sp.appendChild(plate(16)); snd.appendChild(sp);
    const st = el('span'); st.textContent = p.sound_muted ? T.soundOff : (p.sound && !p.sound.unavailable && (p.sound.handle || p.sound.name)) ? T.soundBy(String(p.sound.handle ? '@' + p.sound.handle : p.sound.name).slice(0, 60)) : T.original + ' · ' + name;
    st.setAttribute('dir', 'auto'); snd.appendChild(st); if (isVideo) meta.appendChild(snd);
    const bar = el('div', 'yy-progress', {'aria-hidden': 'true'}); const fill = el('span'); bar.appendChild(fill); if (!isVideo) bar.hidden = true;
    stage.append(media, spin, tap, flash, hint, vol, meta, bar);

    const rail = el('div', 'yy-rail');
    const av = el('button', 'yy-avatar', {type: 'button', 'aria-label': T.follow(name)});
    const face = el('span', 'yy-face'); face.textContent = [...name.trim()][0] || 'Y'; const plus = el('span', 'yy-plus'); plus.appendChild(icon('plus', 14));
    av.append(face, plus); av.addEventListener('click', e => { e.stopPropagation(); openSheet('follow', p); });
    const like = railButton('yy-like', 'heart', T.like, count(p.likes ?? p.like_count), () => openSheet('like', p));
    const com = railButton('yy-com', 'comment', T.comments, count(p.comment_count), () => openSheet('comment', p));
    const sav = railButton('yy-sav', 'save', T.save, count(p.save_count), () => openSheet('save', p));
    const shr = railButton('yy-shr', 'share', T.share, null, () => sharePost(p));
    const disc = el('button', 'yy-plate', {type: 'button', 'aria-label': T.plate}); disc.appendChild(plate(46)); disc.addEventListener('click', e => { e.stopPropagation(); openSheet('plate', p); });
    rail.append(av, like, com, sav, shr); if (isVideo) rail.appendChild(disc);
    art.append(stage, rail);

    const s = {p, art, stage, media, tap, flash, hint, vol, fill, disc, isVideo, loaded: false, retried: false, userPaused: false, lastTap: 0, tapTimer: 0};
    const ready = () => { s.loaded = true; spin.hidden = true; fit(s); };
    if (isVideo) {
      media.addEventListener('loadeddata', ready); media.addEventListener('playing', () => { spin.hidden = true; art.classList.add('yy-playing'); art.classList.remove('yy-blocked'); if (slides[active] === s && !rafId) rafId = requestAnimationFrame(tick); });
      media.addEventListener('pause', () => art.classList.remove('yy-playing')); media.addEventListener('waiting', () => { if (s.loaded) spin.hidden = false; });
      media.addEventListener('canplay', () => { spin.hidden = true; });
      media.addEventListener('error', () => { if (media.getAttribute('src')) recover(s); });
    } else { media.addEventListener('load', ready); media.addEventListener('error', () => recover(s)); }

    tap.addEventListener('pointerup', e => onTap(s, e));
    tap.addEventListener('click', e => { if (e.detail === 0) single(s); }); // keyboard activation
    hint.addEventListener('click', e => { e.stopPropagation(); setMuted(false); });
    vol.addEventListener('click', e => { e.stopPropagation(); if (!s.p.sound_muted) setMuted(!muted); });
    syncVol(s);
    return s;
  }

  function fit(s) { // fill the frame when the media is already tall; otherwise show it whole
    const w = s.isVideo ? s.media.videoWidth : s.media.naturalWidth, h = s.isVideo ? s.media.videoHeight : s.media.naturalHeight;
    const r = s.stage.getBoundingClientRect(); if (!w || !h || !r.width) return;
    s.media.classList.toggle('yy-cover', Math.abs(w / h - r.width / r.height) < 0.18);
  }

  function attach(s, preload) {
    const src = mediaSrc(s.p); if (!src) { s.stage.classList.add('yy-broken'); return; }
    if (s.isVideo) { s.media.preload = preload; if (s.media.getAttribute('src') !== src) s.media.src = src; }
    else if (s.media.getAttribute('src') !== src) s.media.src = src;
  }
  function detach(s) { if (s.isVideo && s.media.getAttribute('src')) { s.media.pause(); s.media.removeAttribute('src'); s.media.load(); s.loaded = false; } }

  async function recover(s) { // links last 30 minutes; ask for a fresh one once
    if (s.retried || !s.p.id) { s.stage.classList.add('yy-broken'); return; }
    s.retried = true;
    try {
      const r = await api('feed?id=' + encodeURIComponent(s.p.id));
      if (r.post && mediaSrc(r.post)) { s.p = {...s.p, media_url: r.post.media_url, media_expires: r.post.media_expires}; attach(s, 'auto'); if (slides[active] === s) playActive(); return; }
    } catch { /* fall through */ }
    s.stage.classList.add('yy-broken'); const g = el('p', 'yy-gone'); g.textContent = T.gone; s.stage.appendChild(g);
  }

  function syncVol(s) {
    if (!s.isVideo) return; const silent = muted || !!s.p.sound_muted;
    s.media.muted = silent; s.vol.replaceChildren(icon(silent ? 'mute' : 'vol', 22));
    s.vol.setAttribute('aria-label', s.p.sound_muted ? T.soundOff : silent ? T.unmute : T.mute); s.vol.disabled = !!s.p.sound_muted;
    s.hint.hidden = !(muted && !unmuteHinted && !s.p.sound_muted && slides[active] === s);
  }
  function setMuted(v) { muted = v; if (!v) unmuteHinted = true; slides.forEach(syncVol); }

  function flashIcon(s, name) { s.flash.replaceChildren(icon(name, 64)); s.flash.classList.remove('yy-go'); void s.flash.offsetWidth; s.flash.classList.add('yy-go'); }
  function single(s) {
    if (!s.isVideo) return;
    if (s.art.classList.contains('yy-blocked')) { s.userPaused = false; setMuted(false); s.media.play().catch(() => {}); return; }
    if (muted && !unmuteHinted && !s.p.sound_muted) { setMuted(false); flashIcon(s, 'vol'); return; }
    if (s.media.paused) { s.userPaused = false; s.art.classList.remove('yy-held'); s.media.play().catch(() => {}); flashIcon(s, 'play'); s.tap.setAttribute('aria-label', T.pause); }
    else { s.userPaused = true; s.media.pause(); s.flash.classList.remove('yy-go'); s.flash.replaceChildren(icon('play', 64)); s.art.classList.add('yy-held'); s.tap.setAttribute('aria-label', T.play); }
  }
  function onTap(s, e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const now = performance.now();
    if (now - s.lastTap < 300) { clearTimeout(s.tapTimer); s.lastTap = 0; heart(s, e); return; }
    s.lastTap = now; clearTimeout(s.tapTimer); s.tapTimer = setTimeout(() => single(s), 260);
  }
  function heart(s, e) {
    const r = s.stage.getBoundingClientRect(); const h = el('span', 'yy-burst', {'aria-hidden': 'true'}); h.appendChild(icon('heart', 96));
    h.style.left = (e.clientX - r.left) + 'px'; h.style.top = (e.clientY - r.top) + 'px'; h.style.setProperty('--tilt', (Math.random() * 30 - 15).toFixed(0) + 'deg');
    s.stage.appendChild(h); setTimeout(() => h.remove(), 900);
    const lk = s.art.querySelector('.yy-like'); lk.classList.add('yy-liked');
    setTimeout(() => openSheet('like', s.p), reduce.matches ? 150 : 650);
  }

  function tick() {
    const s = slides[active];
    if (s && s.isVideo && s.media.duration) s.fill.style.transform = 'scaleX(' + Math.min(1, s.media.currentTime / s.media.duration) + ')';
    rafId = s && s.isVideo && !s.media.paused ? requestAnimationFrame(tick) : 0;
  }
  function blocked(s) { s.flash.classList.remove('yy-go'); s.flash.replaceChildren(icon('play', 64)); s.art.classList.add('yy-blocked'); s.tap.setAttribute('aria-label', T.play); }
  function playActive() {
    const s = slides[active]; if (!s || !s.isVideo || s.userPaused) return;
    syncVol(s);
    s.media.play().then(() => { if (!rafId) rafId = requestAnimationFrame(tick); }).catch(() => { // autoplay refused: try silent once
      if (!s.media.muted) { muted = true; slides.forEach(syncVol); s.media.play().catch(() => blocked(s)); } else blocked(s);
    });
  }
  function setActive(i) {
    if (i === active || !slides[i]) return; active = i; current = slides[i].p;
    slides.forEach((s, j) => {
      const d = j - i;
      if (d === 0 || d === 1) attach(s, 'auto'); else if (d === -1 || d === 2) attach(s, 'metadata'); else if (Math.abs(d) > 3) detach(s);
      if (d !== 0 && s.isVideo) { s.media.pause(); if (s.media.getAttribute('src')) try { s.media.currentTime = 0; } catch { /* not seekable yet */ } s.userPaused = false; s.art.classList.remove('yy-held'); s.fill.style.transform = 'scaleX(0)'; }
      s.art.classList.toggle('yy-active', d === 0); s.art.setAttribute('aria-current', d === 0 ? 'true' : 'false');
      syncVol(s);
    });
    playActive(); updateArrows();
    if (player.more && i >= slides.length - 3) player.more();
  }

  let arrows = null, visibleKid = null;
  function where() { const kids = [...feedBox.children]; const i = kids.indexOf(visibleKid); return {kids, i: i < 0 ? Math.round(feedBox.scrollTop / Math.max(1, feedBox.clientHeight)) : i}; }
  function updateArrows() { if (!arrows) return; const {kids, i} = where(); arrows.up.disabled = i <= 0; arrows.down.disabled = i >= kids.length - 1; }
  function go(delta) {
    const {kids, i: from} = where();
    const t = kids[Math.max(0, Math.min(kids.length - 1, from + delta))]; if (t) t.scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth', block: 'start'});
  }

  function appendPosts(list) {
    for (const p of list) {
      if (!p || !UUID.test(p.id || '') || !mediaSrc(p) || posts.some(q => q.id === p.id)) continue;
      const s = buildSlide(p, slides.length); posts.push(p); slides.push(s);
      const endCard = feedBox.querySelector('.yy-end'); feedBox.insertBefore(s.art, endCard); io.observe(s.art);
    }
    feedBox.setAttribute('aria-busy', 'false');
  }

  function card(cls, title, text, actions) {
    const c = el('section', 'yy-card ' + cls); const art = el('div', 'yy-card-art'); art.appendChild(plate(132));
    const h = el('h2', 'yy-card-title'); h.textContent = title; const t = el('p', 'yy-card-text'); t.textContent = text; c.append(art, h, t);
    const row = el('div', 'yy-card-actions'); for (const a of actions) row.appendChild(a); c.appendChild(row); return c;
  }
  const linkBtn = (cls, text, href) => { const a = el('a', 'yy-btn ' + cls, {href}); a.textContent = text; return a; };

  function observe(root) {
    io = new IntersectionObserver(entries => {
      for (const x of entries) {
        if (!x.isIntersecting || x.intersectionRatio < 0.6) continue;
        visibleKid = x.target; const i = Number(x.target.dataset.index);
        if (!Number.isNaN(i)) setActive(i);
        else { active = -2; slides.forEach(s => { if (s.isVideo) s.media.pause(); s.art.classList.remove('yy-active'); }); updateArrows(); }
      }
    }, {root, threshold: [0.6]});
  }

  function keyboard() {
    document.addEventListener('keydown', e => {
      if (sheetIsOpen() || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if ((e.key === ' ' || e.key === 'Spacebar') && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') { e.preventDefault(); const s = slides[active]; if (s) single(s); }
      else if (e.key === 'm' || e.key === 'M') { const s = slides[active]; if (s && !s.p.sound_muted) setMuted(!muted); }
    });
    document.addEventListener('visibilitychange', () => { const s = slides[active]; if (!s || !s.isVideo) return; if (document.hidden) s.media.pause(); else playActive(); });
    addEventListener('resize', () => slides.forEach(fit));
  }

  function topbar(root, shareMode) {
    const bar = el('header', 'yy-top');
    const brand = el('a', 'yy-brand', {href: T.home}); const bt = el('span', 'yy-brand-text'); bt.textContent = T.brand; brand.append(plate(26), bt); brand.setAttribute('aria-label', T.brand);
    bar.appendChild(brand);
    if (!shareMode) {
      const tabs = el('nav', 'yy-tabs', {'aria-label': T.feed});
      const fol = el('button', 'yy-tab', {type: 'button'}); fol.textContent = T.following; fol.addEventListener('click', () => openSheet('following'));
      const fy = el('a', 'yy-tab yy-tab-on', {href: '#', 'aria-current': 'page'}); fy.textContent = T.forYou; fy.addEventListener('click', e => { e.preventDefault(); const f = feedBox.firstElementChild; if (f) f.scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth'}); });
      tabs.append(fol, fy); bar.appendChild(tabs);
      const lang = el('a', 'yy-lang', {href: T.langHref, lang: T.langCode, hreflang: T.langCode}); lang.textContent = T.lang; bar.appendChild(lang);
    }
    root.appendChild(bar);
  }

  function makeFeed(root) {
    feedBox = el('main', 'yy-feed', {id: 'yy-feed', role: 'feed', 'aria-label': T.feed, 'aria-busy': 'true', tabindex: '-1'});
    root.appendChild(feedBox); observe(feedBox);
  }

  function arrowsUi(root) {
    const box = el('div', 'yy-arrows'); const up = el('button', 'yy-arrow', {type: 'button', 'aria-label': T.prev}); up.appendChild(icon('up', 26));
    const down = el('button', 'yy-arrow', {type: 'button', 'aria-label': T.next}); down.appendChild(icon('down', 26));
    up.addEventListener('click', () => go(-1)); down.addEventListener('click', () => go(1)); box.append(up, down); root.appendChild(box); arrows = {up, down}; updateArrows();
  }

  function status(kind, err) {
    feedBox.replaceChildren(); feedBox.setAttribute('aria-busy', 'false');
    if (kind === 'loading') { const l = el('div', 'yy-card yy-wait'); const a = el('div', 'yy-card-art yy-spin'); a.appendChild(plate(84)); const t = el('p', 'yy-card-text'); t.textContent = T.loading; l.append(a, t); feedBox.appendChild(l); feedBox.setAttribute('aria-busy', 'true'); return; }
    if (kind === 'error') { const b = el('button', 'yy-btn yy-primary', {type: 'button'}); b.textContent = T.retry; b.addEventListener('click', startFeed); feedBox.appendChild(card('yy-error', T.errTitle, err && err.status === 429 ? T.limit : T.errText, [b])); return; }
    if (kind === 'empty') feedBox.appendChild(card('yy-empty', T.emptyTitle, T.emptyText, [linkBtn('yy-primary', T.join, MAIL), linkBtn('yy-ghost', T.backHome, T.home)]));
  }

  // ---------- /watch/ ----------
  let cursor = null, loadingMore = false, hasMore = false;
  async function startFeed() {
    slides = []; posts = []; active = -1; visibleKid = null; status('loading');
    let r; try { r = await api('feed?limit=10'); } catch (e) { status('error', e); return; }
    const list = Array.isArray(r.posts) ? r.posts : [];
    feedBox.replaceChildren();
    if (!list.some(p => p && mediaSrc(p))) { status('empty'); return; }
    const end = card('yy-end', T.endTitle, T.endText, [linkBtn('yy-primary', T.join, MAIL), linkBtn('yy-ghost', T.backHome, T.home)]); end.tabIndex = -1;
    feedBox.appendChild(end); io.observe(end);
    hasMore = !!r.hasMore && typeof r.nextCursor === 'string' && UUID.test(r.nextId || ''); cursor = hasMore ? {before: r.nextCursor, beforeId: r.nextId} : null;
    appendPosts(list); updateArrows();
  }
  player.more = async () => {
    if (!hasMore || loadingMore || !cursor) return; loadingMore = true;
    try {
      const r = await api('feed?limit=10&before=' + encodeURIComponent(cursor.before) + '&beforeId=' + encodeURIComponent(cursor.beforeId));
      hasMore = !!r.hasMore && typeof r.nextCursor === 'string' && UUID.test(r.nextId || ''); cursor = hasMore ? {before: r.nextCursor, beforeId: r.nextId} : null;
      appendPosts(Array.isArray(r.posts) ? r.posts : []); updateArrows();
    } catch { /* keep what we have; the next scroll tries again */ } finally { loadingMore = false; }
  };

  function mountWatch() {
    const root = document.getElementById('yy-root'); if (!root) return;
    document.body.classList.add('yy-watch');
    const skip = el('a', 'yy-skip', {href: '#yy-feed'}); skip.textContent = T.skip; root.appendChild(skip);
    topbar(root, false); makeFeed(root); arrowsUi(root); buildChrome(root); keyboard(); startFeed();
  }

  // ---------- /share/?post= ----------
  // Resolves to true when the post is open to guests and the player took over the page.
  async function mountShare(id, openLink) {
    let r; try { r = await api('feed?id=' + encodeURIComponent(id)); } catch { return {shown: false, memberOnly: false}; }
    if (!r.post || r.member_only || !mediaSrc(r.post) || r.post.id !== id) return {shown: false, memberOnly: !!r.member_only || !r.post};
    const root = el('div', 'yy-share-layer'); document.body.appendChild(root); document.body.classList.add('yy-watch', 'yy-share');
    topbar(root, true); makeFeed(root); buildChrome(root); keyboard();
    hasMore = false; player.more = null; appendPosts([r.post]); feedBox.setAttribute('aria-label', T.feed);
    const cta = el('div', 'yy-cta'); const open = el('a', 'yy-btn yy-primary', {href: openLink}); open.textContent = T.open;
    const more = linkBtn('yy-ghost', T.watchMore, en ? '/yumyum/en/watch/' : '/yumyum/watch/'); cta.append(open, more); root.appendChild(cta);
    return {shown: true, memberOnly: false};
  }

  window.YYWatch = {mountShare, strings: T};
  if (document.body.dataset.mode === 'watch') mountWatch();
})();
