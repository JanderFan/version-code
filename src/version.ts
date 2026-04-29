import {
  VersionFormatMismatchError,
  VersionOperationError,
  VersionParseError,
} from './errors';
import type { CompareResult, UpgradeType, VersionFormat } from './types';

// Validation regex patterns
const TWO_PART_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const THREE_PART_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Version class for managing two-part and three-part version numbers
 */
export class Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number | undefined;
  readonly format: VersionFormat;

  private constructor(major: number, minor: number, patch?: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.format = patch === undefined ? 'two-part' : 'three-part';
    Object.freeze(this);
  }

  /**
   * Parse version string into Version object
   * @throws VersionParseError if invalid format
   */
  static parse(versionString: string): Version {
    const trimmed = versionString.trim();

    // Try three-part first (more specific)
    const threePartMatch = trimmed.match(THREE_PART_REGEX);
    if (threePartMatch) {
      const [_, major, minor, patch] = threePartMatch;
      return new Version(
        parseInt(major!, 10),
        parseInt(minor!, 10),
        parseInt(patch!, 10),
      );
    }

    // Try two-part
    const twoPartMatch = trimmed.match(TWO_PART_REGEX);
    if (twoPartMatch) {
      const [_, major, minor] = twoPartMatch;
      return new Version(parseInt(major!, 10), parseInt(minor!, 10));
    }

    throw new VersionParseError(
      `Invalid version string: "${versionString}". Expected format: "X.Y" or "X.Y.Z"`,
    );
  }

  /**
   * Create version from numeric components
   */
  static create(major: number, minor: number): Version;
  static create(major: number, minor: number, patch: number): Version;
  static create(major: number, minor: number, patch?: number): Version {
    if (!Number.isInteger(major) || major < 0) {
      throw new VersionParseError('Major must be a non-negative integer');
    }
    if (!Number.isInteger(minor) || minor < 0) {
      throw new VersionParseError('Minor must be a non-negative integer');
    }
    if (patch !== undefined) {
      if (!Number.isInteger(patch) || patch < 0) {
        throw new VersionParseError('Patch must be a non-negative integer');
      }
    }

    return new Version(major, minor, patch);
  }

  /**
   * Compare this version with another
   * @returns -1 if this < other, 0 if equal, 1 if this > other
   * @throws VersionFormatMismatchError if formats differ
   */
  compare(other: Version): CompareResult {
    if (this.format !== other.format) {
      throw new VersionFormatMismatchError(
        `Cannot compare different version formats: ${this.format} vs ${other.format}`,
      );
    }

    if (this.major < other.major) return -1;
    if (this.major > other.major) return 1;

    if (this.minor < other.minor) return -1;
    if (this.minor > other.minor) return 1;

    if (this.format === 'three-part') {
      const thisPatch = this.patch as number;
      const otherPatch = other.patch as number;

      if (thisPatch < otherPatch) return -1;
      if (thisPatch > otherPatch) return 1;
    }

    return 0;
  }

  /**
   * Check equality (formats must match)
   */
  equals(other: Version): boolean {
    try {
      return this.compare(other) === 0;
    } catch {
      return false;
    }
  }

  /**
   * Create a new version with incremented component
   * @throws VersionOperationError if patch upgrade on two-part version
   */
  upgrade(type: UpgradeType): Version {
    switch (type) {
      case 'major':
        return new Version(
          this.major + 1,
          0,
          this.format === 'three-part' ? 0 : undefined,
        );

      case 'minor':
        return new Version(
          this.major,
          this.minor + 1,
          this.format === 'three-part' ? 0 : undefined,
        );

      case 'patch':
        if (this.format !== 'three-part') {
          throw new VersionOperationError(
            'Cannot upgrade patch on two-part version. Use "minor" instead.',
          );
        }
        return new Version(this.major, this.minor, (this.patch as number) + 1);

      default:
        // eslint-disable-next-line no-case-declarations
        const _exhaustive: never = type;
        throw new VersionOperationError(`Unknown upgrade type: ${_exhaustive}`);
    }
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    if (this.format === 'three-part') {
      return `${this.major}.${this.minor}.${this.patch}`;
    }
    return `${this.major}.${this.minor}`;
  }

  /**
   * Type guard for two-part format
   */
  isTwoPart(): this is Version & { patch: undefined } {
    return this.format === 'two-part';
  }

  /**
   * Type guard for three-part format
   */
  isThreePart(): this is Version & { patch: number } {
    return this.format === 'three-part';
  }

  /**
   * Convert to two-part (throws if already two-part)
   */
  toTwoPart(): Version {
    if (this.format === 'two-part') {
      return this;
    }
    throw new VersionOperationError('Version is already two-part');
  }

  /**
   * Convert to three-part (adds .0 if two-part)
   */
  toThreePart(): Version {
    if (this.format === 'three-part') {
      return this;
    }
    return new Version(this.major, this.minor, 0);
  }

  /**
   * JSON serialization
   */
  toJSON(): string {
    return this.toString();
  }
}
