export interface Engine {
  id: string;
  name: string;
  matches: string[];
}

export type ISOString = string;

export type Minutes = number;

// #region Result
export interface ErrorResult {
  type: 'error';
  message: string;
}

export interface SuccessResult {
  type: 'success';
  timestamp: ISOString;
}

export type Result = ErrorResult | SuccessResult;
// #endregion Result

// #region Subscription
export interface Subscription {
  name: string;
  url: string;
  blacklist: string;
  updateResult: Result | null;
}

export type SubscriptionId = number;

export type Subscriptions = Record<SubscriptionId, Subscription>;
// #endregion Subscription

export interface TokenCache {
  token: string;
  expirationDate: ISOString;
}
