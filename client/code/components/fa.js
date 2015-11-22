import { createElement, Component, PropTypes } from 'react';

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
        name: PropTypes.string.isRequired,
        title: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        spin: PropTypes.bool,
        fixedWidth: PropTypes.bool,
        horizontalFlip: PropTypes.bool,
        verticalFlip: PropTypes.bool,
        onClick: PropTypes.func
    };

    // @override
    render() {
        const { name, spin, fixedWidth, horizontalFlip, verticalFlip } = this.props,
            classes = ['fa', `fa-${name}`],
            outerProps = this.props.select('title', 'className', 'style', 'onClick'),
            innerProps = {};

        if (fixedWidth) classes.push('fa-fw');
        if (spin) classes.push('fa-spin');
        if (horizontalFlip) classes.push(`fa-flip-horizontal`);
        if (verticalFlip) classes.push(`fa-flip-vertical`);
        innerProps.className = classes.join(' ');

        return createElement('span', outerProps,
            createElement('span', innerProps)
        );
    }
}
