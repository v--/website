import _ from 'lodash';

import viewTemplate from 'views/pacman';
import View from 'code/core/helpers/view';
import Jade from 'code/core/components/jade';
import jsonFetcher from 'code/core/helpers/jsonFetcher';
import PacmanPackage from 'code/core/models/pacmanPackage';
import { KEY, KEYSERVERS } from 'code/core/constants/gpgKeys';
import { $ } from 'code/core/helpers/component';

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
        return jsonFetcher('/api/pacman', res => _.map(res, pkg => new PacmanPackage(pkg)));
    }

    get grouppedPackages() {
        return _.groupBy(this.props.data, 'arch');
    }

    // @override
    render() {
        return $(Jade, {
            template: viewTemplate, data: {
                key: KEY,
                packages: this.grouppedPackages,
                keyservers: KEYSERVERS
            }
        });
    }
}
