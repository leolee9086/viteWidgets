/**
 * @summary Available events
 * @enum {string}
 * @memberof PSV.plugins.StereoPlugin
 * @constant
 */
export const EVENTS = {
  /**
   * @event stereo-updated
   * @memberof PSV.plugins.StereoPlugin
   * @summary Triggered when the stereo view is enabled/disabled
   * @param {boolean} enabled
   */
  STEREO_UPDATED: 'stereo-updated',
};

/**
 * @type {string}
 * @constant
 * @private
 */
export const ID_OVERLAY_PLEASE_ROTATE = 'pleaseRotate';
