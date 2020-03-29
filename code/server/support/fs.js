import fs from 'fs'
import { promisory } from './async.js'

export const stat = promisory(fs.stat)
export const readFile = promisory(fs.readFile)
export const writeFile = promisory(fs.writeFile)
export const unlink = promisory(fs.unlink)
export const readdir = promisory(fs.readdir)
export const mkdir = promisory(fs.mkdir)
export const rmdir = promisory(fs.rmdir)
