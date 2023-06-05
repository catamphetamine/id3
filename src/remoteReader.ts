import {Reader} from './reader/reader.js';

interface FetchResponse {
  arrayBuffer: () => Promise<ArrayBuffer>;
  headers: FetchResponseHeaders;
}

interface FetchResponseHeaders {
  get: (name: string) => string | null;
}

interface FetchOptions {
  method: 'GET' | 'HEAD';
  headers?: Record<string, string>;
}

type Fetch = (url: string, options: FetchOptions) => Promise<FetchResponse>;

/**
 * Reads a remote URL
 */
export class RemoteReader extends Reader {
  protected _url: string;
  protected _fetch: Fetch;

  /**
   * @param {string} url URL to retrieve
   * @param {function} fetch fetch() function implementation
   */
  public constructor(url: string, fetch: Fetch) {
    super();

    this._url = url;
    this._fetch = fetch;
  }

  /** @inheritdoc */
  public async open(): Promise<void> {
    const resp = await this._fetch(this._url, {
      method: 'HEAD'
    });

    const contentLength = resp.headers.get('Content-Length');

    this.size = contentLength ? Number(contentLength) : 0;
  }

  /** @inheritdoc */
  public async read(length: number, position: number): Promise<ArrayBuffer> {
    const resp = await this._fetch(this._url, {
      method: 'GET',
      headers: {
        Range: `bytes=${position}-${position + length - 1}`
      }
    });

    return await resp.arrayBuffer();
  }
}
