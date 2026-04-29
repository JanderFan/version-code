# version-code

版本号管理、比较库 - 支持两位和三位版本号的独立管理

## 特性

- ✅ 支持两位版本号（如 `1.2`）和三位版本号（如 `1.2.3`）
- ✅ 版本号比较（相同格式才能比较）
- ✅ 版本号升级（major、minor、patch）
- ✅ 完整的 TypeScript 类型支持
- ✅ 不可变对象设计
- ✅ 零依赖

## 安装

```bash
# 使用 npm
npm install version-code

# 使用 yarn
yarn add version-code

# 使用 pnpm
pnpm add version-code
```

## 快速开始

### 解析版本号

```typescript
import { Version } from 'version-code';

// 从字符串解析
const v1 = Version.parse('1.2');      // 两位版本号
const v2 = Version.parse('1.2.3');    // 三位版本号

// 从数字创建
const v3 = Version.create(1, 2);      // 两位版本号
const v4 = Version.create(1, 2, 3);   // 三位版本号
```

### 比较版本号

```typescript
import { Version } from 'version-code';

const v1 = Version.parse('1.2');
const v2 = Version.parse('1.3');
const v3 = Version.parse('1.2.3');
const v4 = Version.parse('1.2.4');

// 比较返回 -1, 0, 1
v1.compare(v2);  // -1 (1.2 < 1.3)
v2.compare(v1);  // 1  (1.3 > 1.2)
v1.compare(v1);  // 0  (相等)

v3.compare(v4);  // -1 (1.2.3 < 1.2.4)

// 检查相等性
v1.equals(v2);   // false
v1.equals(v1);   // true
```

### 升级版本号

```typescript
import { Version } from 'version-code';

const twoPart = Version.parse('1.2');
const threePart = Version.parse('1.2.3');

// Major 升级
twoPart.upgrade('major');     // 2.0
threePart.upgrade('major');   // 2.0.0

// Minor 升级
twoPart.upgrade('minor');     // 1.3
threePart.upgrade('minor');   // 1.3.0

// Patch 升级（仅适用于三位版本号）
threePart.upgrade('patch');   // 1.2.4
```

### 类型守卫

```typescript
import { Version } from 'version-code';

const version = Version.parse('1.2.3');

if (version.isThreePart()) {
  // TypeScript 知道 version.patch 是 number 类型
  console.log(version.patch); // 3
}

if (version.isTwoPart()) {
  // TypeScript 知道 version.patch 是 undefined
  console.log('两位版本号');
}
```

### 格式转换

```typescript
import { Version } from 'version-code';

const twoPart = Version.parse('1.2');
const threePart = Version.parse('1.2.3');

// 两位版本号转三位（添加 .0）
twoPart.toThreePart();  // 1.2.0

// 三位版本号转两位（会抛出错误）
threePart.toTwoPart();  // 抛出 VersionOperationError
```

## API 文档

### `Version` 类

#### 静态方法

##### `Version.parse(versionString: string): Version`

从字符串解析版本号。

- **参数**: `versionString` - 版本号字符串（如 `"1.2"` 或 `"1.2.3"`）
- **返回**: `Version` 对象
- **抛出**: `VersionParseError` - 如果格式无效

```typescript
const v1 = Version.parse('1.2');
const v2 = Version.parse('1.2.3');
```

##### `Version.create(major: number, minor: number): Version`
##### `Version.create(major: number, minor: number, patch: number): Version`

从数字创建版本号。

- **参数**:
  - `major` - 主版本号（非负整数）
  - `minor` - 次版本号（非负整数）
  - `patch` - 修订号（非负整数，可选）
- **返回**: `Version` 对象
- **抛出**: `VersionParseError` - 如果参数无效

```typescript
const v1 = Version.create(1, 2);      // 两位版本号
const v2 = Version.create(1, 2, 3);   // 三位版本号
```

#### 实例属性

- `major: number` - 主版本号
- `minor: number` - 次版本号
- `patch: number | undefined` - 修订号（两位版本号为 `undefined`）
- `format: 'two-part' | 'three-part'` - 版本号格式

#### 实例方法

##### `compare(other: Version): -1 | 0 | 1`

比较两个版本号。

- **参数**: `other` - 要比较的版本号
- **返回**: `-1`（小于）、`0`（等于）、`1`（大于）
- **抛出**: `VersionFormatMismatchError` - 如果格式不同

```typescript
const v1 = Version.parse('1.2');
const v2 = Version.parse('1.3');
v1.compare(v2);  // -1
```

##### `equals(other: Version): boolean`

检查两个版本号是否相等。

- **参数**: `other` - 要比较的版本号
- **返回**: `true` 如果相等，`false` 否则

```typescript
const v1 = Version.parse('1.2');
const v2 = Version.parse('1.2');
v1.equals(v2);  // true
```

##### `upgrade(type: 'major' | 'minor' | 'patch'): Version`

升级版本号。

- **参数**: `type` - 升级类型
  - `'major'` - 主版本号升级（如 `1.2` → `2.0`）
  - `'minor'` - 次版本号升级（如 `1.2` → `1.3`）
  - `'patch'` - 修订号升级（如 `1.2.3` → `1.2.4`，仅三位版本号）
- **返回**: 新的 `Version` 对象
- **抛出**: `VersionOperationError` - 如果对两位版本号使用 `'patch'`

```typescript
const v = Version.parse('1.2.3');
v.upgrade('major');  // 2.0.0
v.upgrade('minor');  // 1.3.0
v.upgrade('patch');  // 1.2.4
```

##### `toString(): string`

转换为字符串表示。

```typescript
const v = Version.parse('1.2.3');
v.toString();  // "1.2.3"
```

##### `isTwoPart(): boolean`

类型守卫，检查是否为两位版本号。

```typescript
const v = Version.parse('1.2');
v.isTwoPart();  // true
```

##### `isThreePart(): boolean`

类型守卫，检查是否为三位版本号。

```typescript
const v = Version.parse('1.2.3');
v.isThreePart();  // true
```

##### `toTwoPart(): Version`

转换为两位版本号。

- **返回**: 两位版本号
- **抛出**: `VersionOperationError` - 如果已经是两位版本号

```typescript
const v = Version.parse('1.2');
v.toTwoPart();  // 返回自身
```

##### `toThreePart(): Version`

转换为三位版本号（添加 `.0`）。

```typescript
const v = Version.parse('1.2');
v.toThreePart();  // 1.2.0
```

##### `toJSON(): string`

JSON 序列化。

```typescript
const v = Version.parse('1.2.3');
v.toJSON();  // "1.2.3"
JSON.stringify({ version: v });  // {"version":"1.2.3"}
```

### 错误类

#### `VersionParseError`

解析错误，当版本号字符串格式无效时抛出。

```typescript
try {
  Version.parse('invalid');
} catch (e) {
  if (e instanceof VersionParseError) {
    console.error(e.message);
  }
}
```

#### `VersionFormatMismatchError`

格式不匹配错误，当比较不同格式的版本号时抛出。

```typescript
const v1 = Version.parse('1.2');
const v2 = Version.parse('1.2.3');

try {
  v1.compare(v2);
} catch (e) {
  if (e instanceof VersionFormatMismatchError) {
    console.error('不能比较不同格式的版本号');
  }
}
```

#### `VersionOperationError`

操作错误，当执行不支持的操作时抛出（如对两位版本号升级 patch）。

```typescript
const v = Version.parse('1.2');

try {
  v.upgrade('patch');
} catch (e) {
  if (e instanceof VersionOperationError) {
    console.error('两位版本号不支持 patch 升级');
  }
}
```

### 类型定义

```typescript
type VersionFormat = 'two-part' | 'three-part';
type UpgradeType = 'major' | 'minor' | 'patch';
type CompareResult = -1 | 0 | 1;
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 运行测试

```bash
pnpm test
```

### 构建

```bash
pnpm build
```

### 开发模式（监听文件变化）

```bash
pnpm dev
```

## 设计原则

### 不可变性

所有 `Version` 对象都是不可变的。升级操作返回新的对象，不会修改原对象。

```typescript
const v1 = Version.parse('1.2.3');
const v2 = v1.upgrade('minor');

console.log(v1.toString());  // "1.2.3" (未改变)
console.log(v2.toString());  // "1.3.0"
```

### 格式独立

两位版本号和三位版本号是独立的格式，不能直接比较。

```typescript
const v1 = Version.parse('1.2');
const v2 = Version.parse('1.2.0');

v1.equals(v2);  // false (不同格式)
v1.compare(v2); // 抛出 VersionFormatMismatchError
```

### 类型安全

使用 TypeScript 类型守卫实现编译时类型安全。

```typescript
const version = Version.parse('1.2.3');

if (version.isThreePart()) {
  // TypeScript 知道 version.patch 是 number
  const patch: number = version.patch;
}
```

## 许可证

ISC

## 作者

Jander Fan
