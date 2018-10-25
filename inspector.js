const ENTRY_INFO = [
  // Search, BookSearch, VideoSearch
  {
    target:       'div#rso > div > div.srg > div.g',
    targetDepth:  0,
    pageLink:     '> div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div.rc > div.r',
    actionTag:    'span',
    actionClass:  'ubDefaultAction'
  },
  // Search.FeaturedSnippet
  {
    target:       'div#rso > div > div.g.mnr-c.g-blk',
    targetDepth:  0,
    pageLink:     '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r',
    actionTag:    'span',
    actionClass:  'ubDefaultAction'
  },
  // Search.WebResult
  {
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div.rc > div.r',
    actionTag:    'span',
    actionClass:  'ubDefaultAction'
  },
  // Search.WebResultWithSiteLinks
  {
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div > div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div > div.rc > div.r',
    actionTag:    'span',
    actionClass:  'ubDefaultAction'
  },
  // Search.Image
  {
    target:       'div#iur > div.kno-ibrg > div > div.img-brk > div.birrg > div.rg_el.ivg-i > div.rg_meta.notranslate',
    targetDepth:  1,
    pageLink:     '> div.rg_meta.notranslate',
    pageLinkType: 'image',
    actionParent: '',
    actionTag:    'div',
    actionClass:  'ubImageAction'
  },
  // Search.Latest
  {
    target:       'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionTag:    'div',
    actionClass:  'ubNewsAction'
  },
  // Search.TopStory
  {
    target:       'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
    targetDepth:  2,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionTag:    'div',
    actionClass:  'ubNewsAction'
  },
  // Search.TopStory.Hidden
  {
    target:       'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionTag:    'div',
    actionClass:  'ubNewsAction'
  },
  // Search.TopStory.List
  {
    target:       'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
    targetDepth:  0,
    pageLink:     '> div.dbsr.kno-fb-ctx > g-card-section > a',
    pageLinkType: 'default',
    actionParent: '> div.dbsr.kno-fb-ctx > g-card-section > div',
    actionTag:    'span',
    actionClass:  'ubDefaultAction'
  },
  // Search.Video
  {
    target:       'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > div > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionTag:    'div',
    actionClass:  'ubVideoAction'
  },
  // ImageSearch
  {
    target:       'div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i',
    targetDepth:  0,
    pageLink:     '> div.rg_meta.notranslate',
    pageLinkType: 'image',
    actionParent: '',
    actionTag:    'div',
    actionClass:  'ubImageSearchAction'
  },
  // NewsSearch
  {
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div.ts > div > h3.r > a',
    pageLinkType: 'default',
    actionParent: '> div.ts > div > div.slp',
    actionTag:    'span',
    actionClass:  'ubNewsSearchAction'
  },
];

const inspectEntry = elem => {
  for (const info of ENTRY_INFO) {
    if (elem.matches(info.target)) {
      let base = elem;
      for (let i = 0; i < info.targetDepth; ++i) {
        base = base.parentNode;
      }

      const pageLink = base.querySelector(':scope ' + info.pageLink);
      if (!pageLink) { continue; }
      let pageUrl;
      if (info.pageLinkType == 'image') {
        const m = /"ru":"([^"]+)"/.exec(pageLink.textContent);
        if (!m) { continue; }
        pageUrl = m[1];
      } else {
        pageUrl = pageLink.href;
      }

      let actionParent;
      if (info.actionParent) {
        actionParent = base.querySelector(':scope ' + info.actionParent);
      } else {
        actionParent = base;
      }
      if (!actionParent) { continue; }

      const actionTag = info.actionTag;
      const actionClass = info.actionClass;

      return { base, pageUrl, actionParent, actionTag, actionClass };
    }
  }
  return null;
};
