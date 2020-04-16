import * as assert from 'assert'
import { LocalCommand } from '../src/commands/local'
import { InitCommand } from '../src/commands/init'

process.on('unhandledRejection', (err) => { 
    console.error(err)
    process.exit(1)
})

describe('cli', function () {
    it('works', function () {
        assert.equal(1+1, 2)
    })

    describe('local', function () {
        it('runs static apps', function() {
            const cmd = new LocalCommand()
            cmd.run({
                context: __dirname + '/../samples/test-app-static'
            })
        })
    })
    describe('init', function () {
        it('create ', function() {
            const cmd = new InitCommand()
            cmd.run({
                type: 'docker'
            })
        })
    })
});
