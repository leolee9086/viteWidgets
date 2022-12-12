import { Mesh } from 'three';
import { PanoData, PanoDataProvider, TextureData } from '../models';
import { Viewer } from '../Viewer';

/**
 * @summary Base adapters class
 * @template T type of the panorama configuration object
 */
export abstract class AbstractAdapter<T> {

  /**
   * @summary Unique identifier of the adapter
   */
  static id: string;

  /**
   * @summary Indicates if the adapter supports panorama download natively
   */
  static supportsDownload: boolean;

  /**
   * @summary Indicated if the adapter can display an additional transparent image above the panorama
   */
  static supportsOverlay: boolean;

  constructor(parent: Viewer);

  /**
   * @summary Destroys the adapter
   */
  destroy();

  /**
   * @summary Indicates if the adapter supports transitions between panoramas
   */
  supportsTransition(panorama: T): boolean;

  /**
   * @summary Indicates if the adapter supports preload of a panorama
   */
  supportsPreload(panorama: T): boolean;

  /**
   * @summary Loads the panorama texture(s)
   */
  loadTexture(panorama: T, newPanoData?: PanoData | PanoDataProvider, useXmpPanoData?: boolean): Promise<TextureData>;

  /**
   * @summary Creates the cube mesh
   * @param {number} [scale=1]
   */
  createMesh(scale?: number): Mesh;

  /**
   * @summary Applies the texture to the mesh
   */
  setTexture(mesh: Mesh, textureData: TextureData, transition?: boolean);

  /**
   * @summary Changes the opacity of the mesh
   */
  setTextureOpacity(mesh: Mesh, opacity: number);

  /**
   * @summary Cleanup a loaded texture, used on load abort
   */
  disposeTexture(textureData: TextureData);

  /**
   * @summary Applies the overlay to the mesh
   */
  setOverlay(mesh: Mesh, textureData: TextureData, opacity: number);

}

export type AdapterConstructor<T extends AbstractAdapter<any>> = new (psv: Viewer, options?: any) => T;
