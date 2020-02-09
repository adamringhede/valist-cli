

export interface DeployConfig {
    static?: {
        build?: string,
        image?: string,
        cmd?: string[],
        dist: string,
        index: string,
    },
    docker?: {
        build?: string,
        image?: string,
        cmd?: string[],
        port: number
    }
}