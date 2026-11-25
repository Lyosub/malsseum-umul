// 말씀우물 디자인 시스템 보조(2026-11-25): ① 아이콘 칸 안의 이모지를 선 아이콘 한 벌로 바꾼다 ② 화면 아래 카드가 스크롤할 때 살짝 올라오며 나타난다.
// 글 속의 이모지는 건드리지 않고, 아이콘 칸(.v2-tile .i, .hv-guide-ico, .ico-circle)에 이모지 하나만 있을 때만 바꾼다.
(function () {
  var P = {
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    pen: '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    dict: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/><path d="M9 8h7M9 12h5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.4 1.6 1.3 2.8 2.5 2.8z"/>',
    drop: '<path d="M12 2.7S5.5 9.3 5.5 14a6.5 6.5 0 0 0 13 0C18.5 9.3 12 2.7 12 2.7z"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    pray: '<path d="M12 21V11"/><path d="M8 21l-1.5-6.5a2 2 0 0 1 .5-1.8L12 7l5 5.7a2 2 0 0 1 .5 1.8L16 21"/><path d="M12 7V3"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4"/>',
    game: '<rect x="2" y="7" width="20" height="12" rx="4"/><path d="M6 13h4M8 11v4M15 12h.01M18 14h.01"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>'
  };
  var MAP = {
    '📖': 'book', '📚': 'book', '✍️': 'pen', '✍': 'pen', '📝': 'pen', '🤝': 'users', '👥': 'users', '📘': 'dict', '📗': 'dict',
    '🎁': 'gift', '🕯️': 'flame', '🕯': 'flame', '🔥': 'flame', '💧': 'drop', '✨': 'spark', '❤️': 'heart', '💛': 'heart', '🙏': 'pray',
    '📅': 'cal', '🗓️': 'cal', '💬': 'chat', '🎵': 'music', '🎶': 'music', '⭐': 'star', '🌟': 'star', '🃏': 'card', '🎮': 'game', '💡': 'bulb', '🧠': 'bulb'
  };
  function icon(name) { return '<svg class="ds-ico" viewBox="0 0 24 24" aria-hidden="true">' + P[name] + '</svg>'; }
  function swap(root) {
    (root || document).querySelectorAll('.v2-tile .i, .hv-guide-ico, .ico-circle').forEach(function (el) {
      if (el.querySelector('svg, img')) return;
      var t = (el.textContent || '').trim(), k = MAP[t];
      if (k) { el.innerHTML = icon(k); el.style.fontSize = ''; }
    });
  }
  function rise() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var vh = innerHeight, io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ds-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.wrap .card, .wrap .v2-tile, .wrap .home-row, .wrap .pc, .wrap section > .sect-hd').forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) return;   // 처음 보이는 것은 그대로(깜빡임 없게)
      el.classList.add('ds-rise'); io.observe(el);
    });
  }
  function go() { swap(); rise(); try { new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) swap(n.parentNode || n); }); }); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
