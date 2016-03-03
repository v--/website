import _ from 'lodash';

export class Dispatcher {
    constructor() {
        this.listeners = [];
        this.nonces = [];
    }

    register(listener: Function) {
        this.listeners.push(listener);
        return _.partial(::this.unregister, listener);
    }

    once(listener: Function) {
        this.nonces.push(listener);
        return _.partial(::this.unregister, listener);
    }

    unregister(listener: Function) {
        pre: this.listeners.indexOf(listener) !== -1;
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    dispatch(...message) {
        _.invokeMap(this.listeners, 'apply', window, message);
        _.forEach(this.nonces, listener => {
            listener(...message);
            this.unregister(listener);
        });
    }

    destroy() {
        _.forEach(this.listeners, ::this.unregister);
        _.forEach(this.nonces, ::this.unregister);
    }
}

export class Mediator {
    constructor() {
        this.channels = {};
    }

    emit(channel: string, ...message) {
        if (channel in this.channels)
            this.channels[channel].dispatch(...message);
    }

    on(channel: string, listener: Function) {
        if (!(channel in this.channels)) {
            this.channels[channel] = new Dispatcher();
        }

        return this.channels[channel].register(listener);
    }

    once(channel: string, listener: Function) {
        if (!(channel in this.channels)) {
            this.channels[channel] = new Dispatcher();
        }

        return this.channels[channel].once(listener);
    }

    off(channel: string, listener: ?Function) {
        pre: channel in this.channels;

        if (listener)
            this.channels[channel].dispatch(listener);
        else
            this.channels[channel].destroy();
    }
}

const mediator = new Mediator();

window.addEventListener('resize', function () {
    mediator.emit('resize', window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', function (e) {
    mediator.emit('key:down', e);
});

export default mediator;
