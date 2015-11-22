import { createElement, Component, PropTypes } from 'react';

export default class Jade extends Component {
    static propTypes = {
        template: PropTypes.func.isRequired,
        data: PropTypes.any
    }

    // @override
    render() {
        return createElement('div', {
            dangerouslySetInnerHTML: {
                __html: this.props.template(this.props.data)
            }
        });
    }
}
