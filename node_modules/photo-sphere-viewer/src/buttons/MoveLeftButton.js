import { AbstractMoveButton, getOrientedArrow } from './AbstractMoveButton';

/**
 * @summary Navigation bar move left button class
 * @extends PSV.buttons.AbstractMoveButton
 * @memberof PSV.buttons
 */
export class MoveLeftButton extends AbstractMoveButton {

  static id = 'moveLeft';
  static icon = getOrientedArrow('left');

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, { longitude: true });
  }

}
