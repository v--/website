export interface IFieldFormattingTemplateEntry {
  field: string
}

export type IFormattingTemplateEntry = IFieldFormattingTemplateEntry | string

export interface IFormattingTemplate {
  entries: IFormattingTemplateEntry[]
}
