declare namespace TMarkdown {
  export type TokenType =
    'whitespace' |
    'lineBreak' |
    'naturalNumber' |
    'anchorNode' |
    'anchorLink' |
    'anchor' |
    'codeBlock' |
    'code' |
    'emphasis' |
    'strongEmphasis' |
    'veryStrongEmphasis' |
    'heading' |
    'bulletUnordered' |
    'bulletOrdered' |
    'bulletList' |
    'markdown'

  export type NodeType =
    'container' |
    'lineBreak' |
    'text' |
    'anchor' |
    'codeBlock' |
    'code' |
    'emphasis' |
    'strongEmphasis' |
    'veryStrongEmphasis' |
    'heading' |
    'bulletUnordered' |
    'bulletOrdered' |
    'bulletList'

  export interface ITextNode {
    type: 'text'
    text: string
  }

  export interface ILineBreakNode {
    type: 'lineBreak'
  }

  export interface IContainerNode {
    type: 'container'
    children: MarkdownNode[]
  }

  export interface ICodeNode {
    type: 'code' | 'codeBlock'
    code: string
  }

  export interface IEmphasisNode {
    type: 'emphasis' | 'strongEmphasis' | 'veryStrongEmphasis'
    node: MarkdownNode
  }

  export interface IAnchorNode {
    type: 'anchor'
    link: string
    node: MarkdownNode
  }

  export interface IHeadingNode {
    type: 'heading'
    level: number
    node: MarkdownNode
  }

  export interface IUnorderedBulletNode {
    type: 'bulletUnordered'
    level: number
    node: MarkdownNode
  }

  export interface IOrderedBulletNode {
    type: 'bulletOrdered'
    level: number
    order: number
    node: MarkdownNode
  }

  export interface IBulletListNode {
    type: 'bulletList'
    ordered: boolean
    bullets: Array<IOrderedBulletNode | IUnorderedBulletNode | IBulletListNode>
  }

  export type MarkdownNode = ITextNode | ILineBreakNode | IContainerNode | ICodeNode | IEmphasisNode | IAnchorNode | IHeadingNode | IUnorderedBulletNode | IOrderedBulletNode | IBulletListNode
}
