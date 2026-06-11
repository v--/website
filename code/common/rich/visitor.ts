import { type IRichTextDocument, type IRichTextEntry } from './types.ts'

export abstract class RichTextVisitor<EntryReturnT, DocReturnT = EntryReturnT> {
  visit(entry: IRichTextEntry): EntryReturnT {
    switch (entry.kind) {
      case 'horizontal-rule':
        return this.visitHorizontalRuleEntry(entry)

      case 'soft-break':
        return this.visitSoftBreakEntry(entry)

      case 'text':
        return this.visitTextEntry(entry)

      case 'code':
        return this.visitCodeEntry(entry)

      case 'code-block':
        return this.visitCodeBlockEntry(entry)

      case 'paragraph':
        return this.visitParagraphEntry(entry)

      case 'container':
        return this.visitContainerEntry(entry)

      case 'strong':
        return this.visitStrongEntry(entry)

      case 'emph':
        return this.visitEmphEntry(entry)

      case 'heading':
        return this.visitHeadingEntry(entry)

      case 'anchor':
        return this.visitAnchorEntry(entry)

      case 'list':
        return this.visitListEntry(entry)

      case 'list-item':
        return this.visitListItemEntry(entry)

      case 'image':
        return this.visitImageEntry(entry)

      case 'table':
        return this.visitTableEntry(entry)

      case 'table-row':
        return this.visitTableRowEntry(entry)

      case 'table-cell':
        return this.visitTableCellEntry(entry)

      case 'mathml':
        return this.visitMathMLEntry(entry)
    }
  }

  abstract genericVisit(entry: IRichTextEntry): EntryReturnT

  visitHorizontalRuleEntry(entry: IRichTextEntry & { kind: 'horizontal-rule' }) {
    return this.genericVisit(entry)
  }

  visitSoftBreakEntry(entry: IRichTextEntry & { kind: 'soft-break' }) {
    return this.genericVisit(entry)
  }

  visitTextEntry(entry: IRichTextEntry & { kind: 'text' }) {
    return this.genericVisit(entry)
  }

  visitCodeEntry(entry: IRichTextEntry & { kind: 'code' }) {
    return this.genericVisit(entry)
  }

  visitCodeBlockEntry(entry: IRichTextEntry & { kind: 'code-block' }) {
    return this.genericVisit(entry)
  }

  visitParagraphEntry(entry: IRichTextEntry & { kind: 'paragraph' }) {
    return this.genericVisit(entry)
  }

  visitContainerEntry(entry: IRichTextEntry & { kind: 'container' }) {
    return this.genericVisit(entry)
  }

  visitStrongEntry(entry: IRichTextEntry & { kind: 'strong' }) {
    return this.genericVisit(entry)
  }

  visitEmphEntry(entry: IRichTextEntry & { kind: 'emph' }) {
    return this.genericVisit(entry)
  }

  visitHeadingEntry(entry: IRichTextEntry & { kind: 'heading' }) {
    return this.genericVisit(entry)
  }

  visitAnchorEntry(entry: IRichTextEntry & { kind: 'anchor' }) {
    return this.genericVisit(entry)
  }

  visitListEntry(entry: IRichTextEntry & { kind: 'list' }) {
    return this.genericVisit(entry)
  }

  visitListItemEntry(entry: IRichTextEntry & { kind: 'list-item' }) {
    return this.genericVisit(entry)
  }

  visitImageEntry(entry: IRichTextEntry & { kind: 'image' }) {
    return this.genericVisit(entry)
  }

  visitTableEntry(entry: IRichTextEntry & { kind: 'table' }) {
    return this.genericVisit(entry)
  }

  visitTableRowEntry(entry: IRichTextEntry & { kind: 'table-row' }) {
    return this.genericVisit(entry)
  }

  visitTableCellEntry(entry: IRichTextEntry & { kind: 'table-cell' }) {
    return this.genericVisit(entry)
  }

  visitMathMLEntry(entry: IRichTextEntry & { kind: 'mathml' }) {
    return this.genericVisit(entry)
  }

  abstract visitDocument(doc: IRichTextDocument): DocReturnT
}
