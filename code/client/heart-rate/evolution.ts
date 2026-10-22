import { DEFAULT_HEART_RATE_DELTA, SIMULATION_BOUNDS } from './constants.ts'
import { simulatePulseCycle } from './simulation.ts'
import { type IInternalHrsState, type IPulseCycle } from './types.ts'
import { type float64, type uint32 } from '../../common/types/numbers.ts'

export function fillPulseSimulation(pulse: IPulseCycle[], offset: float64 = 0.0, durationScale: float64 = 1.0) {
  let totalDuration = pulse.reduce((acc, cycle) => acc + cycle.duration, 0)

  while (totalDuration < SIMULATION_BOUNDS.width - offset) {
    const cycle = simulatePulseCycle(durationScale)
    pulse.push(cycle)
    totalDuration += cycle.duration
  }
}

export function evolveSimulation(state: IInternalHrsState, targetRate: uint32): Partial<IInternalHrsState> | undefined {
  const newPulse = state.pulse.slice()
  const delta = state.frameDuration / 1000
  let newOffset = state.offset - delta

  while (newPulse.length > 0 && -newOffset > newPulse[0].duration) {
    newOffset += newPulse[0].duration
    newPulse.shift()
  }

  const durationScale = 60 / state.simulationRate
  const preFillCycleCount = newPulse.length
  fillPulseSimulation(newPulse, newOffset, durationScale)

  let newSimulationRate = state.simulationRate

  if (newPulse.length > preFillCycleCount) {
    newSimulationRate = calculateNewSimulationRate(newSimulationRate, targetRate)
  }

  return {
    offset: newOffset,
    pulse: newPulse,
    simulationRate: newSimulationRate,
  }
}

function calculateNewSimulationRate(simulationRate: float64, targetRate: float64): float64 {
  if (simulationRate < targetRate) {
    return Math.min(targetRate, simulationRate + DEFAULT_HEART_RATE_DELTA)
  }

  if (simulationRate > targetRate) {
    return Math.max(targetRate, simulationRate - DEFAULT_HEART_RATE_DELTA)
  }

  return simulationRate
}

export function getLastWithVisibleR(pulse: IPulseCycle[], offset: float64): IPulseCycle | undefined {
  let globalOffset = offset

  for (let i = pulse.length - 1; i > 0; i--) {
    const cycle = pulse[i]
    const rOffset = (
      globalOffset +
      cycle.p.offset + cycle.p.duration +
      cycle.qrs.offset + cycle.qrs.q.duration + cycle.qrs.r.duration / 2
    )

    if (rOffset < SIMULATION_BOUNDS.getRightPos()) {
      return cycle
    }

    globalOffset += cycle.duration
  }

  return undefined
}
