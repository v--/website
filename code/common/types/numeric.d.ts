import { Flavor } from './flavoring'

export type uint32 = Flavor<number, 'uint32'>
export type int32 = Flavor<number, 'int32'> | uint32

export type UnitRatio = Flavor<number, 'UnitRatio'>
export type float64 = Flavor<number, 'float64'> | int32 | UnitRatio
