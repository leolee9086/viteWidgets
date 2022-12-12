import { MathUtils } from 'three';
import { PSVError } from '../PSVError';
import { loop } from './math';

/**
 * @summary Represents a variable that can dynamically change with time (using requestAnimationFrame)
 * @memberOf PSV.utils
 */
export class Dynamic {

  static STOP = 0;
  static INFINITE = 1;
  static POSITION = 2;

  /**
   * @param {Function} [fn] Callback function
   * @param {number} [defaultValue] Default position
   * @param {number} [min] Minimum position
   * @param {number} [max] Maximum position
   * @param {boolean} [loopValue] Loop value between min and max
   */
  constructor(fn, defaultValue = 0, min = -Infinity, max = Infinity, loopValue = false) {
    /**
     * @type {Function}
     * @private
     * @readonly
     */
    this.fn = fn;

    /**
     * @type {number}
     * @private
     */
    this.mode = Dynamic.STOP;

    /**
     * @type {number}
     * @private
     */
    this.speed = 0;

    /**
     * @type {number}
     * @private
     */
    this.speedMult = 1;

    /**
     * @type {number}
     * @private
     */
    this.currentSpeed = 0;

    /**
     * @type {number}
     * @private
     */
    this.target = 0;

    /**
     * @type {number}
     * @readonly
     */
    this.current = defaultValue;

    /**
     * @type {number}
     * @private
     */
    this.min = min;

    /**
     * @type {number}
     * @private
     */
    this.max = max;

    /**
     * @type {boolean}
     * @private
     */
    this.loopValue = loopValue;

    if (loopValue && min !== 0) {
      throw new PSVError('invalid config');
    }

    if (this.fn) {
      this.fn(defaultValue);
    }
  }

  /**
   * Changes base speed
   * @param {number} speed
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * Defines the target position
   * @param {number} position
   * @param {number} [speedMult=1]
   */
  goto(position, speedMult = 1) {
    this.mode = Dynamic.POSITION;
    this.target = this.loopValue ? loop(position, this.max) : MathUtils.clamp(position, this.min, this.max);
    this.speedMult = speedMult;
  }

  /**
   * Increase/decrease the target position
   * @param {number} step
   * @param {number} [speedMult=1]
   */
  step(step, speedMult = 1) {
    if (this.mode !== Dynamic.POSITION) {
      this.target = this.current;
    }
    this.goto(this.target + step, speedMult);
  }

  /**
   * Starts infinite movement
   * @param {boolean} [invert=false]
   * @param {number} [speedMult=1]
   */
  roll(invert = false, speedMult = 1) {
    this.mode = Dynamic.INFINITE;
    this.target = invert ? -Infinity : Infinity;
    this.speedMult = speedMult;
  }

  /**
   * Stops movement
   */
  stop() {
    this.mode = Dynamic.STOP;
  }

  /**
   * Defines the current position and immediately stops movement
   * @param {number} value
   */
  setValue(value) {
    this.target = this.loopValue ? loop(value, this.max) : MathUtils.clamp(value, this.min, this.max);
    this.mode = Dynamic.STOP;
    if (this.target !== this.current) {
      this.current = this.target;
      if (this.fn) {
        this.fn(this.current);
      }
      return true;
    }
    return false;
  }

  /**
   * @package
   */
  update(elapsed) {
    // in position mode switch to stop mode when in the decceleration window
    if (this.mode === Dynamic.POSITION) {
      // in loop mode, alter "current" to avoid crossing the origin
      if (this.loopValue && Math.abs(this.target - this.current) > this.max / 2) {
        this.current = this.current < this.target ? this.current + this.max : this.current - this.max;
      }

      const dstStop = this.currentSpeed * this.currentSpeed / (this.speed * this.speedMult * 4);
      if (Math.abs(this.target - this.current) <= dstStop) {
        this.mode = Dynamic.STOP;
      }
    }

    // compute speed
    let targetSpeed = this.mode === Dynamic.STOP ? 0 : this.speed * this.speedMult;
    if (this.target < this.current) {
      targetSpeed = -targetSpeed;
    }
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(targetSpeed, this.currentSpeed + elapsed / 1000 * this.speed * this.speedMult * 2);
    }
    else if (this.currentSpeed > targetSpeed) {
      this.currentSpeed = Math.max(targetSpeed, this.currentSpeed - elapsed / 1000 * this.speed * this.speedMult * 2);
    }

    // compute new position
    let next = null;
    if (this.current > this.target && this.currentSpeed) {
      next = Math.max(this.target, this.current + this.currentSpeed * elapsed / 1000);
    }
    else if (this.current < this.target && this.currentSpeed) {
      next = Math.min(this.target, this.current + this.currentSpeed * elapsed / 1000);
    }

    // apply value
    if (next !== null) {
      next = this.loopValue ? loop(next, this.max) : MathUtils.clamp(next, this.min, this.max);
      if (next !== this.current) {
        this.current = next;
        if (this.fn) {
          this.fn(this.current);
        }
        return true;
      }
    }

    return false;
  }

}
