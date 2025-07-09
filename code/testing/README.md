# Code testing

After almost 10 years, from the [first commit](https://github.com/v--/website/tree/46e9d45caef6c7f6606fa048871a0601509b5f6a) on 2015-08-15 to the [large refactoring commit](https://github.com/v--/website/tree/83183121a130960bf9f0b06c2b9f0f08471b1d09) on 2025-07-05, we have relied on [mocha.js](https://mochajs.org/) to run our tests. The reason we removed it is it because it was simply unnecessary for several years. We now rely fully on node's [builtin test module](https://nodejs.org/api/test.html), with some custom assertions in [`./assertion.ts`](./assertion.ts).

## Unit tests

The unit tests, runnable via `npm run test:unit`, are scattered through the source code. Whenever `file.ts` implements some functionality, its unit tests (if any) can be found in `test_file.ts`.

The [`./unit`](./unit) directory only contains helpers.

Additionally, to aim in proper resource deallocation, we have a [global hook](./unit/setup.ts) that ensures that no test leaves living observables.

## API tests

The API tests, runnable via `npm run test:api -- --env=<...>`, do some basic validation of our (very simple) APIs. These tests rely on [PlayWright](https://playwright.dev/)'s `APIRequestContext`. They reside in [`./api`](./api).

The tests require an `env` command-line option, of which the CLI command will inform us thanks to the API test [setup code](./api/setup.ts).

The CLI option parser is primitive, but it is what I wrote after trying five popular node CLI creation libraries and getting disappointed by the lack of an equivalent to Python's [click](https://click.palletsprojects.com/en/stable/).

Note that the API tests use mock data. See the [Mock data](#mock-data) section for details.

## End-to-end tests

The end-to-end tests, runnable via `npm run test:e2e -- --env=<...> --browser=<...>`, use PlayWright to ensure that the essential functionality of the website like the [`/files` page](https://ivasilev.net/files) works. These tests reside in [`./e2e`](./e2e).

Note that [PlayWright](https://playwright.dev/) relies on its custom [Babel](https://babeljs.io/)-based TypeScript compiler, which refuses to load our uncompiled helper code. So we use node's builtin test runner rather than PlayWright's. Fortunately, this makes the API and E2E tests consistent, stylistically, with the unit tests.

The tests require `env` and `browser` command-line options, of which the CLI command will inform us thanks to the E2E test [setup code](./e2e/setup.ts).

### Mock data

For testing the [`/files` page](https://ivasilev.net/files) via the corresponding [end-to-end tests](./e2e/test_files.ts), we rely on mock data. To avoid polluting the file server with this mock data (which resides in [`../../mocks/files`](../../mocks/files)), the server serves mock data when the `prefer` HTTP header sets `data-source` to `mocked`.

PlayWright sets this header, for which reason we are able to run the same tests on different environments.
