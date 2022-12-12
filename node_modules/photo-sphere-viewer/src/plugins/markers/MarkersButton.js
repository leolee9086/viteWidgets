import { AbstractButton } from '../..';
import { EVENTS } from './constants';
import pin from './pin.svg';

/**
 * @summary Navigation bar markers button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class MarkersButton extends AbstractButton {

  static id = 'markers';
  static icon = pin;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-markers-button', true);

    /**
     * @type {PSV.plugins.MarkersPlugin}
     */
    this.plugin = this.psv.getPlugin('markers');

    if (this.plugin) {
      this.plugin.on(EVENTS.SHOW_MARKERS, this);
      this.plugin.on(EVENTS.HIDE_MARKERS, this);

      this.toggleActive(true);
    }

    this.hide();
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.plugin.off(EVENTS.SHOW_MARKERS, this);
      this.plugin.off(EVENTS.HIDE_MARKERS, this);
    }

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
      // @formatter:off
      case EVENTS.SHOW_MARKERS: this.toggleActive(true); break;
      case EVENTS.HIDE_MARKERS: this.toggleActive(false); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @override
   * @description Toggles markers
   */
  onClick() {
    if (this.plugin.prop.visible) {
      this.plugin.hide();
    }
    else {
      this.plugin.show();
    }
  }

}
