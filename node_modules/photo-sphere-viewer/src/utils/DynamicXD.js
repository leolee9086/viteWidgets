import { MathUtils } from 'three';
import { each } from './misc';

/**
 * @summary Implementation of {@link PSV.utils.Dynamic} for any number of variables, unused
 * @memberOf PSV.utils
 * @private
 */
export class DynamicXD {

  static STOP = 0;
  static INFINITE = 1;
  static POSITION = 2;

  get current() {
    return this.reduce((values, _) => {
      values[_.name] = _.current;
      return values;
    }, {});
  }

  constructor(fn, _) {
    this.fn = fn;
    this.mode = DynamicXD.STOP;
    this.speed = 0;
    this.speedMult = 1;
    this.currentSpeed = 0;
    this._ = {};
    each(_, (dim, name) => {
      this._[name] = {
        min    : -Infinity,
        max    : Infinity,
        ...dim,
        name   : name,
        target : 0,
        current: 0,
      };
    });
  }

  forEach(fn) {
    each(this._, fn);
  }

  reduce(fn, init) {
    return Object.keys(this._).reduce((acc, name) => fn(acc, this._[name]), init);
  }

  /**
   * Defines the target position
   */
  goto(positions, speedMult = 1) {
    this.mode = DynamicXD.POSITION;
    this.speedMult = speedMult;
    this.forEach((_) => {
      if (_.name in positions) {
        _.target = MathUtils.clamp(positions[_.name], _.min, _.max);
      }
    });
  }

  /**
   * Increase/decrease the target position
   */
  step(steps, speedMult = 1) {
    if (this.mode !== DynamicXD.POSITION) {
      this.forEach((_) => {
        _.target = _.current;
      });
    }
    this.mode = DynamicXD.POSITION;
    this.speedMult = speedMult;
    this.forEach((_) => {
      if (_.name in steps) {
        _.target = MathUtils.clamp(_.target + steps[_.name], _.min, _.max);
      }
    });
  }

  /**
   * Starts infinite movement
   */
  roll(rolls, speedMult = 1) {
    this.mode = DynamicXD.INFINITE;
    this.speedMult = speedMult;
    this.forEach((_) => {
      if (_.name in rolls) {
        _.target = rolls[_.name] ? -Infinity : Infinity;
      }
      else {
        _.target = _.current;
      }
    });
  }

  /**
   * Stops movement
   */
  stop() {
    this.mode = DynamicXD.STOP;
  }

  /**
   * Defines the current position and immediately stops movement
   */
  setValue(values) {
    this.mode = DynamicXD.STOP;

    const hasChanges = this.reduce((changes, _) => {
      let changed = false;
      if (_.name in values) {
        const next = MathUtils.clamp(values[_.name], _.min, _.max);
        changed = next !== _.current;
        _.current = next;
      }
      _.target = _.current;
      return changes || changed;
    }, false);

    if (hasChanges && this.fn) {
      this.fn(this.current);
    }

    return hasChanges;
  }

  /**
   * @package
   */
  update(elapsed) {
    const elapsedS = elapsed / 1000;
    const acceleration = this.speed * this.speedMult * 2;

    // in position mode switch to stop mode when in the decceleration window
    if (this.mode === DynamicXD.POSITION) {
      const dstStop = this.currentSpeed * this.currentSpeed / (acceleration * 2);
      const dstCurr = this.reduce((dst, _) => {
        return dst + (_.target - _.current) * (_.target - _.current);
      }, 0);

      if (dstCurr <= dstStop * dstStop) { // no Math.sqrt on dstCurr
        this.mode = DynamicXD.STOP;
      }
    }

    // FIXME the speed should be different for each component (with sum = global speed)
    // FIXME implement signed speed for smooth changes of direction

    // compute speed
    const targetSpeed = this.mode === DynamicXD.STOP ? 0 : this.speed * this.speedMult;
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(targetSpeed, this.currentSpeed + elapsedS * acceleration);
    }
    else if (this.currentSpeed > targetSpeed) {
      this.currentSpeed = Math.max(targetSpeed, this.currentSpeed - elapsedS * acceleration);
    }

    if (this.currentSpeed) {
      // compute position
      const hasChanges = this.reduce((changes, _) => {
        let next = null;
        if (_.current > _.target) {
          next = Math.max(_.target, _.current - this.currentSpeed * elapsedS);
        }
        else if (_.current < _.target) {
          next = Math.min(_.target, _.current + this.currentSpeed * elapsedS);
        }

        if (next !== null) {
          next = MathUtils.clamp(next, _.min, _.max);
          if (next !== _.current) {
            _.current = next;
            return true;
          }
        }

        return changes;
      }, false);

      // apply
      if (hasChanges && this.fn) {
        this.fn(this.current);
      }

      return hasChanges;
    }

    return false;
  }

}
