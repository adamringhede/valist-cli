import * as fs from 'fs'
import { fail } from 'assert';

export interface InitCommandConfig {
    type?: 'docker'|'static'
}

const staticConfigBase = `{
    "static": {
        "build": "./Dockerfile",
        "dist": "/path/to/static_files",
        "cmd": ["your-build-command"]
    }
}`

const dockerConfigBase = `{
    "docker": {
        "build": "./Dockerfile",
        "port": 80
    }
}`

export class InitCommand {
    private static defaultConfig: InitCommandConfig = {}

    async run(options: InitCommandConfig) {
        let config: String|null;
        if (options.type == 'docker') {
            config = dockerConfigBase
        } else if (options.type == 'static') {
            config = staticConfigBase
        } else {
            fail("Unsupported type: " + options.type)
        }

        const path = "valist-conf.json";
        if (fs.existsSync(path)) {
            fail("File already exists at " + path)
        }
        fs.writeFileSync(path, config.trim())
    }
}
