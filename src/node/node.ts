import { EventEmitter } from 'events';

export class Node extends EventEmitter {
    protected constructor() {
        super();
    }

    /**
     * Emit and log an error.
     * @private
     * @param {Error} err
     */
    protected error(err: Error): void {
        this.emit('error', err);
    }
}
