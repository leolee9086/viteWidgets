import { EventEmitter } from 'uevent';

/**
 * @summary Helper to make sliders elements
 * @memberOf PSV.utils
 */
export class Slider extends EventEmitter {

  static VERTICAL = 1;
  static HORIZONTAL = 2;

  /**
   * @type {boolean}
   * @readonly
   */
  get vertical() {
    return this.prop.direction === Slider.VERTICAL;
  }

  constructor({ psv, container, direction, onUpdate }) {
    super();

    /**
     * @summary Reference to main controller
     * @type {PSV.Viewer}
     * @readonly
     */
    this.psv = psv;

    /**
     * @member {HTMLElement}
     * @readonly
     */
    this.container = container;

    /**
     * @summary Internal properties
     * @member {Object}
     * @protected
     * @property {boolean} mousedown
     * @property {number} mediaMinWidth
     */
    this.prop = {
      onUpdate : onUpdate,
      direction: direction,
      mousedown: false,
      mouseover: false,
    };

    this.container.addEventListener('click', this);
    this.container.addEventListener('mousedown', this);
    this.container.addEventListener('mouseenter', this);
    this.container.addEventListener('mouseleave', this);
    this.container.addEventListener('touchstart', this);
    this.container.addEventListener('mousemove', this, true);
    this.container.addEventListener('touchmove', this, true);
    window.addEventListener('mouseup', this);
    window.addEventListener('touchend', this);
  }

  /**
   * @protected
   */
  destroy() {
    window.removeEventListener('mouseup', this);
    window.removeEventListener('touchend', this);
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
      case 'click':      e.stopPropagation();    break;
      case 'mousedown':  this.__onMouseDown(e);  break;
      case 'mouseenter': this.__onMouseEnter(e); break;
      case 'mouseleave': this.__onMouseLeave(e); break;
      case 'touchstart': this.__onTouchStart(e); break;
      case 'mousemove':  this.__onMouseMove(e);  break;
      case 'touchmove':  this.__onTouchMove(e);  break;
      case 'mouseup':    this.__onMouseUp(e);    break;
      case 'touchend':   this.__onTouchEnd(e);   break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @private
   */
  __onMouseDown(evt) {
    this.prop.mousedown = true;
    this.__update(evt, true);
  }

  /**
   * @private
   */
  __onMouseEnter(evt) {
    this.prop.mouseover = true;
    this.__update(evt, true);
  }

  /**
   * @private
   */
  __onTouchStart(evt) {
    this.prop.mouseover = true;
    this.prop.mousedown = true;
    this.__update(evt.changedTouches[0], true);
  }

  /**
   * @private
   */
  __onMouseMove(evt) {
    if (this.prop.mousedown || this.prop.mouseover) {
      evt.stopPropagation();
      this.__update(evt, true);
    }
  }

  /**
   * @private
   */
  __onTouchMove(evt) {
    if (this.prop.mousedown || this.prop.mouseover) {
      evt.stopPropagation();
      this.__update(evt.changedTouches[0], true);
    }
  }

  /**
   * @private
   */
  __onMouseUp(evt) {
    if (this.prop.mousedown) {
      this.prop.mousedown = false;
      this.__update(evt, false);
    }
  }

  /**
   * @private
   */
  __onMouseLeave(evt) {
    if (this.prop.mouseover) {
      this.prop.mouseover = false;
      this.__update(evt, true);
    }
  }

  /**
   * @private
   */
  __onTouchEnd(evt) {
    if (this.prop.mousedown) {
      this.prop.mouseover = false;
      this.prop.mousedown = false;
      this.__update(evt.changedTouches[0], false);
    }
  }

  /**
   * @private
   */
  __update(evt, moving) {
    const boundingClientRect = this.container.getBoundingClientRect();
    const cursor = evt[this.vertical ? 'clientY' : 'clientX'];
    const pos = boundingClientRect[this.vertical ? 'bottom' : 'left'];
    const size = boundingClientRect[this.vertical ? 'height' : 'width'];
    const val = Math.abs((pos - cursor) / size);

    this.prop.onUpdate({
      value    : val,
      click    : !moving,
      mousedown: this.prop.mousedown,
      mouseover: this.prop.mouseover,
      cursor   : evt,
    });
  }

}
