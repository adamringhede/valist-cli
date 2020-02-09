#!/usr/bin/env node

import * as program from 'commander'
import { LocalCommand } from './commands/local'


process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
})

program
    .command('local')
    .description('run your app locally to test your configuration')
    .option('--context <path>', 'location of valist configuration files', undefined, '.')
    .action((_, options) => new LocalCommand().run(options))

program.parse(process.argv)