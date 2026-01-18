import typedFunction from '@danielsimonjr/typed-function';
import Decimal from 'decimal.js';
import escapeLatexLib from 'escape-latex';
import seedrandom from 'seedrandom';
import naturalSort from 'javascript-natural-sort';

// src/utils/object.ts
function clone(x) {
  const type = typeof x;
  if (type === "number" || type === "bigint" || type === "string" || type === "boolean" || x === null || x === void 0) {
    return x;
  }
  if (typeof x.clone === "function") {
    return x.clone();
  }
  if (Array.isArray(x)) {
    return x.map((value) => clone(value));
  }
  if (x instanceof Date) return new Date(x.valueOf());
  if (isBigNumber(x)) return x;
  if (isObject(x)) {
    return mapObject(x, clone);
  }
  if (type === "function") {
    return x;
  }
  throw new TypeError(`Cannot clone: unknown type of value (value: ${x})`);
}
function mapObject(object, callback) {
  const clone3 = {};
  for (const key in object) {
    if (hasOwnProperty(object, key)) {
      clone3[key] = callback(object[key]);
    }
  }
  return clone3;
}
function deepStrictEqual(a, b) {
  let prop;
  let i;
  let len;
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = 0, len = a.length; i < len; i++) {
      if (!deepStrictEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a === "function") {
    return a === b;
  } else if (a instanceof Object) {
    if (Array.isArray(b) || !(b instanceof Object)) {
      return false;
    }
    for (prop in a) {
      if (!(prop in b) || !deepStrictEqual(a[prop], b[prop])) {
        return false;
      }
    }
    for (prop in b) {
      if (!(prop in a)) {
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}
function lazy(object, prop, valueResolver) {
  let _uninitialized = true;
  let _value;
  Object.defineProperty(object, prop, {
    get: function() {
      if (_uninitialized) {
        _value = valueResolver();
        _uninitialized = false;
      }
      return _value;
    },
    set: function(value) {
      _value = value;
      _uninitialized = false;
    },
    configurable: true,
    enumerable: true
  });
}
function hasOwnProperty(object, property) {
  return object && Object.hasOwnProperty.call(object, property);
}
function pickShallow(object, properties2) {
  const copy = {};
  for (let i = 0; i < properties2.length; i++) {
    const key = properties2[i];
    const value = object[key];
    if (value !== void 0) {
      copy[key] = value;
    }
  }
  return copy;
}

// src/utils/customs.ts
function getSafeProperty(object, prop) {
  if (isSafeProperty(object, prop)) {
    return object[prop];
  }
  if (typeof object[prop] === "function" && isSafeMethod(object, prop)) {
    throw new Error('Cannot access method "' + prop + '" as a property');
  }
  throw new Error('No access to property "' + prop + '"');
}
function setSafeProperty(object, prop, value) {
  if (isSafeProperty(object, prop)) {
    object[prop] = value;
    return value;
  }
  throw new Error('No access to property "' + prop + '"');
}
function isSafeProperty(object, prop) {
  if (!isPlainObject(object) && !Array.isArray(object)) {
    return false;
  }
  if (hasOwnProperty(safeNativeProperties, prop)) {
    return true;
  }
  if (prop in Object.prototype) {
    return false;
  }
  if (prop in Function.prototype) {
    return false;
  }
  return true;
}
function getSafeMethod(object, method) {
  if (!isSafeMethod(object, method)) {
    throw new Error('No access to method "' + method + '"');
  }
  return object[method];
}
function isSafeMethod(object, method) {
  if (object === null || object === void 0 || typeof object[method] !== "function") {
    return false;
  }
  if (hasOwnProperty(object, method) && Object.getPrototypeOf && method in Object.getPrototypeOf(object)) {
    return false;
  }
  if (hasOwnProperty(safeNativeMethods, method)) {
    return true;
  }
  if (method in Object.prototype) {
    return false;
  }
  if (method in Function.prototype) {
    return false;
  }
  return true;
}
function isPlainObject(object) {
  return typeof object === "object" && object && object.constructor === Object;
}
var safeNativeProperties = {
  length: true,
  name: true
};
var safeNativeMethods = {
  toString: true,
  valueOf: true,
  toLocaleString: true
};

// src/utils/map.ts
var _a;
_a = Symbol.toStringTag;
var ObjectWrappingMap = class {
  constructor(object) {
    this[_a] = "ObjectWrappingMap";
    this.wrappedObject = object;
    this[Symbol.iterator] = this.entries;
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  keys() {
    return Object.keys(this.wrappedObject).filter((key) => this.has(key)).values();
  }
  get(key) {
    return getSafeProperty(this.wrappedObject, key);
  }
  set(key, value) {
    setSafeProperty(this.wrappedObject, key, value);
    return this;
  }
  has(key) {
    return isSafeProperty(this.wrappedObject, key) && key in this.wrappedObject;
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  entries() {
    return mapIterator(this.keys(), (key) => [
      key,
      this.get(key)
    ]);
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  *values() {
    for (const key of this.keys()) {
      yield this.get(key);
    }
  }
  forEach(callback) {
    for (const key of this.keys()) {
      callback(this.get(key), key, this);
    }
  }
  delete(key) {
    if (isSafeProperty(this.wrappedObject, key)) {
      delete this.wrappedObject[key];
      return true;
    }
    return false;
  }
  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
  get size() {
    return Object.keys(this.wrappedObject).length;
  }
};
var _a2;
_a2 = Symbol.toStringTag;
var PartitionedMap = class {
  /**
   * @param a - Primary map
   * @param b - Secondary map
   * @param bKeys - Set of keys that should be read/written to map b
   */
  constructor(a, b, bKeys) {
    this[_a2] = "PartitionedMap";
    this.a = a;
    this.b = b;
    this.bKeys = bKeys;
    this[Symbol.iterator] = this.entries;
  }
  get(key) {
    return this.bKeys.has(key) ? this.b.get(key) : this.a.get(key);
  }
  set(key, value) {
    if (this.bKeys.has(key)) {
      this.b.set(key, value);
    } else {
      this.a.set(key, value);
    }
    return this;
  }
  has(key) {
    return this.b.has(key) || this.a.has(key);
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  keys() {
    return (/* @__PURE__ */ new Set([...this.a.keys(), ...this.b.keys()]))[Symbol.iterator]();
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  *values() {
    for (const key of this.keys()) {
      yield this.get(key);
    }
  }
  // @ts-expect-error: Implementation is compatible but TS can't infer it
  entries() {
    return mapIterator(this.keys(), (key) => [
      key,
      this.get(key)
    ]);
  }
  forEach(callback) {
    for (const key of this.keys()) {
      callback(this.get(key), key, this);
    }
  }
  delete(key) {
    return this.bKeys.has(key) ? this.b.delete(key) : this.a.delete(key);
  }
  clear() {
    this.a.clear();
    this.b.clear();
  }
  get size() {
    return [...this.keys()].length;
  }
};
function mapIterator(it, callback) {
  return {
    next: () => {
      const n = it.next();
      return n.done ? n : {
        value: callback(n.value),
        done: false
      };
    }
  };
}
function createEmptyMap() {
  return /* @__PURE__ */ new Map();
}
function createMap(mapOrObject) {
  if (!mapOrObject) {
    return createEmptyMap();
  }
  if (isMap(mapOrObject)) {
    return mapOrObject;
  }
  if (isObject(mapOrObject)) {
    return new ObjectWrappingMap(
      mapOrObject
    );
  }
  throw new Error("createMap can create maps from objects or Maps");
}
function toObject(map2) {
  if (map2 instanceof ObjectWrappingMap) {
    return map2.wrappedObject;
  }
  const object = {};
  for (const key of map2.keys()) {
    const value = map2.get(key);
    setSafeProperty(object, key, value);
  }
  return object;
}

// src/utils/is.ts
function isNumber(x) {
  return typeof x === "number";
}
function isBigNumber(x) {
  if (!x || typeof x !== "object" || typeof x.constructor !== "function") {
    return false;
  }
  const obj = x;
  if (obj.isBigNumber === true && typeof obj.constructor.prototype === "object" && obj.constructor.prototype.isBigNumber === true) {
    return true;
  }
  if (typeof obj.constructor.isDecimal === "function" && obj.constructor.isDecimal(obj) === true) {
    return true;
  }
  return false;
}
function isBigInt(x) {
  return typeof x === "bigint";
}
function isComplex(x) {
  return x && typeof x === "object" && Object.getPrototypeOf(x).isComplex === true || false;
}
function isFraction(x) {
  return x && typeof x === "object" && Object.getPrototypeOf(x).isFraction === true || false;
}
function isUnit(x) {
  return x && x.constructor.prototype.isUnit === true || false;
}
function isString(x) {
  return typeof x === "string";
}
var isArray = Array.isArray;
function isMatrix(x) {
  return x && x.constructor.prototype.isMatrix === true || false;
}
function isCollection(x) {
  return Array.isArray(x) || isMatrix(x);
}
function isDenseMatrix(x) {
  return x && x.isDenseMatrix && x.constructor.prototype.isMatrix === true || false;
}
function isSparseMatrix(x) {
  return x && x.isSparseMatrix && x.constructor.prototype.isMatrix === true || false;
}
function isRange(x) {
  return x && x.constructor.prototype.isRange === true || false;
}
function isIndex(x) {
  return x && x.constructor.prototype.isIndex === true || false;
}
function isBoolean(x) {
  return typeof x === "boolean";
}
function isResultSet(x) {
  return x && x.constructor.prototype.isResultSet === true || false;
}
function isHelp(x) {
  return x && x.constructor.prototype.isHelp === true || false;
}
function isFunction(x) {
  return typeof x === "function";
}
function isDate(x) {
  return x instanceof Date;
}
function isRegExp(x) {
  return x instanceof RegExp;
}
function isObject(x) {
  return !!(x && typeof x === "object" && x.constructor === Object && !isComplex(x) && !isFraction(x));
}
function isMap(object) {
  if (!object) {
    return false;
  }
  return object instanceof Map || object instanceof ObjectWrappingMap || typeof object.set === "function" && typeof object.get === "function" && typeof object.keys === "function" && typeof object.has === "function";
}
function isNull(x) {
  return x === null;
}
function isUndefined(x) {
  return x === void 0;
}
function isAccessorNode(x) {
  return x && x.isAccessorNode === true && x.constructor.prototype.isNode === true || false;
}
function isArrayNode(x) {
  return x && x.isArrayNode === true && x.constructor.prototype.isNode === true || false;
}
function isAssignmentNode(x) {
  return x && x.isAssignmentNode === true && x.constructor.prototype.isNode === true || false;
}
function isBlockNode(x) {
  return x && x.isBlockNode === true && x.constructor.prototype.isNode === true || false;
}
function isConditionalNode(x) {
  return x && x.isConditionalNode === true && x.constructor.prototype.isNode === true || false;
}
function isConstantNode(x) {
  return x && x.isConstantNode === true && x.constructor.prototype.isNode === true || false;
}
function rule2Node(node) {
  return isConstantNode(node) || isOperatorNode(node) && node.args.length === 1 && isConstantNode(node.args[0]) && "-+~".includes(node.op);
}
function isFunctionAssignmentNode(x) {
  return x && x.isFunctionAssignmentNode === true && x.constructor.prototype.isNode === true || false;
}
function isFunctionNode(x) {
  return x && x.isFunctionNode === true && x.constructor.prototype.isNode === true || false;
}
function isIndexNode(x) {
  return x && x.isIndexNode === true && x.constructor.prototype.isNode === true || false;
}
function isNode(x) {
  return x && x.isNode === true && x.constructor.prototype.isNode === true || false;
}
function isObjectNode(x) {
  return x && x.isObjectNode === true && x.constructor.prototype.isNode === true || false;
}
function isOperatorNode(x) {
  return x && x.isOperatorNode === true && x.constructor.prototype.isNode === true || false;
}
function isParenthesisNode(x) {
  return x && x.isParenthesisNode === true && x.constructor.prototype.isNode === true || false;
}
function isRangeNode(x) {
  return x && x.isRangeNode === true && x.constructor.prototype.isNode === true || false;
}
function isRelationalNode(x) {
  return x && x.isRelationalNode === true && x.constructor.prototype.isNode === true || false;
}
function isSymbolNode(x) {
  return x && x.isSymbolNode === true && x.constructor.prototype.isNode === true || false;
}
function isChain(x) {
  return x && x.constructor.prototype.isChain === true || false;
}
function typeOf(x) {
  const t = typeof x;
  if (t === "object") {
    if (x === null) return "null";
    if (isBigNumber(x)) return "BigNumber";
    if (x.constructor && x.constructor.name)
      return x.constructor.name;
    return "Object";
  }
  return t;
}

// src/utils/number.ts
function isInteger(value) {
  if (typeof value === "boolean") {
    return true;
  }
  return isFinite(value) ? value === Math.round(value) : false;
}
function safeNumberType(numberStr, config) {
  if (config.number === "bigint") {
    try {
      BigInt(numberStr);
    } catch {
      return config.numberFallback;
    }
  }
  return config.number;
}
var sign = Math.sign || function(x) {
  if (x > 0) {
    return 1;
  } else if (x < 0) {
    return -1;
  } else {
    return 0;
  }
};
var log2 = Math.log2 || function log22(x) {
  return Math.log(x) / Math.LN2;
};
var log10 = Math.log10 || function log102(x) {
  return Math.log(x) / Math.LN10;
};
var log1p = Math.log1p || function(x) {
  return Math.log(x + 1);
};
var cbrt = Math.cbrt || function cbrt2(x) {
  if (x === 0) {
    return x;
  }
  const negate = x < 0;
  let result;
  if (negate) {
    x = -x;
  }
  if (isFinite(x)) {
    result = Math.exp(Math.log(x) / 3);
    result = (x / (result * result) + 2 * result) / 3;
  } else {
    result = x;
  }
  return negate ? -result : result;
};
var expm1 = Math.expm1 || function expm12(x) {
  return x >= 2e-4 || x <= -2e-4 ? Math.exp(x) - 1 : x + x * x / 2 + x * x * x / 6;
};
function formatNumberToBase(n, base, size) {
  const prefixes = { 2: "0b", 8: "0o", 16: "0x" };
  const prefix = prefixes[base];
  let suffix = "";
  if (size) {
    if (size < 1) {
      throw new Error("size must be in greater than 0");
    }
    if (!isInteger(size)) {
      throw new Error("size must be an integer");
    }
    if (n > 2 ** (size - 1) - 1 || n < -(2 ** (size - 1))) {
      throw new Error(
        `Value must be in range [-2^${size - 1}, 2^${size - 1}-1]`
      );
    }
    if (!isInteger(n)) {
      throw new Error("Value must be an integer");
    }
    if (n < 0) {
      n = n + 2 ** size;
    }
    suffix = `i${size}`;
  }
  let sign2 = "";
  if (n < 0) {
    n = -n;
    sign2 = "-";
  }
  return `${sign2}${prefix}${n.toString(base)}${suffix}`;
}
function format(value, options) {
  if (typeof options === "function") {
    return options(value);
  }
  if (value === Infinity) {
    return "Infinity";
  } else if (value === -Infinity) {
    return "-Infinity";
  } else if (isNaN(value)) {
    return "NaN";
  }
  const { notation, precision, wordSize } = normalizeFormatOptions(options);
  switch (notation) {
    case "fixed":
      return toFixed(value, precision);
    case "exponential":
      return toExponential(value, precision);
    case "engineering":
      return toEngineering(value, precision);
    case "bin":
      return formatNumberToBase(value, 2, wordSize);
    case "oct":
      return formatNumberToBase(value, 8, wordSize);
    case "hex":
      return formatNumberToBase(value, 16, wordSize);
    case "auto":
      return toPrecision(value, precision, options).replace(
        /((\.\d*?)(0+))($|e)/,
        function() {
          const digits2 = arguments[2];
          const e2 = arguments[4];
          return digits2 !== "." ? digits2 + e2 : e2;
        }
      );
    default:
      throw new Error(
        'Unknown notation "' + notation + '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.'
      );
  }
}
function normalizeFormatOptions(options) {
  let notation = "auto";
  let precision;
  let wordSize;
  if (options !== void 0) {
    if (isNumber(options)) {
      precision = options;
    } else if (isBigNumber(options)) {
      precision = options.toNumber();
    } else if (isObject(options)) {
      if (options.precision !== void 0) {
        precision = _toNumberOrThrow(options.precision, () => {
          throw new Error('Option "precision" must be a number or BigNumber');
        });
      }
      if (options.wordSize !== void 0) {
        wordSize = _toNumberOrThrow(options.wordSize, () => {
          throw new Error('Option "wordSize" must be a number or BigNumber');
        });
      }
      if (options.notation) {
        notation = options.notation;
      }
    } else {
      throw new Error(
        "Unsupported type of options, number, BigNumber, or object expected"
      );
    }
  }
  return { notation, precision, wordSize };
}
function splitNumber(value) {
  const match = String(value).toLowerCase().match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
  if (!match) {
    throw new SyntaxError("Invalid number " + value);
  }
  const sign2 = match[1];
  const digits2 = match[2];
  let exponent = parseFloat(match[4] || "0");
  const dot = digits2.indexOf(".");
  exponent += dot !== -1 ? dot - 1 : digits2.length - 1;
  const coefficients = digits2.replace(".", "").replace(/^0*/, function(zeros2) {
    exponent -= zeros2.length;
    return "";
  }).replace(/0*$/, "").split("").map(function(d) {
    return parseInt(d);
  });
  if (coefficients.length === 0) {
    coefficients.push(0);
    exponent++;
  }
  return { sign: sign2, coefficients, exponent };
}
function toEngineering(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  const split = splitNumber(value);
  const rounded = roundDigits(split, precision);
  const e2 = rounded.exponent;
  const c = rounded.coefficients;
  const newExp = e2 % 3 === 0 ? e2 : e2 < 0 ? e2 - 3 - e2 % 3 : e2 - e2 % 3;
  if (isNumber(precision)) {
    while (precision > c.length || e2 - newExp + 1 > c.length) {
      c.push(0);
    }
  } else {
    const missingZeros = Math.abs(e2 - newExp) - (c.length - 1);
    for (let i = 0; i < missingZeros; i++) {
      c.push(0);
    }
  }
  let expDiff = Math.abs(e2 - newExp);
  let decimalIdx = 1;
  while (expDiff > 0) {
    decimalIdx++;
    expDiff--;
  }
  const decimals = c.slice(decimalIdx).join("");
  const decimalVal = isNumber(precision) && decimals.length || decimals.match(/[1-9]/) ? "." + decimals : "";
  const str = c.slice(0, decimalIdx).join("") + decimalVal + "e" + (e2 >= 0 ? "+" : "") + newExp.toString();
  return rounded.sign + str;
}
function toFixed(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  const splitValue = splitNumber(value);
  const rounded = typeof precision === "number" ? roundDigits(splitValue, splitValue.exponent + 1 + precision) : splitValue;
  let c = rounded.coefficients;
  let p = rounded.exponent + 1;
  const pp = p + (precision || 0);
  if (c.length < pp) {
    c = c.concat(zeros(pp - c.length));
  }
  if (p < 0) {
    c = zeros(-p + 1).concat(c);
    p = 1;
  }
  if (p < c.length) {
    c.splice(p, 0, p === 0 ? "0." : ".");
  }
  return rounded.sign + c.join("");
}
function toExponential(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  const split = splitNumber(value);
  const rounded = precision ? roundDigits(split, precision) : split;
  let c = rounded.coefficients;
  const e2 = rounded.exponent;
  if (precision && c.length < precision) {
    c = c.concat(zeros(precision - c.length));
  }
  const first = c.shift();
  return rounded.sign + first + (c.length > 0 ? "." + c.join("") : "") + "e" + (e2 >= 0 ? "+" : "") + e2;
}
function toPrecision(value, precision, options) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  const lowerExp = _toNumberOrDefault(options?.lowerExp, -3);
  const upperExp = _toNumberOrDefault(options?.upperExp, 5);
  const split = splitNumber(value);
  const rounded = precision ? roundDigits(split, precision) : split;
  if (rounded.exponent < lowerExp || rounded.exponent >= upperExp) {
    return toExponential(value, precision);
  } else {
    let c = rounded.coefficients;
    const e2 = rounded.exponent;
    if (precision && c.length < precision) {
      c = c.concat(zeros(precision - c.length));
    }
    c = c.concat(
      zeros(
        e2 - c.length + 1 + (precision && c.length < precision ? precision - c.length : 0)
      )
    );
    c = zeros(-e2).concat(c);
    const dot = e2 > 0 ? e2 : 0;
    if (dot < c.length - 1) {
      c.splice(dot + 1, 0, ".");
    }
    return rounded.sign + c.join("");
  }
}
function roundDigits(split, precision) {
  const rounded = {
    sign: split.sign,
    coefficients: split.coefficients.slice(),
    exponent: split.exponent
  };
  const c = rounded.coefficients;
  if (precision !== void 0) {
    while (precision <= 0) {
      c.unshift(0);
      rounded.exponent++;
      precision++;
    }
    if (c.length > precision) {
      const removed = c.splice(precision, c.length - precision);
      if (removed[0] >= 5) {
        let i = precision - 1;
        c[i]++;
        while (c[i] === 10) {
          c.pop();
          if (i === 0) {
            c.unshift(0);
            rounded.exponent++;
            i++;
          }
          i--;
          c[i]++;
        }
      }
    }
  }
  return rounded;
}
function zeros(length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(0);
  }
  return arr;
}
function digits(value) {
  return value.toExponential().replace(/e.*$/, "").replace(/^0\.?0*|\./, "").length;
}
function nearlyEqual(a, b, relTol = 1e-8, absTol = 0) {
  if (relTol <= 0) {
    throw new Error("Relative tolerance must be greater than 0");
  }
  if (absTol < 0) {
    throw new Error("Absolute tolerance must be at least 0");
  }
  if (isNaN(a) || isNaN(b)) {
    return false;
  }
  if (!isFinite(a) || !isFinite(b)) {
    return a === b;
  }
  if (a === b) {
    return true;
  }
  return Math.abs(a - b) <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), absTol);
}
var acosh = Math.acosh || function(x) {
  return Math.log(Math.sqrt(x * x - 1) + x);
};
var asinh = Math.asinh || function(x) {
  return Math.log(Math.sqrt(x * x + 1) + x);
};
var atanh = Math.atanh || function(x) {
  return Math.log((1 + x) / (1 - x)) / 2;
};
var cosh = Math.cosh || function(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
};
var sinh = Math.sinh || function(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
};
var tanh = Math.tanh || function(x) {
  const e2 = Math.exp(2 * x);
  return (e2 - 1) / (e2 + 1);
};
function _toNumberOrThrow(value, onError) {
  if (isNumber(value)) {
    return value;
  } else if (isBigNumber(value)) {
    return value.toNumber();
  } else {
    onError();
    return 0;
  }
}
function _toNumberOrDefault(value, defaultValue) {
  if (isNumber(value)) {
    return value;
  } else if (isBigNumber(value)) {
    return value.toNumber();
  } else {
    return defaultValue;
  }
}

// src/plain/number/arithmetic.ts
var n1 = "number";
var n2 = "number, number";
function absNumber(a) {
  return Math.abs(a);
}
absNumber.signature = n1;
function addNumber(a, b) {
  return a + b;
}
addNumber.signature = n2;
function subtractNumber(a, b) {
  return a - b;
}
subtractNumber.signature = n2;
function multiplyNumber(a, b) {
  return a * b;
}
multiplyNumber.signature = n2;
function divideNumber(a, b) {
  return a / b;
}
divideNumber.signature = n2;
function unaryMinusNumber(x) {
  return -x;
}
unaryMinusNumber.signature = n1;
function unaryPlusNumber(x) {
  return x;
}
unaryPlusNumber.signature = n1;
function cbrtNumber(x) {
  return cbrt(x);
}
cbrtNumber.signature = n1;
function cubeNumber(x) {
  return x * x * x;
}
cubeNumber.signature = n1;
function expNumber(x) {
  return Math.exp(x);
}
expNumber.signature = n1;
function expm1Number(x) {
  return expm1(x);
}
expm1Number.signature = n1;
function gcdNumber(a, b) {
  if (!isInteger(a) || !isInteger(b)) {
    throw new Error("Parameters in function gcd must be integer numbers");
  }
  let r;
  while (b !== 0) {
    r = a % b;
    a = b;
    b = r;
  }
  return a < 0 ? -a : a;
}
gcdNumber.signature = n2;
function lcmNumber(a, b) {
  if (!isInteger(a) || !isInteger(b)) {
    throw new Error("Parameters in function lcm must be integer numbers");
  }
  if (a === 0 || b === 0) {
    return 0;
  }
  let t;
  const prod = a * b;
  while (b !== 0) {
    t = b;
    b = a % t;
    a = t;
  }
  return Math.abs(prod / a);
}
lcmNumber.signature = n2;
function logNumber(x, y) {
  if (y) {
    return Math.log(x) / Math.log(y);
  }
  return Math.log(x);
}
function log10Number(x) {
  return log10(x);
}
log10Number.signature = n1;
function log2Number(x) {
  return log2(x);
}
log2Number.signature = n1;
function log1pNumber(x) {
  return log1p(x);
}
log1pNumber.signature = n1;
function modNumber(x, y) {
  return y === 0 ? x : x - y * Math.floor(x / y);
}
modNumber.signature = n2;
function nthRootNumber(a, root = 2) {
  const inv = root < 0;
  if (inv) {
    root = -root;
  }
  if (root === 0) {
    throw new Error("Root must be non-zero");
  }
  if (a < 0 && Math.abs(root) % 2 !== 1) {
    throw new Error("Root must be odd when a is negative.");
  }
  if (a === 0) {
    return inv ? Infinity : 0;
  }
  if (!isFinite(a)) {
    return inv ? 0 : a;
  }
  let x = Math.pow(Math.abs(a), 1 / root);
  x = a < 0 ? -x : x;
  return inv ? 1 / x : x;
}
function signNumber(x) {
  return sign(x);
}
signNumber.signature = n1;
function sqrtNumber(x) {
  return Math.sqrt(x);
}
sqrtNumber.signature = n1;
function squareNumber(x) {
  return x * x;
}
squareNumber.signature = n1;
function xgcdNumber(a, b) {
  let t;
  let q;
  let r;
  let x = 0;
  let lastx = 1;
  let y = 1;
  let lasty = 0;
  if (!isInteger(a) || !isInteger(b)) {
    throw new Error("Parameters in function xgcd must be integer numbers");
  }
  while (b) {
    q = Math.floor(a / b);
    r = a - q * b;
    t = x;
    x = lastx - q * x;
    lastx = t;
    t = y;
    y = lasty - q * y;
    lasty = t;
    a = b;
    b = r;
  }
  let res;
  if (a < 0) {
    res = [-a, -lastx, -lasty];
  } else {
    res = [a, a ? lastx : 0, lasty];
  }
  return res;
}
xgcdNumber.signature = n2;
function powNumber(x, y) {
  if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
    return 0;
  }
  return Math.pow(x, y);
}
powNumber.signature = n2;
function roundNumber(value, decimals = 0) {
  if (!isInteger(decimals) || decimals < 0 || decimals > 15) {
    throw new Error(
      "Number of decimals in function round must be an integer from 0 to 15 inclusive"
    );
  }
  return parseFloat(toFixed(value, decimals));
}
function normNumber(x) {
  return Math.abs(x);
}
normNumber.signature = n1;

// src/plain/number/bitwise.ts
var n12 = "number";
var n22 = "number, number";
function bitAndNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function bitAnd");
  }
  return x & y;
}
bitAndNumber.signature = n22;
function bitNotNumber(x) {
  if (!isInteger(x)) {
    throw new Error("Integer expected in function bitNot");
  }
  return ~x;
}
bitNotNumber.signature = n12;
function bitOrNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function bitOr");
  }
  return x | y;
}
bitOrNumber.signature = n22;
function bitXorNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function bitXor");
  }
  return x ^ y;
}
bitXorNumber.signature = n22;
function leftShiftNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function leftShift");
  }
  return x << y;
}
leftShiftNumber.signature = n22;
function rightArithShiftNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function rightArithShift");
  }
  return x >> y;
}
rightArithShiftNumber.signature = n22;
function rightLogShiftNumber(x, y) {
  if (!isInteger(x) || !isInteger(y)) {
    throw new Error("Integers expected in function rightLogShift");
  }
  return x >>> y;
}
rightLogShiftNumber.signature = n22;

// src/utils/product.ts
function product(i, n) {
  if (n < i) {
    return 1;
  }
  if (n === i) {
    return n;
  }
  const half = n + i >> 1;
  return product(i, half) * product(half + 1, n);
}

// src/plain/number/combinations.ts
function combinationsNumber(n, k) {
  if (!isInteger(n) || n < 0) {
    throw new TypeError(
      "Positive integer value expected in function combinations"
    );
  }
  if (!isInteger(k) || k < 0) {
    throw new TypeError(
      "Positive integer value expected in function combinations"
    );
  }
  if (k > n) {
    throw new TypeError("k must be less than or equal to n");
  }
  const nMinusk = n - k;
  let answer = 1;
  const firstnumerator = k < nMinusk ? nMinusk + 1 : k + 1;
  let nextdivisor = 2;
  const lastdivisor = k < nMinusk ? k : nMinusk;
  for (let nextnumerator = firstnumerator; nextnumerator <= n; ++nextnumerator) {
    answer *= nextnumerator;
    while (nextdivisor <= lastdivisor && answer % nextdivisor === 0) {
      answer /= nextdivisor;
      ++nextdivisor;
    }
  }
  if (nextdivisor <= lastdivisor) {
    answer /= product(nextdivisor, lastdivisor);
  }
  return answer;
}
combinationsNumber.signature = "number, number";

// src/plain/number/constants.ts
var pi = Math.PI;
var tau = 2 * Math.PI;
var e = Math.E;
var phi = 1.618033988749895;

// src/plain/number/logical.ts
var n13 = "number";
var n23 = "number, number";
function notNumber(x) {
  return !x;
}
notNumber.signature = n13;
function orNumber(x, y) {
  return !!(x || y);
}
orNumber.signature = n23;
function xorNumber(x, y) {
  return !!x !== !!y;
}
xorNumber.signature = n23;
function andNumber(x, y) {
  return !!(x && y);
}
andNumber.signature = n23;

// src/plain/number/probability.ts
function gammaNumber(n) {
  let x;
  if (isInteger(n)) {
    if (n <= 0) {
      return Number.isFinite(n) ? Infinity : NaN;
    }
    if (n > 171) {
      return Infinity;
    }
    return product(1, n - 1);
  }
  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gammaNumber(1 - n));
  }
  if (n >= 171.35) {
    return Infinity;
  }
  if (n > 85) {
    const twoN = n * n;
    const threeN = twoN * n;
    const fourN = threeN * n;
    const fiveN = fourN * n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n) * (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) - 571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) + 5246819 / (75246796800 * fiveN * n));
  }
  --n;
  x = gammaP[0];
  for (let i = 1; i < gammaP.length; ++i) {
    x += gammaP[i] / (n + i);
  }
  const t = n + gammaG + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}
gammaNumber.signature = "number";
var gammaG = 4.7421875;
var gammaP = [
  0.9999999999999971,
  57.15623566586292,
  -59.59796035547549,
  14.136097974741746,
  -0.4919138160976202,
  3399464998481189e-20,
  4652362892704858e-20,
  -9837447530487956e-20,
  1580887032249125e-19,
  -21026444172410488e-20,
  21743961811521265e-20,
  -1643181065367639e-19,
  8441822398385275e-20,
  -26190838401581408e-21,
  36899182659531625e-22
];
var lnSqrt2PI = 0.9189385332046728;
var lgammaG = 5;
var lgammaN = 7;
var lgammaSeries = [
  1.000000000190015,
  76.18009172947146,
  -86.50532032941678,
  24.01409824083091,
  -1.231739572450155,
  0.001208650973866179,
  -5395239384953e-18
];
function lgammaNumber(n) {
  if (n < 0) return NaN;
  if (n === 0) return Infinity;
  if (!Number.isFinite(n)) return n;
  if (n < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * n)) - lgammaNumber(1 - n);
  }
  n = n - 1;
  const base = n + lgammaG + 0.5;
  let sum = lgammaSeries[0];
  for (let i = lgammaN - 1; i >= 1; i--) {
    sum += lgammaSeries[i] / (n + i);
  }
  return lnSqrt2PI + (n + 0.5) * Math.log(base) - base + Math.log(sum);
}
lgammaNumber.signature = "number";

// src/plain/number/trigonometry.ts
var n14 = "number";
var n24 = "number, number";
function acosNumber(x) {
  return Math.acos(x);
}
acosNumber.signature = n14;
function acoshNumber(x) {
  return acosh(x);
}
acoshNumber.signature = n14;
function acotNumber(x) {
  return Math.atan(1 / x);
}
acotNumber.signature = n14;
function acothNumber(x) {
  return Number.isFinite(x) ? (Math.log((x + 1) / x) + Math.log(x / (x - 1))) / 2 : 0;
}
acothNumber.signature = n14;
function acscNumber(x) {
  return Math.asin(1 / x);
}
acscNumber.signature = n14;
function acschNumber(x) {
  const xInv = 1 / x;
  return Math.log(xInv + Math.sqrt(xInv * xInv + 1));
}
acschNumber.signature = n14;
function asecNumber(x) {
  return Math.acos(1 / x);
}
asecNumber.signature = n14;
function asechNumber(x) {
  const xInv = 1 / x;
  const ret = Math.sqrt(xInv * xInv - 1);
  return Math.log(ret + xInv);
}
asechNumber.signature = n14;
function asinNumber(x) {
  return Math.asin(x);
}
asinNumber.signature = n14;
function asinhNumber(x) {
  return asinh(x);
}
asinhNumber.signature = n14;
function atanNumber(x) {
  return Math.atan(x);
}
atanNumber.signature = n14;
function atan2Number(y, x) {
  return Math.atan2(y, x);
}
atan2Number.signature = n24;
function atanhNumber(x) {
  return atanh(x);
}
atanhNumber.signature = n14;
function cosNumber(x) {
  return Math.cos(x);
}
cosNumber.signature = n14;
function coshNumber(x) {
  return cosh(x);
}
coshNumber.signature = n14;
function cotNumber(x) {
  return 1 / Math.tan(x);
}
cotNumber.signature = n14;
function cothNumber(x) {
  const e2 = Math.exp(2 * x);
  return (e2 + 1) / (e2 - 1);
}
cothNumber.signature = n14;
function cscNumber(x) {
  return 1 / Math.sin(x);
}
cscNumber.signature = n14;
function cschNumber(x) {
  if (x === 0) {
    return Number.POSITIVE_INFINITY;
  } else {
    return Math.abs(2 / (Math.exp(x) - Math.exp(-x))) * sign(x);
  }
}
cschNumber.signature = n14;
function secNumber(x) {
  return 1 / Math.cos(x);
}
secNumber.signature = n14;
function sechNumber(x) {
  return 2 / (Math.exp(x) + Math.exp(-x));
}
sechNumber.signature = n14;
function sinNumber(x) {
  return Math.sin(x);
}
sinNumber.signature = n14;
function sinhNumber(x) {
  return sinh(x);
}
sinhNumber.signature = n14;
function tanNumber(x) {
  return Math.tan(x);
}
tanNumber.signature = n14;
function tanhNumber(x) {
  return tanh(x);
}
tanhNumber.signature = n14;

// src/plain/number/utils.ts
var n15 = "number";
function isIntegerNumber(x) {
  return isInteger(x);
}
isIntegerNumber.signature = n15;
function isNegativeNumber(x) {
  return x < 0;
}
isNegativeNumber.signature = n15;
function isPositiveNumber(x) {
  return x > 0;
}
isPositiveNumber.signature = n15;
function isZeroNumber(x) {
  return x === 0;
}
isZeroNumber.signature = n15;
function isNaNNumber(x) {
  return Number.isNaN(x);
}
isNaNNumber.signature = n15;

// src/utils/factory.ts
function factory(name114, dependencies102, create, meta) {
  function assertAndCreate(scope) {
    const deps = pickShallow(
      scope,
      dependencies102.map(stripOptionalNotation)
    );
    assertDependencies(name114, dependencies102, scope);
    return create(deps);
  }
  assertAndCreate.isFactory = true;
  assertAndCreate.fn = name114;
  assertAndCreate.dependencies = dependencies102.slice().sort();
  if (meta) {
    assertAndCreate.meta = meta;
  }
  return assertAndCreate;
}
function assertDependencies(name114, dependencies102, scope) {
  const allDefined = dependencies102.filter((dependency) => !isOptionalDependency(dependency)).every((dependency) => scope[dependency] !== void 0);
  if (!allDefined) {
    const missingDependencies = dependencies102.filter(
      (dependency) => scope[dependency] === void 0
    );
    throw new Error(
      `Cannot create function "${name114}", some dependencies are missing: ${missingDependencies.map((d) => `"${d}"`).join(", ")}.`
    );
  }
}
function isOptionalDependency(dependency) {
  return dependency && dependency[0] === "?";
}
function stripOptionalNotation(dependency) {
  return dependency && dependency[0] === "?" ? dependency.slice(1) : dependency;
}

// src/utils/noop.ts
function noBignumber() {
  throw new Error('No "bignumber" implementation available');
}
function noFraction() {
  throw new Error('No "fraction" implementation available');
}
function noMatrix() {
  throw new Error('No "matrix" implementation available');
}
function noIndex() {
  throw new Error('No "index" implementation available');
}
function noSubset() {
  throw new Error('No "matrix" implementation available');
}
var _createTyped = function() {
  _createTyped = typedFunction.create;
  return typedFunction;
};
var dependencies = ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"];
var createTyped = /* @__PURE__ */ factory(
  "typed",
  dependencies,
  function createTyped2({
    BigNumber,
    Complex,
    DenseMatrix,
    Fraction
  }) {
    const _typed = _createTyped();
    _typed.clear();
    _typed.addTypes([
      { name: "number", test: isNumber },
      { name: "Complex", test: isComplex },
      { name: "BigNumber", test: isBigNumber },
      { name: "bigint", test: isBigInt },
      { name: "Fraction", test: isFraction },
      { name: "Unit", test: isUnit },
      // The following type matches a valid variable name, i.e., an alphanumeric
      // string starting with an alphabetic character. It is used (at least)
      // in the definition of the derivative() function, as the argument telling
      // what to differentiate over must (currently) be a variable.
      // TODO: deprecate the identifier type (it's not used anymore, see https://github.com/josdejong/mathjs/issues/3253)
      {
        name: "identifier",
        // Using simpler regex for TS compatibility (original: /^\p{L}[\p{L}\d]*$/u)
        test: (s) => isString(s) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)
      },
      { name: "string", test: isString },
      { name: "Chain", test: isChain },
      { name: "Array", test: isArray },
      { name: "Matrix", test: isMatrix },
      { name: "DenseMatrix", test: isDenseMatrix },
      { name: "SparseMatrix", test: isSparseMatrix },
      { name: "Range", test: isRange },
      { name: "Index", test: isIndex },
      { name: "boolean", test: isBoolean },
      { name: "ResultSet", test: isResultSet },
      { name: "Help", test: isHelp },
      { name: "function", test: isFunction },
      { name: "Date", test: isDate },
      { name: "RegExp", test: isRegExp },
      { name: "null", test: isNull },
      { name: "undefined", test: isUndefined },
      { name: "AccessorNode", test: isAccessorNode },
      { name: "ArrayNode", test: isArrayNode },
      { name: "AssignmentNode", test: isAssignmentNode },
      { name: "BlockNode", test: isBlockNode },
      { name: "ConditionalNode", test: isConditionalNode },
      { name: "ConstantNode", test: isConstantNode },
      { name: "FunctionNode", test: isFunctionNode },
      { name: "FunctionAssignmentNode", test: isFunctionAssignmentNode },
      { name: "IndexNode", test: isIndexNode },
      { name: "Node", test: isNode },
      { name: "ObjectNode", test: isObjectNode },
      { name: "OperatorNode", test: isOperatorNode },
      { name: "ParenthesisNode", test: isParenthesisNode },
      { name: "RangeNode", test: isRangeNode },
      { name: "RelationalNode", test: isRelationalNode },
      { name: "SymbolNode", test: isSymbolNode },
      { name: "Map", test: isMap },
      { name: "Object", test: isObject }
      // order 'Object' last, it matches on other classes too
    ]);
    _typed.addConversions([
      {
        from: "number",
        to: "BigNumber",
        convert: function(x) {
          if (!BigNumber) {
            throwNoBignumber(x);
          }
          if (digits(x) > 15) {
            throw new TypeError(
              "Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " + x + "). Use function bignumber(x) to convert to BigNumber."
            );
          }
          return new BigNumber(x);
        }
      },
      {
        from: "number",
        to: "Complex",
        convert: function(x) {
          if (!Complex) {
            throwNoComplex(x);
          }
          return new Complex(x, 0);
        }
      },
      {
        from: "BigNumber",
        to: "Complex",
        convert: function(x) {
          if (!Complex) {
            throwNoComplex(x);
          }
          return new Complex(x.toNumber(), 0);
        }
      },
      {
        from: "bigint",
        to: "number",
        convert: function(x) {
          if (x > Number.MAX_SAFE_INTEGER) {
            throw new TypeError(
              "Cannot implicitly convert bigint to number: value exceeds the max safe integer value (value: " + x + ")"
            );
          }
          return Number(x);
        }
      },
      {
        from: "bigint",
        to: "BigNumber",
        convert: function(x) {
          if (!BigNumber) {
            throwNoBignumber(x);
          }
          return new BigNumber(x.toString());
        }
      },
      {
        from: "bigint",
        to: "Fraction",
        convert: function(x) {
          if (!Fraction) {
            throwNoFraction(x);
          }
          return new Fraction(x);
        }
      },
      {
        from: "Fraction",
        to: "BigNumber",
        convert: function(_x) {
          throw new TypeError(
            "Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction."
          );
        }
      },
      {
        from: "Fraction",
        to: "Complex",
        convert: function(x) {
          if (!Complex) {
            throwNoComplex(x);
          }
          return new Complex(x.valueOf(), 0);
        }
      },
      {
        from: "number",
        to: "Fraction",
        convert: function(x) {
          if (!Fraction) {
            throwNoFraction(x);
          }
          const f = new Fraction(x);
          if (f.valueOf() !== x) {
            throw new TypeError(
              "Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " + x + "). Use function fraction(x) to convert to Fraction."
            );
          }
          return f;
        }
      },
      {
        // FIXME: add conversion from Fraction to number, for example for `sqrt(fraction(1,3))`
        //  from: 'Fraction',
        //  to: 'number',
        //  convert: function (x) {
        //    return x.valueOf()
        //  }
        // }, {
        from: "string",
        to: "number",
        convert: function(x) {
          const n = Number(x);
          if (isNaN(n)) {
            throw new Error('Cannot convert "' + x + '" to a number');
          }
          return n;
        }
      },
      {
        from: "string",
        to: "BigNumber",
        convert: function(x) {
          if (!BigNumber) {
            throwNoBignumber(x);
          }
          try {
            return new BigNumber(x);
          } catch {
            throw new Error('Cannot convert "' + x + '" to BigNumber');
          }
        }
      },
      {
        from: "string",
        to: "bigint",
        convert: function(x) {
          try {
            return BigInt(x);
          } catch {
            throw new Error('Cannot convert "' + x + '" to BigInt');
          }
        }
      },
      {
        from: "string",
        to: "Fraction",
        convert: function(x) {
          if (!Fraction) {
            throwNoFraction(x);
          }
          try {
            return new Fraction(x);
          } catch {
            throw new Error('Cannot convert "' + x + '" to Fraction');
          }
        }
      },
      {
        from: "string",
        to: "Complex",
        convert: function(x) {
          if (!Complex) {
            throwNoComplex(x);
          }
          try {
            return new Complex(x);
          } catch {
            throw new Error('Cannot convert "' + x + '" to Complex');
          }
        }
      },
      {
        from: "boolean",
        to: "number",
        convert: function(x) {
          return +x;
        }
      },
      {
        from: "boolean",
        to: "BigNumber",
        convert: function(x) {
          if (!BigNumber) {
            throwNoBignumber(x);
          }
          return new BigNumber(+x);
        }
      },
      {
        from: "boolean",
        to: "bigint",
        convert: function(x) {
          return BigInt(+x);
        }
      },
      {
        from: "boolean",
        to: "Fraction",
        convert: function(x) {
          if (!Fraction) {
            throwNoFraction(x);
          }
          return new Fraction(+x);
        }
      },
      {
        from: "boolean",
        to: "string",
        convert: function(x) {
          return String(x);
        }
      },
      {
        from: "Array",
        to: "Matrix",
        convert: function(array) {
          if (!DenseMatrix) {
            throwNoMatrix();
          }
          return new DenseMatrix(array);
        }
      },
      {
        from: "Matrix",
        to: "Array",
        convert: function(matrix) {
          return matrix.valueOf();
        }
      }
    ]);
    _typed.onMismatch = (name114, args, signatures) => {
      const usualError = _typed.createError(name114, args, signatures);
      if (["wrongType", "mismatch"].includes(usualError.data.category) && args.length === 1 && isCollection(args[0]) && // check if the function can be unary:
      signatures.some((sig) => !sig.params.includes(","))) {
        const err = new TypeError(
          `Function '${name114}' doesn't apply to matrices. To call it elementwise on a matrix 'M', try 'map(M, ${name114})'.`
        );
        err.data = usualError.data;
        throw err;
      }
      throw usualError;
    };
    return _typed;
  }
);
function throwNoBignumber(x) {
  throw new Error(
    `Cannot convert value ${x} into a BigNumber: no class 'BigNumber' provided`
  );
}
function throwNoComplex(x) {
  throw new Error(
    `Cannot convert value ${x} into a Complex number: no class 'Complex' provided`
  );
}
function throwNoMatrix() {
  throw new Error(
    "Cannot convert array into a Matrix: no class 'DenseMatrix' provided"
  );
}
function throwNoFraction(x) {
  throw new Error(
    `Cannot convert value ${x} into a Fraction, no class 'Fraction' provided.`
  );
}

// src/type/resultset/ResultSet.ts
var name = "ResultSet";
var dependencies2 = [];
var createResultSet = /* @__PURE__ */ factory(
  name,
  dependencies2,
  () => {
    function ResultSet(entries) {
      if (!(this instanceof ResultSet)) {
        throw new SyntaxError(
          "Constructor must be called with the new operator"
        );
      }
      this.entries = entries || [];
    }
    ResultSet.prototype.type = "ResultSet";
    ResultSet.prototype.isResultSet = true;
    ResultSet.prototype.valueOf = function() {
      return this.entries;
    };
    ResultSet.prototype.toString = function() {
      return "[" + this.entries.map(String).join(", ") + "]";
    };
    ResultSet.prototype.toJSON = function() {
      return {
        mathjs: "ResultSet",
        entries: this.entries
      };
    };
    ResultSet.fromJSON = function(json) {
      return new ResultSet(json.entries);
    };
    return ResultSet;
  },
  { isClass: true }
);

// src/type/matrix/Range.ts
var name2 = "Range";
var dependencies3 = [];
var createRangeClass = /* @__PURE__ */ factory(
  name2,
  dependencies3,
  () => {
    class Range {
      constructor(start, end, step) {
        /**
         * Type identifier
         */
        this.type = "Range";
        /**
         * Range type flag
         */
        this.isRange = true;
        if (!(this instanceof Range)) {
          throw new SyntaxError(
            "Constructor must be called with the new operator"
          );
        }
        const hasStart = start !== null && start !== void 0;
        const hasEnd = end !== null && end !== void 0;
        const hasStep = step !== null && step !== void 0;
        let startValue = 0;
        let endValue = 0;
        let stepValue = 1;
        if (hasStart) {
          if (isBigNumber(start)) {
            startValue = start.toNumber();
          } else if (typeof start !== "number" && !isBigInt(start)) {
            throw new TypeError("Parameter start must be a number or bigint");
          } else {
            startValue = start;
          }
        }
        if (hasEnd) {
          if (isBigNumber(end)) {
            endValue = end.toNumber();
          } else if (typeof end !== "number" && !isBigInt(end)) {
            throw new TypeError("Parameter end must be a number or bigint");
          } else {
            endValue = end;
          }
        }
        if (hasStep) {
          if (isBigNumber(step)) {
            stepValue = step.toNumber();
          } else if (typeof step !== "number" && !isBigInt(step)) {
            throw new TypeError("Parameter step must be a number or bigint");
          } else {
            stepValue = step;
          }
        }
        this.start = hasStart ? parseFloat(startValue.toString()) : 0;
        this.end = hasEnd ? parseFloat(endValue.toString()) : 0;
        this.step = hasStep ? parseFloat(stepValue.toString()) : 1;
        if (hasStep && nearlyEqual(this.step, 0)) {
          throw new Error("Step must not be zero");
        }
      }
      /**
       * Parse a string into a range,
       * The string contains the start, optional step, and end, separated by a colon.
       * If the string does not contain a valid range, null is returned.
       * For example str='0:2:11'.
       * @memberof Range
       * @param {string} str
       * @return {Range | null} range
       */
      static parse(str) {
        if (typeof str !== "string") {
          return null;
        }
        const args = str.split(":");
        const nums = args.map(function(arg) {
          return parseFloat(arg);
        });
        const invalid = nums.some(function(num) {
          return isNaN(num);
        });
        if (invalid) {
          return null;
        }
        switch (nums.length) {
          case 2:
            return new Range(nums[0], nums[1]);
          case 3:
            return new Range(nums[0], nums[2], nums[1]);
          default:
            return null;
        }
      }
      /**
       * Create a clone of the range
       * @return {Range} clone
       */
      clone() {
        return new Range(this.start, this.end, this.step);
      }
      /**
       * Retrieve the size of the range.
       * Returns an array containing one number, the number of elements in the range.
       * @memberof Range
       * @returns {number[]} size
       */
      size() {
        let len = 0;
        const start = this.start;
        const step = this.step;
        const end = this.end;
        const diff = end - start;
        if (sign(step) === sign(diff)) {
          len = Math.ceil(diff / step);
        } else if (diff === 0) {
          len = 0;
        }
        if (isNaN(len)) {
          len = 0;
        }
        return [len];
      }
      /**
       * Calculate the minimum value in the range
       * @memberof Range
       * @return {number | undefined} min
       */
      min() {
        const size = this.size()[0];
        if (size > 0) {
          if (this.step > 0) {
            return this.start;
          } else {
            return this.start + (size - 1) * this.step;
          }
        } else {
          return void 0;
        }
      }
      /**
       * Calculate the maximum value in the range
       * @memberof Range
       * @return {number | undefined} max
       */
      max() {
        const size = this.size()[0];
        if (size > 0) {
          if (this.step > 0) {
            return this.start + (size - 1) * this.step;
          } else {
            return this.start;
          }
        } else {
          return void 0;
        }
      }
      /**
       * Execute a callback function for each value in the range.
       * @memberof Range
       * @param {function} callback The callback method is invoked with three
       *                            parameters: the value of the element, the index
       *                            of the element, and the Range being traversed.
       */
      forEach(callback) {
        let x = this.start;
        const step = this.step;
        const end = this.end;
        let i = 0;
        if (step > 0) {
          while (x < end) {
            callback(x, [i], this);
            x += step;
            i++;
          }
        } else if (step < 0) {
          while (x > end) {
            callback(x, [i], this);
            x += step;
            i++;
          }
        }
      }
      /**
       * Execute a callback function for each value in the Range, and return the
       * results as an array
       * @memberof Range
       * @param {function} callback The callback method is invoked with three
       *                            parameters: the value of the element, the index
       *                            of the element, and the Matrix being traversed.
       * @returns {Array} array
       */
      map(callback) {
        const array = [];
        const self = this;
        this.forEach(function(value, index, _obj) {
          array[index[0]] = callback(value, index, self);
        });
        return array;
      }
      /**
       * Create an Array with a copy of the Ranges data
       * @memberof Range
       * @returns {Array} array
       */
      toArray() {
        const array = [];
        this.forEach(function(value, index) {
          array[index[0]] = value;
        });
        return array;
      }
      /**
       * Get the primitive value of the Range, a one dimensional array
       * @memberof Range
       * @returns {Array} array
       */
      valueOf() {
        return this.toArray();
      }
      /**
       * Get a string representation of the range, with optional formatting options.
       * Output is formatted as 'start:step:end', for example '2:6' or '0:0.2:11'
       * @memberof Range
       * @param {Object | number | function} [options] Formatting options. See
       *                                               lib/utils/number:format for a
       *                                               description of the available
       *                                               options.
       * @returns {string} str
       */
      format(options) {
        let str = format(this.start, options);
        if (this.step !== 1) {
          str += ":" + format(this.step, options);
        }
        str += ":" + format(this.end, options);
        return str;
      }
      /**
       * Get a string representation of the range.
       * @memberof Range
       * @returns {string}
       */
      toString() {
        return this.format();
      }
      /**
       * Get a JSON representation of the range
       * @memberof Range
       * @returns {Object} Returns a JSON object structured as:
       *                   `{"mathjs": "Range", "start": 2, "end": 4, "step": 1}`
       */
      toJSON() {
        return {
          mathjs: "Range",
          start: this.start,
          end: this.end,
          step: this.step
        };
      }
      /**
       * Instantiate a Range from a JSON object
       * @memberof Range
       * @param {Object} json A JSON object structured as:
       *                      `{"mathjs": "Range", "start": 2, "end": 4, "step": 1}`
       * @return {Range}
       */
      static fromJSON(json) {
        return new Range(json.start, json.end, json.step);
      }
    }
    Range.prototype.type = "Range";
    Range.prototype.isRange = true;
    return Range;
  },
  { isClass: true }
);

// src/utils/bignumber/formatter.ts
function formatBigNumberToBase(n, base, size) {
  const BigNumberCtor = n.constructor;
  const big2 = new BigNumberCtor(2);
  let suffix = "";
  if (size) {
    if (size < 1) {
      throw new Error("size must be in greater than 0");
    }
    if (!isInteger(size)) {
      throw new Error("size must be an integer");
    }
    if (n.greaterThan(big2.pow(size - 1).sub(1)) || n.lessThan(big2.pow(size - 1).mul(-1))) {
      throw new Error(
        `Value must be in range [-2^${size - 1}, 2^${size - 1}-1]`
      );
    }
    if (!n.isInteger()) {
      throw new Error("Value must be an integer");
    }
    if (n.lessThan(0)) {
      n = n.add(big2.pow(size));
    }
    suffix = `i${size}`;
  }
  switch (base) {
    case 2:
      return `${n.toBinary()}${suffix}`;
    case 8:
      return `${n.toOctal()}${suffix}`;
    case 16:
      return `${n.toHexadecimal()}${suffix}`;
    default:
      throw new Error(`Base ${base} not supported `);
  }
}
function format2(value, options) {
  if (typeof options === "function") {
    return options(value);
  }
  if (!value.isFinite()) {
    return value.isNaN() ? "NaN" : value.gt(0) ? "Infinity" : "-Infinity";
  }
  const { notation, precision, wordSize } = normalizeFormatOptions(options);
  switch (notation) {
    case "fixed":
      return toFixed2(value, precision);
    case "exponential":
      return toExponential2(value, precision);
    case "engineering":
      return toEngineering2(value, precision);
    case "bin":
      return formatBigNumberToBase(value, 2, wordSize);
    case "oct":
      return formatBigNumberToBase(value, 8, wordSize);
    case "hex":
      return formatBigNumberToBase(value, 16, wordSize);
    case "auto": {
      const lowerExp = _toNumberOrDefault2(options?.lowerExp, -3);
      const upperExp = _toNumberOrDefault2(options?.upperExp, 5);
      if (value.isZero()) return "0";
      let str;
      const rounded = value.toSignificantDigits(precision);
      const exp = rounded.e;
      if (exp >= lowerExp && exp < upperExp) {
        str = rounded.toFixed();
      } else {
        str = toExponential2(value, precision);
      }
      return str.replace(/((\.\d*?)(0+))($|e)/, function() {
        const digits2 = arguments[2];
        const e2 = arguments[4];
        return digits2 !== "." ? digits2 + e2 : e2;
      });
    }
    default:
      throw new Error(
        'Unknown notation "' + notation + '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.'
      );
  }
}
function toEngineering2(value, precision) {
  const e2 = value.e;
  const newExp = e2 % 3 === 0 ? e2 : e2 < 0 ? e2 - 3 - e2 % 3 : e2 - e2 % 3;
  const valueWithoutExp = value.mul(Math.pow(10, -newExp));
  let valueStr = valueWithoutExp.toPrecision(precision);
  if (valueStr.includes("e")) {
    const BigNumber = value.constructor;
    valueStr = new BigNumber(valueStr).toFixed();
  }
  return valueStr + "e" + (e2 >= 0 ? "+" : "") + newExp.toString();
}
function toExponential2(value, precision) {
  if (precision !== void 0) {
    return value.toExponential(precision - 1);
  } else {
    return value.toExponential();
  }
}
function toFixed2(value, precision) {
  return value.toFixed(precision);
}
function _toNumberOrDefault2(value, defaultValue) {
  if (isNumber(value)) {
    return value;
  } else if (isBigNumber(value)) {
    return value.toNumber();
  } else {
    return defaultValue;
  }
}

// src/utils/string.ts
function format3(value, options) {
  const result = _format(value, options);
  if (options && typeof options === "object" && "truncate" in options && result.length > options.truncate) {
    return result.substring(0, options.truncate - 3) + "...";
  }
  return result;
}
function _format(value, options) {
  if (typeof value === "number") {
    return format(value, options);
  }
  if (isBigNumber(value)) {
    return format2(value, options);
  }
  if (looksLikeFraction(value)) {
    if (!options || options.fraction !== "decimal") {
      const signedNumerator = typeof value.n === "bigint" ? BigInt(value.s) * value.n : value.s * value.n;
      return `${signedNumerator}/${value.d}`;
    } else {
      return value.toString();
    }
  }
  if (Array.isArray(value)) {
    return formatArray(value, options);
  }
  if (isString(value)) {
    return stringify(value);
  }
  if (typeof value === "function") {
    return value.syntax ? String(value.syntax) : "function";
  }
  if (value && typeof value === "object") {
    if (typeof value.format === "function") {
      return value.format(options);
    } else if (value && value.toString(options) !== {}.toString()) {
      return value.toString(options);
    } else {
      const entries = Object.keys(value).map((key) => {
        return stringify(key) + ": " + format3(value[key], options);
      });
      return "{" + entries.join(", ") + "}";
    }
  }
  return String(value);
}
function stringify(value) {
  const text = String(value);
  let escaped = "";
  let i = 0;
  while (i < text.length) {
    const c = text.charAt(i);
    escaped += c in controlCharacters ? controlCharacters[c] : c;
    i++;
  }
  return '"' + escaped + '"';
}
var controlCharacters = {
  '"': '\\"',
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t"
};
function escape(value) {
  let text = String(value);
  text = text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text;
}
function formatArray(array, options) {
  if (Array.isArray(array)) {
    let str = "[";
    const len = array.length;
    for (let i = 0; i < len; i++) {
      if (i !== 0) {
        str += ", ";
      }
      str += formatArray(array[i], options);
    }
    str += "]";
    return str;
  } else {
    return format3(array, options);
  }
}
function looksLikeFraction(value) {
  return value && typeof value === "object" && typeof value.s === "bigint" && typeof value.n === "bigint" && typeof value.d === "bigint" || false;
}
function compareText(x, y) {
  if (!isString(x)) {
    throw new TypeError(
      "Unexpected type of argument in function compareText (expected: string or Array or Matrix, actual: " + typeOf(x) + ", index: 0)"
    );
  }
  if (!isString(y)) {
    throw new TypeError(
      "Unexpected type of argument in function compareText (expected: string or Array or Matrix, actual: " + typeOf(y) + ", index: 1)"
    );
  }
  return x === y ? 0 : x > y ? 1 : -1;
}

// src/expression/Help.ts
var name3 = "Help";
var dependencies4 = ["evaluate"];
var createHelpClass = /* @__PURE__ */ factory(
  name3,
  dependencies4,
  ({ evaluate }) => {
    function Help(doc) {
      if (!(this instanceof Help)) {
        throw new SyntaxError(
          "Constructor must be called with the new operator"
        );
      }
      if (!doc) throw new Error('Argument "doc" missing');
      this.doc = doc;
    }
    Help.prototype.type = "Help";
    Help.prototype.isHelp = true;
    Help.prototype.toString = function() {
      const doc = this.doc || {};
      let desc = "\n";
      if (doc.name) {
        desc += "Name: " + doc.name + "\n\n";
      }
      if (doc.category) {
        desc += "Category: " + doc.category + "\n\n";
      }
      if (doc.description) {
        desc += "Description:\n    " + doc.description + "\n\n";
      }
      if (doc.syntax) {
        desc += "Syntax:\n    " + doc.syntax.join("\n    ") + "\n\n";
      }
      if (doc.examples) {
        desc += "Examples:\n";
        let configChanged = false;
        const originalConfig = evaluate("config()");
        const scope = {
          config: (newConfig) => {
            configChanged = true;
            return evaluate("config(newConfig)", { newConfig });
          }
        };
        for (let i = 0; i < doc.examples.length; i++) {
          const expr = doc.examples[i];
          desc += "    " + expr + "\n";
          let res;
          try {
            res = evaluate(expr, scope);
          } catch (e2) {
            res = e2;
          }
          if (res !== void 0 && !isHelp(res)) {
            desc += "        " + format3(res, { precision: 14 }) + "\n";
          }
        }
        desc += "\n";
        if (configChanged) {
          evaluate("config(originalConfig)", { originalConfig });
        }
      }
      if (doc.mayThrow && doc.mayThrow.length) {
        desc += "Throws: " + doc.mayThrow.join(", ") + "\n\n";
      }
      if (doc.seealso && doc.seealso.length) {
        desc += "See also: " + doc.seealso.join(", ") + "\n";
      }
      return desc;
    };
    Help.prototype.toJSON = function() {
      const obj = clone(this.doc);
      obj.mathjs = "Help";
      return obj;
    };
    Help.fromJSON = function(json) {
      const doc = {};
      Object.keys(json).filter((prop) => prop !== "mathjs").forEach((prop) => {
        doc[prop] = json[prop];
      });
      return new Help(doc);
    };
    Help.prototype.valueOf = Help.prototype.toString;
    return Help;
  },
  { isClass: true }
);

// src/type/chain/Chain.ts
var name4 = "Chain";
var dependencies5 = ["?on", "math", "typed"];
var createChainClass = /* @__PURE__ */ factory(
  name4,
  dependencies5,
  ({ on, math, typed: typed2 }) => {
    function Chain(value) {
      if (!(this instanceof Chain)) {
        throw new SyntaxError(
          "Constructor must be called with the new operator"
        );
      }
      if (isChain(value)) {
        this.value = value.value;
      } else {
        this.value = value;
      }
    }
    Chain.prototype.type = "Chain";
    Chain.prototype.isChain = true;
    Chain.prototype.done = function() {
      return this.value;
    };
    Chain.prototype.valueOf = function() {
      return this.value;
    };
    Chain.prototype.toString = function() {
      return format3(this.value, {});
    };
    Chain.prototype.toJSON = function() {
      return {
        mathjs: "Chain",
        value: this.value
      };
    };
    Chain.fromJSON = function(json) {
      return new Chain(json.value);
    };
    function createProxy(name114, fn) {
      if (typeof fn === "function") {
        Chain.prototype[name114] = chainify(fn);
      }
    }
    function createLazyProxy(name114, resolver) {
      lazy(Chain.prototype, name114, function outerResolver() {
        const fn = resolver();
        if (typeof fn === "function") {
          return chainify(fn);
        }
        return void 0;
      });
    }
    function chainify(fn) {
      return function(...rest) {
        if (rest.length === 0) {
          return new Chain(fn(this.value));
        }
        const args = [this.value];
        for (let i = 0; i < rest.length; i++) {
          args[i + 1] = rest[i];
        }
        if (typed2.isTypedFunction(fn)) {
          const sigObject = typed2.resolve(fn, args);
          if (sigObject.params.length === 1) {
            throw new Error(
              "chain function " + fn.name + " cannot match rest parameter between chain value and additional arguments."
            );
          }
          return new Chain(sigObject.implementation.apply(fn, args));
        }
        return new Chain(fn.apply(fn, args));
      };
    }
    Chain.createProxy = function(arg0, arg1) {
      if (typeof arg0 === "string") {
        createProxy(arg0, arg1);
      } else {
        for (const name114 in arg0) {
          if (hasOwnProperty(arg0, name114) && excludedNames[name114] === void 0) {
            createLazyProxy(name114, () => arg0[name114]);
          }
        }
      }
    };
    const excludedNames = {
      expression: true,
      docs: true,
      type: true,
      classes: true,
      json: true,
      error: true,
      isChain: true
      // conflicts with the property isChain of a Chain instance
    };
    Chain.createProxy(math);
    if (on) {
      on(
        "import",
        function(name114, resolver, path) {
          if (!path) {
            createLazyProxy(name114, resolver);
          }
        }
      );
    }
    return Chain;
  },
  { isClass: true }
);

// src/expression/embeddedDocs/constants/e.ts
var eDocs = {
  name: "e",
  category: "Constants",
  syntax: ["e"],
  description: "Euler's number, the base of the natural logarithm. Approximately equal to 2.71828",
  examples: ["e", "e ^ 2", "exp(2)", "log(e)"],
  seealso: ["exp"]
};

// src/expression/embeddedDocs/constants/false.ts
var falseDocs = {
  name: "false",
  category: "Constants",
  syntax: ["false"],
  description: "Boolean value false",
  examples: ["false"],
  seealso: ["true"]
};

// src/expression/embeddedDocs/constants/i.ts
var iDocs = {
  name: "i",
  category: "Constants",
  syntax: ["i"],
  description: "Imaginary unit, defined as i*i=-1. A complex number is described as a + b*i, where a is the real part, and b is the imaginary part.",
  examples: ["i", "i * i", "sqrt(-1)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/Infinity.ts
var InfinityDocs = {
  name: "Infinity",
  category: "Constants",
  syntax: ["Infinity"],
  description: "Infinity, a number which is larger than the maximum number that can be handled by a floating point number.",
  examples: ["Infinity", "1 / 0"],
  seealso: []
};

// src/expression/embeddedDocs/constants/LN10.ts
var LN10Docs = {
  name: "LN10",
  category: "Constants",
  syntax: ["LN10"],
  description: "Returns the natural logarithm of 10, approximately equal to 2.302",
  examples: ["LN10", "log(10)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/LN2.ts
var LN2Docs = {
  name: "LN2",
  category: "Constants",
  syntax: ["LN2"],
  description: "Returns the natural logarithm of 2, approximately equal to 0.693",
  examples: ["LN2", "log(2)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/LOG10E.ts
var LOG10EDocs = {
  name: "LOG10E",
  category: "Constants",
  syntax: ["LOG10E"],
  description: "Returns the base-10 logarithm of E, approximately equal to 0.434",
  examples: ["LOG10E", "log(e, 10)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/LOG2E.ts
var LOG2EDocs = {
  name: "LOG2E",
  category: "Constants",
  syntax: ["LOG2E"],
  description: "Returns the base-2 logarithm of E, approximately equal to 1.442",
  examples: ["LOG2E", "log(e, 2)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/NaN.ts
var NaNDocs = {
  name: "NaN",
  category: "Constants",
  syntax: ["NaN"],
  description: "Not a number",
  examples: ["NaN", "0 / 0"],
  seealso: []
};

// src/expression/embeddedDocs/constants/null.ts
var nullDocs = {
  name: "null",
  category: "Constants",
  syntax: ["null"],
  description: "Value null",
  examples: ["null"],
  seealso: ["true", "false"]
};

// src/expression/embeddedDocs/constants/phi.ts
var phiDocs = {
  name: "phi",
  category: "Constants",
  syntax: ["phi"],
  description: "Phi is the golden ratio. Two quantities are in the golden ratio if their ratio is the same as the ratio of their sum to the larger of the two quantities. Phi is defined as `(1 + sqrt(5)) / 2` and is approximately 1.618034...",
  examples: ["phi"],
  seealso: []
};

// src/expression/embeddedDocs/constants/pi.ts
var piDocs = {
  name: "pi",
  category: "Constants",
  syntax: ["pi"],
  description: "The number pi is a mathematical constant that is the ratio of a circle's circumference to its diameter, and is approximately equal to 3.14159",
  examples: ["pi", "sin(pi/2)"],
  seealso: ["tau"]
};

// src/expression/embeddedDocs/constants/SQRT1_2.ts
var SQRT12Docs = {
  name: "SQRT1_2",
  category: "Constants",
  syntax: ["SQRT1_2"],
  description: "Returns the square root of 1/2, approximately equal to 0.707",
  examples: ["SQRT1_2", "sqrt(1/2)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/SQRT2.ts
var SQRT2Docs = {
  name: "SQRT2",
  category: "Constants",
  syntax: ["SQRT2"],
  description: "Returns the square root of 2, approximately equal to 1.414",
  examples: ["SQRT2", "sqrt(2)"],
  seealso: []
};

// src/expression/embeddedDocs/constants/tau.ts
var tauDocs = {
  name: "tau",
  category: "Constants",
  syntax: ["tau"],
  description: "Tau is the ratio constant of a circle's circumference to radius, equal to 2 * pi, approximately 6.2832.",
  examples: ["tau", "2 * pi"],
  seealso: ["pi"]
};

// src/expression/embeddedDocs/constants/true.ts
var trueDocs = {
  name: "true",
  category: "Constants",
  syntax: ["true"],
  description: "Boolean value true",
  examples: ["true"],
  seealso: ["false"]
};

// src/expression/embeddedDocs/constants/version.ts
var versionDocs = {
  name: "version",
  category: "Constants",
  syntax: ["version"],
  description: "A string with the version number of math.js",
  examples: ["version"],
  seealso: []
};

// src/expression/embeddedDocs/construction/bignumber.ts
var bignumberDocs = {
  name: "bignumber",
  category: "Construction",
  syntax: ["bignumber(x)"],
  description: "Create a big number from a number or string.",
  examples: [
    "0.1 + 0.2",
    "bignumber(0.1) + bignumber(0.2)",
    'bignumber("7.2")',
    'bignumber("7.2e500")',
    "bignumber([0.1, 0.2, 0.3])"
  ],
  seealso: [
    "boolean",
    "bigint",
    "complex",
    "fraction",
    "index",
    "matrix",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/bigint.ts
var bigintDocs = {
  name: "bigint",
  category: "Construction",
  syntax: ["bigint(x)"],
  description: "Create a bigint, an integer with an arbitrary number of digits, from a number or string.",
  examples: [
    "123123123123123123 # a large number will lose digits",
    'bigint("123123123123123123")',
    'bignumber(["1", "3", "5"])'
  ],
  seealso: [
    "boolean",
    "bignumber",
    "number",
    "complex",
    "fraction",
    "index",
    "matrix",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/boolean.ts
var booleanDocs = {
  name: "boolean",
  category: "Construction",
  syntax: ["x", "boolean(x)"],
  description: "Convert a string or number into a boolean.",
  examples: [
    "boolean(0)",
    "boolean(1)",
    "boolean(3)",
    'boolean("true")',
    'boolean("false")',
    "boolean([1, 0, 1, 1])"
  ],
  seealso: [
    "bignumber",
    "complex",
    "index",
    "matrix",
    "number",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/complex.ts
var complexDocs = {
  name: "complex",
  category: "Construction",
  syntax: ["complex()", "complex(re, im)", "complex(string)"],
  description: "Create a complex number.",
  examples: ["complex()", "complex(2, 3)", 'complex("7 - 2i")'],
  seealso: [
    "bignumber",
    "boolean",
    "index",
    "matrix",
    "number",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/createUnit.ts
var createUnitDocs = {
  name: "createUnit",
  category: "Construction",
  syntax: ["createUnit(definitions)", "createUnit(name, definition)"],
  description: "Create a user-defined unit and register it with the Unit type.",
  examples: [
    'createUnit("foo")',
    'createUnit("knot", {definition: "0.514444444 m/s", aliases: ["knots", "kt", "kts"]})',
    'createUnit("mph", "1 mile/hour")'
  ],
  seealso: ["unit", "splitUnit"]
};

// src/expression/embeddedDocs/construction/fraction.ts
var fractionDocs = {
  name: "fraction",
  category: "Construction",
  syntax: [
    "fraction(num)",
    "fraction(matrix)",
    "fraction(num,den)",
    "fraction({n: num, d: den})"
  ],
  description: "Create a fraction from a number or from integer numerator and denominator.",
  examples: [
    "fraction(0.125)",
    "fraction(1, 3) + fraction(2, 5)",
    "fraction({n: 333, d: 53})",
    "fraction([sqrt(9), sqrt(10), sqrt(11)])"
  ],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "index",
    "matrix",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/index.ts
var indexDocs = {
  name: "index",
  category: "Construction",
  syntax: [
    "[start]",
    "[start:end]",
    "[start:step:end]",
    "[start1, start 2, ...]",
    "[start1:end1, start2:end2, ...]",
    "[start1:step1:end1, start2:step2:end2, ...]"
  ],
  description: "Create an index to get or replace a subset of a matrix",
  examples: [
    "A = [1, 2, 3; 4, 5, 6]",
    "A[1, :]",
    "A[1, 2] = 50",
    "A[1:2, 1:2] = 1",
    "B = [1, 2, 3]",
    "B[B>1 and B<3]"
  ],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "matrix",
    "number",
    "range",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/matrix.ts
var matrixDocs = {
  name: "matrix",
  category: "Construction",
  syntax: [
    "[]",
    "[a1, b1, ...; a2, b2, ...]",
    "matrix()",
    'matrix("dense")',
    "matrix([...])"
  ],
  description: "Create a matrix.",
  examples: [
    "[]",
    "[1, 2, 3]",
    "[1, 2, 3; 4, 5, 6]",
    "matrix()",
    "matrix([3, 4])",
    'matrix([3, 4; 5, 6], "sparse")',
    'matrix([3, 4; 5, 6], "sparse", "number")'
  ],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "index",
    "number",
    "string",
    "unit",
    "sparse"
  ]
};

// src/expression/embeddedDocs/construction/number.ts
var numberDocs = {
  name: "number",
  category: "Construction",
  syntax: ["x", "number(x)", "number(unit, valuelessUnit)"],
  description: "Create a number or convert a string or boolean into a number.",
  examples: [
    "2",
    "2e3",
    "4.05",
    "number(2)",
    'number("7.2")',
    "number(true)",
    "number([true, false, true, true])",
    'number(unit("52cm"), "m")'
  ],
  seealso: [
    "bignumber",
    "bigint",
    "boolean",
    "complex",
    "fraction",
    "index",
    "matrix",
    "string",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/sparse.ts
var sparseDocs = {
  name: "sparse",
  category: "Construction",
  syntax: [
    "sparse()",
    "sparse([a1, b1, ...; a1, b2, ...])",
    'sparse([a1, b1, ...; a1, b2, ...], "number")'
  ],
  description: "Create a sparse matrix.",
  examples: [
    "sparse()",
    "sparse([3, 4; 5, 6])",
    'sparse([3, 0; 5, 0], "number")'
  ],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "index",
    "number",
    "string",
    "unit",
    "matrix"
  ]
};

// src/expression/embeddedDocs/construction/splitUnit.ts
var splitUnitDocs = {
  name: "splitUnit",
  category: "Construction",
  syntax: ["splitUnit(unit: Unit, parts: Unit[])"],
  description: "Split a unit in an array of units whose sum is equal to the original unit.",
  examples: ['splitUnit(1 m, ["feet", "inch"])'],
  seealso: ["unit", "createUnit"]
};

// src/expression/embeddedDocs/construction/string.ts
var stringDocs = {
  name: "string",
  category: "Construction",
  syntax: ['"text"', "string(x)"],
  description: "Create a string or convert a value to a string",
  examples: ['"Hello World!"', "string(4.2)", "string(3 + 2i)"],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "index",
    "matrix",
    "number",
    "unit"
  ]
};

// src/expression/embeddedDocs/construction/unit.ts
var unitDocs = {
  name: "unit",
  category: "Construction",
  syntax: ["value unit", "unit(value, unit)", "unit(string)"],
  description: "Create a unit.",
  examples: ["5.5 mm", "3 inch", 'unit(7.1, "kilogram")', 'unit("23 deg")'],
  seealso: [
    "bignumber",
    "boolean",
    "complex",
    "index",
    "matrix",
    "number",
    "string"
  ]
};

// src/expression/embeddedDocs/core/config.ts
var configDocs = {
  name: "config",
  category: "Core",
  syntax: ["config()", "config(options)"],
  description: "Get configuration or change configuration.",
  examples: [
    "config()",
    "1/3 + 1/4",
    'config({number: "Fraction"})',
    "1/3 + 1/4"
  ],
  seealso: []
};

// src/expression/embeddedDocs/core/import.ts
var importDocs = {
  name: "import",
  category: "Core",
  syntax: ["import(functions)", "import(functions, options)"],
  description: "Import functions or constants from an object.",
  examples: [
    "import({myFn: f(x)=x^2, myConstant: 32 })",
    "myFn(2)",
    "myConstant"
  ],
  seealso: []
};

// src/expression/embeddedDocs/core/typed.ts
var typedDocs = {
  name: "typed",
  category: "Core",
  syntax: ["typed(signatures)", "typed(name, signatures)"],
  description: "Create a typed function.",
  examples: [
    'double = typed({ "number": f(x)=x+x, "string": f(x)=concat(x,x) })',
    "double(2)",
    'double("hello")'
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/algebra/derivative.ts
var derivativeDocs = {
  name: "derivative",
  category: "Algebra",
  syntax: [
    "derivative(expr, variable)",
    "derivative(expr, variable, {simplify: boolean})"
  ],
  description: "Takes the derivative of an expression expressed in parser Nodes. The derivative will be taken over the supplied variable in the second parameter. If there are multiple variables in the expression, it will return a partial derivative.",
  examples: [
    'derivative("2x^3", "x")',
    'derivative("2x^3", "x", {simplify: false})',
    'derivative("2x^2 + 3x + 4", "x")',
    'derivative("sin(2x)", "x")',
    'f = parse("x^2 + x")',
    'x = parse("x")',
    "df = derivative(f, x)",
    "df.evaluate({x: 3})"
  ],
  seealso: ["simplify", "parse", "evaluate"]
};

// src/expression/embeddedDocs/function/algebra/leafCount.ts
var leafCountDocs = {
  name: "leafCount",
  category: "Algebra",
  syntax: ["leafCount(expr)"],
  description: "Computes the number of leaves in the parse tree of the given expression",
  examples: [
    'leafCount("e^(i*pi)-1")',
    'leafCount(parse("{a: 22/7, b: 10^(1/2)}"))'
  ],
  seealso: ["simplify"]
};

// src/expression/embeddedDocs/function/algebra/lsolve.ts
var lsolveDocs = {
  name: "lsolve",
  category: "Algebra",
  syntax: ["x=lsolve(L, b)"],
  description: "Finds one solution of the linear system L * x = b where L is an [n x n] lower triangular matrix and b is a [n] column vector.",
  examples: ["a = [-2, 3; 2, 1]", "b = [11, 9]", "x = lsolve(a, b)"],
  seealso: ["lsolveAll", "lup", "lusolve", "usolve", "matrix", "sparse"]
};

// src/expression/embeddedDocs/function/algebra/lsolveAll.ts
var lsolveAllDocs = {
  name: "lsolveAll",
  category: "Algebra",
  syntax: ["x=lsolveAll(L, b)"],
  description: "Finds all solutions of the linear system L * x = b where L is an [n x n] lower triangular matrix and b is a [n] column vector.",
  examples: ["a = [-2, 3; 2, 1]", "b = [11, 9]", "x = lsolve(a, b)"],
  seealso: ["lsolve", "lup", "lusolve", "usolve", "matrix", "sparse"]
};

// src/expression/embeddedDocs/function/algebra/lup.ts
var lupDocs = {
  name: "lup",
  category: "Algebra",
  syntax: ["lup(m)"],
  description: "Calculate the Matrix LU decomposition with partial pivoting. Matrix A is decomposed in three matrices (L, U, P) where P * A = L * U",
  examples: [
    "lup([[2, 1], [1, 4]])",
    "lup(matrix([[2, 1], [1, 4]]))",
    "lup(sparse([[2, 1], [1, 4]]))"
  ],
  seealso: ["lusolve", "lsolve", "usolve", "matrix", "sparse", "slu", "qr"]
};

// src/expression/embeddedDocs/function/algebra/lusolve.ts
var lusolveDocs = {
  name: "lusolve",
  category: "Algebra",
  syntax: ["x=lusolve(A, b)", "x=lusolve(lu, b)"],
  description: "Solves the linear system A * x = b where A is an [n x n] matrix and b is a [n] column vector.",
  examples: ["a = [-2, 3; 2, 1]", "b = [11, 9]", "x = lusolve(a, b)"],
  seealso: ["lup", "slu", "lsolve", "usolve", "matrix", "sparse"]
};

// src/expression/embeddedDocs/function/algebra/polynomialRoot.ts
var polynomialRootDocs = {
  name: "polynomialRoot",
  category: "Algebra",
  syntax: [
    "x=polynomialRoot(-6, 3)",
    "x=polynomialRoot(4, -4, 1)",
    "x=polynomialRoot(-8, 12, -6, 1)"
  ],
  description: "Finds the roots of a univariate polynomial given by its coefficients starting from constant, linear, and so on, increasing in degree.",
  examples: ["a = polynomialRoot(-6, 11, -6, 1)"],
  seealso: ["cbrt", "sqrt"]
};

// src/expression/embeddedDocs/function/algebra/qr.ts
var qrDocs = {
  name: "qr",
  category: "Algebra",
  syntax: ["qr(A)"],
  description: "Calculates the Matrix QR decomposition. Matrix `A` is decomposed in two matrices (`Q`, `R`) where `Q` is an orthogonal matrix and `R` is an upper triangular matrix.",
  examples: ["qr([[1, -1,  4], [1,  4, -2], [1,  4,  2], [1,  -1, 0]])"],
  seealso: ["lup", "slu", "matrix"]
};

// src/expression/embeddedDocs/function/algebra/rationalize.ts
var rationalizeDocs = {
  name: "rationalize",
  category: "Algebra",
  syntax: [
    "rationalize(expr)",
    "rationalize(expr, scope)",
    "rationalize(expr, scope, detailed)"
  ],
  description: "Transform a rationalizable expression in a rational fraction. If rational fraction is one variable polynomial then converts the numerator and denominator in canonical form, with decreasing exponents, returning the coefficients of numerator.",
  examples: [
    'rationalize("2x/y - y/(x+1)")',
    'rationalize("2x/y - y/(x+1)", true)'
  ],
  seealso: ["simplify"]
};

// src/expression/embeddedDocs/function/algebra/resolve.ts
var resolveDocs = {
  name: "resolve",
  category: "Algebra",
  syntax: ["resolve(node, scope)"],
  description: "Recursively substitute variables in an expression tree.",
  examples: [
    'resolve(parse("1 + x"), { x: 7 })',
    'resolve(parse("size(text)"), { text: "Hello World" })',
    'resolve(parse("x + y"), { x: parse("3z") })',
    'resolve(parse("3x"), { x: parse("y+z"), z: parse("w^y") })'
  ],
  seealso: ["simplify", "evaluate"],
  mayThrow: ["ReferenceError"]
};

// src/expression/embeddedDocs/function/algebra/simplify.ts
var simplifyDocs = {
  name: "simplify",
  category: "Algebra",
  syntax: ["simplify(expr)", "simplify(expr, rules)"],
  description: "Simplify an expression tree.",
  examples: [
    'simplify("3 + 2 / 4")',
    'simplify("2x + x")',
    'f = parse("x * (x + 2 + x)")',
    "simplified = simplify(f)",
    "simplified.evaluate({x: 2})"
  ],
  seealso: [
    "simplifyCore",
    "derivative",
    "evaluate",
    "parse",
    "rationalize",
    "resolve"
  ]
};

// src/expression/embeddedDocs/function/algebra/simplifyConstant.ts
var simplifyConstantDocs = {
  name: "simplifyConstant",
  category: "Algebra",
  syntax: ["simplifyConstant(expr)", "simplifyConstant(expr, options)"],
  description: "Replace constant subexpressions of node with their values.",
  examples: [
    'simplifyConstant("(3-3)*x")',
    'simplifyConstant(parse("z-cos(tau/8)"))'
  ],
  seealso: ["simplify", "simplifyCore", "evaluate"]
};

// src/expression/embeddedDocs/function/algebra/simplifyCore.ts
var simplifyCoreDocs = {
  name: "simplifyCore",
  category: "Algebra",
  syntax: ["simplifyCore(node)"],
  description: "Perform simple one-pass simplifications on an expression tree.",
  examples: ['simplifyCore(parse("0*x"))', 'simplifyCore(parse("(x+0)*2"))'],
  seealso: ["simplify", "simplifyConstant", "evaluate"]
};

// src/expression/embeddedDocs/function/algebra/slu.ts
var sluDocs = {
  name: "slu",
  category: "Algebra",
  syntax: ["slu(A, order, threshold)"],
  description: "Calculate the Matrix LU decomposition with full pivoting. Matrix A is decomposed in two matrices (L, U) and two permutation vectors (pinv, q) where P * A * Q = L * U",
  examples: [
    "slu(sparse([4.5, 0, 3.2, 0; 3.1, 2.9, 0, 0.9; 0, 1.7, 3, 0; 3.5, 0.4, 0, 1]), 1, 0.001)"
  ],
  seealso: ["lusolve", "lsolve", "usolve", "matrix", "sparse", "lup", "qr"]
};

// src/expression/embeddedDocs/function/algebra/symbolicEqual.ts
var symbolicEqualDocs = {
  name: "symbolicEqual",
  category: "Algebra",
  syntax: [
    "symbolicEqual(expr1, expr2)",
    "symbolicEqual(expr1, expr2, options)"
  ],
  description: "Returns true if the difference of the expressions simplifies to 0",
  examples: [
    'symbolicEqual("x*y","y*x")',
    'symbolicEqual("abs(x^2)", "x^2")',
    'symbolicEqual("abs(x)", "x", {context: {abs: {trivial: true}}})'
  ],
  seealso: ["simplify", "evaluate"]
};

// src/expression/embeddedDocs/function/algebra/usolve.ts
var usolveDocs = {
  name: "usolve",
  category: "Algebra",
  syntax: ["x=usolve(U, b)"],
  description: "Finds one solution of the linear system U * x = b where U is an [n x n] upper triangular matrix and b is a [n] column vector.",
  examples: [
    "x=usolve(sparse([1, 1, 1, 1; 0, 1, 1, 1; 0, 0, 1, 1; 0, 0, 0, 1]), [1; 2; 3; 4])"
  ],
  seealso: ["usolveAll", "lup", "lusolve", "lsolve", "matrix", "sparse"]
};

// src/expression/embeddedDocs/function/algebra/usolveAll.ts
var usolveAllDocs = {
  name: "usolveAll",
  category: "Algebra",
  syntax: ["x=usolve(U, b)"],
  description: "Finds all solutions of the linear system U * x = b where U is an [n x n] upper triangular matrix and b is a [n] column vector.",
  examples: [
    "x=usolve(sparse([1, 1, 1, 1; 0, 1, 1, 1; 0, 0, 1, 1; 0, 0, 0, 1]), [1; 2; 3; 4])"
  ],
  seealso: ["usolve", "lup", "lusolve", "lsolve", "matrix", "sparse"]
};

// src/expression/embeddedDocs/function/arithmetic/abs.ts
var absDocs = {
  name: "abs",
  category: "Arithmetic",
  syntax: ["abs(x)"],
  description: "Compute the absolute value.",
  examples: ["abs(3.5)", "abs(-4.2)"],
  seealso: ["sign"]
};

// src/expression/embeddedDocs/function/arithmetic/add.ts
var addDocs = {
  name: "add",
  category: "Operators",
  syntax: ["x + y", "add(x, y)"],
  description: "Add two values.",
  examples: [
    "a = 2.1 + 3.6",
    "a - 3.6",
    "3 + 2i",
    "3 cm + 2 inch",
    '"2.3" + "4"'
  ],
  seealso: ["subtract"]
};

// src/expression/embeddedDocs/function/arithmetic/cbrt.ts
var cbrtDocs = {
  name: "cbrt",
  category: "Arithmetic",
  syntax: ["cbrt(x)", "cbrt(x, allRoots)"],
  description: "Compute the cubic root value. If x = y * y * y, then y is the cubic root of x. When `x` is a number or complex number, an optional second argument `allRoots` can be provided to return all three cubic roots. If not provided, the principal root is returned",
  examples: [
    "cbrt(64)",
    "cube(4)",
    "cbrt(-8)",
    "cbrt(2 + 3i)",
    "cbrt(8i)",
    "cbrt(8i, true)",
    "cbrt(27 m^3)"
  ],
  seealso: ["square", "sqrt", "cube", "multiply"]
};

// src/expression/embeddedDocs/function/arithmetic/ceil.ts
var ceilDocs = {
  name: "ceil",
  category: "Arithmetic",
  syntax: [
    "ceil(x)",
    "ceil(x, n)",
    "ceil(unit, valuelessUnit)",
    "ceil(unit, n, valuelessUnit)"
  ],
  description: "Round a value towards plus infinity. If x is complex, both real and imaginary part are rounded towards plus infinity.",
  examples: [
    "ceil(3.2)",
    "ceil(3.8)",
    "ceil(-4.2)",
    "ceil(3.241cm, cm)",
    "ceil(3.241cm, 2, cm)"
  ],
  seealso: ["floor", "fix", "round"]
};

// src/expression/embeddedDocs/function/arithmetic/cube.ts
var cubeDocs = {
  name: "cube",
  category: "Arithmetic",
  syntax: ["cube(x)"],
  description: "Compute the cube of a value. The cube of x is x * x * x.",
  examples: ["cube(2)", "2^3", "2 * 2 * 2"],
  seealso: ["multiply", "square", "pow"]
};

// src/expression/embeddedDocs/function/arithmetic/divide.ts
var divideDocs = {
  name: "divide",
  category: "Operators",
  syntax: ["x / y", "divide(x, y)"],
  description: "Divide two values.",
  examples: [
    "a = 2 / 3",
    "a * 3",
    "4.5 / 2",
    "3 + 4 / 2",
    "(3 + 4) / 2",
    "18 km / 4.5"
  ],
  seealso: ["multiply"]
};

// src/expression/embeddedDocs/function/arithmetic/dotDivide.ts
var dotDivideDocs = {
  name: "dotDivide",
  category: "Operators",
  syntax: ["x ./ y", "dotDivide(x, y)"],
  description: "Divide two values element wise.",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "b = [2, 1, 1; 3, 2, 5]", "a ./ b"],
  seealso: ["multiply", "dotMultiply", "divide"]
};

// src/expression/embeddedDocs/function/arithmetic/dotMultiply.ts
var dotMultiplyDocs = {
  name: "dotMultiply",
  category: "Operators",
  syntax: ["x .* y", "dotMultiply(x, y)"],
  description: "Multiply two values element wise.",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "b = [2, 1, 1; 3, 2, 5]", "a .* b"],
  seealso: ["multiply", "divide", "dotDivide"]
};

// src/expression/embeddedDocs/function/arithmetic/dotPow.ts
var dotPowDocs = {
  name: "dotPow",
  category: "Operators",
  syntax: ["x .^ y", "dotPow(x, y)"],
  description: "Calculates the power of x to y element wise.",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "a .^ 2"],
  seealso: ["pow"]
};

// src/expression/embeddedDocs/function/arithmetic/exp.ts
var expDocs = {
  name: "exp",
  category: "Arithmetic",
  syntax: ["exp(x)"],
  description: "Calculate the exponent of a value.",
  examples: [
    "exp(1.3)",
    "e ^ 1.3",
    "log(exp(1.3))",
    "x = 2.4",
    "(exp(i*x) == cos(x) + i*sin(x))   # Euler's formula"
  ],
  seealso: ["expm", "expm1", "pow", "log"]
};

// src/expression/embeddedDocs/function/arithmetic/expm.ts
var expmDocs = {
  name: "expm",
  category: "Arithmetic",
  syntax: ["exp(x)"],
  description: "Compute the matrix exponential, expm(A) = e^A. The matrix must be square. Not to be confused with exp(a), which performs element-wise exponentiation.",
  examples: ["expm([[0,2],[0,0]])"],
  seealso: ["exp"]
};

// src/expression/embeddedDocs/function/arithmetic/expm1.ts
var expm1Docs = {
  name: "expm1",
  category: "Arithmetic",
  syntax: ["expm1(x)"],
  description: "Calculate the value of subtracting 1 from the exponential value.",
  examples: ["expm1(2)", "pow(e, 2) - 1", "log(expm1(2) + 1)"],
  seealso: ["exp", "pow", "log"]
};

// src/expression/embeddedDocs/function/arithmetic/fix.ts
var fixDocs = {
  name: "fix",
  category: "Arithmetic",
  syntax: [
    "fix(x)",
    "fix(x, n)",
    "fix(unit, valuelessUnit)",
    "fix(unit, n, valuelessUnit)"
  ],
  description: "Round a value towards zero. If x is complex, both real and imaginary part are rounded towards zero.",
  examples: [
    "fix(3.2)",
    "fix(3.8)",
    "fix(-4.2)",
    "fix(-4.8)",
    "fix(3.241cm, cm)",
    "fix(3.241cm, 2, cm)"
  ],
  seealso: ["ceil", "floor", "round"]
};

// src/expression/embeddedDocs/function/arithmetic/floor.ts
var floorDocs = {
  name: "floor",
  category: "Arithmetic",
  syntax: [
    "floor(x)",
    "floor(x, n)",
    "floor(unit, valuelessUnit)",
    "floor(unit, n, valuelessUnit)"
  ],
  description: "Round a value towards minus infinity.If x is complex, both real and imaginary part are rounded towards minus infinity.",
  examples: [
    "floor(3.2)",
    "floor(3.8)",
    "floor(-4.2)",
    "floor(3.241cm, cm)",
    "floor(3.241cm, 2, cm)"
  ],
  seealso: ["ceil", "fix", "round"]
};

// src/expression/embeddedDocs/function/arithmetic/gcd.ts
var gcdDocs = {
  name: "gcd",
  category: "Arithmetic",
  syntax: ["gcd(a, b)", "gcd(a, b, c, ...)"],
  description: "Compute the greatest common divisor.",
  examples: ["gcd(8, 12)", "gcd(-4, 6)", "gcd(25, 15, -10)"],
  seealso: ["lcm", "xgcd"]
};

// src/expression/embeddedDocs/function/arithmetic/hypot.ts
var hypotDocs = {
  name: "hypot",
  category: "Arithmetic",
  syntax: ["hypot(a, b, c, ...)", "hypot([a, b, c, ...])"],
  description: "Calculate the hypotenuse of a list with values.",
  examples: ["hypot(3, 4)", "sqrt(3^2 + 4^2)", "hypot(-2)", "hypot([3, 4, 5])"],
  seealso: ["abs", "norm"]
};

// src/expression/embeddedDocs/function/arithmetic/invmod.ts
var invmodDocs = {
  name: "invmod",
  category: "Arithmetic",
  syntax: ["invmod(a, b)"],
  description: "Calculate the (modular) multiplicative inverse of a modulo b. Solution to the equation ax \u2263 1 (mod b)",
  examples: ["invmod(8, 12)", "invmod(7, 13)", "invmod(15151, 15122)"],
  seealso: ["gcd", "xgcd"]
};

// src/expression/embeddedDocs/function/arithmetic/lcm.ts
var lcmDocs = {
  name: "lcm",
  category: "Arithmetic",
  syntax: ["lcm(x, y)"],
  description: "Compute the least common multiple.",
  examples: ["lcm(4, 6)", "lcm(6, 21)", "lcm(6, 21, 5)"],
  seealso: ["gcd"]
};

// src/expression/embeddedDocs/function/arithmetic/log.ts
var logDocs = {
  name: "log",
  category: "Arithmetic",
  syntax: ["log(x)", "log(x, base)"],
  description: "Compute the logarithm of a value. If no base is provided, the natural logarithm of x is calculated. If base if provided, the logarithm is calculated for the specified base. log(x, base) is defined as log(x) / log(base).",
  examples: [
    "log(3.5)",
    "a = log(2.4)",
    "exp(a)",
    "10 ^ 4",
    "log(10000, 10)",
    "log(10000) / log(10)",
    "b = log(1024, 2)",
    "2 ^ b"
  ],
  seealso: ["exp", "log1p", "log2", "log10"]
};

// src/expression/embeddedDocs/function/arithmetic/log10.ts
var log10Docs = {
  name: "log10",
  category: "Arithmetic",
  syntax: ["log10(x)"],
  description: "Compute the 10-base logarithm of a value.",
  examples: [
    "log10(0.00001)",
    "log10(10000)",
    "10 ^ 4",
    "log(10000) / log(10)",
    "log(10000, 10)"
  ],
  seealso: ["exp", "log"]
};

// src/expression/embeddedDocs/function/arithmetic/log1p.ts
var log1pDocs = {
  name: "log1p",
  category: "Arithmetic",
  syntax: ["log1p(x)", "log1p(x, base)"],
  description: "Calculate the logarithm of a `value+1`",
  examples: [
    "log1p(2.5)",
    "exp(log1p(1.4))",
    "pow(10, 4)",
    "log1p(9999, 10)",
    "log1p(9999) / log(10)"
  ],
  seealso: ["exp", "log", "log2", "log10"]
};

// src/expression/embeddedDocs/function/arithmetic/log2.ts
var log2Docs = {
  name: "log2",
  category: "Arithmetic",
  syntax: ["log2(x)"],
  description: "Calculate the 2-base of a value. This is the same as calculating `log(x, 2)`.",
  examples: ["log2(0.03125)", "log2(16)", "log2(16) / log2(2)", "pow(2, 4)"],
  seealso: ["exp", "log1p", "log", "log10"]
};

// src/expression/embeddedDocs/function/arithmetic/mod.ts
var modDocs = {
  name: "mod",
  category: "Operators",
  syntax: ["x % y", "x mod y", "mod(x, y)"],
  description: "Calculates the modulus, the remainder of an integer division.",
  examples: [
    "7 % 3",
    "11 % 2",
    "10 mod 4",
    "isOdd(x) = x % 2",
    "isOdd(2)",
    "isOdd(3)"
  ],
  seealso: ["divide"]
};

// src/expression/embeddedDocs/function/arithmetic/multiply.ts
var multiplyDocs = {
  name: "multiply",
  category: "Operators",
  syntax: ["x * y", "multiply(x, y)"],
  description: "multiply two values.",
  examples: [
    "a = 2.1 * 3.4",
    "a / 3.4",
    "2 * 3 + 4",
    "2 * (3 + 4)",
    "3 * 2.1 km"
  ],
  seealso: ["divide"]
};

// src/expression/embeddedDocs/function/arithmetic/norm.ts
var normDocs = {
  name: "norm",
  category: "Arithmetic",
  syntax: ["norm(x)", "norm(x, p)"],
  description: "Calculate the norm of a number, vector or matrix.",
  examples: [
    "abs(-3.5)",
    "norm(-3.5)",
    "norm(3 - 4i)",
    "norm([1, 2, -3], Infinity)",
    "norm([1, 2, -3], -Infinity)",
    "norm([3, 4], 2)",
    "norm([[1, 2], [3, 4]], 1)",
    'norm([[1, 2], [3, 4]], "inf")',
    'norm([[1, 2], [3, 4]], "fro")'
  ]
};

// src/expression/embeddedDocs/function/arithmetic/nthRoot.ts
var nthRootDocs = {
  name: "nthRoot",
  category: "Arithmetic",
  syntax: ["nthRoot(a)", "nthRoot(a, root)"],
  description: 'Calculate the nth root of a value. The principal nth root of a positive real number A, is the positive real solution of the equation "x^root = A".',
  examples: ["4 ^ 3", "nthRoot(64, 3)", "nthRoot(9, 2)", "sqrt(9)"],
  seealso: ["nthRoots", "pow", "sqrt"]
};

// src/expression/embeddedDocs/function/arithmetic/nthRoots.ts
var nthRootsDocs = {
  name: "nthRoots",
  category: "Arithmetic",
  syntax: ["nthRoots(A)", "nthRoots(A, root)"],
  description: 'Calculate the nth roots of a value. An nth root of a positive real number A, is a positive real solution of the equation "x^root = A". This function returns an array of complex values.',
  examples: ["nthRoots(1)", "nthRoots(1, 3)"],
  seealso: ["sqrt", "pow", "nthRoot"]
};

// src/expression/embeddedDocs/function/arithmetic/pow.ts
var powDocs = {
  name: "pow",
  category: "Operators",
  syntax: ["x ^ y", "pow(x, y)"],
  description: "Calculates the power of x to y, x^y.",
  examples: [
    "2^3",
    "2*2*2",
    "1 + e ^ (pi * i)",
    "pow([[1, 2], [4, 3]], 2)",
    "pow([[1, 2], [4, 3]], -1)"
  ],
  seealso: ["multiply", "nthRoot", "nthRoots", "sqrt"]
};

// src/expression/embeddedDocs/function/arithmetic/round.ts
var roundDocs = {
  name: "round",
  category: "Arithmetic",
  syntax: [
    "round(x)",
    "round(x, n)",
    "round(unit, valuelessUnit)",
    "round(unit, n, valuelessUnit)"
  ],
  description: "round a value towards the nearest integer.If x is complex, both real and imaginary part are rounded towards the nearest integer. When n is specified, the value is rounded to n decimals.",
  examples: [
    "round(3.2)",
    "round(3.8)",
    "round(-4.2)",
    "round(-4.8)",
    "round(pi, 3)",
    "round(123.45678, 2)",
    "round(3.241cm, 2, cm)",
    "round([3.2, 3.8, -4.7])"
  ],
  seealso: ["ceil", "floor", "fix"]
};

// src/expression/embeddedDocs/function/arithmetic/sign.ts
var signDocs = {
  name: "sign",
  category: "Arithmetic",
  syntax: ["sign(x)"],
  description: "Compute the sign of a value. The sign of a value x is 1 when x>0, -1 when x<0, and 0 when x=0.",
  examples: ["sign(3.5)", "sign(-4.2)", "sign(0)"],
  seealso: ["abs"]
};

// src/expression/embeddedDocs/function/arithmetic/sqrt.ts
var sqrtDocs = {
  name: "sqrt",
  category: "Arithmetic",
  syntax: ["sqrt(x)"],
  description: "Compute the square root value. If x = y * y, then y is the square root of x.",
  examples: ["sqrt(25)", "5 * 5", "sqrt(-1)"],
  seealso: ["square", "sqrtm", "multiply", "nthRoot", "nthRoots", "pow"]
};

// src/expression/embeddedDocs/function/arithmetic/sqrtm.ts
var sqrtmDocs = {
  name: "sqrtm",
  category: "Arithmetic",
  syntax: ["sqrtm(x)"],
  description: "Calculate the principal square root of a square matrix. The principal square root matrix `X` of another matrix `A` is such that `X * X = A`.",
  examples: ["sqrtm([[33, 24], [48, 57]])"],
  seealso: ["sqrt", "abs", "square", "multiply"]
};

// src/expression/embeddedDocs/function/algebra/sylvester.ts
var sylvesterDocs = {
  name: "sylvester",
  category: "Algebra",
  syntax: ["sylvester(A,B,C)"],
  description: "Solves the real-valued Sylvester equation AX+XB=C for X",
  examples: [
    "sylvester([[-1, -2], [1, 1]], [[-2, 1], [-1, 2]], [[-3, 2], [3, 0]])",
    "A = [[-1, -2], [1, 1]]; B = [[2, -1], [1, -2]]; C = [[-3, 2], [3, 0]]",
    "sylvester(A, B, C)"
  ],
  seealso: ["schur", "lyap"]
};

// src/expression/embeddedDocs/function/algebra/schur.ts
var schurDocs = {
  name: "schur",
  category: "Algebra",
  syntax: ["schur(A)"],
  description: "Performs a real Schur decomposition of the real matrix A = UTU'",
  examples: ["schur([[1, 0], [-4, 3]])", "A = [[1, 0], [-4, 3]]", "schur(A)"],
  seealso: ["lyap", "sylvester"]
};

// src/expression/embeddedDocs/function/algebra/lyap.ts
var lyapDocs = {
  name: "lyap",
  category: "Algebra",
  syntax: ["lyap(A,Q)"],
  description: "Solves the Continuous-time Lyapunov equation AP+PA'+Q=0 for P",
  examples: [
    "lyap([[-2, 0], [1, -4]], [[3, 1], [1, 3]])",
    "A = [[-2, 0], [1, -4]]",
    "Q = [[3, 1], [1, 3]]",
    "lyap(A,Q)"
  ],
  seealso: ["schur", "sylvester"]
};

// src/expression/embeddedDocs/function/arithmetic/square.ts
var squareDocs = {
  name: "square",
  category: "Arithmetic",
  syntax: ["square(x)"],
  description: "Compute the square of a value. The square of x is x * x.",
  examples: ["square(3)", "sqrt(9)", "3^2", "3 * 3"],
  seealso: ["multiply", "pow", "sqrt", "cube"]
};

// src/expression/embeddedDocs/function/arithmetic/subtract.ts
var subtractDocs = {
  name: "subtract",
  category: "Operators",
  syntax: ["x - y", "subtract(x, y)"],
  description: "subtract two values.",
  examples: ["a = 5.3 - 2", "a + 2", "2/3 - 1/6", "2 * 3 - 3", "2.1 km - 500m"],
  seealso: ["add"]
};

// src/expression/embeddedDocs/function/arithmetic/unaryMinus.ts
var unaryMinusDocs = {
  name: "unaryMinus",
  category: "Operators",
  syntax: ["-x", "unaryMinus(x)"],
  description: "Inverse the sign of a value. Converts booleans and strings to numbers.",
  examples: ["-4.5", "-(-5.6)", '-"22"'],
  seealso: ["add", "subtract", "unaryPlus"]
};

// src/expression/embeddedDocs/function/arithmetic/unaryPlus.ts
var unaryPlusDocs = {
  name: "unaryPlus",
  category: "Operators",
  syntax: ["+x", "unaryPlus(x)"],
  description: "Converts booleans and strings to numbers.",
  examples: ["+true", '+"2"'],
  seealso: ["add", "subtract", "unaryMinus"]
};

// src/expression/embeddedDocs/function/arithmetic/xgcd.ts
var xgcdDocs = {
  name: "xgcd",
  category: "Arithmetic",
  syntax: ["xgcd(a, b)"],
  description: "Calculate the extended greatest common divisor for two values. The result is an array [d, x, y] with 3 entries, where d is the greatest common divisor, and d = x * a + y * b.",
  examples: ["xgcd(8, 12)", "gcd(8, 12)", "xgcd(36163, 21199)"],
  seealso: ["gcd", "lcm"]
};

// src/expression/embeddedDocs/function/bitwise/bitAnd.ts
var bitAndDocs = {
  name: "bitAnd",
  category: "Bitwise",
  syntax: ["x & y", "bitAnd(x, y)"],
  description: "Bitwise AND operation. Performs the logical AND operation on each pair of the corresponding bits of the two given values by multiplying them. If both bits in the compared position are 1, the bit in the resulting binary representation is 1, otherwise, the result is 0",
  examples: ["5 & 3", "bitAnd(53, 131)", "[1, 12, 31] & 42"],
  seealso: [
    "bitNot",
    "bitOr",
    "bitXor",
    "leftShift",
    "rightArithShift",
    "rightLogShift"
  ]
};

// src/expression/embeddedDocs/function/bitwise/bitNot.ts
var bitNotDocs = {
  name: "bitNot",
  category: "Bitwise",
  syntax: ["~x", "bitNot(x)"],
  description: "Bitwise NOT operation. Performs a logical negation on each bit of the given value. Bits that are 0 become 1, and those that are 1 become 0.",
  examples: ["~1", "~2", "bitNot([2, -3, 4])"],
  seealso: [
    "bitAnd",
    "bitOr",
    "bitXor",
    "leftShift",
    "rightArithShift",
    "rightLogShift"
  ]
};

// src/expression/embeddedDocs/function/bitwise/bitOr.ts
var bitOrDocs = {
  name: "bitOr",
  category: "Bitwise",
  syntax: ["x | y", "bitOr(x, y)"],
  description: "Bitwise OR operation. Performs the logical inclusive OR operation on each pair of corresponding bits of the two given values. The result in each position is 1 if the first bit is 1 or the second bit is 1 or both bits are 1, otherwise, the result is 0.",
  examples: ["5 | 3", "bitOr([1, 2, 3], 4)"],
  seealso: [
    "bitAnd",
    "bitNot",
    "bitXor",
    "leftShift",
    "rightArithShift",
    "rightLogShift"
  ]
};

// src/expression/embeddedDocs/function/bitwise/bitXor.ts
var bitXorDocs = {
  name: "bitXor",
  category: "Bitwise",
  syntax: ["bitXor(x, y)"],
  description: "Bitwise XOR operation, exclusive OR. Performs the logical exclusive OR operation on each pair of corresponding bits of the two given values. The result in each position is 1 if only the first bit is 1 or only the second bit is 1, but will be 0 if both are 0 or both are 1.",
  examples: ["bitOr(1, 2)", "bitXor([2, 3, 4], 4)"],
  seealso: [
    "bitAnd",
    "bitNot",
    "bitOr",
    "leftShift",
    "rightArithShift",
    "rightLogShift"
  ]
};

// src/expression/embeddedDocs/function/bitwise/leftShift.ts
var leftShiftDocs = {
  name: "leftShift",
  category: "Bitwise",
  syntax: ["x << y", "leftShift(x, y)"],
  description: "Bitwise left logical shift of a value x by y number of bits.",
  examples: ["4 << 1", "8 >> 1"],
  seealso: [
    "bitAnd",
    "bitNot",
    "bitOr",
    "bitXor",
    "rightArithShift",
    "rightLogShift"
  ]
};

// src/expression/embeddedDocs/function/bitwise/rightArithShift.ts
var rightArithShiftDocs = {
  name: "rightArithShift",
  category: "Bitwise",
  syntax: ["x >> y", "rightArithShift(x, y)"],
  description: "Bitwise right arithmetic shift of a value x by y number of bits.",
  examples: ["8 >> 1", "4 << 1", "-12 >> 2"],
  seealso: ["bitAnd", "bitNot", "bitOr", "bitXor", "leftShift", "rightLogShift"]
};

// src/expression/embeddedDocs/function/bitwise/rightLogShift.ts
var rightLogShiftDocs = {
  name: "rightLogShift",
  category: "Bitwise",
  syntax: ["x >>> y", "rightLogShift(x, y)"],
  description: "Bitwise right logical shift of a value x by y number of bits.",
  examples: ["8 >>> 1", "4 << 1", "-12 >>> 2"],
  seealso: [
    "bitAnd",
    "bitNot",
    "bitOr",
    "bitXor",
    "leftShift",
    "rightArithShift"
  ]
};

// src/expression/embeddedDocs/function/combinatorics/bellNumbers.ts
var bellNumbersDocs = {
  name: "bellNumbers",
  category: "Combinatorics",
  syntax: ["bellNumbers(n)"],
  description: "The Bell Numbers count the number of partitions of a set. A partition is a pairwise disjoint subset of S whose union is S. `bellNumbers` only takes integer arguments. The following condition must be enforced: n >= 0.",
  examples: ["bellNumbers(3)", "bellNumbers(8)"],
  seealso: ["stirlingS2"]
};

// src/expression/embeddedDocs/function/combinatorics/catalan.ts
var catalanDocs = {
  name: "catalan",
  category: "Combinatorics",
  syntax: ["catalan(n)"],
  description: "The Catalan Numbers enumerate combinatorial structures of many different types. catalan only takes integer arguments. The following condition must be enforced: n >= 0.",
  examples: ["catalan(3)", "catalan(8)"],
  seealso: ["bellNumbers"]
};

// src/expression/embeddedDocs/function/combinatorics/composition.ts
var compositionDocs = {
  name: "composition",
  category: "Combinatorics",
  syntax: ["composition(n, k)"],
  description: "The composition counts of n into k parts. composition only takes integer arguments. The following condition must be enforced: k <= n.",
  examples: ["composition(5, 3)"],
  seealso: ["combinations"]
};

// src/expression/embeddedDocs/function/combinatorics/stirlingS2.ts
var stirlingS2Docs = {
  name: "stirlingS2",
  category: "Combinatorics",
  syntax: ["stirlingS2(n, k)"],
  description: "The Stirling numbers of the second kind, counts the number of ways to partition a set of n labelled objects into k nonempty unlabelled subsets. `stirlingS2` only takes integer arguments. The following condition must be enforced: k <= n. If n = k or k = 1, then s(n,k) = 1.",
  examples: ["stirlingS2(5, 3)"],
  seealso: ["bellNumbers", "bernoulli"]
};

// src/expression/embeddedDocs/function/complex/arg.ts
var argDocs = {
  name: "arg",
  category: "Complex",
  syntax: ["arg(x)"],
  description: "Compute the argument of a complex value. If x = a+bi, the argument is computed as atan2(b, a).",
  examples: ["arg(2 + 2i)", "atan2(3, 2)", "arg(2 + 3i)"],
  seealso: ["re", "im", "conj", "abs"]
};

// src/expression/embeddedDocs/function/complex/conj.ts
var conjDocs = {
  name: "conj",
  category: "Complex",
  syntax: ["conj(x)"],
  description: "Compute the complex conjugate of a complex value. If x = a+bi, the complex conjugate is a-bi.",
  examples: ["conj(2 + 3i)", "conj(2 - 3i)", "conj(-5.2i)"],
  seealso: ["re", "im", "abs", "arg"]
};

// src/expression/embeddedDocs/function/complex/im.ts
var imDocs = {
  name: "im",
  category: "Complex",
  syntax: ["im(x)"],
  description: "Get the imaginary part of a complex number.",
  examples: ["im(2 + 3i)", "re(2 + 3i)", "im(-5.2i)", "im(2.4)"],
  seealso: ["re", "conj", "abs", "arg"]
};

// src/expression/embeddedDocs/function/complex/re.ts
var reDocs = {
  name: "re",
  category: "Complex",
  syntax: ["re(x)"],
  description: "Get the real part of a complex number.",
  examples: ["re(2 + 3i)", "im(2 + 3i)", "re(-5.2i)", "re(2.4)"],
  seealso: ["im", "conj", "abs", "arg"]
};

// src/expression/embeddedDocs/function/expression/evaluate.ts
var evaluateDocs = {
  name: "evaluate",
  category: "Expression",
  syntax: [
    "evaluate(expression)",
    "evaluate(expression, scope)",
    "evaluate([expr1, expr2, expr3, ...])",
    "evaluate([expr1, expr2, expr3, ...], scope)"
  ],
  description: "Evaluate an expression or an array with expressions.",
  examples: [
    'evaluate("2 + 3")',
    'evaluate("sqrt(16)")',
    'evaluate("2 inch to cm")',
    'evaluate("sin(x * pi)", { "x": 1/2 })',
    'evaluate(["width=2", "height=4","width*height"])'
  ],
  seealso: ["parser", "parse", "compile"]
};

// src/expression/embeddedDocs/function/expression/parser.ts
var parserDocs = {
  name: "parser",
  category: "Expression",
  syntax: ["parser()"],
  description: "Create a parser object that keeps a context of variables and their values, allowing the evaluation of expressions in that context.",
  examples: [
    "myParser = parser()",
    'myParser.evaluate("sqrt(3^2 + 4^2)")',
    'myParser.set("x", 3)',
    'myParser.evaluate("y = x + 3")',
    'myParser.evaluate(["y = x + 3", "y = y + 1"])',
    'myParser.get("y")'
  ],
  seealso: ["evaluate", "parse", "compile"]
};

// src/expression/embeddedDocs/function/expression/parse.ts
var parseDocs = {
  name: "parse",
  category: "Expression",
  syntax: [
    "parse(expr)",
    "parse(expr, options)",
    "parse([expr1, expr2, expr3, ...])",
    "parse([expr1, expr2, expr3, ...], options)"
  ],
  description: "Parse an expression. Returns a node tree, which can be evaluated by invoking node.evaluate() or transformed into a functional object via node.compile().",
  examples: [
    'node1 = parse("sqrt(3^2 + 4^2)")',
    "node1.evaluate()",
    "code1 = node1.compile()",
    "code1.evaluate()",
    "scope = {a: 3, b: 4}",
    'node2 = parse("a * b")',
    "node2.evaluate(scope)",
    "code2 = node2.compile()",
    "code2.evaluate(scope)"
  ],
  seealso: ["parser", "evaluate", "compile"]
};

// src/expression/embeddedDocs/function/expression/compile.ts
var compileDocs = {
  name: "compile",
  category: "Expression",
  syntax: ["compile(expr) ", "compile([expr1, expr2, expr3, ...])"],
  description: "Parse and compile an expression. Returns a an object with a function evaluate([scope]) to evaluate the compiled expression.",
  examples: [
    'code1 = compile("sqrt(3^2 + 4^2)")',
    "code1.evaluate() ",
    'code2 = compile("a * b")',
    "code2.evaluate({a: 3, b: 4})"
  ],
  seealso: ["parser", "parse", "evaluate"]
};

// src/expression/embeddedDocs/function/expression/help.ts
var helpDocs = {
  name: "help",
  category: "Expression",
  syntax: ["help(object)", "help(string)"],
  description: "Display documentation on a function or data type.",
  examples: ["help(sqrt)", 'help("complex")'],
  seealso: []
};

// src/expression/embeddedDocs/function/geometry/distance.ts
var distanceDocs = {
  name: "distance",
  category: "Geometry",
  syntax: ["distance([x1, y1], [x2, y2])", "distance([[x1, y1], [x2, y2]])"],
  description: "Calculates the Euclidean distance between two points.",
  examples: ["distance([0,0], [4,4])", "distance([[0,0], [4,4]])"],
  seealso: []
};

// src/expression/embeddedDocs/function/geometry/intersect.ts
var intersectDocs = {
  name: "intersect",
  category: "Geometry",
  syntax: [
    "intersect(expr1, expr2, expr3, expr4)",
    "intersect(expr1, expr2, expr3)"
  ],
  description: "Computes the intersection point of lines and/or planes.",
  examples: [
    "intersect([0, 0], [10, 10], [10, 0], [0, 10])",
    "intersect([1, 0, 1],  [4, -2, 2], [1, 1, 1, 6])"
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/logical/and.ts
var andDocs = {
  name: "and",
  category: "Logical",
  syntax: ["x and y", "and(x, y)"],
  description: "Logical and. Test whether two values are both defined with a nonzero/nonempty value.",
  examples: ["true and false", "true and true", "2 and 4"],
  seealso: ["not", "or", "xor"]
};

// src/expression/embeddedDocs/function/logical/not.ts
var notDocs = {
  name: "not",
  category: "Logical",
  syntax: ["not x", "not(x)"],
  description: "Logical not. Flips the boolean value of given argument.",
  examples: ["not true", "not false", "not 2", "not 0"],
  seealso: ["and", "or", "xor"]
};

// src/expression/embeddedDocs/function/logical/nullish.ts
var nullishDocs = {
  name: "nullish",
  category: "Logical",
  syntax: ["x ?? y", "nullish(x, y)"],
  description: "Nullish coalescing operator. Returns the right-hand operand when the left-hand operand is null or undefined, and otherwise returns the left-hand operand.",
  examples: [
    "null ?? 42",
    "undefined ?? 42",
    "0 ?? 42",
    "false ?? 42",
    "null ?? undefined ?? 42"
  ],
  seealso: ["and", "or", "not"]
};

// src/expression/embeddedDocs/function/logical/or.ts
var orDocs = {
  name: "or",
  category: "Logical",
  syntax: ["x or y", "or(x, y)"],
  description: "Logical or. Test if at least one value is defined with a nonzero/nonempty value.",
  examples: ["true or false", "false or false", "0 or 4"],
  seealso: ["not", "and", "xor"]
};

// src/expression/embeddedDocs/function/logical/xor.ts
var xorDocs = {
  name: "xor",
  category: "Logical",
  syntax: ["x xor y", "xor(x, y)"],
  description: "Logical exclusive or, xor. Test whether one and only one value is defined with a nonzero/nonempty value.",
  examples: ["true xor false", "false xor false", "true xor true", "0 xor 4"],
  seealso: ["not", "and", "or"]
};

// src/expression/embeddedDocs/function/matrix/mapSlices.ts
var mapSlicesDocs = {
  name: "mapSlices",
  category: "Matrix",
  syntax: ["mapSlices(A, dim, callback)"],
  description: "Generate a matrix one dimension less than A by applying callback to each slice of A along dimension dim.",
  examples: [
    "A = [[1, 2], [3, 4]]",
    "mapSlices(A, 1, sum)",
    // returns [4, 6]
    "mapSlices(A, 2, prod)"
    // returns [2, 12]
  ],
  seealso: ["map", "forEach"]
};

// src/expression/embeddedDocs/function/matrix/column.ts
var columnDocs = {
  name: "column",
  category: "Matrix",
  syntax: ["column(x, index)"],
  description: "Return a column from a matrix or array.",
  examples: ["A = [[1, 2], [3, 4]]", "column(A, 1)", "column(A, 2)"],
  seealso: ["row", "matrixFromColumns"]
};

// src/expression/embeddedDocs/function/matrix/concat.ts
var concatDocs = {
  name: "concat",
  category: "Matrix",
  syntax: ["concat(A, B, C, ...)", "concat(A, B, C, ..., dim)"],
  description: "Concatenate matrices. By default, the matrices are concatenated by the last dimension. The dimension on which to concatenate can be provided as last argument.",
  examples: [
    "A = [1, 2; 5, 6]",
    "B = [3, 4; 7, 8]",
    "concat(A, B)",
    "concat(A, B, 1)",
    "concat(A, B, 2)"
  ],
  seealso: [
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/count.ts
var countDocs = {
  name: "count",
  category: "Matrix",
  syntax: ["count(x)"],
  description: "Count the number of elements of a matrix, array or string.",
  examples: [
    "a = [1, 2; 3, 4; 5, 6]",
    "count(a)",
    "size(a)",
    'count("hello world")'
  ],
  seealso: ["size"]
};

// src/expression/embeddedDocs/function/matrix/cross.ts
var crossDocs = {
  name: "cross",
  category: "Matrix",
  syntax: ["cross(A, B)"],
  description: "Calculate the cross product for two vectors in three dimensional space.",
  examples: [
    "cross([1, 1, 0],  [0, 1, 1])",
    "cross([3, -3, 1], [4, 9, 2])",
    "cross([2, 3, 4],  [5, 6, 7])"
  ],
  seealso: ["multiply", "dot"]
};

// src/expression/embeddedDocs/function/matrix/ctranspose.ts
var ctransposeDocs = {
  name: "ctranspose",
  category: "Matrix",
  syntax: ["x'", "ctranspose(x)"],
  description: "Complex Conjugate and Transpose a matrix",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "a'", "ctranspose(a)"],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/det.ts
var detDocs = {
  name: "det",
  category: "Matrix",
  syntax: ["det(x)"],
  description: "Calculate the determinant of a matrix",
  examples: ["det([1, 2; 3, 4])", "det([-2, 2, 3; -1, 1, 3; 2, 0, -1])"],
  seealso: [
    "concat",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/diag.ts
var diagDocs = {
  name: "diag",
  category: "Matrix",
  syntax: ["diag(x)", "diag(x, k)"],
  description: "Create a diagonal matrix or retrieve the diagonal of a matrix. When x is a vector, a matrix with the vector values on the diagonal will be returned. When x is a matrix, a vector with the diagonal values of the matrix is returned. When k is provided, the k-th diagonal will be filled in or retrieved, if k is positive, the values are placed on the super diagonal. When k is negative, the values are placed on the sub diagonal.",
  examples: [
    "diag(1:3)",
    "diag(1:3, 1)",
    "a = [1, 2, 3; 4, 5, 6; 7, 8, 9]",
    "diag(a)"
  ],
  seealso: [
    "concat",
    "det",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/diff.ts
var diffDocs = {
  name: "diff",
  category: "Matrix",
  syntax: ["diff(arr)", "diff(arr, dim)"],
  description: [
    "Create a new matrix or array with the difference of the passed matrix or array.",
    "Dim parameter is optional and used to indicate the dimension of the array/matrix to apply the difference",
    "If no dimension parameter is passed it is assumed as dimension 0",
    "Dimension is zero-based in javascript and one-based in the parser",
    "Arrays must be 'rectangular' meaning arrays like [1, 2]",
    "If something is passed as a matrix it will be returned as a matrix but other than that all matrices are converted to arrays"
  ],
  examples: [
    "A = [1, 2, 4, 7, 0]",
    "diff(A)",
    "diff(A, 1)",
    "B = [[1, 2], [3, 4]]",
    "diff(B)",
    "diff(B, 1)",
    "diff(B, 2)",
    "diff(B, bignumber(2))",
    "diff([[1, 2], matrix([3, 4])], 2)"
  ],
  seealso: ["subtract", "partitionSelect"]
};

// src/expression/embeddedDocs/function/matrix/dot.ts
var dotDocs = {
  name: "dot",
  category: "Matrix",
  syntax: ["dot(A, B)", "A * B"],
  description: "Calculate the dot product of two vectors. The dot product of A = [a1, a2, a3, ..., an] and B = [b1, b2, b3, ..., bn] is defined as dot(A, B) = a1 * b1 + a2 * b2 + a3 * b3 + ... + an * bn",
  examples: ["dot([2, 4, 1], [2, 2, 3])", "[2, 4, 1] * [2, 2, 3]"],
  seealso: ["multiply", "cross"]
};

// src/expression/embeddedDocs/function/matrix/eigs.ts
var eigsDocs = {
  name: "eigs",
  category: "Matrix",
  syntax: ["eigs(x)"],
  description: "Calculate the eigenvalues and optionally eigenvectors of a square matrix",
  examples: [
    "eigs([[5, 2.3], [2.3, 1]])",
    "eigs([[1, 2, 3], [4, 5, 6], [7, 8, 9]], { precision: 1e-6, eigenvectors: false })"
  ],
  seealso: ["inv"]
};

// src/expression/embeddedDocs/function/matrix/filter.ts
var filterDocs = {
  name: "filter",
  category: "Matrix",
  syntax: ["filter(x, test)"],
  description: "Filter items in a matrix.",
  examples: [
    "isPositive(x) = x > 0",
    "filter([6, -2, -1, 4, 3], isPositive)",
    "filter([6, -2, 0, 1, 0], x != 0)"
  ],
  seealso: ["sort", "map", "forEach"]
};

// src/expression/embeddedDocs/function/matrix/flatten.ts
var flattenDocs = {
  name: "flatten",
  category: "Matrix",
  syntax: ["flatten(x)"],
  description: "Flatten a multi dimensional matrix into a single dimensional matrix.",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "size(a)", "b = flatten(a)", "size(b)"],
  seealso: ["concat", "resize", "size", "squeeze"]
};

// src/expression/embeddedDocs/function/matrix/forEach.ts
var forEachDocs = {
  name: "forEach",
  category: "Matrix",
  syntax: ["forEach(x, callback)"],
  description: "Iterates over all elements of a matrix/array, and executes the given callback function.",
  examples: [
    "numberOfPets = {}",
    "addPet(n) = numberOfPets[n] = (numberOfPets[n] ? numberOfPets[n]:0 ) + 1;",
    'forEach(["Dog","Cat","Cat"], addPet)',
    "numberOfPets"
  ],
  seealso: ["map", "sort", "filter"]
};

// src/expression/embeddedDocs/function/matrix/getMatrixDataType.ts
var getMatrixDataTypeDocs = {
  name: "getMatrixDataType",
  category: "Matrix",
  syntax: ["getMatrixDataType(x)"],
  description: 'Find the data type of all elements in a matrix or array, for example "number" if all items are a number and "Complex" if all values are complex numbers. If a matrix contains more than one data type, it will return "mixed".',
  examples: [
    "getMatrixDataType([1, 2, 3])",
    "getMatrixDataType([[5 cm], [2 inch]])",
    'getMatrixDataType([1, "text"])',
    "getMatrixDataType([1, bignumber(4)])"
  ],
  seealso: ["matrix", "sparse", "typeOf"]
};

// src/expression/embeddedDocs/function/matrix/identity.ts
var identityDocs = {
  name: "identity",
  category: "Matrix",
  syntax: ["identity(n)", "identity(m, n)", "identity([m, n])"],
  description: "Returns the identity matrix with size m-by-n. The matrix has ones on the diagonal and zeros elsewhere.",
  examples: [
    "identity(3)",
    "identity(3, 5)",
    "a = [1, 2, 3; 4, 5, 6]",
    "identity(size(a))"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/inv.ts
var invDocs = {
  name: "inv",
  category: "Matrix",
  syntax: ["inv(x)"],
  description: "Calculate the inverse of a matrix",
  examples: ["inv([1, 2; 3, 4])", "inv(4)", "1 / 4"],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/pinv.ts
var pinvDocs = {
  name: "pinv",
  category: "Matrix",
  syntax: ["pinv(x)"],
  description: "Calculate the Moore\u2013Penrose inverse of a matrix",
  examples: ["pinv([1, 2; 3, 4])", "pinv([[1, 0], [0, 1], [0, 1]])", "pinv(4)"],
  seealso: ["inv"]
};

// src/expression/embeddedDocs/function/matrix/kron.ts
var kronDocs = {
  name: "kron",
  category: "Matrix",
  syntax: ["kron(x, y)"],
  description: "Calculates the Kronecker product of 2 matrices or vectors.",
  examples: [
    "kron([[1, 0], [0, 1]], [[1, 2], [3, 4]])",
    "kron([1,1], [2,3,4])"
  ],
  seealso: ["multiply", "dot", "cross"]
};

// src/expression/embeddedDocs/function/matrix/map.ts
var mapDocs = {
  name: "map",
  category: "Matrix",
  syntax: ["map(x, callback)", "map(x, y, ..., callback)"],
  description: "Create a new matrix or array with the results of the callback function executed on each entry of the matrix/array or the matrices/arrays.",
  examples: ["map([1, 2, 3], square)", "map([1, 2], [3, 4], f(a,b) = a + b)"],
  seealso: ["filter", "forEach"]
};

// src/expression/embeddedDocs/function/matrix/matrixFromColumns.ts
var matrixFromColumnsDocs = {
  name: "matrixFromColumns",
  category: "Matrix",
  syntax: [
    "matrixFromColumns(...arr)",
    "matrixFromColumns(row1, row2)",
    "matrixFromColumns(row1, row2, row3)"
  ],
  description: "Create a dense matrix from vectors as individual columns.",
  examples: ["matrixFromColumns([1, 2, 3], [[4],[5],[6]])"],
  seealso: ["matrix", "matrixFromRows", "matrixFromFunction", "zeros"]
};

// src/expression/embeddedDocs/function/matrix/matrixFromFunction.ts
var matrixFromFunctionDocs = {
  name: "matrixFromFunction",
  category: "Matrix",
  syntax: [
    "matrixFromFunction(size, fn)",
    "matrixFromFunction(size, fn, format)",
    "matrixFromFunction(size, fn, format, datatype)",
    "matrixFromFunction(size, format, fn)",
    "matrixFromFunction(size, format, datatype, fn)"
  ],
  description: "Create a matrix by evaluating a generating function at each index.",
  examples: [
    "f(I) = I[1] - I[2]",
    "matrixFromFunction([3,3], f)",
    "g(I) = I[1] - I[2] == 1 ? 4 : 0",
    'matrixFromFunction([100, 100], "sparse", g)',
    "matrixFromFunction([5], random)"
  ],
  seealso: ["matrix", "matrixFromRows", "matrixFromColumns", "zeros"]
};

// src/expression/embeddedDocs/function/matrix/matrixFromRows.ts
var matrixFromRowsDocs = {
  name: "matrixFromRows",
  category: "Matrix",
  syntax: [
    "matrixFromRows(...arr)",
    "matrixFromRows(row1, row2)",
    "matrixFromRows(row1, row2, row3)"
  ],
  description: "Create a dense matrix from vectors as individual rows.",
  examples: ["matrixFromRows([1, 2, 3], [[4],[5],[6]])"],
  seealso: ["matrix", "matrixFromColumns", "matrixFromFunction", "zeros"]
};

// src/expression/embeddedDocs/function/matrix/ones.ts
var onesDocs = {
  name: "ones",
  category: "Matrix",
  syntax: [
    "ones(m)",
    "ones(m, n)",
    "ones(m, n, p, ...)",
    "ones([m])",
    "ones([m, n])",
    "ones([m, n, p, ...])"
  ],
  description: "Create a matrix containing ones.",
  examples: [
    "ones(3)",
    "ones(3, 5)",
    "ones([2,3]) * 4.5",
    "a = [1, 2, 3; 4, 5, 6]",
    "ones(size(a))"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/partitionSelect.ts
var partitionSelectDocs = {
  name: "partitionSelect",
  category: "Matrix",
  syntax: ["partitionSelect(x, k)", "partitionSelect(x, k, compare)"],
  description: "Partition-based selection of an array or 1D matrix. Will find the kth smallest value, and mutates the input array. Uses Quickselect.",
  examples: [
    "partitionSelect([5, 10, 1], 2)",
    'partitionSelect(["C", "B", "A", "D"], 1, compareText)',
    "arr = [5, 2, 1]",
    "partitionSelect(arr, 0) # returns 1, arr is now: [1, 2, 5]",
    "arr",
    "partitionSelect(arr, 1, 'desc') # returns 2, arr is now: [5, 2, 1]",
    "arr"
  ],
  seealso: ["sort"]
};

// src/expression/embeddedDocs/function/matrix/range.ts
var rangeDocs = {
  name: "range",
  category: "Type",
  syntax: [
    "start:end",
    "start:step:end",
    "range(start, end)",
    "range(start, end, step)",
    "range(string)"
  ],
  description: "Create a range. Lower bound of the range is included, upper bound is excluded.",
  examples: [
    "1:5",
    "3:-1:-3",
    "range(3, 7)",
    "range(0, 12, 2)",
    'range("4:10")',
    "range(1m, 1m, 3m)",
    "a = [1, 2, 3, 4; 5, 6, 7, 8]",
    "a[1:2, 1:2]"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/reshape.ts
var reshapeDocs = {
  name: "reshape",
  category: "Matrix",
  syntax: ["reshape(x, sizes)"],
  description: "Reshape a multi dimensional array to fit the specified dimensions.",
  examples: [
    "reshape([1, 2, 3, 4, 5, 6], [2, 3])",
    "reshape([[1, 2], [3, 4]], [1, 4])",
    "reshape([[1, 2], [3, 4]], [4])",
    "reshape([1, 2, 3, 4], [-1, 2])"
  ],
  seealso: ["size", "squeeze", "resize"]
};

// src/expression/embeddedDocs/function/matrix/resize.ts
var resizeDocs = {
  name: "resize",
  category: "Matrix",
  syntax: ["resize(x, size)", "resize(x, size, defaultValue)"],
  description: "Resize a matrix.",
  examples: [
    "resize([1,2,3,4,5], [3])",
    "resize([1,2,3], [5])",
    "resize([1,2,3], [5], -1)",
    "resize(2, [2, 3])",
    'resize("hello", [8], "!")'
  ],
  seealso: ["size", "subset", "squeeze", "reshape"]
};

// src/expression/embeddedDocs/function/matrix/rotate.ts
var rotateDocs = {
  name: "rotate",
  category: "Matrix",
  syntax: ["rotate(w, theta)", "rotate(w, theta, v)"],
  description: "Returns a 2-D rotation matrix (2x2) for a given angle (in radians). Returns a 2-D rotation matrix (3x3) of a given angle (in radians) around given axis.",
  examples: [
    "rotate([1, 0], pi / 2)",
    'rotate(matrix([1, 0]), unit("35deg"))',
    'rotate([1, 0, 0], unit("90deg"), [0, 0, 1])',
    'rotate(matrix([1, 0, 0]), unit("90deg"), matrix([0, 0, 1]))'
  ],
  seealso: ["matrix", "rotationMatrix"]
};

// src/expression/embeddedDocs/function/matrix/rotationMatrix.ts
var rotationMatrixDocs = {
  name: "rotationMatrix",
  category: "Matrix",
  syntax: [
    "rotationMatrix(theta)",
    "rotationMatrix(theta, v)",
    "rotationMatrix(theta, v, format)"
  ],
  description: "Returns a 2-D rotation matrix (2x2) for a given angle (in radians). Returns a 2-D rotation matrix (3x3) of a given angle (in radians) around given axis.",
  examples: [
    "rotationMatrix(pi / 2)",
    'rotationMatrix(unit("45deg"), [0, 0, 1])',
    'rotationMatrix(1, matrix([0, 0, 1]), "sparse")'
  ],
  seealso: ["cos", "sin"]
};

// src/expression/embeddedDocs/function/matrix/row.ts
var rowDocs = {
  name: "row",
  category: "Matrix",
  syntax: ["row(x, index)"],
  description: "Return a row from a matrix or array.",
  examples: ["A = [[1, 2], [3, 4]]", "row(A, 1)", "row(A, 2)"],
  seealso: ["column", "matrixFromRows"]
};

// src/expression/embeddedDocs/function/matrix/size.ts
var sizeDocs = {
  name: "size",
  category: "Matrix",
  syntax: ["size(x)"],
  description: "Calculate the size of a matrix.",
  examples: [
    "size(2.3)",
    'size("hello world")',
    "a = [1, 2; 3, 4; 5, 6]",
    "size(a)",
    "size(1:6)"
  ],
  seealso: [
    "concat",
    "count",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "squeeze",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/sort.ts
var sortDocs = {
  name: "sort",
  category: "Matrix",
  syntax: ["sort(x)", "sort(x, compare)"],
  description: 'Sort the items in a matrix. Compare can be a string "asc", "desc", "natural", or a custom sort function.',
  examples: [
    "sort([5, 10, 1])",
    'sort(["C", "B", "A", "D"], "natural")',
    "sortByLength(a, b) = size(a)[1] - size(b)[1]",
    'sort(["Langdon", "Tom", "Sara"], sortByLength)',
    'sort(["10", "1", "2"], "natural")'
  ],
  seealso: ["map", "filter", "forEach"]
};

// src/expression/embeddedDocs/function/matrix/squeeze.ts
var squeezeDocs = {
  name: "squeeze",
  category: "Matrix",
  syntax: ["squeeze(x)"],
  description: "Remove inner and outer singleton dimensions from a matrix.",
  examples: [
    "a = zeros(3,2,1)",
    "size(squeeze(a))",
    "b = zeros(1,1,3)",
    "size(squeeze(b))"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "subset",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/subset.ts
var subsetDocs = {
  name: "subset",
  category: "Matrix",
  syntax: [
    "value(index)",
    "value(index) = replacement",
    "subset(value, [index])",
    "subset(value, [index], replacement)"
  ],
  description: "Get or set a subset of the entries of a matrix or characters of a string. Indexes are one-based. There should be one index specification for each dimension of the target. Each specification can be a single index, a list of indices, or a range in colon notation `l:u`. In a range, both the lower bound l and upper bound u are included; and if a bound is omitted it defaults to the most extreme valid value. The cartesian product of the indices specified in each dimension determines the target of the operation.",
  examples: [
    "d = [1, 2; 3, 4]",
    "e = []",
    "e[1, 1:2] = [5, 6]",
    "e[2, :] = [7, 8]",
    "f = d * e",
    "f[2, 1]",
    "f[:, 1]",
    "f[[1,2], [1,3]] = [9, 10; 11, 12]",
    "f"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "trace",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/trace.ts
var traceDocs = {
  name: "trace",
  category: "Matrix",
  syntax: ["trace(A)"],
  description: "Calculate the trace of a matrix: the sum of the elements on the main diagonal of a square matrix.",
  examples: ["A = [1, 2, 3; -1, 2, 3; 2, 0, 3]", "trace(A)"],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "transpose",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/transpose.ts
var transposeDocs = {
  name: "transpose",
  category: "Matrix",
  syntax: ["x'", "transpose(x)"],
  description: "Transpose a matrix",
  examples: ["a = [1, 2, 3; 4, 5, 6]", "a'", "transpose(a)"],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "zeros"
  ]
};

// src/expression/embeddedDocs/function/matrix/zeros.ts
var zerosDocs = {
  name: "zeros",
  category: "Matrix",
  syntax: [
    "zeros(m)",
    "zeros(m, n)",
    "zeros(m, n, p, ...)",
    "zeros([m])",
    "zeros([m, n])",
    "zeros([m, n, p, ...])"
  ],
  description: "Create a matrix containing zeros.",
  examples: [
    "zeros(3)",
    "zeros(3, 5)",
    "a = [1, 2, 3; 4, 5, 6]",
    "zeros(size(a))"
  ],
  seealso: [
    "concat",
    "det",
    "diag",
    "identity",
    "inv",
    "ones",
    "range",
    "size",
    "squeeze",
    "subset",
    "trace",
    "transpose"
  ]
};

// src/expression/embeddedDocs/function/matrix/fft.ts
var fftDocs = {
  name: "fft",
  category: "Matrix",
  syntax: ["fft(x)"],
  description: "Calculate N-dimensional Fourier transform",
  examples: ["fft([[1, 0], [1, 0]])"],
  seealso: ["ifft"]
};

// src/expression/embeddedDocs/function/matrix/ifft.ts
var ifftDocs = {
  name: "ifft",
  category: "Matrix",
  syntax: ["ifft(x)"],
  description: "Calculate N-dimensional inverse Fourier transform",
  examples: ["ifft([[2, 2], [0, 0]])"],
  seealso: ["fft"]
};

// src/expression/embeddedDocs/function/probability/bernoulli.ts
var bernoulliDocs = {
  name: "bernoulli",
  category: "Probability",
  syntax: ["bernoulli(n)"],
  description: "The nth Bernoulli number",
  examples: ["bernoulli(4)", "bernoulli(fraction(12))"],
  seealso: ["combinations", "gamma", "stirlingS2"]
};

// src/expression/embeddedDocs/function/probability/combinations.ts
var combinationsDocs = {
  name: "combinations",
  category: "Probability",
  syntax: ["combinations(n, k)"],
  description: "Compute the number of combinations of n items taken k at a time",
  examples: ["combinations(7, 5)"],
  seealso: ["combinationsWithRep", "permutations", "factorial"]
};

// src/expression/embeddedDocs/function/probability/combinationsWithRep.ts
var combinationsWithRepDocs = {
  name: "combinationsWithRep",
  category: "Probability",
  syntax: ["combinationsWithRep(n, k)"],
  description: "Compute the number of combinations of n items taken k at a time with replacements.",
  examples: ["combinationsWithRep(7, 5)"],
  seealso: ["combinations", "permutations", "factorial"]
};

// src/expression/embeddedDocs/function/probability/factorial.ts
var factorialDocs = {
  name: "factorial",
  category: "Probability",
  syntax: ["n!", "factorial(n)"],
  description: "Compute the factorial of a value",
  examples: ["5!", "5 * 4 * 3 * 2 * 1", "3!"],
  seealso: ["combinations", "combinationsWithRep", "permutations", "gamma"]
};

// src/expression/embeddedDocs/function/probability/gamma.ts
var gammaDocs = {
  name: "gamma",
  category: "Probability",
  syntax: ["gamma(n)"],
  description: "Compute the gamma function. For small values, the Lanczos approximation is used, and for large values the extended Stirling approximation.",
  examples: ["gamma(4)", "3!", "gamma(1/2)", "sqrt(pi)"],
  seealso: ["factorial"]
};

// src/expression/embeddedDocs/function/probability/lgamma.ts
var lgammaDocs = {
  name: "lgamma",
  category: "Probability",
  syntax: ["lgamma(n)"],
  description: "Logarithm of the gamma function for real, positive numbers and complex numbers, using Lanczos approximation for numbers and Stirling series for complex numbers.",
  examples: [
    "lgamma(4)",
    "lgamma(1/2)",
    "lgamma(i)",
    "lgamma(complex(1.1, 2))"
  ],
  seealso: ["gamma"]
};

// src/expression/embeddedDocs/function/probability/kldivergence.ts
var kldivergenceDocs = {
  name: "kldivergence",
  category: "Probability",
  syntax: ["kldivergence(x, y)"],
  description: "Calculate the Kullback-Leibler (KL) divergence  between two distributions.",
  examples: ["kldivergence([0.7,0.5,0.4], [0.2,0.9,0.5])"],
  seealso: []
};

// src/expression/embeddedDocs/function/probability/multinomial.ts
var multinomialDocs = {
  name: "multinomial",
  category: "Probability",
  syntax: ["multinomial(A)"],
  description: "Multinomial Coefficients compute the number of ways of picking a1, a2, ..., ai unordered outcomes from `n` possibilities. multinomial takes one array of integers as an argument. The following condition must be enforced: every ai > 0.",
  examples: ["multinomial([1, 2, 1])"],
  seealso: ["combinations", "factorial"]
};

// src/expression/embeddedDocs/function/probability/permutations.ts
var permutationsDocs = {
  name: "permutations",
  category: "Probability",
  syntax: ["permutations(n)", "permutations(n, k)"],
  description: "Compute the number of permutations of n items taken k at a time",
  examples: ["permutations(5)", "permutations(5, 3)"],
  seealso: ["combinations", "combinationsWithRep", "factorial"]
};

// src/expression/embeddedDocs/function/probability/pickRandom.ts
var pickRandomDocs = {
  name: "pickRandom",
  category: "Probability",
  syntax: [
    "pickRandom(array)",
    "pickRandom(array, number)",
    "pickRandom(array, weights)",
    "pickRandom(array, number, weights)",
    "pickRandom(array, weights, number)"
  ],
  description: "Pick a random entry from a given array.",
  examples: [
    "pickRandom(0:10)",
    "pickRandom([1, 3, 1, 6])",
    "pickRandom([1, 3, 1, 6], 2)",
    "pickRandom([1, 3, 1, 6], [2, 3, 2, 1])",
    "pickRandom([1, 3, 1, 6], 2, [2, 3, 2, 1])",
    "pickRandom([1, 3, 1, 6], [2, 3, 2, 1], 2)"
  ],
  seealso: ["random", "randomInt"]
};

// src/expression/embeddedDocs/function/probability/random.ts
var randomDocs = {
  name: "random",
  category: "Probability",
  syntax: [
    "random()",
    "random(max)",
    "random(min, max)",
    "random(size)",
    "random(size, max)",
    "random(size, min, max)"
  ],
  description: "Return a random number.",
  examples: ["random()", "random(10, 20)", "random([2, 3])"],
  seealso: ["pickRandom", "randomInt"]
};

// src/expression/embeddedDocs/function/probability/randomInt.ts
var randomIntDocs = {
  name: "randomInt",
  category: "Probability",
  syntax: [
    "randomInt(max)",
    "randomInt(min, max)",
    "randomInt(size)",
    "randomInt(size, max)",
    "randomInt(size, min, max)"
  ],
  description: "Return a random integer number",
  examples: ["randomInt(10, 20)", "randomInt([2, 3], 10)"],
  seealso: ["pickRandom", "random"]
};

// src/expression/embeddedDocs/function/relational/compare.ts
var compareDocs = {
  name: "compare",
  category: "Relational",
  syntax: ["compare(x, y)"],
  description: "Compare two values. Returns 1 when x > y, -1 when x < y, and 0 when x == y.",
  examples: [
    "compare(2, 3)",
    "compare(3, 2)",
    "compare(2, 2)",
    "compare(5cm, 40mm)",
    "compare(2, [1, 2, 3])"
  ],
  seealso: [
    "equal",
    "unequal",
    "smaller",
    "smallerEq",
    "largerEq",
    "compareNatural",
    "compareText"
  ]
};

// src/expression/embeddedDocs/function/relational/compareNatural.ts
var compareNaturalDocs = {
  name: "compareNatural",
  category: "Relational",
  syntax: ["compareNatural(x, y)"],
  description: "Compare two values of any type in a deterministic, natural way. Returns 1 when x > y, -1 when x < y, and 0 when x == y.",
  examples: [
    "compareNatural(2, 3)",
    "compareNatural(3, 2)",
    "compareNatural(2, 2)",
    "compareNatural(5cm, 40mm)",
    'compareNatural("2", "10")',
    "compareNatural(2 + 3i, 2 + 4i)",
    "compareNatural([1, 2, 4], [1, 2, 3])",
    "compareNatural([1, 5], [1, 2, 3])",
    "compareNatural([1, 2], [1, 2])",
    "compareNatural({a: 2}, {a: 4})"
  ],
  seealso: [
    "equal",
    "unequal",
    "smaller",
    "smallerEq",
    "largerEq",
    "compare",
    "compareText"
  ]
};

// src/expression/embeddedDocs/function/relational/compareText.ts
var compareTextDocs = {
  name: "compareText",
  category: "Relational",
  syntax: ["compareText(x, y)"],
  description: "Compare two strings lexically. Comparison is case sensitive. Returns 1 when x > y, -1 when x < y, and 0 when x == y.",
  examples: [
    'compareText("B", "A")',
    'compareText("A", "B")',
    'compareText("A", "A")',
    'compareText("2", "10")',
    'compare("2", "10")',
    "compare(2, 10)",
    'compareNatural("2", "10")',
    'compareText("B", ["A", "B", "C"])'
  ],
  seealso: ["compare", "compareNatural"]
};

// src/expression/embeddedDocs/function/relational/deepEqual.ts
var deepEqualDocs = {
  name: "deepEqual",
  category: "Relational",
  syntax: ["deepEqual(x, y)"],
  description: "Check equality of two matrices element wise. Returns true if the size of both matrices is equal and when and each of the elements are equal.",
  examples: ["deepEqual([1,3,4], [1,3,4])", "deepEqual([1,3,4], [1,3])"],
  seealso: [
    "equal",
    "unequal",
    "smaller",
    "larger",
    "smallerEq",
    "largerEq",
    "compare"
  ]
};

// src/expression/embeddedDocs/function/relational/equal.ts
var equalDocs = {
  name: "equal",
  category: "Relational",
  syntax: ["x == y", "equal(x, y)"],
  description: "Check equality of two values. Returns true if the values are equal, and false if not.",
  examples: [
    "2+2 == 3",
    "2+2 == 4",
    "a = 3.2",
    "b = 6-2.8",
    "a == b",
    "50cm == 0.5m"
  ],
  seealso: [
    "unequal",
    "smaller",
    "larger",
    "smallerEq",
    "largerEq",
    "compare",
    "deepEqual",
    "equalText"
  ]
};

// src/expression/embeddedDocs/function/relational/equalText.ts
var equalTextDocs = {
  name: "equalText",
  category: "Relational",
  syntax: ["equalText(x, y)"],
  description: "Check equality of two strings. Comparison is case sensitive. Returns true if the values are equal, and false if not.",
  examples: [
    'equalText("Hello", "Hello")',
    'equalText("a", "A")',
    'equal("2e3", "2000")',
    'equalText("2e3", "2000")',
    'equalText("B", ["A", "B", "C"])'
  ],
  seealso: ["compare", "compareNatural", "compareText", "equal"]
};

// src/expression/embeddedDocs/function/relational/larger.ts
var largerDocs = {
  name: "larger",
  category: "Relational",
  syntax: ["x > y", "larger(x, y)"],
  description: "Check if value x is larger than y. Returns true if x is larger than y, and false if not. Comparing a value with NaN returns false.",
  examples: [
    "2 > 3",
    "5 > 2*2",
    "a = 3.3",
    "b = 6-2.8",
    "(a > b)",
    "(b < a)",
    "5 cm > 2 inch"
  ],
  seealso: ["equal", "unequal", "smaller", "smallerEq", "largerEq", "compare"]
};

// src/expression/embeddedDocs/function/relational/largerEq.ts
var largerEqDocs = {
  name: "largerEq",
  category: "Relational",
  syntax: ["x >= y", "largerEq(x, y)"],
  description: "Check if value x is larger or equal to y. Returns true if x is larger or equal to y, and false if not.",
  examples: ["2 >= 1+1", "2 > 1+1", "a = 3.2", "b = 6-2.8", "(a >= b)"],
  seealso: ["equal", "unequal", "smallerEq", "smaller", "compare"]
};

// src/expression/embeddedDocs/function/relational/smaller.ts
var smallerDocs = {
  name: "smaller",
  category: "Relational",
  syntax: ["x < y", "smaller(x, y)"],
  description: "Check if value x is smaller than value y. Returns true if x is smaller than y, and false if not. Comparing a value with NaN returns false.",
  examples: [
    "2 < 3",
    "5 < 2*2",
    "a = 3.3",
    "b = 6-2.8",
    "(a < b)",
    "5 cm < 2 inch"
  ],
  seealso: ["equal", "unequal", "larger", "smallerEq", "largerEq", "compare"]
};

// src/expression/embeddedDocs/function/relational/smallerEq.ts
var smallerEqDocs = {
  name: "smallerEq",
  category: "Relational",
  syntax: ["x <= y", "smallerEq(x, y)"],
  description: "Check if value x is smaller or equal to value y. Returns true if x is smaller than y, and false if not.",
  examples: ["2 <= 1+1", "2 < 1+1", "a = 3.2", "b = 6-2.8", "(a <= b)"],
  seealso: ["equal", "unequal", "larger", "smaller", "largerEq", "compare"]
};

// src/expression/embeddedDocs/function/relational/unequal.ts
var unequalDocs = {
  name: "unequal",
  category: "Relational",
  syntax: ["x != y", "unequal(x, y)"],
  description: "Check unequality of two values. Returns true if the values are unequal, and false if they are equal.",
  examples: [
    "2+2 != 3",
    "2+2 != 4",
    "a = 3.2",
    "b = 6-2.8",
    "a != b",
    "50cm != 0.5m",
    "5 cm != 2 inch"
  ],
  seealso: [
    "equal",
    "smaller",
    "larger",
    "smallerEq",
    "largerEq",
    "compare",
    "deepEqual"
  ]
};

// src/expression/embeddedDocs/function/set/setCartesian.ts
var setCartesianDocs = {
  name: "setCartesian",
  category: "Set",
  syntax: ["setCartesian(set1, set2)"],
  description: "Create the cartesian product of two (multi)sets. Multi-dimension arrays will be converted to single-dimension arrays and the values will be sorted in ascending order before the operation.",
  examples: ["setCartesian([1, 2], [3, 4])"],
  seealso: ["setUnion", "setIntersect", "setDifference", "setPowerset"]
};

// src/expression/embeddedDocs/function/set/setDifference.ts
var setDifferenceDocs = {
  name: "setDifference",
  category: "Set",
  syntax: ["setDifference(set1, set2)"],
  description: "Create the difference of two (multi)sets: every element of set1, that is not the element of set2. Multi-dimension arrays will be converted to single-dimension arrays before the operation.",
  examples: [
    "setDifference([1, 2, 3, 4], [3, 4, 5, 6])",
    "setDifference([[1, 2], [3, 4]], [[3, 4], [5, 6]])"
  ],
  seealso: ["setUnion", "setIntersect", "setSymDifference"]
};

// src/expression/embeddedDocs/function/set/setDistinct.ts
var setDistinctDocs = {
  name: "setDistinct",
  category: "Set",
  syntax: ["setDistinct(set)"],
  description: "Collect the distinct elements of a multiset. A multi-dimension array will be converted to a single-dimension array before the operation.",
  examples: ["setDistinct([1, 1, 1, 2, 2, 3])"],
  seealso: ["setMultiplicity"]
};

// src/expression/embeddedDocs/function/set/setIntersect.ts
var setIntersectDocs = {
  name: "setIntersect",
  category: "Set",
  syntax: ["setIntersect(set1, set2)"],
  description: "Create the intersection of two (multi)sets. Multi-dimension arrays will be converted to single-dimension arrays before the operation.",
  examples: [
    "setIntersect([1, 2, 3, 4], [3, 4, 5, 6])",
    "setIntersect([[1, 2], [3, 4]], [[3, 4], [5, 6]])"
  ],
  seealso: ["setUnion", "setDifference"]
};

// src/expression/embeddedDocs/function/set/setIsSubset.ts
var setIsSubsetDocs = {
  name: "setIsSubset",
  category: "Set",
  syntax: ["setIsSubset(set1, set2)"],
  description: "Check whether a (multi)set is a subset of another (multi)set: every element of set1 is the element of set2. Multi-dimension arrays will be converted to single-dimension arrays before the operation.",
  examples: [
    "setIsSubset([1, 2], [3, 4, 5, 6])",
    "setIsSubset([3, 4], [3, 4, 5, 6])"
  ],
  seealso: ["setUnion", "setIntersect", "setDifference"]
};

// src/expression/embeddedDocs/function/set/setMultiplicity.ts
var setMultiplicityDocs = {
  name: "setMultiplicity",
  category: "Set",
  syntax: ["setMultiplicity(element, set)"],
  description: "Count the multiplicity of an element in a multiset. A multi-dimension array will be converted to a single-dimension array before the operation.",
  examples: [
    "setMultiplicity(1, [1, 2, 2, 4])",
    "setMultiplicity(2, [1, 2, 2, 4])"
  ],
  seealso: ["setDistinct", "setSize"]
};

// src/expression/embeddedDocs/function/set/setPowerset.ts
var setPowersetDocs = {
  name: "setPowerset",
  category: "Set",
  syntax: ["setPowerset(set)"],
  description: "Create the powerset of a (multi)set: the powerset contains very possible subsets of a (multi)set. A multi-dimension array will be converted to a single-dimension array before the operation.",
  examples: ["setPowerset([1, 2, 3])"],
  seealso: ["setCartesian"]
};

// src/expression/embeddedDocs/function/set/setSize.ts
var setSizeDocs = {
  name: "setSize",
  category: "Set",
  syntax: ["setSize(set)", "setSize(set, unique)"],
  description: 'Count the number of elements of a (multi)set. When the second parameter "unique" is true, count only the unique values. A multi-dimension array will be converted to a single-dimension array before the operation.',
  examples: ["setSize([1, 2, 2, 4])", "setSize([1, 2, 2, 4], true)"],
  seealso: ["setUnion", "setIntersect", "setDifference"]
};

// src/expression/embeddedDocs/function/set/setSymDifference.ts
var setSymDifferenceDocs = {
  name: "setSymDifference",
  category: "Set",
  syntax: ["setSymDifference(set1, set2)"],
  description: "Create the symmetric difference of two (multi)sets. Multi-dimension arrays will be converted to single-dimension arrays before the operation.",
  examples: [
    "setSymDifference([1, 2, 3, 4], [3, 4, 5, 6])",
    "setSymDifference([[1, 2], [3, 4]], [[3, 4], [5, 6]])"
  ],
  seealso: ["setUnion", "setIntersect", "setDifference"]
};

// src/expression/embeddedDocs/function/set/setUnion.ts
var setUnionDocs = {
  name: "setUnion",
  category: "Set",
  syntax: ["setUnion(set1, set2)"],
  description: "Create the union of two (multi)sets. Multi-dimension arrays will be converted to single-dimension arrays before the operation.",
  examples: [
    "setUnion([1, 2, 3, 4], [3, 4, 5, 6])",
    "setUnion([[1, 2], [3, 4]], [[3, 4], [5, 6]])"
  ],
  seealso: ["setIntersect", "setDifference"]
};

// src/expression/embeddedDocs/function/signal/zpk2tf.ts
var zpk2tfDocs = {
  name: "zpk2tf",
  category: "Signal",
  syntax: ["zpk2tf(z, p, k)"],
  description: "Compute the transfer function of a zero-pole-gain model.",
  examples: [
    "zpk2tf([1, 2], [-1, -2], 1)",
    "zpk2tf([1, 2], [-1, -2])",
    "zpk2tf([1 - 3i, 2 + 2i], [-1, -2])"
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/signal/freqz.ts
var freqzDocs = {
  name: "freqz",
  category: "Signal",
  syntax: ["freqz(b, a)", "freqz(b, a, w)"],
  description: "Calculates the frequency response of a filter given its numerator and denominator coefficients.",
  examples: [
    "freqz([1, 2], [1, 2, 3])",
    "freqz([1, 2], [1, 2, 3], [0, 1])",
    "freqz([1, 2], [1, 2, 3], 512)"
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/special/erf.ts
var erfDocs = {
  name: "erf",
  category: "Special",
  syntax: ["erf(x)"],
  description: "Compute the erf function of a value using a rational Chebyshev approximations for different intervals of x",
  examples: ["erf(0.2)", "erf(-0.5)", "erf(4)"],
  seealso: []
};

// src/expression/embeddedDocs/function/special/zeta.ts
var zetaDocs = {
  name: "zeta",
  category: "Special",
  syntax: ["zeta(s)"],
  description: "Compute the Riemann Zeta Function using an infinite series and Riemann's Functional Equation for the entire complex plane",
  examples: ["zeta(0.2)", "zeta(-0.5)", "zeta(4)"],
  seealso: []
};

// src/expression/embeddedDocs/function/statistics/mad.ts
var madDocs = {
  name: "mad",
  category: "Statistics",
  syntax: ["mad(a, b, c, ...)", "mad(A)"],
  description: "Compute the median absolute deviation of a matrix or a list with values. The median absolute deviation is defined as the median of the absolute deviations from the median.",
  examples: ["mad(10, 20, 30)", "mad([1, 2, 3])"],
  seealso: ["mean", "median", "std", "abs"]
};

// src/expression/embeddedDocs/function/statistics/max.ts
var maxDocs = {
  name: "max",
  category: "Statistics",
  syntax: ["max(a, b, c, ...)", "max(A)", "max(A, dimension)"],
  description: "Compute the maximum value of a list of values. If any NaN values are found, the function yields the last NaN in the input.",
  examples: [
    "max(2, 3, 4, 1)",
    "max([2, 3, 4, 1])",
    "max([2, 5; 4, 3])",
    "max([2, 5; 4, 3], 1)",
    "max([2, 5; 4, 3], 2)",
    "max(2.7, 7.1, -4.5, 2.0, 4.1)",
    "min(2.7, 7.1, -4.5, 2.0, 4.1)"
  ],
  seealso: ["mean", "median", "min", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/mean.ts
var meanDocs = {
  name: "mean",
  category: "Statistics",
  syntax: ["mean(a, b, c, ...)", "mean(A)", "mean(A, dimension)"],
  description: "Compute the arithmetic mean of a list of values.",
  examples: [
    "mean(2, 3, 4, 1)",
    "mean([2, 3, 4, 1])",
    "mean([2, 5; 4, 3])",
    "mean([2, 5; 4, 3], 1)",
    "mean([2, 5; 4, 3], 2)",
    "mean([1.0, 2.7, 3.2, 4.0])"
  ],
  seealso: ["max", "median", "min", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/median.ts
var medianDocs = {
  name: "median",
  category: "Statistics",
  syntax: ["median(a, b, c, ...)", "median(A)"],
  description: "Compute the median of all values. The values are sorted and the middle value is returned. In case of an even number of values, the average of the two middle values is returned.",
  examples: ["median(5, 2, 7)", "median([3, -1, 5, 7])"],
  seealso: [
    "max",
    "mean",
    "min",
    "prod",
    "std",
    "sum",
    "variance",
    "quantileSeq"
  ]
};

// src/expression/embeddedDocs/function/statistics/min.ts
var minDocs = {
  name: "min",
  category: "Statistics",
  syntax: ["min(a, b, c, ...)", "min(A)", "min(A, dimension)"],
  description: "Compute the minimum value of a list of values. If any NaN values are found, the function yields the last NaN in the input.",
  examples: [
    "min(2, 3, 4, 1)",
    "min([2, 3, 4, 1])",
    "min([2, 5; 4, 3])",
    "min([2, 5; 4, 3], 1)",
    "min([2, 5; 4, 3], 2)",
    "min(2.7, 7.1, -4.5, 2.0, 4.1)",
    "max(2.7, 7.1, -4.5, 2.0, 4.1)"
  ],
  seealso: ["max", "mean", "median", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/mode.ts
var modeDocs = {
  name: "mode",
  category: "Statistics",
  syntax: ["mode(a, b, c, ...)", "mode(A)", "mode(A, a, b, B, c, ...)"],
  description: "Computes the mode of all values as an array. In case mode being more than one, multiple values are returned in an array.",
  examples: [
    "mode(2, 1, 4, 3, 1)",
    "mode([1, 2.7, 3.2, 4, 2.7])",
    "mode(1, 4, 6, 1, 6)"
  ],
  seealso: ["max", "mean", "min", "median", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/prod.ts
var prodDocs = {
  name: "prod",
  category: "Statistics",
  syntax: ["prod(a, b, c, ...)", "prod(A)"],
  description: "Compute the product of all values.",
  examples: ["prod(2, 3, 4)", "prod([2, 3, 4])", "prod([2, 5; 4, 3])"],
  seealso: ["max", "mean", "min", "median", "min", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/quantileSeq.ts
var quantileSeqDocs = {
  name: "quantileSeq",
  category: "Statistics",
  syntax: [
    "quantileSeq(A, prob[, sorted])",
    "quantileSeq(A, [prob1, prob2, ...][, sorted])",
    "quantileSeq(A, N[, sorted])"
  ],
  description: "Compute the prob order quantile of a matrix or a list with values. The sequence is sorted and the middle value is returned. Supported types of sequence values are: Number, BigNumber, Unit Supported types of probability are: Number, BigNumber. \n\nIn case of a (multi dimensional) array or matrix, the prob order quantile of all elements will be calculated.",
  examples: [
    "quantileSeq([3, -1, 5, 7], 0.5)",
    "quantileSeq([3, -1, 5, 7], [1/3, 2/3])",
    "quantileSeq([3, -1, 5, 7], 2)",
    "quantileSeq([-1, 3, 5, 7], 0.5, true)"
  ],
  seealso: ["mean", "median", "min", "max", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/std.ts
var stdDocs = {
  name: "std",
  category: "Statistics",
  syntax: [
    "std(a, b, c, ...)",
    "std(A)",
    "std(A, dimension)",
    "std(A, normalization)",
    "std(A, dimension, normalization)"
  ],
  description: 'Compute the standard deviation of all values, defined as std(A) = sqrt(variance(A)). Optional parameter normalization can be "unbiased" (default), "uncorrected", or "biased".',
  examples: [
    "std(2, 4, 6)",
    "std([2, 4, 6, 8])",
    'std([2, 4, 6, 8], "uncorrected")',
    'std([2, 4, 6, 8], "biased")',
    "std([1, 2, 3; 4, 5, 6])"
  ],
  seealso: ["max", "mean", "min", "median", "prod", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/cumsum.ts
var cumSumDocs = {
  name: "cumsum",
  category: "Statistics",
  syntax: ["cumsum(a, b, c, ...)", "cumsum(A)"],
  description: "Compute the cumulative sum of all values.",
  examples: [
    "cumsum(2, 3, 4, 1)",
    "cumsum([2, 3, 4, 1])",
    "cumsum([1, 2; 3, 4])",
    "cumsum([1, 2; 3, 4], 1)",
    "cumsum([1, 2; 3, 4], 2)"
  ],
  seealso: ["max", "mean", "median", "min", "prod", "std", "sum", "variance"]
};

// src/expression/embeddedDocs/function/statistics/sum.ts
var sumDocs = {
  name: "sum",
  category: "Statistics",
  syntax: ["sum(a, b, c, ...)", "sum(A)", "sum(A, dimension)"],
  description: "Compute the sum of all values.",
  examples: ["sum(2, 3, 4, 1)", "sum([2, 3, 4, 1])", "sum([2, 5; 4, 3])"],
  seealso: ["max", "mean", "median", "min", "prod", "std", "variance"]
};

// src/expression/embeddedDocs/function/statistics/variance.ts
var varianceDocs = {
  name: "variance",
  category: "Statistics",
  syntax: [
    "variance(a, b, c, ...)",
    "variance(A)",
    "variance(A, dimension)",
    "variance(A, normalization)",
    "variance(A, dimension, normalization)"
  ],
  description: 'Compute the variance of all values. Optional parameter normalization can be "unbiased" (default), "uncorrected", or "biased".',
  examples: [
    "variance(2, 4, 6)",
    "variance([2, 4, 6, 8])",
    'variance([2, 4, 6, 8], "uncorrected")',
    'variance([2, 4, 6, 8], "biased")',
    "variance([1, 2, 3; 4, 5, 6])"
  ],
  seealso: ["max", "mean", "min", "median", "min", "prod", "std", "sum"]
};

// src/expression/embeddedDocs/function/statistics/corr.ts
var corrDocs = {
  name: "corr",
  category: "Statistics",
  syntax: ["corr(A,B)"],
  description: "Compute the correlation coefficient of a two list with values, For matrices, the matrix correlation coefficient is calculated.",
  examples: [
    "corr([2, 4, 6, 8],[1, 2, 3, 6])",
    "corr(matrix([[1, 2.2, 3, 4.8, 5], [1, 2, 3, 4, 5]]), matrix([[4, 5.3, 6.6, 7, 8], [1, 2, 3, 4, 5]]))"
  ],
  seealso: ["max", "mean", "min", "median", "min", "prod", "std", "sum"]
};

// src/expression/embeddedDocs/function/trigonometry/acos.ts
var acosDocs = {
  name: "acos",
  category: "Trigonometry",
  syntax: ["acos(x)"],
  description: "Compute the inverse cosine of a value in radians.",
  examples: ["acos(0.5)", "acos(cos(2.3))"],
  seealso: ["cos", "atan", "asin"]
};

// src/expression/embeddedDocs/function/trigonometry/acosh.ts
var acoshDocs = {
  name: "acosh",
  category: "Trigonometry",
  syntax: ["acosh(x)"],
  description: "Calculate the hyperbolic arccos of a value, defined as `acosh(x) = ln(sqrt(x^2 - 1) + x)`.",
  examples: ["acosh(1.5)"],
  seealso: ["cosh", "asinh", "atanh"]
};

// src/expression/embeddedDocs/function/trigonometry/acot.ts
var acotDocs = {
  name: "acot",
  category: "Trigonometry",
  syntax: ["acot(x)"],
  description: "Calculate the inverse cotangent of a value.",
  examples: ["acot(0.5)", "acot(cot(0.5))", "acot(2)"],
  seealso: ["cot", "atan"]
};

// src/expression/embeddedDocs/function/trigonometry/acoth.ts
var acothDocs = {
  name: "acoth",
  category: "Trigonometry",
  syntax: ["acoth(x)"],
  description: "Calculate the inverse hyperbolic tangent of a value, defined as `acoth(x) = (ln((x+1)/x) + ln(x/(x-1))) / 2`.",
  examples: ["acoth(2)", "acoth(0.5)"],
  seealso: ["acsch", "asech"]
};

// src/expression/embeddedDocs/function/trigonometry/acsc.ts
var acscDocs = {
  name: "acsc",
  category: "Trigonometry",
  syntax: ["acsc(x)"],
  description: "Calculate the inverse cotangent of a value.",
  examples: ["acsc(2)", "acsc(csc(0.5))", "acsc(0.5)"],
  seealso: ["csc", "asin", "asec"]
};

// src/expression/embeddedDocs/function/trigonometry/acsch.ts
var acschDocs = {
  name: "acsch",
  category: "Trigonometry",
  syntax: ["acsch(x)"],
  description: "Calculate the inverse hyperbolic cosecant of a value, defined as `acsch(x) = ln(1/x + sqrt(1/x^2 + 1))`.",
  examples: ["acsch(0.5)"],
  seealso: ["asech", "acoth"]
};

// src/expression/embeddedDocs/function/trigonometry/asec.ts
var asecDocs = {
  name: "asec",
  category: "Trigonometry",
  syntax: ["asec(x)"],
  description: "Calculate the inverse secant of a value.",
  examples: ["asec(0.5)", "asec(sec(0.5))", "asec(2)"],
  seealso: ["acos", "acot", "acsc"]
};

// src/expression/embeddedDocs/function/trigonometry/asech.ts
var asechDocs = {
  name: "asech",
  category: "Trigonometry",
  syntax: ["asech(x)"],
  description: "Calculate the inverse secant of a value.",
  examples: ["asech(0.5)"],
  seealso: ["acsch", "acoth"]
};

// src/expression/embeddedDocs/function/trigonometry/asin.ts
var asinDocs = {
  name: "asin",
  category: "Trigonometry",
  syntax: ["asin(x)"],
  description: "Compute the inverse sine of a value in radians.",
  examples: ["asin(0.5)", "asin(sin(0.5))"],
  seealso: ["sin", "acos", "atan"]
};

// src/expression/embeddedDocs/function/trigonometry/asinh.ts
var asinhDocs = {
  name: "asinh",
  category: "Trigonometry",
  syntax: ["asinh(x)"],
  description: "Calculate the hyperbolic arcsine of a value, defined as `asinh(x) = ln(x + sqrt(x^2 + 1))`.",
  examples: ["asinh(0.5)"],
  seealso: ["acosh", "atanh"]
};

// src/expression/embeddedDocs/function/trigonometry/atan.ts
var atanDocs = {
  name: "atan",
  category: "Trigonometry",
  syntax: ["atan(x)"],
  description: "Compute the inverse tangent of a value in radians.",
  examples: ["atan(0.5)", "atan(tan(0.5))"],
  seealso: ["tan", "acos", "asin"]
};

// src/expression/embeddedDocs/function/trigonometry/atan2.ts
var atan2Docs = {
  name: "atan2",
  category: "Trigonometry",
  syntax: ["atan2(y, x)"],
  description: "Computes the principal value of the arc tangent of y/x in radians.",
  examples: [
    "atan2(2, 2) / pi",
    "angle = 60 deg in rad",
    "x = cos(angle)",
    "y = sin(angle)",
    "atan2(y, x)"
  ],
  seealso: ["sin", "cos", "tan"]
};

// src/expression/embeddedDocs/function/trigonometry/atanh.ts
var atanhDocs = {
  name: "atanh",
  category: "Trigonometry",
  syntax: ["atanh(x)"],
  description: "Calculate the hyperbolic arctangent of a value, defined as `atanh(x) = ln((1 + x)/(1 - x)) / 2`.",
  examples: ["atanh(0.5)"],
  seealso: ["acosh", "asinh"]
};

// src/expression/embeddedDocs/function/trigonometry/cos.ts
var cosDocs = {
  name: "cos",
  category: "Trigonometry",
  syntax: ["cos(x)"],
  description: "Compute the cosine of x in radians.",
  examples: [
    "cos(2)",
    "cos(pi / 4) ^ 2",
    "cos(180 deg)",
    "cos(60 deg)",
    "sin(0.2)^2 + cos(0.2)^2"
  ],
  seealso: ["acos", "sin", "tan"]
};

// src/expression/embeddedDocs/function/trigonometry/cosh.ts
var coshDocs = {
  name: "cosh",
  category: "Trigonometry",
  syntax: ["cosh(x)"],
  description: "Compute the hyperbolic cosine of x in radians.",
  examples: ["cosh(0.5)"],
  seealso: ["sinh", "tanh", "coth"]
};

// src/expression/embeddedDocs/function/trigonometry/cot.ts
var cotDocs = {
  name: "cot",
  category: "Trigonometry",
  syntax: ["cot(x)"],
  description: "Compute the cotangent of x in radians. Defined as 1/tan(x)",
  examples: ["cot(2)", "1 / tan(2)"],
  seealso: ["sec", "csc", "tan"]
};

// src/expression/embeddedDocs/function/trigonometry/coth.ts
var cothDocs = {
  name: "coth",
  category: "Trigonometry",
  syntax: ["coth(x)"],
  description: "Compute the hyperbolic cotangent of x in radians.",
  examples: ["coth(2)", "1 / tanh(2)"],
  seealso: ["sech", "csch", "tanh"]
};

// src/expression/embeddedDocs/function/trigonometry/csc.ts
var cscDocs = {
  name: "csc",
  category: "Trigonometry",
  syntax: ["csc(x)"],
  description: "Compute the cosecant of x in radians. Defined as 1/sin(x)",
  examples: ["csc(2)", "1 / sin(2)"],
  seealso: ["sec", "cot", "sin"]
};

// src/expression/embeddedDocs/function/trigonometry/csch.ts
var cschDocs = {
  name: "csch",
  category: "Trigonometry",
  syntax: ["csch(x)"],
  description: "Compute the hyperbolic cosecant of x in radians. Defined as 1/sinh(x)",
  examples: ["csch(2)", "1 / sinh(2)"],
  seealso: ["sech", "coth", "sinh"]
};

// src/expression/embeddedDocs/function/trigonometry/sec.ts
var secDocs = {
  name: "sec",
  category: "Trigonometry",
  syntax: ["sec(x)"],
  description: "Compute the secant of x in radians. Defined as 1/cos(x)",
  examples: ["sec(2)", "1 / cos(2)"],
  seealso: ["cot", "csc", "cos"]
};

// src/expression/embeddedDocs/function/trigonometry/sech.ts
var sechDocs = {
  name: "sech",
  category: "Trigonometry",
  syntax: ["sech(x)"],
  description: "Compute the hyperbolic secant of x in radians. Defined as 1/cosh(x)",
  examples: ["sech(2)", "1 / cosh(2)"],
  seealso: ["coth", "csch", "cosh"]
};

// src/expression/embeddedDocs/function/trigonometry/sin.ts
var sinDocs = {
  name: "sin",
  category: "Trigonometry",
  syntax: ["sin(x)"],
  description: "Compute the sine of x in radians.",
  examples: [
    "sin(2)",
    "sin(pi / 4) ^ 2",
    "sin(90 deg)",
    "sin(30 deg)",
    "sin(0.2)^2 + cos(0.2)^2"
  ],
  seealso: ["asin", "cos", "tan"]
};

// src/expression/embeddedDocs/function/trigonometry/sinh.ts
var sinhDocs = {
  name: "sinh",
  category: "Trigonometry",
  syntax: ["sinh(x)"],
  description: "Compute the hyperbolic sine of x in radians.",
  examples: ["sinh(0.5)"],
  seealso: ["cosh", "tanh"]
};

// src/expression/embeddedDocs/function/trigonometry/tan.ts
var tanDocs = {
  name: "tan",
  category: "Trigonometry",
  syntax: ["tan(x)"],
  description: "Compute the tangent of x in radians.",
  examples: ["tan(0.5)", "sin(0.5) / cos(0.5)", "tan(pi / 4)", "tan(45 deg)"],
  seealso: ["atan", "sin", "cos"]
};

// src/expression/embeddedDocs/function/trigonometry/tanh.ts
var tanhDocs = {
  name: "tanh",
  category: "Trigonometry",
  syntax: ["tanh(x)"],
  description: "Compute the hyperbolic tangent of x in radians.",
  examples: ["tanh(0.5)", "sinh(0.5) / cosh(0.5)"],
  seealso: ["sinh", "cosh"]
};

// src/expression/embeddedDocs/function/units/to.ts
var toDocs = {
  name: "to",
  category: "Units",
  syntax: ["x to unit", "to(x, unit)"],
  description: "Change the unit of a value.",
  examples: ["5 inch to cm", "3.2kg to g", "16 bytes in bits"],
  seealso: []
};

// src/expression/embeddedDocs/function/units/toBest.ts
var toBestDocs = {
  name: "toBest",
  category: "Units",
  syntax: ["toBest(x)", "toBest(x, unitList)", "toBest(x, unitList, options)"],
  description: "Converts to the most appropriate display unit.",
  examples: [
    'toBest(unit(5000, "m"))',
    'toBest(unit(3500000, "W"))',
    'toBest(unit(0.000000123, "A"))',
    'toBest(unit(10, "m"), "cm")',
    'toBest(unit(10, "m"), "mm,km", {offset: 1.5})'
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/utils/bin.ts
var binDocs = {
  name: "bin",
  category: "Utils",
  syntax: ["bin(value)"],
  description: "Format a number as binary",
  examples: ["bin(2)"],
  seealso: ["oct", "hex"]
};

// src/expression/embeddedDocs/function/utils/clone.ts
var cloneDocs = {
  name: "clone",
  category: "Utils",
  syntax: ["clone(x)"],
  description: "Clone a variable. Creates a copy of primitive variables, and a deep copy of matrices",
  examples: [
    "clone(3.5)",
    "clone(2 - 4i)",
    "clone(45 deg)",
    "clone([1, 2; 3, 4])",
    'clone("hello world")'
  ],
  seealso: []
};

// src/expression/embeddedDocs/function/utils/format.ts
var formatDocs = {
  name: "format",
  category: "Utils",
  syntax: ["format(value)", "format(value, precision)"],
  description: "Format a value of any type as string.",
  examples: ["format(2.3)", "format(3 - 4i)", "format([])", "format(pi, 3)"],
  seealso: ["print"]
};

// src/expression/embeddedDocs/function/utils/hasNumericValue.ts
var hasNumericValueDocs = {
  name: "hasNumericValue",
  category: "Utils",
  syntax: ["hasNumericValue(x)"],
  description: "Test whether a value is an numeric value. In case of a string, true is returned if the string contains a numeric value.",
  examples: [
    "hasNumericValue(2)",
    'hasNumericValue("2")',
    'isNumeric("2")',
    "hasNumericValue(0)",
    "hasNumericValue(bignumber(500))",
    "hasNumericValue(fraction(0.125))",
    "hasNumericValue(2 + 3i)",
    'hasNumericValue([2.3, "foo", false])'
  ],
  seealso: [
    "isInteger",
    "isZero",
    "isNegative",
    "isPositive",
    "isNaN",
    "isNumeric"
  ]
};

// src/expression/embeddedDocs/function/utils/hex.ts
var hexDocs = {
  name: "hex",
  category: "Utils",
  syntax: ["hex(value)"],
  description: "Format a number as hexadecimal",
  examples: ["hex(240)"],
  seealso: ["bin", "oct"]
};

// src/expression/embeddedDocs/function/utils/isInteger.ts
var isIntegerDocs = {
  name: "isInteger",
  category: "Utils",
  syntax: ["isInteger(x)"],
  description: "Test whether a value is an integer number.",
  examples: ["isInteger(2)", "isInteger(3.5)", "isInteger([3, 0.5, -2])"],
  seealso: ["isNegative", "isNumeric", "isPositive", "isZero"]
};

// src/expression/embeddedDocs/function/utils/isNaN.ts
var isNaNDocs = {
  name: "isNaN",
  category: "Utils",
  syntax: ["isNaN(x)"],
  description: "Test whether a value is NaN (not a number)",
  examples: ["isNaN(2)", "isNaN(0 / 0)", "isNaN(NaN)", "isNaN(Infinity)"],
  seealso: [
    "isNegative",
    "isNumeric",
    "isPositive",
    "isZero",
    "isFinite",
    "isBounded"
  ]
};

// src/expression/embeddedDocs/function/utils/isBounded.ts
var isBoundedDocs = {
  name: "isBounded",
  category: "Utils",
  syntax: ["isBounded(x)"],
  description: "Test whether a value or its entries are bounded.",
  examples: [
    "isBounded(Infinity)",
    "isBounded(bigint(3))",
    "isBounded([3, -Infinity, -3])"
  ],
  seealso: ["isFinite", "isNumeric", "isNaN", "isNegative", "isPositive"]
};

// src/expression/embeddedDocs/function/utils/isFinite.ts
var isFiniteDocs = {
  name: "isFinite",
  category: "Utils",
  syntax: ["isFinite(x)"],
  description: "Test whether a value is finite, elementwise on collections.",
  examples: [
    "isFinite(Infinity)",
    "isFinite(bigint(3))",
    "isFinite([3, -Infinity, -3])"
  ],
  seealso: ["isBounded", "isNumeric", "isNaN", "isNegative", "isPositive"]
};

// src/expression/embeddedDocs/function/utils/isNegative.ts
var isNegativeDocs = {
  name: "isNegative",
  category: "Utils",
  syntax: ["isNegative(x)"],
  description: "Test whether a value is negative: smaller than zero.",
  examples: [
    "isNegative(2)",
    "isNegative(0)",
    "isNegative(-4)",
    "isNegative([3, 0.5, -2])"
  ],
  seealso: ["isInteger", "isNumeric", "isPositive", "isZero"]
};

// src/expression/embeddedDocs/function/utils/isNumeric.ts
var isNumericDocs = {
  name: "isNumeric",
  category: "Utils",
  syntax: ["isNumeric(x)"],
  description: "Test whether a value is a numeric value. Returns true when the input is a number, BigNumber, Fraction, or boolean.",
  examples: [
    "isNumeric(2)",
    'isNumeric("2")',
    'hasNumericValue("2")',
    "isNumeric(0)",
    "isNumeric(bignumber(500))",
    "isNumeric(fraction(0.125))",
    "isNumeric(2 + 3i)",
    'isNumeric([2.3, "foo", false])'
  ],
  seealso: [
    "isInteger",
    "isZero",
    "isNegative",
    "isPositive",
    "isNaN",
    "hasNumericValue",
    "isFinite",
    "isBounded"
  ]
};

// src/expression/embeddedDocs/function/utils/isPositive.ts
var isPositiveDocs = {
  name: "isPositive",
  category: "Utils",
  syntax: ["isPositive(x)"],
  description: "Test whether a value is positive: larger than zero.",
  examples: [
    "isPositive(2)",
    "isPositive(0)",
    "isPositive(-4)",
    "isPositive([3, 0.5, -2])"
  ],
  seealso: ["isInteger", "isNumeric", "isNegative", "isZero"]
};

// src/expression/embeddedDocs/function/utils/isPrime.ts
var isPrimeDocs = {
  name: "isPrime",
  category: "Utils",
  syntax: ["isPrime(x)"],
  description: "Test whether a value is prime: has no divisors other than itself and one.",
  examples: ["isPrime(3)", "isPrime(-2)", "isPrime([2, 17, 100])"],
  seealso: ["isInteger", "isNumeric", "isNegative", "isZero"]
};

// src/expression/embeddedDocs/function/utils/isZero.ts
var isZeroDocs = {
  name: "isZero",
  category: "Utils",
  syntax: ["isZero(x)"],
  description: "Test whether a value is zero.",
  examples: ["isZero(2)", "isZero(0)", "isZero(-4)", "isZero([3, 0, -2, 0])"],
  seealso: ["isInteger", "isNumeric", "isNegative", "isPositive"]
};

// src/expression/embeddedDocs/function/utils/numeric.ts
var numericDocs = {
  name: "numeric",
  category: "Utils",
  syntax: ["numeric(x)"],
  description: "Convert a numeric input to a specific numeric type: number, BigNumber, bigint, or Fraction.",
  examples: [
    'numeric("4")',
    'numeric("4", "number")',
    'numeric("4", "bigint")',
    'numeric("4", "BigNumber")',
    'numeric("4", "Fraction")',
    'numeric(4, "Fraction")',
    'numeric(fraction(2, 5), "number")'
  ],
  seealso: ["number", "bigint", "fraction", "bignumber", "string", "format"]
};

// src/expression/embeddedDocs/function/utils/oct.ts
var octDocs = {
  name: "oct",
  category: "Utils",
  syntax: ["oct(value)"],
  description: "Format a number as octal",
  examples: ["oct(56)"],
  seealso: ["bin", "hex"]
};

// src/expression/embeddedDocs/function/utils/print.ts
var printDocs = {
  name: "print",
  category: "Utils",
  syntax: ["print(template, values)", "print(template, values, precision)"],
  description: "Interpolate values into a string template.",
  examples: [
    'print("Lucy is $age years old", {age: 5})',
    'print("The value of pi is $pi", {pi: pi}, 3)',
    'print("Hello, $user.name!", {user: {name: "John"}})',
    'print("Values: $1, $2, $3", [6, 9, 4])'
  ],
  seealso: ["format"]
};

// src/expression/embeddedDocs/function/utils/typeOf.ts
var typeOfDocs = {
  name: "typeOf",
  category: "Utils",
  syntax: ["typeOf(x)"],
  description: "Get the type of a variable.",
  examples: [
    "typeOf(3.5)",
    "typeOf(2 - 4i)",
    "typeOf(45 deg)",
    'typeOf("hello world")'
  ],
  seealso: ["getMatrixDataType"]
};

// src/expression/embeddedDocs/function/numeric/solveODE.ts
var solveODEDocs = {
  name: "solveODE",
  category: "Numeric",
  syntax: ["solveODE(func, tspan, y0)", "solveODE(func, tspan, y0, options)"],
  description: "Numerical Integration of Ordinary Differential Equations.",
  examples: [
    "f(t,y) = y",
    "tspan = [0, 4]",
    "solveODE(f, tspan, 1)",
    "solveODE(f, tspan, [1, 2])",
    'solveODE(f, tspan, 1, { method:"RK23", maxStep:0.1 })'
  ],
  seealso: ["derivative", "simplifyCore"]
};

// src/expression/embeddedDocs/embeddedDocs.ts
var embeddedDocs = {
  // construction functions
  bignumber: bignumberDocs,
  bigint: bigintDocs,
  boolean: booleanDocs,
  complex: complexDocs,
  createUnit: createUnitDocs,
  fraction: fractionDocs,
  index: indexDocs,
  matrix: matrixDocs,
  number: numberDocs,
  sparse: sparseDocs,
  splitUnit: splitUnitDocs,
  string: stringDocs,
  unit: unitDocs,
  // constants
  e: eDocs,
  E: eDocs,
  false: falseDocs,
  i: iDocs,
  Infinity: InfinityDocs,
  LN2: LN2Docs,
  LN10: LN10Docs,
  LOG2E: LOG2EDocs,
  LOG10E: LOG10EDocs,
  NaN: NaNDocs,
  null: nullDocs,
  pi: piDocs,
  PI: piDocs,
  phi: phiDocs,
  SQRT1_2: SQRT12Docs,
  SQRT2: SQRT2Docs,
  tau: tauDocs,
  true: trueDocs,
  version: versionDocs,
  // physical constants
  // TODO: more detailed docs for physical constants
  speedOfLight: {
    description: "Speed of light in vacuum",
    examples: ["speedOfLight"]
  },
  gravitationConstant: {
    description: "Newtonian constant of gravitation",
    examples: ["gravitationConstant"]
  },
  planckConstant: {
    description: "Planck constant",
    examples: ["planckConstant"]
  },
  reducedPlanckConstant: {
    description: "Reduced Planck constant",
    examples: ["reducedPlanckConstant"]
  },
  magneticConstant: {
    description: "Magnetic constant (vacuum permeability)",
    examples: ["magneticConstant"]
  },
  electricConstant: {
    description: "Electric constant (vacuum permeability)",
    examples: ["electricConstant"]
  },
  vacuumImpedance: {
    description: "Characteristic impedance of vacuum",
    examples: ["vacuumImpedance"]
  },
  coulomb: {
    description: "Coulomb's constant. Deprecated in favor of coulombConstant",
    examples: ["coulombConstant"]
  },
  coulombConstant: {
    description: "Coulomb's constant",
    examples: ["coulombConstant"]
  },
  elementaryCharge: {
    description: "Elementary charge",
    examples: ["elementaryCharge"]
  },
  bohrMagneton: { description: "Bohr magneton", examples: ["bohrMagneton"] },
  conductanceQuantum: {
    description: "Conductance quantum",
    examples: ["conductanceQuantum"]
  },
  inverseConductanceQuantum: {
    description: "Inverse conductance quantum",
    examples: ["inverseConductanceQuantum"]
  },
  // josephson: {description: 'Josephson constant', examples: ['josephson']},
  magneticFluxQuantum: {
    description: "Magnetic flux quantum",
    examples: ["magneticFluxQuantum"]
  },
  nuclearMagneton: {
    description: "Nuclear magneton",
    examples: ["nuclearMagneton"]
  },
  klitzing: { description: "Von Klitzing constant", examples: ["klitzing"] },
  bohrRadius: { description: "Bohr radius", examples: ["bohrRadius"] },
  classicalElectronRadius: {
    description: "Classical electron radius",
    examples: ["classicalElectronRadius"]
  },
  electronMass: { description: "Electron mass", examples: ["electronMass"] },
  fermiCoupling: {
    description: "Fermi coupling constant",
    examples: ["fermiCoupling"]
  },
  fineStructure: {
    description: "Fine-structure constant",
    examples: ["fineStructure"]
  },
  hartreeEnergy: { description: "Hartree energy", examples: ["hartreeEnergy"] },
  protonMass: { description: "Proton mass", examples: ["protonMass"] },
  deuteronMass: { description: "Deuteron Mass", examples: ["deuteronMass"] },
  neutronMass: { description: "Neutron mass", examples: ["neutronMass"] },
  quantumOfCirculation: {
    description: "Quantum of circulation",
    examples: ["quantumOfCirculation"]
  },
  rydberg: { description: "Rydberg constant", examples: ["rydberg"] },
  thomsonCrossSection: {
    description: "Thomson cross section",
    examples: ["thomsonCrossSection"]
  },
  weakMixingAngle: {
    description: "Weak mixing angle",
    examples: ["weakMixingAngle"]
  },
  efimovFactor: { description: "Efimov factor", examples: ["efimovFactor"] },
  atomicMass: { description: "Atomic mass constant", examples: ["atomicMass"] },
  avogadro: { description: "Avogadro's number", examples: ["avogadro"] },
  boltzmann: { description: "Boltzmann constant", examples: ["boltzmann"] },
  faraday: { description: "Faraday constant", examples: ["faraday"] },
  firstRadiation: {
    description: "First radiation constant",
    examples: ["firstRadiation"]
  },
  loschmidt: {
    description: "Loschmidt constant at T=273.15 K and p=101.325 kPa",
    examples: ["loschmidt"]
  },
  gasConstant: { description: "Gas constant", examples: ["gasConstant"] },
  molarPlanckConstant: {
    description: "Molar Planck constant",
    examples: ["molarPlanckConstant"]
  },
  molarVolume: {
    description: "Molar volume of an ideal gas at T=273.15 K and p=101.325 kPa",
    examples: ["molarVolume"]
  },
  sackurTetrode: {
    description: "Sackur-Tetrode constant at T=1 K and p=101.325 kPa",
    examples: ["sackurTetrode"]
  },
  secondRadiation: {
    description: "Second radiation constant",
    examples: ["secondRadiation"]
  },
  stefanBoltzmann: {
    description: "Stefan-Boltzmann constant",
    examples: ["stefanBoltzmann"]
  },
  wienDisplacement: {
    description: "Wien displacement law constant",
    examples: ["wienDisplacement"]
  },
  // spectralRadiance: {description: 'First radiation constant for spectral radiance', examples: ['spectralRadiance']},
  molarMass: { description: "Molar mass constant", examples: ["molarMass"] },
  molarMassC12: {
    description: "Molar mass constant of carbon-12",
    examples: ["molarMassC12"]
  },
  gravity: {
    description: "Standard acceleration of gravity (standard acceleration of free-fall on Earth)",
    examples: ["gravity"]
  },
  planckLength: { description: "Planck length", examples: ["planckLength"] },
  planckMass: { description: "Planck mass", examples: ["planckMass"] },
  planckTime: { description: "Planck time", examples: ["planckTime"] },
  planckCharge: { description: "Planck charge", examples: ["planckCharge"] },
  planckTemperature: {
    description: "Planck temperature",
    examples: ["planckTemperature"]
  },
  // functions - algebra
  derivative: derivativeDocs,
  lsolve: lsolveDocs,
  lsolveAll: lsolveAllDocs,
  lup: lupDocs,
  lusolve: lusolveDocs,
  leafCount: leafCountDocs,
  polynomialRoot: polynomialRootDocs,
  resolve: resolveDocs,
  simplify: simplifyDocs,
  simplifyConstant: simplifyConstantDocs,
  simplifyCore: simplifyCoreDocs,
  symbolicEqual: symbolicEqualDocs,
  rationalize: rationalizeDocs,
  slu: sluDocs,
  usolve: usolveDocs,
  usolveAll: usolveAllDocs,
  qr: qrDocs,
  // functions - arithmetic
  abs: absDocs,
  add: addDocs,
  cbrt: cbrtDocs,
  ceil: ceilDocs,
  cube: cubeDocs,
  divide: divideDocs,
  dotDivide: dotDivideDocs,
  dotMultiply: dotMultiplyDocs,
  dotPow: dotPowDocs,
  exp: expDocs,
  expm: expmDocs,
  expm1: expm1Docs,
  fix: fixDocs,
  floor: floorDocs,
  gcd: gcdDocs,
  hypot: hypotDocs,
  lcm: lcmDocs,
  log: logDocs,
  log2: log2Docs,
  log1p: log1pDocs,
  log10: log10Docs,
  mod: modDocs,
  multiply: multiplyDocs,
  norm: normDocs,
  nthRoot: nthRootDocs,
  nthRoots: nthRootsDocs,
  pow: powDocs,
  round: roundDocs,
  sign: signDocs,
  sqrt: sqrtDocs,
  sqrtm: sqrtmDocs,
  square: squareDocs,
  subtract: subtractDocs,
  unaryMinus: unaryMinusDocs,
  unaryPlus: unaryPlusDocs,
  xgcd: xgcdDocs,
  invmod: invmodDocs,
  // functions - bitwise
  bitAnd: bitAndDocs,
  bitNot: bitNotDocs,
  bitOr: bitOrDocs,
  bitXor: bitXorDocs,
  leftShift: leftShiftDocs,
  rightArithShift: rightArithShiftDocs,
  rightLogShift: rightLogShiftDocs,
  // functions - combinatorics
  bellNumbers: bellNumbersDocs,
  catalan: catalanDocs,
  composition: compositionDocs,
  stirlingS2: stirlingS2Docs,
  // functions - core
  config: configDocs,
  import: importDocs,
  typed: typedDocs,
  // functions - complex
  arg: argDocs,
  conj: conjDocs,
  re: reDocs,
  im: imDocs,
  // functions - expression
  evaluate: evaluateDocs,
  help: helpDocs,
  parse: parseDocs,
  parser: parserDocs,
  compile: compileDocs,
  // functions - geometry
  distance: distanceDocs,
  intersect: intersectDocs,
  // functions - logical
  and: andDocs,
  not: notDocs,
  nullish: nullishDocs,
  or: orDocs,
  xor: xorDocs,
  // functions - matrix
  mapSlices: mapSlicesDocs,
  concat: concatDocs,
  count: countDocs,
  cross: crossDocs,
  column: columnDocs,
  ctranspose: ctransposeDocs,
  det: detDocs,
  diag: diagDocs,
  diff: diffDocs,
  dot: dotDocs,
  getMatrixDataType: getMatrixDataTypeDocs,
  identity: identityDocs,
  filter: filterDocs,
  flatten: flattenDocs,
  forEach: forEachDocs,
  inv: invDocs,
  pinv: pinvDocs,
  eigs: eigsDocs,
  kron: kronDocs,
  matrixFromFunction: matrixFromFunctionDocs,
  matrixFromRows: matrixFromRowsDocs,
  matrixFromColumns: matrixFromColumnsDocs,
  map: mapDocs,
  ones: onesDocs,
  partitionSelect: partitionSelectDocs,
  range: rangeDocs,
  resize: resizeDocs,
  reshape: reshapeDocs,
  rotate: rotateDocs,
  rotationMatrix: rotationMatrixDocs,
  row: rowDocs,
  size: sizeDocs,
  sort: sortDocs,
  squeeze: squeezeDocs,
  subset: subsetDocs,
  trace: traceDocs,
  transpose: transposeDocs,
  zeros: zerosDocs,
  fft: fftDocs,
  ifft: ifftDocs,
  sylvester: sylvesterDocs,
  schur: schurDocs,
  lyap: lyapDocs,
  // functions - numeric
  solveODE: solveODEDocs,
  // functions - probability
  bernoulli: bernoulliDocs,
  combinations: combinationsDocs,
  combinationsWithRep: combinationsWithRepDocs,
  // distribution: distributionDocs,
  factorial: factorialDocs,
  gamma: gammaDocs,
  kldivergence: kldivergenceDocs,
  lgamma: lgammaDocs,
  multinomial: multinomialDocs,
  permutations: permutationsDocs,
  pickRandom: pickRandomDocs,
  random: randomDocs,
  randomInt: randomIntDocs,
  // functions - relational
  compare: compareDocs,
  compareNatural: compareNaturalDocs,
  compareText: compareTextDocs,
  deepEqual: deepEqualDocs,
  equal: equalDocs,
  equalText: equalTextDocs,
  larger: largerDocs,
  largerEq: largerEqDocs,
  smaller: smallerDocs,
  smallerEq: smallerEqDocs,
  unequal: unequalDocs,
  // functions - set
  setCartesian: setCartesianDocs,
  setDifference: setDifferenceDocs,
  setDistinct: setDistinctDocs,
  setIntersect: setIntersectDocs,
  setIsSubset: setIsSubsetDocs,
  setMultiplicity: setMultiplicityDocs,
  setPowerset: setPowersetDocs,
  setSize: setSizeDocs,
  setSymDifference: setSymDifferenceDocs,
  setUnion: setUnionDocs,
  // functions - signal
  zpk2tf: zpk2tfDocs,
  freqz: freqzDocs,
  // functions - special
  erf: erfDocs,
  zeta: zetaDocs,
  // functions - statistics
  cumsum: cumSumDocs,
  mad: madDocs,
  max: maxDocs,
  mean: meanDocs,
  median: medianDocs,
  min: minDocs,
  mode: modeDocs,
  prod: prodDocs,
  quantileSeq: quantileSeqDocs,
  std: stdDocs,
  sum: sumDocs,
  variance: varianceDocs,
  corr: corrDocs,
  // functions - trigonometry
  acos: acosDocs,
  acosh: acoshDocs,
  acot: acotDocs,
  acoth: acothDocs,
  acsc: acscDocs,
  acsch: acschDocs,
  asec: asecDocs,
  asech: asechDocs,
  asin: asinDocs,
  asinh: asinhDocs,
  atan: atanDocs,
  atanh: atanhDocs,
  atan2: atan2Docs,
  cos: cosDocs,
  cosh: coshDocs,
  cot: cotDocs,
  coth: cothDocs,
  csc: cscDocs,
  csch: cschDocs,
  sec: secDocs,
  sech: sechDocs,
  sin: sinDocs,
  sinh: sinhDocs,
  tan: tanDocs,
  tanh: tanhDocs,
  // functions - units
  to: toDocs,
  toBest: toBestDocs,
  // functions - utils
  clone: cloneDocs,
  format: formatDocs,
  bin: binDocs,
  oct: octDocs,
  hex: hexDocs,
  isNaN: isNaNDocs,
  isBounded: isBoundedDocs,
  isFinite: isFiniteDocs,
  isInteger: isIntegerDocs,
  isNegative: isNegativeDocs,
  isNumeric: isNumericDocs,
  hasNumericValue: hasNumericValueDocs,
  isPositive: isPositiveDocs,
  isPrime: isPrimeDocs,
  isZero: isZeroDocs,
  print: printDocs,
  typeOf: typeOfDocs,
  numeric: numericDocs
};

// src/expression/function/help.ts
var name5 = "help";
var dependencies6 = ["typed", "mathWithTransform", "Help"];
var createHelp = /* @__PURE__ */ factory(
  name5,
  dependencies6,
  ({
    typed: typed2,
    mathWithTransform,
    Help
  }) => {
    return typed2(name5, {
      any: function(search) {
        let prop;
        let searchName = search;
        if (typeof search !== "string") {
          for (prop in mathWithTransform) {
            if (hasOwnProperty(mathWithTransform, prop) && search === mathWithTransform[prop]) {
              searchName = prop;
              break;
            }
          }
        }
        const doc = getSafeProperty(embeddedDocs, searchName);
        if (!doc) {
          const searchText = typeof searchName === "function" ? searchName.name : searchName;
          throw new Error('No documentation found on "' + searchText + '"');
        }
        return new Help(doc);
      }
    });
  }
);

// src/type/chain/function/chain.ts
var name6 = "chain";
var dependencies7 = ["typed", "Chain"];
var createChain = /* @__PURE__ */ factory(
  name6,
  dependencies7,
  ({ typed: typed2, Chain }) => {
    return typed2(name6, {
      "": function() {
        return new Chain();
      },
      any: function(value) {
        return new Chain(value);
      }
    });
  }
);

// src/function/algebra/resolve.ts
var name7 = "resolve";
var dependencies8 = [
  "typed",
  "parse",
  "ConstantNode",
  "FunctionNode",
  "OperatorNode",
  "ParenthesisNode"
];
var createResolve = /* @__PURE__ */ factory(
  name7,
  dependencies8,
  ({
    typed: typed2,
    parse,
    ConstantNode,
    FunctionNode,
    OperatorNode,
    ParenthesisNode
  }) => {
    function _resolve(node, scope, within = /* @__PURE__ */ new Set()) {
      if (!scope) {
        return node;
      }
      if (isSymbolNode(node)) {
        if (within.has(node.name)) {
          const variables = Array.from(within).join(", ");
          throw new ReferenceError(
            `recursive loop of variable definitions among {${variables}}`
          );
        }
        const value = scope.get(node.name);
        if (isNode(value)) {
          const nextWithin = new Set(within);
          nextWithin.add(node.name);
          return _resolve(value, scope, nextWithin);
        } else if (typeof value === "number") {
          return parse(String(value));
        } else if (value !== void 0) {
          return new ConstantNode(value);
        } else {
          return node;
        }
      } else if (isOperatorNode(node)) {
        const args = node.args.map(function(arg) {
          return _resolve(arg, scope, within);
        });
        return new OperatorNode(
          node.op,
          node.fn,
          args,
          node.implicit
        );
      } else if (isParenthesisNode(node)) {
        return new ParenthesisNode(
          _resolve(node.content, scope, within)
        );
      } else if (isFunctionNode(node)) {
        const args = node.args.map(function(arg) {
          return _resolve(arg, scope, within);
        });
        return new FunctionNode(node.name, args);
      }
      return node.map((child) => _resolve(child, scope, within));
    }
    return typed2("resolve", {
      Node: _resolve,
      "Node, Map | null | undefined": _resolve,
      "Node, Object": (n, scope) => _resolve(n, createMap(scope)),
      // For arrays and matrices, we map `self` rather than `_resolve`
      // because resolve is fairly expensive anyway, and this way
      // we get nice error messages if one entry in the array has wrong type.
      "Array | Matrix": typed2.referToSelf(
        (self) => (A) => A.map((n) => self(n))
      ),
      "Array | Matrix, null | undefined": typed2.referToSelf(
        (self) => (A) => A.map((n) => self(n))
      ),
      "Array, Object": typed2.referTo(
        "Array,Map",
        (selfAM) => (A, scope) => selfAM(A, createMap(scope))
      ),
      "Matrix, Object": typed2.referTo(
        "Matrix,Map",
        (selfMM) => (A, scope) => selfMM(A, createMap(scope))
      ),
      "Array | Matrix, Map": typed2.referToSelf(
        (self) => (A, scope) => A.map((n) => self(n, scope))
      )
    });
  }
);

// src/function/algebra/simplify/wildcards.ts
function isNumericNode(x) {
  return isConstantNode(x) || isOperatorNode(x) && x.isUnary() && isConstantNode(x.args[0]);
}
function isConstantExpression(x) {
  if (isConstantNode(x)) {
    return true;
  }
  if ((isFunctionNode(x) || isOperatorNode(x)) && x.args.every(isConstantExpression)) {
    return true;
  }
  if (isParenthesisNode(x) && isConstantExpression(x.content)) {
    return true;
  }
  return false;
}

// src/function/algebra/simplify/util.ts
var name8 = "simplifyUtil";
var dependencies9 = ["FunctionNode", "OperatorNode", "SymbolNode"];
var createUtil = /* @__PURE__ */ factory(
  name8,
  dependencies9,
  ({
    FunctionNode,
    OperatorNode,
    SymbolNode
  }) => {
    const T = true;
    const F = false;
    const defaultName = "defaultF";
    const defaultContext = {
      /*      */
      add: { trivial: T, total: T, commutative: T, associative: T },
      /**/
      unaryPlus: { trivial: T, total: T, commutative: T, associative: T },
      /* */
      subtract: { trivial: F, total: T, commutative: F, associative: F },
      /* */
      multiply: { trivial: T, total: T, commutative: T, associative: T },
      /*   */
      divide: { trivial: F, total: T, commutative: F, associative: F },
      /*    */
      paren: { trivial: T, total: T, commutative: T, associative: F },
      /* */
      defaultF: { trivial: F, total: T, commutative: F, associative: F }
    };
    const realContext = {
      divide: { total: F },
      log: { total: F }
    };
    const positiveContext = {
      subtract: { total: F },
      abs: { trivial: T },
      log: { total: T }
    };
    function hasProperty(nodeOrName, property, context = defaultContext) {
      let name114 = defaultName;
      if (typeof nodeOrName === "string") {
        name114 = nodeOrName;
      } else if (isOperatorNode(nodeOrName)) {
        name114 = nodeOrName.fn.toString();
      } else if (isFunctionNode(nodeOrName)) {
        name114 = nodeOrName.name;
      } else if (isParenthesisNode(nodeOrName)) {
        name114 = "paren";
      }
      if (hasOwnProperty(context, name114)) {
        const properties2 = context[name114];
        if (hasOwnProperty(properties2, property)) {
          return properties2[property];
        }
        if (hasOwnProperty(defaultContext, name114)) {
          return defaultContext[name114][property];
        }
      }
      if (hasOwnProperty(context, defaultName)) {
        const properties2 = context[defaultName];
        if (hasOwnProperty(properties2, property)) {
          return properties2[property];
        }
        return defaultContext[defaultName][property];
      }
      if (hasOwnProperty(defaultContext, name114)) {
        const properties2 = defaultContext[name114];
        if (hasOwnProperty(properties2, property)) {
          return properties2[property];
        }
      }
      return defaultContext[defaultName][property];
    }
    function isCommutative(node, context = defaultContext) {
      return hasProperty(node, "commutative", context);
    }
    function isAssociative(node, context = defaultContext) {
      return hasProperty(node, "associative", context);
    }
    function mergeContext(primary, secondary) {
      const merged = { ...primary };
      for (const prop in secondary) {
        if (hasOwnProperty(primary, prop)) {
          merged[prop] = { ...secondary[prop], ...primary[prop] };
        } else {
          merged[prop] = secondary[prop];
        }
      }
      return merged;
    }
    function flatten2(node, context) {
      if (!node.args || node.args.length === 0) {
        return;
      }
      node.args = allChildren(node, context);
      for (let i = 0; i < node.args.length; i++) {
        flatten2(node.args[i], context);
      }
    }
    function allChildren(node, context) {
      let op;
      const children = [];
      const findChildren = function(node2) {
        for (let i = 0; i < (node2.args?.length ?? 0); i++) {
          const child = node2.args[i];
          if (isOperatorNode(child) && op === child.op) {
            findChildren(child);
          } else {
            children.push(child);
          }
        }
      };
      if (isAssociative(node, context)) {
        op = node.op;
        findChildren(node);
        return children;
      } else {
        return node.args ?? [];
      }
    }
    function unflattenr(node, context) {
      if (!node.args || node.args.length === 0) {
        return;
      }
      const makeNode = createMakeNodeFunction(node);
      const l = node.args.length;
      for (let i = 0; i < l; i++) {
        unflattenr(node.args[i], context);
      }
      if (l > 2 && isAssociative(node, context)) {
        let curnode = node.args.pop();
        while (node.args.length > 0) {
          curnode = makeNode([node.args.pop(), curnode]);
        }
        node.args = curnode.args;
      }
    }
    function unflattenl(node, context) {
      if (!node.args || node.args.length === 0) {
        return;
      }
      const makeNode = createMakeNodeFunction(node);
      const l = node.args.length;
      for (let i = 0; i < l; i++) {
        unflattenl(node.args[i], context);
      }
      if (l > 2 && isAssociative(node, context)) {
        let curnode = node.args.shift();
        while (node.args.length > 0) {
          curnode = makeNode([curnode, node.args.shift()]);
        }
        node.args = curnode.args;
      }
    }
    function createMakeNodeFunction(node) {
      if (isOperatorNode(node)) {
        return function(args) {
          try {
            return new OperatorNode(
              node.op,
              node.fn,
              args,
              node.implicit
            );
          } catch (err) {
            console.error(err);
            return [];
          }
        };
      } else {
        return function(args) {
          return new FunctionNode(new SymbolNode(node.name), args);
        };
      }
    }
    return {
      createMakeNodeFunction,
      hasProperty,
      isCommutative,
      isAssociative,
      mergeContext,
      flatten: flatten2,
      allChildren,
      unflattenr,
      unflattenl,
      defaultContext,
      realContext,
      positiveContext
    };
  }
);

// src/function/algebra/simplify.ts
var name9 = "simplify";
var dependencies10 = [
  "typed",
  "parse",
  "equal",
  "resolve",
  "simplifyConstant",
  "simplifyCore",
  "AccessorNode",
  "ArrayNode",
  "ConstantNode",
  "FunctionNode",
  "IndexNode",
  "ObjectNode",
  "OperatorNode",
  "ParenthesisNode",
  "SymbolNode",
  "replacer"
];
var createSimplify = /* @__PURE__ */ factory(
  name9,
  dependencies10,
  ({
    typed: typed2,
    parse,
    equal,
    resolve,
    simplifyConstant,
    simplifyCore,
    AccessorNode,
    ArrayNode,
    ConstantNode,
    FunctionNode,
    IndexNode,
    ObjectNode,
    OperatorNode,
    ParenthesisNode,
    SymbolNode,
    replacer
  }) => {
    const {
      hasProperty,
      isCommutative,
      isAssociative,
      mergeContext,
      flatten: flatten2,
      unflattenr,
      unflattenl,
      createMakeNodeFunction,
      defaultContext,
      realContext,
      positiveContext
    } = createUtil({ FunctionNode, OperatorNode, SymbolNode });
    typed2.addConversion({ from: "Object", to: "Map", convert: createMap });
    const simplify = typed2("simplify", {
      Node: _simplify,
      "Node, Map": (expr, scope) => _simplify(expr, false, scope),
      "Node, Map, Object": (expr, scope, options) => _simplify(expr, false, scope, options),
      "Node, Array": _simplify,
      "Node, Array, Map": _simplify,
      "Node, Array, Map, Object": _simplify
    });
    typed2.removeConversion({ from: "Object", to: "Map", convert: createMap });
    simplify.defaultContext = defaultContext;
    simplify.realContext = realContext;
    simplify.positiveContext = positiveContext;
    function removeParens(node) {
      return node.transform(function(node2) {
        return isParenthesisNode(node2) ? removeParens(node2.content) : node2;
      });
    }
    const SUPPORTED_CONSTANTS = {
      true: true,
      false: true,
      e: true,
      i: true,
      Infinity: true,
      LN2: true,
      LN10: true,
      LOG2E: true,
      LOG10E: true,
      NaN: true,
      phi: true,
      pi: true,
      SQRT1_2: true,
      SQRT2: true,
      tau: true
      // null: false,
      // undefined: false,
      // version: false,
    };
    simplify.rules = [
      simplifyCore,
      // { l: 'n+0', r: 'n' },     // simplifyCore
      // { l: 'n^0', r: '1' },     // simplifyCore
      // { l: '0*n', r: '0' },     // simplifyCore
      // { l: 'n/n', r: '1'},      // simplifyCore
      // { l: 'n^1', r: 'n' },     // simplifyCore
      // { l: '+n1', r:'n1' },     // simplifyCore
      // { l: 'n--n1', r:'n+n1' }, // simplifyCore
      { l: "log(e)", r: "1" },
      // temporary rules
      // Note initially we tend constants to the right because like-term
      // collection prefers the left, and we would rather collect nonconstants
      {
        s: "n-n1 -> n+-n1",
        // temporarily replace 'subtract' so we can further flatten the 'add' operator
        assuming: { subtract: { total: true } }
      },
      {
        s: "n-n -> 0",
        // partial alternative when we can't always subtract
        assuming: { subtract: { total: false } }
      },
      {
        s: "-(cl*v) -> v * (-cl)",
        // make non-constant terms positive
        assuming: { multiply: { commutative: true }, subtract: { total: true } }
      },
      {
        s: "-(cl*v) -> (-cl) * v",
        // non-commutative version, part 1
        assuming: {
          multiply: { commutative: false },
          subtract: { total: true }
        }
      },
      {
        s: "-(v*cl) -> v * (-cl)",
        // non-commutative version, part 2
        assuming: {
          multiply: { commutative: false },
          subtract: { total: true }
        }
      },
      { l: "-(n1/n2)", r: "-n1/n2" },
      { l: "-v", r: "v * (-1)" },
      // finish making non-constant terms positive
      { l: "(n1 + n2)*(-1)", r: "n1*(-1) + n2*(-1)", repeat: true },
      // expand negations to achieve as much sign cancellation as possible
      { l: "n/n1^n2", r: "n*n1^-n2" },
      // temporarily replace 'divide' so we can further flatten the 'multiply' operator
      { l: "n/n1", r: "n*n1^-1" },
      {
        s: "(n1*n2)^n3 -> n1^n3 * n2^n3",
        assuming: { multiply: { commutative: true } }
      },
      {
        s: "(n1*n2)^(-1) -> n2^(-1) * n1^(-1)",
        assuming: { multiply: { commutative: false } }
      },
      // expand nested exponentiation
      {
        s: "(n ^ n1) ^ n2 -> n ^ (n1 * n2)",
        assuming: { divide: { total: true } }
        // 1/(1/n) = n needs 1/n to exist
      },
      // collect like factors; into a sum, only do this for nonconstants
      { l: " vd   * ( vd   * n1 + n2)", r: "vd^2       * n1 +  vd   * n2" },
      {
        s: " vd   * (vd^n4 * n1 + n2)   ->  vd^(1+n4)  * n1 +  vd   * n2",
        assuming: { divide: { total: true } }
        // v*1/v = v^(1+-1) needs 1/v
      },
      {
        s: "vd^n3 * ( vd   * n1 + n2)   ->  vd^(n3+1)  * n1 + vd^n3 * n2",
        assuming: { divide: { total: true } }
      },
      {
        s: "vd^n3 * (vd^n4 * n1 + n2)   ->  vd^(n3+n4) * n1 + vd^n3 * n2",
        assuming: { divide: { total: true } }
      },
      { l: "n*n", r: "n^2" },
      {
        s: "n * n^n1 -> n^(n1+1)",
        assuming: { divide: { total: true } }
        // n*1/n = n^(-1+1) needs 1/n
      },
      {
        s: "n^n1 * n^n2 -> n^(n1+n2)",
        assuming: { divide: { total: true } }
        // ditto for n^2*1/n^2
      },
      // Unfortunately, to deal with more complicated cancellations, it
      // becomes necessary to simplify constants twice per pass. It's not
      // terribly expensive compared to matching rules, so this should not
      // pose a performance problem.
      simplifyConstant,
      // First: before collecting like terms
      // collect like terms
      {
        s: "n+n -> 2*n",
        assuming: { add: { total: true } }
        // 2 = 1 + 1 needs to exist
      },
      { l: "n+-n", r: "0" },
      { l: "vd*n + vd", r: "vd*(n+1)" },
      // NOTE: leftmost position is special:
      { l: "n3*n1 + n3*n2", r: "n3*(n1+n2)" },
      // All sub-monomials tried there.
      { l: "n3^(-n4)*n1 +   n3  * n2", r: "n3^(-n4)*(n1 + n3^(n4+1) *n2)" },
      { l: "n3^(-n4)*n1 + n3^n5 * n2", r: "n3^(-n4)*(n1 + n3^(n4+n5)*n2)" },
      // noncommutative additional cases (term collection & factoring)
      {
        s: "n*vd + vd -> (n+1)*vd",
        assuming: { multiply: { commutative: false } }
      },
      {
        s: "vd + n*vd -> (1+n)*vd",
        assuming: { multiply: { commutative: false } }
      },
      {
        s: "n1*n3 + n2*n3 -> (n1+n2)*n3",
        assuming: { multiply: { commutative: false } }
      },
      {
        s: "n^n1 * n -> n^(n1+1)",
        assuming: { divide: { total: true }, multiply: { commutative: false } }
      },
      {
        s: "n1*n3^(-n4) + n2 * n3    -> (n1 + n2*n3^(n4 +  1))*n3^(-n4)",
        assuming: { multiply: { commutative: false } }
      },
      {
        s: "n1*n3^(-n4) + n2 * n3^n5 -> (n1 + n2*n3^(n4 + n5))*n3^(-n4)",
        assuming: { multiply: { commutative: false } }
      },
      { l: "n*cd + cd", r: "(n+1)*cd" },
      {
        s: "cd*n + cd -> cd*(n+1)",
        assuming: { multiply: { commutative: false } }
      },
      {
        s: "cd + cd*n -> cd*(1+n)",
        assuming: { multiply: { commutative: false } }
      },
      simplifyConstant,
      // Second: before returning expressions to "standard form"
      // make factors positive (and undo 'make non-constant terms positive')
      {
        s: "(-n)*n1 -> -(n*n1)",
        assuming: { subtract: { total: true } }
      },
      {
        s: "n1*(-n) -> -(n1*n)",
        // in case * non-commutative
        assuming: {
          subtract: { total: true },
          multiply: { commutative: false }
        }
      },
      // final ordering of constants
      {
        s: "ce+ve -> ve+ce",
        assuming: { add: { commutative: true } },
        imposeContext: { add: { commutative: false } }
      },
      {
        s: "vd*cd -> cd*vd",
        assuming: { multiply: { commutative: true } },
        imposeContext: { multiply: { commutative: false } }
      },
      // undo temporary rules
      // { l: '(-1) * n', r: '-n' }, // #811 added test which proved this is redundant
      { l: "n+-n1", r: "n-n1" },
      // undo replace 'subtract'
      { l: "n+-(n1)", r: "n-(n1)" },
      {
        s: "n*(n1^-1) -> n/n1",
        // undo replace 'divide'; for * commutative
        assuming: { multiply: { commutative: true } }
        // o.w. / not conventional
      },
      {
        s: "n*n1^-n2 -> n/n1^n2",
        assuming: { multiply: { commutative: true } }
        // o.w. / not conventional
      },
      {
        s: "n^-1 -> 1/n",
        assuming: { multiply: { commutative: true } }
        // o.w. / not conventional
      },
      { l: "n^1", r: "n" },
      // can be produced by power cancellation
      {
        s: "n*(n1/n2) -> (n*n1)/n2",
        // '*' before '/'
        assuming: { multiply: { associative: true } }
      },
      {
        s: "n-(n1+n2) -> n-n1-n2",
        // '-' before '+'
        assuming: { addition: { associative: true, commutative: true } }
      },
      // { l: '(n1/n2)/n3', r: 'n1/(n2*n3)' },
      // { l: '(n*n1)/(n*n2)', r: 'n1/n2' },
      // simplifyConstant can leave an extra factor of 1, which can always
      // be eliminated, since the identity always commutes
      { l: "1*n", r: "n", imposeContext: { multiply: { commutative: true } } },
      {
        s: "n1/(n2/n3) -> (n1*n3)/n2",
        assuming: { multiply: { associative: true } }
      },
      { l: "n1/(-n2)", r: "-n1/n2" }
    ];
    function _canonicalizeRule(ruleObject, context) {
      const newRule = {};
      if (ruleObject.s) {
        const lr = ruleObject.s.split("->");
        if (lr.length === 2) {
          newRule.l = lr[0];
          newRule.r = lr[1];
        } else {
          throw SyntaxError("Could not parse rule: " + ruleObject.s);
        }
      } else {
        newRule.l = ruleObject.l;
        newRule.r = ruleObject.r;
      }
      newRule.l = removeParens(parse(newRule.l));
      newRule.r = removeParens(parse(newRule.r));
      for (const prop of ["imposeContext", "repeat", "assuming"]) {
        if (prop in ruleObject) {
          newRule[prop] = ruleObject[prop];
        }
      }
      if (ruleObject.evaluate) {
        newRule.evaluate = parse(ruleObject.evaluate);
      }
      if (isAssociative(newRule.l, context)) {
        const nonCommutative = !isCommutative(newRule.l, context);
        let leftExpandsym;
        if (nonCommutative) leftExpandsym = _getExpandPlaceholderSymbol();
        const makeNode = createMakeNodeFunction(newRule.l);
        const expandsym = _getExpandPlaceholderSymbol();
        newRule.expanded = {};
        newRule.expanded.l = makeNode([newRule.l, expandsym]);
        flatten2(newRule.expanded.l, context);
        unflattenr(newRule.expanded.l, context);
        newRule.expanded.r = makeNode([newRule.r, expandsym]);
        if (nonCommutative) {
          newRule.expandedNC1 = {};
          newRule.expandedNC1.l = makeNode([leftExpandsym, newRule.l]);
          newRule.expandedNC1.r = makeNode([leftExpandsym, newRule.r]);
          newRule.expandedNC2 = {};
          newRule.expandedNC2.l = makeNode([leftExpandsym, newRule.expanded.l]);
          newRule.expandedNC2.r = makeNode([leftExpandsym, newRule.expanded.r]);
        }
      }
      return newRule;
    }
    function _buildRules(rules, context) {
      const ruleSet = [];
      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        let newRule;
        const ruleType = typeof rule;
        switch (ruleType) {
          case "string":
            rule = { s: rule };
          /* falls through */
          case "object":
            newRule = _canonicalizeRule(rule, context);
            break;
          case "function":
            newRule = rule;
            break;
          default:
            throw TypeError("Unsupported type of rule: " + ruleType);
        }
        ruleSet.push(newRule);
      }
      return ruleSet;
    }
    let _lastsym = 0;
    function _getExpandPlaceholderSymbol() {
      return new SymbolNode("_p" + _lastsym++);
    }
    function _simplify(expr, rules, scope = createEmptyMap(), options = {}) {
      const debug = options.consoleDebug;
      rules = _buildRules(
        rules || simplify.rules,
        options.context
      );
      let res = resolve(expr, scope);
      res = removeParens(res);
      const visited = {};
      let str = res.toString({ parenthesis: "all" });
      while (!visited[str]) {
        visited[str] = true;
        _lastsym = 0;
        let laststr = str;
        if (debug) console.log("Working on: ", str);
        for (let i = 0; i < rules.length; i++) {
          let rulestr = "";
          if (typeof rules[i] === "function") {
            res = rules[i](res, options);
            if (debug) rulestr = rules[i].name;
          } else {
            flatten2(res, options.context);
            res = applyRule(res, rules[i], options.context);
            if (debug) {
              rulestr = `${rules[i].l.toString()} -> ${rules[i].r.toString()}`;
            }
          }
          if (debug) {
            const newstr = res.toString({ parenthesis: "all" });
            if (newstr !== laststr) {
              console.log("Applying", rulestr, "produced", newstr);
              laststr = newstr;
            }
          }
          unflattenl(res, options.context);
        }
        str = res.toString({ parenthesis: "all" });
      }
      return res;
    }
    function mapRule(nodes, rule, context) {
      let resNodes = nodes;
      if (nodes) {
        for (let i = 0; i < nodes.length; ++i) {
          const newNode = applyRule(nodes[i], rule, context);
          if (newNode !== nodes[i]) {
            if (resNodes === nodes) {
              resNodes = nodes.slice();
            }
            resNodes[i] = newNode;
          }
        }
      }
      return resNodes;
    }
    function applyRule(node, rule, context) {
      if (rule.assuming) {
        for (const symbol in rule.assuming) {
          for (const property in rule.assuming[symbol]) {
            if (hasProperty(symbol, property, context) !== rule.assuming[symbol][property]) {
              return node;
            }
          }
        }
      }
      const mergedContext = mergeContext(rule.imposeContext, context);
      let res = node;
      if (res instanceof OperatorNode || res instanceof FunctionNode) {
        const newArgs = mapRule(res.args, rule, context);
        if (newArgs !== res.args) {
          res = res.clone();
          res.args = newArgs;
        }
      } else if (res instanceof ParenthesisNode) {
        if (res.content) {
          const newContent = applyRule(
            res.content,
            rule,
            context
          );
          if (newContent !== res.content) {
            res = new ParenthesisNode(newContent);
          }
        }
      } else if (res instanceof ArrayNode) {
        const newItems = mapRule(res.items, rule, context);
        if (newItems !== res.items) {
          res = new ArrayNode(newItems);
        }
      } else if (res instanceof AccessorNode) {
        let newObj = res.object;
        if (res.object) {
          newObj = applyRule(res.object, rule, context);
        }
        let newIndex = res.index;
        if (res.index) {
          newIndex = applyRule(
            res.index,
            rule,
            context
          );
        }
        if (newObj !== res.object || newIndex !== res.index) {
          res = new AccessorNode(newObj, newIndex);
        }
      } else if (res instanceof IndexNode) {
        const newDims = mapRule(res.dimensions, rule, context);
        if (newDims !== res.dimensions) {
          res = new IndexNode(newDims);
        }
      } else if (res instanceof ObjectNode) {
        let changed = false;
        const newProps = {};
        for (const prop in res.properties) {
          newProps[prop] = applyRule(
            res.properties[prop],
            rule,
            context
          );
          if (newProps[prop] !== res.properties[prop]) {
            changed = true;
          }
        }
        if (changed) {
          res = new ObjectNode(newProps);
        }
      }
      let repl = rule.r;
      let matches = _ruleMatch(rule.l, res, mergedContext)[0];
      if (!matches && rule.expanded) {
        repl = rule.expanded.r;
        matches = _ruleMatch(rule.expanded.l, res, mergedContext)[0];
      }
      if (!matches && rule.expandedNC1) {
        repl = rule.expandedNC1.r;
        matches = _ruleMatch(rule.expandedNC1.l, res, mergedContext)[0];
        if (!matches) {
          repl = rule.expandedNC2.r;
          matches = _ruleMatch(rule.expandedNC2.l, res, mergedContext)[0];
        }
      }
      if (matches) {
        const implicit = res.implicit;
        res = repl.clone();
        if (implicit && "implicit" in repl) {
          res.implicit = true;
        }
        res = res.transform(function(node2) {
          if (node2.isSymbolNode && hasOwnProperty(matches.placeholders, node2.name)) {
            return matches.placeholders[node2.name].clone();
          } else {
            return node2;
          }
        });
      }
      if (rule.repeat && res !== node) {
        res = applyRule(res, rule, context);
      }
      return res;
    }
    function getSplits(node, context) {
      const res = [];
      let right;
      let rightArgs;
      const makeNode = createMakeNodeFunction(node);
      if (isCommutative(node, context)) {
        for (let i = 0; i < node.args.length; i++) {
          rightArgs = node.args.slice(0);
          rightArgs.splice(i, 1);
          right = rightArgs.length === 1 ? rightArgs[0] : makeNode(rightArgs);
          res.push(makeNode([node.args[i], right]));
        }
      } else {
        for (let i = 1; i < node.args.length; i++) {
          let left = node.args[0];
          if (i > 1) {
            left = makeNode(node.args.slice(0, i));
          }
          rightArgs = node.args.slice(i);
          right = rightArgs.length === 1 ? rightArgs[0] : makeNode(rightArgs);
          res.push(makeNode([left, right]));
        }
      }
      return res;
    }
    function mergeMatch(match1, match2) {
      const res = { placeholders: {} };
      if (!match1.placeholders && !match2.placeholders) {
        return res;
      } else if (!match1.placeholders) {
        return match2;
      } else if (!match2.placeholders) {
        return match1;
      }
      for (const key in match1.placeholders) {
        if (hasOwnProperty(match1.placeholders, key)) {
          res.placeholders[key] = match1.placeholders[key];
          if (hasOwnProperty(match2.placeholders, key)) {
            if (!_exactMatch(match1.placeholders[key], match2.placeholders[key])) {
              return null;
            }
          }
        }
      }
      for (const key in match2.placeholders) {
        if (hasOwnProperty(match2.placeholders, key)) {
          res.placeholders[key] = match2.placeholders[key];
        }
      }
      return res;
    }
    function combineChildMatches(list1, list2) {
      const res = [];
      if (list1.length === 0 || list2.length === 0) {
        return res;
      }
      let merged;
      for (let i1 = 0; i1 < list1.length; i1++) {
        for (let i2 = 0; i2 < list2.length; i2++) {
          merged = mergeMatch(list1[i1], list2[i2]);
          if (merged) {
            res.push(merged);
          }
        }
      }
      return res;
    }
    function mergeChildMatches(childMatches) {
      if (childMatches.length === 0) {
        return childMatches;
      }
      const sets = childMatches.reduce(combineChildMatches);
      const uniqueSets = [];
      const unique = {};
      for (let i = 0; i < sets.length; i++) {
        const s = JSON.stringify(sets[i], replacer);
        if (!unique[s]) {
          unique[s] = true;
          uniqueSets.push(sets[i]);
        }
      }
      return uniqueSets;
    }
    function _ruleMatch(rule, node, context, isSplit) {
      let res = [{ placeholders: {} }];
      if (rule instanceof OperatorNode && node instanceof OperatorNode || rule instanceof FunctionNode && node instanceof FunctionNode) {
        if (rule instanceof OperatorNode) {
          if (rule.op !== node.op || rule.fn !== node.fn) {
            return [];
          }
        } else if (rule instanceof FunctionNode) {
          if (rule.name !== node.name) {
            return [];
          }
        }
        if (node.args.length === 1 && rule.args.length === 1 || !isAssociative(node, context) && node.args.length === rule.args.length || isSplit) {
          let childMatches = [];
          for (let i = 0; i < rule.args.length; i++) {
            const childMatch = _ruleMatch(
              rule.args[i],
              node.args[i],
              context
            );
            if (childMatch.length === 0) {
              break;
            }
            childMatches.push(childMatch);
          }
          if (childMatches.length !== rule.args.length) {
            if (!isCommutative(node, context) || // exact match in order needed
            rule.args.length === 1) {
              return [];
            }
            if (rule.args.length > 2) {
              throw new Error(
                "permuting >2 commutative non-associative rule arguments not yet implemented"
              );
            }
            const leftMatch = _ruleMatch(
              rule.args[0],
              node.args[1],
              context
            );
            if (leftMatch.length === 0) {
              return [];
            }
            const rightMatch = _ruleMatch(
              rule.args[1],
              node.args[0],
              context
            );
            if (rightMatch.length === 0) {
              return [];
            }
            childMatches = [leftMatch, rightMatch];
          }
          res = mergeChildMatches(childMatches);
        } else if (node.args.length >= 2 && rule.args.length === 2) {
          const splits = getSplits(node, context);
          let splitMatches = [];
          for (let i = 0; i < splits.length; i++) {
            const matchSet = _ruleMatch(rule, splits[i], context, true);
            splitMatches = splitMatches.concat(matchSet);
          }
          return splitMatches;
        } else if (rule.args.length > 2) {
          throw Error(
            "Unexpected non-binary associative function: " + rule.toString()
          );
        } else {
          return [];
        }
      } else if (rule instanceof SymbolNode) {
        if (rule.name.length === 0) {
          throw new Error("Symbol in rule has 0 length...!?");
        }
        if (SUPPORTED_CONSTANTS[rule.name]) {
          if (rule.name !== node.name) {
            return [];
          }
        } else {
          switch (rule.name[1] >= "a" && rule.name[1] <= "z" ? rule.name.substring(0, 2) : rule.name[0]) {
            case "n":
            case "_p":
              res[0].placeholders[rule.name] = node;
              break;
            case "c":
            case "cl":
              if (isConstantNode(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "v":
              if (!isConstantNode(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "vl":
              if (isSymbolNode(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "cd":
              if (isNumericNode(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "vd":
              if (!isNumericNode(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "ce":
              if (isConstantExpression(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            case "ve":
              if (!isConstantExpression(node)) {
                res[0].placeholders[rule.name] = node;
              } else {
                return [];
              }
              break;
            default:
              throw new Error(
                "Invalid symbol in rule: " + rule.name
              );
          }
        }
      } else if (rule instanceof ConstantNode) {
        if (!equal(rule.value, node.value)) {
          return [];
        }
      } else {
        return [];
      }
      return res;
    }
    function _exactMatch(p, q) {
      if (p instanceof ConstantNode && q instanceof ConstantNode) {
        if (!equal(p.value, q.value)) {
          return false;
        }
      } else if (p instanceof SymbolNode && q instanceof SymbolNode) {
        if (p.name !== q.name) {
          return false;
        }
      } else if (p instanceof OperatorNode && q instanceof OperatorNode || p instanceof FunctionNode && q instanceof FunctionNode) {
        if (p instanceof OperatorNode) {
          if (p.op !== q.op || p.fn !== q.fn) {
            return false;
          }
        } else if (p instanceof FunctionNode) {
          if (p.name !== q.name) {
            return false;
          }
        }
        if (p.args.length !== q.args.length) {
          return false;
        }
        for (let i = 0; i < p.args.length; i++) {
          if (!_exactMatch(p.args[i], q.args[i])) {
            return false;
          }
        }
      } else {
        return false;
      }
      return true;
    }
    return simplify;
  }
);

// src/function/algebra/simplifyConstant.ts
var name10 = "simplifyConstant";
var dependencies11 = [
  "typed",
  "config",
  "mathWithTransform",
  "matrix",
  "isBounded",
  "?fraction",
  "?bignumber",
  "AccessorNode",
  "ArrayNode",
  "ConstantNode",
  "FunctionNode",
  "IndexNode",
  "ObjectNode",
  "OperatorNode",
  "SymbolNode"
];
var createSimplifyConstant = /* @__PURE__ */ factory(
  name10,
  dependencies11,
  ({
    typed: typed2,
    config,
    mathWithTransform,
    matrix,
    isBounded,
    fraction,
    bignumber,
    AccessorNode,
    ArrayNode,
    ConstantNode,
    FunctionNode,
    IndexNode,
    ObjectNode,
    OperatorNode,
    SymbolNode
  }) => {
    const {
      isCommutative,
      isAssociative,
      allChildren,
      createMakeNodeFunction
    } = createUtil({ FunctionNode, OperatorNode, SymbolNode });
    const simplifyConstant = typed2("simplifyConstant", {
      Node: (node) => _ensureNode(foldFraction(node, {})),
      "Node, Object": function(expr, options) {
        return _ensureNode(foldFraction(expr, options));
      }
    });
    function _removeFractions(thing) {
      if (isFraction(thing)) {
        return thing.valueOf();
      }
      if (thing instanceof Array) {
        return thing.map(_removeFractions);
      }
      if (isMatrix(thing)) {
        return matrix(_removeFractions(thing.valueOf()));
      }
      return thing;
    }
    function _eval(fnname, args, options) {
      try {
        return mathWithTransform[fnname].apply(null, args);
      } catch {
        args = args.map(_removeFractions);
        return _toNumber(mathWithTransform[fnname].apply(null, args), options);
      }
    }
    const _toNode = typed2({
      Fraction: _fractionToNode,
      number: function(n) {
        if (n < 0) {
          return unaryMinusNode(new ConstantNode(-n));
        }
        return new ConstantNode(n);
      },
      BigNumber: function(n) {
        if (n < 0) {
          return unaryMinusNode(new ConstantNode(-n));
        }
        return new ConstantNode(n);
      },
      bigint: function(n) {
        if (n < 0n) {
          return unaryMinusNode(new ConstantNode(-n));
        }
        return new ConstantNode(n);
      },
      Complex: function(_s) {
        throw new Error("Cannot convert Complex number to Node");
      },
      string: function(s) {
        return new ConstantNode(s);
      },
      Matrix: function(m) {
        return new ArrayNode(m.valueOf().map((e2) => _toNode(e2)));
      }
    });
    function _ensureNode(thing) {
      if (isNode(thing)) {
        return thing;
      }
      return _toNode(thing);
    }
    function _exactFraction(n, options) {
      const exactFractions = options && options.exactFractions !== false;
      if (exactFractions && isBounded(n) && fraction) {
        const f = fraction(n);
        const fractionsLimit = options && typeof options.fractionsLimit === "number" ? options.fractionsLimit : Infinity;
        if (f.valueOf() === n && f.n < fractionsLimit && f.d < fractionsLimit) {
          return f;
        }
      }
      return n;
    }
    const _toNumber = typed2({
      "string, Object": function(s, options) {
        const numericType = safeNumberType(s, config);
        if (numericType === "BigNumber") {
          if (bignumber === void 0) {
            noBignumber();
          }
          return bignumber(s);
        } else if (numericType === "bigint") {
          return BigInt(s);
        } else if (numericType === "Fraction") {
          if (fraction === void 0) {
            noFraction();
          }
          return fraction(s);
        } else {
          const n = parseFloat(s);
          return _exactFraction(n, options);
        }
      },
      "Fraction, Object": function(s, _options) {
        return s;
      },
      // we don't need options here
      "BigNumber, Object": function(s, _options) {
        return s;
      },
      // we don't need options here
      "number, Object": function(s, options) {
        return _exactFraction(s, options);
      },
      "bigint, Object": function(s, _options) {
        return s;
      },
      "Complex, Object": function(s, options) {
        if (s.im !== 0) {
          return s;
        }
        return _exactFraction(s.re, options);
      },
      "Matrix, Object": function(s, options) {
        return matrix(_exactFraction(s.valueOf(), options));
      },
      "Array, Object": function(s, options) {
        return s.map((item) => _exactFraction(item, options));
      }
    });
    function unaryMinusNode(n) {
      return new OperatorNode("-", "unaryMinus", [n]);
    }
    function _fractionToNode(f) {
      const fromBigInt = (value) => config.number === "BigNumber" && bignumber ? bignumber(value) : Number(value);
      const signBigInt = BigInt(f.s);
      const numeratorValue = signBigInt * f.n;
      const numeratorNode = numeratorValue < 0n ? new OperatorNode("-", "unaryMinus", [
        new ConstantNode(fromBigInt(-numeratorValue))
      ]) : new ConstantNode(fromBigInt(numeratorValue));
      return f.d === 1n ? numeratorNode : new OperatorNode("/", "divide", [
        numeratorNode,
        new ConstantNode(fromBigInt(f.d))
      ]);
    }
    function _foldAccessor(obj, index, options) {
      if (!isIndexNode(index)) {
        return new AccessorNode(_ensureNode(obj), _ensureNode(index));
      }
      if (isArrayNode(obj) || isMatrix(obj)) {
        const remainingDims = Array.from(index.dimensions);
        while (remainingDims.length > 0) {
          if (isConstantNode(remainingDims[0]) && typeof remainingDims[0].value !== "string") {
            const first = _toNumber(remainingDims.shift().value, options);
            if (isArrayNode(obj)) {
              obj = obj.items[first - 1];
            } else {
              obj = obj.valueOf()[first - 1];
              if (obj instanceof Array) {
                obj = matrix(obj);
              }
            }
          } else if (remainingDims.length > 1 && isConstantNode(remainingDims[1]) && typeof remainingDims[1].value !== "string") {
            const second = _toNumber(remainingDims[1].value, options);
            const tryItems = [];
            const fromItems = isArrayNode(obj) ? obj.items : obj.valueOf();
            for (const item of fromItems) {
              if (isArrayNode(item)) {
                tryItems.push(item.items[second - 1]);
              } else if (isMatrix(obj)) {
                tryItems.push(item[second - 1]);
              } else {
                break;
              }
            }
            if (tryItems.length === fromItems.length) {
              if (isArrayNode(obj)) {
                obj = new ArrayNode(tryItems);
              } else {
                obj = matrix(tryItems);
              }
              remainingDims.splice(1, 1);
            } else {
              break;
            }
          } else {
            break;
          }
        }
        if (remainingDims.length === index.dimensions.length) {
          return new AccessorNode(_ensureNode(obj), index);
        }
        if (remainingDims.length > 0) {
          index = new IndexNode(remainingDims);
          return new AccessorNode(_ensureNode(obj), index);
        }
        return obj;
      }
      if (isObjectNode(obj) && index.dimensions.length === 1 && isConstantNode(index.dimensions[0])) {
        const key = index.dimensions[0].value;
        if (key in obj.properties) {
          return obj.properties[key];
        }
        return new ConstantNode();
      }
      return new AccessorNode(_ensureNode(obj), index);
    }
    function foldOp(fn, args, makeNode, options) {
      const first = args.shift();
      const reduction = args.reduce(
        (sofar, next) => {
          if (!isNode(next)) {
            const last = sofar.pop();
            if (isNode(last)) {
              return [last, next];
            }
            try {
              sofar.push(_eval(fn, [last, next], options));
              return sofar;
            } catch {
              sofar.push(last);
            }
          }
          sofar.push(_ensureNode(sofar.pop()));
          const newtree = sofar.length === 1 ? sofar[0] : makeNode(sofar);
          return [makeNode([newtree, _ensureNode(next)])];
        },
        [first]
      );
      if (reduction.length === 1) {
        return reduction[0];
      }
      return makeNode([reduction[0], _toNode(reduction[1])]);
    }
    function foldFraction(node, options) {
      switch (node.type) {
        case "SymbolNode":
          return node;
        case "ConstantNode":
          switch (typeof node.value) {
            case "number":
              return _toNumber(node.value, options);
            case "bigint":
              return _toNumber(node.value, options);
            case "string":
              return node.value;
            default:
              if (!isNaN(node.value))
                return _toNumber(node.value, options);
          }
          return node;
        case "FunctionNode":
          if (mathWithTransform[node.name] && mathWithTransform[node.name].rawArgs) {
            return node;
          }
          {
            const operatorFunctions = ["add", "multiply"];
            if (!operatorFunctions.includes(node.name)) {
              const args = node.args.map(
                (arg) => foldFraction(arg, options)
              );
              if (!args.some(isNode)) {
                try {
                  return _eval(node.name, args, options);
                } catch {
                }
              }
              if (node.name === "size" && args.length === 1 && isArrayNode(args[0])) {
                const sz = [];
                let section = args[0];
                while (isArrayNode(section)) {
                  sz.push(section.items.length);
                  section = section.items[0];
                }
                return matrix(sz);
              }
              return new FunctionNode(
                node.name,
                args.map(_ensureNode)
              );
            }
          }
        /* falls through */
        case "OperatorNode": {
          const fn = node.fn.toString();
          let args;
          let res;
          const makeNode = createMakeNodeFunction(node);
          if (isOperatorNode(node) && node.isUnary()) {
            args = [foldFraction(node.args[0], options)];
            if (!isNode(args[0])) {
              res = _eval(fn, args, options);
            } else {
              res = makeNode(args);
            }
          } else if (isAssociative(node, options.context)) {
            args = allChildren(node, options.context);
            args = args.map((arg) => foldFraction(arg, options));
            if (isCommutative(fn, options.context)) {
              const consts = [];
              const vars = [];
              for (let i = 0; i < args.length; i++) {
                if (!isNode(args[i])) {
                  consts.push(args[i]);
                } else {
                  vars.push(args[i]);
                }
              }
              if (consts.length > 1) {
                res = foldOp(fn, consts, makeNode, options);
                vars.unshift(res);
                res = foldOp(fn, vars, makeNode, options);
              } else {
                res = foldOp(fn, args, makeNode, options);
              }
            } else {
              res = foldOp(fn, args, makeNode, options);
            }
          } else {
            args = node.args.map(
              (arg) => foldFraction(arg, options)
            );
            res = foldOp(fn, args, makeNode, options);
          }
          return res;
        }
        case "ParenthesisNode":
          return foldFraction(node.content, options);
        case "AccessorNode":
          return _foldAccessor(
            foldFraction(node.object, options),
            foldFraction(node.index, options),
            options
          );
        case "ArrayNode": {
          const foldItems = node.items.map(
            (item) => foldFraction(item, options)
          );
          if (foldItems.some(isNode)) {
            return new ArrayNode(foldItems.map(_ensureNode));
          }
          return matrix(foldItems);
        }
        case "IndexNode": {
          return new IndexNode(
            node.dimensions.map(
              (n) => simplifyConstant(n, options)
            )
          );
        }
        case "ObjectNode": {
          const foldProps = {};
          for (const prop in node.properties) {
            foldProps[prop] = simplifyConstant(
              node.properties[prop],
              options
            );
          }
          return new ObjectNode(foldProps);
        }
        case "AssignmentNode":
        /* falls through */
        case "BlockNode":
        /* falls through */
        case "FunctionAssignmentNode":
        /* falls through */
        case "RangeNode":
        /* falls through */
        case "ConditionalNode":
        /* falls through */
        default:
          throw new Error(
            `Unimplemented node type in simplifyConstant: ${node.type}`
          );
      }
    }
    return simplifyConstant;
  }
);

// src/expression/operators.ts
var properties = [
  {
    // assignment
    AssignmentNode: {},
    FunctionAssignmentNode: {}
  },
  {
    // conditional expression
    ConditionalNode: {
      latexLeftParens: false,
      latexRightParens: false,
      latexParens: false
      // conditionals don't need parentheses in LaTeX because
      // they are 2 dimensional
    }
  },
  {
    // logical or
    "OperatorNode:or": {
      op: "or",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // logical xor
    "OperatorNode:xor": {
      op: "xor",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // logical and
    "OperatorNode:and": {
      op: "and",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // bitwise or
    "OperatorNode:bitOr": {
      op: "|",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // bitwise xor
    "OperatorNode:bitXor": {
      op: "^|",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // bitwise and
    "OperatorNode:bitAnd": {
      op: "&",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // relational operators
    "OperatorNode:equal": {
      op: "==",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:unequal": {
      op: "!=",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:smaller": {
      op: "<",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:larger": {
      op: ">",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:smallerEq": {
      op: "<=",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:largerEq": {
      op: ">=",
      associativity: "left",
      associativeWith: []
    },
    RelationalNode: {
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // bitshift operators
    "OperatorNode:leftShift": {
      op: "<<",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:rightArithShift": {
      op: ">>",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:rightLogShift": {
      op: ">>>",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // unit conversion
    "OperatorNode:to": {
      op: "to",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // range
    RangeNode: {}
  },
  {
    // addition, subtraction
    "OperatorNode:add": {
      op: "+",
      associativity: "left",
      associativeWith: ["OperatorNode:add", "OperatorNode:subtract"]
    },
    "OperatorNode:subtract": {
      op: "-",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // multiply, divide, modulus
    "OperatorNode:multiply": {
      op: "*",
      associativity: "left",
      associativeWith: [
        "OperatorNode:multiply",
        "OperatorNode:divide",
        "Operator:dotMultiply",
        "Operator:dotDivide"
      ]
    },
    "OperatorNode:divide": {
      op: "/",
      associativity: "left",
      associativeWith: [],
      latexLeftParens: false,
      latexRightParens: false,
      latexParens: false
      // fractions don't require parentheses because
      // they're 2 dimensional, so parens aren't needed
      // in LaTeX
    },
    "OperatorNode:dotMultiply": {
      op: ".*",
      associativity: "left",
      associativeWith: [
        "OperatorNode:multiply",
        "OperatorNode:divide",
        "OperatorNode:dotMultiply",
        "OperatorNode:doDivide"
      ]
    },
    "OperatorNode:dotDivide": {
      op: "./",
      associativity: "left",
      associativeWith: []
    },
    "OperatorNode:mod": {
      op: "mod",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // Repeat multiplication for implicit multiplication
    "OperatorNode:multiply": {
      associativity: "left",
      associativeWith: [
        "OperatorNode:multiply",
        "OperatorNode:divide",
        "Operator:dotMultiply",
        "Operator:dotDivide"
      ]
    }
  },
  {
    // unary prefix operators
    "OperatorNode:unaryPlus": {
      op: "+",
      associativity: "right"
    },
    "OperatorNode:unaryMinus": {
      op: "-",
      associativity: "right"
    },
    "OperatorNode:bitNot": {
      op: "~",
      associativity: "right"
    },
    "OperatorNode:not": {
      op: "not",
      associativity: "right"
    }
  },
  {
    // exponentiation
    "OperatorNode:pow": {
      op: "^",
      associativity: "right",
      associativeWith: [],
      latexRightParens: false
      // the exponent doesn't need parentheses in
      // LaTeX because it's 2 dimensional
      // (it's on top)
    },
    "OperatorNode:dotPow": {
      op: ".^",
      associativity: "right",
      associativeWith: []
    }
  },
  {
    // nullish coalescing
    "OperatorNode:nullish": {
      op: "??",
      associativity: "left",
      associativeWith: []
    }
  },
  {
    // factorial
    "OperatorNode:factorial": {
      op: "!",
      associativity: "left"
    }
  },
  {
    // matrix transpose
    "OperatorNode:ctranspose": {
      op: "'",
      associativity: "left"
    }
  }
];
function unwrapParen(_node, parenthesis) {
  if (!parenthesis || parenthesis !== "auto") return _node;
  let node = _node;
  while (isParenthesisNode(node)) node = node.content;
  return node;
}
function getPrecedence(_node, parenthesis, implicit, parent) {
  let node = _node;
  if (parenthesis !== "keep") {
    node = _node.getContent();
  }
  const identifier = node.getIdentifier();
  let precedence = null;
  for (let i = 0; i < properties.length; i++) {
    if (identifier in properties[i]) {
      precedence = i;
      break;
    }
  }
  if (identifier === "OperatorNode:multiply" && node.implicit && implicit !== "show") {
    const leftArg = unwrapParen(node.args[0], parenthesis);
    if (!(isConstantNode(leftArg) && parent && parent.getIdentifier() === "OperatorNode:divide" && rule2Node(unwrapParen(parent.args[0], parenthesis))) && !(leftArg.getIdentifier() === "OperatorNode:divide" && rule2Node(unwrapParen(leftArg.args[0], parenthesis)) && isConstantNode(unwrapParen(leftArg.args[1], parenthesis)))) {
      precedence += 1;
    }
  }
  return precedence;
}
function getAssociativity(_node, parenthesis) {
  let node = _node;
  if (parenthesis !== "keep") {
    node = _node.getContent();
  }
  const identifier = node.getIdentifier();
  const index = getPrecedence(node, parenthesis, void 0, void 0);
  if (index === null) {
    return null;
  }
  const property = properties[index][identifier];
  if (hasOwnProperty(property, "associativity")) {
    if (property.associativity === "left") {
      return "left";
    }
    if (property.associativity === "right") {
      return "right";
    }
    throw Error(
      "'" + identifier + "' has the invalid associativity '" + property.associativity + "'."
    );
  }
  return null;
}
function isAssociativeWith(nodeA, nodeB, parenthesis) {
  const a = parenthesis !== "keep" ? nodeA.getContent() : nodeA;
  const b = parenthesis !== "keep" ? nodeA.getContent() : nodeB;
  const identifierA = a.getIdentifier();
  const identifierB = b.getIdentifier();
  const index = getPrecedence(a, parenthesis, void 0, void 0);
  if (index === null) {
    return null;
  }
  const property = properties[index][identifierA];
  if (hasOwnProperty(property, "associativeWith") && property.associativeWith instanceof Array) {
    for (let i = 0; i < property.associativeWith.length; i++) {
      if (property.associativeWith[i] === identifierB) {
        return true;
      }
    }
    return false;
  }
  return null;
}
function getOperator(fn) {
  const identifier = "OperatorNode:" + fn;
  for (const group of properties) {
    if (identifier in group) {
      return group[identifier].op;
    }
  }
  return null;
}

// src/function/algebra/simplifyCore.ts
var name11 = "simplifyCore";
var dependencies12 = [
  "typed",
  "parse",
  "equal",
  "isZero",
  "add",
  "subtract",
  "multiply",
  "divide",
  "pow",
  "AccessorNode",
  "ArrayNode",
  "ConstantNode",
  "FunctionNode",
  "IndexNode",
  "ObjectNode",
  "OperatorNode",
  "ParenthesisNode",
  "SymbolNode"
];
var createSimplifyCore = /* @__PURE__ */ factory(
  name11,
  dependencies12,
  ({
    typed: typed2,
    parse: _parse,
    equal,
    isZero,
    add: _add,
    subtract: _subtract,
    multiply: _multiply,
    divide: _divide,
    pow: _pow,
    AccessorNode,
    ArrayNode,
    ConstantNode,
    FunctionNode,
    IndexNode,
    ObjectNode,
    OperatorNode,
    ParenthesisNode: _ParenthesisNode,
    SymbolNode
  }) => {
    const node0 = new ConstantNode(0);
    const node1 = new ConstantNode(1);
    const nodeT = new ConstantNode(true);
    const nodeF = new ConstantNode(false);
    function isAlwaysBoolean(node) {
      return isOperatorNode(node) && ["and", "not", "or"].includes(node.op);
    }
    const { hasProperty, isCommutative } = createUtil({
      FunctionNode,
      OperatorNode,
      SymbolNode
    });
    function _simplifyCore(nodeToSimplify, options = {}) {
      const context = options ? options.context : void 0;
      if (hasProperty(nodeToSimplify, "trivial", context)) {
        if (isFunctionNode(nodeToSimplify) && nodeToSimplify.args.length === 1) {
          return _simplifyCore(nodeToSimplify.args[0], options);
        }
        let simpChild = false;
        let childCount = 0;
        nodeToSimplify.forEach((c) => {
          ++childCount;
          if (childCount === 1) {
            simpChild = _simplifyCore(c, options);
          }
        });
        if (childCount === 1 && simpChild !== false) {
          return simpChild;
        }
      }
      let node = nodeToSimplify;
      if (isFunctionNode(node)) {
        const op = getOperator(node.name);
        if (op) {
          if (node.args.length > 2 && hasProperty(node, "associative", context)) {
            while (node.args.length > 2) {
              const last = node.args.pop();
              const seclast = node.args.pop();
              node.args.push(new OperatorNode(op, node.name, [last, seclast]));
            }
          }
          node = new OperatorNode(op, node.name, node.args);
        } else {
          return new FunctionNode(
            _simplifyCore(node.fn),
            node.args.map((n) => _simplifyCore(n, options))
          );
        }
      }
      if (isOperatorNode(node) && node.isUnary()) {
        const a0 = _simplifyCore(node.args[0], options);
        if (node.op === "~") {
          if (isOperatorNode(a0) && a0.isUnary() && a0.op === "~") {
            return a0.args[0];
          }
        }
        if (node.op === "not") {
          if (isOperatorNode(a0) && a0.isUnary() && a0.op === "not") {
            if (isAlwaysBoolean(a0.args[0])) {
              return a0.args[0];
            }
          }
        }
        let finish = true;
        if (node.op === "-") {
          if (isOperatorNode(a0)) {
            if (a0.isBinary() && a0.fn === "subtract") {
              node = new OperatorNode("-", "subtract", [a0.args[1], a0.args[0]]);
              finish = false;
            }
            if (a0.isUnary() && a0.op === "-") {
              return a0.args[0];
            }
          }
        }
        if (finish) return new OperatorNode(node.op, node.fn, [a0]);
      }
      if (isOperatorNode(node) && node.isBinary()) {
        const a0 = _simplifyCore(node.args[0], options);
        let a1 = _simplifyCore(node.args[1], options);
        if (node.op === "+") {
          if (isConstantNode(a0) && isZero(a0.value)) {
            return a1;
          }
          if (isConstantNode(a1) && isZero(a1.value)) {
            return a0;
          }
          if (isOperatorNode(a1) && a1.isUnary() && a1.op === "-") {
            a1 = a1.args[0];
            node = new OperatorNode("-", "subtract", [a0, a1]);
          }
        }
        if (node.op === "-") {
          if (isOperatorNode(a1) && a1.isUnary() && a1.op === "-") {
            return _simplifyCore(
              new OperatorNode("+", "add", [a0, a1.args[0]]),
              options
            );
          }
          if (isConstantNode(a0) && isZero(a0.value)) {
            return _simplifyCore(new OperatorNode("-", "unaryMinus", [a1]));
          }
          if (isConstantNode(a1) && isZero(a1.value)) {
            return a0;
          }
          return new OperatorNode(node.op, node.fn, [a0, a1]);
        }
        if (node.op === "*") {
          if (isConstantNode(a0)) {
            if (isZero(a0.value)) {
              return node0;
            } else if (equal(a0.value, 1)) {
              return a1;
            }
          }
          if (isConstantNode(a1)) {
            if (isZero(a1.value)) {
              return node0;
            } else if (equal(a1.value, 1)) {
              return a0;
            }
            if (isCommutative(node, context)) {
              return new OperatorNode(
                node.op,
                node.fn,
                [a1, a0],
                node.implicit
              );
            }
          }
          return new OperatorNode(
            node.op,
            node.fn,
            [a0, a1],
            node.implicit
          );
        }
        if (node.op === "/") {
          if (isConstantNode(a0) && isZero(a0.value)) {
            return node0;
          }
          if (isConstantNode(a1) && equal(a1.value, 1)) {
            return a0;
          }
          return new OperatorNode(node.op, node.fn, [a0, a1]);
        }
        if (node.op === "^") {
          if (isConstantNode(a1)) {
            if (isZero(a1.value)) {
              return node1;
            } else if (equal(a1.value, 1)) {
              return a0;
            }
          }
        }
        if (node.op === "and") {
          if (isConstantNode(a0)) {
            if (a0.value) {
              if (isAlwaysBoolean(a1)) return a1;
              if (isConstantNode(a1)) {
                return a1.value ? nodeT : nodeF;
              }
            } else {
              return nodeF;
            }
          }
          if (isConstantNode(a1)) {
            if (a1.value) {
              if (isAlwaysBoolean(a0)) return a0;
            } else {
              return nodeF;
            }
          }
        }
        if (node.op === "or") {
          if (isConstantNode(a0)) {
            if (a0.value) {
              return nodeT;
            } else {
              if (isAlwaysBoolean(a1)) return a1;
            }
          }
          if (isConstantNode(a1)) {
            if (a1.value) {
              return nodeT;
            } else {
              if (isAlwaysBoolean(a0)) return a0;
            }
          }
        }
        return new OperatorNode(node.op, node.fn, [a0, a1]);
      }
      if (isOperatorNode(node)) {
        return new OperatorNode(
          node.op,
          node.fn,
          node.args.map((a) => _simplifyCore(a, options))
        );
      }
      if (isArrayNode(node)) {
        return new ArrayNode(
          node.items.map((n) => _simplifyCore(n, options))
        );
      }
      if (isAccessorNode(node)) {
        return new AccessorNode(
          _simplifyCore(node.object, options),
          _simplifyCore(node.index, options)
        );
      }
      if (isIndexNode(node)) {
        return new IndexNode(
          node.dimensions.map((n) => _simplifyCore(n, options))
        );
      }
      if (isObjectNode(node)) {
        const newProps = {};
        for (const prop in node.properties) {
          newProps[prop] = _simplifyCore(node.properties[prop], options);
        }
        return new ObjectNode(newProps);
      }
      return node;
    }
    return typed2(name11, { Node: _simplifyCore, "Node,Object": _simplifyCore });
  }
);

// src/function/algebra/derivative.ts
var name12 = "derivative";
var dependencies13 = [
  "typed",
  "config",
  "parse",
  "simplify",
  "equal",
  "isZero",
  "numeric",
  "ConstantNode",
  "FunctionNode",
  "OperatorNode",
  "ParenthesisNode",
  "SymbolNode"
];
var createDerivative = /* @__PURE__ */ factory(
  name12,
  dependencies13,
  ({
    typed: typed2,
    config,
    parse,
    simplify,
    equal,
    isZero,
    numeric,
    ConstantNode,
    FunctionNode,
    OperatorNode,
    ParenthesisNode,
    SymbolNode
  }) => {
    function plainDerivative(expr, variable, options = { simplify: true }) {
      const cache = /* @__PURE__ */ new Map();
      const variableName = variable.name;
      function isConstCached(node) {
        const cached = cache.get(node);
        if (cached !== void 0) {
          return cached;
        }
        const res2 = _isConst(isConstCached, node, variableName);
        cache.set(node, res2);
        return res2;
      }
      const res = _derivative(expr, isConstCached);
      return options.simplify ? simplify(res) : res;
    }
    function parseIdentifier(string) {
      const symbol = parse(string);
      if (!symbol.isSymbolNode) {
        throw new TypeError(
          `Invalid variable. Cannot parse ${JSON.stringify(string)} into a variable in function derivative`
        );
      }
      return symbol;
    }
    const derivative = typed2(name12, {
      "Node, SymbolNode": plainDerivative,
      "Node, SymbolNode, Object": plainDerivative,
      "Node, string": (node, symbol) => plainDerivative(node, parseIdentifier(symbol)),
      "Node, string, Object": (node, symbol, options) => plainDerivative(node, parseIdentifier(symbol), options)
      /* TODO: implement and test syntax with order of derivatives -> implement as an option {order: number}
      'Node, SymbolNode, ConstantNode': function (expr, variable, {order}) {
        let res = expr
        for (let i = 0; i < order; i++) {
          <create caching isConst>
          res = _derivative(res, isConst)
        }
        return res
      }
      */
    });
    derivative._simplify = true;
    derivative.toTex = function(deriv) {
      return _derivTex.apply(null, deriv.args);
    };
    const _derivTex = typed2("_derivTex", {
      "Node, SymbolNode": function(expr, x) {
        if (isConstantNode(expr) && typeOf(expr.value) === "string") {
          return _derivTex(
            parse(expr.value).toString(),
            x.toString(),
            1
          );
        } else {
          return _derivTex(expr.toTex(), x.toString(), 1);
        }
      },
      "Node, ConstantNode": function(expr, x) {
        if (typeOf(x.value) === "string") {
          return _derivTex(expr, parse(x.value));
        } else {
          throw new Error(
            "The second parameter to 'derivative' is a non-string constant"
          );
        }
      },
      "Node, SymbolNode, ConstantNode": function(expr, x, order) {
        return _derivTex(expr.toString(), x.name, order.value);
      },
      "string, string, number": function(expr, x, order) {
        let d;
        if (order === 1) {
          d = "{d\\over d" + x + "}";
        } else {
          d = "{d^{" + order + "}\\over d" + x + "^{" + order + "}}";
        }
        return d + `\\left[${expr}\\right]`;
      }
    });
    const _isConst = typed2("_isConst", {
      "function, ConstantNode, string": function() {
        return true;
      },
      "function, SymbolNode, string": function(isConst, node, varName) {
        return node.name !== varName;
      },
      "function, ParenthesisNode, string": function(isConst, node, varName) {
        return isConst(node.content, varName);
      },
      "function, FunctionAssignmentNode, string": function(isConst, node, varName) {
        if (!node.params.includes(varName)) {
          return true;
        }
        return isConst(node.expr, varName);
      },
      "function, FunctionNode | OperatorNode, string": function(isConst, node, varName) {
        return node.args.every((arg) => isConst(arg, varName));
      }
    });
    const _derivative = typed2("_derivative", {
      "ConstantNode, function": function() {
        return createConstantNode2(0);
      },
      "SymbolNode, function": function(node, isConst) {
        if (isConst(node)) {
          return createConstantNode2(0);
        }
        return createConstantNode2(1);
      },
      "ParenthesisNode, function": function(node, isConst) {
        return new ParenthesisNode(_derivative(node.content, isConst));
      },
      "FunctionAssignmentNode, function": function(node, isConst) {
        if (isConst(node)) {
          return createConstantNode2(0);
        }
        return _derivative(node.expr, isConst);
      },
      "FunctionNode, function": function(node, isConst) {
        if (isConst(node)) {
          return createConstantNode2(0);
        }
        const arg0 = node.args[0];
        let arg1;
        let div = false;
        let negative = false;
        let funcDerivative;
        switch (node.name) {
          case "cbrt":
            div = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              createConstantNode2(3),
              new OperatorNode("^", "pow", [
                arg0,
                new OperatorNode("/", "divide", [
                  createConstantNode2(2),
                  createConstantNode2(3)
                ])
              ])
            ]);
            break;
          case "sqrt":
          case "nthRoot":
            if (node.args.length === 1) {
              div = true;
              funcDerivative = new OperatorNode("*", "multiply", [
                createConstantNode2(2),
                new FunctionNode("sqrt", [arg0])
              ]);
            } else if (node.args.length === 2) {
              arg1 = new OperatorNode("/", "divide", [
                createConstantNode2(1),
                node.args[1]
              ]);
              return _derivative(
                new OperatorNode("^", "pow", [arg0, arg1]),
                isConst
              );
            }
            break;
          case "log10":
            arg1 = createConstantNode2(10);
          /* fall through! */
          case "log":
            if (!arg1 && node.args.length === 1) {
              funcDerivative = arg0.clone();
              div = true;
            } else if (node.args.length === 1 && arg1 || node.args.length === 2 && isConst(node.args[1])) {
              funcDerivative = new OperatorNode("*", "multiply", [
                arg0.clone(),
                new FunctionNode("log", [arg1 || node.args[1]])
              ]);
              div = true;
            } else if (node.args.length === 2) {
              return _derivative(
                new OperatorNode("/", "divide", [
                  new FunctionNode("log", [arg0]),
                  new FunctionNode("log", [node.args[1]])
                ]),
                isConst
              );
            }
            break;
          case "pow":
            if (node.args.length === 2) {
              return _derivative(
                new OperatorNode("^", "pow", [arg0, node.args[1]]),
                isConst
              );
            }
            break;
          case "exp":
            funcDerivative = new FunctionNode("exp", [arg0.clone()]);
            break;
          case "sin":
            funcDerivative = new FunctionNode("cos", [arg0.clone()]);
            break;
          case "cos":
            funcDerivative = new OperatorNode("-", "unaryMinus", [
              new FunctionNode("sin", [arg0.clone()])
            ]);
            break;
          case "tan":
            funcDerivative = new OperatorNode("^", "pow", [
              new FunctionNode("sec", [arg0.clone()]),
              createConstantNode2(2)
            ]);
            break;
          case "sec":
            funcDerivative = new OperatorNode("*", "multiply", [
              node,
              new FunctionNode("tan", [arg0.clone()])
            ]);
            break;
          case "csc":
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              node,
              new FunctionNode("cot", [arg0.clone()])
            ]);
            break;
          case "cot":
            negative = true;
            funcDerivative = new OperatorNode("^", "pow", [
              new FunctionNode("csc", [arg0.clone()]),
              createConstantNode2(2)
            ]);
            break;
          case "asin":
            div = true;
            funcDerivative = new FunctionNode("sqrt", [
              new OperatorNode("-", "subtract", [
                createConstantNode2(1),
                new OperatorNode("^", "pow", [
                  arg0.clone(),
                  createConstantNode2(2)
                ])
              ])
            ]);
            break;
          case "acos":
            div = true;
            negative = true;
            funcDerivative = new FunctionNode("sqrt", [
              new OperatorNode("-", "subtract", [
                createConstantNode2(1),
                new OperatorNode("^", "pow", [
                  arg0.clone(),
                  createConstantNode2(2)
                ])
              ])
            ]);
            break;
          case "atan":
            div = true;
            funcDerivative = new OperatorNode("+", "add", [
              new OperatorNode("^", "pow", [
                arg0.clone(),
                createConstantNode2(2)
              ]),
              createConstantNode2(1)
            ]);
            break;
          case "asec":
            div = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              new FunctionNode("abs", [arg0.clone()]),
              new FunctionNode("sqrt", [
                new OperatorNode("-", "subtract", [
                  new OperatorNode("^", "pow", [
                    arg0.clone(),
                    createConstantNode2(2)
                  ]),
                  createConstantNode2(1)
                ])
              ])
            ]);
            break;
          case "acsc":
            div = true;
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              new FunctionNode("abs", [arg0.clone()]),
              new FunctionNode("sqrt", [
                new OperatorNode("-", "subtract", [
                  new OperatorNode("^", "pow", [
                    arg0.clone(),
                    createConstantNode2(2)
                  ]),
                  createConstantNode2(1)
                ])
              ])
            ]);
            break;
          case "acot":
            div = true;
            negative = true;
            funcDerivative = new OperatorNode("+", "add", [
              new OperatorNode("^", "pow", [
                arg0.clone(),
                createConstantNode2(2)
              ]),
              createConstantNode2(1)
            ]);
            break;
          case "sinh":
            funcDerivative = new FunctionNode("cosh", [arg0.clone()]);
            break;
          case "cosh":
            funcDerivative = new FunctionNode("sinh", [arg0.clone()]);
            break;
          case "tanh":
            funcDerivative = new OperatorNode("^", "pow", [
              new FunctionNode("sech", [arg0.clone()]),
              createConstantNode2(2)
            ]);
            break;
          case "sech":
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              node,
              new FunctionNode("tanh", [arg0.clone()])
            ]);
            break;
          case "csch":
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              node,
              new FunctionNode("coth", [arg0.clone()])
            ]);
            break;
          case "coth":
            negative = true;
            funcDerivative = new OperatorNode("^", "pow", [
              new FunctionNode("csch", [arg0.clone()]),
              createConstantNode2(2)
            ]);
            break;
          case "asinh":
            div = true;
            funcDerivative = new FunctionNode("sqrt", [
              new OperatorNode("+", "add", [
                new OperatorNode("^", "pow", [
                  arg0.clone(),
                  createConstantNode2(2)
                ]),
                createConstantNode2(1)
              ])
            ]);
            break;
          case "acosh":
            div = true;
            funcDerivative = new FunctionNode("sqrt", [
              new OperatorNode("-", "subtract", [
                new OperatorNode("^", "pow", [
                  arg0.clone(),
                  createConstantNode2(2)
                ]),
                createConstantNode2(1)
              ])
            ]);
            break;
          case "atanh":
            div = true;
            funcDerivative = new OperatorNode("-", "subtract", [
              createConstantNode2(1),
              new OperatorNode("^", "pow", [
                arg0.clone(),
                createConstantNode2(2)
              ])
            ]);
            break;
          case "asech":
            div = true;
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              arg0.clone(),
              new FunctionNode("sqrt", [
                new OperatorNode("-", "subtract", [
                  createConstantNode2(1),
                  new OperatorNode("^", "pow", [
                    arg0.clone(),
                    createConstantNode2(2)
                  ])
                ])
              ])
            ]);
            break;
          case "acsch":
            div = true;
            negative = true;
            funcDerivative = new OperatorNode("*", "multiply", [
              new FunctionNode("abs", [arg0.clone()]),
              new FunctionNode("sqrt", [
                new OperatorNode("+", "add", [
                  new OperatorNode("^", "pow", [
                    arg0.clone(),
                    createConstantNode2(2)
                  ]),
                  createConstantNode2(1)
                ])
              ])
            ]);
            break;
          case "acoth":
            div = true;
            negative = true;
            funcDerivative = new OperatorNode("-", "subtract", [
              createConstantNode2(1),
              new OperatorNode("^", "pow", [
                arg0.clone(),
                createConstantNode2(2)
              ])
            ]);
            break;
          case "abs":
            funcDerivative = new OperatorNode("/", "divide", [
              new FunctionNode(new SymbolNode("abs"), [arg0.clone()]),
              arg0.clone()
            ]);
            break;
          case "gamma":
          // Needs digamma function, d/dx(gamma(x)) = gamma(x)digamma(x)
          default:
            throw new Error(
              'Cannot process function "' + node.name + '" in derivative: the function is not supported, undefined, or the number of arguments passed to it are not supported'
            );
        }
        let op;
        let func;
        if (div) {
          op = "/";
          func = "divide";
        } else {
          op = "*";
          func = "multiply";
        }
        let chainDerivative = _derivative(arg0, isConst);
        if (negative) {
          chainDerivative = new OperatorNode("-", "unaryMinus", [
            chainDerivative
          ]);
        }
        return new OperatorNode(op, func, [chainDerivative, funcDerivative]);
      },
      "OperatorNode, function": function(node, isConst) {
        if (isConst(node)) {
          return createConstantNode2(0);
        }
        if (node.op === "+") {
          return new OperatorNode(
            node.op,
            node.fn,
            node.args.map(function(arg) {
              return _derivative(arg, isConst);
            })
          );
        }
        if (node.op === "-") {
          if (node.isUnary()) {
            return new OperatorNode(node.op, node.fn, [
              _derivative(node.args[0], isConst)
            ]);
          }
          if (node.isBinary()) {
            return new OperatorNode(node.op, node.fn, [
              _derivative(node.args[0], isConst),
              _derivative(node.args[1], isConst)
            ]);
          }
        }
        if (node.op === "*") {
          const constantTerms = node.args.filter(function(arg) {
            return isConst(arg);
          });
          if (constantTerms.length > 0) {
            const nonConstantTerms = node.args.filter(function(arg) {
              return !isConst(arg);
            });
            const nonConstantNode = nonConstantTerms.length === 1 ? nonConstantTerms[0] : new OperatorNode("*", "multiply", nonConstantTerms);
            const newArgs = constantTerms.concat(
              _derivative(nonConstantNode, isConst)
            );
            return new OperatorNode("*", "multiply", newArgs);
          }
          return new OperatorNode(
            "+",
            "add",
            node.args.map(function(argOuter) {
              return new OperatorNode(
                "*",
                "multiply",
                node.args.map(function(argInner) {
                  return argInner === argOuter ? _derivative(argInner, isConst) : argInner.clone();
                })
              );
            })
          );
        }
        if (node.op === "/" && node.isBinary()) {
          const arg0 = node.args[0];
          const arg1 = node.args[1];
          if (isConst(arg1)) {
            return new OperatorNode("/", "divide", [
              _derivative(arg0, isConst),
              arg1
            ]);
          }
          if (isConst(arg0)) {
            return new OperatorNode("*", "multiply", [
              new OperatorNode("-", "unaryMinus", [arg0]),
              new OperatorNode("/", "divide", [
                _derivative(arg1, isConst),
                new OperatorNode("^", "pow", [
                  arg1.clone(),
                  createConstantNode2(2)
                ])
              ])
            ]);
          }
          return new OperatorNode("/", "divide", [
            new OperatorNode("-", "subtract", [
              new OperatorNode("*", "multiply", [
                _derivative(arg0, isConst),
                arg1.clone()
              ]),
              new OperatorNode("*", "multiply", [
                arg0.clone(),
                _derivative(arg1, isConst)
              ])
            ]),
            new OperatorNode("^", "pow", [arg1.clone(), createConstantNode2(2)])
          ]);
        }
        if (node.op === "^" && node.isBinary()) {
          const arg0 = node.args[0];
          const arg1 = node.args[1];
          if (isConst(arg0)) {
            if (isConstantNode(arg0) && (isZero(arg0.value) || equal(arg0.value, 1))) {
              return createConstantNode2(0);
            }
            return new OperatorNode("*", "multiply", [
              node,
              new OperatorNode("*", "multiply", [
                new FunctionNode("log", [arg0.clone()]),
                _derivative(arg1.clone(), isConst)
              ])
            ]);
          }
          if (isConst(arg1)) {
            if (isConstantNode(arg1)) {
              if (isZero(arg1.value)) {
                return createConstantNode2(0);
              }
              if (equal(arg1.value, 1)) {
                return _derivative(arg0, isConst);
              }
            }
            const powMinusOne = new OperatorNode("^", "pow", [
              arg0.clone(),
              new OperatorNode("-", "subtract", [arg1, createConstantNode2(1)])
            ]);
            return new OperatorNode("*", "multiply", [
              arg1.clone(),
              new OperatorNode("*", "multiply", [
                _derivative(arg0, isConst),
                powMinusOne
              ])
            ]);
          }
          return new OperatorNode("*", "multiply", [
            new OperatorNode("^", "pow", [arg0.clone(), arg1.clone()]),
            new OperatorNode("+", "add", [
              new OperatorNode("*", "multiply", [
                _derivative(arg0, isConst),
                new OperatorNode("/", "divide", [arg1.clone(), arg0.clone()])
              ]),
              new OperatorNode("*", "multiply", [
                _derivative(arg1, isConst),
                new FunctionNode("log", [arg0.clone()])
              ])
            ])
          ]);
        }
        throw new Error(
          'Cannot process operator "' + node.op + '" in derivative: the operator is not supported, undefined, or the number of arguments passed to it are not supported'
        );
      }
    });
    function createConstantNode2(value, valueType) {
      return new ConstantNode(
        numeric(value, safeNumberType(String(value), config))
      );
    }
    return derivative;
  }
);

// src/function/algebra/rationalize.ts
var name13 = "rationalize";
var dependencies14 = [
  "config",
  "typed",
  "equal",
  "isZero",
  "add",
  "subtract",
  "multiply",
  "divide",
  "pow",
  "parse",
  "simplifyConstant",
  "simplifyCore",
  "simplify",
  "?bignumber",
  "?fraction",
  "mathWithTransform",
  "matrix",
  "AccessorNode",
  "ArrayNode",
  "ConstantNode",
  "FunctionNode",
  "IndexNode",
  "ObjectNode",
  "OperatorNode",
  "SymbolNode",
  "ParenthesisNode"
];
var createRationalize = /* @__PURE__ */ factory(
  name13,
  dependencies14,
  ({
    config: _config,
    typed: typed2,
    equal: _equal,
    isZero: _isZero,
    add: _add,
    subtract: _subtract,
    multiply: _multiply,
    divide: _divide,
    pow: _pow,
    parse: _parse,
    simplifyConstant,
    simplifyCore,
    simplify,
    fraction: _fraction,
    bignumber: _bignumber,
    mathWithTransform: _mathWithTransform,
    matrix: _matrix,
    AccessorNode: _AccessorNode,
    ArrayNode: _ArrayNode,
    ConstantNode,
    FunctionNode: _FunctionNode,
    IndexNode: _IndexNode,
    ObjectNode: _ObjectNode,
    OperatorNode,
    SymbolNode,
    ParenthesisNode: _ParenthesisNode
  }) => {
    function _rationalize(expr, scope = {}, detailed = false) {
      const setRules = rulesRationalize();
      const polyRet = polynomial(expr, scope, true, setRules.firstRules);
      const nVars = polyRet.variables.length;
      const noExactFractions = { exactFractions: false };
      const withExactFractions = { exactFractions: true };
      expr = polyRet.expression;
      if (nVars >= 1) {
        expr = expandPower(expr);
        let sBefore;
        let rules;
        let eDistrDiv = true;
        let redoInic = false;
        expr = simplify(expr, setRules.firstRules, {}, noExactFractions);
        let s;
        while (true) {
          rules = eDistrDiv ? setRules.distrDivRules : setRules.sucDivRules;
          expr = simplify(expr, rules, {}, withExactFractions);
          eDistrDiv = !eDistrDiv;
          s = expr.toString();
          if (s === sBefore) {
            break;
          }
          redoInic = true;
          sBefore = s;
        }
        if (redoInic) {
          expr = simplify(expr, setRules.firstRulesAgain, {}, noExactFractions);
        }
        expr = simplify(expr, setRules.finalRules, {}, noExactFractions);
      }
      const coefficients = [];
      const retRationalize = {};
      if (expr.type === "OperatorNode" && expr.isBinary() && expr.op === "/") {
        if (nVars === 1) {
          expr.args[0] = polyToCanonical(
            expr.args[0],
            coefficients
          );
          expr.args[1] = polyToCanonical(
            expr.args[1]
          );
        }
        if (detailed) {
          retRationalize.numerator = expr.args[0];
          retRationalize.denominator = expr.args[1];
        }
      } else {
        if (nVars === 1) {
          expr = polyToCanonical(expr, coefficients);
        }
        if (detailed) {
          retRationalize.numerator = expr;
          retRationalize.denominator = null;
        }
      }
      if (!detailed) return expr;
      retRationalize.coefficients = coefficients;
      retRationalize.variables = polyRet.variables;
      retRationalize.expression = expr;
      return retRationalize;
    }
    return typed2(name13, {
      Node: _rationalize,
      "Node, boolean": (expr, detailed) => _rationalize(expr, {}, detailed),
      "Node, Object": _rationalize,
      "Node, Object, boolean": _rationalize
    });
    function polynomial(expr, scope, extended, rules) {
      const variables = [];
      const node = simplify(expr, rules, scope, { exactFractions: false });
      extended = !!extended;
      const oper = "+-*" + (extended ? "/" : "");
      recPoly(node);
      const retFunc = {};
      retFunc.expression = node;
      retFunc.variables = variables;
      return retFunc;
      function recPoly(node2) {
        const tp = node2.type;
        if (tp === "FunctionNode") {
          throw new Error("There is an unsolved function call");
        } else if (tp === "OperatorNode") {
          if (node2.op === "^") {
            if (node2.args[1].type !== "ConstantNode" || !isInteger(
              parseFloat(
                String(node2.args[1].value)
              )
            )) {
              throw new Error("There is a non-integer exponent");
            } else {
              recPoly(node2.args[0]);
            }
          } else {
            if (!oper.includes(node2.op)) {
              throw new Error(
                "Operator " + node2.op + " invalid in polynomial expression"
              );
            }
            for (let i = 0; i < node2.args.length; i++) {
              recPoly(node2.args[i]);
            }
          }
        } else if (tp === "SymbolNode") {
          const name114 = node2.name;
          const pos = variables.indexOf(name114);
          if (pos === -1) {
            variables.push(name114);
          }
        } else if (tp === "ParenthesisNode") {
          recPoly(node2.content);
        } else if (tp !== "ConstantNode") {
          throw new Error(
            "type " + tp + " is not allowed in polynomial expression"
          );
        }
      }
    }
    function rulesRationalize() {
      const oldRules = [
        simplifyCore,
        // sCore
        { l: "n+n", r: "2*n" },
        { l: "n+-n", r: "0" },
        simplifyConstant,
        // sConstant
        { l: "n*(n1^-1)", r: "n/n1" },
        { l: "n*n1^-n2", r: "n/n1^n2" },
        { l: "n1^-1", r: "1/n1" },
        { l: "n*(n1/n2)", r: "(n*n1)/n2" },
        { l: "1*n", r: "n" }
      ];
      const rulesFirst = [
        { l: "(-n1)/(-n2)", r: "n1/n2" },
        // Unary division
        { l: "(-n1)*(-n2)", r: "n1*n2" },
        // Unary multiplication
        { l: "n1--n2", r: "n1+n2" },
        // '--' elimination
        { l: "n1-n2", r: "n1+(-n2)" },
        // Subtraction turn into add with unary minus
        { l: "(n1+n2)*n3", r: "(n1*n3 + n2*n3)" },
        // Distributive 1
        { l: "n1*(n2+n3)", r: "(n1*n2+n1*n3)" },
        // Distributive 2
        { l: "c1*n + c2*n", r: "(c1+c2)*n" },
        // Joining constants
        { l: "c1*n + n", r: "(c1+1)*n" },
        // Joining constants
        { l: "c1*n - c2*n", r: "(c1-c2)*n" },
        // Joining constants
        { l: "c1*n - n", r: "(c1-1)*n" },
        // Joining constants
        { l: "v/c", r: "(1/c)*v" },
        // variable/constant (new!)
        { l: "v/-c", r: "-(1/c)*v" },
        // variable/constant (new!)
        { l: "-v*-c", r: "c*v" },
        // Inversion constant and variable 1
        { l: "-v*c", r: "-c*v" },
        // Inversion constant and variable 2
        { l: "v*-c", r: "-c*v" },
        // Inversion constant and variable 3
        { l: "v*c", r: "c*v" },
        // Inversion constant and variable 4
        { l: "-(-n1*n2)", r: "(n1*n2)" },
        // Unary propagation
        { l: "-(n1*n2)", r: "(-n1*n2)" },
        // Unary propagation
        { l: "-(-n1+n2)", r: "(n1-n2)" },
        // Unary propagation
        { l: "-(n1+n2)", r: "(-n1-n2)" },
        // Unary propagation
        { l: "(n1^n2)^n3", r: "(n1^(n2*n3))" },
        // Power to Power
        { l: "-(-n1/n2)", r: "(n1/n2)" },
        // Division and Unary
        { l: "-(n1/n2)", r: "(-n1/n2)" }
      ];
      const rulesDistrDiv = [
        { l: "(n1/n2 + n3/n4)", r: "((n1*n4 + n3*n2)/(n2*n4))" },
        // Sum of fractions
        { l: "(n1/n2 + n3)", r: "((n1 + n3*n2)/n2)" },
        // Sum fraction with number 1
        { l: "(n1 + n2/n3)", r: "((n1*n3 + n2)/n3)" }
      ];
      const rulesSucDiv = [
        { l: "(n1/(n2/n3))", r: "((n1*n3)/n2)" },
        // Division simplification
        { l: "(n1/n2/n3)", r: "(n1/(n2*n3))" }
      ];
      const setRules = {};
      setRules.firstRules = oldRules.concat(rulesFirst, rulesSucDiv);
      setRules.distrDivRules = rulesDistrDiv;
      setRules.sucDivRules = rulesSucDiv;
      setRules.firstRulesAgain = oldRules.concat(rulesFirst);
      setRules.finalRules = [
        simplifyCore,
        // simplify.rules[0]
        { l: "n*-n", r: "-n^2" },
        // Joining multiply with power 1
        { l: "n*n", r: "n^2" },
        // Joining multiply with power 2
        simplifyConstant,
        // simplify.rules[14] old 3rd index in oldRules
        { l: "n*-n^n1", r: "-n^(n1+1)" },
        // Joining multiply with power 3
        { l: "n*n^n1", r: "n^(n1+1)" },
        // Joining multiply with power 4
        { l: "n^n1*-n^n2", r: "-n^(n1+n2)" },
        // Joining multiply with power 5
        { l: "n^n1*n^n2", r: "n^(n1+n2)" },
        // Joining multiply with power 6
        { l: "n^n1*-n", r: "-n^(n1+1)" },
        // Joining multiply with power 7
        { l: "n^n1*n", r: "n^(n1+1)" },
        // Joining multiply with power 8
        { l: "n^n1/-n", r: "-n^(n1-1)" },
        // Joining multiply with power 8
        { l: "n^n1/n", r: "n^(n1-1)" },
        // Joining division with power 1
        { l: "n/-n^n1", r: "-n^(1-n1)" },
        // Joining division with power 2
        { l: "n/n^n1", r: "n^(1-n1)" },
        // Joining division with power 3
        { l: "n^n1/-n^n2", r: "n^(n1-n2)" },
        // Joining division with power 4
        { l: "n^n1/n^n2", r: "n^(n1-n2)" },
        // Joining division with power 5
        { l: "n1+(-n2*n3)", r: "n1-n2*n3" },
        // Solving useless parenthesis 1
        { l: "v*(-c)", r: "-c*v" },
        // Solving useless unary 2
        { l: "n1+-n2", r: "n1-n2" },
        // Solving +- together (new!)
        { l: "v*c", r: "c*v" },
        // inversion constant with variable
        { l: "(n1^n2)^n3", r: "(n1^(n2*n3))" }
        // Power to Power
      ];
      return setRules;
    }
    function expandPower(node, parent, indParent) {
      const tp = node.type;
      const internal = arguments.length > 1;
      if (tp === "OperatorNode" && node.isBinary()) {
        let does = false;
        let val;
        if (node.op === "^") {
          if ((node.args[0].type === "ParenthesisNode" || node.args[0].type === "OperatorNode") && node.args[1].type === "ConstantNode") {
            val = parseFloat(
              String(node.args[1].value)
            );
            does = val >= 2 && isInteger(val);
          }
        }
        if (does) {
          if (val > 2) {
            const nEsqTopo = node.args[0];
            const nDirTopo = new OperatorNode("^", "pow", [
              node.args[0].cloneDeep(),
              new ConstantNode(val - 1)
            ]);
            node = new OperatorNode("*", "multiply", [nEsqTopo, nDirTopo]);
          } else {
            node = new OperatorNode("*", "multiply", [
              node.args[0],
              node.args[0].cloneDeep()
            ]);
          }
          if (internal) {
            if (indParent === "content") {
              parent.content = node;
            } else {
              parent.args[indParent] = node;
            }
          }
        }
      }
      if (tp === "ParenthesisNode") {
        expandPower(node.content, node, "content");
      } else if (tp !== "ConstantNode" && tp !== "SymbolNode") {
        for (let i = 0; i < node.args.length; i++) {
          expandPower(node.args[i], node, i);
        }
      }
      if (!internal) {
        return node;
      }
      return node;
    }
    function polyToCanonical(node, coefficients) {
      if (coefficients === void 0) {
        coefficients = [];
      }
      coefficients[0] = 0;
      const o = {};
      o.cte = 1;
      o.oper = "+";
      o.fire = "";
      let maxExpo = 0;
      let varname = "";
      recurPol(node, null, o);
      maxExpo = coefficients.length - 1;
      let first = true;
      let no;
      for (let i = maxExpo; i >= 0; i--) {
        if (coefficients[i] === 0) continue;
        let n16 = new ConstantNode(
          first ? coefficients[i] : Math.abs(coefficients[i])
        );
        const op = coefficients[i] < 0 ? "-" : "+";
        if (i > 0) {
          let n25 = new SymbolNode(varname);
          if (i > 1) {
            const n3 = new ConstantNode(i);
            n25 = new OperatorNode("^", "pow", [n25, n3]);
          }
          if (coefficients[i] === -1 && first) {
            n16 = new OperatorNode("-", "unaryMinus", [n25]);
          } else if (Math.abs(coefficients[i]) === 1) {
            n16 = n25;
          } else {
            n16 = new OperatorNode("*", "multiply", [n16, n25]);
          }
        }
        if (first) {
          no = n16;
        } else if (op === "+") {
          no = new OperatorNode("+", "add", [no, n16]);
        } else {
          no = new OperatorNode("-", "subtract", [no, n16]);
        }
        first = false;
      }
      if (first) {
        return new ConstantNode(0);
      } else {
        return no;
      }
      function recurPol(node2, noPai, o2) {
        const tp = node2.type;
        if (tp === "FunctionNode") {
          throw new Error("There is an unsolved function call");
        } else if (tp === "OperatorNode") {
          if (!"+-*^".includes(node2.op))
            throw new Error(
              "Operator " + node2.op + " invalid"
            );
          if (noPai !== null) {
            if ((node2.fn === "unaryMinus" || node2.fn === "pow") && noPai.fn !== "add" && noPai.fn !== "subtract" && noPai.fn !== "multiply") {
              throw new Error(
                "Invalid " + node2.op + " placing"
              );
            }
            if ((node2.fn === "subtract" || node2.fn === "add" || node2.fn === "multiply") && noPai.fn !== "add" && noPai.fn !== "subtract") {
              throw new Error(
                "Invalid " + node2.op + " placing"
              );
            }
            if ((node2.fn === "subtract" || node2.fn === "add" || node2.fn === "unaryMinus") && o2.noFil !== 0) {
              throw new Error(
                "Invalid " + node2.op + " placing"
              );
            }
          }
          if (node2.op === "^" || node2.op === "*") {
            o2.fire = node2.op;
          }
          for (let i = 0; i < node2.args.length; i++) {
            if (node2.fn === "unaryMinus") o2.oper = "-";
            if (node2.op === "+" || node2.fn === "subtract") {
              o2.fire = "";
              o2.cte = 1;
              o2.oper = i === 0 ? "+" : node2.op;
            }
            o2.noFil = i;
            recurPol(node2.args[i], node2, o2);
          }
        } else if (tp === "SymbolNode") {
          if (node2.name !== varname && varname !== "") {
            throw new Error("There is more than one variable");
          }
          varname = node2.name;
          if (noPai === null) {
            coefficients[1] = 1;
            return;
          }
          if (noPai.op === "^" && o2.noFil !== 0) {
            throw new Error(
              "In power the variable should be the first parameter"
            );
          }
          if (noPai.op === "*" && o2.noFil !== 1) {
            throw new Error(
              "In multiply the variable should be the second parameter"
            );
          }
          if (o2.fire === "" || o2.fire === "*") {
            if (maxExpo < 1) coefficients[1] = 0;
            coefficients[1] += o2.cte * (o2.oper === "+" ? 1 : -1);
            maxExpo = Math.max(1, maxExpo);
          }
        } else if (tp === "ConstantNode") {
          const valor = parseFloat(String(node2.value));
          if (noPai === null) {
            coefficients[0] = valor;
            return;
          }
          if (noPai.op === "^") {
            if (o2.noFil !== 1) throw new Error("Constant cannot be powered");
            if (!isInteger(valor) || valor <= 0) {
              throw new Error("Non-integer exponent is not allowed");
            }
            for (let i = maxExpo + 1; i < valor; i++) coefficients[i] = 0;
            if (valor > maxExpo) coefficients[valor] = 0;
            coefficients[valor] += o2.cte * (o2.oper === "+" ? 1 : -1);
            maxExpo = Math.max(valor, maxExpo);
            return;
          }
          o2.cte = valor;
          if (o2.fire === "") {
            coefficients[0] += o2.cte * (o2.oper === "+" ? 1 : -1);
          }
        } else {
          throw new Error("Type " + tp + " is not allowed");
        }
      }
    }
  }
);

// src/error/IndexError.ts
var IndexError = class _IndexError extends RangeError {
  /**
   * Create an IndexError
   *
   * Can be called in two ways:
   * - IndexError(index, max) - assumes min=0
   * - IndexError(index, min, max)
   *
   * @param index  The actual index
   * @param min    Minimum index (included), or max if only 2 args provided
   * @param max    Maximum index (excluded)
   */
  constructor(index, min, max) {
    let actualMin;
    let actualMax;
    if (max === void 0) {
      actualMin = 0;
      actualMax = min;
    } else {
      actualMin = min;
      actualMax = max;
    }
    let message;
    if (actualMin !== void 0 && index < actualMin) {
      message = "Index out of range (" + index + " < " + actualMin + ")";
    } else if (actualMax !== void 0 && index >= actualMax) {
      message = "Index out of range (" + index + " > " + (actualMax - 1) + ")";
    } else {
      message = "Index out of range (" + index + ")";
    }
    super(message);
    this.isIndexError = true;
    this.index = index;
    this.min = actualMin;
    this.max = actualMax;
    this.name = "IndexError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _IndexError);
    }
  }
};

// src/error/DimensionError.ts
var DimensionError = class _DimensionError extends RangeError {
  /**
   * @param actual - The actual size or custom error message
   * @param expected - The expected size (optional if actual is a custom message)
   * @param relation - Optional relation between actual and expected size: '!=', '<', etc.
   */
  constructor(actual, expected, relation) {
    let message;
    if (typeof actual === "string" && expected === void 0) {
      message = actual;
    } else {
      message = "Dimension mismatch (" + (Array.isArray(actual) ? "[" + actual.join(", ") + "]" : actual) + " " + (relation || "!=") + " " + (Array.isArray(expected) ? "[" + expected.join(", ") + "]" : expected) + ")";
    }
    super(message);
    this.isDimensionError = true;
    this.name = "DimensionError";
    if (typeof actual === "string" && expected === void 0) {
      this.actual = void 0;
      this.expected = void 0;
      this.relation = void 0;
    } else {
      this.actual = actual;
      this.expected = expected;
      this.relation = relation;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _DimensionError);
    }
  }
};

// src/utils/array.ts
function arraySize(x) {
  const s = [];
  while (Array.isArray(x)) {
    s.push(x.length);
    x = x[0];
  }
  return s;
}
function validateIndex(index, length) {
  if (index !== void 0) {
    if (!isNumber(index) || !isInteger(index)) {
      throw new TypeError("Index must be an integer (value: " + index + ")");
    }
    if (index < 0 || typeof length === "number" && index >= length) {
      throw new IndexError(index, length);
    }
  }
}
function reshape(array, sizes) {
  const flatArray = flatten(array, true);
  const currentLength = flatArray.length;
  if (!Array.isArray(array) || !Array.isArray(sizes)) {
    throw new TypeError("Array expected");
  }
  if (sizes.length === 0) {
    throw new DimensionError(0, currentLength, "!=");
  }
  const processedSizes = processSizesWildcard(sizes, currentLength);
  const newLength = product2(processedSizes);
  if (currentLength !== newLength) {
    throw new DimensionError(newLength, currentLength, "!=");
  }
  try {
    return _reshape(flatArray, processedSizes);
  } catch (e2) {
    if (e2 instanceof DimensionError) {
      throw new DimensionError(newLength, currentLength, "!=");
    }
    throw e2;
  }
}
function processSizesWildcard(sizes, currentLength) {
  const newLength = product2(sizes);
  const processedSizes = sizes.slice();
  const WILDCARD = -1;
  const wildCardIndex = sizes.indexOf(WILDCARD);
  const isMoreThanOneWildcard = sizes.indexOf(WILDCARD, wildCardIndex + 1) >= 0;
  if (isMoreThanOneWildcard) {
    throw new Error("More than one wildcard in sizes");
  }
  const hasWildcard = wildCardIndex >= 0;
  const canReplaceWildcard = currentLength % newLength === 0;
  if (hasWildcard) {
    if (canReplaceWildcard) {
      processedSizes[wildCardIndex] = -currentLength / newLength;
    } else {
      throw new Error(
        "Could not replace wildcard, since " + currentLength + " is no multiple of " + -newLength
      );
    }
  }
  return processedSizes;
}
function product2(array) {
  return array.reduce((prev, curr) => prev * curr, 1);
}
function _reshape(array, sizes) {
  let tmpArray = array;
  let tmpArray2;
  for (let sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
    const size = sizes[sizeIndex];
    tmpArray2 = [];
    const length = tmpArray.length / size;
    for (let i = 0; i < length; i++) {
      tmpArray2.push(tmpArray.slice(i * size, (i + 1) * size));
    }
    tmpArray = tmpArray2;
  }
  return tmpArray;
}
function flatten(array, isRectangular = false) {
  if (!Array.isArray(array)) {
    return array;
  }
  if (typeof isRectangular !== "boolean") {
    throw new TypeError("Boolean expected for second argument of flatten");
  }
  const flat = [];
  if (isRectangular) {
    _flattenRectangular(array);
  } else {
    _flatten(array);
  }
  return flat;
  function _flatten(arr) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (Array.isArray(item)) {
        _flatten(item);
      } else {
        flat.push(item);
      }
    }
  }
  function _flattenRectangular(arr) {
    if (Array.isArray(arr[0])) {
      for (let i = 0; i < arr.length; i++) {
        _flattenRectangular(arr[i]);
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        flat.push(arr[i]);
      }
    }
  }
}
function map(array, callback) {
  return Array.prototype.map.call(array, callback);
}
function forEach(array, callback) {
  Array.prototype.forEach.call(array, callback);
}
function filter(array, callback) {
  if (arraySize(array).length !== 1) {
    throw new Error("Only one dimensional matrices supported");
  }
  return Array.prototype.filter.call(array, callback);
}
function filterRegExp(array, regexp) {
  if (arraySize(array).length !== 1) {
    throw new Error("Only one dimensional matrices supported");
  }
  return Array.prototype.filter.call(
    array,
    (entry) => regexp.test(entry)
  );
}
function join(array, separator) {
  return Array.prototype.join.call(array, separator);
}
function concatRecursive(a, b, concatDim, dim) {
  if (dim < concatDim) {
    if (a.length !== b.length) {
      throw new DimensionError(a.length, b.length);
    }
    const c = [];
    for (let i = 0; i < a.length; i++) {
      c[i] = concatRecursive(a[i], b[i], concatDim, dim + 1);
    }
    return c;
  } else {
    return a.concat(b);
  }
}
function concat(...args) {
  const arrays = Array.prototype.slice.call(args, 0, -1);
  const concatDim = Array.prototype.slice.call(args, -1)[0];
  if (arrays.length === 1) {
    return arrays[0];
  }
  if (arrays.length > 1) {
    return arrays.slice(1).reduce(function(A, B) {
      return concatRecursive(A, B, concatDim, 0);
    }, arrays[0]);
  } else {
    throw new Error("Wrong number of arguments in function concat");
  }
}
function broadcastSizes(...sizes) {
  const dimensions = sizes.map((s) => s.length);
  const N = Math.max(...dimensions);
  const sizeMax = new Array(N).fill(null);
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const dim = dimensions[i];
    for (let j = 0; j < dim; j++) {
      const n = N - dim + j;
      if (size[j] > sizeMax[n]) {
        sizeMax[n] = size[j];
      }
    }
  }
  for (let i = 0; i < sizes.length; i++) {
    checkBroadcastingRules(sizes[i], sizeMax);
  }
  return sizeMax;
}
function checkBroadcastingRules(size, toSize) {
  const N = toSize.length;
  const dim = size.length;
  for (let j = 0; j < dim; j++) {
    const n = N - dim + j;
    if (size[j] < toSize[n] && size[j] > 1 || size[j] > toSize[n]) {
      throw new Error(
        `shape mismatch: mismatch is found in arg with shape (${size}) not possible to broadcast dimension ${dim} with size ${size[j]} to size ${toSize[n]}`
      );
    }
  }
}
function broadcastTo(array, toSize) {
  let Asize = arraySize(array);
  if (deepStrictEqual(Asize, toSize)) {
    return array;
  }
  checkBroadcastingRules(Asize, toSize);
  const broadcastedSize = broadcastSizes(Asize, toSize);
  const N = broadcastedSize.length;
  const paddedSize = [...Array(N - Asize.length).fill(1), ...Asize];
  let A = clone2(array);
  if (Asize.length < N) {
    A = reshape(A, paddedSize);
    Asize = arraySize(A);
  }
  for (let dim = 0; dim < N; dim++) {
    if (Asize[dim] < broadcastedSize[dim]) {
      A = stretch(A, broadcastedSize[dim], dim);
      Asize = arraySize(A);
    }
  }
  return A;
}
function stretch(arrayToStretch, sizeToStretch, dimToStretch) {
  return concat(...Array(sizeToStretch).fill(arrayToStretch), dimToStretch);
}
function get(array, index) {
  if (!Array.isArray(array)) {
    throw new Error("Array expected");
  }
  const size = arraySize(array);
  if (index.length !== size.length) {
    throw new DimensionError(index.length, size.length);
  }
  for (let x = 0; x < index.length; x++) {
    validateIndex(index[x], size[x]);
  }
  return index.reduce((acc, curr) => acc[curr], array);
}
function deepMap(array, callback, skipIndex = false) {
  if (array.length === 0) {
    return [];
  }
  if (skipIndex) {
    return recursiveMap(array);
  }
  const index = [];
  return recursiveMapWithIndex(array, 0);
  function recursiveMapWithIndex(value, depth) {
    if (Array.isArray(value)) {
      const N = value.length;
      const result = Array(N);
      for (let i = 0; i < N; i++) {
        index[depth] = i;
        result[i] = recursiveMapWithIndex(value[i], depth + 1);
      }
      return result;
    } else {
      return callback(value, index.slice(0, depth), array);
    }
  }
  function recursiveMap(value) {
    if (Array.isArray(value)) {
      const N = value.length;
      const result = Array(N);
      for (let i = 0; i < N; i++) {
        result[i] = recursiveMap(value[i]);
      }
      return result;
    } else {
      return callback(value);
    }
  }
}
function deepForEach(array, callback, skipIndex = false) {
  if (array.length === 0) {
    return;
  }
  if (skipIndex) {
    recursiveForEach(array);
    return;
  }
  const index = [];
  recursiveForEachWithIndex(array, 0);
  function recursiveForEachWithIndex(value, depth) {
    if (Array.isArray(value)) {
      const N = value.length;
      for (let i = 0; i < N; i++) {
        index[depth] = i;
        recursiveForEachWithIndex(value[i], depth + 1);
      }
    } else {
      callback(value, index.slice(0, depth), array);
    }
  }
  function recursiveForEach(value) {
    if (Array.isArray(value)) {
      const N = value.length;
      for (let i = 0; i < N; i++) {
        recursiveForEach(value[i]);
      }
    } else {
      callback(value);
    }
  }
}
function clone2(array) {
  return Object.assign([], array);
}

// src/utils/switch.ts
function _switch(mat) {
  const I = mat.length;
  const J = mat[0].length;
  let i, j;
  const ret = [];
  for (j = 0; j < J; j++) {
    const tmp = [];
    for (i = 0; i < I; i++) {
      tmp.push(mat[i][j]);
    }
    ret.push(tmp);
  }
  return ret;
}

// src/utils/collection.ts
function containsCollections(array) {
  for (let i = 0; i < array.length; i++) {
    if (isCollection(array[i])) {
      return true;
    }
  }
  return false;
}
function deepForEach2(array, callback) {
  if (isMatrix(array)) {
    array.forEach((x) => callback(x), false, true);
  } else {
    deepForEach(array, callback, true);
  }
}
function deepMap2(array, callback, skipZeros) {
  {
    if (isMatrix(array)) {
      return array.map((x) => callback(x), false, true);
    } else {
      return deepMap(array, callback, true);
    }
  }
}
function reduce(mat, dim, callback) {
  const size = Array.isArray(mat) ? arraySize(mat) : mat.size();
  if (dim < 0 || dim >= size.length) {
    throw new IndexError(dim, 0, size.length);
  }
  if (isMatrix(mat)) {
    return mat.create(
      _reduce(mat.valueOf(), dim, callback),
      mat.datatype()
    );
  } else {
    return _reduce(mat, dim, callback);
  }
}
function _reduce(mat, dim, callback) {
  let i;
  let ret;
  let val;
  let tran;
  if (dim <= 0) {
    if (!Array.isArray(mat[0])) {
      val = mat[0];
      for (i = 1; i < mat.length; i++) {
        val = callback(val, mat[i]);
      }
      return val;
    } else {
      tran = _switch(mat);
      ret = [];
      for (i = 0; i < tran.length; i++) {
        ret[i] = _reduce(tran[i], dim - 1, callback);
      }
      return ret;
    }
  } else {
    ret = [];
    for (i = 0; i < mat.length; i++) {
      ret[i] = _reduce(mat[i], dim - 1, callback);
    }
    return ret;
  }
}

// src/function/arithmetic/ceil.ts
var name14 = "ceil";
new Decimal(10);
var createCeilNumber = /* @__PURE__ */ factory(
  name14,
  ["typed", "config", "round"],
  ({ typed: typed2, config, round }) => {
    function _ceilNumber(x) {
      const c = Math.ceil(x);
      const r = round(x);
      if (c === r) return c;
      if (nearlyEqual(x, r, config.relTol, config.absTol) && !nearlyEqual(x, c, config.relTol, config.absTol)) {
        return r;
      }
      return c;
    }
    return typed2(name14, {
      number: _ceilNumber,
      "number, number": function(x, n) {
        if (!isInteger(n)) {
          throw new RangeError(
            "number of decimals in function ceil must be an integer"
          );
        }
        if (n < 0 || n > 15) {
          throw new RangeError(
            "number of decimals in ceil number must be in range 0-15"
          );
        }
        const shift = 10 ** n;
        return _ceilNumber(x * shift) / shift;
      }
    });
  }
);

// src/function/arithmetic/fix.ts
var name15 = "fix";
var createFixNumber = /* @__PURE__ */ factory(
  name15,
  ["typed", "ceil", "floor"],
  ({ typed: typed2, ceil, floor }) => {
    return typed2(name15, {
      number: function(x) {
        return x > 0 ? floor(x) : ceil(x);
      },
      "number, number": function(x, n) {
        return x > 0 ? floor(x, n) : ceil(x, n);
      }
    });
  }
);
var name16 = "floor";
new Decimal(10);
var createFloorNumber = /* @__PURE__ */ factory(
  name16,
  ["typed", "config", "round"],
  ({ typed: typed2, config, round }) => {
    function _floorNumber(x) {
      const f = Math.floor(x);
      const r = round(x);
      if (f === r) return f;
      if (nearlyEqual(x, r, config.relTol, config.absTol) && !nearlyEqual(x, f, config.relTol, config.absTol)) {
        return r;
      }
      return f;
    }
    return typed2(name16, {
      number: _floorNumber,
      "number, number": function(x, n) {
        if (!isInteger(n)) {
          throw new RangeError(
            "number of decimals in function floor must be an integer"
          );
        }
        if (n < 0 || n > 15) {
          throw new RangeError(
            "number of decimals in floor number must be in range 0 - 15"
          );
        }
        const shift = 10 ** n;
        return _floorNumber(x * shift) / shift;
      }
    });
  }
);

// src/function/arithmetic/hypot.ts
var name17 = "hypot";
var dependencies15 = [
  "typed",
  "abs",
  "addScalar",
  "divideScalar",
  "multiplyScalar",
  "sqrt",
  "smaller",
  "isPositive"
];
var createHypot = /* @__PURE__ */ factory(
  name17,
  dependencies15,
  ({
    typed: typed2,
    abs,
    addScalar,
    divideScalar,
    multiplyScalar,
    sqrt,
    smaller,
    isPositive
  }) => {
    return typed2(name17, {
      "... number | BigNumber": _hypot,
      Array: _hypot,
      Matrix: (M) => _hypot(flatten(M.toArray(), true))
    });
    function _hypot(args) {
      let result = 0;
      let largest = 0;
      for (let i = 0; i < args.length; i++) {
        if (isComplex(args[i])) {
          throw new TypeError("Unexpected type of argument to hypot");
        }
        const value = abs(args[i]);
        if (smaller(largest, value)) {
          result = multiplyScalar(
            result,
            multiplyScalar(
              divideScalar(largest, value),
              divideScalar(largest, value)
            )
          );
          result = addScalar(result, 1);
          largest = value;
        } else {
          result = addScalar(
            result,
            isPositive(value) ? multiplyScalar(
              divideScalar(value, largest),
              divideScalar(value, largest)
            ) : value
          );
        }
      }
      return multiplyScalar(largest, sqrt(result));
    }
  }
);

// src/function/combinatorics/stirlingS2.ts
var name18 = "stirlingS2";
var dependencies16 = [
  "typed",
  "addScalar",
  "subtractScalar",
  "multiplyScalar",
  "divideScalar",
  "pow",
  "factorial",
  "combinations",
  "isNegative",
  "isInteger",
  "number",
  "?bignumber",
  "larger"
];
var createStirlingS2 = /* @__PURE__ */ factory(
  name18,
  dependencies16,
  ({
    typed: typed2,
    addScalar,
    subtractScalar: _subtractScalar,
    multiplyScalar,
    divideScalar: _divideScalar,
    pow: _pow,
    factorial: _factorial,
    combinations: _combinations,
    isNegative,
    isInteger: isInteger2,
    number,
    bignumber,
    larger
  }) => {
    const smallCache = [];
    const bigCache = [];
    return typed2(name18, {
      "number | BigNumber, number | BigNumber": function(n, k) {
        if (!isInteger2(n) || isNegative(n) || !isInteger2(k) || isNegative(k)) {
          throw new TypeError(
            "Non-negative integer value expected in function stirlingS2"
          );
        } else if (larger(k, n)) {
          throw new TypeError(
            "k must be less than or equal to n in function stirlingS2"
          );
        }
        const big = !(isNumber(n) && isNumber(k));
        const cache = big ? bigCache : smallCache;
        const make = big ? bignumber : number;
        const nn = number(n);
        const nk = number(k);
        if (cache[nn] && cache[nn].length > nk) {
          return cache[nn][nk];
        }
        for (let m = 0; m <= nn; ++m) {
          if (!cache[m]) {
            cache[m] = [m === 0 ? make(1) : make(0)];
          }
          if (m === 0) continue;
          const row = cache[m];
          const prev = cache[m - 1];
          for (let i = row.length; i <= m && i <= nk; ++i) {
            if (i === m) {
              row[i] = 1;
            } else {
              row[i] = addScalar(multiplyScalar(make(i), prev[i]), prev[i - 1]);
            }
          }
        }
        return cache[nn][nk];
      }
    });
  }
);

// src/function/combinatorics/bellNumbers.ts
var name19 = "bellNumbers";
var dependencies17 = [
  "typed",
  "addScalar",
  "isNegative",
  "isInteger",
  "stirlingS2"
];
var createBellNumbers = /* @__PURE__ */ factory(
  name19,
  dependencies17,
  ({
    typed: typed2,
    addScalar,
    isNegative,
    isInteger: isInteger2,
    stirlingS2
  }) => {
    return typed2(name19, {
      "number | BigNumber": function(n) {
        if (!isInteger2(n) || isNegative(n)) {
          throw new TypeError(
            "Non-negative integer value expected in function bellNumbers"
          );
        }
        let result = 0;
        for (let i = 0; i <= n; i++) {
          result = addScalar(result, stirlingS2(n, i));
        }
        return result;
      }
    });
  }
);

// src/function/combinatorics/catalan.ts
var name20 = "catalan";
var dependencies18 = [
  "typed",
  "addScalar",
  "divideScalar",
  "multiplyScalar",
  "combinations",
  "isNegative",
  "isInteger"
];
var createCatalan = /* @__PURE__ */ factory(
  name20,
  dependencies18,
  ({
    typed: typed2,
    addScalar,
    divideScalar,
    multiplyScalar,
    combinations,
    isNegative,
    isInteger: isInteger2
  }) => {
    return typed2(name20, {
      "number | BigNumber": function(n) {
        if (!isInteger2(n) || isNegative(n)) {
          throw new TypeError(
            "Non-negative integer value expected in function catalan"
          );
        }
        return divideScalar(
          combinations(multiplyScalar(n, 2), n),
          addScalar(n, 1)
        );
      }
    });
  }
);

// src/function/combinatorics/composition.ts
var name21 = "composition";
var dependencies19 = [
  "typed",
  "addScalar",
  "combinations",
  "isNegative",
  "isPositive",
  "isInteger",
  "larger"
];
var createComposition = /* @__PURE__ */ factory(
  name21,
  dependencies19,
  ({
    typed: typed2,
    addScalar,
    combinations,
    isPositive,
    isNegative: _isNegative,
    isInteger: isInteger2,
    larger
  }) => {
    return typed2(name21, {
      "number | BigNumber, number | BigNumber": function(n, k) {
        if (!isInteger2(n) || !isPositive(n) || !isInteger2(k) || !isPositive(k)) {
          throw new TypeError(
            "Positive integer value expected in function composition"
          );
        } else if (larger(k, n)) {
          throw new TypeError(
            "k must be less than or equal to n in function composition"
          );
        }
        return combinations(
          addScalar(n, -1),
          addScalar(k, -1)
        );
      }
    });
  }
);

// src/version.ts
var version = "15.1.0";

// src/utils/lruQueue.ts
function lruQueue(limit) {
  let size = 0;
  let base = 1;
  let queue = /* @__PURE__ */ Object.create(null);
  let map2 = /* @__PURE__ */ Object.create(null);
  let index = 0;
  const del = function(id) {
    const oldIndex = map2[id];
    if (!oldIndex) return;
    delete queue[oldIndex];
    delete map2[id];
    --size;
    if (base !== oldIndex) return;
    if (!size) {
      index = 0;
      base = 1;
      return;
    }
    while (!Object.prototype.hasOwnProperty.call(queue, ++base)) {
    }
  };
  limit = Math.abs(limit);
  return {
    hit: function(id) {
      const oldIndex = map2[id];
      const nuIndex = ++index;
      queue[nuIndex] = id;
      map2[id] = nuIndex;
      if (!oldIndex) {
        ++size;
        if (size <= limit) return void 0;
        id = queue[base];
        del(id);
        return id;
      }
      delete queue[oldIndex];
      if (base !== oldIndex) return void 0;
      while (!Object.prototype.hasOwnProperty.call(queue, ++base)) {
      }
      return void 0;
    },
    delete: del,
    clear: function() {
      size = index = 0;
      base = 1;
      queue = /* @__PURE__ */ Object.create(null);
      map2 = /* @__PURE__ */ Object.create(null);
    }
  };
}

// src/utils/function.ts
function memoize(fn, { hasher: hasher2, limit } = {}) {
  limit = limit == null ? Number.POSITIVE_INFINITY : limit;
  hasher2 = hasher2 == null ? JSON.stringify : hasher2;
  const memoized = function() {
    if (typeof memoized.cache !== "object") {
      memoized.cache = {
        values: /* @__PURE__ */ new Map(),
        lru: lruQueue(limit || Number.POSITIVE_INFINITY)
      };
    }
    const args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    const hash = hasher2(args);
    if (memoized.cache.values.has(hash)) {
      memoized.cache.lru.hit(hash);
      return memoized.cache.values.get(hash);
    }
    const newVal = fn.apply(fn, args);
    memoized.cache.values.set(hash, newVal);
    memoized.cache.values.delete(memoized.cache.lru.hit(hash));
    return newVal;
  };
  return memoized;
}

// src/utils/bignumber/constants.ts
var createBigNumberE = memoize(
  function(BigNumber) {
    return new BigNumber(1).exp();
  },
  { hasher }
);
var createBigNumberPhi = memoize(
  function(BigNumber) {
    return new BigNumber(1).plus(new BigNumber(5).sqrt()).div(2);
  },
  { hasher }
);
var createBigNumberPi = memoize(
  function(BigNumber) {
    return BigNumber.acos(-1);
  },
  { hasher }
);
var createBigNumberTau = memoize(
  function(BigNumber) {
    return createBigNumberPi(BigNumber).times(2);
  },
  { hasher }
);
function hasher(args) {
  return args[0].precision;
}

// src/constants.ts
var createTrue = /* @__PURE__ */ factory("true", [], () => true);
var createFalse = /* @__PURE__ */ factory("false", [], () => false);
var createNull = /* @__PURE__ */ factory("null", [], () => null);
var createInfinity = /* @__PURE__ */ recreateFactory(
  "Infinity",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(Infinity) : Infinity
);
var createNaN = /* @__PURE__ */ recreateFactory(
  "NaN",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(NaN) : NaN
);
var createPi = /* @__PURE__ */ recreateFactory(
  "pi",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? createBigNumberPi(BigNumber) : pi
);
var createTau = /* @__PURE__ */ recreateFactory(
  "tau",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? createBigNumberTau(BigNumber) : tau
);
var createE = /* @__PURE__ */ recreateFactory(
  "e",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? createBigNumberE(BigNumber) : e
);
var createPhi = /* @__PURE__ */ recreateFactory(
  "phi",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? createBigNumberPhi(BigNumber) : phi
);
var createLN2 = /* @__PURE__ */ recreateFactory(
  "LN2",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(2).ln() : Math.LN2
);
var createLN10 = /* @__PURE__ */ recreateFactory(
  "LN10",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(10).ln() : Math.LN10
);
var createLOG2E = /* @__PURE__ */ recreateFactory(
  "LOG2E",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(1).div(new BigNumber(2).ln()) : Math.LOG2E
);
var createLOG10E = /* @__PURE__ */ recreateFactory(
  "LOG10E",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(1).div(new BigNumber(10).ln()) : Math.LOG10E
);
var createSQRT1_2 = /* @__PURE__ */ recreateFactory(
  // eslint-disable-line camelcase
  "SQRT1_2",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber("0.5").sqrt() : Math.SQRT1_2
);
var createSQRT2 = /* @__PURE__ */ recreateFactory(
  "SQRT2",
  ["config", "?BigNumber"],
  ({ config, BigNumber }) => config.number === "BigNumber" ? new BigNumber(2).sqrt() : Math.SQRT2
);
var createUppercasePi = /* @__PURE__ */ factory(
  "PI",
  ["pi"],
  ({ pi: pi2 }) => pi2
);
var createUppercaseE = /* @__PURE__ */ factory(
  "E",
  ["e"],
  ({ e: e2 }) => e2
);
var createVersion = /* @__PURE__ */ factory(
  "version",
  [],
  () => version
);
function recreateFactory(name114, dependencies102, create) {
  return factory(name114, dependencies102, create, {
    recreateOnConfigChange: true
  });
}

// src/type/number.ts
var name22 = "number";
var dependencies20 = ["typed"];
function getNonDecimalNumberParts(input) {
  const nonDecimalWithRadixMatch = input.match(
    /(0[box])([0-9a-fA-F]*)\.([0-9a-fA-F]*)/
  );
  if (nonDecimalWithRadixMatch) {
    const radix = { "0b": 2, "0o": 8, "0x": 16 }[nonDecimalWithRadixMatch[1]];
    const integerPart = nonDecimalWithRadixMatch[2];
    const fractionalPart = nonDecimalWithRadixMatch[3];
    return { input, radix, integerPart, fractionalPart };
  } else {
    return null;
  }
}
function makeNumberFromNonDecimalParts(parts) {
  const n = parseInt(parts.integerPart, parts.radix);
  let f = 0;
  for (let i = 0; i < parts.fractionalPart.length; i++) {
    const digitValue = parseInt(parts.fractionalPart[i], parts.radix);
    f += digitValue / Math.pow(parts.radix, i + 1);
  }
  const result = n + f;
  if (isNaN(result)) {
    throw new SyntaxError('String "' + parts.input + '" is not a valid number');
  }
  return result;
}
var createNumber = /* @__PURE__ */ factory(
  name22,
  dependencies20,
  ({ typed: typed2 }) => {
    const number = typed2("number", {
      "": function() {
        return 0;
      },
      number: function(x) {
        return x;
      },
      string: function(x) {
        if (x === "NaN") return NaN;
        const nonDecimalNumberParts = getNonDecimalNumberParts(x);
        if (nonDecimalNumberParts) {
          return makeNumberFromNonDecimalParts(nonDecimalNumberParts);
        }
        let size = 0;
        const wordSizeSuffixMatch = x.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
        if (wordSizeSuffixMatch) {
          size = Number(wordSizeSuffixMatch[2]);
          x = wordSizeSuffixMatch[1];
        }
        let num = Number(x);
        if (isNaN(num)) {
          throw new SyntaxError('String "' + x + '" is not a valid number');
        }
        if (wordSizeSuffixMatch) {
          if (num > 2 ** size - 1) {
            throw new SyntaxError(`String "${x}" is out of range`);
          }
          if (num >= 2 ** (size - 1)) {
            num = num - 2 ** size;
          }
        }
        return num;
      },
      BigNumber: function(x) {
        return x.toNumber();
      },
      bigint: function(x) {
        return Number(x);
      },
      Fraction: function(x) {
        return x.valueOf();
      },
      Unit: typed2.referToSelf((self) => (x) => {
        const clone3 = x.clone();
        clone3.value = self(x.value);
        return clone3;
      }),
      null: function(_x) {
        return 0;
      },
      "Unit, string | Unit": function(unit, valuelessUnit) {
        return unit.toNumber(valuelessUnit);
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      )
    });
    number.fromJSON = function(json) {
      return parseFloat(json.value);
    };
    return number;
  }
);

// src/type/bigint.ts
var name23 = "bigint";
var dependencies21 = ["typed"];
var createBigint = /* @__PURE__ */ factory(
  name23,
  dependencies21,
  ({ typed: typed2 }) => {
    const bigint = typed2("bigint", {
      "": function() {
        return 0n;
      },
      bigint: function(x) {
        return x;
      },
      number: function(x) {
        return BigInt(x.toFixed());
      },
      BigNumber: function(x) {
        return BigInt(x.round().toString());
      },
      Fraction: function(x) {
        return BigInt(x.valueOf().toFixed());
      },
      "string | boolean": function(x) {
        return BigInt(x);
      },
      null: function(_x) {
        return 0n;
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      )
    });
    bigint.fromJSON = function(json) {
      return BigInt(json.value);
    };
    return bigint;
  }
);

// src/type/string.ts
var name24 = "string";
var dependencies22 = ["typed"];
var createString = /* @__PURE__ */ factory(
  name24,
  dependencies22,
  ({ typed: typed2 }) => {
    return typed2(name24, {
      "": function() {
        return "";
      },
      number: format,
      null: function(_x) {
        return "null";
      },
      boolean: function(x) {
        return x + "";
      },
      string: function(x) {
        return x;
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      ),
      any: function(x) {
        return String(x);
      }
    });
  }
);

// src/type/boolean.ts
var name25 = "boolean";
var dependencies23 = ["typed"];
var createBoolean = /* @__PURE__ */ factory(
  name25,
  dependencies23,
  ({ typed: typed2 }) => {
    return typed2(name25, {
      "": function() {
        return false;
      },
      boolean: function(x) {
        return x;
      },
      number: function(x) {
        return !!x;
      },
      null: function(_x) {
        return false;
      },
      BigNumber: function(x) {
        return !x.isZero();
      },
      string: function(x) {
        const lcase = x.toLowerCase();
        if (lcase === "true") {
          return true;
        } else if (lcase === "false") {
          return false;
        }
        const num = Number(x);
        if (x !== "" && !isNaN(num)) {
          return !!num;
        }
        throw new Error('Cannot convert "' + x + '" to a boolean');
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      )
    });
  }
);

// src/expression/function/parser.ts
var name26 = "parser";
var dependencies24 = ["typed", "Parser"];
var createParser = /* @__PURE__ */ factory(
  name26,
  dependencies24,
  ({ typed: typed2, Parser }) => {
    return typed2(name26, {
      "": function() {
        return new Parser();
      }
    });
  }
);

// src/expression/keywords.ts
var keywords = /* @__PURE__ */ new Set(["end"]);

// src/expression/node/Node.ts
var name27 = "Node";
var dependencies25 = ["mathWithTransform"];
var createNode = /* @__PURE__ */ factory(
  name27,
  dependencies25,
  ({ mathWithTransform }) => {
    function _validateScope(scope) {
      for (const symbol of [...keywords]) {
        if (scope.has(symbol)) {
          throw new Error(
            'Scope contains an illegal symbol, "' + symbol + '" is a reserved keyword'
          );
        }
      }
    }
    class Node {
      get type() {
        return "Node";
      }
      get isNode() {
        return true;
      }
      /**
       * Evaluate the node
       * @param {Object} [scope]  Scope to read/write variables
       * @return {*}              Returns the result
       */
      evaluate(scope) {
        return this.compile().evaluate(scope);
      }
      /**
       * Compile the node into an optimized, evauatable JavaScript function
       * @return {{evaluate: function([Object])}} object
       *                Returns an object with a function 'evaluate',
       *                which can be invoked as expr.evaluate([scope: Object]),
       *                where scope is an optional object with
       *                variables.
       */
      compile() {
        const expr = this._compile(mathWithTransform, {});
        const args = {};
        const context = null;
        function evaluate(scope) {
          const s = createMap(scope);
          _validateScope(s);
          return expr(s, args, context);
        }
        return {
          evaluate
        };
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(_math, _argNames) {
        throw new Error(
          "Method _compile must be implemented by type " + this.type
        );
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(_callback) {
        throw new Error("Cannot run forEach on a Node interface");
      }
      /**
       * Create a new Node whose children are the results of calling the
       * provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {OperatorNode} Returns a transformed copy of the node
       */
      map(_callback) {
        throw new Error("Cannot run map on a Node interface");
      }
      /**
       * Validate whether an object is a Node, for use with map
       * @param {Node} node
       * @returns {Node} Returns the input if it's a node, else throws an Error
       * @protected
       */
      _ifNode(node) {
        if (!isNode(node)) {
          throw new TypeError("Callback function must return a Node");
        }
        return node;
      }
      /**
       * Recursively traverse all nodes in a node tree. Executes given callback for
       * this node and each of its child nodes.
       * @param {function(node: Node, path: string, parent: Node)} callback
       *          A callback called for every node in the node tree.
       */
      traverse(callback) {
        callback(this, null, null);
        function _traverse(node, callback2) {
          node.forEach(function(child, path, parent) {
            callback2(child, path, parent);
            _traverse(child, callback2);
          });
        }
        _traverse(this, callback);
      }
      /**
       * Recursively transform a node tree via a transform function.
       *
       * For example, to replace all nodes of type SymbolNode having name 'x' with
       * a ConstantNode with value 2:
       *
       *     const res = Node.transform(function (node, path, parent) {
       *       if (node && node.isSymbolNode) && (node.name === 'x')) {
       *         return new ConstantNode(2)
       *       }
       *       else {
       *         return node
       *       }
       *     })
       *
       * @param {function(node: Node, path: string, parent: Node) : Node} callback
       *          A mapping function accepting a node, and returning
       *          a replacement for the node or the original node. The "signature"
       *          of the callback must be:
       *          callback(node: Node, index: string, parent: Node) : Node
       * @return {Node} Returns the original node or its replacement
       */
      transform(callback) {
        function _transform(child, path, parent) {
          const replacement = callback(child, path, parent);
          if (replacement !== child) {
            return replacement;
          }
          return child.map(_transform);
        }
        return _transform(this, null, null);
      }
      /**
       * Find any node in the node tree matching given filter function. For
       * example, to find all nodes of type SymbolNode having name 'x':
       *
       *     const results = Node.filter(function (node) {
       *       return (node && node.isSymbolNode) && (node.name === 'x')
       *     })
       *
       * @param {function(node: Node, path: string, parent: Node) : Node} callback
       *            A test function returning true when a node matches, and false
       *            otherwise. Function signature:
       *            callback(node: Node, index: string, parent: Node) : boolean
       * @return {Node[]} nodes
       *            An array with nodes matching given filter criteria
       */
      filter(callback) {
        const nodes = [];
        this.traverse(function(node, path, parent) {
          if (callback(node, path, parent)) {
            nodes.push(node);
          }
        });
        return nodes;
      }
      /**
       * Create a shallow clone of this node
       * @return {Node}
       */
      clone() {
        throw new Error("Cannot clone a Node interface");
      }
      /**
       * Create a deep clone of this node
       * @return {Node}
       */
      cloneDeep() {
        return this.map(function(node) {
          return node.cloneDeep();
        });
      }
      /**
       * Deep compare this node with another node.
       * @param {Node} other
       * @return {boolean} Returns true when both nodes are of the same type and
       *                   contain the same values (as do their childs)
       */
      equals(other) {
        return other ? this.type === other.type && deepStrictEqual(this, other) : false;
      }
      /**
       * Get string representation. (wrapper function)
       *
       * This function can get an object of the following form:
       * {
       *    handler: //This can be a callback function of the form
       *             // "function callback(node, options)"or
       *             // a map that maps function names (used in FunctionNodes)
       *             // to callbacks
       *    parenthesis: "keep" //the parenthesis option (This is optional)
       * }
       *
       * @param {Object} [options]
       * @return {string}
       */
      toString(options) {
        const customString = this._getCustomString(options);
        if (typeof customString !== "undefined") {
          return customString;
        }
        return this._toString(options);
      }
      /**
       * Internal function to generate the string output.
       * This has to be implemented by every Node
       *
       * @throws {Error}
       */
      _toString(_options) {
        throw new Error("_toString not implemented for " + this.type);
      }
      /**
       * Get a JSON representation of the node
       * Both .toJSON() and the static .fromJSON(json) should be implemented by all
       * implementations of Node
       * @returns {Object}
       */
      toJSON() {
        throw new Error(
          "Cannot serialize object: toJSON not implemented by " + this.type
        );
      }
      /**
       * Get HTML representation. (wrapper function)
       *
       * This function can get an object of the following form:
       * {
       *    handler: //This can be a callback function of the form
       *             // "function callback(node, options)" or
       *             // a map that maps function names (used in FunctionNodes)
       *             // to callbacks
       *    parenthesis: "keep" //the parenthesis option (This is optional)
       * }
       *
       * @param {Object} [options]
       * @return {string}
       */
      toHTML(options) {
        const customString = this._getCustomString(options);
        if (typeof customString !== "undefined") {
          return customString;
        }
        return this._toHTML(options);
      }
      /**
       * Internal function to generate the HTML output.
       * This has to be implemented by every Node
       *
       * @throws {Error}
       */
      _toHTML(_options) {
        throw new Error("_toHTML not implemented for " + this.type);
      }
      /**
       * Get LaTeX representation. (wrapper function)
       *
       * This function can get an object of the following form:
       * {
       *    handler: //This can be a callback function of the form
       *             // "function callback(node, options)"or
       *             // a map that maps function names (used in FunctionNodes)
       *             // to callbacks
       *    parenthesis: "keep" //the parenthesis option (This is optional)
       * }
       *
       * @param {Object} [options]
       * @return {string}
       */
      toTex(options) {
        const customString = this._getCustomString(options);
        if (typeof customString !== "undefined") {
          return customString;
        }
        return this._toTex(options);
      }
      /**
       * Internal function to generate the LaTeX output.
       * This has to be implemented by every Node
       *
       * @param {Object} [options]
       * @throws {Error}
       */
      _toTex(_options) {
        throw new Error("_toTex not implemented for " + this.type);
      }
      /**
       * Helper used by `to...` functions.
       */
      _getCustomString(options) {
        if (options && typeof options === "object") {
          switch (typeof options.handler) {
            case "object":
            case "undefined":
              return;
            case "function":
              return options.handler(this, options);
            default:
              throw new TypeError("Object or function expected as callback");
          }
        }
      }
      /**
       * Get identifier.
       * @return {string}
       */
      getIdentifier() {
        return this.type;
      }
      /**
       * Get the content of the current Node.
       * @return {Node} node
       **/
      getContent() {
        return this;
      }
    }
    return Node;
  },
  { isClass: true, isNode: true }
);

// src/expression/transform/utils/errorTransform.ts
function errorTransform(err) {
  if (err && err.isIndexError) {
    return new IndexError(
      err.index + 1,
      err.min + 1,
      err.max !== void 0 ? err.max + 1 : void 0
    );
  }
  return err;
}

// src/expression/node/utils/access.ts
function accessFactory({ subset }) {
  return function access(object, index) {
    try {
      if (Array.isArray(object)) {
        return subset(object, index);
      } else if (object && typeof object.subset === "function") {
        return object.subset(index);
      } else if (typeof object === "string") {
        return subset(object, index);
      } else if (typeof object === "object") {
        if (!index.isObjectProperty()) {
          throw new TypeError("Cannot apply a numeric index as object property");
        }
        return getSafeProperty(object, index.getObjectProperty());
      } else {
        throw new TypeError("Cannot apply index: unsupported type of object");
      }
    } catch (err) {
      throw errorTransform(err);
    }
  };
}

// src/expression/node/AccessorNode.ts
var name28 = "AccessorNode";
var dependencies26 = ["subset", "Node"];
var createAccessorNode = /* @__PURE__ */ factory(
  name28,
  dependencies26,
  ({
    subset,
    Node
  }) => {
    const access = accessFactory({ subset });
    function needParenthesis(node) {
      return !(isAccessorNode(node) || isArrayNode(node) || isConstantNode(node) || isFunctionNode(node) || isObjectNode(node) || isParenthesisNode(node) || isSymbolNode(node));
    }
    class AccessorNode extends Node {
      /**
       * @constructor AccessorNode
       * @extends {Node}
       * Access an object property or get a matrix subset
       *
       * @param {Node} object                 The object from which to retrieve
       *                                      a property or subset.
       * @param {IndexNode} index             IndexNode containing ranges
       * @param {boolean} [optionalChaining=false]
       *     Optional property, if the accessor was written as optional-chaining
       *     using `a?.b`, or `a?.["b"] with bracket notation.
       *     Forces evaluate to undefined if the given object is undefined or null.
       */
      constructor(object, index, optionalChaining = false) {
        super();
        if (!isNode(object)) {
          throw new TypeError('Node expected for parameter "object"');
        }
        if (!isIndexNode(index)) {
          throw new TypeError('IndexNode expected for parameter "index"');
        }
        this.object = object;
        this.index = index;
        this.optionalChaining = optionalChaining;
      }
      // readonly property name
      get name() {
        if (this.index) {
          return this.index.isObjectProperty() ? this.index.getObjectProperty() : "";
        } else {
          return this.object.name || "";
        }
      }
      get type() {
        return name28;
      }
      get isAccessorNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const evalObject = this.object._compile(math, argNames);
        const evalIndex = this.index._compile(math, argNames);
        const optionalChaining = this.optionalChaining;
        const prevOptionalChaining = isAccessorNode(this.object) && this.object.optionalChaining;
        if (this.index.isObjectProperty()) {
          const prop = this.index.getObjectProperty();
          return function evalAccessorNode(scope, args, context) {
            const ctx = context || {};
            const object = evalObject(scope, args, ctx);
            if (optionalChaining && object == null) {
              ctx.optionalShortCircuit = true;
              return void 0;
            }
            if (prevOptionalChaining && ctx?.optionalShortCircuit) {
              return void 0;
            }
            return getSafeProperty(object, prop);
          };
        } else {
          return function evalAccessorNode(scope, args, context) {
            const ctx = context || {};
            const object = evalObject(scope, args, ctx);
            if (optionalChaining && object == null) {
              ctx.optionalShortCircuit = true;
              return void 0;
            }
            if (prevOptionalChaining && ctx?.optionalShortCircuit) {
              return void 0;
            }
            const index = evalIndex(scope, args, object);
            return access(object, index);
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.object, "object", this);
        callback(this.index, "index", this);
      }
      /**
       * Create a new AccessorNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {AccessorNode} Returns a transformed copy of the node
       */
      map(callback) {
        return new AccessorNode(
          this._ifNode(callback(this.object, "object", this)),
          this._ifNode(callback(this.index, "index", this)),
          this.optionalChaining
        );
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {AccessorNode}
       */
      clone() {
        return new AccessorNode(this.object, this.index, this.optionalChaining);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string}
       */
      _toString(options) {
        let object = this.object.toString(options);
        if (needParenthesis(this.object)) {
          object = "(" + object + ")";
        }
        const optionalChaining = this.optionalChaining ? this.index.dotNotation ? "?" : "?." : "";
        return object + optionalChaining + this.index.toString(options);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string}
       */
      _toHTML(options) {
        let object = this.object.toHTML(options);
        if (needParenthesis(this.object)) {
          object = '<span class="math-parenthesis math-round-parenthesis">(</span>' + object + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        return object + this.index.toHTML(options);
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string}
       */
      _toTex(options) {
        let object = this.object.toTex(options);
        if (needParenthesis(this.object)) {
          object = "\\left(' + object + '\\right)";
        }
        return object + this.index.toTex(options);
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name28,
          object: this.object,
          index: this.index,
          optionalChaining: this.optionalChaining
        };
      }
      /**
       * Instantiate an AccessorNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "AccessorNode", object: ..., index: ...}`,
       *     where mathjs is optional
       * @returns {AccessorNode}
       */
      static fromJSON(json) {
        return new AccessorNode(json.object, json.index, json.optionalChaining);
      }
    }
    Object.defineProperty(AccessorNode, "name", {
      value: name28,
      configurable: true
    });
    return AccessorNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/ArrayNode.ts
var name29 = "ArrayNode";
var dependencies27 = ["Node"];
var createArrayNode = /* @__PURE__ */ factory(
  name29,
  dependencies27,
  ({ Node }) => {
    class ArrayNode extends Node {
      /**
       * @constructor ArrayNode
       * @extends {Node}
       * Holds an 1-dimensional array with items
       * @param {Node[]} [items]   1 dimensional array with items
       */
      constructor(items) {
        super();
        this.items = items || [];
        if (!Array.isArray(this.items) || !this.items.every(isNode)) {
          throw new TypeError("Array containing Nodes expected");
        }
      }
      get type() {
        return name29;
      }
      get isArrayNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const evalItems = map(this.items, function(item) {
          return item._compile(math, argNames);
        });
        const asMatrix = math.config.matrix !== "Array";
        if (asMatrix) {
          const matrix = math.matrix;
          return function evalArrayNode(scope, args, context) {
            return matrix(
              map(evalItems, function(evalItem) {
                return evalItem(scope, args, context);
              })
            );
          };
        } else {
          return function evalArrayNode(scope, args, context) {
            return map(evalItems, function(evalItem) {
              return evalItem(scope, args, context);
            });
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        for (let i = 0; i < this.items.length; i++) {
          const node = this.items[i];
          callback(node, "items[" + i + "]", this);
        }
      }
      /**
       * Create a new ArrayNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {ArrayNode} Returns a transformed copy of the node
       */
      map(callback) {
        const items = [];
        for (let i = 0; i < this.items.length; i++) {
          items[i] = this._ifNode(
            callback(this.items[i], "items[" + i + "]", this)
          );
        }
        return new ArrayNode(items);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {ArrayNode}
       */
      clone() {
        return new ArrayNode(this.items.slice(0));
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toString(options) {
        const items = this.items.map(function(node) {
          return node.toString(options);
        });
        return "[" + items.join(", ") + "]";
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name29,
          items: this.items
        };
      }
      /**
       * Instantiate an ArrayNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "ArrayNode", items: [...]}`,
       *                       where mathjs is optional
       * @returns {ArrayNode}
       */
      static fromJSON(json) {
        return new ArrayNode(json.items);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toHTML(options) {
        const items = this.items.map(function(node) {
          return node.toHTML(options);
        });
        return '<span class="math-parenthesis math-square-parenthesis">[</span>' + items.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-square-parenthesis">]</span>';
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        function itemsToTex(items, nested) {
          const mixedItems = items.some(isArrayNode) && !items.every(isArrayNode);
          const itemsFormRow = nested || mixedItems;
          const itemSep = itemsFormRow ? "&" : "\\\\";
          const itemsTex = items.map(function(node) {
            if (node.items) {
              return itemsToTex(node.items, !nested);
            } else {
              return node.toTex(options);
            }
          }).join(itemSep);
          return mixedItems || !itemsFormRow || itemsFormRow && !nested ? "\\begin{bmatrix}" + itemsTex + "\\end{bmatrix}" : itemsTex;
        }
        return itemsToTex(this.items, false);
      }
    }
    Object.defineProperty(ArrayNode, "name", {
      value: name29,
      configurable: true
    });
    return ArrayNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/utils/assign.ts
function assignFactory({
  subset,
  matrix
}) {
  return function assign(object, index, value) {
    try {
      if (Array.isArray(object)) {
        const result = matrix(object).subset(index, value).valueOf();
        result.forEach((item, index2) => {
          object[index2] = item;
        });
        return object;
      } else if (object && typeof object.subset === "function") {
        return object.subset(index, value);
      } else if (typeof object === "string") {
        return subset(object, index, value);
      } else if (typeof object === "object") {
        if (!index.isObjectProperty()) {
          throw TypeError("Cannot apply a numeric index as object property");
        }
        setSafeProperty(object, index.getObjectProperty(), value);
        return object;
      } else {
        throw new TypeError("Cannot apply index: unsupported type of object");
      }
    } catch (err) {
      throw errorTransform(err);
    }
  };
}

// src/expression/node/AssignmentNode.ts
var name30 = "AssignmentNode";
var dependencies28 = [
  "subset",
  "?matrix",
  // FIXME: should not be needed at all, should be handled by subset
  "Node"
];
var createAssignmentNode = /* @__PURE__ */ factory(
  name30,
  dependencies28,
  ({
    subset,
    matrix,
    Node
  }) => {
    const access = accessFactory({ subset });
    const assign = assignFactory({ subset, matrix });
    function needParenthesis(node, parenthesis, implicit) {
      if (!parenthesis) {
        parenthesis = "keep";
      }
      const precedence = getPrecedence(node, parenthesis, implicit, void 0);
      const exprPrecedence = getPrecedence(
        node.value,
        parenthesis,
        implicit,
        void 0
      );
      return parenthesis === "all" || exprPrecedence !== null && exprPrecedence <= precedence;
    }
    class AssignmentNode extends Node {
      /**
       * @constructor AssignmentNode
       * @extends {Node}
       *
       * Define a symbol, like `a=3.2`, update a property like `a.b=3.2`, or
       * replace a subset of a matrix like `A[2,2]=42`.
       *
       * Syntax:
       *
       *     new AssignmentNode(symbol, value)
       *     new AssignmentNode(object, index, value)
       *
       * Usage:
       *
       *    new AssignmentNode(new SymbolNode('a'), new ConstantNode(2))  // a=2
       *    new AssignmentNode(new SymbolNode('a'),
       *                       new IndexNode('b'),
       *                       new ConstantNode(2))   // a.b=2
       *    new AssignmentNode(new SymbolNode('a'),
       *                       new IndexNode(1, 2),
       *                       new ConstantNode(3))  // a[1,2]=3
       *
       * @param {SymbolNode | AccessorNode} object
       *     Object on which to assign a value
       * @param {IndexNode} [index=null]
       *     Index, property name or matrix index. Optional. If not provided
       *     and `object` is a SymbolNode, the property is assigned to the
       *     global scope.
       * @param {Node} value
       *     The value to be assigned
       */
      constructor(object, index, value) {
        super();
        this.object = object;
        this.index = value ? index : null;
        this.value = value || index;
        if (!isSymbolNode(object) && !isAccessorNode(object)) {
          throw new TypeError('SymbolNode or AccessorNode expected as "object"');
        }
        if (isSymbolNode(object) && object.name === "end") {
          throw new Error('Cannot assign to symbol "end"');
        }
        if (this.index && !isIndexNode(this.index)) {
          throw new TypeError('IndexNode expected as "index"');
        }
        if (!isNode(this.value)) {
          throw new TypeError('Node expected as "value"');
        }
      }
      // readonly property name
      get name() {
        if (this.index) {
          return this.index.isObjectProperty() ? this.index.getObjectProperty() : "";
        } else {
          return this.object.name || "";
        }
      }
      get type() {
        return name30;
      }
      get isAssignmentNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const evalObject = this.object._compile(math, argNames);
        const evalIndex = this.index ? this.index._compile(math, argNames) : null;
        const evalValue = this.value._compile(math, argNames);
        const name114 = this.object.name;
        if (!this.index) {
          if (!isSymbolNode(this.object)) {
            throw new TypeError("SymbolNode expected as object");
          }
          return function evalAssignmentNode(scope, args, context) {
            const value = evalValue(scope, args, context);
            scope.set(name114, value);
            return value;
          };
        } else if (this.index.isObjectProperty()) {
          const prop = this.index.getObjectProperty();
          return function evalAssignmentNode(scope, args, context) {
            const object = evalObject(scope, args, context);
            const value = evalValue(scope, args, context);
            setSafeProperty(object, prop, value);
            return value;
          };
        } else if (isSymbolNode(this.object)) {
          return function evalAssignmentNode(scope, args, context) {
            const childObject = evalObject(scope, args, context);
            const value = evalValue(scope, args, context);
            const index = evalIndex(scope, args, childObject);
            scope.set(name114, assign(childObject, index, value));
            return value;
          };
        } else {
          const evalParentObject = this.object.object._compile(
            math,
            argNames
          );
          if (this.object.index.isObjectProperty()) {
            const parentProp = this.object.index.getObjectProperty();
            return function evalAssignmentNode(scope, args, context) {
              const parent = evalParentObject(scope, args, context);
              const childObject = getSafeProperty(parent, parentProp);
              const index = evalIndex(scope, args, childObject);
              const value = evalValue(scope, args, context);
              setSafeProperty(
                parent,
                parentProp,
                assign(childObject, index, value)
              );
              return value;
            };
          } else {
            const evalParentIndex = this.object.index._compile(
              math,
              argNames
            );
            return function evalAssignmentNode(scope, args, context) {
              const parent = evalParentObject(scope, args, context);
              const parentIndex = evalParentIndex(scope, args, parent);
              const childObject = access(parent, parentIndex);
              const index = evalIndex(scope, args, childObject);
              const value = evalValue(scope, args, context);
              assign(parent, parentIndex, assign(childObject, index, value));
              return value;
            };
          }
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.object, "object", this);
        if (this.index) {
          callback(this.index, "index", this);
        }
        callback(this.value, "value", this);
      }
      /**
       * Create a new AssignmentNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {AssignmentNode} Returns a transformed copy of the node
       */
      map(callback) {
        const object = this._ifNode(
          callback(this.object, "object", this)
        );
        const index = this.index ? this._ifNode(callback(this.index, "index", this)) : null;
        const value = this._ifNode(callback(this.value, "value", this));
        return new AssignmentNode(object, index, value);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {AssignmentNode}
       */
      clone() {
        return new AssignmentNode(this.object, this.index, this.value);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string}
       */
      _toString(options) {
        const object = this.object.toString(options);
        const index = this.index ? this.index.toString(options) : "";
        let value = this.value.toString(options);
        if (needParenthesis(
          this,
          options && options.parenthesis,
          options && options.implicit
        )) {
          value = "(" + value + ")";
        }
        return object + index + " = " + value;
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name30,
          object: this.object,
          index: this.index,
          value: this.value
        };
      }
      /**
       * Instantiate an AssignmentNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "AssignmentNode", object: ..., index: ..., value: ...}`,
       *     where mathjs is optional
       * @returns {AssignmentNode}
       */
      static fromJSON(json) {
        return new AssignmentNode(json.object, json.index, json.value);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string}
       */
      _toHTML(options) {
        const object = this.object.toHTML(options);
        const index = this.index ? this.index.toHTML(options) : "";
        let value = this.value.toHTML(options);
        if (needParenthesis(
          this,
          options && options.parenthesis,
          options && options.implicit
        )) {
          value = '<span class="math-paranthesis math-round-parenthesis">(</span>' + value + '<span class="math-paranthesis math-round-parenthesis">)</span>';
        }
        return object + index + '<span class="math-operator math-assignment-operator math-variable-assignment-operator math-binary-operator">=</span>' + value;
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string}
       */
      _toTex(options) {
        const object = this.object.toTex(options);
        const index = this.index ? this.index.toTex(options) : "";
        let value = this.value.toTex(options);
        if (needParenthesis(
          this,
          options && options.parenthesis,
          options && options.implicit
        )) {
          value = `\\left(${value}\\right)`;
        }
        return object + index + "=" + value;
      }
    }
    Object.defineProperty(AssignmentNode, "name", {
      value: name30,
      configurable: true
    });
    return AssignmentNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/BlockNode.ts
var name31 = "BlockNode";
var dependencies29 = ["ResultSet", "Node"];
var createBlockNode = /* @__PURE__ */ factory(
  name31,
  dependencies29,
  ({
    ResultSet,
    Node
  }) => {
    class BlockNode extends Node {
      /**
       * @constructor BlockNode
       * @extends {Node}
       * Holds a set with blocks
       * @param {Array.<{node: Node} | {node: Node, visible: boolean}>} blocks
       *            An array with blocks, where a block is constructed as an
       *            Object with properties block, which is a Node, and visible,
       *            which is a boolean. The property visible is optional and
       *            is true by default
       */
      constructor(blocks) {
        super();
        if (!Array.isArray(blocks)) throw new Error("Array expected");
        this.blocks = blocks.map(function(block) {
          const node = block && block.node;
          const visible = block && block.visible !== void 0 ? block.visible : true;
          if (!isNode(node))
            throw new TypeError('Property "node" must be a Node');
          if (typeof visible !== "boolean") {
            throw new TypeError('Property "visible" must be a boolean');
          }
          return { node, visible };
        });
      }
      get type() {
        return name31;
      }
      get isBlockNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const evalBlocks = map(this.blocks, function(block) {
          return {
            evaluate: block.node._compile(math, argNames),
            visible: block.visible
          };
        });
        return function evalBlockNodes(scope, args, context) {
          const results = [];
          forEach(evalBlocks, function evalBlockNode(block) {
            const result = block.evaluate(scope, args, context);
            if (block.visible) {
              results.push(result);
            }
          });
          return new ResultSet(results);
        };
      }
      /**
       * Execute a callback for each of the child blocks of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        for (let i = 0; i < this.blocks.length; i++) {
          callback(this.blocks[i].node, "blocks[" + i + "].node", this);
        }
      }
      /**
       * Create a new BlockNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {BlockNode} Returns a transformed copy of the node
       */
      map(callback) {
        const blocks = [];
        for (let i = 0; i < this.blocks.length; i++) {
          const block = this.blocks[i];
          const node = this._ifNode(
            callback(block.node, "blocks[" + i + "].node", this)
          );
          blocks[i] = {
            node,
            visible: block.visible
          };
        }
        return new BlockNode(blocks);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {BlockNode}
       */
      clone() {
        const blocks = this.blocks.map(function(block) {
          return {
            node: block.node,
            visible: block.visible
          };
        });
        return new BlockNode(blocks);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toString(options) {
        return this.blocks.map(function(param) {
          return param.node.toString(options) + (param.visible ? "" : ";");
        }).join("\n");
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name31,
          blocks: this.blocks
        };
      }
      /**
       * Instantiate an BlockNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "BlockNode", blocks: [{node: ..., visible: false}, ...]}`,
       *     where mathjs is optional
       * @returns {BlockNode}
       */
      static fromJSON(json) {
        return new BlockNode(json.blocks);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toHTML(options) {
        return this.blocks.map(function(param) {
          return param.node.toHTML(options) + (param.visible ? "" : '<span class="math-separator">;</span>');
        }).join('<span class="math-separator"><br /></span>');
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        return this.blocks.map(function(param) {
          return param.node.toTex(options) + (param.visible ? "" : ";");
        }).join("\\;\\;\n");
      }
    }
    Object.defineProperty(BlockNode, "name", {
      value: name31,
      configurable: true
    });
    return BlockNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/ConditionalNode.ts
var name32 = "ConditionalNode";
var dependencies30 = ["Node"];
var createConditionalNode = /* @__PURE__ */ factory(
  name32,
  dependencies30,
  ({ Node }) => {
    function testCondition(condition) {
      if (typeof condition === "number" || typeof condition === "boolean" || typeof condition === "string") {
        return !!condition;
      }
      if (condition) {
        if (isBigNumber(condition)) {
          return !condition.isZero();
        }
        if (isComplex(condition)) {
          return !!(condition.re || condition.im);
        }
        if (isUnit(condition)) {
          return !!condition.value;
        }
      }
      if (condition === null || condition === void 0) {
        return false;
      }
      throw new TypeError(
        'Unsupported type of condition "' + typeOf(condition) + '"'
      );
    }
    class ConditionalNode extends Node {
      /**
       * A lazy evaluating conditional operator: 'condition ? trueExpr : falseExpr'
       *
       * @param {Node} condition   Condition, must result in a boolean
       * @param {Node} trueExpr    Expression evaluated when condition is true
       * @param {Node} falseExpr   Expression evaluated when condition is true
       *
       * @constructor ConditionalNode
       * @extends {Node}
       */
      constructor(condition, trueExpr, falseExpr) {
        super();
        if (!isNode(condition)) {
          throw new TypeError("Parameter condition must be a Node");
        }
        if (!isNode(trueExpr)) {
          throw new TypeError("Parameter trueExpr must be a Node");
        }
        if (!isNode(falseExpr)) {
          throw new TypeError("Parameter falseExpr must be a Node");
        }
        this.condition = condition;
        this.trueExpr = trueExpr;
        this.falseExpr = falseExpr;
      }
      get type() {
        return name32;
      }
      get isConditionalNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const evalCondition = this.condition._compile(math, argNames);
        const evalTrueExpr = this.trueExpr._compile(math, argNames);
        const evalFalseExpr = this.falseExpr._compile(math, argNames);
        return function evalConditionalNode(scope, args, context) {
          return testCondition(evalCondition(scope, args, context)) ? evalTrueExpr(scope, args, context) : evalFalseExpr(scope, args, context);
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.condition, "condition", this);
        callback(this.trueExpr, "trueExpr", this);
        callback(this.falseExpr, "falseExpr", this);
      }
      /**
       * Create a new ConditionalNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {ConditionalNode} Returns a transformed copy of the node
       */
      map(callback) {
        return new ConditionalNode(
          this._ifNode(callback(this.condition, "condition", this)),
          this._ifNode(callback(this.trueExpr, "trueExpr", this)),
          this._ifNode(callback(this.falseExpr, "falseExpr", this))
        );
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {ConditionalNode}
       */
      clone() {
        return new ConditionalNode(
          this.condition,
          this.trueExpr,
          this.falseExpr
        );
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const precedence = getPrecedence(
          this,
          parenthesis,
          options && options.implicit,
          void 0
        );
        let condition = this.condition.toString(options);
        const conditionPrecedence = getPrecedence(
          this.condition,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.condition.type === "OperatorNode" || conditionPrecedence !== null && conditionPrecedence <= precedence) {
          condition = "(" + condition + ")";
        }
        let trueExpr = this.trueExpr.toString(options);
        const truePrecedence = getPrecedence(
          this.trueExpr,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.trueExpr.type === "OperatorNode" || truePrecedence !== null && truePrecedence <= precedence) {
          trueExpr = "(" + trueExpr + ")";
        }
        let falseExpr = this.falseExpr.toString(options);
        const falsePrecedence = getPrecedence(
          this.falseExpr,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.falseExpr.type === "OperatorNode" || falsePrecedence !== null && falsePrecedence <= precedence) {
          falseExpr = "(" + falseExpr + ")";
        }
        return condition + " ? " + trueExpr + " : " + falseExpr;
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name32,
          condition: this.condition,
          trueExpr: this.trueExpr,
          falseExpr: this.falseExpr
        };
      }
      /**
       * Instantiate an ConditionalNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     ```
       *     {"mathjs": "ConditionalNode",
       *      "condition": ...,
       *      "trueExpr": ...,
       *      "falseExpr": ...}
       *     ```
       *     where mathjs is optional
       * @returns {ConditionalNode}
       */
      static fromJSON(json) {
        return new ConditionalNode(
          json.condition,
          json.trueExpr,
          json.falseExpr
        );
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const precedence = getPrecedence(
          this,
          parenthesis,
          options && options.implicit,
          void 0
        );
        let condition = this.condition.toHTML(options);
        const conditionPrecedence = getPrecedence(
          this.condition,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.condition.type === "OperatorNode" || conditionPrecedence !== null && conditionPrecedence <= precedence) {
          condition = '<span class="math-parenthesis math-round-parenthesis">(</span>' + condition + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        let trueExpr = this.trueExpr.toHTML(options);
        const truePrecedence = getPrecedence(
          this.trueExpr,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.trueExpr.type === "OperatorNode" || truePrecedence !== null && truePrecedence <= precedence) {
          trueExpr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + trueExpr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        let falseExpr = this.falseExpr.toHTML(options);
        const falsePrecedence = getPrecedence(
          this.falseExpr,
          parenthesis,
          options && options.implicit,
          void 0
        );
        if (parenthesis === "all" || this.falseExpr.type === "OperatorNode" || falsePrecedence !== null && falsePrecedence <= precedence) {
          falseExpr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + falseExpr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        return condition + '<span class="math-operator math-conditional-operator">?</span>' + trueExpr + '<span class="math-operator math-conditional-operator">:</span>' + falseExpr;
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        return "\\begin{cases} {" + this.trueExpr.toTex(options) + "}, &\\quad{\\text{if }\\;" + this.condition.toTex(options) + "}\\\\{" + this.falseExpr.toTex(options) + "}, &\\quad{\\text{otherwise}}\\end{cases}";
      }
    }
    Object.defineProperty(ConditionalNode, "name", {
      value: name32,
      configurable: true
    });
    return ConditionalNode;
  },
  { isClass: true, isNode: true }
);
var latexSymbols = {
  // GREEK LETTERS
  Alpha: "A",
  alpha: "\\alpha",
  Beta: "B",
  beta: "\\beta",
  Gamma: "\\Gamma",
  gamma: "\\gamma",
  Delta: "\\Delta",
  delta: "\\delta",
  Epsilon: "E",
  epsilon: "\\epsilon",
  varepsilon: "\\varepsilon",
  Zeta: "Z",
  zeta: "\\zeta",
  Eta: "H",
  eta: "\\eta",
  Theta: "\\Theta",
  theta: "\\theta",
  vartheta: "\\vartheta",
  Iota: "I",
  iota: "\\iota",
  Kappa: "K",
  kappa: "\\kappa",
  varkappa: "\\varkappa",
  Lambda: "\\Lambda",
  lambda: "\\lambda",
  Mu: "M",
  mu: "\\mu",
  Nu: "N",
  nu: "\\nu",
  Xi: "\\Xi",
  xi: "\\xi",
  Omicron: "O",
  omicron: "o",
  Pi: "\\Pi",
  pi: "\\pi",
  varpi: "\\varpi",
  Rho: "P",
  rho: "\\rho",
  varrho: "\\varrho",
  Sigma: "\\Sigma",
  sigma: "\\sigma",
  varsigma: "\\varsigma",
  Tau: "T",
  tau: "\\tau",
  Upsilon: "\\Upsilon",
  upsilon: "\\upsilon",
  Phi: "\\Phi",
  phi: "\\phi",
  varphi: "\\varphi",
  Chi: "X",
  chi: "\\chi",
  Psi: "\\Psi",
  psi: "\\psi",
  Omega: "\\Omega",
  omega: "\\omega",
  // logic
  true: "\\mathrm{True}",
  false: "\\mathrm{False}",
  // other
  i: "i",
  // TODO use \i ??
  inf: "\\infty",
  Inf: "\\infty",
  infinity: "\\infty",
  Infinity: "\\infty",
  oo: "\\infty",
  lim: "\\lim",
  undefined: "\\mathbf{?}"
};
var latexOperators = {
  transpose: "^\\top",
  ctranspose: "^H",
  factorial: "!",
  pow: "^",
  dotPow: ".^\\wedge",
  // TODO find ideal solution
  unaryPlus: "+",
  unaryMinus: "-",
  bitNot: "\\~",
  // TODO find ideal solution
  not: "\\neg",
  multiply: "\\cdot",
  divide: "\\frac",
  // TODO how to handle that properly?
  dotMultiply: ".\\cdot",
  // TODO find ideal solution
  dotDivide: ".:",
  // TODO find ideal solution
  mod: "\\mod",
  add: "+",
  subtract: "-",
  to: "\\rightarrow",
  leftShift: "<<",
  rightArithShift: ">>",
  rightLogShift: ">>>",
  equal: "=",
  unequal: "\\neq",
  smaller: "<",
  larger: ">",
  smallerEq: "\\leq",
  largerEq: "\\geq",
  bitAnd: "\\&",
  bitXor: "\\underline{|}",
  bitOr: "|",
  and: "\\wedge",
  xor: "\\veebar",
  or: "\\vee"
};
var latexFunctions = {
  // arithmetic
  abs: { 1: "\\left|${args[0]}\\right|" },
  add: { 2: `\\left(\${args[0]}${latexOperators.add}\${args[1]}\\right)` },
  cbrt: { 1: "\\sqrt[3]{${args[0]}}" },
  ceil: { 1: "\\left\\lceil${args[0]}\\right\\rceil" },
  cube: { 1: "\\left(${args[0]}\\right)^3" },
  divide: { 2: "\\frac{${args[0]}}{${args[1]}}" },
  dotDivide: {
    2: `\\left(\${args[0]}${latexOperators.dotDivide}\${args[1]}\\right)`
  },
  dotMultiply: {
    2: `\\left(\${args[0]}${latexOperators.dotMultiply}\${args[1]}\\right)`
  },
  dotPow: {
    2: `\\left(\${args[0]}${latexOperators.dotPow}\${args[1]}\\right)`
  },
  exp: { 1: "\\exp\\left(${args[0]}\\right)" },
  expm1: `\\left(e${latexOperators.pow}{\${args[0]}}-1\\right)`,
  fix: { 1: "\\mathrm{${name}}\\left(${args[0]}\\right)" },
  floor: { 1: "\\left\\lfloor${args[0]}\\right\\rfloor" },
  fraction: { 2: "\\frac{${args[0]}}{${args[1]}}" },
  gcd: "\\gcd\\left(${args}\\right)",
  hypot: "\\hypot\\left(${args}\\right)",
  log: {
    1: "\\ln\\left(${args[0]}\\right)",
    2: "\\log_{${args[1]}}\\left(${args[0]}\\right)"
  },
  log10: { 1: "\\log_{10}\\left(${args[0]}\\right)" },
  log1p: {
    1: "\\ln\\left(${args[0]}+1\\right)",
    2: "\\log_{${args[1]}}\\left(${args[0]}+1\\right)"
  },
  log2: "\\log_{2}\\left(${args[0]}\\right)",
  mod: { 2: `\\left(\${args[0]}${latexOperators.mod}\${args[1]}\\right)` },
  multiply: {
    2: `\\left(\${args[0]}${latexOperators.multiply}\${args[1]}\\right)`
  },
  norm: {
    1: "\\left\\|${args[0]}\\right\\|",
    2: void 0
    // use default template
  },
  nthRoot: { 2: "\\sqrt[${args[1]}]{${args[0]}}" },
  nthRoots: { 2: "\\{y : y^${args[1]} = {${args[0]}}\\}" },
  pow: { 2: `\\left(\${args[0]}\\right)${latexOperators.pow}{\${args[1]}}` },
  round: {
    1: "\\left\\lfloor${args[0]}\\right\\rceil",
    2: void 0
    // use default template
  },
  sign: { 1: "\\mathrm{${name}}\\left(${args[0]}\\right)" },
  sqrt: { 1: "\\sqrt{${args[0]}}" },
  square: { 1: "\\left(${args[0]}\\right)^2" },
  subtract: {
    2: `\\left(\${args[0]}${latexOperators.subtract}\${args[1]}\\right)`
  },
  unaryMinus: { 1: `${latexOperators.unaryMinus}\\left(\${args[0]}\\right)` },
  unaryPlus: { 1: `${latexOperators.unaryPlus}\\left(\${args[0]}\\right)` },
  // bitwise
  bitAnd: {
    2: `\\left(\${args[0]}${latexOperators.bitAnd}\${args[1]}\\right)`
  },
  bitNot: { 1: latexOperators.bitNot + "\\left(${args[0]}\\right)" },
  bitOr: { 2: `\\left(\${args[0]}${latexOperators.bitOr}\${args[1]}\\right)` },
  bitXor: {
    2: `\\left(\${args[0]}${latexOperators.bitXor}\${args[1]}\\right)`
  },
  leftShift: {
    2: `\\left(\${args[0]}${latexOperators.leftShift}\${args[1]}\\right)`
  },
  rightArithShift: {
    2: `\\left(\${args[0]}${latexOperators.rightArithShift}\${args[1]}\\right)`
  },
  rightLogShift: {
    2: `\\left(\${args[0]}${latexOperators.rightLogShift}\${args[1]}\\right)`
  },
  // combinatorics
  bellNumbers: { 1: "\\mathrm{B}_{${args[0]}}" },
  catalan: { 1: "\\mathrm{C}_{${args[0]}}" },
  stirlingS2: { 2: "\\mathrm{S}\\left(${args}\\right)" },
  // complex
  arg: { 1: "\\arg\\left(${args[0]}\\right)" },
  conj: { 1: "\\left(${args[0]}\\right)^*" },
  im: { 1: "\\Im\\left\\lbrace${args[0]}\\right\\rbrace" },
  re: { 1: "\\Re\\left\\lbrace${args[0]}\\right\\rbrace" },
  // logical
  and: { 2: `\\left(\${args[0]}${latexOperators.and}\${args[1]}\\right)` },
  not: { 1: latexOperators.not + "\\left(${args[0]}\\right)" },
  or: { 2: `\\left(\${args[0]}${latexOperators.or}\${args[1]}\\right)` },
  xor: { 2: `\\left(\${args[0]}${latexOperators.xor}\${args[1]}\\right)` },
  // matrix
  cross: { 2: "\\left(${args[0]}\\right)\\times\\left(${args[1]}\\right)" },
  ctranspose: { 1: `\\left(\${args[0]}\\right)${latexOperators.ctranspose}` },
  det: { 1: "\\det\\left(${args[0]}\\right)" },
  dot: { 2: "\\left(${args[0]}\\cdot${args[1]}\\right)" },
  expm: { 1: "\\exp\\left(${args[0]}\\right)" },
  inv: { 1: "\\left(${args[0]}\\right)^{-1}" },
  pinv: { 1: "\\left(${args[0]}\\right)^{+}" },
  sqrtm: { 1: `{\${args[0]}}${latexOperators.pow}{\\frac{1}{2}}` },
  trace: { 1: "\\mathrm{tr}\\left(${args[0]}\\right)" },
  transpose: { 1: `\\left(\${args[0]}\\right)${latexOperators.transpose}` },
  // probability
  combinations: { 2: "\\binom{${args[0]}}{${args[1]}}" },
  combinationsWithRep: {
    2: "\\left(\\!\\!{\\binom{${args[0]}}{${args[1]}}}\\!\\!\\right)"
  },
  factorial: { 1: `\\left(\${args[0]}\\right)${latexOperators.factorial}` },
  gamma: { 1: "\\Gamma\\left(${args[0]}\\right)" },
  lgamma: { 1: "\\ln\\Gamma\\left(${args[0]}\\right)" },
  // relational
  equal: { 2: `\\left(\${args[0]}${latexOperators.equal}\${args[1]}\\right)` },
  larger: {
    2: `\\left(\${args[0]}${latexOperators.larger}\${args[1]}\\right)`
  },
  largerEq: {
    2: `\\left(\${args[0]}${latexOperators.largerEq}\${args[1]}\\right)`
  },
  smaller: {
    2: `\\left(\${args[0]}${latexOperators.smaller}\${args[1]}\\right)`
  },
  smallerEq: {
    2: `\\left(\${args[0]}${latexOperators.smallerEq}\${args[1]}\\right)`
  },
  unequal: {
    2: `\\left(\${args[0]}${latexOperators.unequal}\${args[1]}\\right)`
  },
  // special
  erf: { 1: "erf\\left(${args[0]}\\right)" },
  // statistics
  max: "\\max\\left(${args}\\right)",
  min: "\\min\\left(${args}\\right)",
  variance: "\\mathrm{Var}\\left(${args}\\right)",
  // trigonometry
  acos: { 1: "\\cos^{-1}\\left(${args[0]}\\right)" },
  acosh: { 1: "\\cosh^{-1}\\left(${args[0]}\\right)" },
  acot: { 1: "\\cot^{-1}\\left(${args[0]}\\right)" },
  acoth: { 1: "\\coth^{-1}\\left(${args[0]}\\right)" },
  acsc: { 1: "\\csc^{-1}\\left(${args[0]}\\right)" },
  acsch: { 1: "\\mathrm{csch}^{-1}\\left(${args[0]}\\right)" },
  asec: { 1: "\\sec^{-1}\\left(${args[0]}\\right)" },
  asech: { 1: "\\mathrm{sech}^{-1}\\left(${args[0]}\\right)" },
  asin: { 1: "\\sin^{-1}\\left(${args[0]}\\right)" },
  asinh: { 1: "\\sinh^{-1}\\left(${args[0]}\\right)" },
  atan: { 1: "\\tan^{-1}\\left(${args[0]}\\right)" },
  atan2: { 2: "\\mathrm{atan2}\\left(${args}\\right)" },
  atanh: { 1: "\\tanh^{-1}\\left(${args[0]}\\right)" },
  cos: { 1: "\\cos\\left(${args[0]}\\right)" },
  cosh: { 1: "\\cosh\\left(${args[0]}\\right)" },
  cot: { 1: "\\cot\\left(${args[0]}\\right)" },
  coth: { 1: "\\coth\\left(${args[0]}\\right)" },
  csc: { 1: "\\csc\\left(${args[0]}\\right)" },
  csch: { 1: "\\mathrm{csch}\\left(${args[0]}\\right)" },
  sec: { 1: "\\sec\\left(${args[0]}\\right)" },
  sech: { 1: "\\mathrm{sech}\\left(${args[0]}\\right)" },
  sin: { 1: "\\sin\\left(${args[0]}\\right)" },
  sinh: { 1: "\\sinh\\left(${args[0]}\\right)" },
  tan: { 1: "\\tan\\left(${args[0]}\\right)" },
  tanh: { 1: "\\tanh\\left(${args[0]}\\right)" },
  // unit
  to: { 2: `\\left(\${args[0]}${latexOperators.to}\${args[1]}\\right)` },
  // utils
  numeric: function(node, _options) {
    return node.args[0].toTex();
  },
  // type
  number: {
    0: "0",
    1: "\\left(${args[0]}\\right)",
    2: "\\left(\\left(${args[0]}\\right)${args[1]}\\right)"
  },
  string: {
    0: '\\mathtt{""}',
    1: "\\mathrm{string}\\left(${args[0]}\\right)"
  },
  bignumber: {
    0: "0",
    1: "\\left(${args[0]}\\right)"
  },
  bigint: {
    0: "0",
    1: "\\left(${args[0]}\\right)"
  },
  complex: {
    0: "0",
    1: "\\left(${args[0]}\\right)",
    2: `\\left(\\left(\${args[0]}\\right)+${latexSymbols.i}\\cdot\\left(\${args[1]}\\right)\\right)`
  },
  matrix: {
    0: "\\begin{bmatrix}\\end{bmatrix}",
    1: "\\left(${args[0]}\\right)",
    2: "\\left(${args[0]}\\right)"
  },
  sparse: {
    0: "\\begin{bsparse}\\end{bsparse}",
    1: "\\left(${args[0]}\\right)"
  },
  unit: {
    1: "\\left(${args[0]}\\right)",
    2: "\\left(\\left(${args[0]}\\right)${args[1]}\\right)"
  }
};
var defaultTemplate = "\\mathrm{${name}}\\left(${args}\\right)";
var latexUnits = {
  deg: "^\\circ"
};
function escapeLatex(string) {
  return escapeLatexLib(string, { preserveFormatting: true });
}
function toSymbol(name114, isUnit2) {
  isUnit2 = typeof isUnit2 === "undefined" ? false : isUnit2;
  if (isUnit2) {
    if (hasOwnProperty(latexUnits, name114)) {
      return latexUnits[name114];
    }
    return "\\mathrm{" + escapeLatex(name114) + "}";
  }
  if (hasOwnProperty(latexSymbols, name114)) {
    return latexSymbols[name114];
  }
  return escapeLatex(name114);
}

// src/expression/node/ConstantNode.ts
var name33 = "ConstantNode";
var dependencies31 = ["Node", "isBounded"];
var createConstantNode = /* @__PURE__ */ factory(
  name33,
  dependencies31,
  ({
    Node,
    isBounded
  }) => {
    class ConstantNode extends Node {
      /**
       * A ConstantNode holds a constant value like a number or string.
       *
       * Usage:
       *
       *     new ConstantNode(2.3)
       *     new ConstantNode('hello')
       *
       * @param {*} value    Value can be any type (number, BigNumber, bigint, string, ...)
       * @constructor ConstantNode
       * @extends {Node}
       */
      constructor(value) {
        super();
        this.value = value;
      }
      get type() {
        return name33;
      }
      get isConstantNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(_math, _argNames) {
        const value = this.value;
        return function evalConstantNode() {
          return value;
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(_callback) {
      }
      /**
       * Create a new ConstantNode with children produced by the given callback.
       * Trivial because there are no children.
       * @param {function(child: Node, path: string, parent: Node) : Node} callback
       * @returns {ConstantNode} Returns a clone of the node
       */
      map(_callback) {
        return this.clone();
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {ConstantNode}
       */
      clone() {
        return new ConstantNode(this.value);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        return format3(this.value, options);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const value = this._toString(options);
        switch (typeOf(this.value)) {
          case "number":
          case "bigint":
          case "BigNumber":
          case "Fraction":
            return '<span class="math-number">' + value + "</span>";
          case "string":
            return '<span class="math-string">' + value + "</span>";
          case "boolean":
            return '<span class="math-boolean">' + value + "</span>";
          case "null":
            return '<span class="math-null-symbol">' + value + "</span>";
          case "undefined":
            return '<span class="math-undefined">' + value + "</span>";
          default:
            return '<span class="math-symbol">' + value + "</span>";
        }
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return { mathjs: name33, value: this.value };
      }
      /**
       * Instantiate a ConstantNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "SymbolNode", value: 2.3}`,
       *                       where mathjs is optional
       * @returns {ConstantNode}
       */
      static fromJSON(json) {
        return new ConstantNode(json.value);
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const value = this._toString(options);
        const type = typeOf(this.value);
        switch (type) {
          case "string":
            return "\\mathtt{" + escapeLatex(value) + "}";
          case "number":
          case "BigNumber": {
            if (!isBounded(this.value)) {
              return this.value.valueOf() < 0 ? "-\\infty" : "\\infty";
            }
            const index = value.toLowerCase().indexOf("e");
            if (index !== -1) {
              return value.substring(0, index) + "\\cdot10^{" + value.substring(index + 1) + "}";
            }
            return value;
          }
          case "bigint": {
            return value.toString();
          }
          case "Fraction":
            return this.value.toLatex();
          default:
            return value;
        }
      }
    }
    Object.defineProperty(ConstantNode, "name", {
      value: name33,
      configurable: true
    });
    return ConstantNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/FunctionAssignmentNode.ts
var name34 = "FunctionAssignmentNode";
var dependencies32 = ["typed", "Node"];
var createFunctionAssignmentNode = /* @__PURE__ */ factory(
  name34,
  dependencies32,
  ({ typed: typed2, Node }) => {
    function needParenthesis(node, parenthesis, implicit) {
      const precedence = getPrecedence(node, parenthesis, implicit, void 0);
      const exprPrecedence = getPrecedence(
        node.expr,
        parenthesis,
        implicit,
        void 0
      );
      return parenthesis === "all" || exprPrecedence !== null && exprPrecedence <= precedence;
    }
    class FunctionAssignmentNode extends Node {
      /**
       * @constructor FunctionAssignmentNode
       * @extends {Node}
       * Function assignment
       *
       * @param {string} name           Function name
       * @param {string[] | Array.<{name: string, type: string}>} params
       *                                Array with function parameter names, or an
       *                                array with objects containing the name
       *                                and type of the parameter
       * @param {Node} expr             The function expression
       */
      constructor(name114, params, expr) {
        super();
        if (typeof name114 !== "string") {
          throw new TypeError('String expected for parameter "name"');
        }
        if (!Array.isArray(params)) {
          throw new TypeError(
            'Array containing strings or objects expected for parameter "params"'
          );
        }
        if (!isNode(expr)) {
          throw new TypeError('Node expected for parameter "expr"');
        }
        if (keywords.has(name114)) {
          throw new Error(
            'Illegal function name, "' + name114 + '" is a reserved keyword'
          );
        }
        const paramNames = /* @__PURE__ */ new Set();
        for (const param of params) {
          const paramName = typeof param === "string" ? param : param.name;
          if (paramNames.has(paramName)) {
            throw new Error(`Duplicate parameter name "${paramName}"`);
          } else {
            paramNames.add(paramName);
          }
        }
        this.name = name114;
        this.params = params.map(function(param) {
          return param && param.name || param;
        });
        this.types = params.map(function(param) {
          return param && param.type || "any";
        });
        this.expr = expr;
      }
      get type() {
        return name34;
      }
      get isFunctionAssignmentNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math, argNames) {
        const childArgNames = Object.create(argNames);
        forEach(this.params, function(param) {
          childArgNames[param] = true;
        });
        const expr = this.expr;
        const evalExpr = expr._compile(math, childArgNames);
        const name114 = this.name;
        const params = this.params;
        const signature = join(this.types, ",");
        const syntax = name114 + "(" + join(this.params, ", ") + ")";
        return function evalFunctionAssignmentNode(scope, args, context) {
          const signatures = {};
          signatures[signature] = function(...fnArgs) {
            const childArgs = Object.create(args);
            for (let i = 0; i < params.length; i++) {
              childArgs[params[i]] = fnArgs[i];
            }
            return evalExpr(scope, childArgs, context);
          };
          const fn = typed2(name114, signatures);
          fn.syntax = syntax;
          fn.expr = expr.toString();
          scope.set(name114, fn);
          return fn;
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.expr, "expr", this);
      }
      /**
       * Create a new FunctionAssignmentNode whose children are the results of
       * calling the provided callback function for each child of the original
       * node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {FunctionAssignmentNode} Returns a transformed copy of the node
       */
      map(callback) {
        const expr = this._ifNode(callback(this.expr, "expr", this));
        return new FunctionAssignmentNode(this.name, this.params.slice(0), expr);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {FunctionAssignmentNode}
       */
      clone() {
        return new FunctionAssignmentNode(
          this.name,
          this.params.slice(0),
          this.expr
        );
      }
      /**
       * get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        let expr = this.expr.toString(options);
        if (needParenthesis(this, parenthesis, options && options.implicit)) {
          expr = "(" + expr + ")";
        }
        return this.name + "(" + this.params.join(", ") + ") = " + expr;
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        const types = this.types;
        return {
          mathjs: name34,
          name: this.name,
          params: this.params.map(function(param, index) {
            return {
              name: param,
              type: types[index]
            };
          }),
          expr: this.expr
        };
      }
      /**
       * Instantiate an FunctionAssignmentNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     ```
       *     {"mathjs": "FunctionAssignmentNode",
       *      name: ..., params: ..., expr: ...}
       *     ```
       *     where mathjs is optional
       * @returns {FunctionAssignmentNode}
       */
      static fromJSON(json) {
        return new FunctionAssignmentNode(json.name, json.params, json.expr);
      }
      /**
       * get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const params = [];
        for (let i = 0; i < this.params.length; i++) {
          params.push(
            '<span class="math-symbol math-parameter">' + escape(this.params[i]) + "</span>"
          );
        }
        let expr = this.expr.toHTML(options);
        if (needParenthesis(this, parenthesis, options && options.implicit)) {
          expr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + expr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        return '<span class="math-function">' + escape(this.name) + '</span><span class="math-parenthesis math-round-parenthesis">(</span>' + params.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-round-parenthesis">)</span><span class="math-operator math-assignment-operator math-variable-assignment-operator math-binary-operator">=</span>' + expr;
      }
      /**
       * get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        let expr = this.expr.toTex(options);
        if (needParenthesis(this, parenthesis, options && options.implicit)) {
          expr = `\\left(${expr}\\right)`;
        }
        return "\\mathrm{" + this.name + "}\\left(" + this.params.map(toSymbol).join(",") + "\\right)=" + expr;
      }
    }
    Object.defineProperty(FunctionAssignmentNode, "name", {
      value: name34,
      configurable: true
    });
    return FunctionAssignmentNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/IndexNode.ts
var name35 = "IndexNode";
var dependencies33 = ["Node", "size"];
var createIndexNode = /* @__PURE__ */ factory(
  name35,
  dependencies33,
  ({ Node, size }) => {
    class IndexNode extends Node {
      /**
       * @constructor IndexNode
       * @extends Node
       *
       * Describes a subset of a matrix or an object property.
       * Cannot be used on its own, needs to be used within an AccessorNode or
       * AssignmentNode.
       *
       * @param {Node[]} dimensions
       * @param {boolean} [dotNotation=false]
       *     Optional property describing whether this index was written using dot
       *     notation like `a.b`, or using bracket notation like `a["b"]`
       *     (which is the default). This property is used for string conversion.
       */
      constructor(dimensions, dotNotation) {
        super();
        this.dimensions = dimensions;
        this.dotNotation = dotNotation || false;
        if (!Array.isArray(dimensions) || !dimensions.every(isNode)) {
          throw new TypeError(
            'Array containing Nodes expected for parameter "dimensions"'
          );
        }
        if (this.dotNotation && !this.isObjectProperty()) {
          throw new Error("dotNotation only applicable for object properties");
        }
      }
      get type() {
        return name35;
      }
      get isIndexNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        const evalDimensions = map(
          this.dimensions,
          function(dimension, i) {
            const needsEnd = dimension.filter(
              (node) => node.isSymbolNode && node.name === "end"
            ).length > 0;
            if (needsEnd) {
              const childArgNames = Object.create(argNames);
              childArgNames.end = true;
              const _evalDimension = dimension._compile(math, childArgNames);
              return function evalDimension(scope, args, context) {
                if (!isMatrix(context) && !isArray(context) && !isString(context)) {
                  throw new TypeError(
                    'Cannot resolve "end": context must be a Matrix, Array, or string but is ' + typeOf(context)
                  );
                }
                const s = size(context);
                const childArgs = Object.create(args);
                childArgs.end = s[i];
                return _evalDimension(scope, childArgs, context);
              };
            } else {
              return dimension._compile(math, argNames);
            }
          }
        );
        const index = getSafeProperty(math, "index");
        return function evalIndexNode(scope, args, context) {
          const dimensions = map(
            evalDimensions,
            function(evalDimension) {
              return evalDimension(scope, args, context);
            }
          );
          return index(...dimensions);
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        for (let i = 0; i < this.dimensions.length; i++) {
          callback(this.dimensions[i], "dimensions[" + i + "]", this);
        }
      }
      /**
       * Create a new IndexNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {IndexNode} Returns a transformed copy of the node
       */
      map(callback) {
        const dimensions = [];
        for (let i = 0; i < this.dimensions.length; i++) {
          dimensions[i] = this._ifNode(
            callback(this.dimensions[i], "dimensions[" + i + "]", this)
          );
        }
        return new IndexNode(dimensions, this.dotNotation);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {IndexNode}
       */
      clone() {
        return new IndexNode(this.dimensions.slice(0), this.dotNotation);
      }
      /**
       * Test whether this IndexNode contains a single property name
       * @return {boolean}
       */
      isObjectProperty() {
        return this.dimensions.length === 1 && isConstantNode(this.dimensions[0]) && typeof this.dimensions[0].value === "string";
      }
      /**
       * Returns the property name if IndexNode contains a property.
       * If not, returns null.
       * @return {string | null}
       */
      getObjectProperty() {
        return this.isObjectProperty() ? this.dimensions[0].value : null;
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(_options) {
        return this.dotNotation ? "." + this.getObjectProperty() : "[" + this.dimensions.join(", ") + "]";
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name35,
          dimensions: this.dimensions,
          dotNotation: this.dotNotation
        };
      }
      /**
       * Instantiate an IndexNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "IndexNode", dimensions: [...], dotNotation: false}`,
       *     where mathjs is optional
       * @returns {IndexNode}
       */
      static fromJSON(json) {
        return new IndexNode(json.dimensions, json.dotNotation);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(_options) {
        const dimensions = [];
        for (let i = 0; i < this.dimensions.length; i++) {
          dimensions[i] = this.dimensions[i].toHTML();
        }
        if (this.dotNotation) {
          return '<span class="math-operator math-accessor-operator">.</span><span class="math-symbol math-property">' + escape(this.getObjectProperty()) + "</span>";
        } else {
          return '<span class="math-parenthesis math-square-parenthesis">[</span>' + dimensions.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-square-parenthesis">]</span>';
        }
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const dimensions = this.dimensions.map(function(range) {
          return range.toTex(options);
        });
        return this.dotNotation ? "." + this.getObjectProperty() : "_{" + dimensions.join(",") + "}";
      }
    }
    Object.defineProperty(IndexNode, "name", {
      value: name35,
      configurable: true
    });
    return IndexNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/ObjectNode.ts
var name36 = "ObjectNode";
var dependencies34 = ["Node"];
var createObjectNode = /* @__PURE__ */ factory(
  name36,
  dependencies34,
  ({ Node }) => {
    class ObjectNode extends Node {
      /**
       * @constructor ObjectNode
       * @extends {Node}
       * Holds an object with keys/values
       * @param {Object.<string, Node>} [properties]   object with key/value pairs
       */
      constructor(properties2) {
        super();
        this.properties = properties2 || {};
        if (properties2) {
          if (!(typeof properties2 === "object") || !Object.keys(properties2).every(function(key) {
            return isNode(properties2[key]);
          })) {
            throw new TypeError("Object containing Nodes expected");
          }
        }
      }
      get type() {
        return name36;
      }
      get isObjectNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        const evalEntries = {};
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            const stringifiedKey = stringify(key);
            const parsedKey = JSON.parse(stringifiedKey);
            const prop = getSafeProperty(this.properties, key);
            evalEntries[parsedKey] = prop._compile(math, argNames);
          }
        }
        return function evalObjectNode(scope, args, context) {
          const obj = {};
          for (const key in evalEntries) {
            if (hasOwnProperty(evalEntries, key)) {
              obj[key] = evalEntries[key](scope, args, context);
            }
          }
          return obj;
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            callback(
              this.properties[key],
              "properties[" + stringify(key) + "]",
              this
            );
          }
        }
      }
      /**
       * Create a new ObjectNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {ObjectNode} Returns a transformed copy of the node
       */
      map(callback) {
        const properties2 = {};
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            properties2[key] = this._ifNode(
              callback(
                this.properties[key],
                "properties[" + stringify(key) + "]",
                this
              )
            );
          }
        }
        return new ObjectNode(properties2);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {ObjectNode}
       */
      clone() {
        const properties2 = {};
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            properties2[key] = this.properties[key];
          }
        }
        return new ObjectNode(properties2);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toString(options) {
        const entries = [];
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            entries.push(
              stringify(key) + ": " + this.properties[key].toString(options)
            );
          }
        }
        return "{" + entries.join(", ") + "}";
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name36,
          properties: this.properties
        };
      }
      /**
       * Instantiate an OperatorNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "ObjectNode", "properties": {...}}`,
       *                       where mathjs is optional
       * @returns {ObjectNode}
       */
      static fromJSON(json) {
        return new ObjectNode(json.properties);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toHTML(options) {
        const entries = [];
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            entries.push(
              '<span class="math-symbol math-property">' + escape(key) + '</span><span class="math-operator math-assignment-operator math-property-assignment-operator math-binary-operator">:</span>' + this.properties[key].toHTML(options)
            );
          }
        }
        return '<span class="math-parenthesis math-curly-parenthesis">{</span>' + entries.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-curly-parenthesis">}</span>';
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const entries = [];
        for (const key in this.properties) {
          if (hasOwnProperty(this.properties, key)) {
            entries.push(
              "\\mathbf{" + key + ":} & " + this.properties[key].toTex(options) + "\\\\"
            );
          }
        }
        const tex = "\\left\\{\\begin{array}{ll}" + entries.join("\n") + "\\end{array}\\right\\}";
        return tex;
      }
    }
    Object.defineProperty(ObjectNode, "name", {
      value: name36,
      configurable: true
    });
    return ObjectNode;
  },
  { isClass: true, isNode: true }
);

// src/utils/scope.ts
function createSubScope(parentScope, args) {
  return new PartitionedMap(
    parentScope,
    new ObjectWrappingMap(args),
    new Set(Object.keys(args))
  );
}

// src/expression/node/OperatorNode.ts
var name37 = "OperatorNode";
var dependencies35 = ["Node"];
var createOperatorNode = /* @__PURE__ */ factory(
  name37,
  dependencies35,
  ({ Node }) => {
    function startsWithConstant(expr, parenthesis) {
      let curNode = expr;
      if (parenthesis === "auto") {
        while (isParenthesisNode(curNode)) curNode = curNode.content;
      }
      if (isConstantNode(curNode)) return true;
      if (isOperatorNode(curNode)) {
        return startsWithConstant(curNode.args[0], parenthesis);
      }
      return false;
    }
    function calculateNecessaryParentheses(root, parenthesis, implicit, args, latex) {
      const precedence = getPrecedence(
        root,
        parenthesis,
        implicit,
        void 0
      );
      const associativity = getAssociativity(root, parenthesis);
      if (parenthesis === "all" || args.length > 2 && root.getIdentifier() !== "OperatorNode:add" && root.getIdentifier() !== "OperatorNode:multiply") {
        return args.map(function(arg) {
          switch (arg.getContent().type) {
            case "ArrayNode":
            case "ConstantNode":
            case "SymbolNode":
            case "ParenthesisNode":
              return false;
            default:
              return true;
          }
        });
      }
      let result;
      switch (args.length) {
        case 0:
          result = [];
          break;
        case 1:
          {
            const operandPrecedence = getPrecedence(
              args[0],
              parenthesis,
              implicit,
              root
            );
            if (latex && operandPrecedence !== null) {
              let operandIdentifier;
              let rootIdentifier;
              if (parenthesis === "keep") {
                operandIdentifier = args[0].getIdentifier();
                rootIdentifier = root.getIdentifier();
              } else {
                operandIdentifier = args[0].getContent().getIdentifier();
                rootIdentifier = root.getContent().getIdentifier();
              }
              if (properties[precedence][rootIdentifier].latexLeftParens === false) {
                result = [false];
                break;
              }
              if (properties[operandPrecedence][operandIdentifier].latexParens === false) {
                result = [false];
                break;
              }
            }
            if (operandPrecedence === null) {
              result = [false];
              break;
            }
            if (operandPrecedence <= precedence) {
              result = [true];
              break;
            }
            result = [false];
          }
          break;
        case 2:
          {
            let lhsParens;
            const lhsPrecedence = getPrecedence(
              args[0],
              parenthesis,
              implicit,
              root
            );
            const assocWithLhs = isAssociativeWith(
              root,
              args[0],
              parenthesis
            );
            if (lhsPrecedence === null) {
              lhsParens = false;
            } else if (lhsPrecedence === precedence && associativity === "right" && !assocWithLhs) {
              lhsParens = true;
            } else if (lhsPrecedence < precedence) {
              lhsParens = true;
            } else {
              lhsParens = false;
            }
            let rhsParens;
            const rhsPrecedence = getPrecedence(
              args[1],
              parenthesis,
              implicit,
              root
            );
            const assocWithRhs = isAssociativeWith(
              root,
              args[1],
              parenthesis
            );
            if (rhsPrecedence === null) {
              rhsParens = false;
            } else if (rhsPrecedence === precedence && associativity === "left" && !assocWithRhs) {
              rhsParens = true;
            } else if (rhsPrecedence < precedence) {
              rhsParens = true;
            } else {
              rhsParens = false;
            }
            if (latex) {
              let rootIdentifier;
              let lhsIdentifier;
              let rhsIdentifier;
              if (parenthesis === "keep") {
                rootIdentifier = root.getIdentifier();
                lhsIdentifier = root.args[0].getIdentifier();
                rhsIdentifier = root.args[1].getIdentifier();
              } else {
                rootIdentifier = root.getContent().getIdentifier();
                lhsIdentifier = root.args[0].getContent().getIdentifier();
                rhsIdentifier = root.args[1].getContent().getIdentifier();
              }
              if (lhsPrecedence !== null) {
                if (properties[precedence][rootIdentifier].latexLeftParens === false) {
                  lhsParens = false;
                }
                if (properties[lhsPrecedence][lhsIdentifier].latexParens === false) {
                  lhsParens = false;
                }
              }
              if (rhsPrecedence !== null) {
                if (properties[precedence][rootIdentifier].latexRightParens === false) {
                  rhsParens = false;
                }
                if (properties[rhsPrecedence][rhsIdentifier].latexParens === false) {
                  rhsParens = false;
                }
              }
            }
            result = [lhsParens, rhsParens];
          }
          break;
        default:
          if (root.getIdentifier() === "OperatorNode:add" || root.getIdentifier() === "OperatorNode:multiply") {
            result = args.map(function(arg) {
              const argPrecedence = getPrecedence(
                arg,
                parenthesis,
                implicit,
                root
              );
              const assocWithArg = isAssociativeWith(
                root,
                arg,
                parenthesis
              );
              const argAssociativity = getAssociativity(arg, parenthesis);
              if (argPrecedence === null) {
                return false;
              } else if (precedence === argPrecedence && associativity === argAssociativity && !assocWithArg) {
                return true;
              } else if (argPrecedence < precedence) {
                return true;
              }
              return false;
            });
          }
          break;
      }
      if (args.length >= 2 && root.getIdentifier() === "OperatorNode:multiply" && root.implicit && parenthesis !== "all" && implicit === "hide") {
        for (let i = 1; i < result.length; ++i) {
          if (startsWithConstant(args[i], parenthesis) && !result[i - 1] && (parenthesis !== "keep" || !isParenthesisNode(args[i - 1]))) {
            result[i] = true;
          }
        }
      }
      return result;
    }
    class OperatorNode extends Node {
      /**
       * @constructor OperatorNode
       * @extends {Node}
       * An operator with two arguments, like 2+3
       *
       * @param {string} op           Operator name, for example '+'
       * @param {string} fn           Function name, for example 'add'
       * @param {Node[]} args         Operator arguments
       * @param {boolean} [implicit]  Is this an implicit multiplication?
       * @param {boolean} [isPercentage] Is this an percentage Operation?
       */
      constructor(op, fn, args, implicit, isPercentage) {
        super();
        if (typeof op !== "string") {
          throw new TypeError('string expected for parameter "op"');
        }
        if (typeof fn !== "string") {
          throw new TypeError('string expected for parameter "fn"');
        }
        if (!Array.isArray(args) || !args.every(isNode)) {
          throw new TypeError(
            'Array containing Nodes expected for parameter "args"'
          );
        }
        this.implicit = implicit === true;
        this.isPercentage = isPercentage === true;
        this.op = op;
        this.fn = fn;
        this.args = args || [];
      }
      get type() {
        return name37;
      }
      get isOperatorNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        if (typeof this.fn !== "string" || !isSafeMethod(math, this.fn)) {
          if (!math[this.fn]) {
            throw new Error(
              "Function " + this.fn + ' missing in provided namespace "math"'
            );
          } else {
            throw new Error('No access to function "' + this.fn + '"');
          }
        }
        const fn = getSafeProperty(math, this.fn);
        const evalArgs = map(this.args, function(arg) {
          return arg._compile(math, argNames);
        });
        if (typeof fn === "function" && fn.rawArgs === true) {
          const rawArgs = this.args;
          return function evalOperatorNode(scope, args, _context) {
            return fn(rawArgs, math, createSubScope(scope, args));
          };
        } else if (evalArgs.length === 1) {
          const evalArg0 = evalArgs[0];
          return function evalOperatorNode(scope, args, context) {
            return fn(evalArg0(scope, args, context));
          };
        } else if (evalArgs.length === 2) {
          const evalArg0 = evalArgs[0];
          const evalArg1 = evalArgs[1];
          return function evalOperatorNode(scope, args, context) {
            return fn(
              evalArg0(scope, args, context),
              evalArg1(scope, args, context)
            );
          };
        } else {
          return function evalOperatorNode(scope, args, context) {
            return fn.apply(
              null,
              map(evalArgs, function(evalArg) {
                return evalArg(scope, args, context);
              })
            );
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        for (let i = 0; i < this.args.length; i++) {
          callback(this.args[i], "args[" + i + "]", this);
        }
      }
      /**
       * Create a new OperatorNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {OperatorNode} Returns a transformed copy of the node
       */
      map(callback) {
        const args = [];
        for (let i = 0; i < this.args.length; i++) {
          args[i] = this._ifNode(
            callback(this.args[i], "args[" + i + "]", this)
          );
        }
        return new OperatorNode(
          this.op,
          this.fn,
          args,
          this.implicit,
          this.isPercentage
        );
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {OperatorNode}
       */
      clone() {
        return new OperatorNode(
          this.op,
          this.fn,
          this.args.slice(0),
          this.implicit,
          this.isPercentage
        );
      }
      /**
       * Check whether this is an unary OperatorNode:
       * has exactly one argument, like `-a`.
       * @return {boolean}
       *     Returns true when an unary operator node, false otherwise.
       */
      isUnary() {
        return this.args.length === 1;
      }
      /**
       * Check whether this is a binary OperatorNode:
       * has exactly two arguments, like `a + b`.
       * @return {boolean}
       *     Returns true when a binary operator node, false otherwise.
       */
      isBinary() {
        return this.args.length === 2;
      }
      /**
       * Get string representation.
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const implicit = options && options.implicit ? options.implicit : "hide";
        const args = this.args;
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          implicit,
          args,
          false
        );
        if (args.length === 1) {
          const assoc = getAssociativity(this, parenthesis);
          let operand = args[0].toString(options);
          if (parens[0]) {
            operand = "(" + operand + ")";
          }
          const opIsNamed = /[a-zA-Z]+/.test(this.op);
          if (assoc === "right") {
            return this.op + (opIsNamed ? " " : "") + operand;
          } else if (assoc === "left") {
            return operand + (opIsNamed ? " " : "") + this.op;
          }
          return operand + this.op;
        } else if (args.length === 2) {
          let lhs = args[0].toString(options);
          let rhs = args[1].toString(options);
          if (parens[0]) {
            lhs = "(" + lhs + ")";
          }
          if (parens[1]) {
            rhs = "(" + rhs + ")";
          }
          if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
            return lhs + " " + rhs;
          }
          return lhs + " " + this.op + " " + rhs;
        } else if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
          const stringifiedArgs = args.map(function(arg, index) {
            let argStr = arg.toString(options);
            if (parens[index]) {
              argStr = "(" + argStr + ")";
            }
            return argStr;
          });
          if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
            return stringifiedArgs.join(" ");
          }
          return stringifiedArgs.join(" " + this.op + " ");
        } else {
          return this.fn + "(" + this.args.join(", ") + ")";
        }
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name37,
          op: this.op,
          fn: this.fn,
          args: this.args,
          implicit: this.implicit,
          isPercentage: this.isPercentage
        };
      }
      /**
       * Instantiate an OperatorNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     ```
       *     {"mathjs": "OperatorNode",
       *      "op": "+", "fn": "add", "args": [...],
       *      "implicit": false,
       *      "isPercentage":false}
       *     ```
       *     where mathjs is optional
       * @returns {OperatorNode}
       */
      static fromJSON(json) {
        return new OperatorNode(
          json.op,
          json.fn,
          json.args,
          json.implicit,
          json.isPercentage
        );
      }
      /**
       * Get HTML representation.
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const implicit = options && options.implicit ? options.implicit : "hide";
        const args = this.args;
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          implicit,
          args,
          false
        );
        if (args.length === 1) {
          const assoc = getAssociativity(this, parenthesis);
          let operand = args[0].toHTML(options);
          if (parens[0]) {
            operand = '<span class="math-parenthesis math-round-parenthesis">(</span>' + operand + '<span class="math-parenthesis math-round-parenthesis">)</span>';
          }
          if (assoc === "right") {
            return '<span class="math-operator math-unary-operator math-lefthand-unary-operator">' + escape(this.op) + "</span>" + operand;
          } else {
            return operand + '<span class="math-operator math-unary-operator math-righthand-unary-operator">' + escape(this.op) + "</span>";
          }
        } else if (args.length === 2) {
          let lhs = args[0].toHTML(options);
          let rhs = args[1].toHTML(options);
          if (parens[0]) {
            lhs = '<span class="math-parenthesis math-round-parenthesis">(</span>' + lhs + '<span class="math-parenthesis math-round-parenthesis">)</span>';
          }
          if (parens[1]) {
            rhs = '<span class="math-parenthesis math-round-parenthesis">(</span>' + rhs + '<span class="math-parenthesis math-round-parenthesis">)</span>';
          }
          if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
            return lhs + '<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>' + rhs;
          }
          return lhs + '<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(this.op) + "</span>" + rhs;
        } else {
          const stringifiedArgs = args.map(function(arg, index) {
            let argStr = arg.toHTML(options);
            if (parens[index]) {
              argStr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + argStr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
            }
            return argStr;
          });
          if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
            if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
              return stringifiedArgs.join(
                '<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>'
              );
            }
            return stringifiedArgs.join(
              '<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(this.op) + "</span>"
            );
          } else {
            return '<span class="math-function">' + escape(this.fn) + '</span><span class="math-paranthesis math-round-parenthesis">(</span>' + stringifiedArgs.join('<span class="math-separator">,</span>') + '<span class="math-paranthesis math-round-parenthesis">)</span>';
          }
        }
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const implicit = options && options.implicit ? options.implicit : "hide";
        const args = this.args;
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          implicit,
          args,
          true
        );
        let op = latexOperators[this.fn];
        op = typeof op === "undefined" ? this.op : op;
        if (args.length === 1) {
          const assoc = getAssociativity(this, parenthesis);
          let operand = args[0].toTex(options);
          if (parens[0]) {
            operand = `\\left(${operand}\\right)`;
          }
          if (assoc === "right") {
            return op + operand;
          } else if (assoc === "left") {
            return operand + op;
          }
          return operand + op;
        } else if (args.length === 2) {
          const lhs = args[0];
          let lhsTex = lhs.toTex(options);
          if (parens[0]) {
            lhsTex = `\\left(${lhsTex}\\right)`;
          }
          const rhs = args[1];
          let rhsTex = rhs.toTex(options);
          if (parens[1]) {
            rhsTex = `\\left(${rhsTex}\\right)`;
          }
          let lhsIdentifier;
          if (parenthesis === "keep") {
            lhsIdentifier = lhs.getIdentifier();
          } else {
            lhsIdentifier = lhs.getContent().getIdentifier();
          }
          switch (this.getIdentifier()) {
            case "OperatorNode:divide":
              return op + "{" + lhsTex + "}{" + rhsTex + "}";
            case "OperatorNode:pow":
              lhsTex = "{" + lhsTex + "}";
              rhsTex = "{" + rhsTex + "}";
              switch (lhsIdentifier) {
                case "ConditionalNode":
                //
                case "OperatorNode:divide":
                  lhsTex = `\\left(${lhsTex}\\right)`;
              }
              break;
            case "OperatorNode:multiply":
              if (this.implicit && implicit === "hide") {
                return lhsTex + "~" + rhsTex;
              }
          }
          return lhsTex + op + rhsTex;
        } else if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
          const texifiedArgs = args.map(function(arg, index) {
            let argStr = arg.toTex(options);
            if (parens[index]) {
              argStr = `\\left(${argStr}\\right)`;
            }
            return argStr;
          });
          if (this.getIdentifier() === "OperatorNode:multiply" && this.implicit && implicit === "hide") {
            return texifiedArgs.join("~");
          }
          return texifiedArgs.join(op);
        } else {
          return "\\mathrm{" + this.fn + "}\\left(" + args.map(function(arg) {
            return arg.toTex(options);
          }).join(",") + "\\right)";
        }
      }
      /**
       * Get identifier.
       * @return {string}
       */
      // @ts-expect-error: method signature matches MathNode interface
      getIdentifier() {
        return this.type + ":" + this.fn;
      }
    }
    Object.defineProperty(OperatorNode, "name", {
      value: name37,
      configurable: true
    });
    return OperatorNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/ParenthesisNode.ts
var name38 = "ParenthesisNode";
var dependencies36 = ["Node"];
var createParenthesisNode = /* @__PURE__ */ factory(
  name38,
  dependencies36,
  ({ Node }) => {
    class ParenthesisNode extends Node {
      /**
       * @constructor ParenthesisNode
       * @extends {Node}
       * A parenthesis node describes manual parenthesis from the user input
       * @param {Node} content
       * @extends {Node}
       */
      constructor(content) {
        super();
        if (!isNode(content)) {
          throw new TypeError('Node expected for parameter "content"');
        }
        this.content = content;
      }
      get type() {
        return name38;
      }
      get isParenthesisNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        return this.content._compile(math, argNames);
      }
      /**
       * Get the content of the current Node.
       * @return {Node} content
       * @override
       **/
      // @ts-expect-error: method signature matches MathNode interface
      getContent() {
        return this.content.getContent();
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.content, "content", this);
      }
      /**
       * Create a new ParenthesisNode whose child is the result of calling
       * the provided callback function on the child of this node.
       * @param {function(child: Node, path: string, parent: Node) : Node} callback
       * @returns {ParenthesisNode} Returns a clone of the node
       */
      map(callback) {
        const content = callback(this.content, "content", this);
        return new ParenthesisNode(content);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {ParenthesisNode}
       */
      clone() {
        return new ParenthesisNode(this.content);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toString(options) {
        if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
          return "(" + this.content.toString(options) + ")";
        }
        return this.content.toString(options);
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return { mathjs: name38, content: this.content };
      }
      /**
       * Instantiate an ParenthesisNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "ParenthesisNode", "content": ...}`,
       *                       where mathjs is optional
       * @returns {ParenthesisNode}
       */
      static fromJSON(json) {
        return new ParenthesisNode(json.content);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toHTML(options) {
        if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
          return '<span class="math-parenthesis math-round-parenthesis">(</span>' + this.content.toHTML(options) + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        return this.content.toHTML(options);
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toTex(options) {
        if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
          return `\\left(${this.content.toTex(options)}\\right)`;
        }
        return this.content.toTex(options);
      }
    }
    Object.defineProperty(ParenthesisNode, "name", {
      value: name38,
      configurable: true
    });
    return ParenthesisNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/RangeNode.ts
var name39 = "RangeNode";
var dependencies37 = ["Node"];
var createRangeNode = /* @__PURE__ */ factory(
  name39,
  dependencies37,
  ({ Node }) => {
    function calculateNecessaryParentheses(node, parenthesis, implicit) {
      const precedence = getPrecedence(
        node,
        parenthesis,
        implicit,
        void 0
      );
      const parens = { start: false, end: false };
      const startPrecedence = getPrecedence(
        node.start,
        parenthesis,
        implicit,
        void 0
      );
      parens.start = startPrecedence !== null && startPrecedence <= precedence || parenthesis === "all";
      if (node.step) {
        const stepPrecedence = getPrecedence(
          node.step,
          parenthesis,
          implicit,
          void 0
        );
        parens.step = stepPrecedence !== null && stepPrecedence <= precedence || parenthesis === "all";
      }
      const endPrecedence = getPrecedence(
        node.end,
        parenthesis,
        implicit,
        void 0
      );
      parens.end = endPrecedence !== null && endPrecedence <= precedence || parenthesis === "all";
      return parens;
    }
    class RangeNode extends Node {
      /**
       * @constructor RangeNode
       * @extends {Node}
       * create a range
       * @param {Node} start  included lower-bound
       * @param {Node} end    included upper-bound
       * @param {Node} [step] optional step
       */
      constructor(start, end, step) {
        super();
        if (!isNode(start)) throw new TypeError("Node expected");
        if (!isNode(end)) throw new TypeError("Node expected");
        if (step && !isNode(step)) throw new TypeError("Node expected");
        if (arguments.length > 3) throw new Error("Too many arguments");
        this.start = start;
        this.end = end;
        this.step = step || null;
      }
      get type() {
        return name39;
      }
      get isRangeNode() {
        return true;
      }
      /**
       * Check whether the RangeNode needs the `end` symbol to be defined.
       * This end is the size of the Matrix in current dimension.
       * @return {boolean}
       */
      needsEnd() {
        const endSymbols = this.filter(function(node) {
          return isSymbolNode(node) && node.name === "end";
        });
        return endSymbols.length > 0;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        const range = math.range;
        const evalStart = this.start._compile(math, argNames);
        const evalEnd = this.end._compile(math, argNames);
        if (this.step) {
          const evalStep = this.step._compile(math, argNames);
          return function evalRangeNode(scope, args, context) {
            return range(
              evalStart(scope, args, context),
              evalEnd(scope, args, context),
              evalStep(scope, args, context)
            );
          };
        } else {
          return function evalRangeNode(scope, args, context) {
            return range(
              evalStart(scope, args, context),
              evalEnd(scope, args, context)
            );
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.start, "start", this);
        callback(this.end, "end", this);
        if (this.step) {
          callback(this.step, "step", this);
        }
      }
      /**
       * Create a new RangeNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {RangeNode} Returns a transformed copy of the node
       */
      map(callback) {
        return new RangeNode(
          this._ifNode(callback(this.start, "start", this)),
          this._ifNode(callback(this.end, "end", this)),
          this.step ? this._ifNode(callback(this.step, "step", this)) : void 0
        );
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {RangeNode}
       */
      clone() {
        return new RangeNode(this.start, this.end, this.step || void 0);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          options && options.implicit || "hide"
        );
        let str;
        let start = this.start.toString(options);
        if (parens.start) {
          start = "(" + start + ")";
        }
        str = start;
        if (this.step) {
          let step = this.step.toString(options);
          if (parens.step) {
            step = "(" + step + ")";
          }
          str += ":" + step;
        }
        let end = this.end.toString(options);
        if (parens.end) {
          end = "(" + end + ")";
        }
        str += ":" + end;
        return str;
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name39,
          start: this.start,
          end: this.end,
          step: this.step
        };
      }
      /**
       * Instantiate an RangeNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "RangeNode", "start": ..., "end": ..., "step": ...}`,
       *     where mathjs is optional
       * @returns {RangeNode}
       */
      static fromJSON(json) {
        return new RangeNode(json.start, json.end, json.step);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          options && options.implicit || "hide"
        );
        let str;
        let start = this.start.toHTML(options);
        if (parens.start) {
          start = '<span class="math-parenthesis math-round-parenthesis">(</span>' + start + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        str = start;
        if (this.step) {
          let step = this.step.toHTML(options);
          if (parens.step) {
            step = '<span class="math-parenthesis math-round-parenthesis">(</span>' + step + '<span class="math-parenthesis math-round-parenthesis">)</span>';
          }
          str += '<span class="math-operator math-range-operator">:</span>' + step;
        }
        let end = this.end.toHTML(options);
        if (parens.end) {
          end = '<span class="math-parenthesis math-round-parenthesis">(</span>' + end + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        str += '<span class="math-operator math-range-operator">:</span>' + end;
        return str;
      }
      /**
       * Get LaTeX representation
       * @params {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const parens = calculateNecessaryParentheses(
          this,
          parenthesis,
          options && options.implicit || "hide"
        );
        let str = this.start.toTex(options);
        if (parens.start) {
          str = `\\left(${str}\\right)`;
        }
        if (this.step) {
          let step = this.step.toTex(options);
          if (parens.step) {
            step = `\\left(${step}\\right)`;
          }
          str += ":" + step;
        }
        let end = this.end.toTex(options);
        if (parens.end) {
          end = `\\left(${end}\\right)`;
        }
        str += ":" + end;
        return str;
      }
    }
    Object.defineProperty(RangeNode, "name", {
      value: name39,
      configurable: true
    });
    return RangeNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/RelationalNode.ts
var name40 = "RelationalNode";
var dependencies38 = ["Node"];
var createRelationalNode = /* @__PURE__ */ factory(
  name40,
  dependencies38,
  ({ Node }) => {
    const operatorMap = {
      equal: "==",
      unequal: "!=",
      smaller: "<",
      larger: ">",
      smallerEq: "<=",
      largerEq: ">="
    };
    class RelationalNode extends Node {
      /**
       * A node representing a chained conditional expression, such as 'x > y > z'
       *
       * @param {String[]} conditionals
       *     An array of conditional operators used to compare the parameters
       * @param {Node[]} params
       *     The parameters that will be compared
       *
       * @constructor RelationalNode
       * @extends {Node}
       */
      constructor(conditionals, params) {
        super();
        if (!Array.isArray(conditionals)) {
          throw new TypeError("Parameter conditionals must be an array");
        }
        if (!Array.isArray(params)) {
          throw new TypeError("Parameter params must be an array");
        }
        if (conditionals.length !== params.length - 1) {
          throw new TypeError(
            "Parameter params must contain exactly one more element than parameter conditionals"
          );
        }
        this.conditionals = conditionals;
        this.params = params;
      }
      get type() {
        return name40;
      }
      get isRelationalNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      // @ts-expect-error: method signature matches MathNode interface
      _compile(math, argNames) {
        const self = this;
        const compiled = this.params.map(
          (p) => p._compile(math, argNames)
        );
        return function evalRelationalNode(scope, args, context) {
          let evalLhs;
          let evalRhs = compiled[0](scope, args, context);
          for (let i = 0; i < self.conditionals.length; i++) {
            evalLhs = evalRhs;
            evalRhs = compiled[i + 1](scope, args, context);
            const condFn = getSafeProperty(math, self.conditionals[i]);
            if (!condFn(evalLhs, evalRhs)) {
              return false;
            }
          }
          return true;
        };
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        this.params.forEach(
          (n, i) => callback(n, "params[" + i + "]", this),
          this
        );
      }
      /**
       * Create a new RelationalNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {RelationalNode} Returns a transformed copy of the node
       */
      map(callback) {
        return new RelationalNode(
          this.conditionals.slice(),
          this.params.map(
            (n, i) => this._ifNode(callback(n, "params[" + i + "]", this)),
            this
          )
        );
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {RelationalNode}
       */
      clone() {
        return new RelationalNode(this.conditionals, this.params);
      }
      /**
       * Get string representation.
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const precedence = getPrecedence(
          this,
          parenthesis,
          options && options.implicit || "hide",
          void 0
        );
        const paramStrings = this.params.map(function(p, _index) {
          const paramPrecedence = getPrecedence(
            p,
            parenthesis,
            options && options.implicit || "hide",
            void 0
          );
          return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? "(" + p.toString(options) + ")" : p.toString(options);
        });
        let ret = paramStrings[0];
        for (let i = 0; i < this.conditionals.length; i++) {
          ret += " " + operatorMap[this.conditionals[i]];
          ret += " " + paramStrings[i + 1];
        }
        return ret;
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name40,
          conditionals: this.conditionals,
          params: this.params
        };
      }
      /**
       * Instantiate a RelationalNode from its JSON representation
       * @param {Object} json
       *     An object structured like
       *     `{"mathjs": "RelationalNode", "conditionals": ..., "params": ...}`,
       *     where mathjs is optional
       * @returns {RelationalNode}
       */
      static fromJSON(json) {
        return new RelationalNode(json.conditionals, json.params);
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const precedence = getPrecedence(
          this,
          parenthesis,
          options && options.implicit || "hide",
          void 0
        );
        const paramStrings = this.params.map(function(p, _index) {
          const paramPrecedence = getPrecedence(
            p,
            parenthesis,
            options && options.implicit || "hide",
            void 0
          );
          return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? '<span class="math-parenthesis math-round-parenthesis">(</span>' + p.toHTML(options) + '<span class="math-parenthesis math-round-parenthesis">)</span>' : p.toHTML(options);
        });
        let ret = paramStrings[0];
        for (let i = 0; i < this.conditionals.length; i++) {
          ret += '<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(operatorMap[this.conditionals[i]]) + "</span>" + paramStrings[i + 1];
        }
        return ret;
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
        const precedence = getPrecedence(
          this,
          parenthesis,
          options && options.implicit || "hide",
          void 0
        );
        const paramStrings = this.params.map(function(p, _index) {
          const paramPrecedence = getPrecedence(
            p,
            parenthesis,
            options && options.implicit || "hide",
            void 0
          );
          return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? "\\left(" + p.toTex(options) + "\\right)" : p.toTex(options);
        });
        let ret = paramStrings[0];
        for (let i = 0; i < this.conditionals.length; i++) {
          ret += latexOperators[this.conditionals[i]] + paramStrings[i + 1];
        }
        return ret;
      }
    }
    Object.defineProperty(RelationalNode, "name", {
      value: name40,
      configurable: true
    });
    return RelationalNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/SymbolNode.ts
var name41 = "SymbolNode";
var dependencies39 = ["math", "?Unit", "Node"];
var createSymbolNode = /* @__PURE__ */ factory(
  name41,
  dependencies39,
  ({ math, Unit, Node }) => {
    function isValuelessUnit(name114) {
      return Unit ? Unit.isValuelessUnit(name114) : false;
    }
    class SymbolNode extends Node {
      /**
       * @constructor SymbolNode
       * @extends {Node}
       * A symbol node can hold and resolve a symbol
       * @param {string} name
       * @extends {Node}
       */
      constructor(name114) {
        super();
        if (typeof name114 !== "string") {
          throw new TypeError('String expected for parameter "name"');
        }
        this.name = name114;
      }
      get type() {
        return "SymbolNode";
      }
      get isSymbolNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math2, argNames) {
        const name114 = this.name;
        if (argNames[name114] === true) {
          return function(scope, args, _context) {
            return getSafeProperty(args, name114);
          };
        } else if (name114 in math2) {
          return function(scope, _args, _context) {
            return scope.has(name114) ? scope.get(name114) : getSafeProperty(math2, name114);
          };
        } else {
          const isUnit2 = isValuelessUnit(name114);
          return function(scope, _args, _context) {
            return scope.has(name114) ? scope.get(name114) : isUnit2 ? new Unit(null, name114) : SymbolNode.onUndefinedSymbol(name114);
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(_callback) {
      }
      /**
       * Create a new SymbolNode with children produced by the given callback.
       * Trivial since a SymbolNode has no children
       * @param {function(child: Node, path: string, parent: Node) : Node} callback
       * @returns {SymbolNode} Returns a clone of the node
       */
      map(_callback) {
        return this.clone();
      }
      /**
       * Throws an error 'Undefined symbol {name}'
       * @param {string} name
       */
      static onUndefinedSymbol(name114) {
        throw new Error("Undefined symbol " + name114);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {SymbolNode}
       */
      // @ts-expect-error: clone returns SymbolNode which is compatible with MathNode
      clone() {
        return new SymbolNode(this.name);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toString(_options) {
        return this.name;
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toHTML(_options) {
        const name114 = escape(this.name);
        if (name114 === "true" || name114 === "false") {
          return '<span class="math-symbol math-boolean">' + name114 + "</span>";
        } else if (name114 === "i") {
          return '<span class="math-symbol math-imaginary-symbol">' + name114 + "</span>";
        } else if (name114 === "Infinity") {
          return '<span class="math-symbol math-infinity-symbol">' + name114 + "</span>";
        } else if (name114 === "NaN") {
          return '<span class="math-symbol math-nan-symbol">' + name114 + "</span>";
        } else if (name114 === "null") {
          return '<span class="math-symbol math-null-symbol">' + name114 + "</span>";
        } else if (name114 === "undefined") {
          return '<span class="math-symbol math-undefined-symbol">' + name114 + "</span>";
        }
        return '<span class="math-symbol">' + name114 + "</span>";
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: "SymbolNode",
          name: this.name
        };
      }
      /**
       * Instantiate a SymbolNode from its JSON representation
       * @param {Object} json  An object structured like
       *                       `{"mathjs": "SymbolNode", name: "x"}`,
       *                       where mathjs is optional
       * @returns {SymbolNode}
       */
      static fromJSON(json) {
        return new SymbolNode(json.name);
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       * @override
       */
      _toTex(_options) {
        let isUnit2 = false;
        if (typeof math[this.name] === "undefined" && isValuelessUnit(this.name)) {
          isUnit2 = true;
        }
        const symbol = toSymbol(this.name, isUnit2);
        if (symbol[0] === "\\") {
          return symbol;
        }
        return " " + symbol;
      }
    }
    return SymbolNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/node/FunctionNode.ts
var name42 = "FunctionNode";
var dependencies40 = ["math", "Node", "SymbolNode"];
var createFunctionNode = /* @__PURE__ */ factory(
  name42,
  dependencies40,
  ({
    math,
    Node,
    SymbolNode
  }) => {
    const strin = (entity) => format3(entity, { truncate: 78 });
    function expandTemplate(template, node, options) {
      let latex = "";
      const regex = /\$(?:\{([a-z_][a-z_0-9]*)(?:\[([0-9]+)\])?\}|\$)/gi;
      let inputPos = 0;
      let match;
      while ((match = regex.exec(template)) !== null) {
        latex += template.substring(inputPos, match.index);
        inputPos = match.index;
        if (match[0] === "$$") {
          latex += "$";
          inputPos++;
        } else {
          inputPos += match[0].length;
          const property = node[match[1]];
          if (!property) {
            throw new ReferenceError(
              "Template: Property " + match[1] + " does not exist."
            );
          }
          if (match[2] === void 0) {
            switch (typeof property) {
              case "string":
                latex += property;
                break;
              case "object":
                if (isNode(property)) {
                  latex += property.toTex(options);
                } else if (Array.isArray(property)) {
                  latex += property.map(function(arg, index) {
                    if (isNode(arg)) {
                      return arg.toTex(options);
                    }
                    throw new TypeError(
                      "Template: " + match[1] + "[" + index + "] is not a Node."
                    );
                  }).join(",");
                } else {
                  throw new TypeError(
                    "Template: " + match[1] + " has to be a Node, String or array of Nodes"
                  );
                }
                break;
              default:
                throw new TypeError(
                  "Template: " + match[1] + " has to be a Node, String or array of Nodes"
                );
            }
          } else {
            if (isNode(property[match[2]] && property[match[2]])) {
              latex += property[match[2]].toTex(options);
            } else {
              throw new TypeError(
                "Template: " + match[1] + "[" + match[2] + "] is not a Node."
              );
            }
          }
        }
      }
      latex += template.slice(inputPos);
      return latex;
    }
    const _FunctionNode = class _FunctionNode extends Node {
      /**
       * @constructor FunctionNode
       * @extends {./Node}
       * invoke a list with arguments on a node
       * @param {./Node | string} fn
       *     Item resolving to a function on which to invoke
       *     the arguments, typically a SymbolNode or AccessorNode
       * @param {./Node[]} args
       */
      constructor(fn, args, optional) {
        super();
        if (typeof fn === "string") {
          fn = new SymbolNode(fn);
        }
        if (!isNode(fn)) throw new TypeError('Node expected as parameter "fn"');
        if (!Array.isArray(args) || !args.every(isNode)) {
          throw new TypeError(
            'Array containing Nodes expected for parameter "args"'
          );
        }
        const optionalType = typeof optional;
        if (!(optionalType === "undefined" || optionalType === "boolean")) {
          throw new TypeError("optional flag, if specified, must be boolean");
        }
        this.fn = fn;
        this.args = args || [];
        this.optional = !!optional;
      }
      // readonly property name
      get name() {
        return this.fn.name || "";
      }
      get type() {
        return name42;
      }
      get isFunctionNode() {
        return true;
      }
      /**
       * Compile a node into a JavaScript function.
       * This basically pre-calculates as much as possible and only leaves open
       * calculations which depend on a dynamic scope with variables.
       * @param {Object} math     Math.js namespace with functions and constants.
       * @param {Object} argNames An object with argument names as key and `true`
       *                          as value. Used in the SymbolNode to optimize
       *                          for arguments from user assigned functions
       *                          (see FunctionAssignmentNode) or special symbols
       *                          like `end` (see IndexNode).
       * @return {function} Returns a function which can be called like:
       *                        evalNode(scope: Object, args: Object, context: *)
       */
      _compile(math2, argNames) {
        const evalArgs = this.args.map((arg) => arg._compile(math2, argNames));
        const fromOptionalChaining = this.optional || isAccessorNode(this.fn) && this.fn.optionalChaining;
        if (isSymbolNode(this.fn)) {
          const name114 = this.fn.name;
          if (!argNames[name114]) {
            const fn = name114 in math2 ? getSafeProperty(math2, name114) : void 0;
            const isRaw = typeof fn === "function" && fn.rawArgs === true;
            const resolveFn = (scope) => {
              let value;
              if (scope.has(name114)) {
                value = scope.get(name114);
              } else if (name114 in math2) {
                value = getSafeProperty(math2, name114);
              } else if (fromOptionalChaining) value = void 0;
              else return _FunctionNode.onUndefinedFunction(name114);
              if (typeof value === "function" || fromOptionalChaining && value === void 0) {
                return value;
              }
              throw new TypeError(
                `'${name114}' is not a function; its value is:
  ${strin(value)}`
              );
            };
            if (isRaw) {
              const rawArgs = this.args;
              return function evalFunctionNode(scope, args, context) {
                const fn2 = resolveFn(scope);
                if (fn2.rawArgs === true) {
                  return fn2(rawArgs, math2, createSubScope(scope, args));
                } else {
                  const values = evalArgs.map(
                    (evalArg) => evalArg(scope, args, context)
                  );
                  return fn2(...values);
                }
              };
            } else {
              switch (evalArgs.length) {
                case 0:
                  return function evalFunctionNode(scope, _args, _context) {
                    const fn2 = resolveFn(scope);
                    if (fromOptionalChaining && fn2 === void 0)
                      return void 0;
                    return fn2();
                  };
                case 1:
                  return function evalFunctionNode(scope, args, context) {
                    const fn2 = resolveFn(scope);
                    if (fromOptionalChaining && fn2 === void 0)
                      return void 0;
                    const evalArg0 = evalArgs[0];
                    return fn2(evalArg0(scope, args, context));
                  };
                case 2:
                  return function evalFunctionNode(scope, args, context) {
                    const fn2 = resolveFn(scope);
                    if (fromOptionalChaining && fn2 === void 0)
                      return void 0;
                    const evalArg0 = evalArgs[0];
                    const evalArg1 = evalArgs[1];
                    return fn2(
                      evalArg0(scope, args, context),
                      evalArg1(scope, args, context)
                    );
                  };
                default:
                  return function evalFunctionNode(scope, args, context) {
                    const fn2 = resolveFn(scope);
                    if (fromOptionalChaining && fn2 === void 0)
                      return void 0;
                    const values = evalArgs.map(
                      (evalArg) => evalArg(scope, args, context)
                    );
                    return fn2(...values);
                  };
              }
            }
          } else {
            const rawArgs = this.args;
            return function evalFunctionNode(scope, args, context) {
              const fn = getSafeProperty(args, name114);
              if (fromOptionalChaining && fn === void 0) return void 0;
              if (typeof fn !== "function") {
                throw new TypeError(
                  `Argument '${name114}' was not a function; received: ${strin(fn)}`
                );
              }
              if (fn.rawArgs) {
                return fn(rawArgs, math2, createSubScope(scope, args));
              } else {
                const values = evalArgs.map(
                  (evalArg) => evalArg(scope, args, context)
                );
                return fn.apply(fn, values);
              }
            };
          }
        } else if (isAccessorNode(this.fn) && isIndexNode(this.fn.index) && this.fn.index.isObjectProperty()) {
          const evalObject = this.fn.object._compile(math2, argNames);
          const prop = this.fn.index.getObjectProperty();
          const rawArgs = this.args;
          return function evalFunctionNode(scope, args, context) {
            const object = evalObject(scope, args, context);
            if (fromOptionalChaining && (object == null || object[prop] === void 0)) {
              return void 0;
            }
            const fn = getSafeMethod(object, prop);
            if (fn?.rawArgs) {
              return fn(rawArgs, math2, createSubScope(scope, args));
            } else {
              const values = evalArgs.map(
                (evalArg) => evalArg(scope, args, context)
              );
              return fn.apply(object, values);
            }
          };
        } else {
          const fnExpr = this.fn.toString();
          const evalFn = this.fn._compile(math2, argNames);
          const rawArgs = this.args;
          return function evalFunctionNode(scope, args, context) {
            const fn = evalFn(scope, args, context);
            if (fromOptionalChaining && fn === void 0) return void 0;
            if (typeof fn !== "function") {
              throw new TypeError(
                `Expression '${fnExpr}' did not evaluate to a function; value is:
  ${strin(fn)}`
              );
            }
            if (fn.rawArgs) {
              return fn(rawArgs, math2, createSubScope(scope, args));
            } else {
              const values = evalArgs.map(
                (evalArg) => evalArg(scope, args, context)
              );
              return fn.apply(fn, values);
            }
          };
        }
      }
      /**
       * Execute a callback for each of the child nodes of this node
       * @param {function(child: Node, path: string, parent: Node)} callback
       */
      forEach(callback) {
        callback(this.fn, "fn", this);
        for (let i = 0; i < this.args.length; i++) {
          callback(this.args[i], "args[" + i + "]", this);
        }
      }
      /**
       * Create a new FunctionNode whose children are the results of calling
       * the provided callback function for each child of the original node.
       * @param {function(child: Node, path: string, parent: Node): Node} callback
       * @returns {FunctionNode} Returns a transformed copy of the node
       */
      map(callback) {
        const fn = this._ifNode(callback(this.fn, "fn", this));
        const args = [];
        for (let i = 0; i < this.args.length; i++) {
          args[i] = this._ifNode(
            callback(this.args[i], "args[" + i + "]", this)
          );
        }
        return new _FunctionNode(fn, args);
      }
      /**
       * Create a clone of this node, a shallow copy
       * @return {FunctionNode}
       */
      clone() {
        return new _FunctionNode(this.fn, this.args.slice(0));
      }
      /**
       * Get string representation. (wrapper function)
       * This overrides parts of Node's toString function.
       * If callback is an object containing callbacks, it
       * calls the correct callback for the current node,
       * otherwise it falls back to calling Node's toString
       * function.
       *
       * @param {Object} options
       * @return {string} str
       * @override
       */
      toString(options) {
        let customString;
        const name114 = this.fn.toString(options);
        if (options && typeof options.handler === "object" && hasOwnProperty(options.handler, name114)) {
          customString = options.handler[name114](this, options);
        }
        if (typeof customString !== "undefined") {
          return customString;
        }
        return super.toString(options);
      }
      /**
       * Get string representation
       * @param {Object} options
       * @return {string} str
       */
      _toString(options) {
        const args = this.args.map(function(arg) {
          return arg.toString(options);
        });
        const fn = isFunctionAssignmentNode(this.fn) ? "(" + this.fn.toString(options) + ")" : this.fn.toString(options);
        return fn + "(" + args.join(", ") + ")";
      }
      /**
       * Get a JSON representation of the node
       * @returns {Object}
       */
      toJSON() {
        return {
          mathjs: name42,
          fn: this.fn,
          args: this.args
        };
      }
      /**
       * Get HTML representation
       * @param {Object} options
       * @return {string} str
       */
      _toHTML(options) {
        const args = this.args.map(function(arg) {
          return arg.toHTML(options);
        });
        return '<span class="math-function">' + escape(this.fn) + '</span><span class="math-paranthesis math-round-parenthesis">(</span>' + args.join('<span class="math-separator">,</span>') + '<span class="math-paranthesis math-round-parenthesis">)</span>';
      }
      /**
       * Get LaTeX representation. (wrapper function)
       * This overrides parts of Node's toTex function.
       * If callback is an object containing callbacks, it
       * calls the correct callback for the current node,
       * otherwise it falls back to calling Node's toTex
       * function.
       *
       * @param {Object} options
       * @return {string}
       */
      toTex(options) {
        let customTex;
        if (options && typeof options.handler === "object" && hasOwnProperty(options.handler, this.name)) {
          customTex = options.handler[this.name](this, options);
        }
        if (typeof customTex !== "undefined") {
          return customTex;
        }
        return super.toTex(options);
      }
      /**
       * Get LaTeX representation
       * @param {Object} options
       * @return {string} str
       */
      _toTex(options) {
        const args = this.args.map(function(arg) {
          return arg.toTex(options);
        });
        let latexConverter;
        if (latexFunctions[this.name]) {
          latexConverter = latexFunctions[this.name];
        }
        if (math[this.name] && (typeof math[this.name].toTex === "function" || typeof math[this.name].toTex === "object" || typeof math[this.name].toTex === "string")) {
          latexConverter = math[this.name].toTex;
        }
        let customToTex;
        switch (typeof latexConverter) {
          case "function":
            customToTex = latexConverter(this, options);
            break;
          case "string":
            customToTex = expandTemplate(latexConverter, this, options);
            break;
          case "object":
            switch (typeof latexConverter[args.length]) {
              case "function":
                customToTex = latexConverter[args.length](this, options);
                break;
              case "string":
                customToTex = expandTemplate(
                  latexConverter[args.length],
                  this,
                  options
                );
                break;
            }
        }
        if (typeof customToTex !== "undefined") {
          return customToTex;
        }
        return expandTemplate(defaultTemplate, this, options);
      }
      /**
       * Get identifier.
       * @return {string}
       */
      getIdentifier() {
        return this.type + ":" + this.name;
      }
    };
    /**
     * Throws an error 'Undefined function {name}'
     * @param {string} name
     */
    _FunctionNode.onUndefinedFunction = function(name114) {
      throw new Error("Undefined function " + name114);
    };
    /**
     * Instantiate an AssignmentNode from its JSON representation
     * @param {Object} json  An object structured like
     *                       `{"mathjs": "FunctionNode", fn: ..., args: ...}`,
     *                       where mathjs is optional
     * @returns {FunctionNode}
     */
    _FunctionNode.fromJSON = function(json) {
      return new _FunctionNode(json.fn, json.args);
    };
    let FunctionNode = _FunctionNode;
    Object.defineProperty(FunctionNode, "name", {
      value: name42,
      configurable: true
    });
    return FunctionNode;
  },
  { isClass: true, isNode: true }
);

// src/expression/parse.ts
var name43 = "parse";
var dependencies41 = [
  "typed",
  "numeric",
  "config",
  "AccessorNode",
  "ArrayNode",
  "AssignmentNode",
  "BlockNode",
  "ConditionalNode",
  "ConstantNode",
  "FunctionAssignmentNode",
  "FunctionNode",
  "IndexNode",
  "ObjectNode",
  "OperatorNode",
  "ParenthesisNode",
  "RangeNode",
  "RelationalNode",
  "SymbolNode"
];
var createParse = /* @__PURE__ */ factory(
  name43,
  dependencies41,
  ({
    typed: typed2,
    numeric,
    config,
    AccessorNode,
    ArrayNode,
    AssignmentNode,
    BlockNode,
    ConditionalNode,
    ConstantNode,
    FunctionAssignmentNode,
    FunctionNode,
    IndexNode,
    ObjectNode,
    OperatorNode,
    ParenthesisNode,
    RangeNode,
    RelationalNode,
    SymbolNode
  }) => {
    const parse = typed2(name43, {
      string: function(expression) {
        return parseStart(expression, {});
      },
      "Array | Matrix": function(expressions) {
        return parseMultiple(expressions, {});
      },
      "string, Object": function(expression, options) {
        const extraNodes = options.nodes !== void 0 ? options.nodes : {};
        return parseStart(expression, extraNodes);
      },
      "Array | Matrix, Object": parseMultiple
    });
    function parseMultiple(expressions, options = {}) {
      const extraNodes = options.nodes !== void 0 ? options.nodes : {};
      return deepMap2(expressions, function(elem) {
        if (typeof elem !== "string") throw new TypeError("String expected");
        return parseStart(elem, extraNodes);
      });
    }
    const DELIMITERS = {
      ",": true,
      "(": true,
      ")": true,
      "[": true,
      "]": true,
      "{": true,
      "}": true,
      '"': true,
      "'": true,
      ";": true,
      "+": true,
      "-": true,
      "*": true,
      ".*": true,
      "/": true,
      "./": true,
      "%": true,
      "^": true,
      ".^": true,
      "~": true,
      "!": true,
      "&": true,
      "|": true,
      "^|": true,
      "=": true,
      ":": true,
      "?": true,
      "?.": true,
      "??": true,
      "==": true,
      "!=": true,
      "<": true,
      ">": true,
      "<=": true,
      ">=": true,
      "<<": true,
      ">>": true,
      ">>>": true
    };
    const NAMED_DELIMITERS = {
      mod: true,
      to: true,
      in: true,
      and: true,
      xor: true,
      or: true,
      not: true
    };
    const CONSTANTS = {
      true: true,
      false: false,
      null: null,
      undefined: void 0
    };
    const NUMERIC_CONSTANTS = ["NaN", "Infinity"];
    const ESCAPE_CHARACTERS = {
      '"': '"',
      "'": "'",
      "\\": "\\",
      "/": "/",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "	"
      // note that \u is handled separately in parseStringToken()
    };
    function initialState() {
      return {
        extraNodes: {},
        // current extra nodes, must be careful not to mutate
        expression: "",
        // current expression
        comment: "",
        // last parsed comment
        index: 0,
        // current index in expr
        token: "",
        // current token
        tokenType: 0 /* NULL */,
        // type of the token
        nestingLevel: 0,
        // level of nesting inside parameters, used to ignore newline characters
        conditionalLevel: null
        // when a conditional is being parsed, the level of the conditional is stored here
      };
    }
    function currentString(state, length) {
      return state.expression.substr(state.index, length);
    }
    function currentCharacter(state) {
      return currentString(state, 1);
    }
    function next(state) {
      state.index++;
    }
    function prevCharacter(state) {
      return state.expression.charAt(state.index - 1);
    }
    function nextCharacter(state) {
      return state.expression.charAt(state.index + 1);
    }
    function getToken(state) {
      state.tokenType = 0 /* NULL */;
      state.token = "";
      state.comment = "";
      while (true) {
        if (currentCharacter(state) === "#") {
          while (currentCharacter(state) !== "\n" && currentCharacter(state) !== "") {
            state.comment += currentCharacter(state);
            next(state);
          }
        }
        if (parse.isWhitespace(currentCharacter(state), state.nestingLevel)) {
          next(state);
        } else {
          break;
        }
      }
      if (currentCharacter(state) === "") {
        state.tokenType = 1 /* DELIMITER */;
        return;
      }
      if (currentCharacter(state) === "\n" && !state.nestingLevel) {
        state.tokenType = 1 /* DELIMITER */;
        state.token = currentCharacter(state);
        next(state);
        return;
      }
      const c1 = currentCharacter(state);
      const c2 = currentString(state, 2);
      const c3 = currentString(state, 3);
      if (c3.length === 3 && DELIMITERS[c3]) {
        state.tokenType = 1 /* DELIMITER */;
        state.token = c3;
        next(state);
        next(state);
        next(state);
        return;
      }
      if (c2.length === 2 && DELIMITERS[c2] && (c2 !== "?." || !parse.isDigit(state.expression.charAt(state.index + 2)))) {
        state.tokenType = 1 /* DELIMITER */;
        state.token = c2;
        next(state);
        next(state);
        return;
      }
      if (DELIMITERS[c1]) {
        state.tokenType = 1 /* DELIMITER */;
        state.token = c1;
        next(state);
        return;
      }
      if (parse.isDigitDot(c1)) {
        state.tokenType = 2 /* NUMBER */;
        const c22 = currentString(state, 2);
        if (c22 === "0b" || c22 === "0o" || c22 === "0x") {
          state.token += currentCharacter(state);
          next(state);
          state.token += currentCharacter(state);
          next(state);
          while (parse.isAlpha(
            currentCharacter(state),
            prevCharacter(state),
            nextCharacter(state)
          ) || parse.isDigit(currentCharacter(state))) {
            state.token += currentCharacter(state);
            next(state);
          }
          if (currentCharacter(state) === ".") {
            state.token += ".";
            next(state);
            while (parse.isAlpha(
              currentCharacter(state),
              prevCharacter(state),
              nextCharacter(state)
            ) || parse.isDigit(currentCharacter(state))) {
              state.token += currentCharacter(state);
              next(state);
            }
          } else if (currentCharacter(state) === "i") {
            state.token += "i";
            next(state);
            while (parse.isDigit(currentCharacter(state))) {
              state.token += currentCharacter(state);
              next(state);
            }
          }
          return;
        }
        if (currentCharacter(state) === ".") {
          state.token += currentCharacter(state);
          next(state);
          if (!parse.isDigit(currentCharacter(state))) {
            state.tokenType = 1 /* DELIMITER */;
            return;
          }
        } else {
          while (parse.isDigit(currentCharacter(state))) {
            state.token += currentCharacter(state);
            next(state);
          }
          if (parse.isDecimalMark(currentCharacter(state), nextCharacter(state))) {
            state.token += currentCharacter(state);
            next(state);
          }
        }
        while (parse.isDigit(currentCharacter(state))) {
          state.token += currentCharacter(state);
          next(state);
        }
        if (currentCharacter(state) === "E" || currentCharacter(state) === "e") {
          if (parse.isDigit(nextCharacter(state)) || nextCharacter(state) === "-" || nextCharacter(state) === "+") {
            state.token += currentCharacter(state);
            next(state);
            if (currentCharacter(state) === "+" || currentCharacter(state) === "-") {
              state.token += currentCharacter(state);
              next(state);
            }
            if (!parse.isDigit(currentCharacter(state))) {
              throw createSyntaxError(
                state,
                'Digit expected, got "' + currentCharacter(state) + '"'
              );
            }
            while (parse.isDigit(currentCharacter(state))) {
              state.token += currentCharacter(state);
              next(state);
            }
            if (parse.isDecimalMark(currentCharacter(state), nextCharacter(state))) {
              throw createSyntaxError(
                state,
                'Digit expected, got "' + currentCharacter(state) + '"'
              );
            }
          } else if (parse.isDecimalMark(
            nextCharacter(state),
            state.expression.charAt(state.index + 2)
          )) {
            next(state);
            throw createSyntaxError(
              state,
              'Digit expected, got "' + currentCharacter(state) + '"'
            );
          }
        }
        return;
      }
      if (parse.isAlpha(
        currentCharacter(state),
        prevCharacter(state),
        nextCharacter(state)
      )) {
        while (parse.isAlpha(
          currentCharacter(state),
          prevCharacter(state),
          nextCharacter(state)
        ) || parse.isDigit(currentCharacter(state))) {
          state.token += currentCharacter(state);
          next(state);
        }
        if (hasOwnProperty(NAMED_DELIMITERS, state.token)) {
          state.tokenType = 1 /* DELIMITER */;
        } else {
          state.tokenType = 3 /* SYMBOL */;
        }
        return;
      }
      state.tokenType = 4 /* UNKNOWN */;
      while (currentCharacter(state) !== "") {
        state.token += currentCharacter(state);
        next(state);
      }
      throw createSyntaxError(
        state,
        'Syntax error in part "' + state.token + '"'
      );
    }
    function getTokenSkipNewline(state) {
      do {
        getToken(state);
      } while (state.token === "\n");
    }
    function openParams(state) {
      state.nestingLevel++;
    }
    function closeParams(state) {
      state.nestingLevel--;
    }
    parse.isAlpha = function isAlpha(c, cPrev, cNext) {
      return parse.isValidLatinOrGreek(c) || parse.isValidMathSymbol(c, cNext) || parse.isValidMathSymbol(cPrev, c);
    };
    parse.isValidLatinOrGreek = function isValidLatinOrGreek(c) {
      return /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(c);
    };
    parse.isValidMathSymbol = function isValidMathSymbol(high, low) {
      return /^[\uD835]$/.test(high) && /^[\uDC00-\uDFFF]$/.test(low) && /^[^\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]$/.test(
        low
      );
    };
    parse.isWhitespace = function isWhitespace(c, nestingLevel) {
      return c === " " || c === "	" || c === "\xA0" || c === "\n" && nestingLevel > 0;
    };
    parse.isDecimalMark = function isDecimalMark(c, cNext) {
      return c === "." && cNext !== "/" && cNext !== "*" && cNext !== "^";
    };
    parse.isDigitDot = function isDigitDot(c) {
      return c >= "0" && c <= "9" || c === ".";
    };
    parse.isDigit = function isDigit(c) {
      return c >= "0" && c <= "9";
    };
    function parseStart(expression, extraNodes) {
      const state = initialState();
      Object.assign(state, { expression, extraNodes });
      getToken(state);
      const node = parseBlock(state);
      if (state.token !== "") {
        if (state.tokenType === 1 /* DELIMITER */) {
          throw createError(state, "Unexpected operator " + state.token);
        } else {
          throw createSyntaxError(
            state,
            'Unexpected part "' + state.token + '"'
          );
        }
      }
      return node;
    }
    function parseBlock(state) {
      let node;
      const blocks = [];
      let visible;
      if (state.token !== "" && state.token !== "\n" && state.token !== ";") {
        node = parseAssignment(state);
        if (state.comment) {
          node.comment = state.comment;
        }
      }
      while (state.token === "\n" || state.token === ";") {
        if (blocks.length === 0 && node) {
          visible = state.token !== ";";
          blocks.push({ node, visible });
        }
        getToken(state);
        if (state.token !== "\n" && state.token !== ";" && state.token !== "") {
          node = parseAssignment(state);
          if (state.comment) {
            node.comment = state.comment;
          }
          visible = state.token !== ";";
          blocks.push({ node, visible });
        }
      }
      if (blocks.length > 0) {
        return new BlockNode(blocks);
      } else {
        if (!node) {
          node = new ConstantNode(void 0);
          if (state.comment) {
            node.comment = state.comment;
          }
        }
        return node;
      }
    }
    function parseAssignment(state) {
      let name114;
      let args;
      let value;
      let valid;
      const node = parseConditional(state);
      if (state.token === "=") {
        if (isSymbolNode(node)) {
          name114 = node.name;
          getTokenSkipNewline(state);
          value = parseAssignment(state);
          return new AssignmentNode(new SymbolNode(name114), value);
        } else if (isAccessorNode(node)) {
          if (node.optionalChaining) {
            throw createSyntaxError(state, "Cannot assign to optional chain");
          }
          getTokenSkipNewline(state);
          value = parseAssignment(state);
          return new AssignmentNode(
            node.object,
            node.index,
            value
          );
        } else if (isFunctionNode(node) && isSymbolNode(node.fn)) {
          valid = true;
          args = [];
          name114 = node.name;
          node.args.forEach(function(arg, index) {
            if (isSymbolNode(arg)) {
              args[index] = arg.name;
            } else {
              valid = false;
            }
          });
          if (valid) {
            getTokenSkipNewline(state);
            value = parseAssignment(state);
            return new FunctionAssignmentNode(name114, args, value);
          }
        }
        throw createSyntaxError(
          state,
          "Invalid left hand side of assignment operator ="
        );
      }
      return node;
    }
    function parseConditional(state) {
      let node = parseLogicalOr(state);
      while (state.token === "?") {
        const prev = state.conditionalLevel;
        state.conditionalLevel = state.nestingLevel;
        getTokenSkipNewline(state);
        const condition = node;
        const trueExpr = parseAssignment(state);
        if (state.token !== ":")
          throw createSyntaxError(
            state,
            "False part of conditional expression expected"
          );
        state.conditionalLevel = null;
        getTokenSkipNewline(state);
        const falseExpr = parseAssignment(state);
        node = new ConditionalNode(condition, trueExpr, falseExpr);
        state.conditionalLevel = prev;
      }
      return node;
    }
    function parseLogicalOr(state) {
      let node = parseLogicalXor(state);
      while (state.token === "or") {
        getTokenSkipNewline(state);
        node = new OperatorNode("or", "or", [node, parseLogicalXor(state)]);
      }
      return node;
    }
    function parseLogicalXor(state) {
      let node = parseLogicalAnd(state);
      while (state.token === "xor") {
        getTokenSkipNewline(state);
        node = new OperatorNode("xor", "xor", [node, parseLogicalAnd(state)]);
      }
      return node;
    }
    function parseLogicalAnd(state) {
      let node = parseBitwiseOr(state);
      while (state.token === "and") {
        getTokenSkipNewline(state);
        node = new OperatorNode("and", "and", [node, parseBitwiseOr(state)]);
      }
      return node;
    }
    function parseBitwiseOr(state) {
      let node = parseBitwiseXor(state);
      while (state.token === "|") {
        getTokenSkipNewline(state);
        node = new OperatorNode("|", "bitOr", [node, parseBitwiseXor(state)]);
      }
      return node;
    }
    function parseBitwiseXor(state) {
      let node = parseBitwiseAnd(state);
      while (state.token === "^|") {
        getTokenSkipNewline(state);
        node = new OperatorNode("^|", "bitXor", [node, parseBitwiseAnd(state)]);
      }
      return node;
    }
    function parseBitwiseAnd(state) {
      let node = parseRelational(state);
      while (state.token === "&") {
        getTokenSkipNewline(state);
        node = new OperatorNode("&", "bitAnd", [node, parseRelational(state)]);
      }
      return node;
    }
    function parseRelational(state) {
      const params = [parseShift(state)];
      const conditionals = [];
      const operators = {
        "==": "equal",
        "!=": "unequal",
        "<": "smaller",
        ">": "larger",
        "<=": "smallerEq",
        ">=": "largerEq"
      };
      while (hasOwnProperty(operators, state.token)) {
        const cond = { name: state.token, fn: operators[state.token] };
        conditionals.push(cond);
        getTokenSkipNewline(state);
        params.push(parseShift(state));
      }
      if (params.length === 1) {
        return params[0];
      } else if (params.length === 2) {
        return new OperatorNode(
          conditionals[0].name,
          conditionals[0].fn,
          params
        );
      } else {
        return new RelationalNode(
          conditionals.map((c) => c.fn),
          params
        );
      }
    }
    function parseShift(state) {
      let node;
      let name114;
      let fn;
      let params;
      node = parseConversion(state);
      const operators = {
        "<<": "leftShift",
        ">>": "rightArithShift",
        ">>>": "rightLogShift"
      };
      while (hasOwnProperty(operators, state.token)) {
        name114 = state.token;
        fn = operators[name114];
        getTokenSkipNewline(state);
        params = [node, parseConversion(state)];
        node = new OperatorNode(name114, fn, params);
      }
      return node;
    }
    function parseConversion(state) {
      let node;
      let name114;
      let fn;
      let params;
      node = parseRange(state);
      const operators = {
        to: "to",
        in: "to"
        // alias of 'to'
      };
      while (hasOwnProperty(operators, state.token)) {
        name114 = state.token;
        fn = operators[name114];
        getTokenSkipNewline(state);
        if (name114 === "in" && "])},;".includes(state.token)) {
          node = new OperatorNode(
            "*",
            "multiply",
            [node, new SymbolNode("in")],
            true
          );
        } else {
          params = [node, parseRange(state)];
          node = new OperatorNode(name114, fn, params);
        }
      }
      return node;
    }
    function parseRange(state) {
      let node;
      const params = [];
      if (state.token === ":") {
        if (state.conditionalLevel === state.nestingLevel) {
          throw createSyntaxError(
            state,
            "The true-expression of a conditional operator may not be empty"
          );
        } else {
          node = new ConstantNode(1);
        }
      } else {
        node = parseAddSubtract(state);
      }
      if (state.token === ":" && state.conditionalLevel !== state.nestingLevel) {
        params.push(node);
        while (state.token === ":" && params.length < 3) {
          getTokenSkipNewline(state);
          if (state.token === ")" || state.token === "]" || state.token === "," || state.token === "") {
            params.push(new SymbolNode("end"));
          } else {
            params.push(parseAddSubtract(state));
          }
        }
        if (params.length === 3) {
          node = new RangeNode(params[0], params[2], params[1]);
        } else {
          node = new RangeNode(params[0], params[1]);
        }
      }
      return node;
    }
    function parseAddSubtract(state) {
      let node;
      let name114;
      let fn;
      let params;
      node = parseMultiplyDivideModulus(state);
      const operators = {
        "+": "add",
        "-": "subtract"
      };
      while (hasOwnProperty(operators, state.token)) {
        name114 = state.token;
        fn = operators[name114];
        getTokenSkipNewline(state);
        const rightNode = parseMultiplyDivideModulus(state);
        if (rightNode.isPercentage) {
          params = [node, new OperatorNode("*", "multiply", [node, rightNode])];
        } else {
          params = [node, rightNode];
        }
        node = new OperatorNode(name114, fn, params);
      }
      return node;
    }
    function parseMultiplyDivideModulus(state) {
      let node;
      let last;
      let name114;
      let fn;
      node = parseImplicitMultiplication(state);
      last = node;
      const operators = {
        "*": "multiply",
        ".*": "dotMultiply",
        "/": "divide",
        "./": "dotDivide",
        "%": "mod",
        mod: "mod"
      };
      while (true) {
        if (hasOwnProperty(operators, state.token)) {
          name114 = state.token;
          fn = operators[name114];
          getTokenSkipNewline(state);
          last = parseImplicitMultiplication(state);
          node = new OperatorNode(name114, fn, [node, last]);
        } else {
          break;
        }
      }
      return node;
    }
    function parseImplicitMultiplication(state) {
      let node;
      let last;
      node = parseRule2(state);
      last = node;
      while (true) {
        if (state.tokenType === 3 /* SYMBOL */ || state.token === "in" && isConstantNode(node) || state.token === "in" && isOperatorNode(node) && node.fn === "unaryMinus" && isConstantNode(node.args[0]) || state.tokenType === 2 /* NUMBER */ && !isConstantNode(last) && (!isOperatorNode(last) || last.op === "!") || state.token === "(") {
          last = parseRule2(state);
          node = new OperatorNode(
            "*",
            "multiply",
            [node, last],
            true
            /* implicit */
          );
        } else {
          break;
        }
      }
      return node;
    }
    function parseRule2(state) {
      let node = parseUnaryPercentage(state);
      let last = node;
      const tokenStates = [];
      while (true) {
        if (state.token === "/" && rule2Node(last)) {
          tokenStates.push(Object.assign({}, state));
          getTokenSkipNewline(state);
          if (state.tokenType === 2 /* NUMBER */) {
            tokenStates.push(Object.assign({}, state));
            getTokenSkipNewline(state);
            if (state.tokenType === 3 /* SYMBOL */ || state.token === "(" || state.token === "in") {
              Object.assign(state, tokenStates.pop());
              tokenStates.pop();
              last = parseUnaryPercentage(state);
              node = new OperatorNode("/", "divide", [node, last]);
            } else {
              tokenStates.pop();
              Object.assign(state, tokenStates.pop());
              break;
            }
          } else {
            Object.assign(state, tokenStates.pop());
            break;
          }
        } else {
          break;
        }
      }
      return node;
    }
    function parseUnaryPercentage(state) {
      let node = parseUnary(state);
      if (state.token === "%") {
        const previousState = Object.assign({}, state);
        getTokenSkipNewline(state);
        try {
          parseUnary(state);
          Object.assign(state, previousState);
        } catch {
          node = new OperatorNode(
            "/",
            "divide",
            [node, new ConstantNode(100)],
            false,
            true
          );
        }
      }
      return node;
    }
    function parseUnary(state) {
      let name114;
      let params;
      let fn;
      const operators = {
        "-": "unaryMinus",
        "+": "unaryPlus",
        "~": "bitNot",
        not: "not"
      };
      if (hasOwnProperty(operators, state.token)) {
        fn = operators[state.token];
        name114 = state.token;
        getTokenSkipNewline(state);
        params = [parseUnary(state)];
        return new OperatorNode(name114, fn, params);
      }
      return parsePow(state);
    }
    function parsePow(state) {
      let node;
      let name114;
      let fn;
      let params;
      node = parseNullishCoalescing(state);
      if (state.token === "^" || state.token === ".^") {
        name114 = state.token;
        fn = name114 === "^" ? "pow" : "dotPow";
        getTokenSkipNewline(state);
        params = [node, parseUnary(state)];
        node = new OperatorNode(name114, fn, params);
      }
      return node;
    }
    function parseNullishCoalescing(state) {
      let node = parseLeftHandOperators(state);
      while (state.token === "??") {
        getTokenSkipNewline(state);
        node = new OperatorNode("??", "nullish", [
          node,
          parseLeftHandOperators(state)
        ]);
      }
      return node;
    }
    function parseLeftHandOperators(state) {
      let node;
      let name114;
      let fn;
      let params;
      node = parseCustomNodes(state);
      const operators = {
        "!": "factorial",
        "'": "ctranspose"
      };
      while (hasOwnProperty(operators, state.token)) {
        name114 = state.token;
        fn = operators[name114];
        getToken(state);
        params = [node];
        node = new OperatorNode(name114, fn, params);
        node = parseAccessors(state, node);
      }
      return node;
    }
    function parseCustomNodes(state) {
      let params = [];
      if (state.tokenType === 3 /* SYMBOL */ && hasOwnProperty(state.extraNodes, state.token)) {
        const CustomNode = state.extraNodes[state.token];
        getToken(state);
        if (state.token === "(") {
          params = [];
          openParams(state);
          getToken(state);
          if (state.token !== ")") {
            params.push(parseAssignment(state));
            while (state.token === ",") {
              getToken(state);
              params.push(parseAssignment(state));
            }
          }
          if (state.token !== ")") {
            throw createSyntaxError(state, "Parenthesis ) expected");
          }
          closeParams(state);
          getToken(state);
        }
        return new CustomNode(params);
      }
      return parseSymbol(state);
    }
    function parseSymbol(state) {
      let node;
      let name114;
      if (state.tokenType === 3 /* SYMBOL */ || state.tokenType === 1 /* DELIMITER */ && state.token in NAMED_DELIMITERS) {
        name114 = state.token;
        getToken(state);
        if (hasOwnProperty(CONSTANTS, name114)) {
          node = new ConstantNode(CONSTANTS[name114]);
        } else if (NUMERIC_CONSTANTS.includes(name114)) {
          node = new ConstantNode(numeric(name114, "number"));
        } else {
          node = new SymbolNode(name114);
        }
        node = parseAccessors(state, node);
        return node;
      }
      return parseString(state);
    }
    function parseAccessors(state, node, types) {
      let params;
      while (true) {
        let optional = false;
        if (state.token === "?.") {
          optional = true;
          getToken(state);
        }
        const hasNextAccessor = (state.token === "(" || state.token === "[" || state.token === ".") && (true);
        if (!(optional || hasNextAccessor)) {
          break;
        }
        params = [];
        if (state.token === "(") {
          if (optional || isSymbolNode(node) || isAccessorNode(node)) {
            openParams(state);
            getToken(state);
            if (state.token !== ")") {
              params.push(parseAssignment(state));
              while (state.token === ",") {
                getToken(state);
                params.push(parseAssignment(state));
              }
            }
            if (state.token !== ")") {
              throw createSyntaxError(state, "Parenthesis ) expected");
            }
            closeParams(state);
            getToken(state);
            node = new FunctionNode(node, params, optional);
          } else {
            return node;
          }
        } else if (state.token === "[") {
          openParams(state);
          getToken(state);
          if (state.token !== "]") {
            params.push(parseAssignment(state));
            while (state.token === ",") {
              getToken(state);
              params.push(parseAssignment(state));
            }
          }
          if (state.token !== "]") {
            throw createSyntaxError(state, "Parenthesis ] expected");
          }
          closeParams(state);
          getToken(state);
          node = new AccessorNode(node, new IndexNode(params), optional);
        } else {
          if (!optional) getToken(state);
          const isPropertyName = state.tokenType === 3 /* SYMBOL */ || state.tokenType === 1 /* DELIMITER */ && state.token in NAMED_DELIMITERS;
          if (!isPropertyName) {
            let message = "Property name expected after ";
            message += optional ? "optional chain" : "dot";
            throw createSyntaxError(state, message);
          }
          params.push(new ConstantNode(state.token));
          getToken(state);
          const dotNotation = true;
          node = new AccessorNode(
            node,
            new IndexNode(params, dotNotation),
            optional
          );
        }
      }
      return node;
    }
    function parseString(state) {
      let node;
      let str;
      if (state.token === '"' || state.token === "'") {
        str = parseStringToken(state, state.token);
        node = new ConstantNode(str);
        node = parseAccessors(state, node);
        return node;
      }
      return parseMatrix(state);
    }
    function parseStringToken(state, quote) {
      let str = "";
      while (currentCharacter(state) !== "" && currentCharacter(state) !== quote) {
        if (currentCharacter(state) === "\\") {
          next(state);
          const char = currentCharacter(state);
          const escapeChar = ESCAPE_CHARACTERS[char];
          if (escapeChar !== void 0) {
            str += escapeChar;
            state.index += 1;
          } else if (char === "u") {
            const unicode = state.expression.slice(
              state.index + 1,
              state.index + 5
            );
            if (/^[0-9A-Fa-f]{4}$/.test(unicode)) {
              str += String.fromCharCode(parseInt(unicode, 16));
              state.index += 5;
            } else {
              throw createSyntaxError(
                state,
                `Invalid unicode character \\u${unicode}`
              );
            }
          } else {
            throw createSyntaxError(state, `Bad escape character \\${char}`);
          }
        } else {
          str += currentCharacter(state);
          next(state);
        }
      }
      getToken(state);
      if (state.token !== quote) {
        throw createSyntaxError(state, `End of string ${quote} expected`);
      }
      getToken(state);
      return str;
    }
    function parseMatrix(state) {
      let array;
      let params;
      let rows;
      let cols;
      if (state.token === "[") {
        openParams(state);
        getToken(state);
        if (state.token !== "]") {
          const row = parseRow(state);
          if (state.token === ";") {
            rows = 1;
            params = [row];
            while (state.token === ";") {
              getToken(state);
              if (state.token !== "]") {
                params[rows] = parseRow(state);
                rows++;
              }
            }
            if (state.token !== "]") {
              throw createSyntaxError(state, "End of matrix ] expected");
            }
            closeParams(state);
            getToken(state);
            cols = params[0].items.length;
            for (let r = 1; r < rows; r++) {
              if (params[r].items.length !== cols) {
                throw createError(
                  state,
                  "Column dimensions mismatch (" + params[r].items.length + " !== " + cols + ")"
                );
              }
            }
            array = new ArrayNode(params);
          } else {
            if (state.token !== "]") {
              throw createSyntaxError(state, "End of matrix ] expected");
            }
            closeParams(state);
            getToken(state);
            array = row;
          }
        } else {
          closeParams(state);
          getToken(state);
          array = new ArrayNode([]);
        }
        return parseAccessors(state, array);
      }
      return parseObject(state);
    }
    function parseRow(state) {
      const params = [parseAssignment(state)];
      let len = 1;
      while (state.token === ",") {
        getToken(state);
        if (state.token !== "]" && state.token !== ";") {
          params[len] = parseAssignment(state);
          len++;
        }
      }
      return new ArrayNode(params);
    }
    function parseObject(state) {
      if (state.token === "{") {
        openParams(state);
        let key;
        const properties2 = {};
        do {
          getToken(state);
          if (state.token !== "}") {
            if (state.token === '"' || state.token === "'") {
              key = parseStringToken(state, state.token);
            } else if (state.tokenType === 3 /* SYMBOL */ || state.tokenType === 1 /* DELIMITER */ && state.token in NAMED_DELIMITERS) {
              key = state.token;
              getToken(state);
            } else {
              throw createSyntaxError(
                state,
                "Symbol or string expected as object key"
              );
            }
            if (state.token !== ":") {
              throw createSyntaxError(
                state,
                "Colon : expected after object key"
              );
            }
            getToken(state);
            properties2[key] = parseAssignment(state);
          }
        } while (state.token === ",");
        if (state.token !== "}") {
          throw createSyntaxError(
            state,
            "Comma , or bracket } expected after object value"
          );
        }
        closeParams(state);
        getToken(state);
        let node = new ObjectNode(properties2);
        node = parseAccessors(state, node);
        return node;
      }
      return parseNumber(state);
    }
    function parseNumber(state) {
      let numberStr;
      if (state.tokenType === 2 /* NUMBER */) {
        numberStr = state.token;
        getToken(state);
        const numericType = safeNumberType(numberStr, config);
        const value = numeric(numberStr, numericType);
        return new ConstantNode(value);
      }
      return parseParentheses(state);
    }
    function parseParentheses(state) {
      let node;
      if (state.token === "(") {
        openParams(state);
        getToken(state);
        node = parseAssignment(state);
        if (state.token !== ")") {
          throw createSyntaxError(state, "Parenthesis ) expected");
        }
        closeParams(state);
        getToken(state);
        node = new ParenthesisNode(node);
        node = parseAccessors(state, node);
        return node;
      }
      return parseEnd(state);
    }
    function parseEnd(state) {
      if (state.token === "") {
        throw createSyntaxError(state, "Unexpected end of expression");
      } else {
        throw createSyntaxError(state, "Value expected");
      }
    }
    function col(state) {
      return state.index - state.token.length + 1;
    }
    function createSyntaxError(state, message) {
      const c = col(state);
      const error = new SyntaxError(message + " (char " + c + ")");
      error.char = c;
      return error;
    }
    function createError(state, message) {
      const c = col(state);
      const error = new SyntaxError(message + " (char " + c + ")");
      error.char = c;
      return error;
    }
    typed2.addConversion({ from: "string", to: "Node", convert: parse });
    return parse;
  }
);

// src/expression/function/compile.ts
var name44 = "compile";
var dependencies42 = ["typed", "parse"];
var createCompile = /* @__PURE__ */ factory(
  name44,
  dependencies42,
  ({ typed: typed2, parse }) => {
    return typed2(name44, {
      string: function(expr) {
        return parse(expr).compile();
      },
      "Array | Matrix": function(expr) {
        return deepMap2(expr, function(entry) {
          return parse(entry).compile();
        });
      }
    });
  }
);

// src/expression/function/evaluate.ts
var name45 = "evaluate";
var dependencies43 = ["typed", "parse"];
var createEvaluate = /* @__PURE__ */ factory(
  name45,
  dependencies43,
  ({ typed: typed2, parse }) => {
    return typed2(name45, {
      string: function(expr) {
        const scope = createEmptyMap();
        return parse(expr).compile().evaluate(scope);
      },
      "string, Map | Object": function(expr, scope) {
        return parse(expr).compile().evaluate(scope);
      },
      "Array | Matrix": function(expr) {
        const scope = createEmptyMap();
        return deepMap2(expr, function(entry) {
          return parse(entry).compile().evaluate(scope);
        });
      },
      "Array | Matrix, Map | Object": function(expr, scope) {
        return deepMap2(expr, function(entry) {
          return parse(entry).compile().evaluate(scope);
        });
      }
    });
  }
);

// src/expression/Parser.ts
var name46 = "Parser";
var dependencies44 = ["evaluate", "parse"];
var createParserClass = /* @__PURE__ */ factory(
  name46,
  dependencies44,
  ({ evaluate, parse }) => {
    function Parser() {
      if (!(this instanceof Parser)) {
        throw new SyntaxError(
          "Constructor must be called with the new operator"
        );
      }
      Object.defineProperty(this, "scope", {
        value: createEmptyMap(),
        writable: false
      });
    }
    Parser.prototype.type = "Parser";
    Parser.prototype.isParser = true;
    Parser.prototype.evaluate = function(expr) {
      return evaluate(expr, this.scope);
    };
    Parser.prototype.get = function(name114) {
      if (this.scope.has(name114)) {
        return this.scope.get(name114);
      }
    };
    Parser.prototype.getAll = function() {
      return toObject(this.scope);
    };
    Parser.prototype.getAllAsMap = function() {
      return this.scope;
    };
    function isValidVariableName(name114) {
      if (name114.length === 0) {
        return false;
      }
      for (let i = 0; i < name114.length; i++) {
        const cPrev = name114.charAt(i - 1);
        const c = name114.charAt(i);
        const cNext = name114.charAt(i + 1);
        const valid = parse.isAlpha(c, cPrev, cNext) || i > 0 && parse.isDigit(c);
        if (!valid) {
          return false;
        }
      }
      return true;
    }
    Parser.prototype.set = function(name114, value) {
      if (!isValidVariableName(name114)) {
        throw new Error(
          `Invalid variable name: '${name114}'. Variable names must follow the specified rules.`
        );
      }
      this.scope.set(name114, value);
      return value;
    };
    Parser.prototype.remove = function(name114) {
      this.scope.delete(name114);
    };
    Parser.prototype.clear = function() {
      this.scope.clear();
    };
    Parser.prototype.toJSON = function() {
      const json = {
        mathjs: "Parser",
        variables: {},
        functions: {}
      };
      for (const [name114, value] of this.scope) {
        if (isFunction(value)) {
          if (!isExpressionFunction(value)) {
            throw new Error(`Cannot serialize external function ${name114}`);
          }
          json.functions[name114] = `${value.syntax} = ${value.expr}`;
        } else {
          json.variables[name114] = value;
        }
      }
      return json;
    };
    Parser.fromJSON = function(json) {
      const parser = new Parser();
      Object.entries(json.variables || {}).forEach(
        ([name114, value]) => parser.set(name114, value)
      );
      Object.entries(json.functions || {}).forEach(
        ([_name, fn]) => parser.evaluate(fn)
      );
      return parser;
    };
    return Parser;
  },
  { isClass: true }
);
function isExpressionFunction(value) {
  return typeof value === "function" && typeof value.syntax === "string" && typeof value.expr === "string";
}

// src/function/matrix/mapSlices.ts
var name47 = "mapSlices";
var dependencies45 = ["typed", "isInteger"];
var createMapSlices = /* @__PURE__ */ factory(
  name47,
  dependencies45,
  ({
    typed: typed2,
    isInteger: isInteger2
  }) => {
    return typed2(name47, {
      "Array | Matrix, number | BigNumber, function": function(mat, dim, callback) {
        if (!isInteger2(dim)) {
          throw new TypeError("Integer number expected for dimension");
        }
        const dimNum = typeof dim === "number" ? dim : dim.toNumber();
        const size = Array.isArray(mat) ? arraySize(mat) : mat.size();
        if (dimNum < 0 || dimNum >= size.length) {
          throw new IndexError(dimNum, 0, size.length);
        }
        if (isMatrix(mat)) {
          return mat.create(
            _mapSlices(mat.valueOf(), dimNum, callback),
            mat.datatype()
          );
        } else {
          return _mapSlices(mat, dimNum, callback);
        }
      }
    });
  },
  { formerly: "apply" }
);
function _mapSlices(mat, dim, callback) {
  let i, ret, tran;
  if (dim <= 0) {
    if (!Array.isArray(mat[0])) {
      return callback(mat);
    } else {
      tran = _switch2(mat);
      ret = [];
      for (i = 0; i < tran.length; i++) {
        ret[i] = _mapSlices(tran[i], dim - 1, callback);
      }
      return ret;
    }
  } else {
    ret = [];
    for (i = 0; i < mat.length; i++) {
      ret[i] = _mapSlices(mat[i], dim - 1, callback);
    }
    return ret;
  }
}
function _switch2(mat) {
  const I = mat.length;
  const J = mat[0].length;
  let i, j;
  const ret = [];
  for (j = 0; j < J; j++) {
    const tmp = [];
    for (i = 0; i < I; i++) {
      tmp.push(mat[i][j]);
    }
    ret.push(tmp);
  }
  return ret;
}
function optimizeCallback(callback, array, name114, isUnary) {
  if (typedFunction.isTypedFunction(callback)) {
    let numberOfArguments;
    {
      const size = array.isMatrix ? array.size() : arraySize(array);
      const isEmpty = size.length ? size[size.length - 1] === 0 : true;
      if (isEmpty) {
        return { isUnary: false, fn: callback };
      }
      const firstIndex = size.map(() => 0);
      const firstValue = array.isMatrix ? array.get(firstIndex) : get(array, firstIndex);
      numberOfArguments = _findNumberOfArgumentsTyped(
        callback,
        firstValue,
        firstIndex,
        array
      );
    }
    let fastCallback;
    if (array.isMatrix && array.dataType !== "mixed" && array.dataType !== void 0) {
      const singleSignature = _findSingleSignatureWithArity(
        callback,
        numberOfArguments
      );
      fastCallback = singleSignature !== void 0 ? singleSignature : callback;
    } else {
      fastCallback = callback;
    }
    if (numberOfArguments >= 1 && numberOfArguments <= 3) {
      return {
        isUnary: numberOfArguments === 1,
        fn: (...args) => _tryFunctionWithArgs(
          fastCallback,
          args.slice(0, numberOfArguments),
          name114,
          callback.name
        )
      };
    }
    return {
      isUnary: false,
      fn: (...args) => _tryFunctionWithArgs(
        fastCallback,
        args,
        name114,
        callback.name
      )
    };
  }
  {
    return {
      isUnary: _findIfCallbackIsUnary(callback),
      fn: callback
    };
  }
}
function _findSingleSignatureWithArity(callback, arity) {
  const matchingFunctions = [];
  Object.entries(callback.signatures).forEach(([signature, func]) => {
    if (signature.split(",").length === arity) {
      matchingFunctions.push(func);
    }
  });
  if (matchingFunctions.length === 1) {
    return matchingFunctions[0];
  }
  return void 0;
}
function _findIfCallbackIsUnary(callback) {
  if (callback.length !== 1) return false;
  const callbackStr = callback.toString();
  if (/arguments/.test(callbackStr)) return false;
  const paramsStr = callbackStr.match(/\(.*?\)/);
  if (paramsStr && /\.\.\./.test(paramsStr[0])) return false;
  return true;
}
function _findNumberOfArgumentsTyped(callback, value, index, array) {
  const testArgs = [value, index, array];
  for (let i = 3; i > 0; i--) {
    const args = testArgs.slice(0, i);
    if (typedFunction.resolve(callback, args) !== null) {
      return i;
    }
  }
  return void 0;
}
function _tryFunctionWithArgs(func, args, mappingFnName, callbackName) {
  try {
    return func(...args);
  } catch (err) {
    _createCallbackError(err, args, mappingFnName, callbackName);
  }
}
function _createCallbackError(err, args, mappingFnName, callbackName) {
  if (err instanceof TypeError && err.data?.category === "wrongType") {
    const argsDesc = [];
    argsDesc.push(`value: ${typeOf(args[0])}`);
    if (args.length >= 2) {
      argsDesc.push(`index: ${typeOf(args[1])}`);
    }
    if (args.length >= 3) {
      argsDesc.push(`array: ${typeOf(args[2])}`);
    }
    throw new TypeError(
      `Function ${mappingFnName} cannot apply callback arguments ${callbackName}(${argsDesc.join(", ")}) at index ${JSON.stringify(args[1])}`
    );
  } else {
    throw new TypeError(
      `Function ${mappingFnName} cannot apply callback arguments to function ${callbackName}: ${err.message}`
    );
  }
}

// src/function/matrix/filter.ts
var name48 = "filter";
var dependencies46 = ["typed"];
var createFilter = /* @__PURE__ */ factory(
  name48,
  dependencies46,
  ({ typed: typed2 }) => {
    return typed2("filter", {
      "Array, function": _filterCallback,
      "Matrix, function": function(x, test) {
        return x.create(_filterCallback(x.valueOf(), test), x.datatype());
      },
      "Array, RegExp": filterRegExp,
      "Matrix, RegExp": function(x, test) {
        return x.create(filterRegExp(x.valueOf(), test), x.datatype());
      }
    });
  }
);
function _filterCallback(x, callback) {
  const fastCallback = optimizeCallback(callback, x, "filter");
  if (fastCallback.isUnary) {
    return filter(x, fastCallback.fn);
  }
  return filter(x, function(value, index, array) {
    return fastCallback.fn(value, [index], array);
  });
}

// src/function/matrix/forEach.ts
var name49 = "forEach";
var dependencies47 = ["typed"];
var createForEach = /* @__PURE__ */ factory(
  name49,
  dependencies47,
  ({ typed: typed2 }) => {
    return typed2(name49, {
      "Array, function": _forEach,
      "Matrix, function": function(x, callback) {
        x.forEach(callback);
      }
    });
  }
);
function _forEach(array, callback) {
  const fastCallback = optimizeCallback(callback, array, name49);
  deepForEach(array, fastCallback.fn, fastCallback.isUnary);
}

// src/function/matrix/map.ts
var name50 = "map";
var dependencies48 = ["typed"];
var createMap2 = /* @__PURE__ */ factory(
  name50,
  dependencies48,
  ({ typed: typed2 }) => {
    return typed2(name50, {
      "Array, function": _mapArray,
      "Matrix, function": function(x, callback) {
        return x.map(callback);
      },
      "Array|Matrix, Array|Matrix, ...Array|Matrix|function": (A, B, rest) => _mapMultiple(
        [A, B, ...rest.slice(0, rest.length - 1)],
        rest[rest.length - 1]
      )
    });
    function _mapMultiple(Arrays, multiCallback) {
      if (typeof multiCallback !== "function") {
        throw new Error("Last argument must be a callback function");
      }
      const firstArrayIsMatrix = Arrays[0].isMatrix;
      const sizes = Arrays.map(
        (M) => M.isMatrix ? M.size() : arraySize(M)
      );
      const newSize = broadcastSizes(...sizes);
      const numberOfArrays = Arrays.length;
      const _get = firstArrayIsMatrix ? (matrix, idx) => matrix.get(idx) : get;
      const firstValues = Arrays.map((collection, i) => {
        const firstIndex = sizes[i].map(() => 0);
        return collection.isMatrix ? collection.get(firstIndex) : get(collection, firstIndex);
      });
      const callbackArgCount = typed2.isTypedFunction(multiCallback) ? _getTypedCallbackArgCount(
        multiCallback,
        firstValues,
        newSize.map(() => 0),
        Arrays
      ) : _getCallbackArgCount(multiCallback, numberOfArrays);
      if (callbackArgCount < 2) {
        const callback2 = _getLimitedCallback(
          callbackArgCount,
          multiCallback,
          null
        );
        return mapMultiple(Arrays, callback2);
      }
      const broadcastedArrays = firstArrayIsMatrix ? Arrays.map(
        (M) => M.isMatrix ? M.create(broadcastTo(M.toArray(), newSize), M.datatype()) : Arrays[0].create(broadcastTo(M.valueOf(), newSize))
      ) : Arrays.map(
        (M) => M.isMatrix ? broadcastTo(M.toArray(), newSize) : broadcastTo(M, newSize)
      );
      const callback = _getLimitedCallback(
        callbackArgCount,
        multiCallback,
        broadcastedArrays
      );
      const broadcastedArraysCallback = (x, idx) => callback(
        [
          x,
          ...broadcastedArrays.slice(1).map((array) => _get(array, idx))
        ],
        idx
      );
      if (firstArrayIsMatrix) {
        return broadcastedArrays[0].map(broadcastedArraysCallback);
      } else {
        return _mapArray(broadcastedArrays[0], broadcastedArraysCallback);
      }
    }
    function mapMultiple(collections, callback) {
      const firstCollection = collections[0];
      const arrays = collections.map(
        (collection) => collection.isMatrix ? collection.valueOf() : collection
      );
      const sizes = collections.map(
        (collection) => collection.isMatrix ? collection.size() : arraySize(collection)
      );
      const finalSize = broadcastSizes(...sizes);
      const offsets = sizes.map(
        (size) => finalSize.length - size.length
      );
      const maxDepth = finalSize.length - 1;
      const callbackUsesIndex = callback.length > 1;
      const index = callbackUsesIndex ? [] : null;
      const resultsArray = iterate(arrays, 0);
      if (firstCollection.isMatrix) {
        const resultsMatrix = firstCollection.create();
        resultsMatrix._data = resultsArray;
        resultsMatrix._size = finalSize;
        return resultsMatrix;
      } else {
        return resultsArray;
      }
      function iterate(arrays2, depth = 0) {
        const currentDimensionSize = finalSize[depth];
        const result = Array(currentDimensionSize);
        if (depth < maxDepth) {
          for (let i = 0; i < currentDimensionSize; i++) {
            if (index) index[depth] = i;
            result[i] = iterate(
              arrays2.map(
                (array, arrayIndex) => offsets[arrayIndex] > depth ? array : array.length === 1 ? array[0] : array[i]
              ),
              depth + 1
            );
          }
        } else {
          for (let i = 0; i < currentDimensionSize; i++) {
            if (index) index[depth] = i;
            result[i] = callback(
              arrays2.map((a) => a.length === 1 ? a[0] : a[i]),
              index ? index.slice() : void 0
            );
          }
        }
        return result;
      }
    }
    function _getLimitedCallback(callbackArgCount, multiCallback, broadcastedArrays) {
      switch (callbackArgCount) {
        case 0:
          return (x) => multiCallback(...x);
        case 1:
          return (x, idx) => multiCallback(...x, idx);
        case 2:
          return (x, idx) => multiCallback(...x, idx, ...broadcastedArrays);
      }
      throw new Error("Invalid callbackArgCount");
    }
    function _getCallbackArgCount(callback, numberOfArrays) {
      const callbackStr = callback.toString();
      if (/arguments/.test(callbackStr)) return 2;
      const paramsStr = callbackStr.match(/\(.*?\)/);
      if (/\.\.\./.test(paramsStr)) return 2;
      if (callback.length > numberOfArrays + 1) {
        return 2;
      }
      if (callback.length === numberOfArrays + 1) {
        return 1;
      }
      return 0;
    }
    function _getTypedCallbackArgCount(callback, values, idx, arrays) {
      if (typed2.resolve(callback, [...values, idx, ...arrays]) !== null) {
        return 2;
      }
      if (typed2.resolve(callback, [...values, idx]) !== null) {
        return 1;
      }
      if (typed2.resolve(callback, values) !== null) {
        return 0;
      }
      return 0;
    }
    function _mapArray(array, callback) {
      const fastCallback = optimizeCallback(callback, array, name50);
      return deepMap(array, fastCallback.fn, fastCallback.isUnary);
    }
  }
);

// src/function/matrix/range.ts
var name51 = "range";
var dependencies49 = [
  "typed",
  "config",
  "?matrix",
  "?bignumber",
  "equal",
  "smaller",
  "smallerEq",
  "larger",
  "largerEq",
  "add",
  "isZero",
  "isPositive"
];
var createRange = /* @__PURE__ */ factory(
  name51,
  dependencies49,
  ({
    typed: typed2,
    config,
    matrix,
    bignumber,
    smaller,
    smallerEq,
    larger,
    largerEq,
    add,
    isZero,
    isPositive
  }) => {
    return typed2(name51, {
      // TODO: simplify signatures when typed-function supports default values and optional arguments
      string: _strRange,
      "string, boolean": _strRange,
      number: function(oops) {
        throw new TypeError(`Too few arguments to function range(): ${oops}`);
      },
      boolean: function(oops) {
        throw new TypeError(
          `Unexpected type of argument 1 to function range(): ${oops}, number|bigint|BigNumber|Fraction`
        );
      },
      "number, number": function(start, end) {
        return _out(_range(start, end, 1, false));
      },
      "number, number, number": function(start, end, step) {
        return _out(_range(start, end, step, false));
      },
      "number, number, boolean": function(start, end, includeEnd) {
        return _out(_range(start, end, 1, includeEnd));
      },
      "number, number, number, boolean": function(start, end, step, includeEnd) {
        return _out(_range(start, end, step, includeEnd));
      },
      // Handle bigints; if either limit is bigint, range should be too
      "bigint, bigint|number": function(start, end) {
        return _out(_range(start, end, 1n, false));
      },
      "number, bigint": function(start, end) {
        return _out(_range(BigInt(start), end, 1n, false));
      },
      "bigint, bigint|number, bigint|number": function(start, end, step) {
        return _out(_range(start, end, BigInt(step), false));
      },
      "number, bigint, bigint|number": function(start, end, step) {
        return _out(_range(BigInt(start), end, BigInt(step), false));
      },
      "bigint, bigint|number, boolean": function(start, end, includeEnd) {
        return _out(_range(start, end, 1n, includeEnd));
      },
      "number, bigint, boolean": function(start, end, includeEnd) {
        return _out(_range(BigInt(start), end, 1n, includeEnd));
      },
      "bigint, bigint|number, bigint|number, boolean": function(start, end, step, includeEnd) {
        return _out(_range(start, end, BigInt(step), includeEnd));
      },
      "number, bigint, bigint|number, boolean": function(start, end, step, includeEnd) {
        return _out(_range(BigInt(start), end, BigInt(step), includeEnd));
      },
      "BigNumber, BigNumber": function(start, end) {
        const BigNumber = start.constructor;
        return _out(_range(start, end, new BigNumber(1), false));
      },
      "BigNumber, BigNumber, BigNumber": function(start, end, step) {
        return _out(_range(start, end, step, false));
      },
      "BigNumber, BigNumber, boolean": function(start, end, includeEnd) {
        const BigNumber = start.constructor;
        return _out(_range(start, end, new BigNumber(1), includeEnd));
      },
      "BigNumber, BigNumber, BigNumber, boolean": function(start, end, step, includeEnd) {
        return _out(_range(start, end, step, includeEnd));
      },
      "Fraction, Fraction": function(start, end) {
        return _out(_range(start, end, 1, false));
      },
      "Fraction, Fraction, Fraction": function(start, end, step) {
        return _out(_range(start, end, step, false));
      },
      "Fraction, Fraction, boolean": function(start, end, includeEnd) {
        return _out(_range(start, end, 1, includeEnd));
      },
      "Fraction, Fraction, Fraction, boolean": function(start, end, step, includeEnd) {
        return _out(_range(start, end, step, includeEnd));
      },
      "Unit, Unit, Unit": function(start, end, step) {
        return _out(_range(start, end, step, false));
      },
      "Unit, Unit, Unit, boolean": function(start, end, step, includeEnd) {
        return _out(_range(start, end, step, includeEnd));
      }
    });
    function _out(arr) {
      if (config.matrix === "Matrix") {
        return matrix ? matrix(arr) : noMatrix();
      }
      return arr;
    }
    function _strRange(str, includeEnd) {
      const r = _parse(str);
      if (!r) {
        throw new SyntaxError('String "' + str + '" is no valid range');
      }
      if (config.number === "BigNumber") {
        if (bignumber === void 0) {
          noBignumber();
        }
        return _out(
          _range(
            bignumber(r.start),
            bignumber(r.end),
            bignumber(r.step),
            includeEnd
          )
        );
      } else {
        return _out(_range(r.start, r.end, r.step, includeEnd));
      }
    }
    function _range(start, end, step, includeEnd) {
      const array = [];
      if (isZero(step)) throw new Error("Step must be non-zero");
      const ongoing = isPositive(step) ? includeEnd ? smallerEq : smaller : includeEnd ? largerEq : larger;
      let x = start;
      while (ongoing(x, end)) {
        array.push(x);
        x = add(x, step);
      }
      return array;
    }
    function _parse(str) {
      const args = str.split(":");
      const nums = args.map(function(arg) {
        return Number(arg);
      });
      const invalid = nums.some(function(num) {
        return isNaN(num);
      });
      if (invalid) {
        return null;
      }
      switch (nums.length) {
        case 2:
          return {
            start: nums[0],
            end: nums[1],
            step: 1
          };
        case 3:
          return {
            start: nums[0],
            end: nums[2],
            step: nums[1]
          };
        default:
          return null;
      }
    }
  }
);

// src/function/matrix/size.ts
var name52 = "size";
var dependencies50 = ["typed"];
var createSize = /* @__PURE__ */ factory(
  name52,
  dependencies50,
  ({ typed: typed2 }) => {
    return typed2(name52, {
      Matrix: (x) => x.size(),
      Array: arraySize,
      string: (x) => [x.length],
      // scalar
      "number | Complex | BigNumber | Unit | boolean | null": (_x) => []
    });
  }
);

// src/function/matrix/partitionSelect.ts
var name53 = "partitionSelect";
var dependencies51 = ["typed", "isNumeric", "isNaN", "compare"];
var createPartitionSelect = /* @__PURE__ */ factory(
  name53,
  dependencies51,
  ({ typed: typed2, isNumeric, isNaN: mathIsNaN, compare }) => {
    const asc = compare;
    const desc = (a, b) => -compare(a, b);
    return typed2(name53, {
      "Array | Matrix, number": function(x, k) {
        return _partitionSelect(x, k, asc);
      },
      "Array | Matrix, number, string": function(x, k, compare2) {
        if (compare2 === "asc") {
          return _partitionSelect(x, k, asc);
        } else if (compare2 === "desc") {
          return _partitionSelect(x, k, desc);
        } else {
          throw new Error('Compare string must be "asc" or "desc"');
        }
      },
      "Array | Matrix, number, function": _partitionSelect
    });
    function _partitionSelect(x, k, compare2) {
      if (!isInteger(k) || k < 0) {
        throw new Error("k must be a non-negative integer");
      }
      if (isMatrix(x)) {
        const size = x.size();
        if (size.length > 1) {
          throw new Error("Only one dimensional matrices supported");
        }
        return quickSelect(x.valueOf(), k, compare2);
      }
      if (Array.isArray(x)) {
        return quickSelect(x, k, compare2);
      }
    }
    function quickSelect(arr, k, compare2) {
      if (k >= arr.length) {
        throw new Error("k out of bounds");
      }
      for (let i = 0; i < arr.length; i++) {
        if (isNumeric(arr[i]) && mathIsNaN(arr[i])) {
          return arr[i];
        }
      }
      let from = 0;
      let to = arr.length - 1;
      while (from < to) {
        let r = from;
        let w = to;
        const pivot = arr[Math.floor(Math.random() * (to - from + 1)) + from];
        while (r < w) {
          if (compare2(arr[r], pivot) >= 0) {
            const tmp = arr[w];
            arr[w] = arr[r];
            arr[r] = tmp;
            --w;
          } else {
            ++r;
          }
        }
        if (compare2(arr[r], pivot) > 0) {
          --r;
        }
        if (k <= r) {
          to = r;
        } else {
          from = r + 1;
        }
      }
      return arr[k];
    }
  }
);

// src/function/probability/bernoulli.ts
var name54 = "bernoulli";
var dependencies52 = [
  "typed",
  "config",
  "isInteger",
  "number",
  "?BigNumber",
  "?Fraction"
];
var createBernoulli = /* @__PURE__ */ factory(
  name54,
  dependencies52,
  ({
    typed: typed2,
    config,
    number,
    BigNumber,
    Fraction
  }) => {
    const numberCache = [void 0];
    const fractionCache = [void 0];
    let bigCache = [void 0];
    let cachedPrecision = 50;
    return typed2(name54, {
      number: (index) => _bernoulli(
        index,
        (n) => n,
        numberCache,
        (a, b) => a + b,
        (a, b) => a * b,
        (a, b) => a / b
      ),
      "bigint | Fraction": (index) => _bernoulli(
        number(index),
        (n) => new Fraction(n),
        fractionCache,
        (a, b) => a.add(b),
        (a, b) => a.mul(b),
        (a, b) => a.div(b)
      ),
      BigNumber: (index) => {
        if (config.precision !== cachedPrecision) {
          bigCache = [void 0];
          cachedPrecision = config.precision;
        }
        return _bernoulli(
          number(index),
          (n) => new BigNumber(n),
          bigCache,
          (a, b) => a.add(b),
          (a, b) => a.mul(b),
          (a, b) => a.div(b)
        );
      }
    });
  }
);
function _bernoulli(index, promote, A, plus, times, divide) {
  if (index < 0 || !isInteger(index)) {
    throw new RangeError("Bernoulli index must be nonnegative integer");
  }
  if (index === 0) return promote(1);
  if (index === 1) return divide(promote(-1), promote(2));
  if (index % 2 === 1) return promote(0);
  const one = promote(1);
  if (A.length === 1) {
    A.push([
      divide(one, promote(-3)),
      divide(one, promote(-2)),
      divide(one, promote(6))
    ]);
  }
  const half = index / 2;
  const zero = promote(0);
  const two = promote(2);
  while (A.length <= half) {
    const i = A.length;
    const lim = Math.floor((i + 1) / 2);
    let a = zero;
    for (let m = 1; m < lim; ++m) {
      a = plus(a, times(A[m][0], A[i - m][0]));
    }
    a = times(a, two);
    if (i % 2 === 0) a = plus(a, times(A[lim][0], A[lim][0]));
    a = divide(a, promote(-(2 * i + 1)));
    const prefactor = divide(times(A[i - 1][1], promote(-i * (2 * i - 1))), two);
    A.push([a, prefactor, times(prefactor, a)]);
  }
  return A[half][2];
}

// src/function/probability/combinationsWithRep.ts
var name55 = "combinationsWithRep";
var dependencies53 = ["typed"];
var createCombinationsWithRep = /* @__PURE__ */ factory(
  name55,
  dependencies53,
  ({ typed: typed2 }) => {
    return typed2(name55, {
      "number, number": function(n, k) {
        if (!isInteger(n) || n < 0) {
          throw new TypeError(
            "Positive integer value expected in function combinationsWithRep"
          );
        }
        if (!isInteger(k) || k < 0) {
          throw new TypeError(
            "Positive integer value expected in function combinationsWithRep"
          );
        }
        if (n < 1) {
          throw new TypeError("k must be less than or equal to n + k - 1");
        }
        if (k < n - 1) {
          const prodrange2 = product(n, n + k - 1);
          return prodrange2 / product(1, k);
        }
        const prodrange = product(k + 1, n + k - 1);
        return prodrange / product(1, n - 1);
      },
      "BigNumber, BigNumber": function(n, k) {
        const BigNumber = n.constructor;
        let result, i;
        const one = new BigNumber(1);
        const nMinusOne = n.minus(one);
        if (!isPositiveInteger(n) || !isPositiveInteger(k)) {
          throw new TypeError(
            "Positive integer value expected in function combinationsWithRep"
          );
        }
        if (n.lt(one)) {
          throw new TypeError(
            "k must be less than or equal to n + k - 1 in function combinationsWithRep"
          );
        }
        result = one;
        if (k.lt(nMinusOne)) {
          for (i = one; i.lte(nMinusOne); i = i.plus(one)) {
            result = result.times(k.plus(i)).dividedBy(i);
          }
        } else {
          for (i = one; i.lte(k); i = i.plus(one)) {
            result = result.times(nMinusOne.plus(i)).dividedBy(i);
          }
        }
        return result;
      }
    });
  }
);
function isPositiveInteger(n) {
  return n.isInteger() && n.gte(0);
}

// src/function/probability/factorial.ts
var name56 = "factorial";
var dependencies54 = ["typed", "gamma"];
var createFactorial = /* @__PURE__ */ factory(
  name56,
  dependencies54,
  ({ typed: typed2, gamma }) => {
    return typed2(name56, {
      number: function(n) {
        if (n < 0) {
          throw new Error("Value must be non-negative");
        }
        return gamma(n + 1);
      },
      BigNumber: function(n) {
        if (n.isNegative()) {
          throw new Error("Value must be non-negative");
        }
        return gamma(n.plus(1));
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (n) => deepMap2(n, self)
      )
    });
  }
);

// src/function/probability/multinomial.ts
var name57 = "multinomial";
var dependencies55 = [
  "typed",
  "add",
  "divide",
  "multiply",
  "factorial",
  "isInteger",
  "isPositive"
];
var createMultinomial = /* @__PURE__ */ factory(
  name57,
  dependencies55,
  ({
    typed: typed2,
    add,
    divide,
    multiply,
    factorial,
    isInteger: isInteger2,
    isPositive
  }) => {
    return typed2(name57, {
      "Array | Matrix": function(a) {
        let sum = 0;
        let denom = 1;
        deepForEach2(a, function(ai) {
          if (!isInteger2(ai) || !isPositive(ai)) {
            throw new TypeError(
              "Positive integer value expected in function multinomial"
            );
          }
          sum = add(sum, ai);
          denom = multiply(denom, factorial(ai));
        });
        return divide(factorial(sum), denom);
      }
    });
  }
);

// src/function/probability/permutations.ts
var name58 = "permutations";
var dependencies56 = ["typed", "factorial"];
var createPermutations = /* @__PURE__ */ factory(
  name58,
  dependencies56,
  ({ typed: typed2, factorial }) => {
    return typed2(name58, {
      "number | BigNumber": factorial,
      "number, number": function(n, k) {
        if (!isInteger(n) || n < 0) {
          throw new TypeError(
            "Positive integer value expected in function permutations"
          );
        }
        if (!isInteger(k) || k < 0) {
          throw new TypeError(
            "Positive integer value expected in function permutations"
          );
        }
        if (k > n) {
          throw new TypeError(
            "second argument k must be less than or equal to first argument n"
          );
        }
        return product(n - k + 1, n);
      },
      "BigNumber, BigNumber": function(n, k) {
        let result, i;
        if (!isPositiveInteger2(n) || !isPositiveInteger2(k)) {
          throw new TypeError(
            "Positive integer value expected in function permutations"
          );
        }
        if (k.gt(n)) {
          throw new TypeError(
            "second argument k must be less than or equal to first argument n"
          );
        }
        const one = n.mul(0).add(1);
        result = one;
        for (i = n.minus(k).plus(1); i.lte(n); i = i.plus(1)) {
          result = result.times(i);
        }
        return result;
      }
      // TODO: implement support for collection in permutations
    });
  }
);
function isPositiveInteger2(n) {
  return n.isInteger() && n.gte(0);
}
var singletonRandom = /* @__PURE__ */ seedrandom(Date.now());
function createRng(randomSeed) {
  let random;
  function setSeed(seed) {
    random = seed === null ? singletonRandom : seedrandom(String(seed));
  }
  setSeed(randomSeed);
  function rng() {
    return random();
  }
  return rng;
}

// src/function/probability/pickRandom.ts
var name59 = "pickRandom";
var dependencies57 = ["typed", "config", "?on"];
var createPickRandom = /* @__PURE__ */ factory(
  name59,
  dependencies57,
  ({ typed: typed2, config, on }) => {
    let rng = createRng(config.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2(name59, {
      "Array | Matrix": function(possibles) {
        return _pickRandom(possibles, {});
      },
      "Array | Matrix, Object": function(possibles, options) {
        return _pickRandom(possibles, options);
      },
      "Array | Matrix, number": function(possibles, number) {
        return _pickRandom(possibles, { number });
      },
      "Array | Matrix, Array | Matrix": function(possibles, weights) {
        return _pickRandom(possibles, { weights });
      },
      "Array | Matrix, Array | Matrix, number": function(possibles, weights, number) {
        return _pickRandom(possibles, { number, weights });
      },
      "Array | Matrix, number, Array | Matrix": function(possibles, number, weights) {
        return _pickRandom(possibles, { number, weights });
      }
    });
    function _pickRandom(possibles, { number, weights, elementWise = true }) {
      const single = typeof number === "undefined";
      if (single) {
        number = 1;
      }
      const createMatrix2 = isMatrix(possibles) ? possibles.create : isMatrix(weights) ? weights.create : null;
      possibles = possibles.valueOf();
      if (weights) {
        weights = weights.valueOf();
      }
      if (elementWise === true) {
        possibles = flatten(possibles);
        weights = flatten(weights);
      }
      let totalWeights = 0;
      if (typeof weights !== "undefined") {
        if (weights.length !== possibles.length) {
          throw new Error("Weights must have the same length as possibles");
        }
        for (let i = 0, len = weights.length; i < len; i++) {
          if (!isNumber(weights[i]) || weights[i] < 0) {
            throw new Error("Weights must be an array of positive numbers");
          }
          totalWeights += weights[i];
        }
      }
      const length = possibles.length;
      const result = [];
      let pick;
      while (result.length < number) {
        if (typeof weights === "undefined") {
          pick = possibles[Math.floor(rng() * length)];
        } else {
          let randKey = rng() * totalWeights;
          for (let i = 0, len = possibles.length; i < len; i++) {
            randKey -= weights[i];
            if (randKey < 0) {
              pick = possibles[i];
              break;
            }
          }
        }
        result.push(pick);
      }
      return single ? result[0] : createMatrix2 ? createMatrix2(result) : result;
    }
  }
);

// src/function/probability/util/randomMatrix.ts
function randomMatrix(size, random) {
  const data = [];
  size = size.slice(0);
  if (size.length > 1) {
    for (let i = 0, length = size.shift(); i < length; i++) {
      data.push(randomMatrix(size, random));
    }
  } else {
    for (let i = 0, length = size.shift(); i < length; i++) {
      data.push(random());
    }
  }
  return data;
}

// src/function/probability/random.ts
var name60 = "random";
var createRandomNumber = /* @__PURE__ */ factory(
  name60,
  ["typed", "config", "?on"],
  ({ typed: typed2, config, on, matrix: _matrix }) => {
    let rng = createRng(config.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2(name60, {
      "": () => _random(0, 1),
      number: (max) => _random(0, max),
      "number, number": (min, max) => _random(min, max)
    });
    function _random(min, max) {
      return min + rng() * (max - min);
    }
  }
);

// src/function/probability/randomInt.ts
var name61 = "randomInt";
var dependencies58 = ["typed", "config", "log2", "?on"];
var createRandomInt = /* @__PURE__ */ factory(
  name61,
  dependencies58,
  ({
    typed: typed2,
    config,
    log2: log23,
    on
  }) => {
    let rng = createRng(config.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2(name61, {
      "": () => _randomInt(0, 2),
      number: (max) => _randomInt(0, max),
      "number, number": (min, max) => _randomInt(min, max),
      bigint: (max) => _randomBigint(0n, max),
      "bigint, bigint": _randomBigint,
      "Array | Matrix": (size) => _randomIntMatrix(size, 0, 1),
      "Array | Matrix, number": (size, max) => _randomIntMatrix(size, 0, max),
      "Array | Matrix, number, number": (size, min, max) => _randomIntMatrix(size, min, max)
    });
    function _randomIntMatrix(size, min, max) {
      const res = randomMatrix(size.valueOf(), () => _randomInt(min, max));
      return isMatrix(size) ? size.create(res, "number") : res;
    }
    function _randomInt(min, max) {
      return Math.floor(min + rng() * (max - min));
    }
    function _randomBigint(min, max) {
      const simpleCutoff = 2n ** 30n;
      const width = max - min;
      if (width <= simpleCutoff) {
        return min + BigInt(_randomInt(0, Number(width)));
      }
      const bits = log23(width);
      let picked = width;
      while (picked >= width) {
        picked = 0n;
        for (let i = 0; i < bits; ++i) {
          picked = 2n * picked + (rng() < 0.5 ? 0n : 1n);
        }
      }
      return min + picked;
    }
  }
);

// src/function/relational/equalScalar.ts
var name62 = "equalScalar";
var createEqualScalarNumber = factory(
  name62,
  ["typed", "config"],
  ({
    typed: typed2,
    config
  }) => {
    return typed2(name62, {
      "number, number": function(x, y) {
        return nearlyEqual(x, y, config.relTol, config.absTol);
      }
    });
  }
);

// src/function/relational/compare.ts
var name63 = "compare";
var createCompareNumber = /* @__PURE__ */ factory(
  name63,
  ["typed", "config"],
  ({ typed: typed2, config }) => {
    return typed2(name63, {
      "number, number": function(x, y) {
        return nearlyEqual(x, y, config.relTol, config.absTol) ? 0 : x > y ? 1 : -1;
      }
    });
  }
);
var name64 = "compareNatural";
var dependencies59 = ["typed", "compare"];
var createCompareNatural = /* @__PURE__ */ factory(
  name64,
  dependencies59,
  ({ typed: typed2, compare }) => {
    const compareBooleans = compare.signatures["boolean,boolean"];
    return typed2(name64, { "any, any": _compareNatural });
    function _compareNatural(x, y) {
      const typeX = typeOf(x);
      const typeY = typeOf(y);
      let c;
      if ((typeX === "number" || typeX === "BigNumber" || typeX === "Fraction") && (typeY === "number" || typeY === "BigNumber" || typeY === "Fraction")) {
        c = compare(x, y);
        if (c.toString() !== "0") {
          return c > 0 ? 1 : -1;
        } else {
          return naturalSort(typeX, typeY);
        }
      }
      const matTypes = ["Array", "DenseMatrix", "SparseMatrix"];
      if (matTypes.includes(typeX) || matTypes.includes(typeY)) {
        c = compareMatricesAndArrays(_compareNatural, x, y);
        if (c !== 0) {
          return c;
        } else {
          return naturalSort(typeX, typeY);
        }
      }
      if (typeX !== typeY) {
        return naturalSort(typeX, typeY);
      }
      if (typeX === "Complex") {
        return compareComplexNumbers(x, y);
      }
      if (typeX === "Unit") {
        if (x.equalBase(y)) {
          return _compareNatural(x.value, y.value);
        }
        return compareArrays(_compareNatural, x.formatUnits(), y.formatUnits());
      }
      if (typeX === "boolean") {
        return compareBooleans(x, y);
      }
      if (typeX === "string") {
        return naturalSort(x, y);
      }
      if (typeX === "Object") {
        return compareObjects(_compareNatural, x, y);
      }
      if (typeX === "null") {
        return 0;
      }
      if (typeX === "undefined") {
        return 0;
      }
      throw new TypeError('Unsupported type of value "' + typeX + '"');
    }
    function compareMatricesAndArrays(compareNatural, x, y) {
      if (isSparseMatrix(x) && isSparseMatrix(y)) {
        return compareArrays(
          compareNatural,
          x.toJSON().values,
          y.toJSON().values
        );
      }
      if (isSparseMatrix(x)) {
        return compareMatricesAndArrays(compareNatural, x.toArray(), y);
      }
      if (isSparseMatrix(y)) {
        return compareMatricesAndArrays(compareNatural, x, y.toArray());
      }
      if (isDenseMatrix(x)) {
        return compareMatricesAndArrays(
          compareNatural,
          x.toJSON().data,
          y
        );
      }
      if (isDenseMatrix(y)) {
        return compareMatricesAndArrays(
          compareNatural,
          x,
          y.toJSON().data
        );
      }
      if (!Array.isArray(x)) {
        return compareMatricesAndArrays(compareNatural, [x], y);
      }
      if (!Array.isArray(y)) {
        return compareMatricesAndArrays(compareNatural, x, [y]);
      }
      return compareArrays(compareNatural, x, y);
    }
    function compareArrays(compareNatural, x, y) {
      for (let i = 0, ii = Math.min(x.length, y.length); i < ii; i++) {
        const v = compareNatural(x[i], y[i]);
        if (v !== 0) {
          return v;
        }
      }
      if (x.length > y.length) {
        return 1;
      }
      if (x.length < y.length) {
        return -1;
      }
      return 0;
    }
    function compareObjects(compareNatural, x, y) {
      const keysX = Object.keys(x);
      const keysY = Object.keys(y);
      keysX.sort(naturalSort);
      keysY.sort(naturalSort);
      const c = compareArrays(compareNatural, keysX, keysY);
      if (c !== 0) {
        return c;
      }
      for (let i = 0; i < keysX.length; i++) {
        const v = compareNatural(x[keysX[i]], y[keysY[i]]);
        if (v !== 0) {
          return v;
        }
      }
      return 0;
    }
  }
);
function compareComplexNumbers(x, y) {
  if (x.re > y.re) {
    return 1;
  }
  if (x.re < y.re) {
    return -1;
  }
  if (x.im > y.im) {
    return 1;
  }
  if (x.im < y.im) {
    return -1;
  }
  return 0;
}

// src/function/relational/compareText.ts
var name65 = "compareText";
compareText.signature = "any, any";
var createCompareTextNumber = /* @__PURE__ */ factory(
  name65,
  ["typed"],
  ({ typed: typed2 }) => typed2(name65, compareText)
);

// src/function/relational/equal.ts
var name66 = "equal";
var createEqualNumber = factory(
  name66,
  ["typed", "equalScalar"],
  ({ typed: typed2, equalScalar }) => {
    return typed2(name66, {
      "any, any": function(x, y) {
        if (x === null) {
          return y === null;
        }
        if (y === null) {
          return x === null;
        }
        if (x === void 0) {
          return y === void 0;
        }
        if (y === void 0) {
          return x === void 0;
        }
        return equalScalar(x, y);
      }
    });
  }
);

// src/function/relational/equalText.ts
var name67 = "equalText";
var dependencies60 = ["typed", "compareText", "isZero"];
var createEqualText = /* @__PURE__ */ factory(
  name67,
  dependencies60,
  ({ typed: typed2, compareText: compareText2, isZero }) => {
    return typed2(name67, {
      "any, any": function(x, y) {
        return isZero(compareText2(x, y));
      }
    });
  }
);

// src/function/relational/smaller.ts
var name68 = "smaller";
var createSmallerNumber = /* @__PURE__ */ factory(
  name68,
  ["typed", "config"],
  ({ typed: typed2, config }) => {
    return typed2(name68, {
      "number, number": function(x, y) {
        return x < y && !nearlyEqual(x, y, config.relTol, config.absTol);
      }
    });
  }
);

// src/function/relational/smallerEq.ts
var name69 = "smallerEq";
var createSmallerEqNumber = /* @__PURE__ */ factory(
  name69,
  ["typed", "config"],
  ({ typed: typed2, config }) => {
    return typed2(name69, {
      "number, number": function(x, y) {
        return x <= y || nearlyEqual(x, y, config.relTol, config.absTol);
      }
    });
  }
);

// src/function/relational/larger.ts
var name70 = "larger";
var createLargerNumber = /* @__PURE__ */ factory(
  name70,
  ["typed", "config"],
  ({ typed: typed2, config }) => {
    return typed2(name70, {
      "number, number": function(x, y) {
        return x > y && !nearlyEqual(x, y, config.relTol, config.absTol);
      }
    });
  }
);

// src/function/relational/largerEq.ts
var name71 = "largerEq";
var createLargerEqNumber = /* @__PURE__ */ factory(
  name71,
  ["typed", "config"],
  ({ typed: typed2, config }) => {
    return typed2(name71, {
      "number, number": function(x, y) {
        return x >= y || nearlyEqual(x, y, config.relTol, config.absTol);
      }
    });
  }
);

// src/function/relational/deepEqual.ts
var name72 = "deepEqual";
var dependencies61 = ["typed", "equal"];
var createDeepEqual = /* @__PURE__ */ factory(
  name72,
  dependencies61,
  ({ typed: typed2, equal }) => {
    return typed2(name72, {
      "any, any": function(x, y) {
        return _deepEqual(x.valueOf(), y.valueOf());
      }
    });
    function _deepEqual(x, y) {
      if (Array.isArray(x)) {
        if (Array.isArray(y)) {
          const len = x.length;
          if (len !== y.length) {
            return false;
          }
          for (let i = 0; i < len; i++) {
            if (!_deepEqual(x[i], y[i])) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      } else {
        if (Array.isArray(y)) {
          return false;
        } else {
          return equal(x, y);
        }
      }
    }
  }
);

// src/function/relational/unequal.ts
var name73 = "unequal";
var createUnequalNumber = factory(
  name73,
  ["typed", "equalScalar"],
  ({ typed: typed2, equalScalar }) => {
    return typed2(name73, {
      "any, any": function(x, y) {
        if (x === null) {
          return y !== null;
        }
        if (y === null) {
          return x !== null;
        }
        if (x === void 0) {
          return y !== void 0;
        }
        if (y === void 0) {
          return x !== void 0;
        }
        return !equalScalar(x, y);
      }
    });
  }
);

// src/function/special/erf.ts
var name74 = "erf";
var dependencies62 = ["typed"];
var createErf = /* @__PURE__ */ factory(
  name74,
  dependencies62,
  ({ typed: typed2 }) => {
    return typed2("name", {
      number: function(x) {
        const y = Math.abs(x);
        if (y >= MAX_NUM) {
          return sign(x);
        }
        if (y <= THRESH) {
          return sign(x) * erf1(y);
        }
        if (y <= 4) {
          return sign(x) * (1 - erfc2(y));
        }
        return sign(x) * (1 - erfc3(y));
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (n) => deepMap2(n, self)
      )
      // TODO: For complex numbers, use the approximation for the Faddeeva function
      //  from "More Efficient Computation of the Complex Error Function" (AMS)
    });
    function erf1(y) {
      const ysq = y * y;
      let xnum = P[0][4] * ysq;
      let xden = ysq;
      let i;
      for (i = 0; i < 3; i += 1) {
        xnum = (xnum + P[0][i]) * ysq;
        xden = (xden + Q[0][i]) * ysq;
      }
      return y * (xnum + P[0][3]) / (xden + Q[0][3]);
    }
    function erfc2(y) {
      let xnum = P[1][8] * y;
      let xden = y;
      let i;
      for (i = 0; i < 7; i += 1) {
        xnum = (xnum + P[1][i]) * y;
        xden = (xden + Q[1][i]) * y;
      }
      const result = (xnum + P[1][7]) / (xden + Q[1][7]);
      const ysq = parseInt(String(y * 16)) / 16;
      const del = (y - ysq) * (y + ysq);
      return Math.exp(-ysq * ysq) * Math.exp(-del) * result;
    }
    function erfc3(y) {
      let ysq = 1 / (y * y);
      let xnum = P[2][5] * ysq;
      let xden = ysq;
      let i;
      for (i = 0; i < 4; i += 1) {
        xnum = (xnum + P[2][i]) * ysq;
        xden = (xden + Q[2][i]) * ysq;
      }
      let result = ysq * (xnum + P[2][4]) / (xden + Q[2][4]);
      result = (SQRPI - result) / y;
      ysq = parseInt(String(y * 16)) / 16;
      const del = (y - ysq) * (y + ysq);
      return Math.exp(-ysq * ysq) * Math.exp(-del) * result;
    }
  }
);
var THRESH = 0.46875;
var SQRPI = 0.5641895835477563;
var P = [
  [
    3.1611237438705655,
    113.86415415105016,
    377.485237685302,
    3209.3775891384694,
    0.18577770618460315
  ],
  [
    0.5641884969886701,
    8.883149794388377,
    66.11919063714163,
    298.6351381974001,
    881.952221241769,
    1712.0476126340707,
    2051.0783778260716,
    1230.3393547979972,
    21531153547440383e-24
  ],
  [
    0.30532663496123236,
    0.36034489994980445,
    0.12578172611122926,
    0.016083785148742275,
    6587491615298378e-19,
    0.016315387137302097
  ]
];
var Q = [
  [
    23.601290952344122,
    244.02463793444417,
    1282.6165260773723,
    2844.236833439171
  ],
  [
    15.744926110709835,
    117.6939508913125,
    537.1811018620099,
    1621.3895745666903,
    3290.7992357334597,
    4362.619090143247,
    3439.3676741437216,
    1230.3393548037495
  ],
  [
    2.568520192289822,
    1.8729528499234604,
    0.5279051029514285,
    0.06051834131244132,
    0.0023352049762686918
  ]
];
var MAX_NUM = Math.pow(2, 53);

// src/function/special/zeta.ts
var name75 = "zeta";
var dependencies63 = [
  "typed",
  "config",
  "multiply",
  "pow",
  "divide",
  "factorial",
  "equal",
  "smallerEq",
  "isBounded",
  "isNegative",
  "gamma",
  "sin",
  "subtract",
  "add",
  "?Complex",
  "?BigNumber",
  "pi"
];
var createZeta = /* @__PURE__ */ factory(
  name75,
  dependencies63,
  ({
    typed: typed2,
    config,
    multiply,
    pow,
    divide,
    factorial,
    equal,
    smallerEq,
    isBounded,
    isNegative,
    gamma,
    sin,
    subtract,
    add,
    Complex,
    BigNumber,
    pi: pi2
  }) => {
    return typed2(name75, {
      number: (s) => zetaNumeric(
        s,
        (value) => value,
        () => 20
      ),
      BigNumber: (s) => zetaNumeric(
        s,
        (value) => new BigNumber(value),
        () => {
          return Math.abs(Math.log10(config.relTol));
        }
      ),
      Complex: zetaComplex
    });
    function zetaNumeric(s, createValue, determineDigits) {
      if (equal(s, 0)) {
        return createValue(-0.5);
      }
      if (equal(s, 1)) {
        return createValue(NaN);
      }
      if (!isBounded(s)) {
        return isNegative(s) ? createValue(NaN) : createValue(1);
      }
      return zeta(s, createValue, determineDigits, (s2) => s2);
    }
    function zetaComplex(s) {
      if (s.re === 0 && s.im === 0) {
        return new Complex(-0.5);
      }
      if (s.re === 1) {
        return new Complex(NaN, NaN);
      }
      if (s.re === Infinity && s.im === 0) {
        return new Complex(1);
      }
      if (s.im === Infinity || s.re === -Infinity) {
        return new Complex(NaN, NaN);
      }
      return zeta(
        s,
        (value) => value,
        (s2) => Math.round(1.3 * 15 + 0.9 * Math.abs(s2.im)),
        (s2) => s2.re
      );
    }
    function zeta(s, createValue, determineDigits, getRe) {
      const n = determineDigits(s);
      if (getRe(s) > -(n - 1) / 2) {
        return f(s, createValue(n), createValue);
      } else {
        let c = multiply(pow(2, s), pow(createValue(pi2), subtract(s, 1)));
        c = multiply(c, sin(multiply(divide(createValue(pi2), 2), s)));
        c = multiply(c, gamma(subtract(1, s)));
        return multiply(
          c,
          zeta(subtract(1, s), createValue, determineDigits, getRe)
        );
      }
    }
    function d(k, n) {
      let S = k;
      for (let j = k; smallerEq(j, n); j = add(j, 1)) {
        const factor = divide(
          multiply(factorial(add(n, subtract(j, 1))), pow(4, j)),
          multiply(factorial(subtract(n, j)), factorial(multiply(2, j)))
        );
        S = add(S, factor);
      }
      return multiply(n, S);
    }
    function f(s, n, createValue) {
      const c = divide(
        1,
        multiply(d(createValue(0), n), subtract(1, pow(2, subtract(1, s))))
      );
      let S = createValue(0);
      for (let k = createValue(1); smallerEq(k, n); k = add(k, 1)) {
        S = add(S, divide(multiply((-1) ** (k - 1), d(k, n)), pow(k, s)));
      }
      return multiply(c, S);
    }
  }
);

// src/function/statistics/mode.ts
var name76 = "mode";
var dependencies64 = ["typed", "isNaN", "isNumeric"];
var createMode = /* @__PURE__ */ factory(
  name76,
  dependencies64,
  ({ typed: typed2, isNaN: mathIsNaN, isNumeric }) => {
    return typed2(name76, {
      "Array | Matrix": _mode,
      "...": function(args) {
        return _mode(args);
      }
    });
    function _mode(values) {
      values = flatten(values.valueOf());
      const num = values.length;
      if (num === 0) {
        throw new Error("Cannot calculate mode of an empty array");
      }
      const count = {};
      let mode = [];
      let max = 0;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (isNumeric(value) && mathIsNaN(value)) {
          throw new Error(
            "Cannot calculate mode of an array containing NaN values"
          );
        }
        if (!(value in count)) {
          count[value] = 0;
        }
        count[value]++;
        if (count[value] === max) {
          mode.push(value);
        } else if (count[value] > max) {
          max = count[value];
          mode = [value];
        }
      }
      return mode;
    }
  }
);

// src/function/statistics/utils/improveErrorMessage.ts
function improveErrorMessage(err, fnName, value) {
  let details;
  if (String(err).includes("Unexpected type")) {
    details = arguments.length > 2 ? " (type: " + typeOf(value) + ", value: " + JSON.stringify(value) + ")" : " (type: " + err.data.actual + ")";
    return new TypeError(
      "Cannot calculate " + fnName + ", unexpected type of argument" + details
    );
  }
  if (String(err).includes("complex numbers")) {
    details = arguments.length > 2 ? " (type: " + typeOf(value) + ", value: " + JSON.stringify(value) + ")" : "";
    return new TypeError(
      "Cannot calculate " + fnName + ", no ordering relation is defined for complex numbers" + details
    );
  }
  return err;
}

// src/function/statistics/prod.ts
var name77 = "prod";
var dependencies65 = ["typed", "config", "multiplyScalar", "numeric", "parseNumberWithConfig"];
var createProd = /* @__PURE__ */ factory(
  name77,
  dependencies65,
  ({ typed: typed2, config, multiplyScalar, numeric, parseNumberWithConfig }) => {
    return typed2(name77, {
      // prod(string) - single string input
      "string": function(x) {
        return parseNumberWithConfig(x);
      },
      // prod([a, b, c, d, ...])
      "Array | Matrix": _prod,
      // prod([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": function(_array, _dim) {
        throw new Error("prod(A, dim) is not yet supported");
      },
      // prod(a, b, c, d, ...)
      "...": function(args) {
        return _prod(args);
      }
    });
    function _prod(array) {
      let prod;
      deepForEach2(array, function(value) {
        try {
          const converted = typeof value === "string" ? parseNumberWithConfig(value) : value;
          prod = prod === void 0 ? converted : multiplyScalar(prod, converted);
        } catch (err) {
          throw improveErrorMessage(err, "prod", value);
        }
      });
      if (prod === void 0) {
        throw new Error("Cannot calculate prod of an empty array");
      }
      return prod;
    }
  }
);

// src/function/statistics/max.ts
var name78 = "max";
var dependencies66 = ["typed", "config", "numeric", "larger", "isNaN"];
var createMax = /* @__PURE__ */ factory(
  name78,
  dependencies66,
  ({ typed: typed2, config, numeric, larger, isNaN: mathIsNaN }) => {
    return typed2(name78, {
      // max([a, b, c, d, ...])
      "Array | Matrix": _max,
      // max([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": function(array, dim) {
        return reduce(array, dim.valueOf(), _largest);
      },
      // max(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function max");
        }
        return _max(args);
      }
    });
    function _largest(x, y) {
      try {
        return larger(x, y) ? x : y;
      } catch (err) {
        throw improveErrorMessage(err, "max", y);
      }
    }
    function _max(array) {
      let res;
      deepForEach2(array, function(value) {
        try {
          if (mathIsNaN(value)) {
            res = value;
          } else if (res === void 0 || larger(value, res)) {
            res = value;
          }
        } catch (err) {
          throw improveErrorMessage(err, "max", value);
        }
      });
      if (res === void 0) {
        throw new Error("Cannot calculate max of an empty array");
      }
      if (typeof res === "string") {
        res = numeric(res, safeNumberType(res, config));
      }
      return res;
    }
  }
);

// src/function/statistics/min.ts
var name79 = "min";
var dependencies67 = ["typed", "config", "numeric", "smaller", "isNaN"];
var createMin = /* @__PURE__ */ factory(
  name79,
  dependencies67,
  ({ typed: typed2, config, numeric, smaller, isNaN: mathIsNaN }) => {
    return typed2(name79, {
      // min([a, b, c, d, ...])
      "Array | Matrix": _min,
      // min([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": function(array, dim) {
        return reduce(array, dim.valueOf(), _smallest);
      },
      // min(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function min");
        }
        return _min(args);
      }
    });
    function _smallest(x, y) {
      try {
        return smaller(x, y) ? x : y;
      } catch (err) {
        throw improveErrorMessage(err, "min", y);
      }
    }
    function _min(array) {
      let min;
      deepForEach2(array, function(value) {
        try {
          if (mathIsNaN(value)) {
            min = value;
          } else if (min === void 0 || smaller(value, min)) {
            min = value;
          }
        } catch (err) {
          throw improveErrorMessage(err, "min", value);
        }
      });
      if (min === void 0) {
        throw new Error("Cannot calculate min of an empty array");
      }
      if (typeof min === "string") {
        min = numeric(min, safeNumberType(min, config));
      }
      return min;
    }
  }
);

// src/function/statistics/sum.ts
var name80 = "sum";
var dependencies68 = ["typed", "config", "add", "numeric", "parseNumberWithConfig"];
var createSum = /* @__PURE__ */ factory(
  name80,
  dependencies68,
  ({ typed: typed2, config, add, numeric, parseNumberWithConfig }) => {
    return typed2(name80, {
      // sum(string) - single string input
      "string": function(x) {
        return parseNumberWithConfig(x);
      },
      // sum([a, b, c, d, ...])
      "Array | Matrix": _sum,
      // sum([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": _nsumDim,
      // sum(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function sum");
        }
        return _sum(args);
      }
    });
    function _sum(array) {
      let sum;
      deepForEach2(array, function(value) {
        try {
          const converted = typeof value === "string" ? parseNumberWithConfig(value) : value;
          sum = sum === void 0 ? converted : add(sum, converted);
        } catch (err) {
          throw improveErrorMessage(err, "sum", value);
        }
      });
      if (sum === void 0) {
        sum = numeric(0, config.number);
      }
      return sum;
    }
    function _nsumDim(array, dim) {
      try {
        const sum = reduce(array, dim, add);
        return sum;
      } catch (err) {
        throw improveErrorMessage(err, "sum", void 0);
      }
    }
  }
);

// src/function/statistics/cumsum.ts
var name81 = "cumsum";
var dependencies69 = ["typed", "add", "unaryPlus"];
var createCumSum = /* @__PURE__ */ factory(
  name81,
  dependencies69,
  ({ typed: typed2, add, unaryPlus }) => {
    return typed2(name81, {
      // sum([a, b, c, d, ...])
      Array: _cumsum,
      Matrix: function(matrix) {
        return matrix.create(_cumsum(matrix.valueOf(), matrix.datatype()));
      },
      // sum([a, b, c, d, ...], dim)
      "Array, number | BigNumber": _ncumSumDim,
      "Matrix, number | BigNumber": function(matrix, dim) {
        return matrix.create(
          _ncumSumDim(matrix.valueOf(), dim),
          matrix.datatype()
        );
      },
      // cumsum(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError(
            "All values expected to be scalar in function cumsum"
          );
        }
        return _cumsum(args);
      }
    });
    function _cumsum(array, _datatype) {
      try {
        return _cumsummap(array);
      } catch (err) {
        throw improveErrorMessage(err, name81, void 0);
      }
    }
    function _cumsummap(array) {
      if (array.length === 0) {
        return [];
      }
      const sums = [unaryPlus(array[0])];
      for (let i = 1; i < array.length; ++i) {
        sums.push(add(sums[i - 1], array[i]));
      }
      return sums;
    }
    function _ncumSumDim(array, dim) {
      const size = arraySize(array);
      if (dim < 0 || dim >= size.length) {
        throw new IndexError(dim, 0, size.length);
      }
      try {
        return _cumsumDimensional(array, dim);
      } catch (err) {
        throw improveErrorMessage(err, name81, void 0);
      }
    }
    function _cumsumDimensional(mat, dim) {
      let i;
      let ret;
      let tran;
      if (dim <= 0) {
        const initialValue = mat[0][0];
        if (!Array.isArray(initialValue)) {
          return _cumsummap(mat);
        } else {
          tran = _switch(mat);
          ret = [];
          for (i = 0; i < tran.length; i++) {
            ret[i] = _cumsumDimensional(tran[i], dim - 1);
          }
          return ret;
        }
      } else {
        ret = [];
        for (i = 0; i < mat.length; i++) {
          ret[i] = _cumsumDimensional(mat[i], dim - 1);
        }
        return ret;
      }
    }
  }
);

// src/function/statistics/mean.ts
var name82 = "mean";
var dependencies70 = ["typed", "add", "divide"];
var createMean = /* @__PURE__ */ factory(
  name82,
  dependencies70,
  ({ typed: typed2, add, divide }) => {
    return typed2(name82, {
      // mean([a, b, c, d, ...])
      "Array | Matrix": _mean,
      // mean([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": _nmeanDim,
      // mean(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function mean");
        }
        return _mean(args);
      }
    });
    function _nmeanDim(array, dim) {
      try {
        const sum = reduce(array, dim, add);
        const s = Array.isArray(array) ? arraySize(array) : array.size();
        return divide(sum, s[dim]);
      } catch (err) {
        throw improveErrorMessage(err, "mean", void 0);
      }
    }
    function _mean(array) {
      let sum;
      let num = 0;
      deepForEach2(array, function(value) {
        try {
          sum = sum === void 0 ? value : add(sum, value);
          num++;
        } catch (err) {
          throw improveErrorMessage(err, "mean", value);
        }
      });
      if (num === 0) {
        throw new Error("Cannot calculate the mean of an empty array");
      }
      return divide(sum, num);
    }
  }
);

// src/function/statistics/median.ts
var name83 = "median";
var dependencies71 = ["typed", "add", "divide", "compare", "partitionSelect"];
var createMedian = /* @__PURE__ */ factory(
  name83,
  dependencies71,
  ({ typed: typed2, add, divide, compare, partitionSelect }) => {
    function _median(array) {
      try {
        array = flatten(array.valueOf());
        const num = array.length;
        if (num === 0) {
          throw new Error("Cannot calculate median of an empty array");
        }
        if (num % 2 === 0) {
          const mid = num / 2 - 1;
          const right = partitionSelect(array, mid + 1);
          let left = array[mid];
          for (let i = 0; i < mid; ++i) {
            if (compare(array[i], left) > 0) {
              left = array[i];
            }
          }
          return middle2(left, right);
        } else {
          const m = partitionSelect(array, (num - 1) / 2);
          return middle(m);
        }
      } catch (err) {
        throw improveErrorMessage(err, "median", void 0);
      }
    }
    const middle = typed2({
      "number | BigNumber | Complex | Unit": function(value) {
        return value;
      }
    });
    const middle2 = typed2({
      "number | BigNumber | Complex | Unit, number | BigNumber | Complex | Unit": function(left, right) {
        return divide(add(left, right), 2);
      }
    });
    return typed2(name83, {
      // median([a, b, c, d, ...])
      "Array | Matrix": _median,
      // median([a, b, c, d, ...], dim)
      "Array | Matrix, number | BigNumber": function(_array, _dim) {
        throw new Error("median(A, dim) is not yet supported");
      },
      // median(a, b, c, d, ...)
      "...": function(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function median");
        }
        return _median(args);
      }
    });
  }
);

// src/function/statistics/mad.ts
var name84 = "mad";
var dependencies72 = ["typed", "abs", "map", "median", "subtract"];
var createMad = /* @__PURE__ */ factory(
  name84,
  dependencies72,
  ({ typed: typed2, abs, map: map2, median, subtract }) => {
    return typed2(name84, {
      // mad([a, b, c, d, ...])
      "Array | Matrix": _mad,
      // mad(a, b, c, d, ...)
      "...": function(args) {
        return _mad(args);
      }
    });
    function _mad(array) {
      array = flatten(array.valueOf());
      if (array.length === 0) {
        throw new Error(
          "Cannot calculate median absolute deviation (mad) of an empty array"
        );
      }
      try {
        const med = median(array);
        return median(
          map2(array, function(value) {
            return abs(subtract(value, med));
          })
        );
      } catch (err) {
        if (err instanceof TypeError && err.message.includes("median")) {
          throw new TypeError(err.message.replace("median", "mad"));
        } else {
          throw improveErrorMessage(err, "mad", void 0);
        }
      }
    }
  }
);

// src/function/statistics/variance.ts
var DEFAULT_NORMALIZATION = "unbiased";
var name85 = "variance";
var dependencies73 = [
  "typed",
  "add",
  "subtract",
  "multiply",
  "divide",
  "mapSlices",
  "isNaN"
];
var createVariance = /* @__PURE__ */ factory(
  name85,
  dependencies73,
  ({
    typed: typed2,
    add,
    subtract,
    multiply,
    divide,
    mapSlices,
    isNaN: mathIsNaN
  }) => {
    return typed2(name85, {
      // variance([a, b, c, d, ...])
      "Array | Matrix": function(array) {
        return _var(array, DEFAULT_NORMALIZATION);
      },
      // variance([a, b, c, d, ...], normalization)
      "Array | Matrix, string": _var,
      // variance([a, b, c, c, ...], dim)
      "Array | Matrix, number | BigNumber": function(array, dim) {
        return _varDim(array, dim, DEFAULT_NORMALIZATION);
      },
      // variance([a, b, c, c, ...], dim, normalization)
      "Array | Matrix, number | BigNumber, string": _varDim,
      // variance(a, b, c, d, ...)
      "...": function(args) {
        return _var(args, DEFAULT_NORMALIZATION);
      }
    });
    function _var(array, normalization) {
      let sum;
      let num = 0;
      if (array.length === 0) {
        throw new SyntaxError(
          "Function variance requires one or more parameters (0 provided)"
        );
      }
      deepForEach2(array, function(value) {
        try {
          sum = sum === void 0 ? value : add(sum, value);
          num++;
        } catch (err) {
          throw improveErrorMessage(err, "variance", value);
        }
      });
      if (num === 0)
        throw new Error("Cannot calculate variance of an empty array");
      const mean = divide(sum, num);
      sum = void 0;
      deepForEach2(array, function(value) {
        const diff = subtract(value, mean);
        sum = sum === void 0 ? multiply(diff, diff) : add(sum, multiply(diff, diff));
      });
      if (mathIsNaN(sum)) {
        return sum;
      }
      switch (normalization) {
        case "uncorrected":
          return divide(sum, num);
        case "biased":
          return divide(sum, num + 1);
        case "unbiased": {
          const zero = isBigNumber(sum) ? sum.mul(0) : 0;
          return num === 1 ? zero : divide(sum, num - 1);
        }
        default:
          throw new Error(
            'Unknown normalization "' + normalization + '". Choose "unbiased" (default), "uncorrected", or "biased".'
          );
      }
    }
    function _varDim(array, dim, normalization) {
      try {
        if (array.length === 0) {
          throw new SyntaxError(
            "Function variance requires one or more parameters (0 provided)"
          );
        }
        return mapSlices(array, dim, (x) => _var(x, normalization));
      } catch (err) {
        throw improveErrorMessage(err, "variance", void 0);
      }
    }
  }
);

// src/function/statistics/quantileSeq.ts
var name86 = "quantileSeq";
var dependencies74 = [
  "typed",
  "?bignumber",
  "add",
  "subtract",
  "divide",
  "multiply",
  "partitionSelect",
  "compare",
  "isInteger",
  "smaller",
  "smallerEq",
  "larger",
  "mapSlices"
];
var createQuantileSeq = /* @__PURE__ */ factory(
  name86,
  dependencies74,
  ({
    typed: typed2,
    bignumber,
    add,
    subtract,
    divide,
    multiply,
    partitionSelect,
    compare,
    isInteger: isInteger2,
    smaller,
    smallerEq,
    larger,
    mapSlices
  }) => {
    return typed2(name86, {
      "Array | Matrix, number | BigNumber": (data, p) => _quantileSeqProbNumber(data, p, false),
      "Array | Matrix, number | BigNumber, number": (data, prob, dim) => _quantileSeqDim(data, prob, false, dim, _quantileSeqProbNumber),
      "Array | Matrix, number | BigNumber, boolean": _quantileSeqProbNumber,
      "Array | Matrix, number | BigNumber, boolean, number": (data, prob, sorted, dim) => _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbNumber),
      "Array | Matrix, Array | Matrix": (data, p) => _quantileSeqProbCollection(data, p, false),
      "Array | Matrix, Array | Matrix, number": (data, prob, dim) => _quantileSeqDim(data, prob, false, dim, _quantileSeqProbCollection),
      "Array | Matrix, Array | Matrix, boolean": _quantileSeqProbCollection,
      "Array | Matrix, Array | Matrix, boolean, number": (data, prob, sorted, dim) => _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbCollection)
    });
    function _quantileSeqDim(data, prob, sorted, dim, fn) {
      return mapSlices(data, dim, (x) => fn(x, prob, sorted));
    }
    function _quantileSeqProbNumber(data, probOrN, sorted) {
      let probArr;
      const dataArr = data.valueOf();
      if (smaller(probOrN, 0)) {
        throw new Error("N/prob must be non-negative");
      }
      if (smallerEq(probOrN, 1)) {
        return isNumber(probOrN) ? _quantileSeq(dataArr, probOrN, sorted) : bignumber(_quantileSeq(dataArr, probOrN, sorted));
      }
      if (larger(probOrN, 1)) {
        if (!isInteger2(probOrN)) {
          throw new Error("N must be a positive integer");
        }
        if (larger(probOrN, 4294967295)) {
          throw new Error(
            "N must be less than or equal to 2^32-1, as that is the maximum length of an Array"
          );
        }
        const nPlusOne = add(probOrN, 1);
        probArr = [];
        for (let i = 0; smaller(i, probOrN); i++) {
          const prob = divide(i + 1, nPlusOne);
          probArr.push(_quantileSeq(dataArr, prob, sorted));
        }
        return isNumber(probOrN) ? probArr : bignumber(probArr);
      }
    }
    function _quantileSeqProbCollection(data, probOrN, sorted) {
      const dataArr = data.valueOf();
      const probOrNArr = probOrN.valueOf();
      const probArr = [];
      for (let i = 0; i < probOrNArr.length; ++i) {
        probArr.push(_quantileSeq(dataArr, probOrNArr[i], sorted));
      }
      return probArr;
    }
    function _quantileSeq(array, prob, sorted) {
      const flat = flatten(array);
      const len = flat.length;
      if (len === 0) {
        throw new Error("Cannot calculate quantile of an empty sequence");
      }
      const index = isNumber(prob) ? prob * (len - 1) : prob.times(len - 1);
      const integerPart = isNumber(prob) ? Math.floor(index) : index.floor().toNumber();
      const fracPart = isNumber(prob) ? index % 1 : index.minus(integerPart);
      if (isInteger2(index)) {
        return sorted ? flat[index] : partitionSelect(flat, isNumber(prob) ? index : index.valueOf());
      }
      let left;
      let right;
      if (sorted) {
        left = flat[integerPart];
        right = flat[integerPart + 1];
      } else {
        right = partitionSelect(flat, integerPart + 1);
        left = flat[integerPart];
        for (let i = 0; i < integerPart; ++i) {
          if (compare(flat[i], left) > 0) {
            left = flat[i];
          }
        }
      }
      const fracPartConverted = isBigNumber(left) && isNumber(fracPart) ? bignumber(fracPart) : fracPart;
      return add(
        multiply(left, subtract(1, fracPartConverted)),
        multiply(right, fracPartConverted)
      );
    }
  }
);

// src/function/statistics/std.ts
var name87 = "std";
var dependencies75 = ["typed", "map", "sqrt", "variance"];
var createStd = /* @__PURE__ */ factory(
  name87,
  dependencies75,
  ({ typed: typed2, map: map2, sqrt, variance }) => {
    return typed2(name87, {
      // std([a, b, c, d, ...])
      "Array | Matrix": _std,
      // std([a, b, c, d, ...], normalization)
      "Array | Matrix, string": _std,
      // std([a, b, c, c, ...], dim)
      "Array | Matrix, number | BigNumber": _std,
      // std([a, b, c, c, ...], dim, normalization)
      "Array | Matrix, number | BigNumber, string": _std,
      // std(a, b, c, d, ...)
      "...": function(args) {
        return _std(args);
      }
    });
    function _std(array, _normalization) {
      if (array.length === 0) {
        throw new SyntaxError(
          "Function std requires one or more parameters (0 provided)"
        );
      }
      try {
        const v = variance.apply(null, arguments);
        if (isCollection(v)) {
          return map2(v, sqrt);
        } else {
          return sqrt(v);
        }
      } catch (err) {
        if (err instanceof TypeError && err.message.includes(" variance")) {
          throw new TypeError(err.message.replace(" variance", " std"));
        } else {
          throw err;
        }
      }
    }
  }
);

// src/function/statistics/corr.ts
var name88 = "corr";
var dependencies76 = [
  "typed",
  "matrix",
  "mean",
  "sqrt",
  "sum",
  "add",
  "subtract",
  "multiply",
  "pow",
  "divide"
];
var createCorr = /* @__PURE__ */ factory(
  name88,
  dependencies76,
  ({
    typed: typed2,
    matrix,
    sqrt,
    sum,
    add,
    subtract,
    multiply,
    pow,
    divide
  }) => {
    return typed2(name88, {
      "Array, Array": function(A, B) {
        return _corr(A, B);
      },
      "Matrix, Matrix": function(A, B) {
        const res = _corr(A.toArray(), B.toArray());
        return Array.isArray(res) ? matrix(res) : res;
      }
    });
    function _corr(A, B) {
      const correlations = [];
      if (Array.isArray(A[0]) && Array.isArray(B[0])) {
        if (A.length !== B.length) {
          throw new SyntaxError(
            "Dimension mismatch. Array A and B must have the same length."
          );
        }
        for (let i = 0; i < A.length; i++) {
          if (A[i].length !== B[i].length) {
            throw new SyntaxError(
              "Dimension mismatch. Array A and B must have the same number of elements."
            );
          }
          correlations.push(correlation(A[i], B[i]));
        }
        return correlations;
      } else {
        if (A.length !== B.length) {
          throw new SyntaxError(
            "Dimension mismatch. Array A and B must have the same number of elements."
          );
        }
        return correlation(A, B);
      }
    }
    function correlation(A, B) {
      const n = A.length;
      const sumX = sum(A);
      const sumY = sum(B);
      const sumXY = A.reduce(
        (acc, x, index) => add(acc, multiply(x, B[index])),
        0
      );
      const sumXSquare = sum(A.map((x) => pow(x, 2)));
      const sumYSquare = sum(B.map((y) => pow(y, 2)));
      const numerator = subtract(multiply(n, sumXY), multiply(sumX, sumY));
      const denominator = sqrt(
        multiply(
          subtract(multiply(n, sumXSquare), pow(sumX, 2)),
          subtract(multiply(n, sumYSquare), pow(sumY, 2))
        )
      );
      return divide(numerator, denominator);
    }
  }
);

// src/function/string/format.ts
var name89 = "format";
var dependencies77 = ["typed"];
var createFormat = /* @__PURE__ */ factory(
  name89,
  dependencies77,
  ({ typed: typed2 }) => {
    return typed2(name89, {
      any: format3,
      "any, Object | function | number | BigNumber": format3
    });
  }
);

// src/utils/print.ts
var printTemplate = /\$([\w.]+)/g;

// src/function/string/print.ts
var name90 = "print";
var dependencies78 = ["typed"];
var createPrint = /* @__PURE__ */ factory(
  name90,
  dependencies78,
  ({ typed: typed2 }) => {
    return typed2(name90, {
      // note: Matrix will be converted automatically to an Array
      "string, Object | Array": _print,
      "string, Object | Array, number | Object": _print
    });
  }
);
function _print(template, values, options) {
  return template.replace(
    printTemplate,
    function(original, key) {
      const keys = key.split(".");
      let value = values[keys.shift()];
      if (value !== void 0 && value.isMatrix) {
        value = value.toArray();
      }
      while (keys.length && value !== void 0) {
        const k = keys.shift();
        value = k ? value[k] : value + ".";
      }
      if (value !== void 0) {
        if (!isString(value)) {
          return format3(value, options);
        } else {
          return value;
        }
      }
      return original;
    }
  );
}

// src/expression/transform/mapSlices.transform.ts
var name91 = "mapSlices";
var dependencies79 = ["typed", "isInteger"];
var createMapSlicesTransform = /* @__PURE__ */ factory(
  name91,
  dependencies79,
  ({ typed: typed2, isInteger: isInteger2 }) => {
    const mapSlices = createMapSlices({ typed: typed2, isInteger: isInteger2 });
    return typed2("mapSlices", {
      "...any": function(args) {
        const dim = args[1];
        if (isNumber(dim)) {
          args[1] = dim - 1;
        } else if (isBigNumber(dim)) {
          args[1] = dim.minus(1);
        }
        try {
          return mapSlices.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true, ...createMapSlices.meta }
);

// src/expression/transform/utils/compileInlineExpression.ts
function compileInlineExpression(expression, math, scope) {
  const symbol = expression.filter(function(node) {
    return isSymbolNode(node) && !(node.name in math) && !scope.has(node.name);
  })[0];
  if (!symbol) {
    throw new Error(
      'No undefined variable found in inline expression "' + expression + '"'
    );
  }
  const name114 = symbol.name;
  const argsScope = /* @__PURE__ */ new Map();
  const subScope = new PartitionedMap(scope, argsScope, /* @__PURE__ */ new Set([name114]));
  const eq = expression.compile();
  return function inlineExpression(x) {
    argsScope.set(name114, x);
    return eq.evaluate(subScope);
  };
}

// src/expression/transform/utils/transformCallback.ts
var name92 = "transformCallback";
var dependencies80 = ["typed"];
var createTransformCallback = /* @__PURE__ */ factory(
  name92,
  dependencies80,
  ({ typed: typed2 }) => {
    return function(callback, numberOfArrays) {
      if (typed2.isTypedFunction(callback)) {
        return _transformTypedCallbackFunction(callback, numberOfArrays);
      } else {
        return _transformCallbackFunction(
          callback,
          callback.length,
          numberOfArrays
        );
      }
    };
    function _transformTypedCallbackFunction(typedFunction2, numberOfArrays) {
      const signatures = Object.fromEntries(
        Object.entries(typedFunction2.signatures).map(
          ([signature, callbackFunction]) => {
            const numberOfCallbackInputs = signature.split(",").length;
            if (typed2.isTypedFunction(callbackFunction)) {
              return [
                signature,
                _transformTypedCallbackFunction(
                  callbackFunction,
                  numberOfArrays
                )
              ];
            } else {
              return [
                signature,
                _transformCallbackFunction(
                  callbackFunction,
                  numberOfCallbackInputs,
                  numberOfArrays
                )
              ];
            }
          }
        )
      );
      if (typeof typedFunction2.name === "string") {
        return typed2(typedFunction2.name, signatures);
      } else {
        return typed2(signatures);
      }
    }
  }
);
function _transformCallbackFunction(callbackFunction, numberOfCallbackInputs, numberOfArrays) {
  if (numberOfCallbackInputs === numberOfArrays) {
    return callbackFunction;
  } else if (numberOfCallbackInputs === numberOfArrays + 1) {
    return function(...args) {
      const vals = args.slice(0, numberOfArrays);
      const idx = _transformDims(args[numberOfArrays]);
      return callbackFunction(...vals, idx);
    };
  } else if (numberOfCallbackInputs > numberOfArrays + 1) {
    return function(...args) {
      const vals = args.slice(0, numberOfArrays);
      const idx = _transformDims(args[numberOfArrays]);
      const rest = args.slice(numberOfArrays + 1);
      return callbackFunction(...vals, idx, ...rest);
    };
  } else {
    return callbackFunction;
  }
}
function _transformDims(dims) {
  return dims.map((dim) => dim + 1);
}

// src/expression/transform/filter.transform.ts
var name93 = "filter";
var dependencies81 = ["typed"];
var createFilterTransform = /* @__PURE__ */ factory(
  name93,
  dependencies81,
  ({ typed: typed2 }) => {
    function filterTransform(args, math, scope) {
      const filter2 = createFilter({ typed: typed2 });
      const transformCallback = createTransformCallback({ typed: typed2 });
      if (args.length === 0) {
        return filter2();
      }
      let x = args[0];
      if (args.length === 1) {
        return filter2(x);
      }
      const N = args.length - 1;
      let callback = args[N];
      if (x) {
        x = _compileAndEvaluate(x, scope);
      }
      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          callback = _compileAndEvaluate(callback, scope);
        } else {
          callback = compileInlineExpression(callback, math, scope);
        }
      }
      return filter2(x, transformCallback(callback, N));
    }
    filterTransform.rawArgs = true;
    function _compileAndEvaluate(arg, scope) {
      return arg.compile().evaluate(scope);
    }
    return filterTransform;
  },
  { isTransformFunction: true }
);

// src/expression/transform/forEach.transform.ts
var name94 = "forEach";
var dependencies82 = ["typed"];
var createForEachTransform = /* @__PURE__ */ factory(
  name94,
  dependencies82,
  ({ typed: typed2 }) => {
    const forEach2 = createForEach({ typed: typed2 });
    const transformCallback = createTransformCallback({ typed: typed2 });
    function forEachTransform(args, math, scope) {
      if (args.length === 0) {
        return forEach2();
      }
      let x = args[0];
      if (args.length === 1) {
        return forEach2(x);
      }
      const N = args.length - 1;
      let callback = args[N];
      if (x) {
        x = _compileAndEvaluate(x, scope);
      }
      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          callback = _compileAndEvaluate(callback, scope);
        } else {
          callback = compileInlineExpression(callback, math, scope);
        }
      }
      return forEach2(x, transformCallback(callback, N));
    }
    forEachTransform.rawArgs = true;
    function _compileAndEvaluate(arg, scope) {
      return arg.compile().evaluate(scope);
    }
    return forEachTransform;
  },
  { isTransformFunction: true }
);

// src/expression/transform/map.transform.ts
var name95 = "map";
var dependencies83 = ["typed"];
var createMapTransform = /* @__PURE__ */ factory(
  name95,
  dependencies83,
  ({ typed: typed2 }) => {
    const map2 = createMap2({ typed: typed2 });
    const transformCallback = createTransformCallback({ typed: typed2 });
    function mapTransform(args, math, scope) {
      if (args.length === 0) {
        return map2();
      }
      if (args.length === 1) {
        return map2(args[0]);
      }
      const N = args.length - 1;
      let X = args.slice(0, N);
      let callback = args[N];
      X = X.map((arg) => _compileAndEvaluate(arg, scope));
      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          callback = _compileAndEvaluate(callback, scope);
        } else {
          callback = compileInlineExpression(callback, math, scope);
        }
      }
      return map2(...X, transformCallback(callback, N));
      function _compileAndEvaluate(arg, scope2) {
        return arg.compile().evaluate(scope2);
      }
    }
    mapTransform.rawArgs = true;
    return mapTransform;
  },
  { isTransformFunction: true }
);

// src/expression/transform/utils/dimToZeroBase.ts
function dimToZeroBase(dim) {
  if (isNumber(dim)) {
    return dim - 1;
  } else if (isBigNumber(dim)) {
    return dim.minus(1);
  } else {
    return dim;
  }
}
function isNumberOrBigNumber(n) {
  return isNumber(n) || isBigNumber(n);
}

// src/expression/transform/utils/lastDimToZeroBase.ts
function lastDimToZeroBase(args) {
  if (args.length === 2 && isCollection(args[0])) {
    args = args.slice();
    const dim = args[1];
    if (isNumberOrBigNumber(dim)) {
      args[1] = dimToZeroBase(dim);
    }
  }
  return args;
}

// src/expression/transform/max.transform.ts
var name96 = "max";
var dependencies84 = ["typed", "config", "numeric", "larger", "isNaN"];
var createMaxTransform = /* @__PURE__ */ factory(
  name96,
  dependencies84,
  ({ typed: typed2, config, numeric, larger, isNaN: mathIsNaN }) => {
    const max = createMax({ typed: typed2, config, numeric, larger, isNaN: mathIsNaN });
    return typed2("max", {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return max.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/mean.transform.ts
var name97 = "mean";
var dependencies85 = ["typed", "add", "divide"];
var createMeanTransform = /* @__PURE__ */ factory(
  name97,
  dependencies85,
  ({ typed: typed2, add, divide }) => {
    const mean = createMean({ typed: typed2, add, divide });
    return typed2("mean", {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return mean.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/min.transform.ts
var name98 = "min";
var dependencies86 = ["typed", "config", "numeric", "smaller", "isNaN"];
var createMinTransform = /* @__PURE__ */ factory(
  name98,
  dependencies86,
  ({ typed: typed2, config, numeric, smaller, isNaN: mathIsNaN }) => {
    const min = createMin({ typed: typed2, config, numeric, smaller, isNaN: mathIsNaN });
    return typed2("min", {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return min.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/range.transform.ts
var name99 = "range";
var dependencies87 = [
  "typed",
  "config",
  "?matrix",
  "?bignumber",
  "equal",
  "smaller",
  "smallerEq",
  "larger",
  "largerEq",
  "add",
  "isZero",
  "isPositive"
];
var createRangeTransform = /* @__PURE__ */ factory(
  name99,
  dependencies87,
  ({
    typed: typed2,
    config,
    matrix,
    bignumber,
    equal,
    smaller,
    smallerEq,
    larger,
    largerEq,
    add,
    isZero,
    isPositive
  }) => {
    const range = createRange({
      typed: typed2,
      config,
      matrix,
      bignumber,
      equal,
      smaller,
      smallerEq,
      larger,
      largerEq,
      add,
      isZero,
      isPositive
    });
    return typed2("range", {
      "...any": function(args) {
        const lastIndex = args.length - 1;
        const last = args[lastIndex];
        if (typeof last !== "boolean") {
          args.push(true);
        }
        return range.apply(null, args);
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/std.transform.ts
var name100 = "std";
var dependencies88 = ["typed", "map", "sqrt", "variance"];
var createStdTransform = /* @__PURE__ */ factory(
  name100,
  dependencies88,
  ({ typed: typed2, map: map2, sqrt, variance }) => {
    const std = createStd({ typed: typed2, map: map2, sqrt, variance });
    return typed2("std", {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return std.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/sum.transform.ts
var name101 = "sum";
var dependencies89 = ["typed", "config", "add", "numeric"];
var createSumTransform = /* @__PURE__ */ factory(
  name101,
  dependencies89,
  ({ typed: typed2, config, add, numeric }) => {
    const sum = createSum({ typed: typed2, config, add, numeric });
    return typed2(name101, {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return sum.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/cumsum.transform.ts
var name102 = "cumsum";
var dependencies90 = ["typed", "add", "unaryPlus"];
var createCumSumTransform = /* @__PURE__ */ factory(
  name102,
  dependencies90,
  ({ typed: typed2, add, unaryPlus }) => {
    const cumsum = createCumSum({ typed: typed2, add, unaryPlus });
    return typed2(name102, {
      "...any": function(args) {
        if (args.length === 2 && isCollection(args[0])) {
          const dim = args[1];
          if (isNumber(dim)) {
            args[1] = dim - 1;
          } else if (isBigNumber(dim)) {
            args[1] = dim.minus(1);
          }
        }
        try {
          return cumsum.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/expression/transform/variance.transform.ts
var name103 = "variance";
var dependencies91 = [
  "typed",
  "add",
  "subtract",
  "multiply",
  "divide",
  "mapSlices",
  "isNaN"
];
var createVarianceTransform = /* @__PURE__ */ factory(
  name103,
  dependencies91,
  ({
    typed: typed2,
    add,
    subtract,
    multiply,
    divide,
    mapSlices,
    isNaN: mathIsNaN
  }) => {
    const variance = createVariance({
      typed: typed2,
      add,
      subtract,
      multiply,
      divide,
      mapSlices,
      isNaN: mathIsNaN
    });
    return typed2(name103, {
      "...any": function(args) {
        args = lastDimToZeroBase(args);
        try {
          return variance.apply(null, args);
        } catch (err) {
          throw errorTransform(err);
        }
      }
    });
  },
  { isTransformFunction: true }
);

// src/function/utils/clone.ts
var name104 = "clone";
var dependencies92 = ["typed"];
var createClone = /* @__PURE__ */ factory(
  name104,
  dependencies92,
  ({ typed: typed2 }) => {
    return typed2(name104, {
      any: clone
    });
  }
);

// src/function/utils/isNumeric.ts
var name105 = "isNumeric";
var dependencies93 = ["typed"];
var createIsNumeric = /* @__PURE__ */ factory(
  name105,
  dependencies93,
  ({ typed: typed2 }) => {
    return typed2(name105, {
      "number | BigNumber | bigint | Fraction | boolean": () => true,
      "Complex | Unit | string | null | undefined | Node": () => false,
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      )
    });
  }
);

// src/function/utils/hasNumericValue.ts
var name106 = "hasNumericValue";
var dependencies94 = ["typed", "isNumeric"];
var createHasNumericValue = /* @__PURE__ */ factory(
  name106,
  dependencies94,
  ({ typed: typed2, isNumeric }) => {
    return typed2(name106, {
      boolean: () => true,
      string: function(x) {
        return x.trim().length > 0 && !isNaN(Number(x));
      },
      any: function(x) {
        return isNumeric(x);
      }
    });
  }
);

// src/function/utils/isBounded.ts
var name107 = "isBounded";
var dependencies95 = ["typed"];
var createIsBounded = /* @__PURE__ */ factory(
  name107,
  dependencies95,
  ({ typed: typed2 }) => {
    return typed2(name107, {
      number: (n) => Number.isFinite(n),
      "BigNumber | Complex": (x) => x.isFinite(),
      "bigint | Fraction": () => true,
      "null | undefined": () => false,
      Unit: typed2.referToSelf((self) => (x) => self(x.value)),
      "Array | Matrix": typed2.referToSelf((self) => (A) => {
        if (!Array.isArray(A)) A = A.valueOf();
        return A.every((entry) => self(entry));
      })
    });
  }
);

// src/function/utils/isFinite.ts
var name108 = "isFinite";
var dependencies96 = ["typed", "isBounded", "map"];
var createIsFinite = /* @__PURE__ */ factory(
  name108,
  dependencies96,
  ({
    typed: typed2,
    isBounded,
    map: map2
  }) => {
    return typed2(name108, {
      "Array | Matrix": (A) => map2(A, isBounded),
      any: (x) => isBounded(x)
    });
  }
);

// src/function/utils/typeOf.ts
var name109 = "typeOf";
var dependencies97 = ["typed"];
var createTypeOf = /* @__PURE__ */ factory(
  name109,
  dependencies97,
  ({ typed: typed2 }) => {
    return typed2(name109, {
      any: typeOf
    });
  }
);

// src/function/utils/isPrime.ts
var name110 = "isPrime";
var dependencies98 = ["typed"];
var createIsPrime = /* @__PURE__ */ factory(
  name110,
  dependencies98,
  ({ typed: typed2 }) => {
    return typed2(name110, {
      number: function(x) {
        if (x <= 3) {
          return x > 1;
        }
        if (x % 2 === 0 || x % 3 === 0) {
          return false;
        }
        for (let i = 5; i * i <= x; i += 6) {
          if (x % i === 0 || x % (i + 2) === 0) {
            return false;
          }
        }
        return true;
      },
      bigint: function(x) {
        if (x <= 3n) {
          return x > 1n;
        }
        if (x % 2n === 0n || x % 3n === 0n) {
          return false;
        }
        for (let i = 5n; i * i <= x; i += 6n) {
          if (x % i === 0n || x % (i + 2n) === 0n) {
            return false;
          }
        }
        return true;
      },
      BigNumber: function(n) {
        if (n.lte(3)) return n.gt(1);
        if (n.mod(2).eq(0) || n.mod(3).eq(0)) return false;
        if (n.lt(Math.pow(2, 32))) {
          const x = n.toNumber();
          for (let i = 5; i * i <= x; i += 6) {
            if (x % i === 0 || x % (i + 2) === 0) {
              return false;
            }
          }
          return true;
        }
        function modPow(base, exponent, modulus) {
          let accumulator = 1;
          while (!exponent.eq(0)) {
            if (exponent.mod(2).eq(0)) {
              exponent = exponent.div(2);
              base = base.mul(base).mod(modulus);
            } else {
              exponent = exponent.sub(1);
              accumulator = base.mul(accumulator).mod(modulus);
            }
          }
          return accumulator;
        }
        const Decimal3 = n.constructor.clone({
          precision: n.toFixed(0).length * 2
        });
        n = new Decimal3(n);
        let r = 0;
        let d = n.sub(1);
        while (d.mod(2).eq(0)) {
          d = d.div(2);
          r += 1;
        }
        let bases = null;
        if (n.lt("3317044064679887385961981")) {
          bases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41].filter(
            (x) => x < n
          );
        } else {
          const max = Math.min(
            n.toNumber() - 2,
            Math.floor(2 * Math.pow(n.toFixed(0).length * Math.log(10), 2))
          );
          bases = [];
          for (let i = 2; i <= max; i += 1) {
            bases.push(max);
          }
        }
        for (let i = 0; i < bases.length; i += 1) {
          const a = bases[i];
          const adn = modPow(n.sub(n).add(a), d, n);
          if (!adn.eq(1)) {
            for (let i2 = 0, x = adn; !x.eq(n.sub(1)); i2 += 1, x = x.mul(x).mod(n)) {
              if (i2 === r - 1) {
                return false;
              }
            }
          }
        }
        return true;
      },
      "Array | Matrix": typed2.referToSelf(
        (self) => (x) => deepMap2(x, self)
      )
    });
  }
);

// src/function/utils/numeric.ts
var name111 = "numeric";
var dependencies99 = ["number", "?bignumber", "?fraction"];
var createNumeric = /* @__PURE__ */ factory(
  name111,
  dependencies99,
  ({ number, bignumber, fraction }) => {
    const validInputTypes = {
      string: true,
      number: true,
      BigNumber: true,
      Fraction: true
    };
    const validOutputTypes = {
      number: (x) => number(x),
      BigNumber: bignumber ? (x) => bignumber(x) : noBignumber,
      bigint: (x) => BigInt(x),
      Fraction: fraction ? (x) => fraction(x) : noFraction
    };
    return function numeric(value, outputType = "number", check) {
      if (check !== void 0) {
        throw new SyntaxError("numeric() takes one or two arguments");
      }
      const inputType = typeOf(value);
      if (!(inputType in validInputTypes)) {
        throw new TypeError(
          "Cannot convert " + value + ' of type "' + inputType + '"; valid input types are ' + Object.keys(validInputTypes).join(", ")
        );
      }
      if (!(outputType in validOutputTypes)) {
        throw new TypeError(
          "Cannot convert " + value + ' to type "' + outputType + '"; valid output types are ' + Object.keys(validOutputTypes).join(", ")
        );
      }
      if (outputType === inputType) {
        return value;
      } else {
        return validOutputTypes[outputType](value);
      }
    };
  }
);

// src/json/reviver.ts
var name112 = "reviver";
var dependencies100 = ["classes"];
var createReviver = /* @__PURE__ */ factory(
  name112,
  dependencies100,
  ({ classes }) => {
    return function reviver(key, value) {
      const constructor = classes[value && value.mathjs];
      if (constructor && typeof constructor.fromJSON === "function") {
        return constructor.fromJSON(value);
      }
      return value;
    };
  }
);

// src/json/replacer.ts
var name113 = "replacer";
var dependencies101 = [];
var createReplacer = /* @__PURE__ */ factory(
  name113,
  dependencies101,
  () => {
    return function replacer(key, value) {
      if (typeof value === "number" && (!Number.isFinite(value) || isNaN(value))) {
        return {
          mathjs: "number",
          value: String(value)
        };
      }
      if (typeof value === "bigint") {
        return {
          mathjs: "bigint",
          value: String(value)
        };
      }
      return value;
    };
  }
);

// src/factoriesNumber.ts
var createUnaryMinus = /* @__PURE__ */ createNumberFactory(
  "unaryMinus",
  unaryMinusNumber
);
var createUnaryPlus = /* @__PURE__ */ createNumberFactory(
  "unaryPlus",
  unaryPlusNumber
);
var createAbs = /* @__PURE__ */ createNumberFactory("abs", absNumber);
var createAddScalar = /* @__PURE__ */ createNumberFactory(
  "addScalar",
  addNumber
);
var createSubtractScalar = /* @__PURE__ */ createNumberFactory(
  "subtractScalar",
  subtractNumber
);
var createCbrt = /* @__PURE__ */ createNumberFactory(
  "cbrt",
  cbrtNumber
);
var createCube = /* @__PURE__ */ createNumberFactory(
  "cube",
  cubeNumber
);
var createExp = /* @__PURE__ */ createNumberFactory("exp", expNumber);
var createExpm1 = /* @__PURE__ */ createNumberFactory(
  "expm1",
  expm1Number
);
var createGcd = /* @__PURE__ */ createNumberFactory("gcd", gcdNumber);
var createLcm = /* @__PURE__ */ createNumberFactory("lcm", lcmNumber);
var createLog10 = /* @__PURE__ */ createNumberFactory(
  "log10",
  log10Number
);
var createLog2 = /* @__PURE__ */ createNumberFactory(
  "log2",
  log2Number
);
var createMod = /* @__PURE__ */ createNumberFactory("mod", modNumber);
var createMultiplyScalar = /* @__PURE__ */ createNumberFactory(
  "multiplyScalar",
  multiplyNumber
);
var createMultiply = /* @__PURE__ */ createNumberFactory(
  "multiply",
  multiplyNumber
);
var createNthRoot = /* @__PURE__ */ createNumberOptionalSecondArgFactory("nthRoot", nthRootNumber);
var createSign = /* @__PURE__ */ createNumberFactory(
  "sign",
  signNumber
);
var createSqrt = /* @__PURE__ */ createNumberFactory(
  "sqrt",
  sqrtNumber
);
var createSquare = /* @__PURE__ */ createNumberFactory(
  "square",
  squareNumber
);
var createSubtract = /* @__PURE__ */ createNumberFactory(
  "subtract",
  subtractNumber
);
var createXgcd = /* @__PURE__ */ createNumberFactory(
  "xgcd",
  xgcdNumber
);
var createDivideScalar = /* @__PURE__ */ createNumberFactory(
  "divideScalar",
  divideNumber
);
var createPow = /* @__PURE__ */ createNumberFactory("pow", powNumber);
var createRound = /* @__PURE__ */ createNumberOptionalSecondArgFactory("round", roundNumber);
var createLog = /* @__PURE__ */ createNumberOptionalSecondArgFactory("log", logNumber);
var createLog1p = /* @__PURE__ */ createNumberFactory(
  "log1p",
  log1pNumber
);
var createAdd = /* @__PURE__ */ createNumberFactory("add", addNumber);
var createNorm = /* @__PURE__ */ createNumberFactory(
  "norm",
  normNumber
);
var createDivide = /* @__PURE__ */ createNumberFactory(
  "divide",
  divideNumber
);
var createBitAnd = /* @__PURE__ */ createNumberFactory(
  "bitAnd",
  bitAndNumber
);
var createBitNot = /* @__PURE__ */ createNumberFactory(
  "bitNot",
  bitNotNumber
);
var createBitOr = /* @__PURE__ */ createNumberFactory(
  "bitOr",
  bitOrNumber
);
var createBitXor = /* @__PURE__ */ createNumberFactory(
  "bitXor",
  bitXorNumber
);
var createLeftShift = /* @__PURE__ */ createNumberFactory(
  "leftShift",
  leftShiftNumber
);
var createRightArithShift = /* @__PURE__ */ createNumberFactory(
  "rightArithShift",
  rightArithShiftNumber
);
var createRightLogShift = /* @__PURE__ */ createNumberFactory(
  "rightLogShift",
  rightLogShiftNumber
);
var createAnd = /* @__PURE__ */ createNumberFactory("and", andNumber);
var createNot = /* @__PURE__ */ createNumberFactory("not", notNumber);
var createOr = /* @__PURE__ */ createNumberFactory("or", orNumber);
var createXor = /* @__PURE__ */ createNumberFactory("xor", xorNumber);
var createIndex = /* @__PURE__ */ factory("index", [], () => noIndex);
var createMatrix = /* @__PURE__ */ factory(
  "matrix",
  [],
  () => noMatrix
);
var createSubset = /* @__PURE__ */ factory(
  "subset",
  [],
  () => noSubset
);
var createCombinations = createNumberFactory(
  "combinations",
  combinationsNumber
);
var createGamma = createNumberFactory("gamma", gammaNumber);
var createLgamma = createNumberFactory("lgamma", lgammaNumber);
var createAcos = /* @__PURE__ */ createNumberFactory(
  "acos",
  acosNumber
);
var createAcosh = /* @__PURE__ */ createNumberFactory(
  "acosh",
  acoshNumber
);
var createAcot = /* @__PURE__ */ createNumberFactory(
  "acot",
  acotNumber
);
var createAcoth = /* @__PURE__ */ createNumberFactory(
  "acoth",
  acothNumber
);
var createAcsc = /* @__PURE__ */ createNumberFactory(
  "acsc",
  acscNumber
);
var createAcsch = /* @__PURE__ */ createNumberFactory(
  "acsch",
  acschNumber
);
var createAsec = /* @__PURE__ */ createNumberFactory(
  "asec",
  asecNumber
);
var createAsech = /* @__PURE__ */ createNumberFactory(
  "asech",
  asechNumber
);
var createAsin = /* @__PURE__ */ createNumberFactory(
  "asin",
  asinNumber
);
var createAsinh = /* @__PURE__ */ createNumberFactory(
  "asinh",
  asinhNumber
);
var createAtan = /* @__PURE__ */ createNumberFactory(
  "atan",
  atanNumber
);
var createAtan2 = /* @__PURE__ */ createNumberFactory(
  "atan2",
  atan2Number
);
var createAtanh = /* @__PURE__ */ createNumberFactory(
  "atanh",
  atanhNumber
);
var createCos = /* @__PURE__ */ createNumberFactory("cos", cosNumber);
var createCosh = /* @__PURE__ */ createNumberFactory(
  "cosh",
  coshNumber
);
var createCot = /* @__PURE__ */ createNumberFactory("cot", cotNumber);
var createCoth = /* @__PURE__ */ createNumberFactory(
  "coth",
  cothNumber
);
var createCsc = /* @__PURE__ */ createNumberFactory("csc", cscNumber);
var createCsch = /* @__PURE__ */ createNumberFactory(
  "csch",
  cschNumber
);
var createSec = /* @__PURE__ */ createNumberFactory("sec", secNumber);
var createSech = /* @__PURE__ */ createNumberFactory(
  "sech",
  sechNumber
);
var createSin = /* @__PURE__ */ createNumberFactory("sin", sinNumber);
var createSinh = /* @__PURE__ */ createNumberFactory(
  "sinh",
  sinhNumber
);
var createTan = /* @__PURE__ */ createNumberFactory("tan", tanNumber);
var createTanh = /* @__PURE__ */ createNumberFactory(
  "tanh",
  tanhNumber
);
var createSubsetTransform = /* @__PURE__ */ factory(
  "subset",
  [],
  () => noSubset,
  { isTransformFunction: true }
);
var createIsInteger = /* @__PURE__ */ createNumberFactory(
  "isInteger",
  isIntegerNumber
);
var createIsNegative = /* @__PURE__ */ createNumberFactory(
  "isNegative",
  isNegativeNumber
);
var createIsPositive = /* @__PURE__ */ createNumberFactory(
  "isPositive",
  isPositiveNumber
);
var createIsZero = /* @__PURE__ */ createNumberFactory(
  "isZero",
  isZeroNumber
);
var createIsNaN = /* @__PURE__ */ createNumberFactory(
  "isNaN",
  isNaNNumber
);
function createNumberFactory(name114, fn) {
  return factory(name114, ["typed"], ({ typed: typed2 }) => typed2(fn));
}
function createNumberOptionalSecondArgFactory(name114, fn) {
  return factory(
    name114,
    ["typed"],
    ({ typed: typed2 }) => typed2({ number: fn, "number,number": fn })
  );
}

export { createAbs, createAccessorNode, createAcos, createAcosh, createAcot, createAcoth, createAcsc, createAcsch, createAdd, createAddScalar, createAnd, createArrayNode, createAsec, createAsech, createAsin, createAsinh, createAssignmentNode, createAtan, createAtan2, createAtanh, createBellNumbers, createBernoulli, createBigint, createBitAnd, createBitNot, createBitOr, createBitXor, createBlockNode, createBoolean, createCatalan, createCbrt, createCeilNumber as createCeil, createChain, createChainClass, createClone, createCombinations, createCombinationsWithRep, createCompareNumber as createCompare, createCompareNatural, createCompareTextNumber as createCompareText, createCompile, createComposition, createConditionalNode, createConstantNode, createCorr, createCos, createCosh, createCot, createCoth, createCsc, createCsch, createCube, createCumSum, createCumSumTransform, createDeepEqual, createDerivative, createDivide, createDivideScalar, createE, createEqualNumber as createEqual, createEqualScalarNumber as createEqualScalar, createEqualText, createErf, createEvaluate, createExp, createExpm1, createFactorial, createFalse, createFilter, createFilterTransform, createFixNumber as createFix, createFloorNumber as createFloor, createForEach, createForEachTransform, createFormat, createFunctionAssignmentNode, createFunctionNode, createGamma, createGcd, createHasNumericValue, createHelp, createHelpClass, createHypot, createIndex, createIndexNode, createInfinity, createIsBounded, createIsFinite, createIsInteger, createIsNaN, createIsNegative, createIsNumeric, createIsPositive, createIsPrime, createIsZero, createLN10, createLN2, createLOG10E, createLOG2E, createLargerNumber as createLarger, createLargerEqNumber as createLargerEq, createLcm, createLeftShift, createLgamma, createLog, createLog10, createLog1p, createLog2, createMad, createMap2 as createMap, createMapSlices, createMapSlicesTransform, createMapTransform, createMatrix, createMax, createMaxTransform, createMean, createMeanTransform, createMedian, createMin, createMinTransform, createMod, createMode, createMultinomial, createMultiply, createMultiplyScalar, createNaN, createNode, createNorm, createNot, createNthRoot, createNull, createNumber, createNumeric, createObjectNode, createOperatorNode, createOr, createParenthesisNode, createParse, createParser, createParserClass, createPartitionSelect, createPermutations, createPhi, createPi, createPickRandom, createPow, createPrint, createProd, createQuantileSeq, createRandomNumber as createRandom, createRandomInt, createRange, createRangeClass, createRangeNode, createRangeTransform, createRationalize, createRelationalNode, createReplacer, createResolve, createResultSet, createReviver, createRightArithShift, createRightLogShift, createRound, createSQRT1_2, createSQRT2, createSec, createSech, createSign, createSimplify, createSimplifyConstant, createSimplifyCore, createSin, createSinh, createSize, createSmallerNumber as createSmaller, createSmallerEqNumber as createSmallerEq, createSqrt, createSquare, createStd, createStdTransform, createStirlingS2, createString, createSubset, createSubsetTransform, createSubtract, createSubtractScalar, createSum, createSumTransform, createSymbolNode, createTan, createTanh, createTau, createTrue, createTypeOf, createTyped, createUnaryMinus, createUnaryPlus, createUnequalNumber as createUnequal, createUppercaseE, createUppercasePi, createVariance, createVarianceTransform, createVersion, createXgcd, createXor, createZeta };
//# sourceMappingURL=factoriesNumber.js.map
//# sourceMappingURL=factoriesNumber.js.map