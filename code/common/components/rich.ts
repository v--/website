import { CoolError, IntegrityError, NotImplementedError } from '../errors.ts'
import { Component, createComponent as c } from '../rendering/component.ts'
import { type IRichTextDocument, type IRichTextEntry, RichTextVisitor } from '../rich.ts'
import { anchor } from './anchor.ts'
import { icon } from './icon.ts'
import { includes } from '../support/iteration.ts'
import { repr } from '../support/strings.ts'
import { ICON_REF_IDS } from '../types/bundles.ts'

export class RichTextComponentError extends CoolError {}

interface IComponentCreationVisitorConfig {
  mode?: 'normal' | 'paragraph' | 'mathml'
  rootCssClass?: string
  rootTag?: string
}

interface IRichTextDocumentState extends IComponentCreationVisitorConfig {
  doc: IRichTextDocument
}

export function rich({ doc, mode, rootCssClass, rootTag }: IRichTextDocumentState) {
  const visitor = new ComponentCreationVisitor({ rootCssClass, rootTag, mode })
  return visitor.visitDocument(doc)
}

class ComponentCreationVisitor extends RichTextVisitor<Component> {
  readonly config: IComponentCreationVisitorConfig

  constructor(config: IComponentCreationVisitorConfig) {
    super()
    this.config = config
  }

  override genericVisit(_entry: IRichTextEntry): Component {
    throw new NotImplementedError()
  }

  override visitHorizontalRuleEntry(_entry: IRichTextEntry & { kind: 'horizontal_rule' }) {
    return c.html('hr')
  }

  override visitSoftBreakEntry(_entry: IRichTextEntry & { kind: 'soft_break' }) {
    return c.html('span', { text: '\n' })
  }

  visitTextState(entry: IRichTextEntry & { text?: string }) {
    if (entry.text !== undefined) {
      return { text: entry.text }
    }

    return {}
  }

  override visitTextEntry(entry: IRichTextEntry & { kind: 'text' }) {
    return c.html('span', this.visitTextState(entry))
  }

  override visitCodeEntry(entry: IRichTextEntry & { kind: 'code' }) {
    return c.html('code', this.visitTextState(entry))
  }

  override visitCodeBlockEntry(entry: IRichTextEntry & { kind: 'code_block' }) {
    return c.html('pre', this.visitTextState(entry))
  }

  * iterChildren(entries?: IRichTextEntry[]) {
    if (!entries) {
      return
    }

    for (const entry of entries) {
      yield this.visit(entry)
    }
  }

  override visitParagraphEntry(entry: IRichTextEntry & { kind: 'paragraph' }) {
    return c.html('p', this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitContainerEntry(entry: IRichTextEntry & { kind: 'container' }) {
    return c.html('div', this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitStrongEntry(entry: IRichTextEntry & { kind: 'strong' }) {
    return c.html('strong', this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitEmphEntry(entry: IRichTextEntry & { kind: 'emph' }) {
    return c.html('em', this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitHeadingEntry(entry: IRichTextEntry & { kind: 'heading' }) {
    return c.html(`h${entry.level}`, this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitAnchorEntry(entry: IRichTextEntry & { kind: 'anchor' }) {
    return c.factory(
      anchor,
      {
        href: entry.href ?? '',
        isInternal: entry.href !== undefined && !entry.href.match('^[a-z]+:'),
        ...this.visitTextState(entry),
      },
      ...this.iterChildren(entry.children),
    )
  }

  * iterListItems(items: IRichTextEntry[], tight: boolean) {
    for (const entry of items) {
      if (entry.kind !== 'list_item') {
        throw new IntegrityError(`Expected all children of a list to be list items, but got ${repr(entry.kind)}`)
      }

      yield this.visitListItemEntry(entry, tight)
    }
  }

  override visitListEntry(entry: IRichTextEntry & { kind: 'list' }) {
    return c.html(
      entry.ordered ? 'ol' : 'ul',
      undefined,
      ...this.iterListItems(entry.items, entry.tight),
    )
  }

  override visitListItemEntry(entry: IRichTextEntry & { kind: 'list_item' }, tight?: boolean) {
    if (tight) {
      if (entry.children.length !== 1 || entry.children[0].kind !== 'paragraph') {
        throw new IntegrityError('Expected a tight list item to only have one paragraph child')
      }

      return c.html('li', this.visitTextState(entry.children[0]), ...this.iterChildren(entry.children[0].children))
    }

    return c.html('li', undefined,
      ...this.iterChildren(entry.children),
    )
  }

  override visitImageEntry(entry: IRichTextEntry & { kind: 'image' }) {
    const match = entry.href === undefined ? null : entry.href.match('icon://(?<refId>\\w+)/(?<name>[\\w/-]+)')

    if (match === null || !match.groups) {
      return c.html(
        'img',
        { src: entry.href, ...this.visitTextState(entry) },
        ...this.iterChildren(entry.children),
      )
    }

    if (!includes(ICON_REF_IDS, match.groups.refId)) {
      throw new IntegrityError(`Invalid icon ref id ${match.groups.refId}`)
    }

    return c.factory(icon, { refId: match.groups.refId, name: match.groups.name })
  }

  override visitTableEntry(entry: IRichTextEntry & { kind: 'table' }) {
    return c.html('table', undefined,
      ...this.iterChildren(entry.rows),
    )
  }

  override visitTableRowEntry(entry: IRichTextEntry & { kind: 'table_row' }) {
    return c.html('tr', undefined,
      ...this.iterChildren(entry.cells),
    )
  }

  override visitTableCellEntry(entry: IRichTextEntry & { kind: 'table_cell' }) {
    return c.html('td', this.visitTextState(entry), ...this.iterChildren(entry.children))
  }

  override visitMathMLEntry(entry: IRichTextEntry & { kind: 'mathml' }, additionalAttributes?: Record<string, string>) {
    return c.mathml(
      entry.tag,
      { ...entry.attributes, ...this.visitTextState(entry), ...additionalAttributes },
      ...this.iterChildren(entry.children),
    )
  }

  override visitDocument(doc: IRichTextDocument): Component {
    const state = this.config.rootCssClass === undefined ? undefined : { class: this.config.rootCssClass }

    switch (this.config.mode) {
      case undefined:
      case 'normal':
        return c.html(this.config.rootTag ?? 'div', state, ...this.iterChildren(doc.entries))

      case 'paragraph':
        if (doc.entries.length === 1 && doc.entries[0].kind === 'paragraph') {
          const entry = doc.entries[0]
          const tag = this.config.rootTag ?? 'p'

          if ('text' in entry) {
            return c.html(tag, { ...state, text: entry.text })
          }

          return c.html(tag, state, ...this.iterChildren(entry.children))
        }

        throw new RichTextComponentError('Single paragraph mode requested but the document does not consist of a single paragraph')

      case 'mathml':
        if (this.config.rootTag) {
          throw new IntegrityError('Cannot set the root tag when rendering in mathml mode')
        }

        if (doc.entries.length === 1 && doc.entries[0].kind === 'mathml') {
          return this.visitMathMLEntry(doc.entries[0], state)
        }

        throw new RichTextComponentError('MathML mode requested but the document does not consist of a single mathml entry')
    }
  }
}
