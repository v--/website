import { c } from '../rendering/component.js'
import { anchor } from '../components/anchor.js'

export function ccNotice() {
  return c('div', { class: 'cc-notice' },
    c('b', { text: 'Notice: ' }),
    c('span', { text: 'Unless specifically noted otherwise, all content on this page is licensed under ' }),
    c(anchor, { text: 'CC0', href: 'https://creativecommons.org/share-your-work/public-domain/cc0/' }),
    c('span', { text: ', i.e. it is free for modification and redistribution.' })
  )
}
