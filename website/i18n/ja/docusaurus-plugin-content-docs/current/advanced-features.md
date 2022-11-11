---
title: 高度な使い方
sidebar_position: 2
---

## ルール {#rules}

オプションページのほか、「このサイトをブロックする」ダイアログでもルールを編集できます。

![ルールエディター](/img/advanced-features/rules-1.png)

[マッチパターン](#match-patterns)または[正規表現](#regular-expressions)でルールを書くことができます。

### マッチパターン {#match-patterns}

マッチパターンはワイルドカードを含む URL のようなものです。詳細は [MDN web docs](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) を参照してください。

**有効な**マッチパターンの例です。

| パターン                                                                                      | マッチする例                                                    |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `*://example.com/*`<br /><br />(`example.com` 上の URL)                                       | `http://example.com/`<br /><br />`https://example.com/hoge`     |
| `*://*.example.net/*`<br /><br />(`example.net` またはそのサブドメイン上の URL)               | `http://example.net/`<br /><br />`https://foo.example.net/hoge` |
| `*://example.org/hoge/*`<br /><br />(`example.org` 上の URL で、パスが `/hoge/` で始まるもの) | `http://example.org/hoge/fuga.html`                             |

**無効な**マッチパターンの例です。

| 無効なパターン         | 理由                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `*://www.qinterest.*/` | `*` が先頭以外に置かれています。代わりに[正規表現](#regular-expressions)を使ってください。 |
| `<all_urls>`           | サポートされていません。                                                                   |

### 正規表現 {#regular-expressions}

[正規表現](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions)を使ってより柔軟にルールを書くことができます。

正規表現ルールは、`/` で囲まれた、JavaScript の正規表現**リテラル**の形でなければなりません (例: `/example\.(net|org)/`)。

**有効な**正規表現の例です。

| 正規表現                                                                           | マッチする例                                                            |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/^https:\/\/www\.qinterest\./`<br /><br />(`https://www.qinterest.` で始まる URL) | `https://www.qinterest.com/`<br /><br />`https://www.qinterest.jp/hoge` |
| `/^https?:\/\/([^/.]+\.)*?xn--/`<br /><br />(国際化ドメイン名を含む URL)           | `http://例.テスト/`                                                     |

**無効な**正規表現の例です。

| 無効な正規表現               | 理由                                          |
| ---------------------------- | --------------------------------------------- |
| `^https?:\/\/example\.com\/` | `/` で囲まれていません。                      |
| `/^https?://example\.com//`  | 正規表現内の `/` がエスケープされていません。 |

### 正規表現 (タイトルでブロック) {#regular-expressions-for-page-titles}

特定のタイトルを持つサイトをブロックするには、正規表現ルールの前に `title` を追加します。

例えば、ルール `title/example domain/i` は、タイトルに "example domain" を含む (大文字小文字を区別しない) サイトをブロックします。

### ブロック解除ルール {#unblock-rules}

マッチパターンまたは正規表現の前に `@` をつけると、そのサイトをブロックしないという意味になります。

これは[購読](#subscription)したルールセットによるブロックを解除するのに便利です。例えば、もし `http://example.com/` が購読中のルールセットによりブロックされていれば、ルール `@*://example.com/*` でそれを解除することができます。

### ハイライトルール {#highlighting-rules}

マッチパターンまたは正規表現の前に `@N` (N=1,2,3,...) をつけると、そのサイトをハイライトするという意味になります。

例えば、`@1*://github.com/*` で GitHub をハイライトすることができます。

![GitHub をハイライトする](/img/advanced-features/highlight.png)

デフォルトでは、`@1` (青) のみが使用できます。色を変更または追加するには、オプションページの「外観」セクションを参照してください。

### コメント {#comments}

コメントは `#` で始まります。ルールとして解釈できない行は全て実質的にコメントですが、 `#` で始まるコメントには 2 つの利点があります。

1. `#` で始まるコメントは、将来新しいシンタックスが追加されても、コメントであることが保証されます。
1. `#` で始まるコメントは、ルールの後に置くことができます。

```
# example.com またはそのサブドメイン上のサイトをブロックする
*://*.example.com/*

/example\.(net|org)/ # example.net または example.org を URL に含むサイトをブロックする
```

## Google 以外の検索エンジン {#other-search-engines}

[Bing](#bing)、[Brave](#brave)、[DuckDuckGo](#duckduckgo)、[Ecosia](#ecosia)、[Qwant](#qwant)、[SearX](#searx)、[Startpage.com](#startpagecom)、[Yahoo! JAPAN](#yahoo-japan)、[Yandex](#yandex) がサポートされています。この機能はデフォルトで無効ですが、オプションページで有効にすることができます。

![その他の検索エンジン](/img/advanced-features/other-search-engines-1.png)

検索結果を開いているときに、ツールバーのアイコンをクリックすることでも有効にできます。

### Bing {#bing}

![bing](/img/advanced-features/bing.png)

### Brave {#brave}

![brave](/img/advanced-features/brave.png)

### DuckDuckGo {#duckduckgo}

![duckduckgo](/img/advanced-features/duckduckgo.png)

### Ecosia {#ecosia}

![ecosia](/img/advanced-features/ecosia.png)

### Qwant {#qwant}

動画検索上では、"Always read on Qwant.com" を無効にする必要があります。

Lite バージョンでは、Web 検索のみがサポートされています。

### SearX {#searx}

![searx](/img/advanced-features/searx.png)

### Startpage.com {#startpagecom}

![startpage](/img/advanced-features/startpage.png)

### Yahoo! JAPAN {#yahoo-japan}

![yahoo-japan](/img/advanced-features/yahoo-japan.png)

### Yandex {#yandex}

![yandex](/img/advanced-features/yandex.png)

## 同期 {#sync}

ルールセットを Google ドライブまたは Dropbox で同期することができます。

同期を有効にするには、オプションページの「同期を有効にする」ボタンを押し、クラウドを選択します。

![同期を有効にする](/img/advanced-features/sync-1.png)

ダイアログの指示に従って認証してください。

![認証](/img/advanced-features/sync-2.png)

認証が成功すると、ルールセットが定期的に選択したクラウドと同期されるようになります。

### Google ドライブ {#google-drive}

Firefox またはその派生ブラウザでは、`https://www.googleapis.com` へのアクセスを許可する必要があります。

ルールセットは Google ドライブのアプリケーションデータフォルダーに保存されます。このフォルダーを見ることはできませんが、設定ページから削除することは可能です。

### Dropbox {#dropbox}

ルールセットは Dropbox の `/アプリ/uBlacklist/` フォルダーに保存されます。フォルダーの名前は言語によって異なるかもしれません。

## 購読 {#subscription}

公開されたルールセットを購読することができます。

購読を追加するには、オプションページの「購読を追加する」ボタンを押して、名前と URL を入力します。その URL へのアクセス許可を求められる場合があります。

![購読を追加する](/img/advanced-features/subscription-1.png)

購読を表示、更新、削除することができます。

![購読のメニュー](/img/advanced-features/subscription-2.png)

### 購読を公開する {#publish-a-subscription}

ルールセットを購読として公開するには、UTF-8 でエンコードしたルールセットファイルを適切な HTTP(S) サーバーに配置し、URL を公開します。

購読を GitHub で公開するのはよい考えです。**Raw** URL (例えば https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt) を公開してください。

![raw url](/img/advanced-features/subscription-3.png)
