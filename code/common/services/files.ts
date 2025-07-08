import { LANGUAGE_IDS } from '../languages.ts'
import { RICH_TEXT_DOCUMENT_SCHEMA } from '../rich.ts'
import { type Path } from '../support/path.ts'
import { type Infer, Schema } from '../validation.ts'

export const DIR_ENTRY_SCHEMA = Schema.object({
  name: Schema.string,
  isDir: Schema.boolean,
  size: Schema.uint32,
})

export type IDirEntry = Infer<typeof DIR_ENTRY_SCHEMA>

export const DIRECTORY_README_SCHEMA = Schema.object({
  languageId: Schema.literal(...LANGUAGE_IDS),
  doc: RICH_TEXT_DOCUMENT_SCHEMA,
})

export type IDirectoryReadme = Infer<typeof DIRECTORY_README_SCHEMA>

export const DIRECTORY_SCHEMA = Schema.object({
  entries: Schema.array(DIR_ENTRY_SCHEMA),
  path: Schema.string,
  readme: Schema.optional(DIRECTORY_README_SCHEMA),
})

export interface IDirectory extends Infer<typeof DIRECTORY_SCHEMA> {
  entries: IDirEntry[]
  readme?: IDirectoryReadme
}

export interface IFileService {
  readDirectory(path: Path, mock?: boolean): Promise<IDirectory>
}
