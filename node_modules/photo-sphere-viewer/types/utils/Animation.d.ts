export type AnimationOptions<T> = {
  properties: { [key in keyof T]: { start: number, end: number } };
  duration: number;
  delay?: number;
  easing?: string | ((progress: number) => number);
  onTick: (properties: { [key in keyof T]: number }, progress: number) => void;
};

/**
 * @summary Interpolation helper for animations
 * @description
 * Implements the Promise API with an additional "cancel" method.
 * The promise is resolved when the animation is complete and rejected if the animation is cancelled.
 */
export class Animation<T> implements PromiseLike<boolean> {

  constructor(options: AnimationOptions<T>);

  then<TResult = boolean>(onFulfilled?: ((completed: boolean) => TResult | PromiseLike<TResult>) | undefined | null): PromiseLike<TResult>;

  cancel();

}
