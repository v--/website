import { Component as ReactComponent, PropTypes, createElement } from 'react';
import _ from 'lodash';

import CoolError from 'code/core/helpers/coolError';
import mediator from 'code/core/helpers/mediator';

export class Component extends ReactComponent {
    constructor() {
        super();
        this.unreg = [];
    }

    subscribe(channel, methodName) {
        if (methodName in this)
            this.unreg.push(mediator.on(channel, this[methodName].bind(this)));
        else
            throw new CoolError('Invalid method name ' + methodName);
    }

    componentWillUnmount() {
        this.onUnmount();
        _.invokeMap(this.unreg, 'call');
    }

    onUnmount() {}
}

export const props = PropTypes;
export const $ = createElement;
