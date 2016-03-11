import { Component, props, $ } from 'code/core/helpers/component';

export default class Jade extends Component {
    static propTypes = {
        template: props.func.required,
        data: props.any
    }

    // @override
    render() {
        return $('div', {
            dangerouslySetInnerHTML: {
                __html: this.props.template(this.props.data)
            }
        });
    }
}
