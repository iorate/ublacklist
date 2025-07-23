import bing from "@builtin/serpinfo/bing.yml";
import brave from "@builtin/serpinfo/brave.yml";
import duckduckgo from "@builtin/serpinfo/duckduckgo.yml";
import ecosia from "@builtin/serpinfo/ecosia.yml";
import google from "@builtin/serpinfo/google.yml";
import kagi from "@builtin/serpinfo/kagi.yml";
import searxng from "@builtin/serpinfo/searxng.yml";
import startpage from "@builtin/serpinfo/startpage.yml";
import yahooJapan from "@builtin/serpinfo/yahoo-japan.yml";
import yandex from "@builtin/serpinfo/yandex.yml";

export type BuiltinSerpInfo = {
  url: string;
  content: string;
};

function getURL(filename: string): string {
  return `https://raw.githubusercontent.com/ublacklist/builtin/refs/heads/dist/serpinfo/${filename}`;
}

export const GOOGLE_SERPINFO_URL = getURL("google.yml");

export const BUILTINS: readonly BuiltinSerpInfo[] = [
  {
    url: GOOGLE_SERPINFO_URL,
    content: google,
  },
  {
    url: getURL("bing.yml"),
    content: bing,
  },
  {
    url: getURL("brave.yml"),
    content: brave,
  },
  {
    url: getURL("duckduckgo.yml"),
    content: duckduckgo,
  },
  {
    url: getURL("ecosia.yml"),
    content: ecosia,
  },
  {
    url: getURL("kagi.yml"),
    content: kagi,
  },
  {
    url: getURL("searxng.yml"),
    content: searxng,
  },
  {
    url: getURL("startpage.yml"),
    content: startpage,
  },
  {
    url: getURL("yahoo-japan.yml"),
    content: yahooJapan,
  },
  {
    url: getURL("yandex.yml"),
    content: yandex,
  },
];
