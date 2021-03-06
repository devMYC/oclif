// tslint:disable no-floating-promises
// tslint:disable no-console

import * as _ from 'lodash'
import * as path from 'path'
import * as Generator from 'yeoman-generator'
import yosay = require('yosay')

import {Options} from '../commands/command'

const {version} = require('../../package.json')

class CommandGenerator extends Generator {
  pjson!: any

  get _path() { return this.options.name.split(':').join('/') }
  get _ts() { return this.pjson.devDependencies.typescript }
  get _ext() { return this._ts ? 'ts' : 'js' }
  get _mocha() { return this.pjson.devDependencies.mocha }

  constructor(args: any, public options: Options) {
    super(args, options)
  }

  async prompting() {
    this.pjson = this.fs.readJSON('package.json')
    this.pjson.oclif = this.pjson.oclif || {}
    if (!this.pjson) throw new Error('not in a project directory')
    this.log(yosay(`Adding a command to ${this.pjson.name} Version: ${version}`))
  }

  writing() {
    this.sourceRoot(path.join(__dirname, '../../templates'))
    let bin = this.pjson.oclif.bin || this.pjson.oclif.dirname || this.pjson.name
    if (bin.includes('/')) bin = bin.split('/').pop()
    const cmd = `${bin} ${this.options.name}`
    const opts = {...this.options, bin, cmd, _, type: 'command'}
    this.fs.copyTpl(this.templatePath(`src/command.${this._ext}.ejs`), this.destinationPath(`src/commands/${this._path}.${this._ext}`), opts)
    // this.fs.copyTpl(this.templatePath(`plugin/src/hooks/init.${this._ext}`), this.destinationPath(`src/hooks/init.${this._ext}`), this)
    if (this._mocha) {
      // this.fs.copyTpl(this.templatePath(`plugin/test/hooks/init.test.${this._ext}`), this.destinationPath(`test/hooks/init.test.${this._ext}`), this)
      this.fs.copyTpl(this.templatePath(`test/command.test.${this._ext}.ejs`), this.destinationPath(`test/commands/${this._path}.test.${this._ext}`), opts)
    }
    // this.fs.writeJSON(this.destinationPath('./package.json'), this.pjson)
  }
}

export = CommandGenerator
