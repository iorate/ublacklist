import { InteractiveRuleset } from './interactive-ruleset';
import { Ruleset } from './ruleset';
import { SerpEntryProps } from './types';
import { AltURL, r } from './utilities';

function makeInteractiveRuleset(
  user: string,
  subscriptions: readonly string[] = [],
): InteractiveRuleset {
  return new InteractiveRuleset(
    user,
    Ruleset.compile(user),
    subscriptions.map(subscription => Ruleset.compile(subscription)),
  );
}

function makeProps(url: string, title?: string): SerpEntryProps {
  return {
    url: new AltURL(url),
    title: title ?? null,
  };
}

describe('psl', () => {
  test('patch', () => {
    const rs1 = makeInteractiveRuleset('');
    const p11 = rs1.createPatch(makeProps('https://www.library.city.chuo.tokyo.jp'), true);
    expect(p11.unblock).toBe(false);
    expect(p11.rulesToAdd).toBe(r`*://*.city.chuo.tokyo.jp/*`);
    expect(p11.rulesToRemove).toBe('');
    rs1.applyPatch();
    expect(rs1.toString()).toBe(r`*://*.city.chuo.tokyo.jp/*`);

    const rs2 = makeInteractiveRuleset('', [r`*://*.example.com/*`]);
    const p21 = rs2.createPatch(makeProps('https://www.example.com/'), true);
    expect(p21.unblock).toBe(true);
    expect(p21.rulesToAdd).toBe(r`@*://*.example.com/*`);
    expect(p21.rulesToRemove).toBe('');
    rs2.applyPatch();
    expect(rs2.toString()).toBe(r`@*://*.example.com/*`);
  });
});

describe('title', () => {
  test('test', () => {
    const rs1 = makeInteractiveRuleset(
      r`*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`,
    );
    expect(rs1.test(makeProps('http://example.net', 'Net'))).toBe(0);
    expect(rs1.test(makeProps('https://example.edu', 'Example Domain'))).toBe(0);
    expect(rs1.test(makeProps('http://example.com', 'Allowed'))).toBe(1);

    const rs2 = makeInteractiveRuleset(
      r`/example\.net/
u/example\.org/
ti/Example/
@titl/allowed/i`,
    );
    expect(rs2.test(makeProps('http://example.net', 'Net'))).toBe(0);
    expect(rs2.test(makeProps('https://example.edu', 'Example Domain'))).toBe(0);
    expect(rs2.test(makeProps('http://example.com', 'Allowed'))).toBe(1);
  });
});

describe('highlight', () => {
  test('test', () => {
    const rs1 = makeInteractiveRuleset(
      r`*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`,
    );
    expect(rs1.test(makeProps('https://example.com/'))).toBe(11);
    expect(rs1.test(makeProps('https://example.net/'))).toBe(1);
    expect(rs1.test(makeProps('https://example.org/'))).toBe(2);
    expect(rs1.test(makeProps('https://example.edu/'))).toBe(3);
    expect(rs1.test(makeProps('https://example.co.jp'))).toBe(-1);

    const rs2 = makeInteractiveRuleset(r`  @2  https://*.example.com/*  `);
    expect(rs2.test(makeProps('https://subdomain.example.com/'))).toBe(3);
    expect(rs2.test(makeProps('https://example.net/'))).toBe(-1);

    const rs3 = makeInteractiveRuleset(
      r`*://example.com/*
@*://example.net/*`,
      [
        r`@100 *://*.example.com/*
*://example.net/*`,
      ],
    );
    expect(rs3.test(makeProps('https://example.com/'))).toBe(0);
    expect(rs3.test(makeProps('https://subdomain.example.com/'))).toBe(101);
    expect(rs3.test(makeProps('https://example.net/'))).toBe(1);
  });

  test('patch', () => {
    const rs1 = makeInteractiveRuleset(r`@1*://example.com/*`);
    const p11 = rs1.createPatch(makeProps('https://example.com/'), false);
    expect(p11.unblock).toBe(false);
    expect(p11.rulesToAdd).toBe(r`*://example.com/*`);
    expect(p11.rulesToRemove).toBe(r`@1*://example.com/*`);
    const p12 = rs1.modifyPatch({
      rulesToAdd: r`*://example.com/*
@2/example/`,
    });
    expect(p12).toBe(null);
    rs1.applyPatch();
    expect(rs1.toString()).toBe(r`*://example.com/*`);

    const rs2 = makeInteractiveRuleset(r`*://example.com/*`, [r`*://example.com/*`]);
    const p21 = rs2.createPatch(makeProps('https://example.com'), false);
    expect(p21.unblock).toBe(true);
    expect(p21.rulesToAdd).toBe(r`@*://example.com/*`);
    expect(p21.rulesToRemove).toBe(r`*://example.com/*`);
    const p22 = rs2.modifyPatch({ rulesToAdd: r`@42*://*.example.com/*` });
    expect(p22).not.toBe(null);
    rs2.applyPatch();
    expect(rs2.toString()).toBe(r`@42*://*.example.com/*`);
  });
});

describe('block and unblock', () => {
  const RULESET1 = r`*://*.example.com/*
# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`;
  const RULESET2 = r`ftp://example.org/*`;
  const RULESET3 = r`/^https?:\/\/www\.qinterest\./
@https://example.edu/path/to/*`;

  test('toString', () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    expect(rs1.toString()).toBe(RULESET1);

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    expect(rs123.toString()).toBe(RULESET1);
  });

  test('test', () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    expect(rs1.test(makeProps('http://example.com/'))).toBe(0);
    expect(rs1.test(makeProps('https://www.example.com/path'))).toBe(0);
    expect(rs1.test(makeProps('ftp://example.net/'))).toBe(0);
    expect(rs1.test(makeProps('http://example.edu/'))).toBe(-1);

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    expect(rs123.test(makeProps('http://example.com/'))).toBe(0);
    expect(rs123.test(makeProps('http://example.net/'))).toBe(1);
    expect(rs123.test(makeProps('https://example.edu/'))).toBe(-1);
    expect(rs123.test(makeProps('https://example.edu/path/to/example'))).toBe(1);
    expect(rs123.test(makeProps('https://www.qinterest.com/'))).toBe(0);
  });

  test('patch', () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    const p1a = rs1.createPatch(makeProps('https://www.example.edu/'), false);
    expect(p1a.unblock).toBe(false);
    expect(p1a.props.url.toString()).toBe('https://www.example.edu/');
    expect(p1a.rulesToAdd).toBe('*://www.example.edu/*');
    expect(p1a.rulesToRemove).toBe('');
    const p1b = rs1.modifyPatch({ rulesToAdd: '*://example.edu/*' });
    expect(p1b).toBe(null);
    const p1c = rs1.modifyPatch({ rulesToAdd: 'https://*.example.edu/' });
    expect(p1c?.rulesToAdd).toBe('https://*.example.edu/');
    rs1.applyPatch();
    expect(rs1.toString()).toBe(r`${RULESET1}
https://*.example.edu/`);

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    const p123a = rs123.createPatch(makeProps('http://www.example.com/path'), false);
    expect(p123a.unblock).toBe(true);
    expect(p123a.props.url.toString()).toBe('http://www.example.com/path');
    expect(p123a.rulesToAdd).toBe('');
    expect(p123a.rulesToRemove).toBe('*://*.example.com/*');
    rs123.applyPatch();
    expect(rs123.toString()).toBe(r`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`);

    const p123b = rs123.createPatch(makeProps('https://example.net/'), false);
    expect(p123b.unblock).toBe(false);
    expect(p123b.props.url.toString()).toBe('https://example.net/');
    expect(p123b.rulesToAdd).toBe('');
    expect(p123b.rulesToRemove).toBe('@*://example.net/*');
    const p123c = rs123.modifyPatch({ rulesToAdd: '@/net/' });
    expect(p123c).toBe(null);
    const p123d = rs123.modifyPatch({ rulesToAdd: 'Only comment' });
    expect(p123d?.rulesToAdd).toBe('Only comment');
    rs123.deletePatch();
    expect(() => {
      rs123.applyPatch();
    }).toThrow();
    expect(rs123.toString()).toBe(r`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`);

    const p123e = rs123.createPatch(makeProps('ftp://example.org/dir/file'), false);
    expect(p123e.unblock).toBe(true);
    expect(p123e.props.url.toString()).toBe('ftp://example.org/dir/file');
    expect(p123e.rulesToAdd).toBe('@ftp://example.org/*');
    expect(p123e.rulesToRemove).toBe(r`/example\.(net|org)/`);
    rs123.applyPatch();
    expect(rs123.toString()).toBe(r`# Block 'example.net' and 'example.org'
# But unblock 'example.net'
@*://example.net/*
@ftp://example.org/*`);

    rs123.createPatch(makeProps('http://www.example.edu/foo/bar'), false);
    const p123f = rs123.modifyPatch({
      rulesToAdd: r`*://www.example.edu/*
@/edu/`,
    });
    expect(p123f).toBe(null);
  });
});
