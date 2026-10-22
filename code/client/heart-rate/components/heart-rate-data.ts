import { slider } from '../../../common/components/slider.ts'
import { calcDifferences } from '../../../common/math/stat.ts'
import { map } from '../../../common/observable.ts'
import { createComponent as c } from '../../../common/rendering/component.ts'
import { type StateStore } from '../../../common/support/state-store.ts'
import { type float64, type uint32 } from '../../../common/types/numbers.ts'
import { type ClientWebsiteEnvironment } from '../../core/environment.ts'
import { MAX_TARGET_HEART_RATE, MAX_WINDOW_SIZE, MIN_TARGET_HEART_RATE, MIN_WINDOW_SIZE } from '../constants.ts'
import { calcIQRRR, calcMeanHeartRate, calcMedianHeartRate, calcPNN, calcRMSSD, calcSDRR, durationToHeartRate } from '../estimation.ts'
import { type IControllableHrsState } from '../types.ts'

interface IHeartRateDataState {
  peakTimestamps: float64[]
  controllableStateStore: StateStore<IControllableHrsState>
}

export function heartRateData({ peakTimestamps, controllableStateStore }: IHeartRateDataState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('heart-rate')
  const rrIntervals = calcDifferences(peakTimestamps)
  const mean = calcMeanHeartRate(rrIntervals)
  const median = calcMedianHeartRate(rrIntervals)

  return c.html('div', { class: 'heart-rate-data' },
    c.html('table', { class: 'heart-rate-data-table dense-table' },
      c.html('tr', undefined,
        c.html('th', { class: 'heart-rate-data-table-header', text: _('data.heart-rate.heading'), colspan: 2 }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate.rolling-average.bpm') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(durationToHeartRate(mean)),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate.rolling-average.msec') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(mean),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate.rolling-median.bpm') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(durationToHeartRate(median)),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate.rolling-median.msec') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(median),
        }),
      ),
    ),

    c.html('table', { class: 'heart-rate-data-table dense-table' },
      c.html('tr', undefined,
        c.html('th', { class: 'heart-rate-data-table-header', text: _('data.heart-rate-variance.heading'), colspan: 2 }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate-variance.sdrr') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(calcSDRR(rrIntervals)),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate-variance.rmssd') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(calcRMSSD(rrIntervals)),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate-variance.pnn50') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullablePercentToString(calcPNN(rrIntervals, 50)),
        }),
      ),
      c.html('tr', undefined,
        c.html('th', { text: _('data.heart-rate-variance.range') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-widenum',
          text: nullableNumberToString(calcIQRRR(rrIntervals)),
        }),
      ),
    ),

    c.html('table', { class: 'heart-rate-data-table dense-table heart-rate-data-table-parameters' },
      c.html('tr', undefined,
        c.html('th', { class: 'heart-rate-data-table-header', text: _('data.parameters.heading'), colspan: 2 }),
      ),

      c.html('tr', undefined,
        c.html('th', { colspan: 2, text: _('data.parameters.simulated') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: controllableStateStore.keyedObservables.targetRate.pipe(
            map(String),
          ),
        }),
      ),

      c.html('tr', undefined,
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: String(MIN_TARGET_HEART_RATE),
        }),
        c.html('td', { class: 'heart-rate-data-table-col-slider' },
          c.factory(slider<uint32>, {
            name: 'heart-rate-target',
            min: MIN_TARGET_HEART_RATE,
            max: MAX_TARGET_HEART_RATE,
            value: controllableStateStore.keyedObservables.targetRate,
            labelClass: 'heart-rate-data-slider-label',
            inputClass: 'heart-rate-data-slider-input',
            update(newValue: uint32) {
              controllableStateStore.setState('targetRate', newValue)
            },
          }),
        ),
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: String(MAX_TARGET_HEART_RATE),
        }),
      ),

      c.html('tr', undefined,
        c.html('th', { colspan: 2, text: _('data.parameters.time-window-size') }),
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: controllableStateStore.keyedObservables.windowSize.pipe(
            map(String),
          ),
        }),
      ),

      c.html('tr', undefined,
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: String(MIN_WINDOW_SIZE),
        }),
        c.html('td', { class: 'heart-rate-data-table-col-slider' },
          c.factory(slider<uint32>, {
            name: 'heart-rate-window-size',
            min: MIN_WINDOW_SIZE,
            max: MAX_WINDOW_SIZE,
            value: controllableStateStore.keyedObservables.windowSize,
            labelClass: 'heart-rate-data-slider-label',
            inputClass: 'heart-rate-data-slider-input',
            update(newValue: uint32) {
              controllableStateStore.setState('windowSize', newValue)
            },
          }),
        ),
        c.html('td', {
          class: 'heart-rate-data-table-col-num',
          text: String(MAX_WINDOW_SIZE),
        }),
      ),
    ),
  )
}

function nullableNumberToString(rate: float64 | undefined) {
  if (rate === undefined) {
    return 'N/A'
  }

  return rate.toFixed()
}

function nullablePercentToString(rate: float64 | undefined) {
  if (rate === undefined) {
    return 'N/A'
  }

  return (rate * 100).toFixed()
}
