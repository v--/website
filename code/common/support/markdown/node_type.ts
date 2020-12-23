export enum NodeType {
  CONTAINER,
  LINE_BREAK,
  TEXT,
  ANCHOR,
  CODE_BLOCK,
  CODE,
  EMPHASIS,
  STRONG_EMPHASIS,
  VERY_STRONG_EMPHASIS,
  HEADING,
  BULLET_UNORDERED,
  BULLET_ORDERED,
  BULLET_LIST
}

export interface ITextNode {
  type: NodeType.TEXT
  text: string
}

export interface ILineBreakNode {
  type: NodeType.LINE_BREAK
}

export interface IContainerNode {
  type: NodeType.CONTAINER
  children: MarkdownNode[]
}

export interface ICodeNode {
  type: NodeType.CODE | NodeType.CODE_BLOCK
  code: string
}

export interface IEmphasisNode {
  type: NodeType.EMPHASIS | NodeType.STRONG_EMPHASIS | NodeType.VERY_STRONG_EMPHASIS
  node: MarkdownNode
}

export interface IAnchorNode {
  type: NodeType.ANCHOR
  link: string
  node: MarkdownNode
}

export interface IHeadingNode {
  type: NodeType.HEADING
  level: number
  node: MarkdownNode
}

export interface IUnorderedBulletNode {
  type: NodeType.BULLET_UNORDERED
  level: number
  node: MarkdownNode
}

export interface IOrderedBulletNode {
  type: NodeType.BULLET_ORDERED
  level: number
  order: number
  node: MarkdownNode
}

export interface IBulletListNode {
  type: NodeType.BULLET_LIST
  ordered: boolean
  bullets: Array<IOrderedBulletNode | IUnorderedBulletNode | IBulletListNode>
}

export type MarkdownNode = ITextNode | ILineBreakNode | IContainerNode | ICodeNode | IEmphasisNode | IAnchorNode | IHeadingNode | IUnorderedBulletNode | IOrderedBulletNode | IBulletListNode
