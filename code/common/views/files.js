const { c } = require('common/component')

const section = require('common/components/section')
const coolTable = require('common/components/cool_table')

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

function *userFriendlyEntries(entries) {
    for (const entry of entries) {
        yield {
            name: entry.name,
            type: getFileType(entry),
            size: getFileSize(entry),
            modified: new Date(entry.modified).toLocaleString(),
        }
    }
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

    const columns = [
        {
            label: 'Name',
            prop: 'name',
            link: getLink,
            click(entry) {
                redirect(getLink(entry))
            }
        },

        {
            label: 'Type',
            prop: 'type'
        },

        {
            label: 'Size',
            prop: 'size'
        },

        {
            label: 'Modified',
            prop: 'modified'
        }
    ]

    const fixed = []
    const dynamic = []

    for (const entry of userFriendlyEntries(data.entries)) {
        if (entry.name === '..')
            fixed.push(entry)
        else
            dynamic.push(entry)
    }

    return c('div', { class: 'page files-page' },
        c(section, { title: id },
            c(coolTable, { columns, data: dynamic, fixedData: fixed })
        )
    )
}
