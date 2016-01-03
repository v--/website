import { createElement } from 'react';

import viewTemplate from 'views/pacman';
import View from 'code/helpers/view';
import Jade from 'code/components/jade';
import jsonFetcher from 'code/helpers/jsonFetcher';
import PacmanPackage from 'code/models/pacmanPackage';
import { KEY, KEYSERVERS } from 'code/constants/gpgKeys';

export default class Pacman extends View {
        // @override
    static get title() {
        return 'pacman';
    }

    // @override
    static get route() {
        return '/pacman';
    }

    // @override
    static get icon() {
        return 'cloud-download';
    }

    // @override
    static generateHeading() {
        return 'pacman repository';
    }

    // @override
    static resolver() {
        return jsonFetcher('/api/pacman', res => res.map(pkg => new PacmanPackage(pkg)));
    }

    get grouppedPackages() {
        return this.props.data.groupBy('arch');
    }

    // @override
    render() {
        return createElement(Jade, {
            template: viewTemplate, data: {
                key: KEY,
                packages: this.grouppedPackages,
                keyservers: KEYSERVERS
            }
        });
    }
}
