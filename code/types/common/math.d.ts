declare namespace TMath {
  export interface IRealFunction {
    eval(x: TNum.Float64): TNum.Float64
    toString(): string
  }
}
