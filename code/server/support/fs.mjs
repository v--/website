import fs from 'fs'
import { promisory } from './async'

export const stat = promisory(fs.stat)
export const readFile = promisory(fs.readFile)
export const writeFile = promisory(fs.writeFile)
export const readdir = promisory(fs.readdir)

export const createReadStream = fs.createReadStream
export const createWriteStream = fs.createWriteStream
