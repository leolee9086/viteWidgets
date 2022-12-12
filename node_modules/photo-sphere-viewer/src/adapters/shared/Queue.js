import { Task } from './Task';

/**
 * @summary Loading queue
 * @memberOf PSV.adapters
 * @private
 */
export class Queue {

  /**
   * @param {int} concurency
   */
  constructor(concurency = 4) {
    this.concurency = concurency;
    this.runningTasks = {};
    this.tasks = {};
  }

  enqueue(task) {
    this.tasks[task.id] = task;
  }

  clear() {
    Object.values(this.tasks).forEach(task => task.cancel());
    this.tasks = {};
    this.runningTasks = {};
  }

  setPriority(taskId, priority) {
    const task = this.tasks[taskId];
    if (task) {
      task.priority = priority;
      if (task.status === Task.STATUS.DISABLED) {
        task.status = Task.STATUS.PENDING;
      }
    }
  }

  disableAllTasks() {
    Object.values(this.tasks).forEach((task) => {
      task.status = Task.STATUS.DISABLED;
    });
  }

  start() {
    if (Object.keys(this.runningTasks).length >= this.concurency) {
      return;
    }

    const nextTask = Object.values(this.tasks)
      .filter(task => task.status === Task.STATUS.PENDING)
      .sort((a, b) => b.priority - a.priority)
      .pop();

    if (nextTask) {
      this.runningTasks[nextTask.id] = true;

      nextTask.start()
        .then(() => {
          if (!nextTask.isCancelled()) {
            delete this.tasks[nextTask.id];
            delete this.runningTasks[nextTask.id];
            this.start();
          }
        });

      this.start(); // start tasks until max concurrency is reached
    }
  }

}
