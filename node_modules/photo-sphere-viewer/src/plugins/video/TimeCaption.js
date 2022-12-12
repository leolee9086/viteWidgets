import { AbstractComponent, CONSTANTS } from '../..';
import { EVENTS } from './constants';
import { formatTime } from './utils';

/**
 * @summary Navigation bar video time display
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class TimeCaption extends AbstractComponent {

  static id = 'videoTime';
  static groupId = 'video';

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-caption psv-video-time');

    /**
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.content = document.createElement('div');
    this.content.className = 'psv-caption-content';
    this.container.appendChild(this.content);

    /**
     * @type {PSV.plugins.VideoPlugin}
     * @private
     * @readonly
     */
    this.plugin = this.psv.getPlugin('video');

    if (this.plugin) {
      this.psv.on(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
      this.plugin.on(EVENTS.PROGRESS, this);
    }
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.psv.off(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
      this.plugin.off(EVENTS.PROGRESS, this);
    }

    delete this.plugin;

    super.destroy();
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      case CONSTANTS.EVENTS.PANORAMA_LOADED:
      case EVENTS.PROGRESS:
        this.content.innerHTML = `<strong>${formatTime(this.plugin.getTime())}</strong> / ${formatTime(this.plugin.getDuration())}`;
        break;
    }
    /* eslint-enable */
  }

}
