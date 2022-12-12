import { KEY_CODES } from '../data/constants';
import { SYSTEM } from '../data/system';
import arrow from '../icons/arrow.svg';
import { PressHandler } from '../utils/PressHandler';
import { AbstractButton } from './AbstractButton';

export function getOrientedArrow(direction) {
  let angle = 0;
  switch (direction) {
    // @formatter:off
    case 'up': angle = 90; break;
    case 'right': angle = 180; break;
    case 'down': angle = -90; break;
    default: angle = 0; break;
    // @formatter:on
  }

  return arrow.replace('rotate(0', `rotate(${angle}`);
}

/**
 * @summary Navigation bar move button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class AbstractMoveButton extends AbstractButton {

  static groupId = 'move';

  /**
   * @param {PSV.components.Navbar} navbar
   * @param {number} value
   */
  constructor(navbar, value) {
    super(navbar, 'psv-button--hover-scale psv-move-button');

    this.container.title = this.psv.config.lang.move;

    /**
     * @override
     * @property {{longitude: boolean, latitude: boolean}} value
     * @property {PressHandler} handler
     */
    this.prop = {
      ...this.prop,
      value  : value,
      handler: new PressHandler(),
    };

    this.container.addEventListener('mousedown', this);
    this.container.addEventListener('keydown', this);
    this.container.addEventListener('keyup', this);
    this.psv.container.addEventListener('mouseup', this);
    this.psv.container.addEventListener('touchend', this);
  }

  /**
   * @override
   */
  destroy() {
    this.__onMouseUp();

    this.psv.container.removeEventListener('mouseup', this);
    this.psv.container.removeEventListener('touchend', this);

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
      case 'mousedown': this.__onMouseDown(); break;
      case 'mouseup':   this.__onMouseUp(); break;
      case 'touchend':  this.__onMouseUp(); break;
      case 'keydown':   e.key === KEY_CODES.Enter && this.__onMouseDown(); break;
      case 'keyup':     e.key === KEY_CODES.Enter && this.__onMouseUp(); break;
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
  onClick() {
    // nothing
  }

  /**
   * @private
   */
  __onMouseDown() {
    if (!this.prop.enabled) {
      return;
    }

    this.psv.__stopAll();
    this.psv.dynamics.position.roll(this.prop.value);
    this.prop.handler.down();
  }

  /**
   * @private
   */
  __onMouseUp() {
    if (!this.prop.enabled) {
      return;
    }

    this.prop.handler.up(() => {
      this.psv.dynamics.position.stop();
      this.psv.resetIdleTimer();
    });
  }

}
