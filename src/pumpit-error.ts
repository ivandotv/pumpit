import type { ValidationError } from "./types"

export class PumpitError extends Error {
  constructor(
    message: string,
    public result: ValidationError[],
  ) {
    super(message)
  }
}
