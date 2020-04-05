#!/usr/bin/env node

import path from 'path'
import { readFileSync } from 'fs'
import { spawn } from 'child_process'

import { stat, mkdir, rmdir, readdir, unlink } from '../support/fs.js'
import { Logger } from '../support/logger.js'

import { zipLongest, filter, flatten, take } from '../../common/support/iteration.js'
import { imageSortingComparator } from '../../common/support/sorting.js'
import { CoolError } from '../../common/errors.js'

const THUMB_WIDTH = 720
const THUMB_HEIGHT = 9 / 16 * THUMB_WIDTH

const config = JSON.parse(readFileSync('config/active.json'))
const { galleryPath } = config.store
const thumbsPath = path.join(galleryPath, '.thumbs')
const logger = new Logger('thumbnailer')

class ThumbnailingError extends CoolError {}

function streamToPromise (stream) {
  return new Promise(function (resolve, reject) {
    stream
      .setEncoding('utf8')
      .on('error', reject)
      .on('end', function () {
        resolve()
      })
  })
}

function spawnProcess (executable, args) {
  return streamToPromise(spawn(executable, args).stdout)
}

function spawnFileThumbnailer (filePath, thumbPath) {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.jpg':
      return spawnProcess('/usr/bin/convert', [filePath, '-auto-orient', '-resize', `${THUMB_WIDTH}x${THUMB_HEIGHT}`, thumbPath])

    case '.mp4':
      return spawnProcess('/usr/bin/ffmpeg', ['-ss', '0', '-i', filePath, '-vframes', '1', '-filter:v', `scale=${THUMB_WIDTH}:${THUMB_HEIGHT}`, thumbPath])

    default:
      throw new ThumbnailingError('Unknown file extension ' + ext)
  }
}

async function listRelativePathsRecursively (baseDir, dir, limit) {
  const childNames = (await readdir(path.join(baseDir, dir), 'utf8')).sort(imageSortingComparator)
  const filePaths = []
  const dirPaths = []

  for (const fileName of childNames) {
    const relativePath = path.join(dir, fileName)
    const fileStat = await stat(path.join(baseDir, relativePath))

    if (fileStat.isFile()) {
      filePaths.push(relativePath)
    } else {
      dirPaths.push(relativePath)
    }
  }

  const zipped = zipLongest(
    filePaths,
    ...await Promise.all(dirPaths.map(dirPath => listRelativePathsRecursively(baseDir, dirPath, limit)))
  )

  return Array.from(take(filter(Boolean, flatten(zipped)), limit))
}

async function spawnDirThumbnailer (dirPath, thumbPath) {
  const relativePaths = await listRelativePathsRecursively(dirPath, '/', 4)
  const args = relativePaths
    .map(relative => path.join(thumbPath, relative) + '.jpg')
    .concat(['-tile', '2x2', '-background', '#eee', '-geometry', `${THUMB_WIDTH}x${THUMB_HEIGHT}`, thumbPath + '.jpg'])

  return spawnProcess('/usr/bin/montage', args)
}

async function refreshThumbnails (basePath, validThumbs) {
  logger.debug(`Processing directory ${path.join(galleryPath, basePath)}`)
  let updated = false

  for (const fileName of await readdir(path.join(galleryPath, basePath), 'utf8')) {
    if (fileName === '.thumbs') {
      continue
    }

    const filePath = path.join(galleryPath, basePath, fileName)
    const thumbPath = path.join(thumbsPath, basePath, fileName)
    const thumbFilePath = thumbPath + '.jpg'
    const fileStat = await stat(filePath)

    if (fileStat.isFile()) {
      try {
        await stat(thumbFilePath)
        logger.debug(`Thumbnail already exists for file ${filePath}`)
        validThumbs.add(thumbFilePath)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }

        logger.info(`Generating a thumbnail for file ${filePath}`)
        await spawnFileThumbnailer(filePath, thumbFilePath)
        validThumbs.add(thumbFilePath)
        updated = true
      }
    } else {
      try {
        await stat(thumbFilePath)
        const childUpdated = await refreshThumbnails(path.join(basePath, fileName), validThumbs)
        updated = updated || childUpdated

        if (childUpdated) {
          logger.info(`Updating thumbnail for dir ${filePath}`)
          await spawnDirThumbnailer(filePath, thumbPath)
        } else {
          logger.debug(`Already updated thumbnail for dir ${filePath}`)
        }

        validThumbs.add(thumbFilePath)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }

        try {
          await mkdir(thumbPath)
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err
          }
        }

        await refreshThumbnails(path.join(basePath, fileName), validThumbs)
        updated = true
        logger.info(`Generating a thumbnail for dir ${filePath}`)
        await spawnDirThumbnailer(filePath, thumbPath)
        validThumbs.add(thumbFilePath)
      }
    }
  }

  return updated
}

async function garbageCollectThumbs (basePath, thumbs) {
  const dirPath = path.join(thumbsPath, basePath)

  for (const fileName of await readdir(dirPath, 'utf8')) {
    const filePath = path.join(dirPath, fileName)
    const fileStat = await stat(filePath)

    if (!fileStat.isFile()) {
      garbageCollectThumbs(path.join(basePath, fileName), thumbs)
    } else if (!thumbs.has(filePath)) {
      logger.info('Removing stale thumbnail ' + filePath)
      await unlink(filePath)
    }
  }

  const newFileNames = await readdir(dirPath, 'utf8')

  if (newFileNames.length === 0) {
    logger.info('Removing stale thumbnail dir ' + dirPath)
    await rmdir(dirPath)
  }
}

async function runCommand () {
  try {
    await mkdir(thumbsPath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }

  const validThumbs = new Set()
  await refreshThumbnails('/', validThumbs)
  await garbageCollectThumbs('/', validThumbs)
}

runCommand()
