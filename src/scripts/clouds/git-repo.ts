import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc.js";
import { z } from "zod";
import type { GitRepoParams, GitRepoPlatform } from "../types.ts";
import { HTTPError, UnexpectedResponse } from "../utilities.ts";

dayjs.extend(dayjsUTC);

// Base64 encoding/decoding with proper UTF-8 support
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

function decodeBase64(base64: string): string {
  const binString = atob(base64);
  const bytes = Uint8Array.from(
    binString,
    (char) => char.codePointAt(0) as number,
  );
  return new TextDecoder().decode(bytes);
}

// Platform configurations
const platformConfigs: Record<
  GitRepoPlatform,
  {
    name: string;
    defaultApiBase: string;
    createMethod: "POST" | "PUT";
    updateMethod: "PUT";
    // API path patterns
    getContentsPath: (
      owner: string,
      repo: string,
      path: string,
      branch: string,
    ) => string;
    createFilePath: (owner: string, repo: string, path: string) => string;
    updateFilePath: (owner: string, repo: string, path: string) => string;
    // Request body builders
    buildCreateBody: (
      content: string,
      message: string,
      branch: string,
    ) => Record<string, unknown>;
    buildUpdateBody: (
      content: string,
      message: string,
      branch: string,
      sha: string,
    ) => Record<string, unknown>;
    // Response parsers
    parseFileResponse: (data: unknown) => { sha: string };
    // URL parser for auto-detection
    parseUrl: (
      url: string,
    ) => { owner: string; repo: string; branch: string; path: string } | null;
  }
> = {
  github: {
    name: "GitHub",
    defaultApiBase: "https://api.github.com",
    createMethod: "PUT",
    updateMethod: "PUT",
    getContentsPath: (owner, repo, path, branch) =>
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    createFilePath: (owner, repo, path) =>
      `/repos/${owner}/${repo}/contents/${path}`,
    updateFilePath: (owner, repo, path) =>
      `/repos/${owner}/${repo}/contents/${path}`,
    buildCreateBody: (content, message, branch) => ({
      message,
      content: encodeBase64(content),
      branch,
    }),
    buildUpdateBody: (content, message, branch, sha) => ({
      message,
      content: encodeBase64(content),
      branch,
      sha,
    }),
    parseFileResponse: (data) => {
      const parsed = z
        .object({
          sha: z.string(),
        })
        .safeParse(data);
      if (!parsed.success) {
        throw new UnexpectedResponse(data);
      }
      return { sha: parsed.data.sha };
    },
    parseUrl: (url) => {
      // https://github.com/owner/repo/tree/branch/path/to/folder
      // https://github.com/owner/repo/blob/branch/path/to/file
      const match = url.match(
        /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/([^/]+)(?:\/(.*))?)?$/,
      );
      if (!match) {
        return null;
      }
      return {
        owner: match[1] ?? "",
        repo: match[2] ?? "",
        branch: match[3] ?? "main",
        path: match[4] ?? "",
      };
    },
  },
  gitlab: {
    name: "GitLab",
    defaultApiBase: "https://gitlab.com",
    createMethod: "POST",
    updateMethod: "PUT",
    getContentsPath: (owner, repo, path, branch) =>
      `/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/files/${encodeURIComponent(path)}?ref=${branch}`,
    createFilePath: (owner, repo, path) =>
      `/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/files/${encodeURIComponent(path)}`,
    updateFilePath: (owner, repo, path) =>
      `/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/files/${encodeURIComponent(path)}`,
    buildCreateBody: (content, message, branch) => ({
      commit_message: message,
      content: encodeBase64(content),
      branch,
      encoding: "base64",
    }),
    buildUpdateBody: (content, message, branch, _sha) => ({
      commit_message: message,
      content: encodeBase64(content),
      branch,
      encoding: "base64",
    }),
    parseFileResponse: (data) => {
      const parsed = z
        .object({
          blob_id: z.string(),
          last_commit_id: z.string(),
        })
        .safeParse(data);
      if (!parsed.success) {
        throw new UnexpectedResponse(data);
      }
      return { sha: parsed.data.blob_id };
    },
    parseUrl: (url) => {
      // https://gitlab.com/owner/repo/-/tree/branch/path
      // https://gitlab.com/owner/repo/-/blob/branch/path
      const match = url.match(
        /^(https?:\/\/[^/]+)\/([^/]+)\/([^/]+)(?:\/-\/(?:tree|blob)\/([^/]+)(?:\/(.*))?)?$/,
      );
      if (!match) {
        return null;
      }
      return {
        owner: match[2] ?? "",
        repo: match[3] ?? "",
        branch: match[4] ?? "main",
        path: match[5] ?? "",
      };
    },
  },
  codeberg: {
    name: "Codeberg",
    defaultApiBase: "https://codeberg.org",
    createMethod: "POST",
    updateMethod: "PUT",
    getContentsPath: (owner, repo, path, branch) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    createFilePath: (owner, repo, path) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}`,
    updateFilePath: (owner, repo, path) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}`,
    buildCreateBody: (content, message, branch) => ({
      message,
      content: encodeBase64(content),
      branch,
    }),
    buildUpdateBody: (content, message, branch, sha) => ({
      message,
      content: encodeBase64(content),
      branch,
      sha,
    }),
    parseFileResponse: (data) => {
      const parsed = z
        .object({
          sha: z.string(),
        })
        .safeParse(data);
      if (!parsed.success) {
        throw new UnexpectedResponse(data);
      }
      return { sha: parsed.data.sha };
    },
    parseUrl: (url) => {
      // https://codeberg.org/owner/repo/src/branch/branch-name/path
      const match = url.match(
        /^https?:\/\/codeberg\.org\/([^/]+)\/([^/]+)(?:\/src\/branch\/([^/]+)(?:\/(.*))?)?$/,
      );
      if (!match) {
        return null;
      }
      return {
        owner: match[1] ?? "",
        repo: match[2] ?? "",
        branch: match[3] ?? "main",
        path: match[4] ?? "",
      };
    },
  },
  gitea: {
    name: "Gitea",
    defaultApiBase: "", // Must be provided by user
    createMethod: "POST",
    updateMethod: "PUT",
    getContentsPath: (owner, repo, path, branch) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    createFilePath: (owner, repo, path) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}`,
    updateFilePath: (owner, repo, path) =>
      `/api/v1/repos/${owner}/${repo}/contents/${path}`,
    buildCreateBody: (content, message, branch) => ({
      message,
      content: encodeBase64(content),
      branch,
    }),
    buildUpdateBody: (content, message, branch, sha) => ({
      message,
      content: encodeBase64(content),
      branch,
      sha,
    }),
    parseFileResponse: (data) => {
      const parsed = z
        .object({
          sha: z.string(),
        })
        .safeParse(data);
      if (!parsed.success) {
        throw new UnexpectedResponse(data);
      }
      return { sha: parsed.data.sha };
    },
    parseUrl: (url) => {
      // https://gitea.example.com/owner/repo/src/branch/branch-name/path
      const match = url.match(
        /^(https?:\/\/[^/]+)\/([^/]+)\/([^/]+)(?:\/src\/branch\/([^/]+)(?:\/(.*))?)?$/,
      );
      if (!match) {
        return null;
      }
      return {
        owner: match[2] ?? "",
        repo: match[3] ?? "",
        branch: match[4] ?? "main",
        path: match[5] ?? "",
      };
    },
  },
};

function getFullPath(basePath: string, filename: string): string {
  const cleanBase = basePath.replace(/^\/+|\/+$/g, "");
  return cleanBase ? `${cleanBase}/${filename}` : filename;
}

function stripKnownApiSuffix(platform: GitRepoPlatform, base: string): string {
  const cleanBase = base.replace(/\/+$/, "");
  switch (platform) {
    case "gitlab":
      return cleanBase.replace(/\/api(?:\/v4)?$/, "");
    case "gitea":
      return cleanBase.replace(/\/api(?:\/v1)?$/, "");
    default:
      return cleanBase;
  }
}

function getApiBase(params: GitRepoParams): string {
  if (params.apiBase) {
    return stripKnownApiSuffix(params.platform, params.apiBase);
  }
  return platformConfigs[params.platform].defaultApiBase;
}

function getWebBaseFromApiBaseForParsing(
  platform: GitRepoPlatform,
  apiBase: string,
): string {
  return stripKnownApiSuffix(platform, apiBase);
}

function stripReverseProxyPrefixFromFolderUrl(
  url: string,
  platform: GitRepoPlatform,
  apiBase?: string,
): string {
  if (!apiBase) {
    return url;
  }
  if (platform !== "gitlab" && platform !== "gitea") {
    return url;
  }

  try {
    const folderUrl = new URL(url);
    const webBaseUrl = new URL(
      getWebBaseFromApiBaseForParsing(platform, apiBase),
    );
    const prefixPath = webBaseUrl.pathname.replace(/\/+$/, "");

    // Only apply when apiBase implies reverse proxy path prefix
    if (!prefixPath) {
      return url;
    }
    if (folderUrl.origin !== webBaseUrl.origin) {
      return url;
    }

    const hasPrefix =
      folderUrl.pathname === prefixPath ||
      folderUrl.pathname.startsWith(`${prefixPath}/`);
    if (!hasPrefix) {
      return url;
    }

    const strippedPath = folderUrl.pathname.slice(prefixPath.length) || "/";
    const normalized = new URL(folderUrl.toString());
    normalized.pathname = strippedPath.startsWith("/")
      ? strippedPath
      : `/${strippedPath}`;
    return normalized.toString();
  } catch {
    return url;
  }
}

function isGiteaDotComUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "gitea.com" || hostname === "www.gitea.com";
  } catch {
    return false;
  }
}

function isGitLabDotComUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "gitlab.com" || hostname === "www.gitlab.com";
  } catch {
    return false;
  }
}

function normalizeSelfHostedFolderUrl(
  url: string,
  platform: "gitlab" | "gitea",
  apiBase: string,
): string | null {
  try {
    const folderUrl = new URL(url);
    const webBaseUrl = new URL(
      getWebBaseFromApiBaseForParsing(platform, apiBase),
    );
    if (folderUrl.origin !== webBaseUrl.origin) {
      return null;
    }

    const prefixPath = webBaseUrl.pathname.replace(/\/+$/, "");
    if (prefixPath) {
      const hasPrefix =
        folderUrl.pathname === prefixPath ||
        folderUrl.pathname.startsWith(`${prefixPath}/`);
      if (!hasPrefix) {
        return null;
      }
    }

    return stripReverseProxyPrefixFromFolderUrl(url, platform, apiBase);
  } catch {
    return null;
  }
}

type ParsedRepoUrl = {
  platform: GitRepoPlatform;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  apiBase?: string | undefined;
};

function shouldUseHostedParsing(
  platform: GitRepoPlatform,
  url: string,
): boolean {
  switch (platform) {
    case "gitlab":
      return isGitLabDotComUrl(url);
    case "gitea":
      return isGiteaDotComUrl(url);
    default:
      return true;
  }
}

function normalizeUrlForPlatformParsing(
  url: string,
  platform: GitRepoPlatform,
  apiBase?: string,
): string | null {
  // For github/codeberg, platform regex is already strict by host.
  if (platform !== "gitlab" && platform !== "gitea") {
    return url;
  }

  // Official hosted domains are always parseable without extra config.
  if (shouldUseHostedParsing(platform, url)) {
    return url;
  }

  // Self-hosted gitlab/gitea must provide apiBase so we can:
  // 1) validate origin, and 2) normalize reverse-proxy path prefixes.
  if (!apiBase) {
    return null;
  }

  return normalizeSelfHostedFolderUrl(url, platform, apiBase);
}

function resolveParsedApiBase(
  url: string,
  platform: GitRepoPlatform,
  apiBase?: string,
): string | undefined {
  if (platform !== "gitlab" && platform !== "gitea") {
    return undefined;
  }
  return apiBase || url.match(/^(https?:\/\/[^/]+)/)?.[1];
}

function parseUrlWithPlatform(
  url: string,
  isBlobUrl: boolean,
  platform: GitRepoPlatform,
  apiBase?: string,
): ParsedRepoUrl | null {
  const normalizedUrl = normalizeUrlForPlatformParsing(url, platform, apiBase);
  if (!normalizedUrl) {
    return null;
  }

  const result = platformConfigs[platform].parseUrl(normalizedUrl);
  if (!result) {
    return null;
  }

  const normalizedPath =
    isBlobUrl && result.path
      ? result.path.replace(/\/[^/]+$/, "")
      : result.path;
  const resolvedApiBase = resolveParsedApiBase(url, platform, apiBase);
  return {
    platform,
    owner: result.owner,
    repo: result.repo,
    branch: result.branch,
    path: normalizedPath,
    ...(resolvedApiBase ? { apiBase: resolvedApiBase } : {}),
  };
}

function shouldTryInAutodetect(
  platform: GitRepoPlatform,
  url: string,
): boolean {
  // In autodetect mode:
  // - github/codeberg are always safe to try (strict host patterns)
  // - gitlab/gitea are restricted to official hosted domains
  //   to avoid false positives on arbitrary self-hosted servers.
  if (platform === "gitlab") {
    return isGitLabDotComUrl(url);
  }
  if (platform === "gitea") {
    return isGiteaDotComUrl(url);
  }
  return true;
}

function getRepoWebBase(params: GitRepoParams): string {
  const apiBase = getApiBase(params);
  switch (params.platform) {
    case "github":
      return "https://github.com";
    case "gitlab":
      return apiBase.replace(/\/api\/v4\/?$/, "");
    case "gitea":
    case "codeberg":
      return apiBase;
  }
}

function getBranchSettingsUrl(params: GitRepoParams): string {
  const webBase = getRepoWebBase(params);
  switch (params.platform) {
    case "github":
      return `${webBase}/${params.owner}/${params.repo}/branches`;
    case "gitlab":
      return `${webBase}/${params.owner}/${params.repo}/-/branches`;
    case "gitea":
    case "codeberg":
      return `${webBase}/${params.owner}/${params.repo}/branches`;
  }
}

function getErrorMessageFromText(errorText: string): string {
  try {
    const parsed = JSON.parse(errorText) as {
      message?: string;
      error?: string;
    };
    if (typeof parsed.message === "string") {
      return parsed.message;
    }
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
    // Ignore JSON parse failures and use raw text
  }
  return errorText;
}

function parseGitHubConflictExpectedSha(errorText: string): string | null {
  const message = getErrorMessageFromText(errorText);
  const match = message.match(/does not match\s+([a-f0-9]{40})/i);
  return match?.[1] ?? null;
}

function isWriteConflictError(
  params: GitRepoParams,
  status: number,
  errorText: string,
): boolean {
  if (status === 409 || status === 422) {
    return true;
  }
  if (params.platform !== "gitlab" || status !== 400) {
    return false;
  }
  const message = getErrorMessageFromText(errorText).toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("has changed") ||
    message.includes("updated the branch") ||
    message.includes("conflict")
  );
}

function isBranchNotFoundError(status: number, errorText: string): boolean {
  if (status !== 404) {
    return false;
  }
  const msg = getErrorMessageFromText(errorText).toLowerCase();
  return msg.includes("branch") && msg.includes("not found");
}

function createHTTPError(
  params: GitRepoParams,
  response: Response,
  errorText: string,
): HTTPError {
  const detail = `${response.statusText}: ${errorText}`;
  if (isBranchNotFoundError(response.status, errorText)) {
    const branchUrl = getBranchSettingsUrl(params);
    return new HTTPError(
      response.status,
      `${detail}\n\nBranch "${params.branch}" does not exist. Please create it manually: ${branchUrl}`,
    );
  }
  return new HTTPError(response.status, detail);
}

function getAuthHeader(params: GitRepoParams): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  switch (params.platform) {
    case "github":
      headers.Authorization = `Bearer ${params.token}`;
      headers["X-GitHub-Api-Version"] = "2022-11-28";
      break;
    case "gitea":
    case "codeberg":
      headers.Authorization = `token ${params.token}`;
      break;
    case "gitlab":
      headers["PRIVATE-TOKEN"] = params.token;
      break;
  }

  return headers;
}

async function makeRequest(
  params: GitRepoParams,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const apiBase = getApiBase(params);
  const url = `${apiBase}${path}`;
  const headers = getAuthHeader(params);

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }
  return fetch(url, fetchOptions);
}

type FileMetadata = {
  sha: string;
  modifiedTime: string;
  commitSha?: string;
};

// File metadata cache to store SHA for updates
const fileMetadataCache = new Map<string, FileMetadata>();

function getCacheKey(params: GitRepoParams, filename: string): string {
  return `${params.platform}:${params.owner}/${params.repo}:${params.branch}:${getFullPath(params.path, filename)}`;
}

export const gitRepo = {
  /**
   * Parse a URL to extract repository information
   */
  parseUrl(
    url: string,
    platform?: GitRepoPlatform,
    apiBase?: string,
  ): ParsedRepoUrl | null {
    // Normalize user input first: query/hash are irrelevant for repo parsing.
    url = url.replace(/[?#].*$/, "");

    // Blob URLs point to a file. Autofill expects a folder path, so we later
    // trim the filename and keep only the parent directory.
    const isBlob = /\/blob\//.test(url);

    if (platform) {
      // Preferred platform first. This supports self-hosted gitlab/gitea
      // when apiBase is explicitly provided by the user.
      const preferred = parseUrlWithPlatform(url, isBlob, platform, apiBase);
      if (preferred) {
        return preferred;
      }
    }

    // Fallback autodetect: allows platform switching via autofill.
    for (const platformKey of Object.keys(
      platformConfigs,
    ) as GitRepoPlatform[]) {
      if (!shouldTryInAutodetect(platformKey, url)) {
        continue;
      }
      const parsed = parseUrlWithPlatform(url, isBlob, platformKey);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  },

  /**
   * Verify connection to the repository
   */
  async verifyConnection(params: GitRepoParams): Promise<void> {
    const config = platformConfigs[params.platform];
    const testPath = config.getContentsPath(
      params.owner,
      params.repo,
      params.path || ".",
      params.branch,
    );

    const response = await makeRequest(params, "GET", testPath);

    // 404 is acceptable for missing path, but not for missing branch
    if (response.status === 404) {
      const errorText = await response.text();
      if (isBranchNotFoundError(response.status, errorText)) {
        throw createHTTPError(params, response, errorText);
      }
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw createHTTPError(params, response, errorText);
    }
  },

  /**
   * Find a file in the repository
   */
  async findFile(
    params: GitRepoParams,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const config = platformConfigs[params.platform];
    const fullPath = getFullPath(params.path, filename);
    const apiPath = config.getContentsPath(
      params.owner,
      params.repo,
      fullPath,
      params.branch,
    );

    const response = await makeRequest(params, "GET", apiPath);

    if (response.status === 404) {
      const errorText = await response.text();
      if (isBranchNotFoundError(response.status, errorText)) {
        throw createHTTPError(params, response, errorText);
      }
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw createHTTPError(params, response, errorText);
    }

    const data: unknown = await response.json();
    const { sha } = config.parseFileResponse(data);
    const modifiedTime = dayjs.utc(0).toISOString();

    // Cache the SHA for later updates
    const cacheKey = getCacheKey(params, filename);
    fileMetadataCache.set(cacheKey, { sha, modifiedTime });

    return {
      id: filename,
      modifiedTime: dayjs.utc(modifiedTime),
    };
  },

  /**
   * Read a file from the repository
   */
  async readFile(
    params: GitRepoParams,
    id: string,
  ): Promise<{ content: string }> {
    const config = platformConfigs[params.platform];
    const fullPath = getFullPath(params.path, id);
    const apiPath = config.getContentsPath(
      params.owner,
      params.repo,
      fullPath,
      params.branch,
    );

    const response = await makeRequest(params, "GET", apiPath);

    if (!response.ok) {
      const errorText = await response.text();
      throw createHTTPError(params, response, errorText);
    }

    const data: unknown = await response.json();

    // Handle different response formats
    if (params.platform === "gitlab") {
      const parsed = z.object({ content: z.string() }).safeParse(data);
      if (!parsed.success) {
        throw new UnexpectedResponse(data);
      }
      return { content: decodeBase64(parsed.data.content) };
    }

    // GitHub, Gitea, Codeberg format
    const parsed = z
      .object({
        content: z.string(),
        encoding: z.string().optional(),
        sha: z.string(),
      })
      .safeParse(data);

    if (!parsed.success) {
      throw new UnexpectedResponse(data);
    }

    // Update cache with latest SHA
    const cacheKey = getCacheKey(params, id);
    fileMetadataCache.set(cacheKey, {
      sha: parsed.data.sha,
      modifiedTime: dayjs().toISOString(),
    });

    // Content is base64 encoded
    const content =
      parsed.data.encoding === "base64"
        ? decodeBase64(parsed.data.content.replace(/\n/g, ""))
        : parsed.data.content;

    return { content };
  },

  /**
   * Write a file to the repository (create or update)
   */
  async writeFile(
    params: GitRepoParams,
    id: string,
    content: string,
    _modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const config = platformConfigs[params.platform];
    const fullPath = getFullPath(params.path, id);
    const cacheKey = getCacheKey(params, id);
    const cached = fileMetadataCache.get(cacheKey);
    const updatePath = config.updateFilePath(
      params.owner,
      params.repo,
      fullPath,
    );
    const createPath = config.createFilePath(
      params.owner,
      params.repo,
      fullPath,
    );
    const attemptedShas = new Set<string>();

    const createOrOverwrite = async (sha: string | null): Promise<Response> => {
      if (sha) {
        attemptedShas.add(sha);
        const updateBody = config.buildUpdateBody(
          content,
          `Update ${id} via uBlacklist`,
          params.branch,
          sha,
        );
        return makeRequest(params, config.updateMethod, updatePath, updateBody);
      }
      const createBody = config.buildCreateBody(
        content,
        `Create ${id} via uBlacklist`,
        params.branch,
      );
      return makeRequest(params, config.createMethod, createPath, createBody);
    };

    const getLatestShaForOverwrite = async (
      conflictErrorText: string,
    ): Promise<string | null> => {
      let latestSha: string | null = null;

      if (params.platform === "github") {
        latestSha = parseGitHubConflictExpectedSha(conflictErrorText);
        if (latestSha) {
          const currentCached = fileMetadataCache.get(cacheKey);
          fileMetadataCache.set(cacheKey, {
            sha: latestSha,
            modifiedTime: currentCached?.modifiedTime ?? dayjs().toISOString(),
            ...(currentCached?.commitSha
              ? { commitSha: currentCached.commitSha }
              : {}),
          });
        }
      }

      if (latestSha && !attemptedShas.has(latestSha)) {
        return latestSha;
      }

      const latestFile = await this.findFile(params, id);
      if (!latestFile) {
        return null;
      }
      const latestCached = fileMetadataCache.get(cacheKey);
      return latestCached?.sha ?? null;
    };

    let lastAttemptSha = cached?.sha ?? null;
    if (!lastAttemptSha) {
      const latestFile = await this.findFile(params, id);
      if (latestFile) {
        const latestCached = fileMetadataCache.get(cacheKey);
        lastAttemptSha = latestCached?.sha ?? null;
      }
    }
    let response = await createOrOverwrite(lastAttemptSha);
    const MAX_CONFLICT_RETRIES = 3;

    for (
      let attempt = 0;
      attempt < MAX_CONFLICT_RETRIES && !response.ok;
      attempt++
    ) {
      const conflictErrorText = await response.clone().text();
      if (!isWriteConflictError(params, response.status, conflictErrorText)) {
        break;
      }

      const latestSha = await getLatestShaForOverwrite(conflictErrorText);
      if (latestSha) {
        if (attemptedShas.has(latestSha)) {
          break;
        }
        lastAttemptSha = latestSha;
        response = await createOrOverwrite(latestSha);
        continue;
      }

      lastAttemptSha = null;
      response = await createOrOverwrite(null);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw createHTTPError(params, response, errorText);
    }

    // Update cache with new SHA from response
    try {
      const data: unknown = await response.json();
      if (
        params.platform === "github" ||
        params.platform === "gitea" ||
        params.platform === "codeberg"
      ) {
        const parsed = z
          .object({
            content: z.object({ sha: z.string() }),
            commit: z
              .object({
                sha: z.string().optional(),
                committer: z.object({ date: z.string() }).optional(),
                author: z.object({ date: z.string() }).optional(),
              })
              .optional(),
          })
          .safeParse(data);
        if (parsed.success) {
          const commitSha = parsed.data.commit?.sha;
          const commitDate =
            parsed.data.commit?.committer?.date ??
            parsed.data.commit?.author?.date;
          const commitDateDayjs = commitDate ? dayjs.utc(commitDate) : null;
          const modifiedTime =
            commitDateDayjs?.isValid() === true
              ? commitDateDayjs.toISOString()
              : dayjs().toISOString();
          fileMetadataCache.set(cacheKey, {
            sha: parsed.data.content.sha,
            modifiedTime,
            ...(commitSha ? { commitSha } : {}),
          });
        }
      }
    } catch {
      // Response might not be JSON, ignore
    }
  },

  /**
   * Get supported platforms
   */
  getPlatforms(): Array<{ id: GitRepoPlatform; name: string }> {
    return Object.entries(platformConfigs).map(([id, config]) => ({
      id: id as GitRepoPlatform,
      name: config.name,
    }));
  },

  async listFileHashes(
    params: GitRepoParams,
    filenames: string[],
  ): Promise<Record<string, string>> {
    const config = platformConfigs[params.platform];
    const hashes: Record<string, string> = {};
    const filenameSet = new Set(filenames);

    if (params.platform === "gitlab") {
      for (const filename of filenameSet) {
        const fullPath = getFullPath(params.path, filename);
        const apiPath = config.getContentsPath(
          params.owner,
          params.repo,
          fullPath,
          params.branch,
        );
        const response = await makeRequest(params, "GET", apiPath);

        if (response.status === 404) {
          const errorText = await response.text();
          if (isBranchNotFoundError(response.status, errorText)) {
            throw createHTTPError(params, response, errorText);
          }
          const cacheKey = getCacheKey(params, filename);
          fileMetadataCache.delete(cacheKey);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw createHTTPError(params, response, errorText);
        }

        const data: unknown = await response.json();
        const { sha } = config.parseFileResponse(data);
        hashes[filename] = sha;

        const cacheKey = getCacheKey(params, filename);
        const cached = fileMetadataCache.get(cacheKey);
        fileMetadataCache.set(cacheKey, {
          sha,
          modifiedTime: cached?.modifiedTime ?? dayjs().toISOString(),
          ...(cached?.commitSha ? { commitSha: cached.commitSha } : {}),
        });
      }

      return hashes;
    }

    const cleanPath = params.path.replace(/^\/+|\/+$/g, "");
    const contentsPath =
      params.platform === "github"
        ? cleanPath
          ? `/repos/${params.owner}/${params.repo}/contents/${cleanPath}?ref=${params.branch}`
          : `/repos/${params.owner}/${params.repo}/contents?ref=${params.branch}`
        : config.getContentsPath(
            params.owner,
            params.repo,
            cleanPath || ".",
            params.branch,
          );
    const response = await makeRequest(params, "GET", contentsPath);

    if (response.status === 404) {
      const errorText = await response.text();
      if (isBranchNotFoundError(response.status, errorText)) {
        throw createHTTPError(params, response, errorText);
      }
      return {};
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw createHTTPError(params, response, errorText);
    }

    const data: unknown = await response.json();

    const entries = Array.isArray(data) ? data : [data];
    for (const entry of entries) {
      const parsed = z
        .object({
          type: z.string(),
          name: z.string(),
          sha: z.string(),
        })
        .safeParse(entry);
      if (!parsed.success) {
        continue;
      }
      if (parsed.data.type !== "file") {
        continue;
      }
      if (!filenameSet.has(parsed.data.name)) {
        continue;
      }
      hashes[parsed.data.name] = parsed.data.sha;
      const cacheKey = getCacheKey(params, parsed.data.name);
      const cached = fileMetadataCache.get(cacheKey);
      fileMetadataCache.set(cacheKey, {
        sha: parsed.data.sha,
        modifiedTime: cached?.modifiedTime ?? dayjs().toISOString(),
        ...(cached?.commitSha ? { commitSha: cached.commitSha } : {}),
      });
    }

    for (const filename of filenameSet) {
      if (hashes[filename] == null) {
        const cacheKey = getCacheKey(params, filename);
        fileMetadataCache.delete(cacheKey);
      }
    }

    return hashes;
  },
};
