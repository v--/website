declare namespace Num {
  // numeric types
  export type UInt32 = Flavoring.Flavor<number, 'uint32'>
  export type Int32 = Flavoring.Flavor<number, 'int32'> | UInt32

  export type UnitRatio = Flavoring.Flavor<number, 'UnitRatio'>
  export type Float64 = Flavoring.Flavor<number, 'float64'> | UInt32 | UnitRatio
}
