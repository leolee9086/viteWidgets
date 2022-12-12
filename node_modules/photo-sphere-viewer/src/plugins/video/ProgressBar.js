import { AbstractComponent, CONSTANTS, utils } from '../..';
import { EVENTS } from './constants';
import { formatTime } from './utils';

/**
 * @private
 */
export class ProgressBar extends AbstractComponent {

  constructor(plugin) {
    super(plugin.psv, 'psv-video-progressbar');

    /**
     * @type {PSV.plugins.VideoPlugin}
     * @private
     * @readonly
     */
    this.plugin = plugin;

    /**
     * @type {HTMLElement}
     * @private
     * @readonly
     */
    this.bufferElt = document.createElement('div');
    this.bufferElt.className = 'psv-video-progressbar__buffer';
    this.container.appendChild(this.bufferElt);

    /**
     * @type {HTMLElement}
     * @private
     * @readonly
     */
    this.progressElt = document.createElement('div');
    this.progressElt.className = 'psv-video-progressbar__progress';
    this.container.appendChild(this.progressElt);

    /**
     * @type {HTMLElement}
     * @private
     * @readonly
     */
    this.handleElt = document.createElement('div');
    this.handleElt.className = 'psv-video-progressbar__handle';
    this.container.appendChild(this.handleElt);

    /**
     * @type {PSV.utils.Slider}
     * @private
     * @readonly
     */
    this.slider = new utils.Slider({
      psv      : this.psv,
      container: this.container,
      direction: utils.Slider.HORIZONTAL,
      onUpdate : e => this.__onSliderUpdate(e),
    });

    this.psv.on(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.plugin.on(EVENTS.BUFFER, this);
    this.plugin.on(EVENTS.PROGRESS, this);

    this.prop.req = window.requestAnimationFrame(() => this.__updateProgress());

    this.hide();
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.plugin.off(EVENTS.BUFFER, this);
    this.plugin.off(EVENTS.PROGRESS, this);

    this.slider.destroy();
    this.prop.tooltip?.hide();
    window.cancelAnimationFrame(this.prop.req);

    delete this.prop.tooltip;
    delete this.slider;
    delete this.plugin;

    super.destroy();
  }

  /**
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      case CONSTANTS.EVENTS.PANORAMA_LOADED:
      case EVENTS.BUFFER:
      case EVENTS.PROGRESS:
        this.bufferElt.style.width = `${this.plugin.getBufferProgress() * 100}%`;
        break;
    }
    /* eslint-enable */
  }

  /**
   * @private
   */
  __updateProgress() {
    this.progressElt.style.width = `${this.plugin.getProgress() * 100}%`;

    this.prop.req = window.requestAnimationFrame(() => this.__updateProgress());
  }

  /**
   * @private
   */
  __onSliderUpdate(e) {
    if (e.mouseover) {
      this.handleElt.style.display = 'block';
      this.handleElt.style.left = `${e.value * 100}%`;

      const time = formatTime(this.plugin.getDuration() * e.value);

      if (!this.prop.tooltip) {
        this.prop.tooltip = this.psv.tooltip.create({
          top    : e.cursor.clientY,
          left   : e.cursor.clientX,
          content: time,
        });
      }
      else {
        this.prop.tooltip.content.innerHTML = time;
        this.prop.tooltip.move({
          top : e.cursor.clientY,
          left: e.cursor.clientX,
        });
      }
    }
    else {
      this.handleElt.style.display = 'none';

      this.prop.tooltip?.hide();
      delete this.prop.tooltip;
    }
    if (e.click) {
      this.plugin.setProgress(e.value);
    }
  }

}
