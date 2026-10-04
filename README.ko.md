# uBlacklist

[English](README.md) | [Deutsch](README.de.md) | [한국어](README.ko.md) | [简体中文](README.zh-CN.md)

특정 사이트가 Google 검색 결과에 나타나지 않도록 차단합니다

- **Chrome**: [Chrome 웹 스토어](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe)
- **Firefox**: [Firefox 부가 기능](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/)
- **Edge**: [Edge 추가 기능](https://microsoftedge.microsoft.com/addons/detail/ublacklist/feedneoaheedjlhokipclogaoejelcbb)
- **Safari**: [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (macOS 및 iOS, [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project) 제공)

## 설명

이 확장 프로그램은 사용자가 지정한 사이트가 Google 검색 결과에 나타나지 않도록 방지합니다.

검색 결과 페이지 또는 툴바 아이콘을 클릭하여 차단할 사이트에서 규칙을 추가할 수 있습니다. 규칙은 [일치 패턴](https://ublacklist.github.io/docs/advanced-features#match-patterns)(예: `*://*.example.com/*`) 또는 정규 표현식, 변수, 문자열 일치자를 포함하는 [표현식](https://ublacklist.github.io/docs/advanced-features#expressions)(예: `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"` 등)으로 지정할 수 있습니다.

클라우드 스토리지(Google Drive, Dropbox, OneDrive, WebDAV) 또는 브라우저 동기화를 통해 여러 기기 간에 규칙 세트를 동기화할 수 있습니다.

공개 규칙 세트를 구독할 수도 있습니다. 일부 공개 규칙 세트 목록은 웹사이트에서 확인할 수 있습니다:
https://ublacklist.github.io/rulesets

## 브라우저 지원 정책

uBlacklist는 다음 브라우저 버전을 지원합니다:

- **Chrome**: 최신 안정 버전만 지원
- **Firefox**: 최신 안정 버전 및 최신 ESR만 지원
- **Edge**: 최신 안정 버전만 지원
- **Safari**: 최신 안정 버전만 지원 (macOS 및 iOS)

위 목록 이외의 브라우저 지원은 커뮤니티 기여에 달려 있습니다. 구체적인 구현 제안과 함께 [토론(Discussion)](https://github.com/iorate/ublacklist/discussions)을 열어 주세요. 구체적인 제안이 없는 제보는 처리되지 않을 가능성이 높습니다.

## 지원하는 검색 엔진

이 확장 프로그램은 아래 검색 엔진에서 사용할 수 있습니다.

<!-- prettier-ignore-start -->

|  | 웹 | 이미지 | 동영상 | 뉴스 |
| --- | --- | --- | --- | --- |
| Google | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Bing | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Brave | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| DuckDuckGo | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Ecosia | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Kagi | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| SearXNG | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Startpage | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Yahoo! JAPAN | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |  |
| Yandex | :heavy_check_mark: |  | :heavy_check_mark: |  |

<!-- prettier-ignore-end -->

추가적인 기본 내장 검색 엔진 지원 계획은 없습니다. [SERPINFO](https://ublacklist.github.io/docs/serpinfo)를 사용하여 원하는 검색 엔진 지원을 직접 추가할 수 있습니다.

## 관련 저장소

- [ublacklist/builtin](https://github.com/ublacklist/builtin) — 기본 내장 SERPINFO 파일. 확장 프로그램은 여기에서 최신 SERPINFO를 주기적으로 다운로드합니다.
- [ublacklist/packages](https://github.com/ublacklist/packages) — npm 패키지 (`@ublacklist/match-pattern`, `@ublacklist/ruleset`, `@ublacklist/serpinfo`) 및 규칙 세트/SERPINFO 형식 사양
- [ublacklist/store-assets](https://github.com/ublacklist/store-assets) — 스토어 등록 정보 설명 및 스크린샷
- [ublacklist/ublacklist.github.io](https://github.com/ublacklist/ublacklist.github.io) — 웹사이트 및 문서 (https://ublacklist.github.io)

## 구독 제공자를 위한 안내

규칙 세트를 구독으로 배포하려면 UTF-8로 인코딩된 규칙 세트 파일을 적절한 HTTP(S) 서버에 올리고 해당 URL을 공개하세요. 다음은 GitHub에 호스팅된 예시입니다:

https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt

규칙 세트 맨 앞에 YAML 프런트매터(frontmatter)를 추가할 수 있습니다. `name` 변수를 설정하는 것을 권장합니다.

```
---
name: Your ruleset name
---
*://*.example.com/*
```

## AI 에이전트로 규칙 세트 및 SERPINFO 작성하기

규칙 세트 및 SERPINFO 작성을 위한 에이전트 스킬이 [ublacklist/packages](https://github.com/ublacklist/packages)에 공개되어 있습니다. [GitHub CLI](https://cli.github.com/)를 사용하여 AI 코딩 에이전트에 설치할 수 있습니다:

```shell
gh skill install ublacklist/packages
```

## 기여하기

자세한 개발 환경 설정 및 가이드라인은 [기여 가이드](CONTRIBUTING.md)를 참조하세요.

## 작성자

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## 라이선스

uBlacklist는 [MIT License](LICENSE.txt)에 따라 라이선스가 부여됩니다.
