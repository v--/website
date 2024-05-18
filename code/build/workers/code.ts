import ts from 'typescript'
import { dirname, extname, join as joinPath, parse as parsePath, relative } from 'path'
import { BuildWorker, IBuildContext, ICleanContext, } from '../build_worker.js'
import { BuildError } from '../errors'

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
}

class CodeBuildError extends BuildError {}

class TSCError extends CodeBuildError {
  constructor(diagnostics: ts.Diagnostic | ts.Diagnostic[]) {
    super(
      ts.formatDiagnosticsWithColorAndContext(
        diagnostics instanceof Array ? diagnostics : [diagnostics],
        formatHost
      )
    )
  }
}

interface ICodeBuildWorkerConfig {
  srcBase: string
  destBase: string
}

// Based on https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
export class CodeBuildWorker extends BuildWorker {
  protected fileVersionMap: ts.MapLike<number> = {}
  protected options: ts.CompilerOptions
  protected services: ts.LanguageService

  static _getFileSnapshot(path: string) {
    const fileContents = ts.sys.readFile(path)

    if (fileContents === undefined) {
      return fileContents
    }

    return ts.ScriptSnapshot.fromString(fileContents)
  }

  constructor(public config: ICodeBuildWorkerConfig) {
    super()

    const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.json')

    if (!configPath) {
      throw new CodeBuildError('Could not find a TypeScript configuration')
    }

    this.options = this._getConfigOptions(configPath)

    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => Object.keys(this.fileVersionMap),
      getScriptVersion: this._getFileVersion.bind(this),
      getScriptSnapshot: CodeBuildWorker._getFileSnapshot,
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => this.options,
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    }

    this.services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())
  }

  getCanonicalDestPath(src: string, ext: string): string {
    const parsed = parsePath(src)
    return joinPath(
      this.config.destBase,
      relative(this.config.srcBase, dirname(src)),
      parsed.name + ext
    )
  }

  async * performBuild(src: string): AsyncIterable<IBuildContext> {
    if (!(src in this.fileVersionMap)) {
      this.fileVersionMap[src] = 0
    } else {
      this.fileVersionMap[src]++
    }

    const output = this.services.getEmitOutput(src)

    if (output.emitSkipped) {
      const allDiagnostics = Array.prototype.concat.call(
        [],
        this.services.getCompilerOptionsDiagnostics(),
        this.services.getSyntacticDiagnostics(src),
        this.services.getSemanticDiagnostics(src)
      )

      throw new TSCError(Array.from(allDiagnostics))
    }

    for (const file of output.outputFiles) {
      // The TypeScript compiler messes up the directory structure in some cases
      const actualDestPath = this.getCanonicalDestPath(src, extname(file.name))
      yield { src, dest: actualDestPath, contents: file.text }
    }
  }

  async * performClean(src: string): AsyncIterable<ICleanContext> {
    const dest = this.getCanonicalDestPath(src, 'js')

    if (dest in this.fileVersionMap) {
      delete this.fileVersionMap[dest]
    }

    yield { src, dest }
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

    return { ...options, outDir: this.config.destBase }
  }

  protected _getFileVersion(path: string) {
    if (path in this.fileVersionMap) {
      return this.fileVersionMap[path].toString()
    }

    return ''
  }
}
