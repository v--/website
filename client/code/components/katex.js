import katex from 'katex';
import { createElement, Component, PropTypes } from 'react';

export default class Jade extends Component {
    static propTypes = {
        string: PropTypes.string.isRequired
    }

    // @override
    render() {
        return createElement('div', {
            dangerouslySetInnerHTML: {
                __html: katex.renderToString(this.props.string)
            }
        });
    }
}
