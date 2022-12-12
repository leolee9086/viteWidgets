import { AbstractAdapter, Viewer } from '../..';

export type EquirectangularAdapterOptions = {
  resolution?: number,
};

/**
 * @summary Adapter for equirectangular panoramas
 */
export class EquirectangularAdapter extends AbstractAdapter<string> {

  constructor(psv: Viewer, options: EquirectangularAdapterOptions);

}
