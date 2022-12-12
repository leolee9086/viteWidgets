import { AbstractButton } from '../..';
import { EVENTS } from './constants';
import stereo from './stereo.svg';

/**
 * @summary Navigation bar stereo button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class StereoButton extends AbstractButton {

  static id = 'stereo';
  static icon = stereo;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-stereo-button', true);

    /**
     * @type {PSV.plugins.StereoPlugin}
     * @private
     * @readonly
     */
    this.plugin = this.psv.getPlugin('stereo');

    if (this.plugin) {
      this.plugin.on(EVENTS.STEREO_UPDATED, this);
    }
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.plugin.off(EVENTS.STEREO_UPDATED, this);
    }

    delete this.plugin;

    super.destroy();
  }

  /**
   * @override
   */
  isSupported() {
    return !this.plugin ? false : { initial: false, promise: this.plugin.prop.isSupported };
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    if (e.type === EVENTS.STEREO_UPDATED) {
      this.toggleActive(e.args[0]);
    }
  }

  /**
   * @override
   * @description Toggles stereo control
   */
  onClick() {
    this.plugin.toggle();
  }

}
