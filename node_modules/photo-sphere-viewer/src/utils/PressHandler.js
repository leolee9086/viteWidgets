/**
 * @summary Helper for pressable things (buttons, keyboard)
 * @description When the pressed thing goes up and was not pressed long enough, wait a bit more before execution
 * @private
 */
export class PressHandler {

  constructor(delay = 200) {
    this.delay = delay;
    this.time = 0;
    this.timeout = null;
  }

  down() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.time = new Date().getTime();
  }

  up(cb) {
    if (!this.time) {
      return;
    }

    const elapsed = new Date().getTime() - this.time;
    if (elapsed < this.delay) {
      this.timeout = setTimeout(() => {
        cb();
        this.timeout = null;
        this.time = 0;
      }, this.delay);
    }
    else {
      cb();
      this.time = 0;
    }
  }

}
