import Vue from 'vue';

import Icon from 'code/core/components/icon';
import TableColumn from 'code/core/classes/tableColumn';
import utils from 'code/core/helpers/utils';
import template from 'views/core/components/table';

const ROWS = 10;

function ascendingComparator(a, b) {
    if (a === b)
        return 0;

    return a > b ? 1 : -1;
}

function descendingComparator(a, b) {
    return ascendingComparator(b, a);
}

export default Vue.extend({
    name: 'i-table',
    template: template,
    components: [Icon],

    props: {
        sort:       { type: Number, default: 1 },
        columns:    { type: Array, required: true },
        data:       { type: Array, required: true },
        staticData: { type: Array, default: () => [] }
    },

    data: () => ({
        page: 0,
        sortBy: -1,
        ascending: true
    }),

    computed: {
        parsedColumns(context) {
            return context.columns.map(utils.constructs(TableColumn));
        },

        fragment(context) {
            const count = Math.max(1, ROWS - context.staticData.length),
                start = this.page * count;

            return context.staticData.concat(context.sorted.slice(start, start + count));
        },

        widthCoefficient(context) {
            return 100 / context.parsedColumns.reduce((payload, col) => payload + col.width, 0);
        },

        pageCount(context) {
            const total = context.data.length + context.staticData.length;
            return Math.ceil(total / ROWS);
        },

        pages(context) {
            return Array.from({ length: context.pageCount }, (_key, page) => page);
        },

        sorted(context) {
            if (this.sortBy === -1)
                return context.data;

            const accessor = context.sortColumn.accessors.value;
            return context.data.sort((a, b) => this.comparator(accessor(a), accessor(b)));
        },

        sortColumn(context) {
            return context.parsedColumns[context.sortBy];
        },

        comparator(context) {
            return context.ascending ? ascendingComparator : descendingComparator;
        }
    },

    methods: {
        changePage(page: number) {
            const normalized = utils.clam(page, 0, this.pageCount - 1);

            if (normalized > 0 && page === this.page)
                return;

            this.page = normalized;
        },

        updateSort(sort: number) {
            pre: Math.abs(sort) <= this.columns.length;
            this.sortBy = Math.abs(sort) - 1;
            this.ascending = sort > 0;
        },

        sortIcon(column: TableColumn) {
            if (column !== this.sortColumn)
                return 'sort-both';

            return this.ascending ? 'sort-up' : 'sort-down';
        },

        columnWidth(column: TableColumn) {
            return `${column.width * this.widthCoefficient}%`;
        },

        sortByColumn(index: number) {
            if (this.sortBy === index) {
                this.ascending = !this.ascending;
            } else {
                this.sortBy = index;
                this.ascending = true;
            }
        },

        onClick($event, column, row) {
            column.onClick.call(this, $event, row);
        }
    },

    watch: {
        sort: function () {
            this.updateSort(this.sort);
        },

        data: function () {
            this.changePage(0);
        }
    },

    ready() {
        this.updateSort(this.sort);
    }
});
