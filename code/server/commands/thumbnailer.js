#!/usr/bin/env node

import path from 'path'
import { readFileSync } from 'fs'
import { spawn } from 'child_process'

import { stat, mkdir, readdir } from '../support/fs.js'
import { Logger } from '../support/logger.js'

import { CoolError } from '../../common/errors.js'

const THUMB_WIDTH = 300
const THUMB_HEIGHT = 9 / 16 * THUMB_WIDTH

const config = JSON.parse(readFileSync('config/active.json'))
const { galleryPath, galleryThumbPath } = config.store
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
      return spawnProcess('/usr/bin/convert', [filePath, '-resize', `${THUMB_WIDTH}x${THUMB_HEIGHT}`, thumbPath])

    case '.mp4':
      return spawnProcess('/usr/bin/ffmpeg', ['-ss', '0', '-i', filePath, '-vframes', '1', '-filter:v', `scale=${THUMB_WIDTH}:${THUMB_HEIGHT}`, thumbPath])

    default:
      throw new ThumbnailingError('Unknown file extension ' + ext)
  }
}

async function spawnDirThumbnailer (dirPath, thumbPath) {
  const fileNames = await readdir(thumbPath, 'utf8')
  const args = fileNames
    .slice(0, 4)
    .map(fileName => path.join(thumbPath, fileName))
    .concat(['-tile', '2x2', '-geometry', `${THUMB_WIDTH}x${THUMB_HEIGHT}`, thumbPath + '.jpg'])

  return spawnProcess('/usr/bin/montage', args)
}

async function refreshThumbnails (basePath) {
  logger.debug(`Processing directory ${path.join(galleryPath, basePath)}`)

  for (const fileName of await readdir(path.join(galleryPath, basePath), 'utf8')) {
    const filePath = path.join(galleryPath, basePath, fileName)
    const thumbPath = path.join(galleryThumbPath, basePath, fileName)
    const fileStat = await stat(filePath)

    try {
      await stat(thumbPath + '.jpg2')
      logger.debug(`Thumbnail already exists for ${filePath}`)
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (fileStat.isFile()) {
          logger.info(`Generating a thumbnail for file ${filePath}`)
          await spawnFileThumbnailer(filePath, thumbPath + '.jpg')
        } else {
          await mkdir(thumbPath)
          await refreshThumbnails(galleryPath, path.join(basePath, fileName))
          logger.info(`Generating a thumbnails for dir ${filePath}`)
          await spawnDirThumbnailer(filePath, thumbPath)
        }
      } else {
        throw err
      }
    }
  }
}

refreshThumbnails('/')
