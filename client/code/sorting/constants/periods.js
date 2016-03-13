import utils from 'code/core/helpers/utils';

export const PERIODS = [
    { 'text': 'Slow',   value: 500 },
    { 'text': 'Medium', value: 100 },
    { 'text': 'Fast',   value: 10 }
];

export const DEFAULT_PERIOD = utils.last(PERIODS).value;
