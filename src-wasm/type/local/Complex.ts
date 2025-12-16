/**
 * Local Complex number implementation.
 * Replaces the external 'complex.js' library.
 */

export interface ComplexJSON {
  mathjs: 'Complex'
  re: number
  im: number
}

export interface PolarForm {
  r: number
  phi: number
}

export interface ComplexLike {
  re?: number
  im?: number
  r?: number
  phi?: number
  abs?: number
  arg?: number
}

/**
 * Parse a complex number string like "2+3i", "2-3i", "2i", "i", etc.
 */
function parseComplexString(str: string): { re: number; im: number } {
  str = str.replace(/\s/g, '')

  // Handle pure imaginary: "i", "-i", "2i", "-2i"
  if (str === 'i') return { re: 0, im: 1 }
  if (str === '-i') return { re: 0, im: -1 }
  if (str === '+i') return { re: 0, im: 1 }

  // Match patterns like "2+3i", "2-3i", "2", "3i"
  const match = str.match(/^([+-]?[\d.e+-]+)?([+-]?[\d.e+-]*i)?$/i)
  if (!match) {
    throw new Error(`Cannot parse complex number: ${str}`)
  }

  let re = 0
  let im = 0

  if (match[1] && !match[1].endsWith('i')) {
    re = parseFloat(match[1])
  }

  if (match[2]) {
    let imStr = match[2].replace('i', '').replace('I', '')
    if (imStr === '' || imStr === '+') imStr = '1'
    if (imStr === '-') imStr = '-1'
    im = parseFloat(imStr)
  } else if (match[1] && match[1].toLowerCase().endsWith('i')) {
    let imStr = match[1].slice(0, -1)
    if (imStr === '' || imStr === '+') imStr = '1'
    if (imStr === '-') imStr = '-1'
    im = parseFloat(imStr)
    re = 0
  }

  return { re, im }
}

/**
 * Complex number class for complex arithmetic.
 */
export class Complex {
  /** Real part */
  public readonly re: number
  /** Imaginary part */
  public readonly im: number
  /** Type marker */
  public readonly type: string = 'Complex'
  /** Type check flag */
  public readonly isComplex: boolean = true

  /** Static constant: zero */
  static readonly ZERO = new Complex(0, 0)
  /** Static constant: imaginary unit */
  static readonly I = new Complex(0, 1)
  /** Static constant: one */
  static readonly ONE = new Complex(1, 0)
  /** Name for type checking */
  static readonly typeName = 'Complex'

  constructor(re?: number | string | Complex | ComplexLike, im?: number) {
    if (re === undefined || re === null) {
      this.re = 0
      this.im = 0
    } else if (typeof re === 'number') {
      this.re = re
      this.im = im ?? 0
    } else if (typeof re === 'string') {
      const parsed = parseComplexString(re)
      this.re = parsed.re
      this.im = parsed.im
    } else if (re instanceof Complex) {
      this.re = re.re
      this.im = re.im
    } else if (typeof re === 'object') {
      // Handle {re, im} or {r, phi} or {abs, arg}
      if ('r' in re && 'phi' in re) {
        const r = re.r ?? 0
        const phi = re.phi ?? 0
        this.re = r * Math.cos(phi)
        this.im = r * Math.sin(phi)
      } else if ('abs' in re && 'arg' in re) {
        const r = re.abs ?? 0
        const phi = re.arg ?? 0
        this.re = r * Math.cos(phi)
        this.im = r * Math.sin(phi)
      } else {
        this.re = re.re ?? 0
        this.im = re.im ?? 0
      }
    } else {
      this.re = 0
      this.im = 0
    }
  }

  /**
   * Addition
   */
  add(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re + other, this.im)
    }
    return new Complex(this.re + other.re, this.im + other.im)
  }

  /**
   * Subtraction
   */
  sub(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re - other, this.im)
    }
    return new Complex(this.re - other.re, this.im - other.im)
  }

  /**
   * Multiplication
   */
  mul(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re * other, this.im * other)
    }
    // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    )
  }

  /**
   * Division
   */
  div(other: Complex | number): Complex {
    if (typeof other === 'number') {
      if (other === 0) throw new Error('Division by zero')
      return new Complex(this.re / other, this.im / other)
    }
    // (a + bi)/(c + di) = ((ac + bd) + (bc - ad)i) / (c^2 + d^2)
    const denom = other.re * other.re + other.im * other.im
    if (denom === 0) throw new Error('Division by zero')
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    )
  }

  /**
   * Modulo (complex modulo)
   */
  mod(other: Complex | number): Complex {
    const b = typeof other === 'number' ? new Complex(other, 0) : other
    // z mod w = z - w * floor(z/w)
    const quotient = this.div(b)
    const floored = quotient.floor()
    return this.sub(b.mul(floored))
  }

  /**
   * Negation
   */
  neg(): Complex {
    return new Complex(-this.re, -this.im)
  }

  /**
   * Absolute value (magnitude)
   */
  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im)
  }

  /**
   * Argument (phase angle in radians)
   */
  arg(): number {
    return Math.atan2(this.im, this.re)
  }

  /**
   * Complex conjugate
   */
  conjugate(): Complex {
    return new Complex(this.re, -this.im)
  }

  /**
   * Clone
   */
  clone(): Complex {
    return new Complex(this.re, this.im)
  }

  /**
   * Equality check
   */
  equals(other: Complex | number): boolean {
    if (typeof other === 'number') {
      return this.re === other && this.im === 0
    }
    return this.re === other.re && this.im === other.im
  }

  /**
   * Square root
   */
  sqrt(): Complex {
    const r = this.abs()
    const re = Math.sqrt((r + this.re) / 2)
    const im = Math.sqrt((r - this.re) / 2) * (this.im < 0 ? -1 : 1)
    return new Complex(re, im)
  }

  /**
   * Power (complex exponent)
   */
  pow(realExp: number, imagExp: number = 0): Complex {
    if (this.re === 0 && this.im === 0) {
      if (realExp > 0 && imagExp === 0) return Complex.ZERO
      throw new Error('Complex power of zero')
    }

    // z^w = exp(w * ln(z))
    const exp = new Complex(realExp, imagExp)
    const lnz = this.log()
    const product = exp.mul(lnz)
    return product.exp()
  }

  /**
   * Exponential (e^z)
   */
  exp(): Complex {
    // e^(a+bi) = e^a * (cos(b) + i*sin(b))
    const ea = Math.exp(this.re)
    return new Complex(ea * Math.cos(this.im), ea * Math.sin(this.im))
  }

  /**
   * Natural logarithm
   */
  log(): Complex {
    // ln(z) = ln|z| + i*arg(z)
    return new Complex(Math.log(this.abs()), this.arg())
  }

  /**
   * Sine
   */
  sin(): Complex {
    // sin(a+bi) = sin(a)cosh(b) + i*cos(a)sinh(b)
    return new Complex(
      Math.sin(this.re) * Math.cosh(this.im),
      Math.cos(this.re) * Math.sinh(this.im)
    )
  }

  /**
   * Cosine
   */
  cos(): Complex {
    // cos(a+bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
    return new Complex(
      Math.cos(this.re) * Math.cosh(this.im),
      -Math.sin(this.re) * Math.sinh(this.im)
    )
  }

  /**
   * Tangent
   */
  tan(): Complex {
    return this.sin().div(this.cos())
  }

  /**
   * Arc sine
   */
  asin(): Complex {
    // asin(z) = -i * ln(iz + sqrt(1 - z^2))
    const iz = new Complex(-this.im, this.re) // i*z
    const one = new Complex(1, 0)
    const z2 = this.mul(this)
    const sqrt = one.sub(z2).sqrt()
    const arg = iz.add(sqrt)
    const ln = arg.log()
    return new Complex(ln.im, -ln.re) // -i * ln
  }

  /**
   * Arc cosine
   */
  acos(): Complex {
    // acos(z) = -i * ln(z + i*sqrt(1 - z^2))
    const one = new Complex(1, 0)
    const z2 = this.mul(this)
    const sqrt = one.sub(z2).sqrt()
    const isqrt = new Complex(-sqrt.im, sqrt.re) // i*sqrt
    const arg = this.add(isqrt)
    const ln = arg.log()
    return new Complex(ln.im, -ln.re) // -i * ln
  }

  /**
   * Arc tangent
   */
  atan(): Complex {
    // atan(z) = i/2 * ln((i+z)/(i-z))
    const i = Complex.I
    const num = i.add(this)
    const den = i.sub(this)
    const ln = num.div(den).log()
    return new Complex(-ln.im / 2, ln.re / 2) // i/2 * ln = (-im/2, re/2)
  }

  /**
   * Secant
   */
  sec(): Complex {
    return new Complex(1, 0).div(this.cos())
  }

  /**
   * Cosecant
   */
  csc(): Complex {
    return new Complex(1, 0).div(this.sin())
  }

  /**
   * Cotangent
   */
  cot(): Complex {
    return this.cos().div(this.sin())
  }

  /**
   * Arc secant
   */
  asec(): Complex {
    // asec(z) = acos(1/z)
    return new Complex(1, 0).div(this).acos()
  }

  /**
   * Arc cosecant
   */
  acsc(): Complex {
    // acsc(z) = asin(1/z)
    return new Complex(1, 0).div(this).asin()
  }

  /**
   * Arc cotangent
   */
  acot(): Complex {
    // acot(z) = atan(1/z)
    return new Complex(1, 0).div(this).atan()
  }

  /**
   * Hyperbolic sine
   */
  sinh(): Complex {
    // sinh(a+bi) = sinh(a)cos(b) + i*cosh(a)sin(b)
    return new Complex(
      Math.sinh(this.re) * Math.cos(this.im),
      Math.cosh(this.re) * Math.sin(this.im)
    )
  }

  /**
   * Hyperbolic cosine
   */
  cosh(): Complex {
    // cosh(a+bi) = cosh(a)cos(b) + i*sinh(a)sin(b)
    return new Complex(
      Math.cosh(this.re) * Math.cos(this.im),
      Math.sinh(this.re) * Math.sin(this.im)
    )
  }

  /**
   * Hyperbolic tangent
   */
  tanh(): Complex {
    return this.sinh().div(this.cosh())
  }

  /**
   * Inverse hyperbolic sine
   */
  asinh(): Complex {
    // asinh(z) = ln(z + sqrt(z^2 + 1))
    const z2 = this.mul(this)
    const one = new Complex(1, 0)
    const sqrt = z2.add(one).sqrt()
    return this.add(sqrt).log()
  }

  /**
   * Inverse hyperbolic cosine
   */
  acosh(): Complex {
    // acosh(z) = ln(z + sqrt(z^2 - 1))
    const z2 = this.mul(this)
    const one = new Complex(1, 0)
    const sqrt = z2.sub(one).sqrt()
    return this.add(sqrt).log()
  }

  /**
   * Inverse hyperbolic tangent
   */
  atanh(): Complex {
    // atanh(z) = 1/2 * ln((1+z)/(1-z))
    const one = new Complex(1, 0)
    const num = one.add(this)
    const den = one.sub(this)
    const ln = num.div(den).log()
    return new Complex(ln.re / 2, ln.im / 2)
  }

  /**
   * Hyperbolic secant
   */
  sech(): Complex {
    return new Complex(1, 0).div(this.cosh())
  }

  /**
   * Hyperbolic cosecant
   */
  csch(): Complex {
    return new Complex(1, 0).div(this.sinh())
  }

  /**
   * Hyperbolic cotangent
   */
  coth(): Complex {
    return this.cosh().div(this.sinh())
  }

  /**
   * Inverse hyperbolic secant
   */
  asech(): Complex {
    return new Complex(1, 0).div(this).acosh()
  }

  /**
   * Inverse hyperbolic cosecant
   */
  acsch(): Complex {
    return new Complex(1, 0).div(this).asinh()
  }

  /**
   * Inverse hyperbolic cotangent
   */
  acoth(): Complex {
    return new Complex(1, 0).div(this).atanh()
  }

  /**
   * Floor (applies to both real and imaginary parts)
   */
  floor(): Complex {
    return new Complex(Math.floor(this.re), Math.floor(this.im))
  }

  /**
   * Ceiling (applies to both real and imaginary parts)
   */
  ceil(): Complex {
    return new Complex(Math.ceil(this.re), Math.ceil(this.im))
  }

  /**
   * Round (applies to both real and imaginary parts)
   */
  round(digits?: number): Complex {
    if (digits === undefined) {
      return new Complex(Math.round(this.re), Math.round(this.im))
    }
    const factor = Math.pow(10, digits)
    return new Complex(
      Math.round(this.re * factor) / factor,
      Math.round(this.im * factor) / factor
    )
  }

  /**
   * Convert to string
   */
  toString(): string {
    if (this.im === 0) return String(this.re)
    if (this.re === 0) {
      if (this.im === 1) return 'i'
      if (this.im === -1) return '-i'
      return `${this.im}i`
    }
    const sign = this.im < 0 ? '' : '+'
    const imPart = this.im === 1 ? 'i' : this.im === -1 ? '-i' : `${this.im}i`
    return `${this.re}${sign}${imPart}`
  }

  /**
   * Value of (for type coercion)
   */
  valueOf(): string {
    return this.toString()
  }

  /**
   * Format with options
   */
  format(options?: { notation?: string; precision?: number } | number): string {
    const precision = typeof options === 'number' ? options : options?.precision

    if (precision !== undefined) {
      const re = Number(this.re.toPrecision(precision))
      const im = Number(this.im.toPrecision(precision))
      return new Complex(re, im).toString()
    }
    return this.toString()
  }

  /**
   * Convert to JSON
   */
  toJSON(): ComplexJSON {
    return {
      mathjs: 'Complex',
      re: this.re,
      im: this.im
    }
  }

  /**
   * Convert to polar coordinates
   */
  toPolar(): PolarForm {
    return {
      r: this.abs(),
      phi: this.arg()
    }
  }

  /**
   * Create from polar coordinates
   */
  static fromPolar(r: number | PolarForm, phi?: number): Complex {
    if (typeof r === 'object') {
      return new Complex({
        r: r.r,
        phi: r.phi
      })
    }
    return new Complex({
      r: r,
      phi: phi ?? 0
    })
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: ComplexJSON): Complex {
    return new Complex(json.re, json.im)
  }

  /**
   * Compare two complex numbers (lexicographic)
   */
  static compare(a: Complex, b: Complex): number {
    if (a.re < b.re) return -1
    if (a.re > b.re) return 1
    if (a.im < b.im) return -1
    if (a.im > b.im) return 1
    return 0
  }
}

export default Complex
