import { last } from 'code/core/support/misc';

export const PERIODS = [
    { 'text': 'Slow',   value: 500 },
    { 'text': 'Medium', value: 100 },
    { 'text': 'Fast',   value: 10 }
];

export const DEFAULT_PERIOD = last(PERIODS).value;
