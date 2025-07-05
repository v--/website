import { type Infer, Schema } from '../validation.ts'

const CONTENTFUL_ENTRY_SCHEMA_MIXIN = {
  text: Schema.optional(Schema.string),
  children: Schema.optional(
    Schema.array(Schema.self),
  ),
}

export const RICH_TEXT_ENTRY_SCHEMA = Schema.recursive(
  /* I originally used a more abbreviated form for some of the sub-schemas, for example
   *
   *   Schema.union(
   *     Schema.object({
   *       kind: Schema.literal('horizontal_rule', 'soft_break'),
   *     }),
   *     ...
   *   })
   *
   * rather than
   *
   *   Schema.union(
   *     Schema.object({
   *       kind: Schema.literal('horizontal_rule'),
   *     }),
   *     Schema.object({
   *       kind: Schema.literal('soft_break'),
   *     }),
   *     ...
   *   })
   *
   * Unfortunately, this caused type narrowing to behave weirdly. Checks like
   *   entry.kind === 'horizontal_rule'
   * narrowed the type to
   *   IRichTextEntry & { kind: 'horizontal_rule' | 'soft_break' }
   * rather than
   *   IRichTextEntry & { kind: 'horizontal_rule' }
  */
  Schema.union(
    Schema.object({
      kind: Schema.literal('horizontal_rule'),
    }),
    Schema.object({
      kind: Schema.literal('soft_break'),
    }),
    Schema.object({
      kind: Schema.literal('text'),
      text: Schema.string,
    }),
    Schema.object({
      kind: Schema.literal('code'),
      text: Schema.string,
    }),
    Schema.object({
      kind: Schema.literal('code_block'),
      text: Schema.string,
    }),
    Schema.object({
      kind: Schema.literal('paragraph'),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('container'),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('strong'),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('emph'),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('heading'),
      level: Schema.literal(1, 2, 3, 4, 5, 6),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('anchor'),
      href: Schema.string,
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('list'),
      ordered: Schema.boolean,
      tight: Schema.boolean,
      items: Schema.array(Schema.self),
    }),
    Schema.object({
      kind: Schema.literal('list_item'),
      children: Schema.array(Schema.self),
    }),
    Schema.object({
      kind: Schema.literal('image'),
      href: Schema.string,
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('table'),
      rows: Schema.array(Schema.self),
    }),
    Schema.object({
      kind: Schema.literal('table_row'),
      cells: Schema.array(Schema.self),
    }),
    Schema.object({
      kind: Schema.literal('table_cell'),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
    Schema.object({
      kind: Schema.literal('mathml'),
      tag: Schema.string,
      attributes: Schema.optional(Schema.record(Schema.string)),
      ...CONTENTFUL_ENTRY_SCHEMA_MIXIN,
    }),
  ),
)

export type IRichTextEntry = Infer<typeof RICH_TEXT_ENTRY_SCHEMA>
export type RichTextEntryKind = IRichTextEntry['kind']

export const RICH_TEXT_DOCUMENT_SCHEMA = Schema.object({
  kind: Schema.literal('document'),
  entries: Schema.array(RICH_TEXT_ENTRY_SCHEMA),
})

export interface IRichTextDocument extends Infer<typeof RICH_TEXT_DOCUMENT_SCHEMA> {
  entries: IRichTextEntry[]
}
