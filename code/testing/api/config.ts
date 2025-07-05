export const BASE_URL = process.env['API_TEST_ENVIRONMENT'] === 'PRODUCTION' ?
  'https://ivasilev.net' :
  'http://localhost:3000'
