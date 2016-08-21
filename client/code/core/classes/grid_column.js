import { noop, accessor } from 'code/core/support/functional';

export default class GridColumn {
    constructor({ name, width = 1, onClick = noop, accessors = {}}) {
        Object.assign(this, { name, width, onClick });
        const valueAccessor = accessor(accessors.value);

        function generateAccessor(key) {
            return key in accessors ? accessor(accessors[key]) : valueAccessor;
        }

        this.accessors = {
            value:     valueAccessor,
            view:      generateAccessor('view'),
            hyperlink: generateAccessor('hyperlink')
        };

        this.hasLink = 'hyperlink' in accessors;
        Object.freeze(this);
    }
}
