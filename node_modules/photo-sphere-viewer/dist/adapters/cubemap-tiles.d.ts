import { AbstractAdapter, Viewer } from 'photo-sphere-viewer';
import { CubemapArray, Cubemap } from 'photo-sphere-viewer/dist/adapters/cubemap';

/**
 * @summary Configuration of a tiled cubemap
 */
type CubemapTilesPanorama = {
  baseUrl?: CubemapArray | Cubemap;
  faceSize: number;
  nbTiles: number;
  tileUrl: (face: keyof Cubemap, col: number, row: number) => string;
};

type CubemapTilesAdapterOptions = {
  flipTopBottom?: boolean;
  showErrorTile?: boolean;
  baseBlur?: boolean;
}

/**
 * @summary Adapter for tiled cubemaps
 */
declare class CubemapTilesAdapter extends AbstractAdapter<CubemapTilesPanorama> {

  constructor(psv: Viewer, options: CubemapTilesAdapterOptions);

}

export { CubemapTilesAdapter, CubemapTilesAdapterOptions, CubemapTilesPanorama };
