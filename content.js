(() => {
  const STYLE_ID = 'ytf-css';
  let settings = null;
  let observer = null;

  // ─── CSS-based hiding (fast, for structural elements) ───────────────────
  const CSS_RULES = {
    homeFeed: `
      ytd-browse[page-subtype="home"] ytd-rich-grid-renderer { display:none!important; }
      ytd-browse[page-subtype="home"] #primary::after {
        content: 'Home feed hidden — YT Focus';
        display:block; text-align:center; padding:80px 24px;
        font-size:15px; color:#555; font-family:-apple-system,sans-serif;
      }`,

    shorts: `
      ytd-reel-shelf-renderer { display:none!important; }
      ytd-rich-shelf-renderer[is-shorts] { display:none!important; }
      ytd-rich-section-renderer:has(ytd-reel-shelf-renderer) { display:none!important; }
      ytd-guide-entry-renderer:has(a[title="Shorts"]) { display:none!important; }
      ytd-mini-guide-entry-renderer[aria-label="Shorts"] { display:none!important; }
      ytd-browse[page-subtype="shorts"] { display:none!important; }`,

    sidebar: `
      #secondary.ytd-watch-flexy { display:none!important; }
      ytd-watch-next-secondary-results-renderer { display:none!important; }
      ytd-watch-flexy #primary.ytd-watch-flexy { max-width:100%!important; margin:0 auto!important; }`,

    comments: `
      ytd-comments#comments { display:none!important; }
      #comments.ytd-watch-flexy { display:none!important; }`,

    autoplay: `
      ytd-compact-autoplay-renderer { display:none!important; }
      .ytp-autonav-toggle-button-container { display:none!important; }
      .ytp-autonav-endscreen-upnext-container { display:none!important; }`,

    ads: `
      #masthead-ad { display:none!important; }
      ytd-ad-slot-renderer { display:none!important; }
      ytd-display-ad-renderer { display:none!important; }
      ytd-promoted-sparkles-web-renderer { display:none!important; }
      ytd-promoted-video-renderer { display:none!important; }
      ytd-in-feed-ad-layout-renderer { display:none!important; }
      ytd-statement-banner-renderer { display:none!important; }
      ytd-banner-promo-renderer { display:none!important; }
      .ytp-ad-overlay-container { display:none!important; }
      .ytp-ad-text-overlay { display:none!important; }
      .ytp-ad-image-overlay { display:none!important; }
      .video-ads.ytp-ad-module { display:none!important; }`,

    notifications: `
      #notification-button { display:none!important; }
      ytd-notification-topbar-button-renderer { display:none!important; }`,

    leftNav: `
      ytd-guide-renderer { display:none!important; }
      ytd-mini-guide-renderer { display:none!important; }
      app-drawer#guide { display:none!important; }
      #guide.ytd-app { display:none!important; }
      #page-manager.ytd-app { margin-left:0!important; }`,

    endCards: `
      .ytp-ce-element { display:none!important; }
      .ytp-endscreen-element { display:none!important; }
      .ytp-endscreen-content { display:none!important; }`,
  };

  // ─── DOM-based hiding (for elements that render late / in shadow DOM) ───
  // Each entry: { selector, hide: fn(el) → bool }
  const DOM_RULES = {
    counts: [
      // View count — the renderer element itself
      { sel: 'ytd-video-view-count-renderer' },
      // View count text nodes inside info bar
      { sel: '#info-container .ytd-video-view-count-renderer' },
      // Like count — YouTube 2024 structure uses these view-model custom elements
      { sel: 'like-button-view-model' },
      { sel: 'dislike-button-view-model' },
      { sel: 'segmented-like-dislike-button-view-model' },
      // Older structure
      { sel: '#top-level-buttons-computed ytd-toggle-button-renderer' },
      // Like/dislike text spans inside buttons
      { sel: 'ytd-watch-metadata #actions .yt-spec-button-shape-next__button-text-content' },
    ],
    subscriberCount: [
      { sel: '#owner-sub-count' },
      { sel: '#subscriber-count' },
      { sel: 'yt-formatted-string#owner-sub-count' },
      // New channel page structure
      { sel: 'ytd-subscribe-button-renderer #subscriber-count' },
      { sel: '#channel-header-container #subscriber-count' },
      { sel: 'ytd-channel-renderer #subscribers' },
      // Inside watch page owner section
      { sel: 'ytd-video-owner-renderer yt-formatted-string[id="owner-sub-count"]' },
      { sel: '#upload-info #owner-sub-count' },
    ],
  };

  // ─── Apply CSS rules ─────────────────────────────────────────────────────
  function applyCSS(s) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (!s || !s.enabled) { el.textContent = ''; return; }
    el.textContent = Object.entries(CSS_RULES)
      .filter(([k]) => s.toggles[k])
      .map(([, css]) => css)
      .join('\n');
  }

  // ─── Apply DOM rules (hide elements directly) ────────────────────────────
  function applyDOM(s) {
    if (!s || !s.enabled) {
      // Restore all previously hidden elements
      document.querySelectorAll('[data-ytf-hidden]').forEach(el => {
        el.style.removeProperty('display');
        el.removeAttribute('data-ytf-hidden');
      });
      return;
    }

    Object.entries(DOM_RULES).forEach(([key, rules]) => {
      if (!s.toggles[key]) {
        // Un-hide if toggle turned off
        document.querySelectorAll(`[data-ytf-hidden="${key}"]`).forEach(el => {
          el.style.removeProperty('display');
          el.removeAttribute('data-ytf-hidden');
        });
        return;
      }
      rules.forEach(({ sel }) => {
        document.querySelectorAll(sel).forEach(el => {
          if (!el.getAttribute('data-ytf-hidden')) {
            el.style.setProperty('display', 'none', 'important');
            el.setAttribute('data-ytf-hidden', key);
          }
        });
      });
    });
  }

  // ─── Main apply ──────────────────────────────────────────────────────────
  function apply(s) {
    settings = s;
    applyCSS(s);
    applyDOM(s);
  }

  // ─── MutationObserver: re-run DOM rules whenever YouTube mutates ─────────
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (settings) applyDOM(settings);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ─── Boot ────────────────────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (s) => {
    apply(s);
    startObserver();
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'UPDATE') apply(msg.settings);
  });

  // Re-apply on YouTube SPA navigation
  window.addEventListener('yt-navigate-finish', () => {
    if (settings) {
      setTimeout(() => apply(settings), 300); // small delay for DOM settle
    }
  });
})();
