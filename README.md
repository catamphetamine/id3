## id3.js

**id3.js** is a JavaScript library for reading and parsing [ID3 tags](https://en.wikipedia.org/wiki/ID3) of MP3 files.

It could be used to get the information like:
* Title
* Author
* Album cover image
* etc

It parses both ID3v1 and ID3v2 tags.

It works both in Node.js and in web browsers.

[See Demo](https://catamphetamine.github.io/id3).

This is an enhanced [fork](https://github.com/catamphetamine/id3) of the original [`ids3js`](https://github.com/43081j/id3):

* Added `/browser` and `/node` exports.
* Added `getImageDataUrl()` exported function.
* Added a demo page.

## Install

```
$ npm install @catamphetamine/id3js --save
```

## Usage

Pick a function for the task. Each function returns a `Promise` that resolves to an object. Example:

```js
{
  "kind": "v2",
  "title": "REALiTi",
  "artist": "Grimes",
  "genre": "Dream Pop",
  "album": "REALiTi - Single",
  "year": "2015",
  "images": [
    {
      "type": "cover-front",
      "mime": "image/png",
      "description": null,
      "data": ArrayBuffer
    }
  ],
  "version": [
    3,
    0
  ],
  "encoder-settings": "Lavf52.39.0",
  "frames": [
    {
      "id": "TALB",
      "tag": "album",
      "value": "REALiTi - Single"
    },
    {
      "id": "TPE1",
      "tag": "artist",
      "value": "Grimes"
    },
    {
      "id": "TSSE",
      "tag": "encoder-settings",
      "value": "Lavf52.39.0"
    },
    {
      "id": "TCON",
      "tag": "genre",
      "value": "Dream Pop"
    },
    {
      "id": "TIT2",
      "tag": "title",
      "value": "REALiTi"
    },
    {
      "id": "APIC",
      "tag": "image",
      "value": {
        "type": "cover-front",
        "mime": "image/png",
        "description": null,
        "data": ArrayBuffer
      }
    }
  ]
}
```

### Browser

#### From File

You may parse ID3 tags of a file input:

```html
<input type="file"/>
```

```js
import { fromFile } from '@catamphetamine/id3/browser';

document
  .querySelector('input[type="file"]')
  .addEventListener('change', async (event) => {
    const file = event.currentTarget.files[0];
    const tags = await fromFile(file);
    // tags now contains v1, v2 and merged tags
  });
```

This will read the data from the `File` instance using "slices",
so the entire file is not loaded into memory but rather only the tags.

#### From Reader

You may parse ID3 tags of a [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) instance:

```js
import { fromReader } from '@catamphetamine/id3/browser';

fromReader(fileReader).then((tags) => {
  // tags now contains v1, v2 and merged tags
});
```

#### From URL

You may parse ID3 tags of a remote MP3 by URL:

```js
import { fromUrl } from '@catamphetamine/id3/browser';

fromUrl('/audio/track.mp3').then((tags) => {
  // tags now contains v1, v2 and merged tags
});
```

This works by sending a `HEAD` request for the file and, based on the response, sending subsequent `Range` requests for the ID3 tags.

This is rather efficient as there is no need for the entire file to be downloaded.

The file URL must be readable by the application:
* Either located at the same domain as the application. This is called ["same-origin" policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).
* Or located at another domain that allows external asynchronous HTTP requests via [Cross-Origin Resource Sharing](https://developer.mozilla.org/docs/Web/HTTP/CORS) (CORS).

### Browser (CDN)

This library could be `import`ed in a web browser directly from a CDN URL. The API is the same as in non-CDN usage scenario.

```html
<script type="module">
import * as id3 from '//unpkg.com/@catamphetamine/id3js@^1/lib/browser.js';

id3.fromUrl('/audio/track.mp3').then((tags) => {
  // tags now contains v1, v2 and merged tags
});
</script>
```

### Node

#### From Path

You may parse ID3 tags of a local file in Node:

```js
import { fromPath } from '@catamphetamine/id3js/node';

fromPath('./track.mp3').then((tags) => {
  // tags now contains v1, v2 and merged tags
});
```

#### From URL

You may parse ID3 tags of a remote MP3 by URL. See "From URL" subsection of the "Browser" section of this document. Use the `/node` export instead of the `/browser` one.

#### From Reader

You may parse ID3 tags of a [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) instance. See "From Reader" subsection of the "Browser" section of this document. Use the `/node` export instead of the `/browser` one.

## Images

An MP3 may have images embedded in the ID3 tags. If this is the case,
they can be accessed through the `tag.images` property and will
look like so:

```json
{
  "type": "cover-front",
  "mime": "image/jpeg",
  "description": null,
  "data": ArrayBuffer
}
```

As you can see, the binary image `data` is provided as an `ArrayBuffer`.
To access it, you may use a `DataView` or typed array such
as `Uint8Array`.

If using the binary image `data` is not your case, you could get a base64-encoded "data URL" of the image using the exported `getImageDataUrl()` function:

```js
// Import from `/browser` or from `/node`.
import getImageDataUrl from '@catamphetamine/id3js/browser';
// import getImageDataUrl from '@catamphetamine/id3js/node';

// Get the album cover:
const dataUrl = await getImageDataUrl(tags)

// If there're several images embedded in the audio file:
let i = 0
while (i < tags.images.length) {
  const dataUrl = await getImageDataUrl(tags, i)
  i++
}
```

The result of the function is either `null`, if the image doesn't exist, or a URL like `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...` that could be rendered using a standard HTML image tag:

```html
<img src={dataUrl}/>
```

## Errors

It's recommended to wrap these functions' calls in a `try`/`catch` block to prevent your application from crashing if the library encounters an error while parsing an audio file.

```js
import { fromFile } from '@catamphetamine/id3js/browser'

export default async function getAudioFileInfoFromId3Tags(file) {
  try {
    const tags = await fromFile(file)
    // tags now contains v1, v2 and merged tags
    return tags
  } catch (error) {
    // They say it might crash on some *.mp3 files
    // https://github.com/43081j/id3/pull/19
    // Catch the error so that it doesn't crash the app
    // because ID3 tags aren't essential to the app's operation.
    console.error(error)
    return {}
  }
}
```

## License

MIT
