const ENTRY_INFO = [
  {
    id:           'Search.Default',
    target:       'div#rso > div > div.srg > div.g',
    targetDepth:  0,
    pageLink:     '> div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div.rc > div.r',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.FeaturedSnippet',
    target:       'div#rso > div > div.g.mnr-c.g-blk > div.kp-blk > div.xpdopen > div > div > div.g',
    targetDepth:  5,
    pageLink:     '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.WebResult',
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div.rc > div.r',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.WebResultWithSiteLinks',
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div > div > div.rc > div.r > a',
    pageLinkType: 'default',
    actionParent: '> div > div > div.rc > div.r',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.Image',
    target:       'div#iur > div.kno-ibrg > div > div.img-brk > div.birrg > div.rg_el.ivg-i > div.rg_meta.notranslate',
    targetDepth:  1,
    pageLink:     '> div.rg_meta.notranslate',
    pageLinkType: 'image',
    actionParent: '',
    actionClass:  'ubImageAction',
    display:      'image'
  },
  {
    id:           'Search.Latest',
    target:       'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionClass:  'ubNewsAction',
    display:      'default'
  },
  {
    id:           'Search.TopStory_Horizontal',
    target:       'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
    targetDepth:  2,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionClass:  'ubNewsAction',
    display:      'default'
  },
  {
    id:           'Search.TopStory_Horizontal.Hidden',
    target:       'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionClass:  'ubNewsAction',
    display:      'default'
  },
  {
    id:           'Search.TopStory_Vertical_V2',
    target:       'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
    targetDepth:  0,
    pageLink:     '> div.dbsr.kno-fb-ctx > g-card-section > a',
    pageLinkType: 'default',
    actionParent: '> div.dbsr.kno-fb-ctx > g-card-section > div',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.TopStory_Vertical',
    target:       'div#rso > div > div > g-section-with-header > div > div > div > div > div > div > lazy-load-item > div.dbsr',
    targetDepth:  4,
    pageLink:     '> div > div > lazy-load-item > div.dbsr > a',
    pageLinkType: 'default',
    actionParent: '> div > div > lazy-load-item > div.dbsr > a > div > div:last-child > div:nth-child(2)',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.TopStory_Vertical_NoImage',
    target:       'div#rso > div > div > g-section-with-header > div > div > div > div > div > div.dbsr > a > div > div > div:nth-child(2)',
    targetDepth:  6,
    pageLink:     '> div > div.dbsr > a',
    pageLinkType: 'default',
    actionParent: '> div > div.dbsr > a > div > div > div:nth-child(2)',
    actionClass:  'ubDefaultAction',
    display:      'default'
  },
  {
    id:           'Search.TwitterResult',
    target:       'div#rso > div > div > div.g',
    targetDepth:  0,
    pageLink:     '> g-section-with-header > div > div > div > h3.r > div > g-link > a',
    pageLinkType: 'default',
    actionParent: '> g-section-with-header > div > div > div > div',
    actionClass:  'ubTwitterAction',
    display:      'default'
  },
  {
    id:           'Search.Video',
    target:       'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:  1,
    pageLink:     '> g-inner-card > div > a',
    pageLinkType: 'default',
    actionParent: '> g-inner-card',
    actionClass:  'ubVideoAction',
    display:      'default'
  },
  {
    id:           'ImageSearch.Default',
    target:       'div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i',
    targetDepth:  0,
    pageLink:     '> div.rg_meta.notranslate',
    pageLinkType: 'image',
    actionParent: '',
    actionClass:  'ubImageSearchAction',
    display:      'imageSearch'
  },
  {
    id:           'NewsSearch.Default',
    target:       'div#rso > div > div.g',
    targetDepth:  0,
    pageLink:     '> div.ts > div > h3.r > a',
    pageLinkType: 'default',
    actionParent: '> div.ts > div > div.slp',
    actionClass:  'ubNewsSearchAction',
    display:      'default'
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
      if (!pageLink) {
        continue;
      }
      let pageUrl;
      if (info.pageLinkType == 'image') {
        const m = /"ru":"([^"]+)"/.exec(pageLink.textContent);
        if (!m) {
          continue;
        }
        pageUrl = m[1];
      } else {
        pageUrl = pageLink.href;
      }
      let actionParent;
      if (info.actionParent) {
        actionParent = base.querySelector(':scope ' + info.actionParent);
        if (!actionParent) {
          continue;
        }
      } else {
        actionParent = base;
      }
      return { base, pageUrl, actionParent, actionClass: info.actionClass, display: info.display };
    }
  }
  return null;
};
