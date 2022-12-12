import { Event } from 'uevent';
import { ExtendedPosition, AbstractPlugin, Viewer } from 'photo-sphere-viewer';

declare const EVENTS: {
  PLAY: 'play',
  PAUSE: 'pause',
  VOLUME_CHANGE: 'volume-change',
  PROGRESS: 'progress',
  BUFFER: 'buffer',
};

/**
 * @summary Definition of keypoints for automatic rotation, can be a position object, a marker id or an object with the following properties
 */
type AutorotateKeypoint = {
  position: ExtendedPosition;
  time: number;
};

type VideoPluginOptions = {
  progressbar?: boolean;
  bigbutton?: boolean;
  keypoints?: AutorotateKeypoint[];
};

/**
 * @summary Controls a video adapter
 */
declare class VideoPlugin extends AbstractPlugin {

  static EVENTS: typeof EVENTS;

  constructor(psv: Viewer, options: VideoPluginOptions);

  /**
   * @summary Changes the keypoints
   */
  setKeypoints(keypoints: AutorotateKeypoint[]);

  /**
   * @summary Returns the durection of the video
   */
  getDuration(): number;

  /**
   * @summary Returns the current time of the video
   */
  getTime(): number;

  /**
   * @summary Returns the play progression of the video
   */
  getProgress(): number;

  /**
   * @summary Returns if the video is playing
   */
  isPlaying(): boolean;

  /**
   * @summary Returns the video volume
   */
  getVolume(): number;

  /**
   * @summary Starts or pause the video
   */
  playPause(): void;

  /**
   * @summary Starts the video if paused
   */
  play(): void;

  /**
   * @summary Pauses the cideo if playing
   */
  pause(): void;

  /**
   * @summary Sets the volume of the video
   */
  setVolume(volume: number): void;

  /**
   * @summary (Un)mutes the video
   */
  setMute(mute?: boolean): void;

  /**
   * @summary Changes the current time of the video
   */
  setTime(time: number): void;

  /**
   * @summary Changes the progression of the video
   */
  setProgress(progress: number): void;

  /**
   * @summary Triggered when the video starts playing
   */
  on(e: 'play', cb: (e: Event) => void): this;

  /**
   * @summary Triggered when the video is paused
   */
  on(e: 'pause', cb: (e: Event) => void): this;

  /**
   * @summary Triggered when the video volume changes
   */
  on(e: 'volume-change', cb: (e: Event, volume: number) => void): this;

  /**
   * @summary  Triggered when the video play progression changes
   */
  on(e: 'progress', cb: (e: Event, data: { time: number, duration: number, progress: number }) => void): this;

  /**
   * @summary Triggered when the video buffer changes
   */
  on(e: 'buffer', cb: (e: Event, maxBuffer: number) => void): this;

}

export { AutorotateKeypoint, EVENTS, VideoPlugin, VideoPluginOptions };
