import { AbstractButton } from '../..';
import compass from './compass.svg';
import { EVENTS } from './constants';

/**
 * @summary Navigation bar gyroscope button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class GyroscopeButton extends AbstractButton {

  static id = 'gyroscope';
  static icon = compass;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-gyroscope-button', true);

    /**
     * @type {PSV.plugins.GyroscopePlugin}
     * @readonly
     * @private
     */
    this.plugin = this.psv.getPlugin('gyroscope');

    if (this.plugin) {
      this.plugin.on(EVENTS.GYROSCOPE_UPDATED, this);
    }
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.plugin.off(EVENTS.GYROSCOPE_UPDATED, this);
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
    if (e.type === EVENTS.GYROSCOPE_UPDATED) {
      this.toggleActive(e.args[0]);
    }
  }

  /**
   * @override
   * @description Toggles gyroscope control
   */
  onClick() {
    this.plugin.toggle();
  }

}
