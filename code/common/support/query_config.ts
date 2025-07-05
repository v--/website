import { UrlPath } from './url_path.ts'

type RequiredSchemaProperties<SchemaT extends Record<string, string>> = {
  [Key in keyof SchemaT]: SchemaT[Key] extends string ? Key : never
}[keyof SchemaT]

export class QueryConfig<SchemaT extends Record<string, string>> {
  readonly urlPath: UrlPath
  readonly defaults: SchemaT

  constructor(urlPath: UrlPath, defaults: SchemaT) {
    this.urlPath = urlPath
    this.defaults = defaults
  }

  get(key: RequiredSchemaProperties<SchemaT> & string): string
  get(key: keyof SchemaT & string): string | undefined
  get(key: string): string | undefined {
    return this.urlPath.query.get(key) ?? this.defaults[key]
  }

  getUpdatedPath(config: Partial<SchemaT>) {
    const newQuery = new Map([
      ...this.urlPath.query.entries(),
      ...Object.entries(config),
    ])

    // It is important to delete default items only after the sources have been merged together
    for (const [key, value] of newQuery.entries()) {
      if (this.defaults[key] === value) {
        newQuery.delete(key)
      }
    }

    return new UrlPath(this.urlPath.path, newQuery)
  }
}
