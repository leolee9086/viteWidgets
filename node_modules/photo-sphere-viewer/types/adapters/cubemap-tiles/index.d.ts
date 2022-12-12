import { AbstractAdapter, Viewer } from '../..';
import { Cubemap, CubemapArray } from '../cubemap';

/**
 * @summary Configuration of a tiled cubemap
 */
export type CubemapTilesPanorama = {
  baseUrl?: CubemapArray | Cubemap;
  faceSize: number;
  nbTiles: number;
  tileUrl: (face: keyof Cubemap, col: number, row: number) => string;
};

export type CubemapTilesAdapterOptions = {
  flipTopBottom?: boolean;
  showErrorTile?: boolean;
  baseBlur?: boolean;
}

/**
 * @summary Adapter for tiled cubemaps
 */
export class CubemapTilesAdapter extends AbstractAdapter<CubemapTilesPanorama> {

  constructor(psv: Viewer, options: CubemapTilesAdapterOptions);

}
