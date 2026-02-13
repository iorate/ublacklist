import type dayjs from "dayjs";
import type { RulesetMatches } from "./interactive-ruleset.ts";
import type {
  SerpInfoSettings,
  Serializable as SerpInfoSettingsSerializable,
} from "./serpinfo/settings.ts";

export type {
  MessageName,
  MessageName0,
  MessageName1,
} from "../common/message-names.generated.ts";
// #region Result
export type ErrorResult = {
  type: "error";
  message: string;
};

export type SuccessResult = {
  type: "success";
  timestamp: string;
};

export type Result = ErrorResult | SuccessResult;
// #endregion Result

// #region Clouds
export type CloudId = "googleDrive" | "dropbox";
export type SyncBackendId = CloudId | "webdav" | "browserSync" | "gitRepo";

export type Cloud = {
  hostPermissions: string[];
  modifiedTimePrecision: "millisecond" | "second";
  shouldUseAltFlow(os: string): boolean;
  authorize(useAltFlow: boolean): Promise<{ authorizationCode: string }>;
  getAccessToken(
    authorizationCode: string,
    useAltFlow: boolean,
  ): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }>;
  refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }>;
  createFile(
    accessToken: string,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
  findFile(
    accessToken: string,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null>;
  readFile(accessToken: string, id: string): Promise<{ content: string }>;
  updateFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
};

export type CloudToken = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
};

export type WebDAV = {
  ensureWebDAVFolder(params: WebDAVParams): Promise<void>;
  findFile(
    params: WebDAVParams,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null>;
  readFile(params: WebDAVParams, id: string): Promise<{ content: string }>;
  writeFile(
    params: WebDAVParams,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
};

export type WebDAVParams = {
  url: string;
  username: string;
  password: string;
  path: string;
};

export type GitRepoPlatform = "github" | "gitlab" | "codeberg" | "gitea";

export type GitRepoParams = {
  platform: GitRepoPlatform;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
  apiBase?: string;
};
// #endregion Clouds

// #region LocalStorage
export type PlainRuleset = {
  metadata: Record<string, unknown>;
  rules: string;
  frontMatterUnclosed?: boolean;
};

export type LocalStorageItems = {
  // ruleset
  ruleset: PlainRuleset | false;
  blacklist: string;
  compiledRules: string | false;

  // general
  skipBlockDialog: boolean;
  hideBlockLinks: boolean;
  hideControl: boolean;
  enablePathDepth: boolean;
  enableMatchingRules: boolean;
  blockWholeSite: boolean;

  // appearance
  linkColor: string;
  blockColor: string;
  highlightColors: string[];
  dialogTheme: DialogTheme | "default";

  // sync
  syncCloudId: SyncBackendId | false | null;
  syncBlocklist: boolean;
  syncGeneral: boolean;
  syncAppearance: boolean;
  syncSubscriptions: boolean;
  syncSerpInfo: boolean;
  syncResult: Result | false | null;
  syncInterval: number;

  // subscriptions
  subscriptions: Subscriptions;
  updateInterval: number;

  // serpinfo
  serpInfoSettings: SerpInfoSettings;
};

export type LocalStorageItemsFor<
  T extends readonly (keyof LocalStorageItems)[],
> = {
  [Key in T[number]]: LocalStorageItems[Key];
};

export type LocalStorageItemsSavable = Omit<
  LocalStorageItems,
  | "ruleset"
  | "compiledRules"
  | "syncCloudId"
  | "syncResult"
  | "subscriptions"
  | "serpInfoSettings"
>;

export type SaveSource = "content-script" | "popup" | "options" | "background";

export type LocalStorageItemsBackupRestore = Pick<
  LocalStorageItems,
  | "blacklist"
  | "blockWholeSite"
  | "skipBlockDialog"
  | "hideBlockLinks"
  | "hideControl"
  | "enablePathDepth"
  | "enableMatchingRules"
  | "linkColor"
  | "blockColor"
  | "highlightColors"
  | "dialogTheme"
  | "syncBlocklist"
  | "syncGeneral"
  | "syncAppearance"
  | "syncSubscriptions"
  | "syncSerpInfo"
  | "syncInterval"
  | "updateInterval"
> & {
  subscriptions: readonly { name: string; url: string; enabled: boolean }[];
  serpInfoSettings: SerpInfoSettingsSerializable;
};
// #endregion LocalStorage

export type DialogTheme = "light" | "dark";

// #region Subscriptions
export type SubscriptionId = number;

export type Subscription = {
  name: string;
  url: string;
  ruleset?: PlainRuleset;
  blacklist: string;
  compiledRules?: string;
  updateResult: Result | false | null;
  enabled?: boolean;
};

export type Subscriptions = Record<SubscriptionId, Subscription>;
// #endregion Subscriptions

// #region MatchingRules
export type MatchingRuleKind = keyof Omit<RulesetMatches, "rulesetName">;

export type MatchingRulesText = Record<MatchingRuleKind, string>;
// #endregion MatchingRules
