import { AbstractAdapter, Viewer } from 'photo-sphere-viewer';

/**
 * @summary Cubemap defined as an array of images
 * @description images order is : left, front, right, back, top, bottom
 */
type CubemapArray = string[6];

/**
 * @summary Object defining a cubemap
 */
type Cubemap = {
  left: string;
  front: string;
  right: string;
  back: string;
  top: string;
  bottom: string;
};

type CubemapAdapterOptions = {
  flipTopBottom?: boolean;
};

/**
 * @summary Adapter for cubemaps
 */
declare class CubemapAdapter extends AbstractAdapter<CubemapArray | Cubemap> {

  constructor(psv: Viewer, options: CubemapAdapterOptions);

}

export { Cubemap, CubemapAdapter, CubemapAdapterOptions, CubemapArray };
