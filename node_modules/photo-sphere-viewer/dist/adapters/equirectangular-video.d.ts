import { AbstractAdapter, Viewer } from 'photo-sphere-viewer';

/**
 * @summary Configuration of an equirectangular video
 */
type EquirectangularVideoPanorama = {
  source: string;
};

type EquirectangularVideoAdapterOptions = {
  autoplay?: boolean;
  muted?: boolean;
  resolution?: number;
}

/**
 * @summary Adapter for equirectangular videos
 */
declare class EquirectangularVideoAdapter extends AbstractAdapter<EquirectangularVideoPanorama> {

  constructor(psv: Viewer, options: EquirectangularVideoAdapterOptions);

}

export { EquirectangularVideoAdapter, EquirectangularVideoAdapterOptions, EquirectangularVideoPanorama };
