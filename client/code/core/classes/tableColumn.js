import utils from 'code/core/helpers/utils';

type TableColumnConfig = {
    name: string,
    width: ?number,
    onClick: ?Function,
    accessors: Object
};

export default class TableColumn {
    constructor(config: TableColumnConfig) {
        this.name = config.name;
        this.width = config.width || 1;
        this.onClick = config.onClick || utils.noop;

        const accessors = config.accessors || {},
            valueAccessor = utils.accessor(accessors.value);

        function generateAccessor(key: string) {
            return key in config.accessors ? utils.accessor(accessors[key]) : valueAccessor;
        }

        this.accessors = {
            value:     utils.accessor(accessors.value),
            view:      generateAccessor('view'),
            hyperlink: generateAccessor('hyperlink')
        };

        this.hasLink = 'hyperlink' in accessors;
    }
}
