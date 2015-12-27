import { createElement, Component } from 'react';

import Navbar from 'code/components/navbar/navbar';
import Section from 'code/components/section';

export default class Main extends Component {
    // @override
    render() {
        return createElement('main', null,
            createElement(Navbar),
            createElement(Section)
        );
    }
}
