export const EVENTS = {
  /**
   * @event play
   * @memberof PSV.plugins.VideoPlugin
   * @summary Triggered when the video starts playing
   */
  PLAY         : 'play',
  /**
   * @event pause
   * @memberof PSV.plugins.VideoPlugin
   * @summary Triggered when the video is paused
   */
  PAUSE        : 'pause',
  /**
   * @event volume-change
   * @memberof PSV.plugins.VideoPlugin
   * @summary Triggered when the video volume changes
   * @param {number} volume
   */
  VOLUME_CHANGE: 'volume-change',
  /**
   * @event progress
   * @memberof PSV.plugins.VideoPlugin
   * @summary Triggered when the video play progression changes
   * @param {{time: number, duration: number, progress: number}} data
   */
  PROGRESS     : 'progress',
  /**
   * @event buffer
   * @memberof PSV.plugins.VideoPlugin
   * @summary Triggered when the video buffer changes
   * @param {number} maxBuffer
   */
  BUFFER       : 'buffer',
};
