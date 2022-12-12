import { PanoData, PanoDataProvider, AbstractAdapter, Viewer } from 'photo-sphere-viewer';

/**
 * @summary Configuration of a tiled panorama
 */
type EquirectangularTilesPanorama = {
  baseUrl?: string;
  basePanoData?: PanoData | PanoDataProvider;
  width: number;
  cols: number;
  rows: number;
  tileUrl: (col: number, row: number) => string;
};

type EquirectangularTilesAdapterOptions = {
  resolution?: number,
  showErrorTile?: boolean;
  baseBlur?: boolean;
};

/**
 * @summary Adapter for tiled panoramas
 */
declare class EquirectangularTilesAdapter extends AbstractAdapter<EquirectangularTilesPanorama> {

  constructor(psv: Viewer, options: EquirectangularTilesAdapterOptions);

}

export { EquirectangularTilesAdapter, EquirectangularTilesAdapterOptions, EquirectangularTilesPanorama };
