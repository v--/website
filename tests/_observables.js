import observableTests from 'es-observable-tests'

import { errors } from '../code/common/observables/errors.js'
import { Observable } from '../code/common/observables/observable.js'

errors.ErrorClass = TypeError // The Observable spec requires TypeErrors
observableTests.runTests(Observable)
