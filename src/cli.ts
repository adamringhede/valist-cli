#!/usr/bin/env node

import * as program from 'commander'
import { LocalCommand } from './commands/local'
import { InitCommand } from './commands/init'


process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
})

function collect(value: string, previous: string[]) {
    return previous.concat([value]);
  }

program
    .command('local')
    .description('run your app locally to test your configuration')
    .option('--context <path>', 'location of valist configuration files', undefined, '.')
    .option('-e --env', 'environment variables passed to container', collect, [])
    .action((_, options) => new LocalCommand().run(options as any))

program
    .command('init')
    .description('create a Valist configuration file')
    .requiredOption('--type <docker>', 'either docker or static')
    .action((options) => new InitCommand().run(options))

program.parse(process.argv)