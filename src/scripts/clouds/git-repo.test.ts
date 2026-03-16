import assert from "node:assert";
import { test } from "node:test";
import { gitRepo } from "./git-repo.ts";

test("gitRepo.parseUrl", async (t) => {
  await t.test("autofill can switch from selected platform to github", () => {
    const parsed = gitRepo.parseUrl(
      "https://github.com/example-org/example-repo/tree/main/rules",
      "gitlab",
      "https://gitlab.com",
    );
    assert.deepStrictEqual(parsed, {
      platform: "github",
      owner: "example-org",
      repo: "example-repo",
      branch: "main",
      path: "rules",
    });
  });

  await t.test("autofill can switch from selected platform to codeberg", () => {
    const parsed = gitRepo.parseUrl(
      "https://codeberg.org/foo/bar/src/branch/main/filters",
      "github",
    );
    assert.deepStrictEqual(parsed, {
      platform: "codeberg",
      owner: "foo",
      repo: "bar",
      branch: "main",
      path: "filters",
    });
  });

  await t.test("hosted gitlab.com parses without apiBase", () => {
    const parsed = gitRepo.parseUrl(
      "https://gitlab.com/group/project/-/tree/main/filters",
      "github",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitlab",
      owner: "group",
      repo: "project",
      branch: "main",
      path: "filters",
      apiBase: "https://gitlab.com",
    });
  });

  await t.test("hosted gitea.com parses without apiBase", () => {
    const parsed = gitRepo.parseUrl(
      "https://gitea.com/org/repo/src/branch/main/filters",
      "github",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitea",
      owner: "org",
      repo: "repo",
      branch: "main",
      path: "filters",
      apiBase: "https://gitea.com",
    });
  });

  await t.test("self-hosted gitlab requires apiBase", () => {
    const url = "https://gitlab.example.com/team/repo/-/tree/main/filters";
    assert.strictEqual(gitRepo.parseUrl(url), null);
    assert.strictEqual(gitRepo.parseUrl(url, "gitlab"), null);
  });

  await t.test("self-hosted gitea requires apiBase", () => {
    const url = "https://gitea.example.com/team/repo/src/branch/main/filters";
    assert.strictEqual(gitRepo.parseUrl(url), null);
    assert.strictEqual(gitRepo.parseUrl(url, "gitea"), null);
  });

  await t.test("self-hosted gitlab parses with platform and apiBase", () => {
    const parsed = gitRepo.parseUrl(
      "https://gitlab.example.com/team/repo/-/tree/main/filters",
      "gitlab",
      "https://gitlab.example.com/api/v4",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitlab",
      owner: "team",
      repo: "repo",
      branch: "main",
      path: "filters",
      apiBase: "https://gitlab.example.com/api/v4",
    });
  });

  await t.test("self-hosted gitea parses with platform and apiBase", () => {
    const parsed = gitRepo.parseUrl(
      "https://gitea.example.com/team/repo/src/branch/main/filters",
      "gitea",
      "https://gitea.example.com/api/v1",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitea",
      owner: "team",
      repo: "repo",
      branch: "main",
      path: "filters",
      apiBase: "https://gitea.example.com/api/v1",
    });
  });

  await t.test("self-hosted gitlab reverse proxy path is normalized", () => {
    const parsed = gitRepo.parseUrl(
      "https://proxy.example.com/gitlab/team/repo/-/tree/main/filters",
      "gitlab",
      "https://proxy.example.com/gitlab/api/v4",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitlab",
      owner: "team",
      repo: "repo",
      branch: "main",
      path: "filters",
      apiBase: "https://proxy.example.com/gitlab/api/v4",
    });
  });

  await t.test("self-hosted gitea reverse proxy path is normalized", () => {
    const parsed = gitRepo.parseUrl(
      "https://proxy.example.com/gitea/team/repo/src/branch/main/filters",
      "gitea",
      "https://proxy.example.com/gitea/api/v1",
    );
    assert.deepStrictEqual(parsed, {
      platform: "gitea",
      owner: "team",
      repo: "repo",
      branch: "main",
      path: "filters",
      apiBase: "https://proxy.example.com/gitea/api/v1",
    });
  });

  await t.test("reverse proxy mismatch is rejected", () => {
    const parsed = gitRepo.parseUrl(
      "https://proxy.example.com/not-gitlab/team/repo/-/tree/main/filters",
      "gitlab",
      "https://proxy.example.com/gitlab/api/v4",
    );
    assert.strictEqual(parsed, null);
  });

  await t.test("blob URLs are converted to parent folder paths", () => {
    const parsed = gitRepo.parseUrl(
      "https://github.com/org/repo/blob/main/path/to/file.txt",
    );
    assert.deepStrictEqual(parsed, {
      platform: "github",
      owner: "org",
      repo: "repo",
      branch: "main",
      path: "path/to",
    });
  });

  await t.test("query and hash do not affect parsing", () => {
    const parsed = gitRepo.parseUrl(
      "https://github.com/org/repo/tree/main/filters?tab=readme#section",
    );
    assert.deepStrictEqual(parsed, {
      platform: "github",
      owner: "org",
      repo: "repo",
      branch: "main",
      path: "filters",
    });
  });
});
