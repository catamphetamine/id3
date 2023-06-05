import {ID3Tag, ID3TagV2} from '../reader/id3Tag.js';

import getBlobDataUrl from './getBlobDataUrl.js';

/**
 * @param {ID3Tag} tags ID3 tags
 * @param {number} [index] Image index
 * @return {Promise<string | null>}
 */
export function getImageDataUrl(
  tags: ID3Tag,
  index: number = 0
): Promise<string | null> {
  if (instanceOfID3TagV2(tags)) {
    // const image: ImageValue = tags.images[index];
    const image = tags.images[index];
    if (image && image.data) {
      return getBlobDataUrl(new Blob([image.data]), {contentType: image.mime});
    }
  }
  return Promise.resolve(null);
}

/**
 * @param {ID3Tag} tags ID3 tags
 * @return {boolean}
 */
function instanceOfID3TagV2(tags: ID3Tag): tags is ID3TagV2 {
  return 'images' in tags;
}
