import * as fs from 'fs'
import * as Docker from 'dockerode'
import { DeployConfig } from '../shared/config'
import { delay } from '../shared/utils'
import * as path from 'path'
import * as freePort from 'get-port'
import * as ora from 'ora'
const hashing = require('shorthash')
const devnull = require('dev-null')
var tar = require('tar-fs')


function panic(message: string) {
    console.error(message)
    process.exit(1)
}

const defaultConfigFileName = 'valist-conf.json'
const preferredPorts = [50_000, 50_001, 50_002, 50_003, 50_004, 50_005, 50_006, 50_007, 50_008, 50_009, 50_010]

export interface LocalCommandConfig {
    context?: string,
    env?: string[]
}

export class LocalCommand {
    private docker = new Docker()
    private container: Docker.Container|null = null
    private readonly staticHostImage = 'nginx:alpine'
    public static readonly defaultConfig: LocalCommandConfig = {
        context: '.',
        env: []
    }

    constructor() {
        process.on('SIGINT', async () => {
            if (this.container) {
                await this.container.stop()
            }
            process.exit()
        });
    }

    
    async run(options: LocalCommandConfig = LocalCommand.defaultConfig) {
        const contextPath = options.context?.replace(/\/$/, '') ?? '.'
        const configFilePath = path.join(contextPath, defaultConfigFileName)

        if (!fs.existsSync(configFilePath)) {
            panic(`Could not find configuration file at ${configFilePath}`)
        }
        const config = JSON.parse(fs.readFileSync(configFilePath).toString()) as DeployConfig
        if (config.static) {
            this.runStatic(contextPath, config, options.env ?? [])
        } else if (config.docker) {
            this.runDocker(contextPath, config, options.env ?? [])
        } else {
            panic("Missing configuration type. Must be 'static' or 'docker'")
        }
    }

    async runStatic(contextPath: string, config: DeployConfig, env: string[]) {
        if (config.static == null) return
        const imageName = config.static.image ?? await this.buildImage(contextPath, config.static.build!)
        const localOutDir = '.valist-build-static'
        fs.rmdir(localOutDir, {recursive: true}, () => {})
        const outDir = path.join(process.cwd(), localOutDir)
        const buildSpinner = ora(`Building static app`).start()
        const [_, container]: [any, Docker.Container] =  await this.docker.run(imageName, config.static.cmd ?? [], process.stdout, {
            Env: env,
            HostConfig: {
                //Binds: [`${outDir}:${config.static.dist}`]
            }
        } as Docker.ContainerCreateOptions, {})
        while ((await container.inspect()).State.Running) {
            await delay(2000)
        }
        
        // Copy files
        const stream = await container.getArchive({path: config.static.dist})   
        stream.pipe(tar.extract(localOutDir,  {strip: 1}))

        buildSpinner.succeed(`Built static files at ${localOutDir}`)

        
        // Run in static host
        const port = await freePort({port: preferredPorts})
        this.docker.run(this.staticHostImage, ["nginx", "-g", "daemon off;"], process.stdout, {
            HostConfig: {
                Binds: [`${outDir}:/usr/share/nginx/html`],
                PortBindings: {
                    [`80/tcp`]: [{
                        "HostIP":"0.0.0.0",
                        "HostPort": port.toString()
                    }],
                }
            }
        } as Docker.ContainerCreateOptions, {}, () => {}).on('container', (container) => {
            console.log(`App is available at http://localhost:${port}`)
            this.container = container
        })
    }

    async runDocker(contextPath: string, config: DeployConfig, env: string[]) {
        if (config.docker == null) return
        const imageName = config.docker.image ?? await this.buildImage(contextPath, config.docker.build!)
        const port = await freePort({port: preferredPorts})
        // TODO Pass in environment variables somehow. Maybe using a file or as arguments using -e or --env
        this.docker.run(imageName, config.docker.cmd ?? [], process.stdout, {
            Env: env,
            HostConfig: {
                PortBindings: {
                    [`${config.docker.port}/tcp`]: [{
                        "HostIP":"0.0.0.0",
                        "HostPort": port.toString()
                    }],
                }
            }
        } as Docker.ContainerCreateOptions, {}, () => {}).on('container', (container) => {
            console.log(`App is available at http://localhost:${port}`)
            this.container = container
        })
    }

    async buildImage(contextPath: string, dockerfile: string): Promise<string> {
        const pathHash = hashing.unique(process.cwd()).split('').map((x: string) => x.charCodeAt(0)).join('')
        const imageName = "valist-app-" + pathHash 
        const spinner = ora("Building image").start()
        const stream = await this.docker.buildImage({
            context: contextPath,
            src: ["."]
        }, {
            dockerfile: dockerfile,
            t: imageName
        })
        await new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err: any, res: any) => err ? reject(err) : resolve(res));
        });
        spinner.succeed("Built image: " + imageName)
        return imageName
    }
}