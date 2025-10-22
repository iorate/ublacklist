import type dayjs from "dayjs";
import type { WebDAVClient } from "webdav";
import type { MessageName0 } from "../common/message-names.generated.ts";
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
export type CloudId = "googleDrive" | "dropbox" | "webdav";

export type SyncCloud = {
  type: string;
  hostPermissions: string[];
  messageNames: {
    sync: MessageName0;
    syncDescription: MessageName0;
    syncTurnedOn: MessageName0;
  };
  modifiedTimePrecision: "millisecond" | "second";
  requiredParams: Array<{
    key: string;
    label: MessageName0;
    type: "text" | "password" | "url";
    required?: boolean;
    placeholder?: string;
    default?: string;
  }>;
};

export type OAuthCloud = SyncCloud & {
  type: "oauth";
  shouldUseAltFlow(os: string): boolean;
  authorize(params: {
    useAltFlow: boolean;
  }): Promise<{ authorizationCode: string }>;
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
  writeFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
};

export type OAuthCloudToken = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
};

export type BaseTokenCloudParams = {
  url: string;
  username: string;
  password: string;
};

export type TokenCloud<
  TokenCloudParams extends BaseTokenCloudParams = BaseTokenCloudParams,
> = SyncCloud & {
  type: "token";
  authorize(params: TokenCloudParams): Promise<void>;
  // No getAccessToken/refreshAccessToken for token clouds
  createFile(
    credentials: TokenCloudParams,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
  findFile(
    credentials: TokenCloudParams,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null>;
  readFile(
    credentials: TokenCloudParams,
    id: string,
  ): Promise<{ content: string }>;
  writeFile(
    credentials: TokenCloudParams,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
};

export type TokenCloudWebDAVParams = BaseTokenCloudParams & { path: string };
export type TokenCloudWebDAV = TokenCloud<TokenCloudWebDAVParams> & {
  getInstance(params: TokenCloudWebDAVParams): WebDAVClient;
  ensureWebDAVFolder(params: TokenCloudWebDAVParams): Promise<void>;
};

export type Cloud = OAuthCloud | TokenCloud;
export type Clouds = Record<CloudId, Cloud>;

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
  syncCloudId: CloudId | false | null;
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
