declare namespace TNum {
  // numeric types
  export type UInt32 = TFlavoring.Flavor<number, 'uint32'>
  export type Int32 = TFlavoring.Flavor<number, 'int32'> | UInt32

  export type UnitRatio = TFlavoring.Flavor<number, 'UnitRatio'>
  export type Float64 = TFlavoring.Flavor<number, 'float64'> | UInt32 | UnitRatio
}
