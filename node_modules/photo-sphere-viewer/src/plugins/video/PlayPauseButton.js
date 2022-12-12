import { AbstractButton } from '../..';
import { EVENTS } from './constants';
import pauseIcon from './pause.svg';
import playIcon from './play.svg';

/**
 * @summary Navigation bar video play/pause button
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class PlayPauseButton extends AbstractButton {

  static id = 'videoPlay';
  static groupId = 'video';
  static icon = playIcon;
  static iconActive = pauseIcon;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-video-play-button', true);

    /**
     * @type {PSV.plugins.VideoPlugin}
     * @private
     * @readonly
     */
    this.plugin = this.psv.getPlugin('video');

    if (this.plugin) {
      this.plugin.on(EVENTS.PLAY, this);
      this.plugin.on(EVENTS.PAUSE, this);
    }
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.plugin.off(EVENTS.PLAY, this);
      this.plugin.off(EVENTS.PAUSE, this);
    }

    delete this.plugin;

    super.destroy();
  }

  /**
   * @override
   */
  isSupported() {
    return !!this.plugin;
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      case EVENTS.PLAY:
      case EVENTS.PAUSE:
        this.toggleActive(this.plugin.isPlaying());
        break;
    }
    /* eslint-enable */
  }

  /**
   * @override
   * @description Toggles video playback
   */
  onClick() {
    this.plugin.playPause();
  }

}
