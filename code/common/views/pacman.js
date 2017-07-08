const { map } = require('common/support/itertools')
const { c } = require('common/component')

const section = require('common/components/section')
const markdown = require('common/components/markdown')

function pkg({ name, version, description }) {
    return c('li', { class: 'package' },
        c('span', { text: `${name} ${version}: ${description}` }),
    )
}

function packages({ arch, packages }) {
    return c('div', { class: 'packages' },
        c('h2', { text: arch }),
        c('ul', null, ...map(c.bind(null, pkg), packages))
    )
}

const PGP_FINGERPRINT = 'DD4D0AEFDDAF29CCE3B5865D30C4A2E653065C70'
const PGP_KEY_ID_SHORT = PGP_FINGERPRINT.substr(PGP_FINGERPRINT.length - 8)

module.exports = function pacman({ data }) {
    const arches = new Map()

    for (const pkg of data)
        if (!arches.has(pkg.arch))
            arches.set(pkg.arch, [pkg])
        else
            arches.get(pkg.arch).push(pkg)

    return c('div', { class: 'page pacman-page' },
        c(section, { title: 'Pacman repository' },
            c(markdown, {
                text: 'The repo contains a variety of packages, mostly my own software and AUR builds.'
            }),

            c(markdown, {
                text: 'I mantain `any` and `x86_64` repos. `x86_64` includes packages from `any`. `$arch` can be overridden by both.'
            }),

            c('pre', null,
                c('code', {
                    text: '[ivasilev]\nServer = https://ivasilev.net/pacman/$arch'
                })
            ),

            c(markdown, {
                text: `All packages are signed and can be verified using my PGP public key [${PGP_KEY_ID_SHORT}](https://pgp.mit.edu/pks/lookup?op=vindex&search=0x${PGP_FINGERPRINT}).`
            })
        ),

        c(section, { title: 'Packages' },
            ...map(([arch, pkgs]) => c(packages, { arch, packages: pkgs }), arches.entries())
        )
    )
}
