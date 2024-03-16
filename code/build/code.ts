import ts from 'typescript'
import fs from 'fs/promises'
import { dirname, extname, join as joinPath } from 'path'

import { Logger } from '../server/support/logger.js'
import { chain } from '../common/support/iteration.js'

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
}

class CodeBuilderError extends Error {}

class TSCError extends CodeBuilderError {
  constructor(diagnostics: ts.Diagnostic | ts.Diagnostic[]) {
    super(
      ts.formatDiagnosticsWithColorAndContext(
        diagnostics instanceof Array ? diagnostics : [diagnostics],
        formatHost
      )
    )
  }
}

// Based on https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
export class CodeBuilder {
  protected _fileVersionMap: ts.MapLike<number> = {}
  protected _options: ts.CompilerOptions
  protected _services: ts.LanguageService
  protected _logger: Logger

  static _getFileSnapshot(path: string) {
    const fileContents = ts.sys.readFile(path)

    if (fileContents === undefined) {
      return fileContents
    }

    return ts.ScriptSnapshot.fromString(fileContents)
  }

  constructor() {
    this._logger = new Logger('CodeBuilder')

    const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.json')

    if (!configPath) {
      throw new CodeBuilderError('Could not find a TypeScript configuration')
    }

    this._options = this._getConfigOptions(configPath)

    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => Object.keys(this._fileVersionMap),
      getScriptVersion: this._getFileVersion.bind(this),
      getScriptSnapshot: CodeBuilder._getFileSnapshot,
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => this._options,
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    }

    this._services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())
  }

  async rebuild(path: string) {
    if (!(path in this._fileVersionMap)) {
      this._fileVersionMap[path] = 0
    } else {
      this._fileVersionMap[path]++
    }

    const output = this._services.getEmitOutput(path)

    if (output.emitSkipped) {
      this._logErrors(path)
    }

    for (const file of output.outputFiles) {
      this._logger.info(`${path} -> ${file.name}`)
      await fs.mkdir(dirname(file.name), { recursive: true })
      await fs.writeFile(file.name, file.text, 'utf-8')
    }
  }

  async remove(path: string) {
    if (path in this._fileVersionMap) {
      delete this._fileVersionMap[path]
    }
  }

  protected _getConfigOptions(configFilePath: string): ts.CompilerOptions {
    const { config, error } = ts.readConfigFile(configFilePath, ts.sys.readFile)

    if (error) {
      throw new TSCError(error)
    }

    const { options, errors } = ts.convertCompilerOptionsFromJson(config.compilerOptions, '.')

    if (errors.length > 0) {
      throw new TSCError(errors)
    }

    return options
  }

  protected _getFileVersion(path: string) {
    if (path in this._fileVersionMap) {
      return this._fileVersionMap[path].toString()
    }

    return ''
  }

  protected _logErrors(path: string) {
    const allDiagnostics = chain(
      this._services.getCompilerOptionsDiagnostics(),
      this._services.getSyntacticDiagnostics(path),
      this._services.getSemanticDiagnostics(path)
    )

    throw new TSCError(Array.from(allDiagnostics))
  }
}

async function * iterSourcePaths(basePath: string) {
  for (const dirent of await fs.readdir(basePath, { withFileTypes: true, recursive: true })) {
    if (dirent.isFile() && (extname(dirent.name) == '' || extname(dirent.name) == '.js')) {
      yield joinPath(dirent.path, dirent.name)
    }
  }
}

export async function buildAllCode(basePath: string) {
  const builder = new CodeBuilder()
  const promises: Array<Promise<void>> = []

  for await (const value of iterSourcePaths(basePath)) {
    promises.push(builder.rebuild(value))
  }

  return Promise.all(promises)
}
