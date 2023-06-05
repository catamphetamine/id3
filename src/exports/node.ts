import fetch from 'node-fetch';

import {ID3Tag, parse} from '../reader/id3Tag.js';
import {Reader} from '../reader/reader.js';

import {LocalReader} from '../localReader.js';
import {RemoteReader} from '../remoteReader.js';

export {getImageDataUrl} from '../image/getImageDataUrl.js';

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
 * Parses ID3 tags from a local path
 * @param {string} path Path to file
 * @return {Promise<ID3Tag>}
 */
export async function fromPath(path: string): Promise<ID3Tag | null> {
  return fromReader(new LocalReader(path));
}

/**
 * Parses ID3 tags from a specified URL
 * @param {string} url URL to retrieve data from
 * @return {Promise<ID3Tag>}
 */
export function fromUrl(url: string): Promise<ID3Tag | null> {
  return fromReader(new RemoteReader(url, fetch));
}
