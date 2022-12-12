import { AbstractPlugin, ExtendedPosition, Viewer } from '../..';

export type CompassPluginOptions = {
  size?: string;
  position?: string;
  backgroundSvg?: string;
  coneColor?: string;
  navigation?: boolean;
  navigationColor?: string;
  hotspots?: CompassPluginHotspot[];
  hotspotColor?: string;
};

export type CompassPluginHotspot = ExtendedPosition & {
  color?: string;
};

/**
 * @summary Adds a compass on the viewer
 */
export class CompassPlugin extends AbstractPlugin {

  constructor(psv: Viewer, options: CompassPluginOptions);

  /**
   * @summary Hides the compass
   */
  hide();

  /**
   * @summary Shows the compass
   */
  show();

  /**
   * @summary Changes the hotspots on the compass
   */
  setHotspots(hotspots);

  /**
   * @summary Removes all hotspots
   */
  clearHotspots();

}
