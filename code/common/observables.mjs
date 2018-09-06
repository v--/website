import { Observable } from './support/observable'

export const redirection = (typeof window !== 'undefined' && window.redirectionObservable) ? window.redirectionObservable : new Observable()

if (typeof window !== 'undefined') {
  window.redirectionObservable = redirection
}
