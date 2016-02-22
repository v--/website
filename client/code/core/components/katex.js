import katex from 'katex';

import { Component, props, $ } from 'code/core/helpers/component';

export default class Katex extends Component {
    static propTypes = {
        string: props.string.isRequired
    }

    // @override
    render() {
        return $('div', {
            dangerouslySetInnerHTML: {
                __html: katex.renderToString(this.props.string)
            }
        });
    }
}
