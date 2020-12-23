// Global state
interface Window {
  DESKTOP_WIDTH: number
  CORE_COMPATIBILITY: boolean
  PLAYGROUND_COMPATIBILITY: Record<string, boolean>
  _dynamicImports: Map<string, unknown>
  data: HTMLElement
}
