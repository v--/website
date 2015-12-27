export default class Dispatcher {
    static error = new Dispatcher();
    static view = new Dispatcher();
    static nav = new Dispatcher();
    static resize = new Dispatcher();
    static keyDown = new Dispatcher();

    constructor() {
        this.listeners = [];
    }

    register(listener: Function) {
        this.listeners.push(listener);
        return (::this.unregister).partial(listener);
    }

    unregister(listener: Function) {
        const index = this.listeners.indexOf(listener);
        delete this.listeners[index];
    }

    dispatch(...messages) {
        this.listeners.forEach(listener => listener(...messages));
    }
}

window.addEventListener('resize', function() {
    Dispatcher.resize.dispatch({ width: innerWidth, height: innerHeight });
});

window.addEventListener('keydown', function(e) {
    Dispatcher.keyDown.dispatch(e);
});
