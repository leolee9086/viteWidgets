import { EVENTS, IDS } from '../data/constants';
import menuIcon from '../icons/menu.svg';
import { dasherize, getClosest } from '../utils';
import { AbstractButton } from './AbstractButton';

/**
 * @summary Navigation bar menu button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class MenuButton extends AbstractButton {

  static id = 'menu';
  static icon = menuIcon;

  /**
   * @summary Property name added to buttons list
   * @type {string}
   * @constant
   */
  static BUTTON_DATA = 'psvButton';

  /**
   * @summary Menu template
   * @param {AbstractButton[]} buttons
   * @param {PSV.Viewer} psv
   * @param {string} dataKey
   * @returns {string}
   */
  static MENU_TEMPLATE = (buttons, psv, dataKey) => `
<div class="psv-panel-menu psv-panel-menu--stripped">
  <h1 class="psv-panel-menu-title">${menuIcon} ${psv.config.lang.menu}</h1>
  <ul class="psv-panel-menu-list">
    ${buttons.map(button => `
    <li data-${dataKey}="${button.prop.id}" class="psv-panel-menu-item" tabindex="0">
      <span class="psv-panel-menu-item-icon">${button.container.innerHTML}</span>
      <span class="psv-panel-menu-item-label">${button.container.title}</span>
    </li>
    `).join('')}
  </ul>
</div>
`;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-menu-button');

    this.psv.on(EVENTS.OPEN_PANEL, this);
    this.psv.on(EVENTS.CLOSE_PANEL, this);

    super.hide();
  }

  /**
   * @override
   */
  destroy() {
    this.psv.off(EVENTS.OPEN_PANEL, this);
    this.psv.off(EVENTS.CLOSE_PANEL, this);

    super.destroy();
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      // @formatter:off
      case EVENTS.OPEN_PANEL:  this.toggleActive(e.args[0] === IDS.MENU); break;
      case EVENTS.CLOSE_PANEL: this.toggleActive(false); break;
      // @formatter:on
    }
    /* eslint-enable */
  }

  /**
   * @override
   */
  hide(refresh) {
    super.hide(refresh);
    this.__hideMenu();
  }

  /**
   * @override
   */
  show(refresh) {
    super.show(refresh);

    if (this.prop.active) {
      this.__showMenu();
    }
  }

  /**
   * @override
   * @description Toggles menu
   */
  onClick() {
    if (this.prop.active) {
      this.__hideMenu();
    }
    else {
      this.__showMenu();
    }
  }

  __showMenu() {
    this.psv.panel.show({
      id          : IDS.MENU,
      content     : MenuButton.MENU_TEMPLATE(this.parent.collapsed, this.psv, dasherize(MenuButton.BUTTON_DATA)),
      noMargin    : true,
      clickHandler: (e) => {
        const li = e.target ? getClosest(e.target, 'li') : undefined;
        const buttonId = li ? li.dataset[MenuButton.BUTTON_DATA] : undefined;

        if (buttonId) {
          this.parent.getButton(buttonId).onClick();
          this.__hideMenu();
        }
      },
    });
  }

  __hideMenu() {
    this.psv.panel.hide(IDS.MENU);
  }

}
