import { getBaseEnvironmentUrl, getTestEnvironment } from '../cli/env.ts'

export const BASE_URL = getBaseEnvironmentUrl(getTestEnvironment(process.argv))
