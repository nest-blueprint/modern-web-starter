export interface SerializedException {
  message: string;
  code: string;
  stack?: string;
  metadata?: unknown;
  /**
   * ^ Consider adding optional `metadata` object to
   * exceptions (if language doesn't entity anything
   * similar by default) and pass some useful technical
   * information about the exception when throwing.
   * This will make debugging easier.
   */
}

/**
 * Base class for custom exceptions.
 *
 * @abstract
 * @class ExceptionBase
 * @extends {Error}
 */
export abstract class ExceptionBase extends Error {
  constructor(
    public readonly message: string,
    public readonly metadata?: unknown,
    public readonly domainError?: { cause: string },
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  abstract code: string;

  serialize(): SerializedException {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      metadata: this.metadata,
    };
  }
}
