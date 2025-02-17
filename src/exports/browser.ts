import {ID3Tag, parse} from '../reader/id3Tag.js';
import {Reader} from '../reader/reader.js';

import {BrowserFileReader} from '../browserFileReader.js';
import {RemoteReader} from '../remoteReader.js';

export {getImageDataUrl} from '../image/getImageDataUrl.js';

const SUPPORTS_FILE =
  typeof window !== 'undefined' &&
  'File' in window &&
  'FileReader' in window &&
  typeof ArrayBuffer !== 'undefined';

/**
 * Parses ID3 tags from a given reader
 * @param {Reader} reader Reader to use
 * @return {Promise<ID3Tag>}
 */
export async function fromReader(reader: Reader): Promise<ID3Tag | null> {
  await reader.open();

  const tags = await parse(reader);

  await reader.close();

  return tags;
}

/**
 * Parses ID3 tags from a specified URL
 * @param {string} url URL to retrieve data from
 * @return {Promise<ID3Tag>}
 */
export function fromUrl(url: string): Promise<ID3Tag | null> {
  return fromReader(new RemoteReader(url, fetch));
}

/**
 * Parses ID3 tags from a File instance
 * @param {File} file File to parse
 * @return {Promise<ID3Tag>}
 */
export function fromFile(file: File | Blob): Promise<ID3Tag | null> {
  if (!SUPPORTS_FILE) {
    throw new Error(
      'Browser does not have support for the File API and/or ' + 'ArrayBuffers'
    );
  }

  return fromReader(new BrowserFileReader(file));
}
