import { map } from '../support/iteration.js'
import { c } from '../rendering/component.js'
import { pgpAnchor } from '../components/pgp_anchor.js'
import { sectionTitle } from '../components/section_title.js'

/**
 * @param {TPacmanPackages.IPackage[]} pkgs
 */
function * iterPackages(pkgs) {
  for (const { name, version, desc } of pkgs) {
    yield c('dt', { text: `${name} (version ${version})` })
    yield c('dd', { text: desc })
  }
}

/**
 * @param {{ arch: TPacmanPackages.Architecture, pkgs: TPacmanPackages.IPackage[] }} param1
 */
function packages({ arch, pkgs }) {
  return c('div', { class: 'packages' },
    c('h2', { text: arch }),
    c('dl', { class: 'cool-list' }, ...iterPackages(pkgs))
  )
}

/**
 * @param {TRouter.IRouterState & { data: TPacmanPackages.IPackage[] }} param1
 */
export function pacman({ data }) {
  /** @type {TCons.NonStrictMap<TPacmanPackages.Architecture, TPacmanPackages.IPackage[]>} */
  const arches = new Map()

  for (const pkg of data) {
    if (arches.has(pkg.arch)) {
      arches.get(pkg.arch).push(pkg)
    } else {
      arches.set(pkg.arch, [pkg])
    }
  }

  return c('div', { class: 'page pacman-page' },
    c('div', undefined,
      c(sectionTitle, { text: 'Pacman repository' }),

      c('p', {
        text: 'The repo contains a variety of packages, mostly my own software and AUR builds.'
      }),

      c('p', {
        text: 'I mantain "any" and "x86_64" repos. "x86_64" includes packages from "any". "$arch" can be replaced by both.'
      }),

      c('pre', undefined,
        c('code', {
          text: '[ivasilev]\nServer = https://ivasilev.net/pacman/$arch'
        })
      ),

      c('p', undefined,
        c('span', {
          text: 'All packages are signed and can be verified using my PGP public key '
        }),
        c(pgpAnchor, {}),
        c('span', { text: '.' })
      )
    ),

    c('div', undefined,
      c(sectionTitle, { text: 'Packages' }),
      ...map(([arch, pkgs]) => c(packages, { arch, pkgs }), arches.entries())
    )
  )
}
