import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'

import { schwartzSort } from '../../common/support/iteration.ts'
import { assertFalse, assertTrue, assertUndefined } from '../assertion.ts'
import { JAVASCRIPT_OPTIONS } from './config.ts'
import { FilesPage } from './files.ts'

describe('Files page', function () {
  for (const { javaScriptEnabled, label } of JAVASCRIPT_OPTIONS) {
    describe(label, function () {
      let page: FilesPage

      beforeEach(async function () {
        if (page) {
          await page.reset()
        } else {
          page = await FilesPage.initialize({ javaScriptEnabled })
        }
      })

      after(async function () {
        await page?.finalize()
      })

      it('renders the title correctly', async function () {
        await page.goto('/files')
        const title = await page.getTitle()
        assert.equal(title, "Index of /files ⋅ File server ⋅ Ianis Vasilev's website")
      })

      it('setting the "page" query parameter does not change the title', async function () {
        await page.goto('/files?page=2')
        const title = await page.getTitle()
        assert.equal(title, "Index of /files ⋅ File server ⋅ Ianis Vasilev's website")
      })

      describe('title', function () {
        it('updates the title when navigating to /sub/subsub', async function () {
          await page.goto('/files/sub/subsub')
          const title = await page.getTitle()
          assert.equal(title, "Index of /files/sub/subsub ⋅ File server ⋅ Ianis Vasilev's website")
        })

        it('errors out with 404 on an invalid subpath', async function () {
          await page.goto('/files/invalid')
          const errContent = await page.parseError()

          assert.equal(errContent.title, 'Page not found')
          assertUndefined(errContent.details)
        })

        it('errors out with 403 on an existing hidden subpath', async function () {
          await page.goto('/files/.valid')
          const errContent = await page.parseError()

          assert.equal(errContent.title, 'Access forbidden')
          assertUndefined(errContent.details)
        })

        it('errors out with 403 on a non-existing hidden subpath', async function () {
          await page.goto('/files/.invalid')
          const errContent = await page.parseError()

          assert.equal(errContent.title, 'Access forbidden')
          assertUndefined(errContent.details)
        })
      })

      describe('breadcrumbs', function () {
        it('has only one breadcrumb disabled at the root', async function () {
          await page.goto('/files')
          const breadcrumbs = await page.getBreadcrumbAnchors()
          const count = Object.keys(breadcrumbs).length
          assert.equal(count, 1)
          assertTrue('files' in breadcrumbs)
          assertFalse(await breadcrumbs.files.isEnabled())
        })

        it('has one disabled and two enabled breadcrumb in /sub/subsub', async function () {
          await page.goto('/files/sub/subsub')
          const breadcrumbs = await page.getBreadcrumbAnchors()
          const count = Object.keys(breadcrumbs).length
          assert.equal(count, 3)

          assertTrue('files' in breadcrumbs)
          assertTrue(await breadcrumbs.files.isEnabled())

          assertTrue('sub' in breadcrumbs)
          assertTrue(await breadcrumbs.sub.isEnabled())

          assertTrue('subsub' in breadcrumbs)
          assertFalse(await breadcrumbs.subsub.isEnabled())
        })

        it('can nagivate to the root by clicking the /files locator in /sub', async function () {
          await page.goto('/files/sub')
          const breadcrumbs = await page.getBreadcrumbAnchors()
          await breadcrumbs.files.click()

          assert.equal(await page.getDirPath(), '/')
        })

        it('can nagivate to /sub by clicking the arrow locator in /sub/subsub', async function () {
          await page.goto('/files/sub/subsub')
          const breadcrumbs = await page.getBreadcrumbAnchors()
          await breadcrumbs.sub.click()

          assert.equal(await page.getDirPath(), '/sub')
        })
      })

      describe('table', function () {
        it('displays the single subdirectory in /sub', async function () {
          await page.goto('/files/sub')
          const rows = await page.getShownDirEntries()

          assert.equal(rows.length, 1)
          assert.equal(rows[0].name, 'subsub')
          assert.equal(rows[0].type, 'Directory')
          assert.equal(rows[0].size, '-')
        })

        it('has no paginator in /sub', async function () {
          await page.goto('/files/sub')
          assertFalse(await page.hasPaginator())
        })

        it('is hidden in /empty', async function () {
          await page.goto('/files/empty')
          assertFalse(await page.hasTable())
        })

        it('can navigate from the root to /sub by clicking its name', async function () {
          await page.goto('/files')
          const anchor = page.getDirEntryAnchor('sub')
          await anchor.click()

          assert.equal(await page.getDirPath(), '/sub')
        })

        it('displays all files at the root', async function () {
          await page.goto('/files')
          const rows = await page.getShownDirEntries()

          assert.equal(rows.length, 10)
        })

        describe('the paginator at the root', function () {
          it('exists', async function () {
            await page.goto('/files')
            assertTrue(await page.hasPaginator())
          })

          it('has two numbered anchors by default', async function () {
            await page.goto('/files')
            const anchors = await page.getPaginatorNumberAnchors()
            assert.equal(anchors.length, 2)
          })

          it('has 1-9 as anchors with the "per-page" query param set to "1"', async function () {
            await page.goto('/files?per-page=1')
            const anchors = await page.getPaginatorNumberAnchors()
            assert.equal(anchors.length, 9)

            for (let i = 0; i < 9; i++) {
              assert.equal(await anchors[i].textContent(), String(i + 1))
            }
          })

          it('has the first nine default files listed when navigating the pages 1-9 with the "per-page" query param set to "1"', async function () {
            await page.goto('/files')
            const defaultRows = await page.getShownDirEntries()

            await page.goto('/files?per-page=1')

            for (let i = 0; i < defaultRows.length; i++) {
              const rows = await page.getShownDirEntries()
              assert.equal(rows.length, 1)
              assert.deepEqual(rows[0], defaultRows[i])

              const next = page.getPaginatorNextAnchor()
              await next.click()
            }
          })

          it('has 2-10 as anchors after clicking the 6th anchor', async function () {
            await page.goto('/files?per-page=1')
            const firstPageAnchors = await page.getPaginatorNumberAnchors()
            assert.equal(firstPageAnchors.length, 9)
            await firstPageAnchors[5].click()

            const sixthPageAnchors = await page.getPaginatorNumberAnchors()
            assert.equal(sixthPageAnchors.length, 9)

            for (let i = 0; i < 9; i++) {
              assert.equal(await sixthPageAnchors[i].textContent(), String(i + 2))
            }
          })

          it('has the prev anchor disabled when on the first page by default', async function () {
            await page.goto('/files')
            const prevAnchor = page.getPaginatorPrevAnchor()
            assertFalse(await prevAnchor.isEnabled())
          })

          it('has the first anchor disabled by default', async function () {
            await page.goto('/files')
            const anchors = await page.getPaginatorNumberAnchors()
            assertFalse(await anchors[0].isEnabled())
          })

          it('has no "page" query param by default', async function () {
            await page.goto('/files')
            const urlPath = page.getUrlPath()
            assertFalse(urlPath.query.has('page'))
          })

          it('changes the "page" query param when clicking the second anchor', async function () {
            await page.goto('/files')
            const firstPageAnchors = await page.getPaginatorNumberAnchors()
            assertTrue(await firstPageAnchors[1].isEnabled())
            await firstPageAnchors[1].click()

            const urlPath = page.getUrlPath()
            assert.equal(urlPath.query.get('page'), '2')
          })

          it('changes the "page" query param when clicking the next anchor', async function () {
            await page.goto('/files')

            const nextAnchor = page.getPaginatorNextAnchor()
            await nextAnchor.click()

            const urlPath = page.getUrlPath()
            assert.equal(urlPath.query.get('page'), '2')
          })

          it('removes the "page" query param when navigating back to the first page', async function () {
            await page.goto('/files')

            const nextAnchor = page.getPaginatorNextAnchor()
            await nextAnchor.click()

            const prevAnchor = page.getPaginatorPrevAnchor()
            await prevAnchor.click()

            const urlPath = page.getUrlPath()
            assertFalse(urlPath.query.has('page'))
          })

          it('disables the second anchor after the "page" query param is set to "2"', async function () {
            await page.goto('/files?page=2')
            const anchors = await page.getPaginatorNumberAnchors()
            assertFalse(await anchors[1].isEnabled())
          })

          it('changes the displayed entries when setting the "page" query param to "2"', async function () {
            await page.goto('/files')
            const firstPageRows = await page.getShownDirEntries()
            assert.equal(firstPageRows.length, 10)

            await page.goto('/files?page=2')
            const secondPageRows = await page.getShownDirEntries()
            assert.equal(secondPageRows.length, 2)
          })

          it('errors out with 400 when the "page" query param is set to "invalid"', async function () {
            await page.goto('/files?page=invalid')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter page must be a positive integer.')
          })

          it('errors out with 400 when the "page" query param is set to "-1"', async function () {
            await page.goto('/files?page=-1')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter page must be a positive integer.')
          })

          it('errors out with 400 when the "per-page" query param is zero', async function () {
            await page.goto('/files?per-page=0')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter per-page must be a positive integer.')
          })

          it('errors out with 400 when the "page" query param exceeds the number of pages', async function () {
            await page.goto('/files?page=4')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter page must not exceed 2, the page count.')
          })
        })

        describe('the table header in the root page', function () {
          it('has its headings in a neutral state by default', async function () {
            await page.goto('/files')

            for (const col of ['name', 'type', 'size']) {
              assert.equal(await page.getTableHeaderSortDirection(col), 'neutral')
            }
          })

          it('clicking the name heading changes its state to ascending', async function () {
            await page.goto('/files')
            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()

            const sortDirection = await page.getTableHeaderSortDirection('name')
            assert.equal(sortDirection, 'asc')
          })

          it('clicking the name heading twice changes its state to descending', async function () {
            await page.goto('/files')

            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()
            await nameHeader.click()

            const sortDirection = await page.getTableHeaderSortDirection('name')
            assert.equal(sortDirection, 'desc')
          })

          it('clicking the name heading thrice changes its state back to neutral', async function () {
            await page.goto('/files')

            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()
            await nameHeader.click()
            await nameHeader.click()

            const sortDirection = await page.getTableHeaderSortDirection('name')
            assert.equal(sortDirection, 'neutral')
          })

          it('clicking the name heading once sets the "sort-asc" parameter to "name" without setting "sort-desc"', async function () {
            await page.goto('/files')
            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()

            assert.equal(page.getUrlPath().query.get('sort-asc'), 'name')
            assertUndefined(page.getUrlPath().query.get('sort-desc'))
          })

          it('clicking the name heading twice sets the "sort-desc" parameter to "name" and unsets "sort-asc"', async function () {
            await page.goto('/files')
            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()
            await nameHeader.click()

            assert.equal(page.getUrlPath().query.get('sort-desc'), 'name')
            assertUndefined(page.getUrlPath().query.get('sort-asc'))
          })

          it('clicking the name heading thrice unsets both "sort-desc" and "sort-asc"', async function () {
            await page.goto('/files')
            const nameHeader = await page.getTableHeaderAnchor('name')
            await nameHeader.click()
            await nameHeader.click()
            await nameHeader.click()

            assertUndefined(page.getUrlPath().query.get('sort-desc'))
            assertUndefined(page.getUrlPath().query.get('sort-asc'))
          })

          it('setting "sort-asc" to "name" changes the column sort status', async function () {
            await page.goto('/files?sort-asc=name')

            const sortDirection = await page.getTableHeaderSortDirection('name')
            assert.equal(sortDirection, 'asc')
          })

          it('setting "sort-desc" to "name" changes the column sort status', async function () {
            await page.goto('/files?sort-desc=name')

            const sortDirection = await page.getTableHeaderSortDirection('name')
            assert.equal(sortDirection, 'desc')
          })

          it('errors out with 400 when setting both "sort-asc" and "sort-desc" to "name"', async function () {
            await page.goto('/files?sort-asc=name&sort-desc=name')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The URL parameters sort-asc and sort-desc cannot be specified simultaneously.')
          })

          it('errors out with 400 when setting "sort-asc" to "invalid"', async function () {
            await page.goto('/files?sort-asc=invalid')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter sort-asc is not a known sorting column.')
          })

          it('errors out with 400 when setting "sort-desc" to "invalid"', async function () {
            await page.goto('/files?sort-desc=invalid')
            const errContent = await page.parseError()

            assert.equal(errContent.title, 'Bad request')
            assert.equal(errContent.details, 'The value of the URL parameter sort-desc is not a known sorting column.')
          })

          it('arranges the entry names in alphabetical order when sorting by name', async function () {
            await page.goto('/files?per-page=20')
            const defaultRows = await page.getShownDirEntries()
            const manuallySortedRows = schwartzSort(row => row.name, defaultRows)

            await page.goto('/files?per-page=20&sort-asc=name')
            const sortedRows = await page.getShownDirEntries()

            assert.deepEqual(sortedRows, manuallySortedRows)
          })

          it('arranges the entry names in reverse alphabetical order when sorting descending by name', async function () {
            await page.goto('/files?per-page=20')
            const defaultRows = await page.getShownDirEntries()
            const manuallySortedRows = schwartzSort(row => row.name, defaultRows).reverse()

            await page.goto('/files?per-page=20&sort-desc=name')
            const sortedRows = await page.getShownDirEntries()

            assert.deepEqual(sortedRows, manuallySortedRows)
          })

          it('arranges the entry names by numeric file size when sorting by size', async function () {
            await page.goto('/files?sort-asc=size')
            const sortedRows = await page.getShownDirEntries()
            const sizesAndNames = sortedRows.map(({ name, size }) => ({ name, size }))

            /* eslint-disable @stylistic/no-multi-spaces */
            assert.deepEqual(sizesAndNames[0], { name: 'empty',         size: '-' })
            assert.deepEqual(sizesAndNames[1], { name: 'sub',           size: '-' })
            assert.deepEqual(sizesAndNames[2], { name: 'tex2ht',        size: '-' })
            assert.deepEqual(sizesAndNames[3], { name: 'empty.txt',     size: 'Empty' })
            assert.deepEqual(sizesAndNames[4], { name: 'one byte',      size: '1 byte' })
            assert.deepEqual(sizesAndNames[5], { name: 'sin.py',        size: '21 bytes' })
            assert.deepEqual(sizesAndNames[6], { name: 'dropsort.js',   size: '53 bytes' })
            assert.deepEqual(sizesAndNames[7], { name: 'lipsum.tex',    size: '125 bytes' })
            assert.deepEqual(sizesAndNames[8], { name: 'unlicense.txt', size: '1.18 KiB' })
            assert.deepEqual(sizesAndNames[9], { name: 'lipsum.txt',    size: '4.42 KiB' })
            /* eslint-enable @stylistic/no-multi-spaces */
          })

          it('arranges the entry names by reverse numeric file size when sorting descending by size', async function () {
            await page.goto('/files?sort-desc=size')
            const sortedRows = await page.getShownDirEntries()

            assert.equal(sortedRows[0].name, 'lipsum.djvu')
            assert.equal(sortedRows[9].name, 'empty')
          })
        })
      })

      describe('readme', function () {
        it('is shown at the root (where one exists)', async function () {
          await page.goto('/files')
          const readme = page.getReadmeLocator()
          assertTrue(await readme.isVisible())
        })

        it("is not shown at /empty (where one doesn't exists)", async function () {
          await page.goto('/files/empty')
          const readme = page.getReadmeLocator()
          assertFalse(await readme.isVisible())
        })
      })
    })
  }
})
