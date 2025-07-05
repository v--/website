import { rich } from '../components/rich.ts'
import { OPENPGP_KEYSERVER_URL, OPENPGP_KEY_ID_SHORT } from '../constants/url.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { type IPacmanRepository, type PacmanPackageArch } from '../services/pacman.ts'
import { type IPacmanPackage } from '../services.ts'
import { groupBy, map } from '../support/iteration.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function pacmanPage({ pageData }: IWebsitePageState<IPacmanRepository>, env: WebsiteEnvironment) {
  const byArch = groupBy(pageData.packages, pkg => pkg.arch)
  const _ = env.gettext$

  return c('main', { class: 'pacman-page' },
    c('article', undefined,
      c('h1', { text: _({ bundleId: 'pacman', key: 'heading.main' }) }),
      c(rich, {
        doc: _({ bundleId: 'pacman', key: 'main' }, { rich: true }),
      }),
      c('pre', undefined,
        c('code', {
          text: '[ivasilev]\nServer = https://ivasilev.net/pacman/$arch',
        }),
      ),
      c(rich, {
        doc: _(
          {
            bundleId: 'pacman', key: 'openpgp',
            context: { keyName: OPENPGP_KEY_ID_SHORT, keyUrl: OPENPGP_KEYSERVER_URL },
          },
          { rich: true },
        ),
      }),
    ),

    c('section', undefined,
      c('h1', { text: _({ bundleId: 'pacman', key: 'heading.packages' }) }),
      ...map(([arch, pkgs]) => c(packages, { arch, pkgs }), byArch.entries()),
    ),
  )
}

function* iterPackagesComponents(pkgs: IPacmanPackage[], env: WebsiteEnvironment) {
  const _ = env.gettext$

  for (const pkg of pkgs) {
    yield c('dt', { text: _({ bundleId: 'pacman', key: 'version', context: pkg }) })
    yield c('dd', { text: pkg.description })
  }
}

interface IPackagesState {
  arch: PacmanPackageArch
  pkgs: IPacmanPackage[]
}

function packages({ arch, pkgs }: IPackagesState, env: WebsiteEnvironment) {
  return c('div', { class: 'packages' },
    c('h2', { text: arch }),
    c('dl', undefined, ...iterPackagesComponents(pkgs, env)),
  )
}
