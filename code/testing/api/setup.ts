import { getTestEnvironment } from '../cli.ts'

// This function throws an error if no environment is set.
// We run it again later in config.ts, but this setup hook allows us to cancel all tests if the function throws.
getTestEnvironment(process.argv)
