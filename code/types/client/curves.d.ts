declare namespace TCurves {
  export interface Fitter {
    name: string,
    date: TDates.ISODateString
    hideByDefault?: boolean
    fit(mapping: Map<TNum.Float64, TNum.Float64>): TNumeric.IRealFunction
  }

  export interface Curve {
    fitter: TCurves.Fitter
    curve: TNumeric.IRealFunction
    cssClass: string
  }

  export interface IState {
    width: TNum.UInt32,
    height: TNum.UInt32,
    mapping: Map<TNum.Float64, TNum.Float64>,
    fitters: Set<TCurves.Fitter>,
    curves: TCurves.Curve[],
    updateMapping(x: TNum.Float64, y: TNum.Float64): void,
    deleteMapping(x: TNum.Float64): void,
    enableFitter(fitter: TCurves.Fitter): void,
    disableFitter(fitter: TCurves.Fitter): void
  }
}
