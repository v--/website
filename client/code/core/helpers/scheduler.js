import _ from 'lodash';

export default class Scheduler {
    get isRunning() {
        return this._interval !== null;
    }

    constructor(period: number, callback: Function) {
        this._interval = null;
        _.merge(this, { period, callback });
    }

    start() {
        this._interval = setInterval(this.callback, this.period);
    }

    stop() {
        clearInterval(this._interval);
        this._interval = null;
    }
}
