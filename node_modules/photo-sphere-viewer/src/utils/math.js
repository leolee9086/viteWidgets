import { MathUtils } from 'three';

/**
 * @deprecated use THREE.MathUtils.clamp
 */
export function bound(x, min, max) {
  return MathUtils.clamp(x, min, max);
}

/**
 * @summary Ensure a value is within 0 and `max`
 * @param {number} value
 * @param {number} max
 * @return {number}
 */
export function loop(value, max) {
  let result = value % max;

  if (result < 0) {
    result += max;
  }

  return result;
}

/**
 * @deprecated Use THREE.MathUtils.isPowerOfTwo
 */
export function isPowerOfTwo(x) {
  return MathUtils.isPowerOfTwo(x);
}

/**
 * @summary Computes the sum of an array
 * @memberOf PSV.utils
 * @param {number[]} array
 * @returns {number}
 */
export function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}

/**
 * @summary Computes the distance between two points
 * @memberOf PSV.utils
 * @param {PSV.Point} p1
 * @param {PSV.Point} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * @summary Compute the shortest offset between two longitudes
 * @memberOf PSV.utils
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function getShortestArc(from, to) {
  const tCandidates = [
    0, // direct
    Math.PI * 2, // clock-wise cross zero
    -Math.PI * 2, // counter-clock-wise cross zero
  ];

  return tCandidates.reduce((value, candidate) => {
    const newCandidate = to - from + candidate;
    return Math.abs(newCandidate) < Math.abs(value) ? newCandidate : value;
  }, Infinity);
}

/**
 * @summary Computes the angle between the current position and a target position
 * @memberOf PSV.utils
 * @param {PSV.Position} position1
 * @param {PSV.Position} position2
 * @returns {number}
 */
export function getAngle(position1, position2) {
  return Math.acos(
    Math.cos(position1.latitude)
    * Math.cos(position2.latitude)
    * Math.cos(position1.longitude - position2.longitude)
    + Math.sin(position1.latitude)
    * Math.sin(position2.latitude)
  );
}

/**
 * @summary Returns the distance between two points on a sphere of radius one
 * {@link http://www.movable-type.co.uk/scripts/latlong.html}
 * @memberOf PSV.utils
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
export function greatArcDistance(p1, p2) {
  const [λ1, φ1] = p1;
  const [λ2, φ2] = p2;

  const x = (λ2 - λ1) * Math.cos((φ1 + φ2) / 2);
  const y = (φ2 - φ1);
  return Math.sqrt(x * x + y * y);
}
