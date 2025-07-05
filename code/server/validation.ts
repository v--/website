import { readFile } from 'fs/promises'

import { type Path } from '../common/support/path.ts'
import { type Infer, type TypeSchema, validateSchema } from '../common/validation.ts'

export async function readJsonWithSchema<T extends TypeSchema>(schema: T, path: Path | string): Promise<Infer<T>> {
  const contents = await readFile(path.toString(), 'utf-8')
  const json = JSON.parse(contents)
  return validateSchema(schema, json)
}
