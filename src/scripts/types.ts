import type dayjs from 'dayjs';

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
  messageNames: { sync: string; syncDescription: string; syncTurnedOn: string };
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
export type SearchEngineId = 'google' | 'duckduckgo' | 'startpage';

export type ControlHandler = {
  createControl(): HTMLElement | null;
  adjustControl?: (control: HTMLElement) => void;
};

export type EntryHandler = {
  getEntry(addedElement: HTMLElement): HTMLElement | null;
  getURL(entry: HTMLElement): string | null;
  createAction(entry: HTMLElement): HTMLElement | null;
  adjustEntry?(entry: HTMLElement): void;
};

export type SearchEngineHandlers = {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  getAddedElements?(): HTMLElement[];
  getSilentlyAddedElements?(addedElement: HTMLElement): HTMLElement[];
};

export type SearchEngine = {
  matches: string[];
  messageNames: { name: string };
  style: string;
  getHandlers(url: string, mobile: boolean): SearchEngineHandlers | null;
};

export type SearchEngines = Record<SearchEngineId, SearchEngine>;
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
