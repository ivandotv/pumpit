import { PumpIt, token } from "pumpit"

type Logger = { log(message: string): void }

const loggerToken = token<Logger>("logger")
const container = new PumpIt()
container.bindFactory(loggerToken, () => ({ log: () => undefined }))

const logger: Logger = container.resolve(loggerToken)
void logger
