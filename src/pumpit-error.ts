export class PumpitError extends Error {
  constructor(
    message: string,
    public result: { key: any; wantedBy: any }[],
  ) {
    super(message)
  }
}
