import { RICH_TEXT_DOCUMENT_SCHEMA } from '../rich.ts'
import { type Path } from '../support/path.ts'
import { type Infer, Schema } from '../validation.ts'

export const DIR_ENTRY_SCHEMA = Schema.object({
  name: Schema.string,
  isDir: Schema.boolean,
  size: Schema.uint32,
})

export type IDirEntry = Infer<typeof DIR_ENTRY_SCHEMA>

export const DIRECTORY_SCHEMA = Schema.object({
  entries: Schema.array(DIR_ENTRY_SCHEMA),
  path: Schema.string,
  readme: Schema.optional(RICH_TEXT_DOCUMENT_SCHEMA),
})

export interface IDirectory extends Infer<typeof DIRECTORY_SCHEMA> {
  entries: IDirEntry[]
}

export interface IFileService {
  readDirectory(path: Path, mock?: boolean): Promise<IDirectory>
}
