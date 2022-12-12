import { AbstractAdapter, Viewer } from '../..';

/**
 * @summary Configuration of an equirectangular video
 */
export type EquirectangularVideoPanorama = {
  source: string;
};

export type EquirectangularVideoAdapterOptions = {
  autoplay?: boolean;
  muted?: boolean;
  resolution?: number;
}

/**
 * @summary Adapter for equirectangular videos
 */
export class EquirectangularVideoAdapter extends AbstractAdapter<EquirectangularVideoPanorama> {

  constructor(psv: Viewer, options: EquirectangularVideoAdapterOptions);

}
