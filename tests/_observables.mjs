import observableTests from 'es-observable-tests'
import errors from '../code/common/observables/errors.mjs'
import Observable from '../code/common/observables/observable.mjs'

errors.ErrorClass = TypeError // The Observable spec requires TypeErrors
observableTests.runTests(Observable)
