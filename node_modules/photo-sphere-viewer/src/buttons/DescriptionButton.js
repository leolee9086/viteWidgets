import { EVENTS, IDS } from '../data/constants';
import info from '../icons/info.svg';
import { AbstractButton } from './AbstractButton';

const MODE_NOTIF = 1;
const MODE_PANEL = 2;

/**
 * @summary Navigation bar description button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class DescriptionButton extends AbstractButton {

  static id = 'description';
  static icon = info;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-description-button');

    /**
     * @override
     * @property {string} mode - notification or panel
     */
    this.prop = {
      ...this.prop,
      mode: null,
    };

    this.psv.on(EVENTS.HIDE_NOTIFICATION, this);
    this.psv.on(EVENTS.SHOW_NOTIFICATION, this);
    this.psv.on(EVENTS.CLOSE_PANEL, this);
    this.psv.on(EVENTS.OPEN_PANEL, this);
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off(EVENTS.HIDE_NOTIFICATION, this);
    this.psv.off(EVENTS.SHOW_NOTIFICATION, this);
    this.psv.off(EVENTS.CLOSE_PANEL, this);
    this.psv.off(EVENTS.OPEN_PANEL, this);

    super.destroy();
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    if (!this.prop.mode) {
      return;
    }

    let closed = false;
    switch (e.type) {
      case EVENTS.HIDE_NOTIFICATION:
        closed = this.prop.mode === MODE_NOTIF;
        break;

      case EVENTS.SHOW_NOTIFICATION:
        closed = this.prop.mode === MODE_NOTIF && e.args[0] !== IDS.DESCRIPTION;
        break;

      case EVENTS.CLOSE_PANEL:
        closed = this.prop.mode === MODE_PANEL;
        break;

      case EVENTS.OPEN_PANEL:
        closed = this.prop.mode === MODE_PANEL && e.args[0] !== IDS.DESCRIPTION;
        break;

      default:
    }

    if (closed) {
      this.toggleActive(false);
      this.prop.mode = null;
    }
  }

  /**
   * @override
   */
  hide(refresh) {
    super.hide(refresh);

    if (this.prop.mode) {
      this.__close();
    }
  }

  /**
   * This button can only be refresh from NavbarCaption
   * @override
   */
  refreshUi(refresh = false) {
    if (refresh) {
      const caption = this.psv.navbar.getButton('caption', false);
      const captionHidden = caption && !caption.isVisible();
      const hasDescription = !!this.psv.config.description;

      if (captionHidden || hasDescription) {
        this.show(false);
      }
      else {
        this.hide(false);
      }
    }
  }

  /**
   * @override
   * @description Toggles caption
   */
  onClick() {
    if (this.prop.mode) {
      this.__close();
    }
    else {
      this.__open();
    }
  }

  /**
   * @private
   */
  __close() {
    switch (this.prop.mode) {
      case MODE_NOTIF:
        this.psv.notification.hide(IDS.DESCRIPTION);
        break;
      case MODE_PANEL:
        this.psv.panel.hide(IDS.DESCRIPTION);
        break;
      default:
    }
  }

  /**
   * @private
   */
  __open() {
    this.toggleActive(true);

    if (this.psv.config.description) {
      this.prop.mode = MODE_PANEL;
      this.psv.panel.show({
        id     : IDS.DESCRIPTION,
        content: `${this.psv.config.caption ? `<p>${this.psv.config.caption}</p>` : ''}${this.psv.config.description}`,
      });
    }
    else {
      this.prop.mode = MODE_NOTIF;
      this.psv.notification.show({
        id     : IDS.DESCRIPTION,
        content: this.psv.config.caption,
      });
    }
  }

}
