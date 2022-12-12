import { PSVError } from '../PSVError';
import { VIEWER_DATA } from './constants';

const LOCALSTORAGE_TOUCH_SUPPORT = `${VIEWER_DATA}_touchSupport`;

/**
 * @summary General information about the system
 * @constant
 * @memberOf PSV
 * @property {boolean} loaded - Indicates if the system data has been loaded
 * @property {Function} load - Loads the system if not already loaded
 * @property {number} pixelRatio
 * @property {boolean} isWebGLSupported
 * @property {number} maxCanvasWidth
 * @property {string} mouseWheelEvent
 * @property {string} fullscreenEvent
 * @property {Function} getMaxCanvasWidth - Returns the max width of a canvas allowed by the browser
 * @property {{initial: boolean, promise: Promise<boolean>}} isTouchEnabled
 */
export const SYSTEM = {
  loaded          : false,
  pixelRatio      : 1,
  isWebGLSupported: false,
  isTouchEnabled  : null,
  maxTextureWidth : 0,
  mouseWheelEvent : null,
  fullscreenEvent : null,
};

/**
 * @summary Loads the system if not already loaded
 */
SYSTEM.load = () => {
  if (!SYSTEM.loaded) {
    const ctx = getWebGLCtx();

    SYSTEM.loaded = true;
    SYSTEM.pixelRatio = window.devicePixelRatio || 1;
    SYSTEM.isWebGLSupported = ctx != null;
    SYSTEM.isTouchEnabled = isTouchEnabled();
    SYSTEM.maxTextureWidth = getMaxTextureWidth(ctx);
    SYSTEM.mouseWheelEvent = getMouseWheelEvent();
    SYSTEM.fullscreenEvent = getFullscreenEvent();
  }
};

let maxCanvasWidth = null;
SYSTEM.getMaxCanvasWidth = () => {
  if (maxCanvasWidth === null) {
    maxCanvasWidth = getMaxCanvasWidth(SYSTEM.maxTextureWidth);
  }
  return maxCanvasWidth;
};

/**
 * @summary Tries to return a canvas webgl context
 * @returns {WebGLRenderingContext}
 * @private
 */
function getWebGLCtx() {
  const canvas = document.createElement('canvas');
  const names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
  let context = null;

  if (!canvas.getContext) {
    return null;
  }

  if (names.some((name) => {
    try {
      context = canvas.getContext(name);
      return context !== null;
    }
    catch (e) {
      return false;
    }
  })) {
    return context;
  }
  else {
    return null;
  }
}

/**
 * @summary Detects if the user is using a touch screen
 * @returns {{initial: boolean, promise: Promise<boolean>}}
 * @private
 */
function isTouchEnabled() {
  let initial = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (LOCALSTORAGE_TOUCH_SUPPORT in localStorage) {
    initial = localStorage[LOCALSTORAGE_TOUCH_SUPPORT] === 'true';
  }

  const promise = new Promise((resolve) => {
    let clear;

    const listenerMouse = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = false;
      resolve(false);
    };

    const listenerTouch = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = true;
      resolve(true);
    };

    const listenerTimeout = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = initial;
      resolve(initial);
    };

    window.addEventListener('mousedown', listenerMouse, false);
    window.addEventListener('touchstart', listenerTouch, false);
    const listenerTimeoutId = setTimeout(listenerTimeout, 10000);

    clear = () => {
      window.removeEventListener('mousedown', listenerMouse);
      window.removeEventListener('touchstart', listenerTouch);
      clearTimeout(listenerTimeoutId);
    };
  });

  return { initial, promise };
}

/**
 * @summary Gets max texture width in WebGL context
 * @returns {number}
 * @private
 */
function getMaxTextureWidth(ctx) {
  if (ctx !== null) {
    return ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
  }
  else {
    return 0;
  }
}

/**
 * @summary Gets max canvas width supported by the browser.
 * We only test powers of 2 and height = width / 2 because that's what we need to generate WebGL textures
 * @param maxWidth
 * @return {number}
 * @private
 */
function getMaxCanvasWidth(maxWidth) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = maxWidth;
  canvas.height = maxWidth / 2;

  while (canvas.width > 1024) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1, 1);

    try {
      if (ctx.getImageData(0, 0, 1, 1).data[0] > 0) {
        return canvas.width;
      }
    }
    catch (e) {
      // continue
    }

    canvas.width /= 2;
    canvas.height /= 2;
  }

  throw new PSVError('Unable to detect system capabilities');
}

/**
 * @summary Gets the event name for mouse wheel
 * @returns {string}
 * @private
 */
function getMouseWheelEvent() {
  if ('onwheel' in document.createElement('div')) { // Modern browsers support "wheel"
    return 'wheel';
  }
  else if (document.onmousewheel !== undefined) { // Webkit and IE support at least "mousewheel"
    return 'mousewheel';
  }
  else { // let's assume that remaining browsers are older Firefox
    return 'DOMMouseScroll';
  }
}

/**
 * @summary Map between fullsceen method and fullscreen event name
 * @type {Object<string, string>}
 * @readonly
 * @private
 */
const FULLSCREEN_EVT_MAP = {
  exitFullscreen      : 'fullscreenchange',
  webkitExitFullscreen: 'webkitfullscreenchange',
  mozCancelFullScreen : 'mozfullscreenchange',
  msExitFullscreen    : 'MSFullscreenChange',
};


/**
 * @summary  Gets the event name for fullscreen
 * @returns {string}
 * @private
 */
function getFullscreenEvent() {
  const validExits = Object.keys(FULLSCREEN_EVT_MAP).filter(exit => exit in document);

  if (validExits.length) {
    return FULLSCREEN_EVT_MAP[validExits[0]];
  }
  else {
    return null;
  }
}
