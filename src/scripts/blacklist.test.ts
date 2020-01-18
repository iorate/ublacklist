// FIXME: This test is not comprehensive.

import { Blacklist } from './blacklist';
import { AltURL } from './utilities';

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
  expect(b1.test(new AltURL('http://example.com/'))).toBe(true);
  expect(b1.test(new AltURL('https://www.example.com/path'))).toBe(true);
  expect(b1.test(new AltURL('ftp://example.net/'))).toBe(true);
  expect(b1.test(new AltURL('http://example.edu/'))).toBe(false);

  const b123 = new Blacklist(BLACKLIST1, [BLACKLIST2, BLACKLIST3]);
  expect(b123.test(new AltURL('http://example.com/'))).toBe(true);
  expect(b123.test(new AltURL('http://example.net/'))).toBe(false);
  expect(b123.test(new AltURL('https://example.edu/'))).toBe(false);
  expect(b123.test(new AltURL('https://example.edu/path/to/example'))).toBe(false);
  expect(b123.test(new AltURL('https://www.qinterest.com/'))).toBe(true);
});

test('patch', () => {
  const b1 = new Blacklist(BLACKLIST1, []);
  const p1a = b1.createPatch(new AltURL('https://www.example.edu/'));
  expect(p1a.unblock).toBe(false);
  expect(p1a.url.toString()).toBe('https://www.example.edu/');
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
  const p123a = b123.createPatch(new AltURL('http://www.example.com/path'));
  expect(p123a.unblock).toBe(true);
  expect(p123a.url.toString()).toBe('http://www.example.com/path');
  expect(p123a.rulesToAdd).toBe('');
  expect(p123a.rulesToRemove).toBe('*://*.example.com/*');
  b123.applyPatch();
  expect(b123.toString()).toBe(String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`);

  const p123b = b123.createPatch(new AltURL('https://example.net/'));
  expect(p123b.unblock).toBe(false);
  expect(p123b.url.toString()).toBe('https://example.net/');
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

  const p123e = b123.createPatch(new AltURL('ftp://example.org/dir/file'));
  expect(p123e.unblock).toBe(true);
  expect(p123e.url.toString()).toBe('ftp://example.org/dir/file');
  expect(p123e.rulesToAdd).toBe('@ftp://example.org/*');
  expect(p123e.rulesToRemove).toBe(String.raw`/example\.(net|org)/`);
  b123.applyPatch();
  expect(b123.toString()).toBe(String.raw`# Block 'example.net' and 'example.org'
# But unblock 'example.net'
@*://example.net/*
@ftp://example.org/*`);

  b123.createPatch(new AltURL('http://www.example.edu/foo/bar'));
  const p123f = b123.modifyPatch({
    rulesToAdd: String.raw`*://www.example.edu
@/edu/`,
  });
  expect(p123f).toBe(null);
});
