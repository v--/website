import { createElement, Component, PropTypes } from 'react';

import Fa from 'code/components/fa';
import classSet from 'code/helpers/classSet';
import Viewport from 'code/helpers/viewport';
import { TABLE_ROW_HEIGHT, PAGINATION_BUTTON_WIDTH } from 'code/constants/style';

export default class Table extends Component {
    static defaultProps = {
        staticData: [],
        perPageTransform: Function.identity
    }

    static propTypes = {
        columns: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                accessors: PropTypes.shape({
                    currentPage: PropTypes.string,
                    value: PropTypes.string.isRequired,
                    hyperlink: PropTypes.string,
                    click: PropTypes.func
                }).isRequired,
                width: PropTypes.number
            })
        ).isRequired,
        data: PropTypes.array.isRequired,
        viewport: PropTypes.instanceOf(Viewport).isRequired,
        staticData: PropTypes.array,
        perPageTransform: PropTypes.func
    }

    static calcWidthPercentages(columns: Array) {
        const widthSum = columns.sum(col => col.width || 1);
        return columns.map(col => (col.width || 1) * 100 / widthSum + '%');
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
        return this.state.currentPage.cap(this.viewCount - 1);
    }

    get perPage() {
        return Math.max(1, this.props.perPageTransform(
            Math.floor(this.props.viewport.height / TABLE_ROW_HEIGHT)
        ) - this.props.staticData.length);
    }

    get maxPaginationButtons() {
        return Math.max(1, Math.floor(this.props.viewport.width / PAGINATION_BUTTON_WIDTH));
    }

    get widthWeights() {
        const total = this.props.widthWeights.sum();
        return this.props.widthWeights.map(x => x / total * 100 + '%');
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

        return createElement('table', null,
            createElement('thead', null,
                createElement('tr', null,
                    this.props.columns.map(::this.createColumn)
                )
            ),

            createElement('thead', null,
                createElement('tr', null,
                    createElement('th', { colSpan: this.props.columns.length },
                        this.createPagination()
                    )
                )
            ),

            createElement('tbody', null,
                staticData.concat(data.slice(startIndex, endIndex)).map(::this.createRow)
            )
        );
    }

    // @override
    componentWillMount() {
        this.state.columnWidths = Table.calcWidthPercentages(this.props.columns);
        this.sortBy(this.state.sortedBy);
    }

    // @override
    componentWillReceiveProps(props: Object) {
        this.state.columnWidths = Table.calcWidthPercentages(props.columns);
        this.sort(this.state.sortedBy, this.state.ascending, props.data);
    }

    createColumn(column: Object, index: number) {
        const { sortedBy, ascending } = this.state,
            icon = sortedBy === index && (ascending ? 'sort-asc' : 'sort-desc') || 'sort';

        return createElement('th',
            {
                key: index,
                title: column.name,
                onClick: e => this.sortBy(column.name, e),
                width: this.state.columnWidths[index]
            },
            createElement(Fa, { name: icon }),
            createElement('p', null, column.name)
        );
    }

    createRow(data, index: number) {
        return createElement('tr', { key: index },
            this.props.columns.map(column => this.createRowCell(column, data))
        );
    }

    createRowCell(column: Object, data) {
        const
            accessors = column.accessors,
            currentPage = data[accessors.view || accessors.value],
            hyperlink = accessors.hyperlink && data[accessors.hyperlink];

        return createElement('td', { key: column.name },
            createElement(hyperlink === undefined ? 'p' : 'a', {
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
            leftArrow.onClick = (::this.updatePage).partial(this.currentPage - 1);

        if (!this.onLastPage)
            rightArrow.onClick = (::this.updatePage).partial(this.currentPage + 1);

        return createElement('div', { className: 'pagination' },
            createElement(Fa, leftArrow),
            this.createPaginationButtons(),
            createElement(Fa, rightArrow)
        );
    }

    createPaginationButtons() {
        const buttonCount = this.viewCount.cap(this.maxPaginationButtons),
            deviation = Math.ceil(buttonCount / 2),
            startPage = (this.state.currentPage - deviation).clamp(0, this.viewCount - buttonCount);

        return Array.generate(buttonCount, i => startPage + i).map(number =>
            createElement('span', {
                key: number,
                className: classSet(this.currentPage === number && 'active'),
                onClick: (::this.updatePage).partial(number)
            }, number + 1)
        );
    }

    sort(index: number, ascending: boolean, data: Array) {
        const accessor = this.props.columns[index].accessors.value;

        this.setState({
            data: data.sortBy(accessor, !ascending),
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
