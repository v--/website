import { getTestBrowser, getTestEnvironment } from '../cli.ts'

// This functions throw an error if their options are not set.
// We run them again in config.ts later, but this setup hook allows us to cancel all tests if the function throws.
getTestEnvironment(process.argv)
getTestBrowser(process.argv)
