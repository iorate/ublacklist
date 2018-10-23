const SITE_INSPECTORS = [
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
  for (const insp of SITE_INSPECTORS) {
    if (elem.matches(insp.target)) {
      let site = elem;
      for (let i = 0; i < insp.targetDepth; ++i) {
        site = site.parentNode;
      }
      const pageLink = site.querySelector(insp.pageLink);
      if (!pageLink) { continue; }
      let pageUrl = null;
      if (insp.pageLinkType == 'image') {
        const m = /"ru":"([^"]+)"/.exec(pageLink.textContent);
        if (!m) { continue; }
        pageUrl = m[1];
      } else {
        pageUrl = pageLink.href;
      }
      let blockContainerParent = null;
      if (insp.blockContainerParent) {
        blockContainerParent = site.querySelector(insp.blockContainerParent);
      } else {
        blockContainerParent = site;
      }
      if (!blockContainerParent) { continue; }
      return {
        site, pageUrl, blockContainerParent,
        blockContainerTag: insp.blockContainerTag,
        blockContainerClass: insp.blockContainerClass
      };
    }
  }
  return null;
};
