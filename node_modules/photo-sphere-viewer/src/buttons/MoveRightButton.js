import { AbstractMoveButton, getOrientedArrow } from './AbstractMoveButton';

/**
 * @summary Navigation bar move right button class
 * @extends PSV.buttons.AbstractMoveButton
 * @memberof PSV.buttons
 */
export class MoveRightButton extends AbstractMoveButton {

  static id = 'moveRight';
  static icon = getOrientedArrow('right');

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, { longitude: false });
  }

}
