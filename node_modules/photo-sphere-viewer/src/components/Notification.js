import { EVENTS } from '../data/constants';
import { PSVError } from '../PSVError';
import { AbstractComponent } from './AbstractComponent';

/**
 * @summary Notification component
 * @extends PSV.components.AbstractComponent
 * @memberof PSV.components
 */
export class Notification extends AbstractComponent {

  /**
   * @param {PSV.Viewer} psv
   */
  constructor(psv) {
    super(psv, 'psv-notification');

    /**
     * @override
     * @property {*} timeout
     */
    this.prop = {
      ...this.prop,
      visible  : false,
      contentId: undefined,
      timeout  : null,
    };

    /**
     * Notification content
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.content = document.createElement('div');
    this.content.className = 'psv-notification-content';
    this.container.appendChild(this.content);

    this.content.addEventListener('click', () => this.hide());
  }

  /**
   * @override
   */
  destroy() {
    delete this.content;

    super.destroy();
  }

  /**
   * @override
   * @param {string} [id]
   */
  isVisible(id) {
    return this.prop.visible && (!id || !this.prop.contentId || this.prop.contentId === id);
  }

  /**
   * @override
   * @summary This method is not supported
   * @throws {PSV.PSVError} always
   */
  toggle() {
    throw new PSVError('Notification cannot be toggled');
  }

  /**
   * @summary Displays a notification on the viewer
   * @param {Object|string} config
   * @param {string} [config.id] - unique identifier to use with "hide"
   * @param {string} config.content
   * @param {number} [config.timeout]
   * @fires PSV.show-notification
   *
   * @example
   * viewer.showNotification({ content: 'Hello world', timeout: 5000 })
   * @example
   * viewer.showNotification('Hello world')
   */
  show(config) {
    if (this.prop.timeout) {
      clearTimeout(this.prop.timeout);
      this.prop.timeout = null;
    }

    if (typeof config === 'string') {
      config = { content: config };
    }

    this.prop.contentId = config.id;
    this.content.innerHTML = config.content;

    this.container.classList.add('psv-notification--visible');
    this.prop.visible = true;

    this.psv.trigger(EVENTS.SHOW_NOTIFICATION, config.id);

    if (config.timeout) {
      this.prop.timeout = setTimeout(() => this.hide(config.id), config.timeout);
    }
  }

  /**
   * @summary Hides the notification
   * @param {string} [id]
   * @fires PSV.hide-notification
   */
  hide(id) {
    if (this.isVisible(id)) {
      const contentId = this.prop.contentId;

      this.container.classList.remove('psv-notification--visible');
      this.prop.visible = false;

      this.prop.contentId = undefined;

      this.psv.trigger(EVENTS.HIDE_NOTIFICATION, contentId);
    }
  }

}
