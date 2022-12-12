import { MathUtils } from 'three';
import { AbstractPlugin, CONSTANTS, utils } from '../..';


/**
 * @typedef {Object} PSV.plugins.VisibleRangePlugin.Options
 * @property {double[]|string[]} [latitudeRange] - latitude range as two angles
 * @property {double[]|string[]} [longitudeRange] - longitude range as two angles
 * @property {boolean} [usePanoData=false] - use panoData as visible range, you can also manually call `setRangesFromPanoData`
 */

const EPS = 0.000001;

/**
 * @summary Locks visible longitude and/or latitude
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */
export class VisibleRangePlugin extends AbstractPlugin {

  static id = 'visible-range';

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.plugins.VisibleRangePlugin.Options} options
   */
  constructor(psv, options) {
    super(psv);

    /**
     * @member {PSV.plugins.VisibleRangePlugin.Options}
     * @private
     */
    this.config = {
      latitudeRange : null,
      longitudeRange: null,
      usePanoData   : false,
      ...options,
    };
  }

  /**
   * @package
   */
  init() {
    super.init();

    this.psv.on(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.psv.on(CONSTANTS.EVENTS.POSITION_UPDATED, this);
    this.psv.on(CONSTANTS.EVENTS.ZOOM_UPDATED, this);
    this.psv.on(CONSTANTS.CHANGE_EVENTS.GET_ANIMATE_POSITION, this);
    this.psv.on(CONSTANTS.CHANGE_EVENTS.GET_ROTATE_POSITION, this);

    this.setLatitudeRange(this.config.latitudeRange);
    this.setLongitudeRange(this.config.longitudeRange);
  }

  /**
   * @package
   */
  destroy() {
    this.psv.off(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.psv.off(CONSTANTS.EVENTS.POSITION_UPDATED, this);
    this.psv.off(CONSTANTS.EVENTS.ZOOM_UPDATED, this);
    this.psv.off(CONSTANTS.CHANGE_EVENTS.GET_ANIMATE_POSITION, this);
    this.psv.off(CONSTANTS.CHANGE_EVENTS.GET_ROTATE_POSITION, this);

    super.destroy();
  }

  /**
   * @private
   */
  // eslint-disable-next-line consistent-return
  handleEvent(e) {
    let sidesReached;
    let rangedPosition;
    let currentPosition;

    switch (e.type) {
      case CONSTANTS.CHANGE_EVENTS.GET_ANIMATE_POSITION:
      case CONSTANTS.CHANGE_EVENTS.GET_ROTATE_POSITION:
        currentPosition = e.value;
        ({ rangedPosition } = this.applyRanges(currentPosition));

        return rangedPosition;

      case CONSTANTS.EVENTS.POSITION_UPDATED:
        currentPosition = e.args[0];
        ({ sidesReached, rangedPosition } = this.applyRanges(currentPosition));

        if ((sidesReached.left || sidesReached.right) && this.psv.isAutorotateEnabled()) {
          this.__reverseAutorotate(sidesReached.left, sidesReached.right);
        }
        else if (Math.abs(currentPosition.longitude - rangedPosition.longitude) > EPS
          || Math.abs(currentPosition.latitude - rangedPosition.latitude) > EPS) {
          this.psv.dynamics.position.setValue(rangedPosition);
        }
        break;

      case CONSTANTS.EVENTS.PANORAMA_LOADED:
        if (this.config.usePanoData) {
          this.setRangesFromPanoData();
        }
        break;

      case CONSTANTS.EVENTS.ZOOM_UPDATED:
        currentPosition = this.psv.getPosition();
        ({ rangedPosition } = this.applyRanges(currentPosition));

        if (Math.abs(currentPosition.longitude - rangedPosition.longitude) > EPS
          || Math.abs(currentPosition.latitude - rangedPosition.latitude) > EPS) {
          this.psv.rotate(rangedPosition);
        }
        break;

      default:
    }
  }

  /**
   * @summary Changes the latitude range
   * @param {double[]|string[]} range - latitude range as two angles
   */
  setLatitudeRange(range) {
    // latitude range must have two values
    if (range && range.length !== 2) {
      utils.logWarn('latitude range must have exactly two elements');
      range = null;
    }
    // latitude range must be ordered
    else if (range && range[0] > range[1]) {
      utils.logWarn('latitude range values must be ordered');
      range = [range[1], range[0]];
    }
    // latitude range is between -PI/2 and PI/2
    if (range) {
      this.config.latitudeRange = range.map(angle => utils.parseAngle(angle, true));
    }
    else {
      this.config.latitudeRange = null;
    }

    if (this.psv.prop.ready) {
      this.psv.rotate(this.psv.getPosition());
    }
  }

  /**
   * @summary Changes the longitude range
   * @param {double[]|string[]} range - longitude range as two angles
   */
  setLongitudeRange(range) {
    // longitude range must have two values
    if (range && range.length !== 2) {
      utils.logWarn('longitude range must have exactly two elements');
      range = null;
    }
    // longitude range is between 0 and 2*PI
    if (range) {
      this.config.longitudeRange = range.map(angle => utils.parseAngle(angle));
    }
    else {
      this.config.longitudeRange = null;
    }

    if (this.psv.prop.ready) {
      this.psv.rotate(this.psv.getPosition());
    }
  }

  /**
   * @summary Changes the latitude and longitude ranges according the current panorama cropping data
   */
  setRangesFromPanoData() {
    this.setLatitudeRange(this.getPanoLatitudeRange());
    this.setLongitudeRange(this.getPanoLongitudeRange());
  }

  /**
   * @summary Gets the latitude range defined by the viewer's panoData
   * @returns {double[]|null}
   * @private
   */
  getPanoLatitudeRange() {
    const p = this.psv.prop.panoData;
    if (p.croppedHeight === p.fullHeight) {
      return null;
    }
    else {
      const latitude = y => Math.PI * (1 - y / p.fullHeight) - (Math.PI / 2);
      return [latitude(p.croppedY + p.croppedHeight), latitude(p.croppedY)];
    }
  }

  /**
   * @summary Gets the longitude range defined by the viewer's panoData
   * @returns {double[]|null}
   * @private
   */
  getPanoLongitudeRange() {
    const p = this.psv.prop.panoData;
    if (p.croppedWidth === p.fullWidth) {
      return null;
    }
    else {
      const longitude = x => 2 * Math.PI * (x / p.fullWidth) - Math.PI;
      return [longitude(p.croppedX), longitude(p.croppedX + p.croppedWidth)];
    }
  }

  /**
   * @summary Apply "longitudeRange" and "latitudeRange"
   * @param {PSV.Position} position
   * @returns {{rangedPosition: PSV.Position, sidesReached: string[]}}
   * @private
   */
  applyRanges(position) {
    const rangedPosition = {
      longitude: position.longitude,
      latitude : position.latitude,
    };
    const sidesReached = {};

    let range;
    let offset;

    if (this.config.longitudeRange) {
      range = utils.clone(this.config.longitudeRange);
      offset = MathUtils.degToRad(this.psv.prop.hFov) / 2;

      range[0] = utils.parseAngle(range[0] + offset);
      range[1] = utils.parseAngle(range[1] - offset);

      if (range[0] > range[1]) { // when the range cross longitude 0
        if (position.longitude > range[1] && position.longitude < range[0]) {
          if (position.longitude > (range[0] / 2 + range[1] / 2)) { // detect which side we are closer too
            rangedPosition.longitude = range[0];
            sidesReached.left = true;
          }
          else {
            rangedPosition.longitude = range[1];
            sidesReached.right = true;
          }
        }
      }
      else if (position.longitude < range[0]) {
        rangedPosition.longitude = range[0];
        sidesReached.left = true;
      }
      else if (position.longitude > range[1]) {
        rangedPosition.longitude = range[1];
        sidesReached.right = true;
      }
    }

    if (this.config.latitudeRange) {
      range = utils.clone(this.config.latitudeRange);
      offset = MathUtils.degToRad(this.psv.prop.vFov) / 2;

      range[0] = utils.parseAngle(range[0] + offset, true);
      range[1] = utils.parseAngle(range[1] - offset, true);

      // for very a narrow images, lock the latitude to the center
      if (range[0] > range[1]) {
        range[0] = (range[0] + range[1]) / 2;
        range[1] = range[0];
      }

      if (position.latitude < range[0]) {
        rangedPosition.latitude = range[0];
        sidesReached.bottom = true;
      }
      else if (position.latitude > range[1]) {
        rangedPosition.latitude = range[1];
        sidesReached.top = true;
      }
    }

    return { rangedPosition, sidesReached };
  }

  /**
   * @summary Reverses autorotate direction with smooth transition
   * @private
   */
  __reverseAutorotate(left, right) {
    // reverse already ongoing
    if (left && this.psv.config.autorotateSpeed > 0 || right && this.psv.config.autorotateSpeed < 0) {
      return;
    }

    this.psv.config.autorotateSpeed = -this.psv.config.autorotateSpeed;
    this.psv.startAutorotate(true);
  }

}
