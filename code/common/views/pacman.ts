import { map } from '../support/iteration.js'
import { c } from '../rendering/component.js'
import { pgpLink } from '../components/pgp_link.js'
import { sectionTitle } from '../components/section_title.js'
import { IPacmanPackage, PacmanPackageArchitecture } from '../types/pacman_packages.js'
import { RouterState } from '../support/router_state.js'

function * iterPackages(pkgs: IPacmanPackage[]) {
  for (const { name, version, description } of pkgs) {
    yield c('li', { class: 'package' },
      c('b', { text: `${name} (version ${version})` }),
      c('br'),
      c('span', { text: description })
    )
  }
}

function packages({
  arch, pkgs
}: {
  arch: PacmanPackageArchitecture,
  pkgs: IPacmanPackage[]
}) {
  return c('div', { class: 'packages' },
    c('h2', { text: arch }),
    c('ul', { class: 'cool-list' }, ...iterPackages(pkgs))
  )
}

export function pacman({ data: rawData }: RouterState) {
  const data = rawData as IPacmanPackage[]
  const arches = new Map<PacmanPackageArchitecture, IPacmanPackage[]>()

  for (const pkg of data) {
    if (arches.has(pkg.arch)) {
      arches.get(pkg.arch)!.push(pkg)
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
        c(pgpLink, {}),
        c('span', { text: '.' })
      )
    ),

    c('div', undefined,
      c(sectionTitle, { text: 'Packages' }),
      ...map(([arch, pkgs]) => c(packages, { arch, pkgs }), arches.entries())
    )
  )
}
