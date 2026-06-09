const DEFAULT = {
  enabled: true,
  mode: 'focus',
  toggles: {
    homeFeed: true,
    shorts: true,
    sidebar: true,
    comments: true,
    autoplay: true,
    counts: false,
    ads: true,
    notifications: true,
    leftNav: true,
    endCards: true,
    subscriberCount: false,
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('ytFocus', (d) => {
    if (!d.ytFocus) chrome.storage.sync.set({ ytFocus: DEFAULT });
  });
});

function broadcast(settings) {
  chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
    tabs.forEach(t =>
      chrome.tabs.sendMessage(t.id, { type: 'UPDATE', settings }).catch(() => {})
    );
  });
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('ytFocus', (d) => reply(d.ytFocus || DEFAULT));
    return true;
  }
  if (msg.type === 'SET_SETTINGS') {
    chrome.storage.sync.set({ ytFocus: msg.settings }, () => {
      broadcast(msg.settings);
      reply({ ok: true });
    });
    return true;
  }
});
