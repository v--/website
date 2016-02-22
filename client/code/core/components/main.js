import Navbar from 'code/core/components/navbar/navbar';
import Section from 'code/core/components/section';
import { Component, $ } from 'code/core/helpers/component';

export default class Main extends Component {
    // @override
    render() {
        return $('main', null, $(Navbar), $(Section));
    }
}
