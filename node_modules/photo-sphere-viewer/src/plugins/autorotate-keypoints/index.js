import { SplineCurve, Vector2 } from 'three';
import { AbstractPlugin, CONSTANTS, PSVError, utils } from '../..';

/**
 * @typedef {Object} PSV.plugins.AutorotateKeypointsPlugin.KeypointObject
 * @property {PSV.ExtendedPosition} [position]
 * @property {string} [markerId] - use the position and tooltip of a marker
 * @property {number} [pause=0] - pause the animation when reaching this point, will display the tooltip if available
 * @property {string|{content: string, position: string}} [tooltip]
 */

/**
 * @typedef {PSV.ExtendedPosition|string|PSV.plugins.AutorotateKeypointsPlugin.KeypointObject} PSV.plugins.AutorotateKeypointsPlugin.Keypoint
 * @summary Definition of keypoints for automatic rotation, can be a position object, a marker id or an keypoint object
 */

/**
 * @typedef {Object} PSV.plugins.AutorotateKeypointsPlugin.Options
 * @property {boolean} [startFromClosest=true] - start from the closest keypoint instead of the first keypoint
 * @property {PSV.plugins.AutorotateKeypointsPlugin.Keypoint[]} keypoints
 */


const NUM_STEPS = 16;

function serializePt(position) {
  return [position.longitude, position.latitude];
}


/**
 * @summary Replaces the standard autorotate animation by a smooth transition between multiple points
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */
export class AutorotateKeypointsPlugin extends AbstractPlugin {

  static id = 'autorotate-keypoints';

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.plugins.AutorotateKeypointsPlugin.Options} [options]
   */
  constructor(psv, options) {
    super(psv);

    /**
     * @member {Object}
     * @property {number} idx -  current index in keypoints
     * @property {number[][]} curve - curve between idx and idx + 1
     * @property {number[]} startStep - start point of the current step
     * @property {number[]} endStep - end point of the current step
     * @property {number} startTime - start time of the current step
     * @property {number} stepDuration - expected duration of the step
     * @property {number} remainingPause - time remaining for the pause
     * @property {number} lastTime - previous timestamp in render loop
     * @property {PSV.components.Tooltip} tooltip - currently displayed tooltip
     * @private
     */
    this.state = {};

    /**
     * @member {PSV.plugins.AutorotateKeypointsPlugin.Options}
     * @private
     */
    this.config = {
      startFromClosest: true,
      ...options,
    };

    /**
     * @type {PSV.plugins.AutorotateKeypointsPlugin.Keypoint[]} keypoints
     */
    this.keypoints = null;

    /**
     * @type {PSV.plugins.MarkersPlugin}
     * @private
     */
    this.markers = null;
  }

  /**
   * @package
   */
  init() {
    super.init();

    this.markers = this.psv.getPlugin('markers');

    if (this.config.keypoints) {
      this.setKeypoints(this.config.keypoints);
      delete this.config.keypoints;
    }

    this.psv.on(CONSTANTS.EVENTS.AUTOROTATE, this);
    this.psv.on(CONSTANTS.EVENTS.BEFORE_RENDER, this);
  }

  /**
   * @package
   */
  destroy() {
    this.psv.off(CONSTANTS.EVENTS.AUTOROTATE, this);
    this.psv.off(CONSTANTS.EVENTS.BEFORE_RENDER, this);

    delete this.markers;
    delete this.keypoints;

    super.destroy();
  }

  /**
   * @private
   */
  handleEvent(e) {
    if (e.type === CONSTANTS.EVENTS.AUTOROTATE) {
      this.__configure();
    }
    else if (e.type === CONSTANTS.EVENTS.BEFORE_RENDER) {
      this.__beforeRender(e.args[0]);
    }
  }

  /**
   * @summary Changes the keypoints
   * @param {PSV.plugins.AutorotateKeypointsPlugin.Keypoint[]} keypoints
   */
  setKeypoints(keypoints) {
    if (keypoints?.length < 2) {
      throw new PSVError('At least two points are required');
    }

    this.keypoints = utils.clone(keypoints);

    if (this.keypoints) {
      this.keypoints.forEach((pt, i) => {
        if (typeof pt === 'string') {
          pt = { markerId: pt };
        }
        else if (utils.isExtendedPosition(pt)) {
          pt = { position: pt };
        }
        if (pt.markerId) {
          if (!this.markers) {
            throw new PSVError(`Keypoint #${i} references a marker but the markers plugin is not loaded`);
          }
          const marker = this.markers.getMarker(pt.markerId);
          pt.position = serializePt(marker.props.position);
        }
        else if (pt.position) {
          pt.position = serializePt(this.psv.dataHelper.cleanPosition(pt.position));
        }
        else {
          throw new PSVError(`Keypoint #${i} is missing marker or position`);
        }

        if (typeof pt.tooltip === 'string') {
          pt.tooltip = { content: pt.tooltip };
        }

        this.keypoints[i] = pt;
      });
    }

    this.__configure();
  }

  /**
   * @private
   */
  __configure() {
    if (!this.psv.isAutorotateEnabled() || !this.keypoints) {
      this.__hideTooltip();
      this.state = {};
      return;
    }

    // cancel core rotation
    this.psv.dynamics.position.stop();

    this.state = {
      idx           : -1,
      curve         : [],
      startStep     : null,
      endStep       : null,
      startTime     : null,
      stepDuration  : null,
      remainingPause: null,
      lastTime      : null,
      tooltip       : null,
    };

    if (this.config.startFromClosest) {
      const currentPosition = serializePt(this.psv.getPosition());
      const index = this.__findMinIndex(this.keypoints, (keypoint) => {
        return utils.greatArcDistance(keypoint.position, currentPosition);
      });

      this.keypoints.push(...this.keypoints.splice(0, index));
    }
  }

  /**
   * @private
   */
  __beforeRender(timestamp) {
    if (this.psv.isAutorotateEnabled()) {
      // initialisation
      if (!this.state.startTime) {
        this.state.endStep = serializePt(this.psv.getPosition());
        this.__nextStep();

        this.state.startTime = timestamp;
        this.state.lastTime = timestamp;
      }

      this.__nextFrame(timestamp);
    }
  }

  /**
   * @private
   */
  __incrementIdx() {
    this.state.idx++;
    if (this.state.idx === this.keypoints.length) {
      this.state.idx = 0;
    }
  }

  /**
   * @private
   */
  __showTooltip() {
    const keypoint = this.keypoints[this.state.idx];

    if (keypoint.tooltip) {
      const position = this.psv.dataHelper.vector3ToViewerCoords(this.psv.prop.direction);

      this.state.tooltip = this.psv.tooltip.create({
        content : keypoint.tooltip.content,
        position: keypoint.tooltip.position,
        top     : position.y,
        left    : position.x,
      });
    }
    else if (keypoint.markerId) {
      const marker = this.markers.getMarker(keypoint.markerId);
      marker.showTooltip();
      this.state.tooltip = marker.tooltip;
    }
  }

  /**
   * @private
   */
  __hideTooltip() {
    if (this.state.tooltip) {
      const keypoint = this.keypoints[this.state.idx];

      if (keypoint.tooltip) {
        this.state.tooltip.hide();
      }
      else if (keypoint.markerId) {
        const marker = this.markers.getMarker(keypoint.markerId);
        marker.hideTooltip();
      }

      this.state.tooltip = null;
    }
  }

  /**
   * @private
   */
  __nextPoint() {
    // get the 4 points necessary to compute the current movement
    // the two points of the current segments and one point before and after
    const workPoints = [];
    if (this.state.idx === -1) {
      const currentPosition = serializePt(this.psv.getPosition());
      workPoints.push(
        currentPosition,
        currentPosition,
        this.keypoints[0].position,
        this.keypoints[1].position
      );
    }
    else {
      for (let i = -1; i < 3; i++) {
        const keypoint = this.state.idx + i < 0
          ? this.keypoints[this.keypoints.length - 1]
          : this.keypoints[(this.state.idx + i) % this.keypoints.length];
        workPoints.push(keypoint.position);
      }
    }

    // apply offsets to avoid crossing the origin
    const workVectors = [new Vector2(workPoints[0][0], workPoints[0][1])];

    let k = 0;
    for (let i = 1; i <= 3; i++) {
      const d = workPoints[i - 1][0] - workPoints[i][0];
      if (d > Math.PI) { // crossed the origin left to right
        k += 1;
      }
      else if (d < -Math.PI) { // crossed the origin right to left
        k -= 1;
      }
      if (k !== 0 && i === 1) {
        // do not modify first point, apply the reverse offset the the previous point instead
        workVectors[0].x -= k * 2 * Math.PI;
        k = 0;
      }
      workVectors.push(new Vector2(workPoints[i][0] + k * 2 * Math.PI, workPoints[i][1]));
    }

    const curve = new SplineCurve(workVectors)
      .getPoints(NUM_STEPS * 3)
      .map(p => ([p.x, p.y]));

    // debugCurve(this.markers, curve, NUM_STEPS);

    // only keep the curve for the current movement
    this.state.curve = curve.slice(NUM_STEPS + 1, NUM_STEPS * 2 + 1);

    if (this.state.idx !== -1) {
      this.state.remainingPause = this.keypoints[this.state.idx].pause;

      if (this.state.remainingPause) {
        this.__showTooltip();
      }
      else {
        this.__incrementIdx();
      }
    }
    else {
      this.__incrementIdx();
    }
  }

  /**
   * @private
   */
  __nextStep() {
    if (this.state.curve.length === 0) {
      this.__nextPoint();

      // reset transformation made to the previous point
      this.state.endStep[0] = utils.parseAngle(this.state.endStep[0]);
    }

    // target next point
    this.state.startStep = this.state.endStep;
    this.state.endStep = this.state.curve.shift();

    // compute duration from distance and speed
    const distance = utils.greatArcDistance(this.state.startStep, this.state.endStep);
    this.state.stepDuration = distance * 1000 / Math.abs(this.psv.config.autorotateSpeed);

    if (distance === 0) { // edge case
      this.__nextStep();
    }
  }

  /**
   * @private
   */
  __nextFrame(timestamp) {
    const ellapsed = timestamp - this.state.lastTime;
    this.state.lastTime = timestamp;

    // currently paused
    if (this.state.remainingPause) {
      this.state.remainingPause = Math.max(0, this.state.remainingPause - ellapsed);
      if (this.state.remainingPause > 0) {
        return;
      }
      else {
        this.__hideTooltip();
        this.__incrementIdx();
        this.state.startTime = timestamp;
      }
    }

    let progress = (timestamp - this.state.startTime) / this.state.stepDuration;
    if (progress >= 1) {
      this.__nextStep();
      progress = 0;
      this.state.startTime = timestamp;
    }

    this.psv.rotate({
      longitude: this.state.startStep[0] + (this.state.endStep[0] - this.state.startStep[0]) * progress,
      latitude : this.state.startStep[1] + (this.state.endStep[1] - this.state.startStep[1]) * progress,
    });
  }

  /**
   * @private
   */
  __findMinIndex(array, mapper) {
    let idx = 0;
    let current = Number.MAX_VALUE;

    array.forEach((item, i) => {
      const value = mapper ? mapper(item) : item;
      if (value < current) {
        current = value;
        idx = i;
      }
    });

    return idx;
  }

}
