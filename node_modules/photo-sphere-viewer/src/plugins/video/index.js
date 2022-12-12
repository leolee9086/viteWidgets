import { SplineCurve, Vector2 } from 'three';
import { AbstractPlugin, CONSTANTS, DEFAULTS, PSVError, registerButton, utils } from '../..';
import { EVENTS } from './constants';
import { PauseOverlay } from './PauseOverlay';
import { PlayPauseButton } from './PlayPauseButton';
import { ProgressBar } from './ProgressBar';
import { TimeCaption } from './TimeCaption';
import { VolumeButton } from './VolumeButton';
import './style.scss';


/**
 * @typedef {Object} PSV.plugins.VideoPlugin.Keypoint
 * @property {PSV.ExtendedPosition} position
 * @property {number} time
 */

/**
 * @typedef {Object} PSV.plugins.VideoPlugin.Options
 * @property {boolean} [progressbar=true] - displays a progressbar on top of the navbar
 * @property {boolean} [bigbutton=true] - displays a big "play" button in the center of the viewer
 * @property {PSV.plugins.VideoPlugin.Keypoint[]} [keypoints] - defines autorotate timed keypoints
 */


// add video buttons
DEFAULTS.lang[PlayPauseButton.id] = 'Play/Pause';
DEFAULTS.lang[VolumeButton.id] = 'Volume';
registerButton(PlayPauseButton);
registerButton(VolumeButton);
registerButton(TimeCaption);
DEFAULTS.navbar.unshift(PlayPauseButton.groupId);


export { EVENTS } from './constants';


/**
 * @summary Controls a video adapter
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */
export class VideoPlugin extends AbstractPlugin {

  static id = 'video';

  static EVENTS = EVENTS;

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.plugins.VideoPlugin.Options} options
   */
  constructor(psv, options) {
    super(psv);

    if (!this.psv.adapter.constructor.id.includes('video')) {
      throw new PSVError('VideoPlugin can only be used with a video adapter.');
    }

    /**
     * @member {Object}
     * @property {THREE.SplineCurve} curve
     * @property {PSV.plugins.VideoPlugin.Keypoint} start
     * @property {PSV.plugins.VideoPlugin.Keypoint} end
     * @property {PSV.plugins.VideoPlugin.Keypoint[]} keypoints
     * @private
     */
    this.autorotate = {
      curve    : null,
      start    : null,
      end      : null,
      keypoints: null,
    };

    /**
     * @member {PSV.plugins.VideoPlugin.Options}
     * @private
     */
    this.config = {
      progressbar: true,
      bigbutton  : true,
      ...options,
    };

    if (this.config.progressbar) {
      this.progressbar = new ProgressBar(this);
    }

    if (this.config.bigbutton) {
      this.overlay = new PauseOverlay(this);
    }

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
    this.psv.on(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.psv.on(CONSTANTS.EVENTS.KEY_PRESS, this);
  }

  /**
   * @package
   */
  destroy() {
    this.psv.off(CONSTANTS.EVENTS.AUTOROTATE, this);
    this.psv.off(CONSTANTS.EVENTS.BEFORE_RENDER, this);
    this.psv.off(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.psv.off(CONSTANTS.EVENTS.KEY_PRESS, this);

    delete this.autorotate;
    delete this.progressbar;
    delete this.overlay;

    super.destroy();
  }

  /**
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    // @formatter:off
    switch (e.type) {
      case CONSTANTS.EVENTS.BEFORE_RENDER:
        this.__autorotate();
        break;
      case CONSTANTS.EVENTS.AUTOROTATE:
        this.__configureAutorotate();
        break;
      case CONSTANTS.EVENTS.PANORAMA_LOADED:
        this.__bindVideo(e.args[0]);
        this.progressbar?.show();
        break;
      case CONSTANTS.EVENTS.KEY_PRESS:
        this.__onKeyPress(e, e.args[0]);
        break;
      case 'play':         this.trigger(EVENTS.PLAY); break;
      case 'pause':        this.trigger(EVENTS.PAUSE); break;
      case 'progress':     this.trigger(EVENTS.BUFFER, this.getBufferProgress()); break;
      case 'volumechange': this.trigger(EVENTS.VOLUME_CHANGE, this.getVolume()); break;
      case 'timeupdate':
        this.trigger(EVENTS.PROGRESS, {
          time    : this.getTime(),
          duration: this.getDuration(),
          progress: this.getProgress(),
        });
        break;
    }
    // @formatter:on
    /* eslint-enable */
  }

  /**
   * @private
   */
  __bindVideo(textureData) {
    this.video = textureData.texture.image;

    this.video.addEventListener('play', this);
    this.video.addEventListener('pause', this);
    this.video.addEventListener('progress', this);
    this.video.addEventListener('volumechange', this);
    this.video.addEventListener('timeupdate', this);
  }

  /**
   * @private
   */
  __onKeyPress(e, key) {
    if (key === CONSTANTS.KEY_CODES.Space) {
      this.playPause();
      e.preventDefault();
    }
  }

  /**
   * @summary Returns the durection of the video
   * @returns {number}
   */
  getDuration() {
    return this.video?.duration ?? 0;
  }

  /**
   * @summary Returns the current time of the video
   * @returns {number}
   */
  getTime() {
    return this.video?.currentTime ?? 0;
  }

  /**
   * @summary Returns the play progression of the video
   * @returns {number} 0-1
   */
  getProgress() {
    return this.video ? this.video.currentTime / this.video.duration : 0;
  }

  /**
   * @summary Returns if the video is playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.video ? !this.video.paused : false;
  }

  /**
   * @summary Returns the video volume
   * @returns {number}
   */
  getVolume() {
    return this.video?.muted ? 0 : this.video?.volume ?? 0;
  }

  /**
   * @summary Starts or pause the video
   */
  playPause() {
    if (this.video) {
      if (this.video.paused) {
        this.video.play();
      }
      else {
        this.video.pause();
      }
    }
  }

  /**
   * @summary Starts the video if paused
   */
  play() {
    if (this.video && this.video.paused) {
      this.video.play();
    }
  }

  /**
   * @summary Pauses the cideo if playing
   */
  pause() {
    if (this.video && !this.video.paused) {
      this.video.pause();
    }
  }

  /**
   * @summary Sets the volume of the video
   * @param {number} volume
   */
  setVolume(volume) {
    if (this.video) {
      this.video.muted = false;
      this.video.volume = volume;
    }
  }

  /**
   * @summary (Un)mutes the video
   * @param {boolean} [mute] - toggle if undefined
   */
  setMute(mute) {
    if (this.video) {
      this.video.muted = mute === undefined ? !this.video.muted : mute;
      if (!this.video.muted && this.video.volume === 0) {
        this.video.volume = 0.1;
      }
    }
  }

  /**
   * @summary Changes the current time of the video
   * @param {number} time
   */
  setTime(time) {
    if (this.video) {
      this.video.currentTime = time;
    }
  }

  /**
   * @summary Changes the progression of the video
   * @param {number} progress 0-1
   */
  setProgress(progress) {
    if (this.video) {
      this.video.currentTime = this.video.duration * progress;
    }
  }

  getBufferProgress() {
    if (this.video) {
      let maxBuffer = 0;

      const buffer = this.video.buffered;

      for (let i = 0, l = buffer.length; i < l; i++) {
        if (buffer.start(i) <= this.video.currentTime && buffer.end(i) >= this.video.currentTime) {
          maxBuffer = buffer.end(i);
          break;
        }
      }

      return Math.max(this.video.currentTime, maxBuffer) / this.video.duration;
    }
    else {
      return 0;
    }
  }

  /**
   * @summary Changes the keypoints
   * @param {PSV.plugins.VideoPlugin.Keypoint[]} keypoints
   */
  setKeypoints(keypoints) {
    if (keypoints && keypoints.length < 2) {
      throw new PSVError('At least two points are required');
    }

    this.autorotate.keypoints = utils.clone(keypoints);

    if (this.autorotate.keypoints) {
      this.autorotate.keypoints.forEach((pt, i) => {
        if (pt.position) {
          const position = this.psv.dataHelper.cleanPosition(pt.position);
          pt.position = [position.longitude, position.latitude];
        }
        else {
          throw new PSVError(`Keypoint #${i} is missing marker or position`);
        }

        if (utils.isNil(pt.time)) {
          throw new PSVError(`Keypoint #${i} is missing time`);
        }
      });

      this.autorotate.keypoints.sort((a, b) => a.time - b.time);
    }

    this.__configureAutorotate();
  }

  /**
   * @private
   */
  __configureAutorotate() {
    delete this.autorotate.curve;
    delete this.autorotate.start;
    delete this.autorotate.end;

    if (this.psv.isAutorotateEnabled() && this.autorotate.keypoints) {
      // cancel core rotation
      this.psv.dynamics.position.stop();
    }
  }

  /**
   * @private
   */
  __autorotate() {
    if (!this.psv.isAutorotateEnabled() || !this.autorotate.keypoints) {
      return;
    }

    const currentTime = this.getTime();
    const autorotate = this.autorotate;

    if (!autorotate.curve || currentTime < autorotate.start.time || currentTime >= autorotate.end.time) {
      this.__autorotateNext(currentTime);
    }

    if (autorotate.start === autorotate.end) {
      this.psv.rotate({
        longitude: autorotate.start.position[0],
        latitude : autorotate.start.position[1],
      });
    }
    else {
      const progress = (currentTime - autorotate.start.time) / (autorotate.end.time - autorotate.start.time);
      // only the middle segment contains the current section
      const pt = autorotate.curve.getPoint(1 / 3 + progress / 3);

      this.psv.dynamics.position.goto({
        longitude: pt.x,
        latitude : pt.y,
      });
    }
  }

  /**
   * @private
   */
  __autorotateNext(currentTime) {
    let k1 = null;
    let k2 = null;

    const keypoints = this.autorotate.keypoints;
    const l = keypoints.length - 1;

    if (currentTime < keypoints[0].time) {
      k1 = 0;
      k2 = 0;
    }
    for (let i = 0; i < l; i++) {
      if (currentTime >= keypoints[i].time && currentTime < keypoints[i + 1].time) {
        k1 = i;
        k2 = i + 1;
        break;
      }
    }
    if (currentTime >= keypoints[l].time) {
      k1 = l;
      k2 = l;
    }

    // get the 4 points necessary to compute the current movement
    // one point before and two points after the current
    const workPoints = [
      keypoints[Math.max(0, k1 - 1)].position,
      keypoints[k1].position,
      keypoints[k2].position,
      keypoints[Math.min(l, k2 + 1)].position,
    ];

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

    this.autorotate.curve = new SplineCurve(workVectors);
    this.autorotate.start = keypoints[k1];
    this.autorotate.end = keypoints[k2];

    // debugCurve(this.markers, this.autorotate.curve.getPoints(16 * 3).map(p => ([p.x, p.y])), 16);
  }

}
