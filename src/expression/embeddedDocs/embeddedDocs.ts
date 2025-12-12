import { eDocs } from './constants/e.ts'
import { falseDocs } from './constants/false.ts'
import { iDocs } from './constants/i.ts'
import { InfinityDocs } from './constants/Infinity.ts'
import { LN10Docs } from './constants/LN10.ts'
import { LN2Docs } from './constants/LN2.ts'
import { LOG10EDocs } from './constants/LOG10E.ts'
import { LOG2EDocs } from './constants/LOG2E.ts'
import { NaNDocs } from './constants/NaN.ts'
import { nullDocs } from './constants/null.ts'
import { phiDocs } from './constants/phi.ts'
import { piDocs } from './constants/pi.ts'
import { SQRT12Docs } from './constants/SQRT1_2.ts'
import { SQRT2Docs } from './constants/SQRT2.ts'
import { tauDocs } from './constants/tau.ts'
import { trueDocs } from './constants/true.ts'
import { versionDocs } from './constants/version.ts'
import { bignumberDocs } from './construction/bignumber.ts'
import { bigintDocs } from './construction/bigint.ts'
import { booleanDocs } from './construction/boolean.ts'
import { complexDocs } from './construction/complex.ts'
import { createUnitDocs } from './construction/createUnit.ts'
import { fractionDocs } from './construction/fraction.ts'
import { indexDocs } from './construction/index.ts'
import { matrixDocs } from './construction/matrix.ts'
import { numberDocs } from './construction/number.ts'
import { sparseDocs } from './construction/sparse.ts'
import { splitUnitDocs } from './construction/splitUnit.ts'
import { stringDocs } from './construction/string.ts'
import { unitDocs } from './construction/unit.ts'
import { configDocs } from './core/config.ts'
import { importDocs } from './core/import.ts'
import { typedDocs } from './core/typed.ts'
import { derivativeDocs } from './function/algebra/derivative.ts'
import { leafCountDocs } from './function/algebra/leafCount.ts'
import { lsolveDocs } from './function/algebra/lsolve.ts'
import { lsolveAllDocs } from './function/algebra/lsolveAll.ts'
import { lupDocs } from './function/algebra/lup.ts'
import { lusolveDocs } from './function/algebra/lusolve.ts'
import { polynomialRootDocs } from './function/algebra/polynomialRoot.ts'
import { qrDocs } from './function/algebra/qr.ts'
import { rationalizeDocs } from './function/algebra/rationalize.ts'
import { resolveDocs } from './function/algebra/resolve.ts'
import { simplifyDocs } from './function/algebra/simplify.ts'
import { simplifyConstantDocs } from './function/algebra/simplifyConstant.ts'
import { simplifyCoreDocs } from './function/algebra/simplifyCore.ts'
import { sluDocs } from './function/algebra/slu.ts'
import { symbolicEqualDocs } from './function/algebra/symbolicEqual.ts'
import { usolveDocs } from './function/algebra/usolve.ts'
import { usolveAllDocs } from './function/algebra/usolveAll.ts'
import { absDocs } from './function/arithmetic/abs.ts'
import { addDocs } from './function/arithmetic/add.ts'
import { cbrtDocs } from './function/arithmetic/cbrt.ts'
import { ceilDocs } from './function/arithmetic/ceil.ts'
import { cubeDocs } from './function/arithmetic/cube.ts'
import { divideDocs } from './function/arithmetic/divide.ts'
import { dotDivideDocs } from './function/arithmetic/dotDivide.ts'
import { dotMultiplyDocs } from './function/arithmetic/dotMultiply.ts'
import { dotPowDocs } from './function/arithmetic/dotPow.ts'
import { expDocs } from './function/arithmetic/exp.ts'
import { expmDocs } from './function/arithmetic/expm.ts'
import { expm1Docs } from './function/arithmetic/expm1.ts'
import { fixDocs } from './function/arithmetic/fix.ts'
import { floorDocs } from './function/arithmetic/floor.ts'
import { gcdDocs } from './function/arithmetic/gcd.ts'
import { hypotDocs } from './function/arithmetic/hypot.ts'
import { invmodDocs } from './function/arithmetic/invmod.ts'
import { lcmDocs } from './function/arithmetic/lcm.ts'
import { logDocs } from './function/arithmetic/log.ts'
import { log10Docs } from './function/arithmetic/log10.ts'
import { log1pDocs } from './function/arithmetic/log1p.ts'
import { log2Docs } from './function/arithmetic/log2.ts'
import { modDocs } from './function/arithmetic/mod.ts'
import { multiplyDocs } from './function/arithmetic/multiply.ts'
import { normDocs } from './function/arithmetic/norm.ts'
import { nthRootDocs } from './function/arithmetic/nthRoot.ts'
import { nthRootsDocs } from './function/arithmetic/nthRoots.ts'
import { powDocs } from './function/arithmetic/pow.ts'
import { roundDocs } from './function/arithmetic/round.ts'
import { signDocs } from './function/arithmetic/sign.ts'
import { sqrtDocs } from './function/arithmetic/sqrt.ts'
import { sqrtmDocs } from './function/arithmetic/sqrtm.ts'
import { sylvesterDocs } from './function/algebra/sylvester.ts'
import { schurDocs } from './function/algebra/schur.ts'
import { lyapDocs } from './function/algebra/lyap.ts'
import { squareDocs } from './function/arithmetic/square.ts'
import { subtractDocs } from './function/arithmetic/subtract.ts'
import { unaryMinusDocs } from './function/arithmetic/unaryMinus.ts'
import { unaryPlusDocs } from './function/arithmetic/unaryPlus.ts'
import { xgcdDocs } from './function/arithmetic/xgcd.ts'
import { bitAndDocs } from './function/bitwise/bitAnd.ts'
import { bitNotDocs } from './function/bitwise/bitNot.ts'
import { bitOrDocs } from './function/bitwise/bitOr.ts'
import { bitXorDocs } from './function/bitwise/bitXor.ts'
import { leftShiftDocs } from './function/bitwise/leftShift.ts'
import { rightArithShiftDocs } from './function/bitwise/rightArithShift.ts'
import { rightLogShiftDocs } from './function/bitwise/rightLogShift.ts'
import { bellNumbersDocs } from './function/combinatorics/bellNumbers.ts'
import { catalanDocs } from './function/combinatorics/catalan.ts'
import { compositionDocs } from './function/combinatorics/composition.ts'
import { stirlingS2Docs } from './function/combinatorics/stirlingS2.ts'
import { argDocs } from './function/complex/arg.ts'
import { conjDocs } from './function/complex/conj.ts'
import { imDocs } from './function/complex/im.ts'
import { reDocs } from './function/complex/re.ts'
import { evaluateDocs } from './function/expression/evaluate.ts'
import { parserDocs } from './function/expression/parser.ts'
import { parseDocs } from './function/expression/parse.ts'
import { compileDocs } from './function/expression/compile.ts'
import { helpDocs } from './function/expression/help.ts'
import { distanceDocs } from './function/geometry/distance.ts'
import { intersectDocs } from './function/geometry/intersect.ts'
import { andDocs } from './function/logical/and.ts'
import { notDocs } from './function/logical/not.ts'
import { nullishDocs } from './function/logical/nullish.ts'
import { orDocs } from './function/logical/or.ts'
import { xorDocs } from './function/logical/xor.ts'
import { mapSlicesDocs } from './function/matrix/mapSlices.ts'
import { columnDocs } from './function/matrix/column.ts'
import { concatDocs } from './function/matrix/concat.ts'
import { countDocs } from './function/matrix/count.ts'
import { crossDocs } from './function/matrix/cross.ts'
import { ctransposeDocs } from './function/matrix/ctranspose.ts'
import { detDocs } from './function/matrix/det.ts'
import { diagDocs } from './function/matrix/diag.ts'
import { diffDocs } from './function/matrix/diff.ts'
import { dotDocs } from './function/matrix/dot.ts'
import { eigsDocs } from './function/matrix/eigs.ts'
import { filterDocs } from './function/matrix/filter.ts'
import { flattenDocs } from './function/matrix/flatten.ts'
import { forEachDocs } from './function/matrix/forEach.ts'
import { getMatrixDataTypeDocs } from './function/matrix/getMatrixDataType.ts'
import { identityDocs } from './function/matrix/identity.ts'
import { invDocs } from './function/matrix/inv.ts'
import { pinvDocs } from './function/matrix/pinv.ts'
import { kronDocs } from './function/matrix/kron.ts'
import { mapDocs } from './function/matrix/map.ts'
import { matrixFromColumnsDocs } from './function/matrix/matrixFromColumns.ts'
import { matrixFromFunctionDocs } from './function/matrix/matrixFromFunction.ts'
import { matrixFromRowsDocs } from './function/matrix/matrixFromRows.ts'
import { onesDocs } from './function/matrix/ones.ts'
import { partitionSelectDocs } from './function/matrix/partitionSelect.ts'
import { rangeDocs } from './function/matrix/range.ts'
import { reshapeDocs } from './function/matrix/reshape.ts'
import { resizeDocs } from './function/matrix/resize.ts'
import { rotateDocs } from './function/matrix/rotate.ts'
import { rotationMatrixDocs } from './function/matrix/rotationMatrix.ts'
import { rowDocs } from './function/matrix/row.ts'
import { sizeDocs } from './function/matrix/size.ts'
import { sortDocs } from './function/matrix/sort.ts'
import { squeezeDocs } from './function/matrix/squeeze.ts'
import { subsetDocs } from './function/matrix/subset.ts'
import { traceDocs } from './function/matrix/trace.ts'
import { transposeDocs } from './function/matrix/transpose.ts'
import { zerosDocs } from './function/matrix/zeros.ts'
import { fftDocs } from './function/matrix/fft.ts'
import { ifftDocs } from './function/matrix/ifft.ts'
import { bernoulliDocs } from './function/probability/bernoulli.ts'
import { combinationsDocs } from './function/probability/combinations.ts'
import { combinationsWithRepDocs } from './function/probability/combinationsWithRep.ts'
import { factorialDocs } from './function/probability/factorial.ts'
import { gammaDocs } from './function/probability/gamma.ts'
import { lgammaDocs } from './function/probability/lgamma.ts'
import { kldivergenceDocs } from './function/probability/kldivergence.ts'
import { multinomialDocs } from './function/probability/multinomial.ts'
import { permutationsDocs } from './function/probability/permutations.ts'
import { pickRandomDocs } from './function/probability/pickRandom.ts'
import { randomDocs } from './function/probability/random.ts'
import { randomIntDocs } from './function/probability/randomInt.ts'
import { compareDocs } from './function/relational/compare.ts'
import { compareNaturalDocs } from './function/relational/compareNatural.ts'
import { compareTextDocs } from './function/relational/compareText.ts'
import { deepEqualDocs } from './function/relational/deepEqual.ts'
import { equalDocs } from './function/relational/equal.ts'
import { equalTextDocs } from './function/relational/equalText.ts'
import { largerDocs } from './function/relational/larger.ts'
import { largerEqDocs } from './function/relational/largerEq.ts'
import { smallerDocs } from './function/relational/smaller.ts'
import { smallerEqDocs } from './function/relational/smallerEq.ts'
import { unequalDocs } from './function/relational/unequal.ts'
import { setCartesianDocs } from './function/set/setCartesian.ts'
import { setDifferenceDocs } from './function/set/setDifference.ts'
import { setDistinctDocs } from './function/set/setDistinct.ts'
import { setIntersectDocs } from './function/set/setIntersect.ts'
import { setIsSubsetDocs } from './function/set/setIsSubset.ts'
import { setMultiplicityDocs } from './function/set/setMultiplicity.ts'
import { setPowersetDocs } from './function/set/setPowerset.ts'
import { setSizeDocs } from './function/set/setSize.ts'
import { setSymDifferenceDocs } from './function/set/setSymDifference.ts'
import { setUnionDocs } from './function/set/setUnion.ts'
import { zpk2tfDocs } from './function/signal/zpk2tf.ts'
import { freqzDocs } from './function/signal/freqz.ts'
import { erfDocs } from './function/special/erf.ts'
import { zetaDocs } from './function/special/zeta.ts'
import { madDocs } from './function/statistics/mad.ts'
import { maxDocs } from './function/statistics/max.ts'
import { meanDocs } from './function/statistics/mean.ts'
import { medianDocs } from './function/statistics/median.ts'
import { minDocs } from './function/statistics/min.ts'
import { modeDocs } from './function/statistics/mode.ts'
import { prodDocs } from './function/statistics/prod.ts'
import { quantileSeqDocs } from './function/statistics/quantileSeq.ts'
import { stdDocs } from './function/statistics/std.ts'
import { cumSumDocs } from './function/statistics/cumsum.ts'
import { sumDocs } from './function/statistics/sum.ts'
import { varianceDocs } from './function/statistics/variance.ts'
import { corrDocs } from './function/statistics/corr.ts'
import { acosDocs } from './function/trigonometry/acos.ts'
import { acoshDocs } from './function/trigonometry/acosh.ts'
import { acotDocs } from './function/trigonometry/acot.ts'
import { acothDocs } from './function/trigonometry/acoth.ts'
import { acscDocs } from './function/trigonometry/acsc.ts'
import { acschDocs } from './function/trigonometry/acsch.ts'
import { asecDocs } from './function/trigonometry/asec.ts'
import { asechDocs } from './function/trigonometry/asech.ts'
import { asinDocs } from './function/trigonometry/asin.ts'
import { asinhDocs } from './function/trigonometry/asinh.ts'
import { atanDocs } from './function/trigonometry/atan.ts'
import { atan2Docs } from './function/trigonometry/atan2.ts'
import { atanhDocs } from './function/trigonometry/atanh.ts'
import { cosDocs } from './function/trigonometry/cos.ts'
import { coshDocs } from './function/trigonometry/cosh.ts'
import { cotDocs } from './function/trigonometry/cot.ts'
import { cothDocs } from './function/trigonometry/coth.ts'
import { cscDocs } from './function/trigonometry/csc.ts'
import { cschDocs } from './function/trigonometry/csch.ts'
import { secDocs } from './function/trigonometry/sec.ts'
import { sechDocs } from './function/trigonometry/sech.ts'
import { sinDocs } from './function/trigonometry/sin.ts'
import { sinhDocs } from './function/trigonometry/sinh.ts'
import { tanDocs } from './function/trigonometry/tan.ts'
import { tanhDocs } from './function/trigonometry/tanh.ts'
import { toDocs } from './function/units/to.ts'
import { toBestDocs } from './function/units/toBest.ts'
import { binDocs } from './function/utils/bin.ts'
import { cloneDocs } from './function/utils/clone.ts'
import { formatDocs } from './function/utils/format.ts'
import { hasNumericValueDocs } from './function/utils/hasNumericValue.ts'
import { hexDocs } from './function/utils/hex.ts'
import { isIntegerDocs } from './function/utils/isInteger.ts'
import { isNaNDocs } from './function/utils/isNaN.ts'
import { isBoundedDocs } from './function/utils/isBounded.ts'
import { isFiniteDocs } from './function/utils/isFinite.ts'
import { isNegativeDocs } from './function/utils/isNegative.ts'
import { isNumericDocs } from './function/utils/isNumeric.ts'
import { isPositiveDocs } from './function/utils/isPositive.ts'
import { isPrimeDocs } from './function/utils/isPrime.ts'
import { isZeroDocs } from './function/utils/isZero.ts'
import { numericDocs } from './function/utils/numeric.ts'
import { octDocs } from './function/utils/oct.ts'
import { printDocs } from './function/utils/print.ts'
import { typeOfDocs } from './function/utils/typeOf.ts'
import { solveODEDocs } from './function/numeric/solveODE.ts'

export const embeddedDocs = {

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
  speedOfLight: { description: 'Speed of light in vacuum', examples: ['speedOfLight'] },
  gravitationConstant: { description: 'Newtonian constant of gravitation', examples: ['gravitationConstant'] },
  planckConstant: { description: 'Planck constant', examples: ['planckConstant'] },
  reducedPlanckConstant: { description: 'Reduced Planck constant', examples: ['reducedPlanckConstant'] },

  magneticConstant: { description: 'Magnetic constant (vacuum permeability)', examples: ['magneticConstant'] },
  electricConstant: { description: 'Electric constant (vacuum permeability)', examples: ['electricConstant'] },
  vacuumImpedance: { description: 'Characteristic impedance of vacuum', examples: ['vacuumImpedance'] },
  coulomb: { description: 'Coulomb\'s constant. Deprecated in favor of coulombConstant', examples: ['coulombConstant'] },
  coulombConstant: { description: 'Coulomb\'s constant', examples: ['coulombConstant'] },
  elementaryCharge: { description: 'Elementary charge', examples: ['elementaryCharge'] },
  bohrMagneton: { description: 'Bohr magneton', examples: ['bohrMagneton'] },
  conductanceQuantum: { description: 'Conductance quantum', examples: ['conductanceQuantum'] },
  inverseConductanceQuantum: { description: 'Inverse conductance quantum', examples: ['inverseConductanceQuantum'] },
  // josephson: {description: 'Josephson constant', examples: ['josephson']},
  magneticFluxQuantum: { description: 'Magnetic flux quantum', examples: ['magneticFluxQuantum'] },
  nuclearMagneton: { description: 'Nuclear magneton', examples: ['nuclearMagneton'] },
  klitzing: { description: 'Von Klitzing constant', examples: ['klitzing'] },

  bohrRadius: { description: 'Bohr radius', examples: ['bohrRadius'] },
  classicalElectronRadius: { description: 'Classical electron radius', examples: ['classicalElectronRadius'] },
  electronMass: { description: 'Electron mass', examples: ['electronMass'] },
  fermiCoupling: { description: 'Fermi coupling constant', examples: ['fermiCoupling'] },
  fineStructure: { description: 'Fine-structure constant', examples: ['fineStructure'] },
  hartreeEnergy: { description: 'Hartree energy', examples: ['hartreeEnergy'] },
  protonMass: { description: 'Proton mass', examples: ['protonMass'] },
  deuteronMass: { description: 'Deuteron Mass', examples: ['deuteronMass'] },
  neutronMass: { description: 'Neutron mass', examples: ['neutronMass'] },
  quantumOfCirculation: { description: 'Quantum of circulation', examples: ['quantumOfCirculation'] },
  rydberg: { description: 'Rydberg constant', examples: ['rydberg'] },
  thomsonCrossSection: { description: 'Thomson cross section', examples: ['thomsonCrossSection'] },
  weakMixingAngle: { description: 'Weak mixing angle', examples: ['weakMixingAngle'] },
  efimovFactor: { description: 'Efimov factor', examples: ['efimovFactor'] },

  atomicMass: { description: 'Atomic mass constant', examples: ['atomicMass'] },
  avogadro: { description: 'Avogadro\'s number', examples: ['avogadro'] },
  boltzmann: { description: 'Boltzmann constant', examples: ['boltzmann'] },
  faraday: { description: 'Faraday constant', examples: ['faraday'] },
  firstRadiation: { description: 'First radiation constant', examples: ['firstRadiation'] },
  loschmidt: { description: 'Loschmidt constant at T=273.15 K and p=101.325 kPa', examples: ['loschmidt'] },
  gasConstant: { description: 'Gas constant', examples: ['gasConstant'] },
  molarPlanckConstant: { description: 'Molar Planck constant', examples: ['molarPlanckConstant'] },
  molarVolume: { description: 'Molar volume of an ideal gas at T=273.15 K and p=101.325 kPa', examples: ['molarVolume'] },
  sackurTetrode: { description: 'Sackur-Tetrode constant at T=1 K and p=101.325 kPa', examples: ['sackurTetrode'] },
  secondRadiation: { description: 'Second radiation constant', examples: ['secondRadiation'] },
  stefanBoltzmann: { description: 'Stefan-Boltzmann constant', examples: ['stefanBoltzmann'] },
  wienDisplacement: { description: 'Wien displacement law constant', examples: ['wienDisplacement'] },
  // spectralRadiance: {description: 'First radiation constant for spectral radiance', examples: ['spectralRadiance']},

  molarMass: { description: 'Molar mass constant', examples: ['molarMass'] },
  molarMassC12: { description: 'Molar mass constant of carbon-12', examples: ['molarMassC12'] },
  gravity: { description: 'Standard acceleration of gravity (standard acceleration of free-fall on Earth)', examples: ['gravity'] },

  planckLength: { description: 'Planck length', examples: ['planckLength'] },
  planckMass: { description: 'Planck mass', examples: ['planckMass'] },
  planckTime: { description: 'Planck time', examples: ['planckTime'] },
  planckCharge: { description: 'Planck charge', examples: ['planckCharge'] },
  planckTemperature: { description: 'Planck temperature', examples: ['planckTemperature'] },

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
}
