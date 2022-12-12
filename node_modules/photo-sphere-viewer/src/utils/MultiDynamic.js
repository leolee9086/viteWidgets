import { each } from './misc';

/**
 * @summary Wrapper for multiple {@link PSV.utils.Dynamic} evolving together
 * @memberOf PSV.utils
 */
export class MultiDynamic {

  /**
   * @type {Object<string, number>}
   * @readonly
   */
  get current() {
    const values = {};
    each(this.dynamics, (dynamic, name) => {
      values[name] = dynamic.current;
    });
    return values;
  }

  /**
   * @param {Record<string, PSV.utils.Dynamic>} dynamics
   * @param {Function} [fn] Callback function
   */
  constructor(dynamics, fn) {
    /**
     * @type {Function}
     * @private
     * @readonly
     */
    this.fn = fn;

    /**
     * @type {Record<string, PSV.utils.Dynamic>}
     * @private
     * @readonly
     */
    this.dynamics = dynamics;

    if (this.fn) {
      this.fn(this.current);
    }
  }

  /**
   * Changes base speed
   * @param {number} speed
   */
  setSpeed(speed) {
    each(this.dynamics, (d) => {
      d.setSpeed(speed);
    });
  }

  /**
   * Defines the target positions
   * @param {Record<string, number>} positions
   * @param {number} [speedMult=1]
   */
  goto(positions, speedMult = 1) {
    each(positions, (position, name) => {
      this.dynamics[name].goto(position, speedMult);
    });
  }

  /**
   * Increase/decrease the target positions
   * @param {Record<string, number>} steps
   * @param {number} [speedMult=1]
   */
  step(steps, speedMult = 1) {
    each(steps, (step, name) => {
      this.dynamics[name].step(step, speedMult);
    });
  }

  /**
   * Starts infinite movements
   * @param {Record<string, boolean>} rolls
   * @param {number} [speedMult=1]
   */
  roll(rolls, speedMult = 1) {
    each(rolls, (roll, name) => {
      this.dynamics[name].roll(roll, speedMult);
    });
  }

  /**
   * Stops movements
   */
  stop() {
    each(this.dynamics, d => d.stop());
  }

  /**
   * Defines the current positions and immediately stops movements
   * @param {Record<string, number>} values
   */
  setValue(values) {
    let hasUpdates = false;
    each(values, (value, name) => {
      hasUpdates |= this.dynamics[name].setValue(value);
    });

    if (hasUpdates && this.fn) {
      this.fn(this.current);
    }

    return hasUpdates;
  }

  /**
   * @package
   */
  update(elapsed) {
    let hasUpdates = false;
    each(this.dynamics, (dynamic) => {
      hasUpdates |= dynamic.update(elapsed);
    });

    if (hasUpdates && this.fn) {
      this.fn(this.current);
    }

    return hasUpdates;
  }

}
