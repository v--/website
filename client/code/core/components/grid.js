import Vue from 'vue';

import Icon from 'code/core/components/icon';
import GridColumn from 'code/core/classes/grid_column';
import template from 'views/core/components/grid';
import { constructs } from 'code/core/support/functional';
import { direction, clam, percentize } from 'code/core/support/numeric';

const ROWS = 10;

function ascendingComparator(a, b) {
    return a === b ? 0 : direction(a > b);
}

function descendingComparator(a, b) {
    return ascendingComparator(b, a);
}

export default Vue.extend({
    template: template,
    components: { Icon },

    props: {
        sort:       { type: Number, default: 0 },
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
            return context.columns.map(constructs(GridColumn));
        },

        fragment(context) {
            const count = Math.max(1, ROWS - context.staticData.length);
            const start = this.page * count;

            return context.staticData.concat(context.sorted.slice(start, start + count));
        },

        totalWidth(context) {
            return context.parsedColumns.reduce((payload, col) => payload + col.width, 0);
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
            return context.data.slice().sort((a, b) => this.comparator(accessor(a), accessor(b)));
        },

        sortColumn(context) {
            return context.parsedColumns[context.sortBy];
        },

        comparator(context) {
            return context.ascending ? ascendingComparator : descendingComparator;
        }
    },

    methods: {
        changePage(page) {
            const normalized = clam(page, 0, this.pageCount - 1);

            if (normalized > 0 && page === this.page)
                return;

            this.page = normalized;
        },

        updateSort(sort) {
            pre: Math.abs(sort) <= this.columns.length;
            this.sortBy = Math.abs(sort) - 1;
            this.ascending = sort > 0;
        },

        sortIcon(column) {
            if (column !== this.sortColumn)
                return 'sort-both';

            return this.ascending ? 'sort-up' : 'sort-down';
        },

        columnWidth(column) {
            return percentize(column.width / this.totalWidth);
        },

        sortByColumn(index) {
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
        sort() {
            this.updateSort(this.sort);
        },

        data() {
            this.changePage(0);
        }
    },

    mounted() {
        this.updateSort(this.sort);
    }
});
