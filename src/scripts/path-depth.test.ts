import { PathDepth } from './path-depth';
import { AltURL } from './utilities';

test('PathDepth', () => {
  const pd1 = new PathDepth(new AltURL('http://www.example.com/foo/bar/baz'));
  expect(pd1.maxDepth()).toBe(2);
  expect(pd1.suggestMatchPattern(1, false)).toBe('*://www.example.com/foo/*');
  expect(pd1.suggestMatchPattern(2, true)).toBe('@*://www.example.com/foo/bar/*');
  expect(() => pd1.suggestMatchPattern(3, false)).toThrow();

  const pd2 = new PathDepth(new AltURL('https://www.example.com/'));
  expect(pd2.maxDepth()).toBe(0);
  expect(pd2.suggestMatchPattern(0, false)).toBe('*://www.example.com/*');
  expect(() => pd2.suggestMatchPattern(-1, true)).toThrow();

  const pd3 = new PathDepth(new AltURL('ftp://www.example.com/foo/?bar=baz'));
  expect(pd3.maxDepth()).toBe(1);
  expect(pd3.suggestMatchPattern(1, false)).toBe('ftp://www.example.com/foo/*');
});
