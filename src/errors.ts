/**
 * Custom error classes for version management
 */

export class VersionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionParseError';
  }
}

export class VersionFormatMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionFormatMismatchError';
  }
}

export class VersionOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionOperationError';
  }
}
