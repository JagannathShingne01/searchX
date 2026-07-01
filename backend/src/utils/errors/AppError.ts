export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}