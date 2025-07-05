import { SubstitutionError } from './errors.ts'
import { type IRichTextDocument, type IRichTextEntry } from './types.ts'
import { RichTextVisitor } from './visitor.ts'
import { getObjectEntries } from '../support/iteration.ts'
import { type int32 } from '../types/numbers.ts'

export type SubstitutionContext = Record<string, string | int32>

/**
 * A straightforward substitution function replacing keys with values literally.
 *
 * The keys must consist of a single ASCII-only capital Latin string. The key `key` gets replaced whenever
 * `${key}` (but not `\${key}`) occurs within the template string. We choose a syntax that is close to
 * JavaScript's own template strings.
 *
 * We only replace the variables from the context and simply ignore any other potential template variables.
 * If the keys are iterated in the right order, it is even possible to create new template variables.
 *
 * This is a great simplification compared to my original approach involving a full-fledges template string parser,
 * which I found too complicated (maintenance-wise) for my use case. It is available at
 * https://github.com/v--/website/tree/master/code/common/formatting
 */
export function substitutePlain(plain: string, context: SubstitutionContext): string {
  let result = plain

  for (const [key, value] of getObjectEntries(context)) {
    if (!key.match(/^[a-zA-Z]+$/)) {
      throw new SubstitutionError('Only capital ASCII Latin letters allowed as substitution keys')
    }

    result = result.replaceAll(new RegExp('(?<!\\\\)\\${' + key + '}', 'g'), value.toString())
  }

  return result
}

/**
 * Apply substitutePlain to any text inside the rich text document.
 */
export function substituteRich(doc: IRichTextDocument, context: SubstitutionContext): IRichTextDocument {
  const visitor = new SubstitutionVisitor(context)
  return visitor.visitDocument(doc)
}

export class SubstitutionVisitor extends RichTextVisitor<IRichTextEntry, IRichTextDocument> {
  readonly context: SubstitutionContext

  constructor(context: SubstitutionContext) {
    super()
    this.context = context
  }

  override genericVisit(entry: IRichTextEntry): IRichTextEntry {
    if ('children' in entry && entry.children) {
      return {
        ...entry,
        children: entry.children.map(c => this.visit(c)),
      }
    }

    if ('text' in entry && entry.text !== undefined) {
      return {
        ...entry,
        text: substitutePlain(entry.text, this.context),
      }
    }

    return entry
  }

  override visitAnchorEntry(entry: IRichTextEntry & { kind: 'anchor' }) {
    return {
      ...this.genericVisit(entry),
      href: substitutePlain(entry.href, this.context),
    }
  }

  override visitListEntry(entry: IRichTextEntry & { kind: 'list' }) {
    return {
      ...entry,
      items: entry.items.map(c => this.visit(c)),
    }
  }

  override visitDocument(doc: IRichTextDocument): IRichTextDocument {
    return {
      kind: 'document',
      entries: doc.entries.map(c => this.visit(c)),
    }
  }
}
