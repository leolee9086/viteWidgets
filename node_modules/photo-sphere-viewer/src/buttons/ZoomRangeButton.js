import { EVENTS } from '../data/constants';
import { SYSTEM } from '../data/system';
import { getStyle, Slider } from '../utils';
import { AbstractButton } from './AbstractButton';

/**
 * @summary Navigation bar zoom button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class ZoomRangeButton extends AbstractButton {

  static id = 'zoomRange';
  static groupId = 'zoom';

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-zoom-range', false, false);

    /**
     * @override
     * @property {number} mediaMinWidth
     */
    this.prop = {
      ...this.prop,
      mediaMinWidth: 0,
    };

    /**
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.zoomRange = document.createElement('div');
    this.zoomRange.className = 'psv-zoom-range-line';
    this.container.appendChild(this.zoomRange);

    /**
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.zoomValue = document.createElement('div');
    this.zoomValue.className = 'psv-zoom-range-handle';
    this.zoomRange.appendChild(this.zoomValue);

    /**
     * @member {PSV.Slider}
     * @readonly
     * @private
     */
    this.slider = new Slider({
      container: this.container,
      direction: Slider.HORIZONTAL,
      onUpdate : e => this.__onSliderUpdate(e),
    });

    this.prop.mediaMinWidth = parseInt(getStyle(this.container, 'maxWidth'), 10);

    this.psv.on(EVENTS.ZOOM_UPDATED, this);
    if (this.psv.prop.ready) {
      this.__moveZoomValue(this.psv.getZoomLevel());
    }
    else {
      this.psv.once(EVENTS.READY, this);
    }

    this.refreshUi();
  }

  /**
   * @override
   */
  destroy() {
    this.slider.destroy();

    delete this.zoomRange;
    delete this.zoomValue;

    this.psv.off(EVENTS.ZOOM_UPDATED, this);
    this.psv.off(EVENTS.READY, this);

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
      // @formatter:off
      case EVENTS.ZOOM_UPDATED: this.__moveZoomValue(e.args[0]); break;
      case EVENTS.READY:        this.__moveZoomValue(this.psv.getZoomLevel()); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @override
   */
  isSupported() {
    return {
      initial: !SYSTEM.isTouchEnabled.initial,
      promise: SYSTEM.isTouchEnabled.promise.then(enabled => !enabled),
    };
  }

  /**
   * @override
   */
  refreshUi() {
    if (this.prop.supported) {
      if (this.psv.prop.size.width <= this.prop.mediaMinWidth && this.prop.visible) {
        this.hide();
      }
      else if (this.psv.prop.size.width > this.prop.mediaMinWidth && !this.prop.visible) {
        this.show();
      }
    }
  }

  /**
   * @override
   */
  onClick() {
    // nothing
  }

  /**
   * @summary Moves the zoom cursor
   * @param {number} level
   * @private
   */
  __moveZoomValue(level) {
    this.zoomValue.style.left = (level / 100 * this.zoomRange.offsetWidth - this.zoomValue.offsetWidth / 2) + 'px';
  }


  /**
   * @summary Zoom change
   * @private
   */
  __onSliderUpdate(e) {
    if (e.mousedown) {
      this.psv.zoom(e.value * 100);
    }
  }

}
