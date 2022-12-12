import { AbstractMoveButton, getOrientedArrow } from './AbstractMoveButton';

/**
 * @summary Navigation bar move down button class
 * @extends PSV.buttons.AbstractMoveButton
 * @memberof PSV.buttons
 */
export class MoveDownButton extends AbstractMoveButton {

  static id = 'moveDown';
  static icon = getOrientedArrow('down');

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, { latitude: true });
  }

}
