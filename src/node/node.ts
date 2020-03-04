import { EventEmitter } from 'events';
import { Pool } from "../net";

export class Node extends EventEmitter {

    pool!: Pool;

    protected constructor() {
        super();
    }

    /**
     * Emit and log an error.
     * @private
     * @param {Error} err
     */
    protected error(err: Error) {
        console.error(err);
        this.emit('error', err);
    }
}
