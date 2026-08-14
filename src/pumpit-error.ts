import type { ValidationError } from "./types"
import { keyToString } from "./utils"

/** Machine readable reason attached to every error the container throws */
export const ERROR_CODE = {
  /** The key is not bound in the container (or any of its parents) */
  KEY_NOT_FOUND: "KEY_NOT_FOUND",
  /** Something is already bound under the key */
  KEY_ALREADY_EXISTS: "KEY_ALREADY_EXISTS",
  /** Two or more bindings depend on each other */
  CIRCULAR_REFERENCE: "CIRCULAR_REFERENCE",
  /** The container is locked {@link PumpIt.lock | PumpIt.lock()} */
  CONTAINER_LOCKED: "CONTAINER_LOCKED",
  /** Setting the parent would create a cycle in the container hierarchy */
  PARENT_CYCLE: "PARENT_CYCLE",
  /** {@link PumpIt.validate | PumpIt.validate()} found unresolvable bindings */
  VALIDATION: "VALIDATION",
} as const

/** Available error codes {@link ERROR_CODE}*/
export type ErrorCode = keyof typeof ERROR_CODE

/**
 * Every error thrown by the container is a `PumpitError`, so it can be caught
 * by type and branched on via {@link PumpitError.code}.
 */
export class PumpitError extends Error {
  constructor(
    message: string,
    /** Machine readable reason for the error {@link ERROR_CODE} */
    public readonly code: ErrorCode,
  ) {
    super(message)
    this.name = "PumpitError"
  }
}

/**
 * Thrown by {@link PumpIt.validate | PumpIt.validate()} when the container
 * holds bindings whose dependencies cannot be resolved.
 */
export class PumpitValidationError extends PumpitError {
  constructor(
    /** Every dependency that could not be found, and who wants it */
    public readonly result: ValidationError[],
  ) {
    super(formatValidationErrors(result), ERROR_CODE.VALIDATION)
    this.name = "PumpitValidationError"
  }
}

function formatValidationErrors(errors: ValidationError[]): string {
  const lines = errors.map(
    ({ key, wantedBy }) =>
      `  [ ${keyToString(key)} ] wanted by: ${wantedBy
        .map((k) => `[ ${keyToString(k)} ]`)
        .join(", ")}`,
  )

  return `Validation failed, ${errors.length} unresolved ${
    errors.length === 1 ? "dependency" : "dependencies"
  }:\n${lines.join("\n")}`
}
