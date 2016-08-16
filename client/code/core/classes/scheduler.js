import { noop } from 'code/core/support/functional';

export default class Scheduler {
    get isRunning() {
        return this.interval !== null;
    }

    constructor(period, callback = null) {
        this.interval = null;
        this.period = period;
        this.callback = callback || noop;
    }

    start() {
        this.stop();
        this.interval = setInterval(this.callback, this.period);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }
}
