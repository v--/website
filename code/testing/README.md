# Code testing

After almost 10 years, from the [first commit](https://github.com/v--/website/tree/46e9d45caef6c7f6606fa048871a0601509b5f6a) on 2015-08-15 to the [large refactoring commit](https://github.com/v--/website/tree/83183121a130960bf9f0b06c2b9f0f08471b1d09) on 2025-07-05, we have relied on [mocha.js](https://mochajs.org/) to run our tests. The reason we removed it is it because it was simply unnecessary for several years. We now rely fully on node's [builtin test module](https://nodejs.org/api/test.html), with some custom assertions in [`./assertion.ts`](./assertion.ts).

## Unit tests

The unit tests, runnable via `npm run test:unit`, are scattered through the source code. Whenever `file.ts` implements some functionality, its unit tests (if any) can be found in `test_file.ts`.

The [`./unit`](./unit) directory only contains helpers.

Additionally, to aim in proper resource deallocation, we have a [global hook](./unit/global_hooks.ts) that ensures that no test leaves living observables.

## API tests

The API tests, runnable via `npm run test:api:dev` or `npm run test:api:prod`, do some basic validation of our (very simple) APIs. These tests rely on [PlayWright](https://playwright.dev/)'s `APIRequestContext`. They reside in [`./api`](./api).

The testing environment is configured via the `API_TEST_ENVIRONMENT` environment variable. Unless it equals `PRODUCTION`, we run tests locally.

Note that the API tests use mock data. See the [Mock data](#mock-data) section for details.

## End-to-end tests

The end-to-end tests, runnable via the many `npm run test:e2e:*` commands, use PlayWright to ensure that the essential functionality of the website like the [`/files` page](https://ivasilev.net/files) works. These tests reside in [`./e2e`](./e2e).

Note that [PlayWright](https://playwright.dev/) relies on its custom [Babel](https://babeljs.io/)-based TypeScript compiler, which refuses to load our uncompiled helper code. So we use node's builtin test runner rather than PlayWright's. Fortunately, this makes the API and E2E tests consistent, stylistically, with the unit tests.

The testing environment is configured via the `E2E_ENVIRONMENT` environment variable and the browser is configured via the `E2E_BROWSER` variable.

### Mock data

For testing the [`/files` page](https://ivasilev.net/files) via the corresponding [end-to-end tests](./e2e/test_files.ts), we rely on mock data. To avoid polluting the file server with this mock data (which resides in [`../../mocks/files`](../../mocks/files)), the server serves mock data when the `prefer` HTTP header sets `data-source` to `mocked`.

PlayWright sets this header, for which reason we are able to run the same tests on different environments.
