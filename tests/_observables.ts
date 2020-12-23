/// <reference types="../code/type_definitions" />
import observableTests from 'es-observable-tests.js'

import { errors } from '../code/common/observables/errors.js'
import { Observable } from '../code/common/observables/observable.js'

errors.ErrorClass = TypeError // The Observable spec requires TypeErrors
observableTests.runTests(Observable)
