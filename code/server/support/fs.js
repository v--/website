import fs from 'fs'
import { promisory } from './async.js'

export const stat = promisory(fs.stat)
export const readFile = promisory(fs.readFile)
export const writeFile = promisory(fs.writeFile)
export const readdir = promisory(fs.readdir)
export const unlink = promisory(fs.unlink)
export const rmdir = promisory(fs.rmdir)
