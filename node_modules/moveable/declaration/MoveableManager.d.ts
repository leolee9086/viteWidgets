import { MoveableInterface, MoveableOptions, MoveableProperties } from "react-moveable/types";
import { MoveableEventsParameters } from "./types";
import EventEmitter from "@scena/event-emitter";
/**
 * Moveable is Draggable! Resizable! Scalable! Rotatable!
 * @sort 1
 * @alias Moveable
 * @extends EventEmitter
 */
declare class MoveableManager extends EventEmitter<MoveableEventsParameters> {
    private innerMoveable;
    private tempElement;
    /**
     *
     */
    constructor(parentElement: HTMLElement | SVGElement, options?: MoveableOptions);
    setState(state: Partial<MoveableOptions>, callback?: () => any): void;
    forceUpdate(callback?: () => any): void;
    dragStart(e: MouseEvent | TouchEvent): void;
    destroy(): void;
    private getMoveable;
}
interface MoveableManager extends MoveableInterface, MoveableProperties {
}
export default MoveableManager;
