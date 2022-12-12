import { AbstractPlugin, Viewer } from '../..';
import { Event } from 'uevent';

export const EVENTS: {
  STEREO_UPDATED: 'stereo-updated',
};

/**
 * @summary Adds stereo view on mobile devices
 */
export class StereoPlugin extends AbstractPlugin {

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
