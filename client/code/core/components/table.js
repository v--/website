import _ from 'lodash';

import Fa from 'code/core/components/fa';
import classSet from 'code/core/helpers/classSet';
import Viewport from 'code/core/helpers/viewport';
import { Component, props, $ } from 'code/core/helpers/component';
import { TABLE_ROW_HEIGHT, PAGINATION_BUTTON_WIDTH } from 'code/core/constants/style';

const ROW_BONUS = 2;

export default class Table extends Component {
    static defaultProps = {
        initialSort: {
            columnIndex: -1,
            ascending: true
        },
        staticData: []
    }

    static propTypes = {
        initialSort: props.shape({
            columnIndex: props.number.isRequired,
            ascending: props.bool
        }),
        columns: props.arrayOf(
            props.shape({
                name: props.string.isRequired,
                accessors: props.shape({
                    currentPage: props.string,
                    value: props.string.isRequired,
                    hyperlink: props.string,
                    click: props.func
                }).isRequired,
                width: props.number
            })
        ).isRequired,
        data: props.array.isRequired,
        viewport: props.instanceOf(Viewport).isRequired,
        staticData: props.array
    }

    static calcWidthPercentages(columns: Array) {
        const widthSum = _(columns).map(col => col.width || 1).sum();
        return _.map(columns, col => (col.width || 1) * 100 / widthSum + '%');
    }

    get viewCount() {
        return Math.max(1, Math.ceil(this.props.data.length / this.perPage));
    }

    get onFirstPage() {
        return this.state.currentPage === 0;
    }

    get onLastPage() {
        return this.state.currentPage === this.viewCount - 1;
    }

    get currentPage() {
        return _.clamp(this.state.currentPage, 0, this.viewCount - 1);
    }

    get perPage() {
        return Math.max(1, Math.floor(this.props.viewport.height / TABLE_ROW_HEIGHT) - this.props.staticData.length - ROW_BONUS);
    }

    get maxPaginationButtons() {
        return Math.max(1, Math.floor(this.props.viewport.width / PAGINATION_BUTTON_WIDTH));
    }

    get widthWeights() {
        const total = this.props.widthWeights.sum();
        return _.map(this.props.widthWeights, x => x / total * 100 + '%');
    }

    constructor() {
        super();

        this.state = {
            currentPage: 0,
            sortedBy: 0,
            ascending: true
        };
    }

    // @override
    render() {
        const { perPage } = this,
            { staticData } = this.props,
            { data } = this.state,
            startIndex = this.currentPage * perPage,
            endIndex = startIndex + perPage;

        return $('table', null,
                $('thead', null,
                    $('tr', null, _.map(this.props.columns, ::this.createColumn)
                )
            ),

            $('tbody', null,
                _.map(staticData.concat(data).slice(startIndex, endIndex), ::this.createRow)
            ),

            $('thead', null,
                $('tr', null,
                    $('th', { colSpan: this.props.columns.length },
                        this.createPagination()
                    )
                )
            )
        );
    }

    // @override
    componentWillMount() {
        const { columnIndex, ascending = true } = this.props.initialSort;
        this.state.currentPage = 0;
        this.state.columnWidths = Table.calcWidthPercentages(this.props.columns);
        this.sort(columnIndex, ascending, this.props.data);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.state.currentPage = 0;
        this.state.columnWidths = Table.calcWidthPercentages(props.columns);
        this.sort(this.state.sortedBy, this.state.ascending, props.data);
    }

    createColumn(column: Object, index: number) {
        const { sortedBy, ascending } = this.state,
            icon = sortedBy === index && (ascending ? 'sort-asc' : 'sort-desc') || 'sort';

        return $('th',
            {
                key: index,
                title: column.name,
                onClick: e => this.sortBy(index, e),
                width: this.state.columnWidths[index]
            },
            $(Fa, { name: icon }),
            $('p', null, column.name)
        );
    }

    createRow(data, index: number) {
        return $('tr', { key: index },
            _.map(this.props.columns, column => this.createRowCell(column, data))
        );
    }

    createRowCell(column: Object, data) {
        const
            accessors = column.accessors,
            currentPage = data[accessors.view || accessors.value],
            hyperlink = accessors.hyperlink && data[accessors.hyperlink];

        return $('td', { key: column.name },
            $(hyperlink === undefined ? 'p' : 'a', {
                title: currentPage,
                href: hyperlink,
                onClick: accessors.click && (e => accessors.click(e, data))
            }, currentPage)
        );
    }

    createPagination() {
        const leftArrow = {
                name: 'chevron-left',
                className: classSet(this.onFirstPage && 'disabled')
            },

            rightArrow = {
                name: 'chevron-right',
                className: classSet(this.onLastPage && 'disabled')
            };

        if (!this.onFirstPage)
            leftArrow.onClick = _.partial(::this.updatePage, this.currentPage - 1);

        if (!this.onLastPage)
            rightArrow.onClick = _.partial(::this.updatePage, this.currentPage + 1);

        return $('div', { className: 'pagination' },
            $(Fa, leftArrow),
            this.createPaginationButtons(),
            $(Fa, rightArrow)
        );
    }

    createPaginationButtons() {
        const buttonCount = _.clamp(this.viewCount, 1, this.maxPaginationButtons),
            deviation = Math.ceil(buttonCount / 2),
            startPage = _.clamp(this.state.currentPage - deviation, 0, this.viewCount - buttonCount);

        return _.times(buttonCount, number =>
                $('span', {
                    key: number,
                    className: classSet(this.currentPage === startPage + number && 'active'),
                    onClick: _.partial(::this.updatePage, startPage + number)
                }, number + 1)
            );
    }

    sort(index: number, ascending: boolean, data: Array) {
        const accessor = _.get(this.props.columns, [index, 'accessors', 'value']);

        this.setState({
            data: accessor === undefined ? data : _.orderBy(data, accessor, ascending ? 'asc' : 'desc'),
            sortedBy: index,
            ascending: ascending
        });
    }

    sortBy(index: number) {
        const ascending = this.state.sortedBy !== index || !this.state.ascending;
        this.sort(index, ascending, this.props.data);
    }

    updatePage(currentPage) {
        if (currentPage !== this.currentPage)
            this.setState({ currentPage });
    }
}
