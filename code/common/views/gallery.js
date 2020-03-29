import { c } from '../rendering/component.js'
import { ClientError } from '../errors.js'
import { styles } from '../support/dom_properties.js'
import { map } from '../support/iteration.js'
import { QueryConfig } from '../support/query_config.js'

import { link } from '../components/link.js'
import { icon } from '../components/icon.js'
import { pagination } from '../components/pagination.js'
import { sectionTitle } from '../components/section_title.js'

const QUERY_CONFIG_DEFAULTS = Object.freeze({
  per_page: 12,
  page: 1
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  per_page: Number,
  page: Number
})

function getParentGalleryPath (path) {
  if (path.segments.length === 1) {
    return path
  }

  return path.getParentPath()
}

export function gallery ({ data, path }) {
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
  const perPage = config.get('per_page')
  const page = config.get('page')
  const pages = Math.ceil(data.files.length / perPage)

  if (page < 1 || (pages !== 0 && page > pages)) {
    throw new ClientError(`Invalid page index ${page} specified`)
  }

  const pageStart = (page - 1) * perPage
  const sliced = data.files.slice(pageStart, pageStart + perPage)

  return c('div', { class: 'page gallery-page' },
    c('div', null,
      c(sectionTitle, { text: `Index of ${path.underCooked}`,
        path }),
      c('p', null,
        c('span', { text: 'A plain-file media gallery that I use occasionally to avoid crippled compression in media hosting services. All content is ' }),
        c(link, { text: 'CC0', link: 'https://creativecommons.org/share-your-work/public-domain/cc0/' }),
        c('span', { text: '-licensed.' })
      )
    ),

    c('div', { class: 'gallery' },
      ...map(function (file) {
        return c(
          link,
          {
            class: 'gallery-tile',
            link: '/gallery/' + file.url,
            style: styles({ 'background-image': `url('/gallery/.thumbs/${file.thumbnail.replace("'", "\\'")}')` }),
            isInternal: !file.isFile,
            newTab: file.isFile
          },

          c('div', {
            class: 'gallery-tile-title',
            text: file.name
          }),

          file.isFile && file.name.toLowerCase().endsWith('.mp4') && c(icon, {
            class: 'gallery-tile-arrow',
            name: 'play'
          })
        )
      }, sliced)
    ),

    pages > 1 && c('div', { class: 'pagination-wrapper' },
      pagination(pages, config)
    )
  )
}
