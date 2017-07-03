const { map } = require('common/support/itertools')
const { c } = require('common/component')

const section = require('common/components/section')
const text = require('common/components/text')
const link = require('common/components/link')

function pkg({ name, version }) {
    return c('li', { class: 'package' },
        c('span', { text: name }),
        c('span', { text: ' ' }),
        c('span', { text: version })
    )
}

function packages({ arch, packages }) {
    return c('div', { class: 'packages' },
        c('h2', { text: arch }),
        c('ul', null, ...map(c.bind(null, pkg), packages))
    )
}

const PGP_KEY = '53065C70'

module.exports = function pacman({ data }) {
    const arches = new Map()

    for (const pkg of data)
        if (!arches.has(pkg.arch))
            arches.set(pkg.arch, [pkg])
        else
            arches.get(pkg.arch).push(pkg)

    return c('div', { class: 'page pacman-page' },
        c(section, { title: 'pacman repository' },
            c(text, {
                text: 'The repo contains a variety of packages, mostly my own software and AUR builds.'
            }),

            c(text, {
                text: 'I mantain "any" and "x86_64" repos. "x86_64" includes packages from "any". $arch can be overridden by both.'
            }),

            c('pre', null,
                c('code', {
                    text: '[ivasilev]\nServer = https://ivasilev.net/pacman/$arch'
                })
            )
        ),

        c(section, { title: 'Package verification' },
            c(text, {
                text: [
                    `All packages are signed, so you can import my PGP key (${PGP_KEY}) into the pacman keychain and use it to verify my packages.`,
                    'The key can be downloaded from:'
                ].join(' ')
            }),

            c('ul', null,
                c('li', null, c(link, { href: 'https://ivasilev.net/files/ianis@ivasilev.net.asc' })),
                c('li', null, c(link, { href: 'https://pgp.mit.edu/pks/lookup?op=vindex&search=0x30C4A2E653065C70' }))
            )
        ),

        c(section, { title: 'Packages' },
            ...map(([arch, pkgs]) => c(packages, { arch, packages: pkgs }), arches.entries())
        )
    )
}
