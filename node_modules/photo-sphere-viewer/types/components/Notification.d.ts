import { AbstractComponent } from './AbstractComponent';

export type NotificationOptions = {
  id?: string;
  content: string;
  timeout?: number;
};

/**
 * @summary Notification class
 */
export class Notification extends AbstractComponent {

  show(config: string | NotificationOptions);

}
