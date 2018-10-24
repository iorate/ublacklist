const ENTRY_INFO = [
  // Search, Book_Search, Video_Search
  {
    target:               'div#rso > div > div.srg > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div > div.rc > div.r',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubDefaultBlockUnblock'
  },
  // Search.Web_Result_with_Site_Links
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div > div > div.rc > div.r',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubDefaultBlockUnblock'
  },
  // Search.Web_Result
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div > div.rc > div.r',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubDefaultBlockUnblock'
  },
  // Search.Featured_Snippet
  {
    target:               'div#rso > div > div.g.mnr-c.g-blk',
    targetDepth:          0,
    pageLink:             ':scope > div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubDefaultBlockUnblock'
  },
  // Search.Top_Story
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
    targetDepth:          2,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > g-inner-card',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubCardBlockUnblock'
  },
  // Search.Top_Story.Hidden
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > g-inner-card',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubCardBlockUnblock'
  },
  // Search.Latest
  {
    target:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > g-inner-card',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubCardBlockUnblock'
  },
  // Search.Video
  {
    target:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    targetDepth:          1,
    pageLink:             ':scope > g-inner-card > div > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > g-inner-card',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubVideoBlockUnblock'
  },
  // Search.Top_Story.List
  {
    target:               'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
    targetDepth:          0,
    pageLink:             ':scope > div.dbsr.kno-fb-ctx > g-card-section > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div.dbsr.kno-fb-ctx > g-card-section > div',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubDefaultBlockUnblock'
  },
  // Search.Image
  {
    target:               'div#iur > div.kno-ibrg > div > div.img-brk > div.birrg > div.rg_el.ivg-i',
    targetDepth:          0,
    pageLink:             ':scope > div.rg_meta.notranslate',
    pageLinkType:         'image',
    blockUnblockParent:   '',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubImageBlockUnblock'
  },
  // Image_Search
  {
    target:               'div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i',
    targetDepth:          0,
    pageLink:             ':scope > div.rg_meta.notranslate',
    pageLinkType:         'image',
    blockUnblockParent:   '',
    blockUnblockTag:      'div',
    blockUnblockClass:    'ubImageSearchBlockUnblock'
  },
  // News_Search
  {
    target:               'div#rso > div > div.g',
    targetDepth:          0,
    pageLink:             ':scope > div.ts > div > h3.r > a',
    pageLinkType:         'default',
    blockUnblockParent:   ':scope > div.ts > div > div.slp',
    blockUnblockTag:      'span',
    blockUnblockClass:    'ubNewsSearchBlockUnblock'
  },
];

const inspectEntry = elem => {
  for (const info of ENTRY_INFO) {
    if (elem.matches(info.target)) {
      let root = elem;
      for (let i = 0; i < info.targetDepth; ++i) {
        root = root.parentNode;
      }

      const pageLink = root.querySelector(info.pageLink);
      if (!pageLink) { continue; }
      let pageUrl;
      if (info.pageLinkType == 'image') {
        const m = /"ru":"([^"]+)"/.exec(pageLink.textContent);
        if (!m) { continue; }
        pageUrl = m[1];
      } else {
        pageUrl = pageLink.href;
      }

      let blockUnblockParent;
      if (info.blockUnblockParent) {
        blockUnblockParent = root.querySelector(info.blockUnblockParent);
      } else {
        blockUnblockParent = root;
      }
      if (!blockUnblockParent) { continue; }

      const blockUnblockTag = info.blockUnblockTag;
      const blockUnblockClass = info.blockUnblockClass;

      return { root, pageUrl, blockUnblockParent, blockUnblockTag, blockUnblockClass };
    }
  }
  return null;
};
