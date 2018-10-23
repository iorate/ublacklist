const SITE_QUERIES = [
  // Search, Book_Search, Video_Search
  {
    target:               'div#rso > div > div.srg > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div > div.rc > div.r',
    blockContainerTag:    'span',
    blockContainerClass:  'ubDefaultBlockContainer'
  },
  // Search.Featured_Snippet
  {
    target:               'div#rso > div > div.g.mnr-c.g-blk',
    targetDepth:          0,
    pageLink:             ':scope > div.kp-blk > div.xpdopen > div > div.g > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div.kp-blk > div.xpdopen > div > div.g > div > div.rc > div.r',
    blockContainerTag:    'span',
    blockContainerClass:  'ubDefaultBlockContainer'
  },
  // Search.Latest
  {
    target:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > g-inner-card',
    blockContainerTag:    'div',
    blockContainerClass:  'ubCardBlockContainer'
  },
  // Search.Top_Story
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
    targetDepth:          2,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > g-inner-card',
    blockContainerTag:    'div',
    blockContainerClass:  'ubCardBlockContainer'
  },
  // Search.Top_Story.Hidden
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > g-inner-card',
    blockContainerTag:    'div',
    blockContainerClass:  'ubCardBlockContainer'
  },
  // Search.Top_Story.List
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
    targetDepth:          0,
    pageLink:             ':scope > div.dbsr.kno-fb-ctx > g-card-section > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div.dbsr.kno-fb-ctx > g-card-section > div',
    blockContainerTag:    'span',
    blockContainerClass:  'ubDefaultBlockContainer'
  },
  // Search.Video
  {
    target:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > div > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > g-inner-card',
    blockContainerTag:    'div',
    blockContainerClass:  'ubVideoBlockContainer'
  },
  // Search.Web_Result
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div > div.rc > div.r',
    blockContainerTag:    'span',
    blockContainerClass:  'ubDefaultBlockContainer'
  },
  // Search.Web_Result_with_Site_Links
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div > div > div.rc > div.r',
    blockContainerTag:    'span',
    blockContainerClass:  'ubDefaultBlockContainer'
  },
  // Image_Search
  {
    target:               'div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i',
    targetDepth:          0,
    pageLink:             ':scope > div.rg_meta.notranslate',
    pageLinkType:         'image',
    blockContainerParent: '',
    blockContainerTag:    'div',
    blockContainerClass:  'ubImageBlockContainer'
  },
  // News_Search
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div.ts > div > h3.r > a',
    pageLinkType:         'default',
    blockContainerParent: ':scope > div.ts > div > div.slp',
    blockContainerTag:    'span',
    blockContainerClass:  'ubNewsBlockContainer'
  },
];

const querySite = elem => {
  for (const query of SITE_QUERIES) {
    if (elem.matches(query.target)) {
      let site = elem;
      for (let i = 0; i < query.targetDepth; ++i) {
        site = site.parentNode;
      }
      const pageLink = site.querySelector(query.pageLink);
      if (!pageLink) { continue; }
      let pageUrl = null;
      if (query.pageLinkType == 'image') {
        const m = /"ru":"([^"]+)"/.exec(pageLink.textContent);
        if (!m) { continue; }
        pageUrl = m[1];
      } else {
        pageUrl = pageLink.href;
      }
      let blockContainerParent = null;
      if (query.blockContainerParent) {
        blockContainerParent = site.querySelector(query.blockContainerParent);
      } else {
        blockContainerParent = site;
      }
      if (!blockContainerParent) { continue; }
      return {
        site, pageUrl, blockContainerParent,
        blockContainerTag: query.blockContainerTag,
        blockContainerClass: query.blockContainerClass
      };
    }
  }
  return null;
};
