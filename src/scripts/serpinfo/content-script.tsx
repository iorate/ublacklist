import isMobile from "is-mobile";
import { MatchPatternMap } from "../../common/match-pattern.ts";
import { control } from "./control.ts";
import { filter } from "./filter.ts";
import type { SerpIndex, SerpInfoSettings } from "./settings.ts";
import { storageStore } from "./storage-store.ts";
import { setupPopupListeners, style } from "./style.ts";
import type { SerpDescription } from "./types.ts";

function getSerpDescriptions(
  settings: Readonly<SerpInfoSettings>,
  url: string,
  mobile: boolean,
): SerpDescription[] {
  return new MatchPatternMap<SerpIndex>(settings.serpIndexMap)
    .get(url)
    .flatMap((index) => {
      const serp =
        index[0] === "user"
          ? settings.user.parsed?.pages[index[1]]
          : settings.remote[index[1]]?.parsed?.pages[index[2]];
      if (!serp) {
        return [];
      }
      if (serp.excludeMatches) {
        const excludeMap = new MatchPatternMap<1>();
        for (const match of serp.excludeMatches) {
          excludeMap.set(match, 1);
        }
        if (excludeMap.get(url).length) {
          return [];
        }
      }
      if (serp.includeRegex && !new RegExp(serp.includeRegex).test(url)) {
        return [];
      }
      if (serp.excludeRegex && new RegExp(serp.excludeRegex).test(url)) {
        return [];
      }
      if (
        (serp.userAgent === "desktop" && mobile) ||
        (serp.userAgent === "mobile" && !mobile)
      ) {
        return [];
      }
      return serp;
    });
}

function awaitBody(callback: () => void) {
  if (document.body) {
    callback();
  } else {
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
}

function awaitLoad(delay: number, callback: () => void) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(callback, delay);
    });
  }
}

storageStore.attachPromise.then(() => {
  const { serpInfoSettings } = storageStore.get();
  const serps = getSerpDescriptions(
    serpInfoSettings,
    window.location.href,
    isMobile({ tablet: true }),
  );
  if (serps.length === 0) {
    return;
  }

  setupPopupListeners();

  const start = () => {
    style();
    filter(serps);
    control();
  };
  const delay = Math.max(
    ...serps.map(({ delay }) =>
      typeof delay === "number" ? delay : delay ? 0 : -1,
    ),
  );
  if (delay < 0) {
    awaitBody(start);
  } else {
    awaitLoad(delay, start);
  }
});
