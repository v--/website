const { c } = require('common/component')
const { zip, range } = require('common/support/iteration')
const { partial } = require('common/support/functions')
const { Observable } = require('common/support/observation')
const classlist = require('common/support/classlist')

const icon = require('common/components/icon')
const link = require('common/components/link')

const MAXIMUM_ITEMS_PER_PAGE = 10

function sliceData({ columns, data, fixedData, sorting, page }) {
    const column = columns[Math.abs(sorting) - 1]
    const ascending = sorting > 0 ? 1 : -1

    function comparator(a, b) {
        if (a[column.raw] === b[column.raw])
            return 0

        return ascending * (a[column.raw] > b[column.raw] ? 1 : -1)
    }

    const pageStart = (page - 1) * MAXIMUM_ITEMS_PER_PAGE
    const fixed = Array.from(fixedData).sort(comparator)
    const dynamic = Array.from(data).sort(comparator)
        .slice(pageStart, pageStart + MAXIMUM_ITEMS_PER_PAGE - fixed.length)

    return fixed.concat(dynamic)
}

class TableObservable extends Observable {
    constructor(initialState) {
        super(initialState)

        this.current.sorting = 1
        this.current.page = 1
        this.current.sliced = sliceData(this.current)

        this.current.sort = function (sorting) {
            this.update({ sorting, sliced: sliceData(Object.assign({}, this.current, { sorting })) })
        }.bind(this)

        this.current.goToPage = function (page) {
            this.update({ page, sliced: sliceData(Object.assign({}, this.current, { page })) })
        }.bind(this)
    }
}

function *headers(columns, sorting, sort) {
    for (const [i, column] of zip(range(1, columns.length + 1), columns)) {
        let iconName

        if (Math.abs(sorting) === i)
            iconName = sorting > 0 ? 'sort-ascending' : 'sort-descending'
        else
            iconName = 'sort-variant'

        yield c('th', { class: column.cssClass, title: column.label, click() { sort(Math.abs(sorting) === i ? -sorting : i) } },
            c('span', { class: 'heading' },
                c(icon, { name: iconName }),
                c('span', { text: column.label })
            )
        )
    }
}

function *row(columns, datum) {
    for (const column of columns) {
        const value = datum[column.value]

        const context =  { text: value }

        if ('click' in column)
            context.click = function (e) {
                if (column.click(datum))
                    e.preventDefault()
            }

        if ('link' in column) {
            context.link = datum[column.link]
            context.internal = datum[column.internalLink]
        }

        yield c('td', { title: value, class: column.cssClass },
            c('link' in context ? link : 'span', context)
        )
    }
}

function *rows(columns, data) {
    for (const datum of data)
        yield c('tr', null, ...row(columns, datum))
}

function *pagination(pages, page, goToPage) {
    yield c('button',
        {
            disabled: page === 1,
            class: 'paginator paginator-prev',
            click: partial(goToPage, page - 1)
        },
        c(icon, {
            name: 'chevron-left'
        })
    )

    for (let i = 1; i <= pages; i++)
        yield c('button',
            {
                disabled: page === i,
                class: 'paginator',
                click: partial(goToPage, i)
            },
            c('span', { text: String(i) })
        )

    yield c('button',
        {
            disabled: page === pages,
            class: 'paginator paginator-next',
            click: partial(goToPage, page + 1)
        },
        c(icon, {
            name: 'chevron-left'
        })
    )
}

function tableImpl({ columns, cssClass, data, page, goToPage, sliced, sorting, sort }) {
    const pages = Math.ceil(data.length / MAXIMUM_ITEMS_PER_PAGE)

    return c('table', { class: classlist('cool-table', cssClass) },
        c('thead', null,
            c('tr', null, ...headers(columns, sorting, sort))
        ),

        c('tbody', null, ...rows(columns, sliced)),
        pages > 1 && c('thead', null,
            c('tr', null,
                c('td', { colspan: '4' },
                    c('div', { class: 'pagination' },
                        ...pagination(pages, page, goToPage)
                    )
                )
            )
        )
    )
}

module.exports = function table({ cssClass, columns, data, fixedData = [] }) {
    const observable = new TableObservable({ cssClass, columns, data, fixedData })
    return c(tableImpl, observable)
}
