declare namespace TCurves {
  export interface Fitter {
    name: string,
    date: TDates.ISODateString
    hideByDefault?: boolean
    fit(mapping: Map<TNum.Float64, TNum.Float64>): TMath.IRealFunction
  }

  export interface Curve {
    fitter: TCurves.Fitter
    curve: TMath.IRealFunction
    cssClass: string
  }
}
