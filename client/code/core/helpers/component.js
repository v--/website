import { Component as ReactComponent, PropTypes, createElement } from 'react';
import _ from 'lodash';

import mediator from 'code/core/helpers/mediator';

export class Component extends ReactComponent {
    constructor() {
        super();
        this.unreg = [];
    }

    subscribe(channel, methodName) {
        pre: methodName in this;
        this.unreg.push(mediator.on(channel, this[methodName].bind(this)));
    }

    componentDidMount() {
        this.onUpdate();
    }

    componentDidUpdate() {
        this.onUpdate();
    }

    componentWillReceiveProps(props) {
        this.onProps(props);
    }

    componentWillUnmount() {
        this.onUnmount();
        _.invokeMap(this.unreg, 'call');
    }

    onProps(_props) {}
    onUpdate(_props) {}
    onUnmount() {}
}

export const props = PropTypes;
export const $ = createElement;
