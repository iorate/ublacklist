import { Blacklist } from './blacklist';
import { SerpEntryProps } from './types';
import { AltURL } from './utilities';

function makeProps(url: string, title?: string): SerpEntryProps {
  return {
    url: new AltURL(url),
    title: title ?? null,
  };
}

describe('title', () => {
  test('test', () => {
    const b1 = new Blacklist(
      String.raw`*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`,
      [],
    );
    expect(b1.test(makeProps('http://example.net', 'Net'))).toBe(0);
    expect(b1.test(makeProps('https://example.edu', 'Example Domain'))).toBe(0);
    expect(b1.test(makeProps('http://example.com', 'Allowed'))).toBe(1);

    const b2 = new Blacklist(
      String.raw`/example\.net/
u/example\.org/
ti/Example/
@titl/allowed/i`,
      [],
    );
    expect(b2.test(makeProps('http://example.net', 'Net'))).toBe(0);
    expect(b2.test(makeProps('https://example.edu', 'Example Domain'))).toBe(0);
    expect(b2.test(makeProps('http://example.com', 'Allowed'))).toBe(1);
  });
});

describe('highlight', () => {
  test('test', () => {
    const b1 = new Blacklist(
      String.raw`*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`,
      [],
    );
    expect(b1.test(makeProps('https://example.com/'))).toBe(11);
    expect(b1.test(makeProps('https://example.net/'))).toBe(1);
    expect(b1.test(makeProps('https://example.org/'))).toBe(2);
    expect(b1.test(makeProps('https://example.edu/'))).toBe(3);
    expect(b1.test(makeProps('https://example.co.jp'))).toBe(-1);

    const b2 = new Blacklist(String.raw`  @2  https://*.example.com/*  `, []);
    expect(b2.test(makeProps('https://subdomain.example.com/'))).toBe(3);
    expect(b2.test(makeProps('https://example.net/'))).toBe(-1);

    const b3 = new Blacklist(
      String.raw`*://example.com/*
@*://example.net/*`,
      [
        String.raw`@100 *://*.example.com/*
*://example.net/*`,
      ],
    );
    expect(b3.test(makeProps('https://example.com/'))).toBe(0);
    expect(b3.test(makeProps('https://subdomain.example.com/'))).toBe(101);
    expect(b3.test(makeProps('https://example.net/'))).toBe(1);
  });

  test('patch', () => {
    const b1 = new Blacklist(String.raw`@1*://example.com/*`, []);
    const p11 = b1.createPatch(makeProps('https://example.com/'));
    expect(p11.unblock).toBe(false);
    expect(p11.rulesToAdd).toBe(String.raw`*://example.com/*`);
    expect(p11.rulesToRemove).toBe(String.raw`@1*://example.com/*`);
    const p12 = b1.modifyPatch({
      rulesToAdd: String.raw`*://example.com/*
@2/example/`,
    });
    expect(p12).toBe(null);
    b1.applyPatch();
    expect(b1.toString()).toBe(String.raw`*://example.com/*`);

    const b2 = new Blacklist(String.raw`*://example.com/*`, [String.raw`*://example.com/*`]);
    const p21 = b2.createPatch(makeProps('https://example.com'));
    expect(p21.unblock).toBe(true);
    expect(p21.rulesToAdd).toBe(String.raw`@*://example.com/*`);
    expect(p21.rulesToRemove).toBe(String.raw`*://example.com/*`);
    const p22 = b2.modifyPatch({ rulesToAdd: String.raw`@42*://*.example.com/*` });
    expect(p22).not.toBe(null);
    b2.applyPatch();
    expect(b2.toString()).toBe(String.raw`@42*://*.example.com/*`);
  });
});

describe('block and unblock', () => {
  const BLACKLIST1 = String.raw`*://*.example.com/*
# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`;
  const BLACKLIST2 = String.raw`ftp://example.org/*`;
  const BLACKLIST3 = String.raw`/^https?:\/\/www\.qinterest\./
@https://example.edu/path/to/*`;

  test('toString', () => {
    const b1 = new Blacklist(BLACKLIST1, []);
    expect(b1.toString()).toBe(BLACKLIST1);

    const b123 = new Blacklist(BLACKLIST1, [BLACKLIST2, BLACKLIST3]);
    expect(b123.toString()).toBe(BLACKLIST1);
  });

  test('test', () => {
    const b1 = new Blacklist(BLACKLIST1, []);
    expect(b1.test(makeProps('http://example.com/'))).toBe(0);
    expect(b1.test(makeProps('https://www.example.com/path'))).toBe(0);
    expect(b1.test(makeProps('ftp://example.net/'))).toBe(0);
    expect(b1.test(makeProps('http://example.edu/'))).toBe(-1);

    const b123 = new Blacklist(BLACKLIST1, [BLACKLIST2, BLACKLIST3]);
    expect(b123.test(makeProps('http://example.com/'))).toBe(0);
    expect(b123.test(makeProps('http://example.net/'))).toBe(1);
    expect(b123.test(makeProps('https://example.edu/'))).toBe(-1);
    expect(b123.test(makeProps('https://example.edu/path/to/example'))).toBe(1);
    expect(b123.test(makeProps('https://www.qinterest.com/'))).toBe(0);
  });

  test('patch', () => {
    const b1 = new Blacklist(BLACKLIST1, []);
    const p1a = b1.createPatch(makeProps('https://www.example.edu/'));
    expect(p1a.unblock).toBe(false);
    expect(p1a.props.url.toString()).toBe('https://www.example.edu/');
    expect(p1a.rulesToAdd).toBe('*://www.example.edu/*');
    expect(p1a.rulesToRemove).toBe('');
    const p1b = b1.modifyPatch({ rulesToAdd: '*://example.edu/*' });
    expect(p1b).toBe(null);
    const p1c = b1.modifyPatch({ rulesToAdd: 'https://*.example.edu/' });
    expect(p1c?.rulesToAdd).toBe('https://*.example.edu/');
    b1.applyPatch();
    expect(b1.toString()).toBe(String.raw`${BLACKLIST1}
https://*.example.edu/`);

    const b123 = new Blacklist(BLACKLIST1, [BLACKLIST2, BLACKLIST3]);
    const p123a = b123.createPatch(makeProps('http://www.example.com/path'));
    expect(p123a.unblock).toBe(true);
    expect(p123a.props.url.toString()).toBe('http://www.example.com/path');
    expect(p123a.rulesToAdd).toBe('');
    expect(p123a.rulesToRemove).toBe('*://*.example.com/*');
    b123.applyPatch();
    expect(b123.toString()).toBe(String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`);

    const p123b = b123.createPatch(makeProps('https://example.net/'));
    expect(p123b.unblock).toBe(false);
    expect(p123b.props.url.toString()).toBe('https://example.net/');
    expect(p123b.rulesToAdd).toBe('');
    expect(p123b.rulesToRemove).toBe('@*://example.net/*');
    const p123c = b123.modifyPatch({ rulesToAdd: '@/net/' });
    expect(p123c).toBe(null);
    const p123d = b123.modifyPatch({ rulesToAdd: 'Only comment' });
    expect(p123d?.rulesToAdd).toBe('Only comment');
    b123.deletePatch();
    expect(() => {
      b123.applyPatch();
    }).toThrow();

    const p123e = b123.createPatch(makeProps('ftp://example.org/dir/file'));
    expect(p123e.unblock).toBe(true);
    expect(p123e.props.url.toString()).toBe('ftp://example.org/dir/file');
    expect(p123e.rulesToAdd).toBe('@ftp://example.org/*');
    expect(p123e.rulesToRemove).toBe(String.raw`/example\.(net|org)/`);
    b123.applyPatch();
    expect(b123.toString()).toBe(String.raw`# Block 'example.net' and 'example.org'
# But unblock 'example.net'
@*://example.net/*
@ftp://example.org/*`);

    b123.createPatch(makeProps('http://www.example.edu/foo/bar'));
    const p123f = b123.modifyPatch({
      rulesToAdd: String.raw`*://www.example.edu/*
@/edu/`,
    });
    expect(p123f).toBe(null);
  });
});
