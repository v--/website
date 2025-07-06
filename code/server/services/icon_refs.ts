import { ICON_REF_SCHEMA, type IIconRefPackage } from '../../common/icon_store.ts'
import { type IIconRefService } from '../../common/services/icon_refs.ts'
import { type Path } from '../../common/support/path.ts'
import { ICON_REF_IDS, type IconRefId } from '../../common/types/bundles.ts'
import { readJsonWithSchema } from '../validation.ts'

export class ServerIconRefService implements IIconRefService {
  #basePath: Path
  #package: IIconRefPackage = []

  constructor(basePath: Path) {
    this.#basePath = basePath
  }

  async preload() {
    this.#package = await Promise.all(
      ICON_REF_IDS.map(async refId => {
        const ref = await readJsonWithSchema(
          ICON_REF_SCHEMA,
          this.#basePath.pushRight(refId + '.json'),
        )

        return { id: refId, ref }
      }),
    )
  }

  updateFilePath(basePath: Path) {
    this.#basePath = basePath
  }

  async getIconRef(refId: IconRefId) {
    return this.#package.find(entry => entry.id === refId)!.ref
  }

  async getIconRefPackage(refIds: IconRefId[]) {
    return this.#package.filter(entry => refIds.includes(entry.id))
  }

  async finalize() {}
}
