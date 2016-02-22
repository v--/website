import _ from 'lodash';

import { Component, props, $ } from 'code/core/helpers/component';

export default class Fa extends Component {
    static defaultProps = {
        title: '',
        className: '',
        style: {},
        spin: false,
        fixedWidth: false,
        horizontalFlip: false,
        verticalFlip: false,
        onClick: null
    };

    static propTypes = {
        name: props.string.isRequired,
        title: props.string,
        className: props.string,
        style: props.object,
        spin: props.bool,
        fixedWidth: props.bool,
        horizontalFlip: props.bool,
        verticalFlip: props.bool,
        onClick: props.func
    };

    // @override
    render() {
        const { name, spin, fixedWidth, horizontalFlip, verticalFlip } = this.props,
            classes = ['fa', `fa-${name}`],
            outerProps = _.pick(this.props, ['title', 'className', 'style', 'onClick']),
            innerProps = {};

        if (fixedWidth) classes.push('fa-fw');
        if (spin) classes.push('fa-spin');
        if (horizontalFlip) classes.push(`fa-flip-horizontal`);
        if (verticalFlip) classes.push(`fa-flip-vertical`);
        innerProps.className = classes.join(' ');

        return $('span', outerProps, $('span', innerProps));
    }
}
