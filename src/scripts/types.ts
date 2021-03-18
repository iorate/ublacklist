import type dayjs from 'dayjs';
import type { MessageName0 } from '../common/locales';

export type { MessageName, MessageName0, MessageName1 } from '../common/locales';
export type { SearchEngineId } from '../common/search-engines';

// #region Result
export type ErrorResult = {
  type: 'error';
  message: string;
};

export type SuccessResult = {
  type: 'success';
  timestamp: string;
};

export type Result = ErrorResult | SuccessResult;
// #endregion Result

// #region Clouds
export type CloudId = 'googleDrive' | 'dropbox';

export type Cloud = {
  hostPermissions: string[];
  messageNames: { sync: MessageName0; syncDescription: MessageName0; syncTurnedOn: MessageName0 };
  modifiedTimePrecision: 'millisecond' | 'second';

  authorize(): Promise<{ authorizationCode: string }>;
  getAccessToken(
    authorizationCode: string,
  ): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;

  createFile(accessToken: string, content: string, modifiedTime: dayjs.Dayjs): Promise<void>;
  findFile(accessToken: string): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null>;
  readFile(accessToken: string, id: string): Promise<{ content: string }>;
  writeFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
};

export type Clouds = Record<CloudId, Cloud>;

export type CloudToken = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
};
// #endregion Clouds

// #region SearchEngines
export type SerpControl = {
  scope: string;
  root: HTMLElement;
  onRender?: () => void;
};

export type SerpEntry = {
  scope: string;
  root: HTMLElement;
  url: string;
  actionRoot: HTMLElement;
  onActionRender?: () => void;
};

export type SerpHandlerResult = {
  controls: SerpControl[];
  entries: SerpEntry[];
};

export type DialogTheme = 'light' | 'dark';

export type SerpHandler = {
  onSerpStart: () => SerpHandlerResult;
  onSerpHead: () => SerpHandlerResult;
  onSerpElement: (element: HTMLElement) => SerpHandlerResult;
  getDialogTheme: () => DialogTheme;
};
// #endregion SearchEngines

// #region Subscriptions
export type SubscriptionId = number;

export type Subscription = {
  name: string;
  url: string;
  blacklist: string;
  updateResult: Result | null;
};

export type Subscriptions = Record<SubscriptionId, Subscription>;
// #endregion Subscriptions
