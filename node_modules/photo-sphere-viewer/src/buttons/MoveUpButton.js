import { AbstractMoveButton, getOrientedArrow } from './AbstractMoveButton';

/**
 * @summary Navigation bar move up button class
 * @extends PSV.buttons.AbstractMoveButton
 * @memberof PSV.buttons
 */
export class MoveUpButton extends AbstractMoveButton {

  static id = 'moveUp';
  static icon = getOrientedArrow('up');

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, { latitude: false });
  }

}
