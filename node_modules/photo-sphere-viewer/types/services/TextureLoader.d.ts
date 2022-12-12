/**
 * @summary Texture loader
 */
export class TextureLoader {

  /**
   * @summary Cancels current HTTP requests
   */
  abortLoading();

  /**
   * @summary Loads a Blob with FileLoader
   */
  loadFile(url: string, onProgress?: (number) => void): Promise<Blob>;

  /**
   * @summary Loads an Image using FileLoader to have progress events
   */
  loadImage(url: string, onProgress?: (number) => void): Promise<HTMLImageElement>;

  /**
   * @summary Preload a panorama file without displaying it
   */
  preloadPanorama(panorama: any): Promise<void>;

}
