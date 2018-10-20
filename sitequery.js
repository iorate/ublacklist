const SITE_QUERIES = [
  // Search, Book Search or Video Search
  {
    anchor:               'div#rso > div > div.g',
    anchorDepth:          1,
    pageLink:             ':scope > div.g > div > div > div.rc > div.r > a',
    blockContainerParent: ':scope > div.g > div > div > div.rc > div.r',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
  {
    anchor:               'div#rso > div > div.g',
    anchorDepth:          1,
    pageLink:             ':scope > div.g > div > div.rc > div.r > a',
    blockContainerParent: ':scope > div.g > div > div.rc > div.r',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
  {
    anchor:               'div#rso > div > div.srg > div.g',
    anchorDepth:          0,
    pageLink:             ':scope > div > div.rc > div.r > a',
    blockContainerParent: ':scope > div > div.rc > div.r',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
  // Search: Featured Snippet
  {
    anchor:               'div#rso > div > div.g.mnr-c.g-blk',
    anchorDepth:          1,
    pageLink:             ':scope > div.g.mnr-c.g-blk > div.kp-blk > div.xpdopen > div > div.g > div > div.rc > div.r > a',
    blockContainerParent: ':scope > div.g.mnr-c.g-blk > div.kp-blk > div.xpdopen > div > div.g > div > div.rc > div.r',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
  // Search: Top Story
  {
    anchor:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
    anchorDepth:          2,
    pageLink:             ':scope > g-inner-card > a',
    blockContainerParent: ':scope > g-inner-card',
    blockContainer:       'div.ubCarouselBlockContainer'
  },
  // Search: Top Story (Hidden)
  {
    anchor:               'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
    anchorDepth:          1,
    pageLink:             ':scope > g-inner-card > a',
    blockContainerParent: ':scope > g-inner-card',
    blockContainer:       'div.ubCarouselBlockContainer'
  },
  // Search: Latest
  {
    anchor:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card > div:nth-child(2)',
    anchorDepth:          2,
    pageLink:             ':scope > g-inner-card > a',
    blockContainerParent: ':scope > g-inner-card',
    blockContainer:       'div.ubCarouselBlockContainer'
  },
  // Search: Video
  {
    anchor:               'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
    anchorDepth:          1,
    pageLink:             ':scope > g-inner-card > div > a',
    blockContainerParent: ':scope > g-inner-card',
    blockContainer:       'div.ubCarouselBlockContainer'
  },
  // Search: Top Story (List)
  {
    anchor:               'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
    anchorDepth:          0,
    pageLink:             ':scope > div > g-card-section > a',
    blockContainerParent: ':scope > div > g-card-section > div',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
  // News Search
  {
    anchor:               'div#rso > div > div.g',
    anchorDepth:          0,
    pageLink:             ':scope > div.ts > div > h3.r > a',
    blockContainerParent: ':scope > div.ts > div > div.slp',
    blockContainer:       'span.ubDefaultBlockContainer'
  },
];

const querySite = elem => {
  for (const query of SITE_QUERIES) {
    if (elem.matches(query.anchor)) {
      let site = elem;
      for (let i = 0; i < query.anchorDepth; ++i) {
        site = site.parentNode;
      }
      const pageLink = site.querySelector(query.pageLink);
      if (pageLink) {
        const blockContainerParent = site.querySelector(query.blockContainerParent);
        if (blockContainerParent) {
          return { site, pageUrl: pageLink.href, blockContainerParent, blockContainerSelector: query.blockContainer };
        }
      }
    }
  }
  return {};
};
