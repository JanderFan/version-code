import { describe, expect, test } from "vitest";
import {
  Version,
  VersionFormatMismatchError,
  VersionOperationError,
  VersionParseError,
} from "../src/index";

describe("Version", () => {
  describe("parse", () => {
    test("parses two-part version", () => {
      const v = Version.parse("1.2");
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBeUndefined();
      expect(v.format).toBe("two-part");
    });

    test("parses three-part version", () => {
      const v = Version.parse("1.2.3");
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(3);
      expect(v.format).toBe("three-part");
    });

    test("parses with leading/trailing whitespace", () => {
      const v1 = Version.parse("  1.2  ");
      expect(v1.toString()).toBe("1.2");

      const v2 = Version.parse("\t1.2.3\n");
      expect(v2.toString()).toBe("1.2.3");
    });

    test("parses versions with zeros", () => {
      const v1 = Version.parse("0.0");
      expect(v1.toString()).toBe("0.0");

      const v2 = Version.parse("0.0.0");
      expect(v2.toString()).toBe("0.0.0");

      const v3 = Version.parse("1.0");
      expect(v3.toString()).toBe("1.0");

      const v4 = Version.parse("1.0.0");
      expect(v4.toString()).toBe("1.0.0");
    });

    test("throws on invalid format", () => {
      expect(() => Version.parse("invalid")).toThrow(VersionParseError);
      expect(() => Version.parse("1")).toThrow(VersionParseError);
      expect(() => Version.parse("1.2.3.4")).toThrow(VersionParseError);
      expect(() => Version.parse("1.2.")).toThrow(VersionParseError);
      expect(() => Version.parse(".1.2")).toThrow(VersionParseError);
      expect(() => Version.parse("1..2")).toThrow(VersionParseError);
    });

    test("throws on negative numbers", () => {
      expect(() => Version.parse("-1.2")).toThrow(VersionParseError);
      expect(() => Version.parse("1.-2")).toThrow(VersionParseError);
      expect(() => Version.parse("1.2.-3")).toThrow(VersionParseError);
    });

    test("throws on non-integer numbers", () => {
      expect(() => Version.parse("1.2.3.4")).toThrow(VersionParseError);
      expect(() => Version.parse("1.2.3a")).toThrow(VersionParseError);
    });
  });

  describe("create", () => {
    test("creates two-part version", () => {
      const v = Version.create(1, 2);
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBeUndefined();
      expect(v.format).toBe("two-part");
    });

    test("creates three-part version", () => {
      const v = Version.create(1, 2, 3);
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(3);
      expect(v.format).toBe("three-part");
    });

    test("validates numeric inputs", () => {
      expect(() => Version.create(-1, 2)).toThrow(VersionParseError);
      expect(() => Version.create(1, -2)).toThrow(VersionParseError);
      expect(() => Version.create(1, 2, -3)).toThrow(VersionParseError);
      expect(() => Version.create(1.5, 2)).toThrow(VersionParseError);
      expect(() => Version.create(1, 2.5)).toThrow(VersionParseError);
      expect(() => Version.create(1, 2, 3.5)).toThrow(VersionParseError);
    });
  });

  describe("compare", () => {
    test("compares two-part versions correctly", () => {
      const v1 = Version.parse("1.2");
      const v2 = Version.parse("1.3");
      const v3 = Version.parse("2.0");

      expect(v1.compare(v2)).toBe(-1);
      expect(v2.compare(v1)).toBe(1);
      expect(v1.compare(v1)).toBe(0);
      expect(v1.compare(v3)).toBe(-1);
    });

    test("compares three-part versions correctly", () => {
      const v1 = Version.parse("1.2.3");
      const v2 = Version.parse("1.2.4");
      const v3 = Version.parse("1.3.0");
      const v4 = Version.parse("2.0.0");

      expect(v1.compare(v2)).toBe(-1);
      expect(v2.compare(v1)).toBe(1);
      expect(v1.compare(v1)).toBe(0);
      expect(v1.compare(v3)).toBe(-1);
      expect(v3.compare(v4)).toBe(-1);
    });

    test("throws on format mismatch", () => {
      const v1 = Version.parse("1.2");
      const v2 = Version.parse("1.2.3");

      expect(() => v1.compare(v2)).toThrow(VersionFormatMismatchError);
      expect(() => v2.compare(v1)).toThrow(VersionFormatMismatchError);
    });

    test("is transitive", () => {
      const a = Version.parse("1.0.0");
      const b = Version.parse("1.1.0");
      const c = Version.parse("2.0.0");

      expect(a.compare(b)).toBe(-1);
      expect(b.compare(c)).toBe(-1);
      expect(a.compare(c)).toBe(-1);
    });
  });

  describe("equals", () => {
    test("returns true for equal versions", () => {
      const v1 = Version.parse("1.2");
      const v2 = Version.parse("1.2");
      expect(v1.equals(v2)).toBe(true);
    });

    test("returns false for different versions", () => {
      const v1 = Version.parse("1.2");
      const v2 = Version.parse("1.3");
      expect(v1.equals(v2)).toBe(false);
    });

    test("returns false for different formats", () => {
      const v1 = Version.parse("1.2");
      const v2 = Version.parse("1.2.0");
      expect(v1.equals(v2)).toBe(false);
    });
  });

  describe("upgrade", () => {
    test("upgrades major correctly", () => {
      const v1 = Version.parse("1.2");
      expect(v1.upgrade("major").toString()).toBe("2.0");

      const v2 = Version.parse("1.2.3");
      expect(v2.upgrade("major").toString()).toBe("2.0.0");
    });

    test("upgrades minor correctly", () => {
      const v1 = Version.parse("1.2");
      expect(v1.upgrade("minor").toString()).toBe("1.3");

      const v2 = Version.parse("1.2.3");
      expect(v2.upgrade("minor").toString()).toBe("1.3.0");
    });

    test("upgrades patch for three-part", () => {
      const v = Version.parse("1.2.3");
      expect(v.upgrade("patch").toString()).toBe("1.2.4");
    });

    test("throws on patch for two-part", () => {
      const v = Version.parse("1.2");
      expect(() => v.upgrade("patch")).toThrow(VersionOperationError);
    });
  });

  describe("toString", () => {
    test("converts two-part to string", () => {
      const v = Version.parse("1.2");
      expect(v.toString()).toBe("1.2");
    });

    test("converts three-part to string", () => {
      const v = Version.parse("1.2.3");
      expect(v.toString()).toBe("1.2.3");
    });
  });

  describe("type guards", () => {
    test("isTwoPart works correctly", () => {
      const v1 = Version.parse("1.2");
      expect(v1.isTwoPart()).toBe(true);
      expect(v1.isThreePart()).toBe(false);

      const v2 = Version.parse("1.2.3");
      expect(v2.isTwoPart()).toBe(false);
      expect(v2.isThreePart()).toBe(true);
    });

    test("type guards enable type narrowing", () => {
      const v = Version.parse("1.2.3");
      if (v.isThreePart()) {
        expect(v.patch).toBe(3);
      }
    });
  });

  describe("conversions", () => {
    test("toTwoPart works correctly", () => {
      const v1 = Version.parse("1.2");
      expect(v1.toTwoPart()).toBe(v1);

      const v2 = Version.parse("1.2.3");
      expect(() => v2.toTwoPart()).toThrow(VersionOperationError);
    });

    test("toThreePart works correctly", () => {
      const v1 = Version.parse("1.2.3");
      expect(v1.toThreePart()).toBe(v1);

      const v2 = Version.parse("1.2");
      const converted = v2.toThreePart();
      expect(converted.toString()).toBe("1.2.0");
      expect(converted.format).toBe("three-part");
    });
  });

  describe("immutability", () => {
    test("upgrade does not mutate original", () => {
      const v1 = Version.parse("1.2.3");
      const v2 = v1.upgrade("minor");
      expect(v1.toString()).toBe("1.2.3");
      expect(v2.toString()).toBe("1.3.0");
    });

    test("object is frozen", () => {
      const v = Version.parse("1.2.3");
      expect(Object.isFrozen(v)).toBe(true);
    });
  });

  describe("toJSON", () => {
    test("serializes to string", () => {
      const v1 = Version.parse("1.2");
      expect(v1.toJSON()).toBe("1.2");

      const v2 = Version.parse("1.2.3");
      expect(v2.toJSON()).toBe("1.2.3");
    });
  });
});
