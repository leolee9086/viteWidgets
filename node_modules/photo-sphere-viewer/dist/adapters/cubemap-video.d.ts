import { AbstractAdapter, Viewer } from 'photo-sphere-viewer';

/**
 * @summary Configuration of a cubemap video
 */
type CubemapVideoPanorama = {
  source: string;
};

type CubemapVideoAdapterOptions = {
  autoplay?: boolean;
  muted?: boolean;
  equiangular?: boolean;
}

/**
 * @summary Adapter for cubemap videos
 */
declare class CubemapVideoAdapter extends AbstractAdapter<CubemapVideoPanorama> {

  constructor(psv: Viewer, options: CubemapVideoAdapterOptions);

}

export { CubemapVideoAdapter, CubemapVideoAdapterOptions, CubemapVideoPanorama };
