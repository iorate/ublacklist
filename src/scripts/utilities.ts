export class AltURL {
  scheme: string;
  host: string;
  path: string;

  constructor(url: string) {
    const u = new URL(url);
    this.scheme = u.protocol.slice(0, -1);
    this.host = u.hostname;
    this.path = `${u.pathname}${u.search}`;
  }

  toString(): string {
    return `${this.scheme}://${this.host}${this.path}`;
  }
}

const enum SchemeMatch {
  Any,
  Exact,
}

const enum HostMatch {
  Any,
  Partial,
  Exact,
}

const enum PathMatch {
  Any,
  PartialOrExact,
}

export class MatchPattern {
  private schemeMatch: SchemeMatch;
  private scheme?: string;
  private hostMatch: HostMatch;
  private host?: string;
  private pathMatch: PathMatch;
  private path?: RegExp;

  constructor(mp: string) {
    const m = /^(\*|https?|ftp):\/\/(\*|(?:\*\.)?[^/*]+)(\/.*)$/.exec(mp);
    if (!m) {
      throw new Error('Invalid match pattern');
    }
    const [, scheme, host, path] = m;
    if (scheme === '*') {
      this.schemeMatch = SchemeMatch.Any;
    } else {
      this.schemeMatch = SchemeMatch.Exact;
      this.scheme = scheme;
    }
    if (host === '*') {
      this.hostMatch = HostMatch.Any;
    } else if (host.startsWith('*.')) {
      this.hostMatch = HostMatch.Partial;
      this.host = host.slice(2);
    } else {
      this.hostMatch = HostMatch.Exact;
      this.host = host;
    }
    if (path === '/*') {
      this.pathMatch = PathMatch.Any;
    } else {
      this.pathMatch = PathMatch.PartialOrExact;
      this.path = new RegExp(
        `^${path.replace(/[$^\\.+?()[\]{}|]/g, '\\$&').replace(/\*/g, '.*')}$`,
      );
    }
  }

  test(url: AltURL): boolean {
    if (this.hostMatch === HostMatch.Partial) {
      if (url.host !== this.host! && !url.host.endsWith(`.${this.host!}`)) {
        return false;
      }
    } else if (this.hostMatch === HostMatch.Exact) {
      if (url.host !== this.host!) {
        return false;
      }
    }
    if (this.schemeMatch === SchemeMatch.Any) {
      if (url.scheme !== 'http' && url.scheme !== 'https') {
        return false;
      }
    } else {
      if (url.scheme !== this.scheme!) {
        return false;
      }
    }
    if (this.pathMatch === PathMatch.PartialOrExact) {
      if (!this.path!.test(url.path)) {
        return false;
      }
    }
    return true;
  }
}

export class Mutex {
  private queue: (() => Promise<void>)[] = [];

  lock<T>(func: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await Promise.resolve(func()));
        } catch (e) {
          reject(e);
        }
      });
      if (this.queue.length === 1) {
        this.dequeue();
      }
    });
  }

  private async dequeue(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }
    await this.queue[0]();
    this.queue.shift();
    this.dequeue();
  }
}
