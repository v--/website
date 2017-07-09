const { c } = require('common/component')

const section = require('common/components/section')
const markdown = require('common/components/markdown')
const table = require('common/components/table')

function getFileType(file) {
    if (file.type === 'directory')
        return 'Directory'

    const extIndex = file.name.lastIndexOf('.')

    if (~extIndex)
        return file.name.slice(extIndex + 1).toUpperCase() + ' file'

    return 'Dotfile'
}

function getFileSize(file) {
    if (file.type === 'directory')
        return '-'

    if (file.size < 1024)
        return `${file.size} Bytes`

    let ratio = file.size / 1024

    for (const size of 'KMGTP') {
        if (ratio < 512)
            return `${ratio.toFixed(2)} ${size}iB`

        ratio /= 1024
    }

    return 'Invalid size'
}

module.exports = function files({ data, id, redirect }) {
    function getLink(entry) {
        if (entry.name === '..') {
            const ancestors = id.split('/')
            ancestors.pop()
            return '/' + ancestors.join('/')
        }

        return `/${id}/${entry.name}`
    }

    function *processEntries(entries) {
        for (const entry of entries)
            yield Object.assign({
                link: getLink(entry),
                internalLink: entry.type === 'directory',
                typeString: getFileType(entry),
                sizeString: getFileSize(entry),
                modifiedRaw: Date.parse(entry.modified),
                modifiedString: new Date(entry.modified).toLocaleString()
            }, entry)
    }

    // TODO: Refactor these bloated column options
    const columns = [
        {
            label: 'Name',
            cssClass: 'col-name',
            raw: 'name',
            value: 'name',
            link: 'link',
            internalLink: 'internalLink',

            click(entry) {
                if (entry.type === 'file')
                    return false

                redirect(getLink(entry))
                return true
            }
        },

        {
            label: 'Type',
            cssClass: 'col-type',
            raw: 'typeString',
            value: 'typeString'
        },

        {
            label: 'Size',
            cssClass: 'col-size',
            raw: 'size',
            value: 'sizeString'
        },

        {
            label: 'Modified',
            cssClass: 'col-modified',
            raw: 'modifiedRaw',
            value: 'modifiedString'
        }
    ]

    const fixed = []
    const dynamic = []

    for (const entry of processEntries(data.entries))
        if (entry.name === '..')
            fixed.push(entry)
        else
            dynamic.push(entry)

    return c('div', { class: 'page files-page' },
        c(section, { title: `Index of /${id}` },
            c(table, { cssClass: 'files-table', columns, data: dynamic, fixedData: fixed }),
            data.readme && c('br'),
            data.readme && c(markdown, { text: data.readme })
        )
    )
}
