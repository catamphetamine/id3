/**
 * @param {Blob} blob Blob to read
 * @param {string} [options.contentType] Content Type
 * @return {Promise<string>}
 */
export default function getBlobDataUrl(
  blob: Blob,
  {contentType}: {contentType?: string | null} = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('error', reject);
    fileReader.addEventListener('abort', reject);

    fileReader.addEventListener('load', () => { // (event: Event) => {
      // Works around TypeScript error: "Object is possibly 'null'".
      // if (event.target === null) {
      //   return reject(new Error('No data'));
      // }
      // Works around TypeScript error: "Property 'result' does not exist
      // on type 'EventTarget'".
      // https://stackoverflow.com/questions/35789498/new-typescript-1-8-4-build-error-build-property-result-does-not-exist-on-t.
      // let dataUrl = event.target.result;
      if (fileReader.result === null) {
        // Shouldn't be possible.
        return reject(new Error('No data'));
      }
      let dataUrl = fileReader.result as string;
      if (dataUrl !== null) {
        if (contentType) {
          dataUrl = dataUrl.replace('application/octet-stream', contentType);
        }
      }
      resolve(dataUrl);
    });

    fileReader.readAsDataURL(blob);
  });
}
