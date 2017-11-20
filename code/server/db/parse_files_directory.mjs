import path from 'path'

import { stat, readFile, readdir } from '../support/fs'
import { startsWith } from '../../common/support/strings'
import { NotFoundError } from '../../common/errors'

export default async function parseFilesDirectory(basePath, id) {
    const filesPath = path.join(basePath, id.substr('files/'.length))
    const result = {
        entries: [],
        readme: null
    }

    let files

    try {
        files = await readdir(filesPath, 'utf8')
    } catch (e) {
        if (e.code === 'ENOENT' || e.code === 'ENOTDIR')
            throw new NotFoundError(id)
        else
            throw e
    }

    const parentStat = await stat(filesPath)

    if (id !== 'files')
        result.entries.push({
            name: '..',
            isFile: false,
            modified: parentStat.mtime,
            size: parentStat.size
        })

    for (const name of files) {
        const childStat = await stat(path.join(filesPath, name))

        if (name === '.readme.md')
            result.readme = await readFile(path.join(filesPath, name), 'utf8')

        if (startsWith(name, '.'))
            continue

        result.entries.push({
            name,
            isFile: childStat.isFile(),
            modified: childStat.mtime,
            size: childStat.size
        })
    }

    return result
}
