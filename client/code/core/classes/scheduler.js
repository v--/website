import utils from 'code/core/helpers/utils';

export default class Scheduler {
    get isRunning() {
        return this.interval !== null;
    }

    constructor(period: number, callback: Function | null = null) {
        this.interval = null;
        this.period = period;
        this.callback = callback || utils.noop;
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
