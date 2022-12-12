/**
 * @summary Loading task
 * @memberOf PSV.adapters
 * @private
 */
export class Task {

  static STATUS = {
    DISABLED : -1,
    PENDING  : 0,
    RUNNING  : 1,
    CANCELLED: 2,
    DONE     : 3,
    ERROR    : 4,
  };

  /**
   * @param {string} id
   * @param {number} priority
   * @param {function(Task): Promise} fn
   */
  constructor(id, priority, fn) {
    this.id = id;
    this.priority = priority;
    this.fn = fn;
    this.status = Task.STATUS.PENDING;
  }

  start() {
    this.status = Task.STATUS.RUNNING;
    return this.fn(this)
      .then(() => {
        this.status = Task.STATUS.DONE;
      }, () => {
        this.status = Task.STATUS.ERROR;
      });
  }

  cancel() {
    this.status = Task.STATUS.CANCELLED;
  }

  isCancelled() {
    return this.status === Task.STATUS.CANCELLED;
  }

}
