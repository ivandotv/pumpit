import { PumpIt, token } from "pumpit"

type Config = { url: string }

const configToken = token<Config>("config")
const container = new PumpIt()
container.bindValue(configToken, { url: "https://example.com" })

const config: Config = container.resolve(configToken)
void config
