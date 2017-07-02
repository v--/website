const { XMLComponent } = require('common/component')

class SVGComponent extends XMLComponent {
    get namespace() {
        return 'http://www.w3.org/2000/svg'
    }
}

class PipelineObservable {
    constructor(def) {
        this.default = def
        this.observers = new Set()
    }

    subscribe(observer) {
        this.observers.add(observer)
    }

    unsubscribe(observer) {
        this.observers.delete(observer)
    }

    emit(value) {
        for (const observer of this.observers)
            observer.next(value)
    }

    complete() {
        for (const observer of this.observers)
            observer.complete()
    }
}

module.exports = function icon() {
    const observable = new PipelineObservable({ href: 'images/icons.svg#sort-descending' })
    let ascending = false

    function update() {
        if (ascending)
            observable.emit({ href: 'images/icons.svg#sort-descending' })
        else
            observable.emit({ href: 'images/icons.svg#sort-ascending' })

        ascending = !ascending
    }

    return SVGComponent.safeCreate('svg', { viewBox: '0 0 20 20', click: update },
        SVGComponent.safeCreate('use', observable)
    )
}
