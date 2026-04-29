/**
 * Version management library
 * Supports two-part (X.Y) and three-part (X.Y.Z) version numbers
 */

// Export types
export type { VersionFormat, UpgradeType, CompareResult } from './types';

// Export errors
export {
  VersionParseError,
  VersionFormatMismatchError,
  VersionOperationError,
} from './errors';

// Export main class
export { Version } from './version';
