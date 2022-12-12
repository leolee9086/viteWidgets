import { AbstractPlugin, Viewer } from 'photo-sphere-viewer';
import { Event } from 'uevent';

declare const EVENTS: {
  STEREO_UPDATED: 'stereo-updated',
};

/**
 * @summary Adds stereo view on mobile devices
 */
declare class StereoPlugin extends AbstractPlugin {

  static EVENTS: typeof EVENTS;

  constructor(psv: Viewer);

  /**
   * @summary Checks if the stereo view is enabled
   */
  isEnabled(): boolean;

  /**
   * @summary Enables the stereo view
   * @throws {PSVError} if the gyroscope API is not available/granted
   */
  start(): Promise<void>;

  /**
   * @summary Disables the stereo view
   */
  stop();

  /**
   * @summary Enables or disables the stereo view
   */
  toggle();

  /**
   * @summary Triggered when the stereo view is enabled/disabled
   */
  on(e: 'stereo-updated', cb: (e: Event, enabled: boolean) => void): this;

}

export { EVENTS, StereoPlugin };
