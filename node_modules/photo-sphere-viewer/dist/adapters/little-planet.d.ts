import { AbstractAdapter, Viewer } from 'photo-sphere-viewer';

/**
 * @summary Adapter for equirectangular panoramas displayed with little planet effect
 */
declare class LittlePlanetAdapter extends AbstractAdapter<string> {

  constructor(psv: Viewer);

}

export { LittlePlanetAdapter };
