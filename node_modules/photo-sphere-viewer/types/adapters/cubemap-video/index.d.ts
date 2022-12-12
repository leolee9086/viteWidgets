import { AbstractAdapter, Viewer } from '../..';

/**
 * @summary Configuration of a cubemap video
 */
export type CubemapVideoPanorama = {
  source: string;
};

export type CubemapVideoAdapterOptions = {
  autoplay?: boolean;
  muted?: boolean;
  equiangular?: boolean;
}

/**
 * @summary Adapter for cubemap videos
 */
export class CubemapVideoAdapter extends AbstractAdapter<CubemapVideoPanorama> {

  constructor(psv: Viewer, options: CubemapVideoAdapterOptions);

}
