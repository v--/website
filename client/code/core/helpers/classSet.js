import _ from 'lodash';

export default function classSet(...classes) {
    return _.compact(classes).join(' ');
}
