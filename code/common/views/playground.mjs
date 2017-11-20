import { c } from '../component'
import section from '../components/section'
import markdown from '../components/markdown'

export default function playground() {
    return c('div', { class: 'page playground-page' },
        c(section, { title: '/playground' },
            c(markdown, {
                text: 'uhmmm'
            })
        )
    )
}
