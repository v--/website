import observableTests from 'es-observable-tests'
import Observable from '../code/common/support/observable.mjs'

Observable.ErrorClass = TypeError // The Observable spec requires TypeErrors
observableTests.runTests(Observable)
