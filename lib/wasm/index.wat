(module
 (type $0 (func (param f64) (result f64)))
 (type $1 (func (param i32 i32 i32 i32)))
 (type $2 (func (param i32 i32 i32)))
 (type $3 (func (param i32 i32) (result i32)))
 (type $4 (func (param i32 i32) (result f64)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (param f64 f64) (result f64)))
 (type $7 (func (param i32 i32 i32) (result f64)))
 (type $8 (func (param i32 i32 i32 i32 i32)))
 (type $9 (func (param i32 i32 i32 i32) (result i32)))
 (type $10 (func (param f64 f64) (result i32)))
 (type $11 (func (param f64) (result i32)))
 (type $12 (func (param i32 i32 i32) (result i32)))
 (type $13 (func (param i32 i32 i32 i32 i32 i32 i32)))
 (type $14 (func (param f64 f64 i32)))
 (type $15 (func (param i32 i32)))
 (type $16 (func (param i32 i32 i32 i32 i32) (result i32)))
 (type $17 (func (param i32)))
 (type $18 (func (param f64 f64 f64 f64 i32)))
 (type $19 (func (param i32 i32 i32 i32 i32 i32)))
 (type $20 (func (result i32)))
 (type $21 (func (param i32 i32 f64 i32 i32 i32 i32)))
 (type $22 (func))
 (type $23 (func (param i32 f64 i32 i32)))
 (type $24 (func (param i32 i32 i32 i32 i32 i32 i32 i32)))
 (type $25 (func (param f64 f64 f64 f64) (result f64)))
 (type $26 (func (param f64 f64 f64 f64 f64 f64) (result f64)))
 (type $27 (func (param i32 i32 f64 i32) (result i32)))
 (type $28 (func (param i32 i32 f64) (result f64)))
 (type $29 (func (param i64) (result i32)))
 (type $30 (func (param i32 f64 f64 i32 i32 i32 i32)))
 (type $31 (func (param f64 f64 f64 f64 f64 f64 f64 f64 i32)))
 (type $32 (func (param f64 f64 f64) (result i32)))
 (type $33 (func (param i32 f64 f64 i32 i32)))
 (type $34 (func (param i32 i32 f64 i32 i32 i32) (result i32)))
 (type $35 (func (param i32 i32 i32 f64 i32 i32 i32) (result i32)))
 (type $36 (func (param i32 i32 i32 f64 i32 i32) (result i32)))
 (type $37 (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $38 (func (param i32) (result f64)))
 (type $39 (func (param i32 i32 i32 i32 i32 i32 f64 i32 i32 i32 i32 i32)))
 (type $40 (func (param f64 i32) (result f64)))
 (type $41 (func (param f64 f64 i32 f64 f64) (result f64)))
 (type $42 (func (param i32 i32 f64 f64 f64 i32 i32)))
 (type $43 (func (param f64 f64 f64 i32) (result i32)))
 (type $44 (func (param f64 f64 f64 i32) (result f64)))
 (type $45 (func (param f64 f64 f64 i32)))
 (type $46 (func (param f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 i32)))
 (type $47 (func (param f64 f64 f64 f64 f64 f64 i32)))
 (type $48 (func (param f64 f64 f64 f64 f64 f64 f64 f64) (result f64)))
 (type $49 (func (param i32 f64 f64) (result f64)))
 (type $50 (func (param f64 f64 f64) (result f64)))
 (type $51 (func (param i32 i32 f64) (result i32)))
 (type $52 (func (param f64 f64 i32) (result f64)))
 (type $53 (func (param i64 i32) (result i32)))
 (type $54 (func (param f64 i32 i32) (result i32)))
 (type $55 (func (param i32 f64 i32 i32 i32)))
 (type $56 (func (param i32 i32 i32) (result f32)))
 (type $57 (func (param i32 i32) (result f32)))
 (type $58 (func (param i32 i32 i32 i32) (result f64)))
 (type $59 (func (param i32 i32 i32 f64 i32) (result i32)))
 (type $60 (func (param i32 i32) (result i64)))
 (type $61 (func (param i32 i32 i32 i32 f64) (result f64)))
 (type $62 (func (param i32 i32 i32 f64 i32) (result f64)))
 (type $63 (func (param i32 i32 f64 i32 f64 i32 i32) (result i32)))
 (type $64 (func (param i32 i32 f64 i32)))
 (type $65 (func (param i32 i32 f64 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $66 (func (param f64) (result i64)))
 (type $67 (func (param i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $68 (func (param i32 i32 i32 i32 i32 f64 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $69 (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)))
 (type $70 (func (param i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $71 (func (param i32 i32 i64)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $src/wasm/plain/operations/PI f64 (f64.const 3.141592653589793))
 (global $src/wasm/plain/operations/TAU f64 (f64.const 6.283185307179586))
 (global $src/wasm/plain/operations/E f64 (f64.const 2.718281828459045))
 (global $src/wasm/plain/operations/PHI f64 (f64.const 1.618033988749895))
 (global $src/wasm/utils/workPtrValidation/WORK_EIGS_SYMMETRIC i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_POWER_ITERATION i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_VECTOR i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_MATRIX i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_VECTOR i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_MATRIX i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_BALANCE_MATRIX i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_EXPM i32 (i32.const 6))
 (global $src/wasm/utils/workPtrValidation/WORK_EXPMV i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_SQRTM i32 (i32.const 5))
 (global $src/wasm/utils/workPtrValidation/WORK_SQRTM_NEWTON_SCHULZ i32 (i32.const 3))
 (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_VECTOR i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_INT i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_VECTOR i32 (i32.const 1))
 (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_INT i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_COLUMN_COUNTS i32 (i32.const 3))
 (global $src/wasm/utils/workPtrValidation/WORK_LU_DECOMPOSITION i32 (i32.const 0))
 (global $src/wasm/utils/workPtrValidation/WORK_QR_DECOMPOSITION i32 (i32.const 0))
 (global $src/wasm/utils/workPtrValidation/WORK_CHOLESKY_DECOMPOSITION i32 (i32.const 0))
 (global $src/wasm/utils/workPtrValidation/WORK_FFT_2D i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_IRFFT i32 (i32.const 2))
 (global $src/wasm/utils/workPtrValidation/WORK_BLOCKED_MULTIPLY i32 (i32.const 1))
 (global $~lib/math/rempio2_y0 (mut f64) (f64.const 0))
 (global $~lib/math/rempio2_y1 (mut f64) (f64.const 0))
 (global $~lib/math/res128_hi (mut i64) (i64.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/total (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/threshold (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/state (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/visitCount (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/pinSpace (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/iter (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/toSpace (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/white (mut i32) (i32.const 0))
 (global $~lib/rt/itcms/fromSpace (mut i32) (i32.const 0))
 (global $~lib/rt/tlsf/ROOT (mut i32) (i32.const 0))
 (global $~lib/rt/__rtti_base i32 (i32.const 1760))
 (global $~started (mut i32) (i32.const 0))
 (memory $0 256 16384)
 (data $0 (i32.const 1024) "n\83\f9\a2\00\00\00\00\d1W\'\fc)\15DN\99\95b\db\c0\dd4\f5\abcQ\feA\90C<:n$\b7a\c5\bb\de\ea.I\06\e0\d2MB\1c\eb\1d\fe\1c\92\d1\t\f55\82\e8>\a7)\b1&p\9c\e9\84D\bb.9\d6\919A~_\b4\8b_\84\9c\f49S\83\ff\97\f8\1f;(\f9\bd\8b\11/\ef\0f\98\05\de\cf~6m\1fm\nZf?FO\b7\t\cb\'\c7\ba\'u-\ea_\9e\f79\07={\f1\e5\eb\b1_\fbk\ea\92R\8aF0\03V\08]\8d\1f \bc\cf\f0\abk{\fca\91\e3\a9\1d6\f4\9a_\85\99e\08\1b\e6^\80\d8\ff\8d@h\a0\14W\15\06\061\'sM")
 (data $1 (i32.const 1228) "<")
 (data $1.1 (i32.const 1240) "\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
 (data $2 (i32.const 1292) "<")
 (data $2.1 (i32.const 1304) "\02\00\00\00 \00\00\00~\00l\00i\00b\00/\00r\00t\00/\00i\00t\00c\00m\00s\00.\00t\00s")
 (data $5 (i32.const 1420) "<")
 (data $5.1 (i32.const 1432) "\02\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e")
 (data $6 (i32.const 1484) ",")
 (data $6.1 (i32.const 1496) "\02\00\00\00\14\00\00\00~\00l\00i\00b\00/\00r\00t\00.\00t\00s")
 (data $8 (i32.const 1564) "<")
 (data $8.1 (i32.const 1576) "\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00t\00l\00s\00f\00.\00t\00s")
 (data $9 (i32.const 1628) "<")
 (data $9.1 (i32.const 1640) "\02\00\00\00*\00\00\00O\00b\00j\00e\00c\00t\00 \00a\00l\00r\00e\00a\00d\00y\00 \00p\00i\00n\00n\00e\00d")
 (data $10 (i32.const 1692) "<")
 (data $10.1 (i32.const 1704) "\02\00\00\00(\00\00\00O\00b\00j\00e\00c\00t\00 \00i\00s\00 \00n\00o\00t\00 \00p\00i\00n\00n\00e\00d")
 (data $11 (i32.const 1760) "\04\00\00\00 \00\00\00 \00\00\00 ")
 (export "multiplyDense" (func $src/wasm/matrix/multiply/multiplyDense))
 (export "multiplyDenseSIMD" (func $src/wasm/matrix/multiply/multiplyDenseSIMD))
 (export "multiplyVector" (func $src/wasm/matrix/multiply/multiplyVector))
 (export "transpose" (func $src/wasm/matrix/multiply/transpose))
 (export "add" (func $src/wasm/matrix/multiply/add))
 (export "subtract" (func $src/wasm/matrix/multiply/subtract))
 (export "scalarMultiply" (func $src/wasm/matrix/multiply/scalarMultiply))
 (export "dotProduct" (func $src/wasm/matrix/multiply/dotProduct))
 (export "multiplyBlockedSIMD" (func $src/wasm/matrix/multiply/multiplyBlockedSIMD))
 (export "addSIMD" (func $src/wasm/matrix/multiply/addSIMD))
 (export "subtractSIMD" (func $src/wasm/matrix/multiply/subtractSIMD))
 (export "scalarMultiplySIMD" (func $src/wasm/matrix/multiply/scalarMultiplySIMD))
 (export "dotProductSIMD" (func $src/wasm/matrix/multiply/dotProductSIMD))
 (export "multiplyVectorSIMD" (func $src/wasm/matrix/multiply/multiplyVectorSIMD))
 (export "transposeSIMD" (func $src/wasm/matrix/multiply/transposeSIMD))
 (export "luDecomposition" (func $src/wasm/algebra/decomposition/luDecomposition))
 (export "qrDecomposition" (func $src/wasm/algebra/decomposition/qrDecomposition))
 (export "choleskyDecomposition" (func $src/wasm/algebra/decomposition/choleskyDecomposition))
 (export "luSolve" (func $src/wasm/algebra/decomposition/luSolve))
 (export "luDeterminant" (func $src/wasm/algebra/decomposition/luDeterminant))
 (export "luDecompositionSIMD" (func $src/wasm/algebra/decomposition/luDecompositionSIMD))
 (export "qrDecompositionSIMD" (func $src/wasm/algebra/decomposition/qrDecompositionSIMD))
 (export "choleskyDecompositionSIMD" (func $src/wasm/algebra/decomposition/choleskyDecompositionSIMD))
 (export "fft" (func $src/wasm/signal/fft/fft))
 (export "fft2d" (func $src/wasm/signal/fft/fft2d))
 (export "convolve" (func $src/wasm/signal/fft/convolve))
 (export "rfft" (func $src/wasm/signal/fft/rfft))
 (export "irfft" (func $src/wasm/signal/fft/irfft))
 (export "isPowerOf2" (func $src/wasm/signal/fft/isPowerOf2))
 (export "fftSIMD" (func $src/wasm/signal/fft/fftSIMD))
 (export "convolveSIMD" (func $src/wasm/signal/fft/convolveSIMD))
 (export "powerSpectrumSIMD" (func $src/wasm/signal/fft/powerSpectrumSIMD))
 (export "crossCorrelationSIMD" (func $src/wasm/signal/fft/crossCorrelationSIMD))
 (export "freqz" (func $src/wasm/signal/processing/freqz))
 (export "freqzUniform" (func $src/wasm/signal/processing/freqzUniform))
 (export "polyMultiply" (func $src/wasm/signal/processing/polyMultiply))
 (export "zpk2tf" (func $src/wasm/signal/processing/zpk2tf))
 (export "magnitude" (func $src/wasm/signal/processing/magnitude))
 (export "magnitudeDb" (func $src/wasm/signal/processing/magnitudeDb))
 (export "phase" (func $src/wasm/signal/processing/phase))
 (export "unwrapPhase" (func $src/wasm/signal/processing/unwrapPhase))
 (export "groupDelay" (func $src/wasm/signal/processing/groupDelay))
 (export "rk45Step" (func $src/wasm/numeric/ode/rk45Step))
 (export "rk23Step" (func $src/wasm/numeric/ode/rk23Step))
 (export "maxError" (func $src/wasm/numeric/ode/maxError))
 (export "computeStepAdjustment" (func $src/wasm/numeric/ode/computeStepAdjustment))
 (export "interpolate" (func $src/wasm/numeric/ode/interpolate))
 (export "vectorCopy" (func $src/wasm/numeric/ode/vectorCopy))
 (export "vectorScale" (func $src/wasm/matrix/multiply/scalarMultiply))
 (export "vectorAdd" (func $src/wasm/matrix/multiply/add))
 (export "wouldOvershoot" (func $src/wasm/numeric/ode/wouldOvershoot))
 (export "trimStep" (func $src/wasm/numeric/ode/trimStep))
 (export "arg" (func $src/wasm/complex/operations/arg))
 (export "argArray" (func $src/wasm/complex/operations/argArray))
 (export "conj" (func $src/wasm/complex/operations/conj))
 (export "conjArray" (func $src/wasm/complex/operations/conjArray))
 (export "re" (func $src/wasm/complex/operations/re))
 (export "reArray" (func $src/wasm/complex/operations/reArray))
 (export "im" (func $src/wasm/complex/operations/im))
 (export "imArray" (func $src/wasm/complex/operations/imArray))
 (export "abs" (func $src/wasm/complex/operations/abs))
 (export "absArray" (func $src/wasm/complex/operations/absArray))
 (export "addComplex" (func $src/wasm/complex/operations/addComplex))
 (export "subComplex" (func $src/wasm/complex/operations/subComplex))
 (export "mulComplex" (func $src/wasm/complex/operations/mulComplex))
 (export "divComplex" (func $src/wasm/complex/operations/divComplex))
 (export "sqrtComplex" (func $src/wasm/complex/operations/sqrtComplex))
 (export "expComplex" (func $src/wasm/complex/operations/expComplex))
 (export "logComplex" (func $src/wasm/complex/operations/logComplex))
 (export "sinComplex" (func $src/wasm/complex/operations/sinComplex))
 (export "cosComplex" (func $src/wasm/complex/operations/cosComplex))
 (export "tanComplex" (func $src/wasm/complex/operations/tanComplex))
 (export "powComplexReal" (func $src/wasm/complex/operations/powComplexReal))
 (export "distance2D" (func $src/wasm/geometry/operations/distance2D))
 (export "distance3D" (func $src/wasm/geometry/operations/distance3D))
 (export "distanceND" (func $src/wasm/geometry/operations/distanceND))
 (export "manhattanDistance2D" (func $src/wasm/geometry/operations/manhattanDistance2D))
 (export "manhattanDistanceND" (func $src/wasm/geometry/operations/manhattanDistanceND))
 (export "intersect2DLines" (func $src/wasm/geometry/operations/intersect2DLines))
 (export "intersect2DInfiniteLines" (func $src/wasm/geometry/operations/intersect2DInfiniteLines))
 (export "intersectLinePlane" (func $src/wasm/geometry/operations/intersectLinePlane))
 (export "cross3D" (func $src/wasm/geometry/operations/cross3D))
 (export "dotND" (func $src/wasm/matrix/multiply/dotProduct))
 (export "angle2D" (func $src/wasm/geometry/operations/angle2D))
 (export "angle3D" (func $src/wasm/geometry/operations/angle3D))
 (export "triangleArea2D" (func $src/wasm/geometry/operations/triangleArea2D))
 (export "pointInTriangle2D" (func $src/wasm/geometry/operations/pointInTriangle2D))
 (export "normalizeND" (func $src/wasm/geometry/operations/normalizeND))
 (export "and" (func $src/wasm/logical/operations/and))
 (export "or" (func $src/wasm/logical/operations/or))
 (export "not" (func $src/wasm/logical/operations/not))
 (export "xor" (func $src/wasm/logical/operations/xor))
 (export "nand" (func $src/wasm/logical/operations/nand))
 (export "nor" (func $src/wasm/logical/operations/nor))
 (export "xnor" (func $src/wasm/logical/operations/xnor))
 (export "all" (func $src/wasm/logical/operations/all))
 (export "any" (func $src/wasm/logical/operations/any))
 (export "countTrue" (func $src/wasm/logical/operations/countTrue))
 (export "findFirst" (func $src/wasm/logical/operations/findFirst))
 (export "findLast" (func $src/wasm/logical/operations/findLast))
 (export "findAll" (func $src/wasm/logical/operations/findAll))
 (export "select" (func $src/wasm/logical/operations/select))
 (export "selectArray" (func $src/wasm/logical/operations/selectArray))
 (export "andArray" (func $src/wasm/logical/operations/andArray))
 (export "orArray" (func $src/wasm/logical/operations/orArray))
 (export "notArray" (func $src/wasm/logical/operations/notArray))
 (export "xorArray" (func $src/wasm/logical/operations/xorArray))
 (export "compare" (func $src/wasm/relational/operations/compare))
 (export "compareArray" (func $src/wasm/relational/operations/compareArray))
 (export "equal" (func $src/wasm/relational/operations/equal))
 (export "nearlyEqual" (func $src/wasm/relational/operations/nearlyEqual))
 (export "equalArray" (func $src/wasm/relational/operations/equalArray))
 (export "unequal" (func $src/wasm/relational/operations/unequal))
 (export "unequalArray" (func $src/wasm/relational/operations/unequalArray))
 (export "larger" (func $src/wasm/relational/operations/larger))
 (export "largerArray" (func $src/wasm/relational/operations/largerArray))
 (export "largerEq" (func $src/wasm/relational/operations/largerEq))
 (export "largerEqArray" (func $src/wasm/relational/operations/largerEqArray))
 (export "smaller" (func $src/wasm/relational/operations/smaller))
 (export "smallerArray" (func $src/wasm/relational/operations/smallerArray))
 (export "smallerEq" (func $src/wasm/relational/operations/smallerEq))
 (export "smallerEqArray" (func $src/wasm/relational/operations/smallerEqArray))
 (export "min" (func $src/wasm/relational/operations/min))
 (export "max" (func $src/wasm/relational/operations/max))
 (export "argmin" (func $src/wasm/relational/operations/argmin))
 (export "argmax" (func $src/wasm/relational/operations/argmax))
 (export "clamp" (func $src/wasm/relational/operations/clamp))
 (export "clampArray" (func $src/wasm/relational/operations/clampArray))
 (export "inRange" (func $src/wasm/relational/operations/inRange))
 (export "inRangeArray" (func $src/wasm/relational/operations/inRangeArray))
 (export "isPositive" (func $src/wasm/relational/operations/isPositive))
 (export "isNegative" (func $src/wasm/relational/operations/isNegative))
 (export "isZero" (func $src/wasm/relational/operations/isZero))
 (export "isNaN" (func $src/wasm/relational/operations/isNaN))
 (export "isFinite" (func $src/wasm/relational/operations/isFinite))
 (export "isInteger" (func $src/wasm/relational/operations/isInteger))
 (export "sign" (func $src/wasm/relational/operations/sign))
 (export "signArray" (func $src/wasm/relational/operations/signArray))
 (export "createSet" (func $src/wasm/set/operations/createSet))
 (export "setUnion" (func $src/wasm/set/operations/setUnion))
 (export "setIntersect" (func $src/wasm/set/operations/setIntersect))
 (export "setDifference" (func $src/wasm/set/operations/setDifference))
 (export "setSymDifference" (func $src/wasm/set/operations/setSymDifference))
 (export "setIsSubset" (func $src/wasm/set/operations/setIsSubset))
 (export "setIsProperSubset" (func $src/wasm/set/operations/setIsProperSubset))
 (export "setIsSuperset" (func $src/wasm/set/operations/setIsSuperset))
 (export "setIsProperSuperset" (func $src/wasm/set/operations/setIsProperSuperset))
 (export "setEquals" (func $src/wasm/set/operations/setEquals))
 (export "setIsDisjoint" (func $src/wasm/set/operations/setIsDisjoint))
 (export "setSize" (func $src/wasm/set/operations/setSize))
 (export "setContains" (func $src/wasm/set/operations/setContains))
 (export "setAdd" (func $src/wasm/set/operations/setAdd))
 (export "setRemove" (func $src/wasm/set/operations/setRemove))
 (export "setCartesian" (func $src/wasm/set/operations/setCartesian))
 (export "setPowerSetSize" (func $src/wasm/set/operations/setPowerSetSize))
 (export "setGetSubset" (func $src/wasm/set/operations/setGetSubset))
 (export "erf" (func $src/wasm/special/functions/erf))
 (export "erfArray" (func $src/wasm/special/functions/erfArray))
 (export "erfc" (func $src/wasm/special/functions/erfc))
 (export "erfcArray" (func $src/wasm/special/functions/erfcArray))
 (export "gamma" (func $src/wasm/special/functions/gamma))
 (export "gammaArray" (func $src/wasm/special/functions/gammaArray))
 (export "lgamma" (func $src/wasm/special/functions/lgamma))
 (export "lgammaArray" (func $src/wasm/special/functions/lgammaArray))
 (export "zeta" (func $src/wasm/special/functions/zeta))
 (export "zetaArray" (func $src/wasm/special/functions/zetaArray))
 (export "beta" (func $src/wasm/special/functions/beta))
 (export "gammainc" (func $src/wasm/special/functions/gammainc))
 (export "digamma" (func $src/wasm/special/functions/digamma))
 (export "digammaArray" (func $src/wasm/special/functions/digammaArray))
 (export "besselJ0" (func $src/wasm/special/functions/besselJ0))
 (export "besselJ1" (func $src/wasm/special/functions/besselJ1))
 (export "besselY0" (func $src/wasm/special/functions/besselY0))
 (export "besselY1" (func $src/wasm/special/functions/besselY1))
 (export "isDigit" (func $src/wasm/string/operations/isDigit))
 (export "isLetter" (func $src/wasm/string/operations/isLetter))
 (export "isAlphanumeric" (func $src/wasm/string/operations/isAlphanumeric))
 (export "isWhitespace" (func $src/wasm/string/operations/isWhitespace))
 (export "toLowerCode" (func $src/wasm/string/operations/toLowerCode))
 (export "toUpperCode" (func $src/wasm/string/operations/toUpperCode))
 (export "parseIntFromCodes" (func $src/wasm/string/operations/parseIntFromCodes))
 (export "parseFloatFromCodes" (func $src/wasm/string/operations/parseFloatFromCodes))
 (export "countDigits" (func $src/wasm/string/operations/countDigits))
 (export "formatIntToCodes" (func $src/wasm/string/operations/formatIntToCodes))
 (export "formatFloatToCodes" (func $src/wasm/string/operations/formatFloatToCodes))
 (export "compareCodeArrays" (func $src/wasm/string/operations/compareCodeArrays))
 (export "hashCodes" (func $src/wasm/string/operations/hashCodes))
 (export "findPattern" (func $src/wasm/string/operations/findPattern))
 (export "countPattern" (func $src/wasm/string/operations/countPattern))
 (export "utf8ByteLength" (func $src/wasm/string/operations/utf8ByteLength))
 (export "isNumericString" (func $src/wasm/string/operations/isNumericString))
 (export "simdAddF64" (func $src/wasm/simd/operations/simdAddF64))
 (export "simdSubF64" (func $src/wasm/simd/operations/simdSubF64))
 (export "simdMulF64" (func $src/wasm/simd/operations/simdMulF64))
 (export "simdDivF64" (func $src/wasm/simd/operations/simdDivF64))
 (export "simdScaleF64" (func $src/wasm/simd/operations/simdScaleF64))
 (export "simdDotF64" (func $src/wasm/simd/operations/simdDotF64))
 (export "simdSumF64" (func $src/wasm/simd/operations/simdSumF64))
 (export "simdSumSquaresF64" (func $src/wasm/simd/operations/simdSumSquaresF64))
 (export "simdNormF64" (func $src/wasm/simd/operations/simdNormF64))
 (export "simdMinF64" (func $src/wasm/simd/operations/simdMinF64))
 (export "simdMaxF64" (func $src/wasm/simd/operations/simdMaxF64))
 (export "simdAbsF64" (func $src/wasm/simd/operations/simdAbsF64))
 (export "simdSqrtF64" (func $src/wasm/simd/operations/simdSqrtF64))
 (export "simdNegF64" (func $src/wasm/simd/operations/simdNegF64))
 (export "simdMatVecMulF64" (func $src/wasm/simd/operations/simdMatVecMulF64))
 (export "simdMatAddF64" (func $src/wasm/simd/operations/simdMatAddF64))
 (export "simdMatSubF64" (func $src/wasm/simd/operations/simdMatSubF64))
 (export "simdMatDotMulF64" (func $src/wasm/simd/operations/simdMatDotMulF64))
 (export "simdMatScaleF64" (func $src/wasm/simd/operations/simdMatScaleF64))
 (export "simdMatMulF64" (func $src/wasm/simd/operations/simdMatMulF64))
 (export "simdMatTransposeF64" (func $src/wasm/simd/operations/simdMatTransposeF64))
 (export "simdMeanF64" (func $src/wasm/simd/operations/simdMeanF64))
 (export "simdVarianceF64" (func $src/wasm/simd/operations/simdVarianceF64@varargs))
 (export "simdStdF64" (func $src/wasm/simd/operations/simdStdF64@varargs))
 (export "simdAddF32" (func $src/wasm/simd/operations/simdAddF32))
 (export "simdMulF32" (func $src/wasm/simd/operations/simdMulF32))
 (export "simdDotF32" (func $src/wasm/simd/operations/simdDotF32))
 (export "simdSumF32" (func $src/wasm/simd/operations/simdSumF32))
 (export "simdAddI32" (func $src/wasm/simd/operations/simdAddI32))
 (export "simdMulI32" (func $src/wasm/simd/operations/simdMulI32))
 (export "simdComplexMulF64" (func $src/wasm/simd/operations/simdComplexMulF64))
 (export "simdComplexAddF64" (func $src/wasm/simd/operations/simdComplexAddF64))
 (export "simdSupported" (func $src/wasm/simd/operations/simdSupported))
 (export "simdVectorSizeF64" (func $src/wasm/simd/operations/simdVectorSizeF64))
 (export "simdVectorSizeF32" (func $src/wasm/simd/operations/simdVectorSizeF32))
 (export "statsMean" (func $src/wasm/statistics/basic/mean))
 (export "statsMedian" (func $src/wasm/statistics/basic/median))
 (export "statsMedianUnsorted" (func $src/wasm/statistics/basic/medianUnsorted))
 (export "statsVariance" (func $src/wasm/statistics/basic/variance))
 (export "statsStd" (func $src/wasm/statistics/basic/std))
 (export "statsSum" (func $src/wasm/statistics/basic/sum))
 (export "statsProd" (func $src/wasm/statistics/basic/prod))
 (export "statsMad" (func $src/wasm/statistics/basic/mad))
 (export "statsKurtosis" (func $src/wasm/statistics/basic/kurtosis))
 (export "statsSkewness" (func $src/wasm/statistics/basic/skewness))
 (export "statsCV" (func $src/wasm/statistics/basic/coefficientOfVariation))
 (export "statsCorrelation" (func $src/wasm/statistics/basic/correlation))
 (export "statsCovariance" (func $src/wasm/statistics/basic/covariance))
 (export "statsGeometricMean" (func $src/wasm/statistics/basic/geometricMean))
 (export "statsHarmonicMean" (func $src/wasm/statistics/basic/harmonicMean))
 (export "statsRms" (func $src/wasm/statistics/basic/rms))
 (export "statsQuantile" (func $src/wasm/statistics/basic/quantile))
 (export "statsPercentile" (func $src/wasm/statistics/basic/percentile))
 (export "statsIQR" (func $src/wasm/statistics/basic/interquartileRange))
 (export "statsRange" (func $src/wasm/statistics/basic/range))
 (export "statsCumsum" (func $src/wasm/statistics/basic/cumsum))
 (export "statsZscore" (func $src/wasm/statistics/basic/zscore))
 (export "laDet" (func $src/wasm/matrix/linalg/det))
 (export "laInv" (func $src/wasm/matrix/linalg/inv))
 (export "laInv2x2" (func $src/wasm/matrix/linalg/inv2x2))
 (export "laInv3x3" (func $src/wasm/matrix/linalg/inv3x3))
 (export "laNorm1" (func $src/wasm/matrix/linalg/norm1))
 (export "laNorm2" (func $src/wasm/matrix/linalg/norm2))
 (export "laNormP" (func $src/wasm/matrix/linalg/normP))
 (export "laNormInf" (func $src/wasm/numeric/ode/maxError))
 (export "laNormFro" (func $src/wasm/matrix/linalg/normFro))
 (export "laMatrixNorm1" (func $src/wasm/matrix/linalg/matrixNorm1))
 (export "laMatrixNormInf" (func $src/wasm/matrix/linalg/matrixNormInf))
 (export "laNormalize" (func $src/wasm/matrix/linalg/normalize))
 (export "laKron" (func $src/wasm/matrix/linalg/kron))
 (export "laCross" (func $src/wasm/matrix/linalg/cross))
 (export "laDot" (func $src/wasm/matrix/multiply/dotProduct))
 (export "laOuter" (func $src/wasm/matrix/linalg/outer))
 (export "laCond1" (func $src/wasm/matrix/linalg/cond1))
 (export "laCondInf" (func $src/wasm/matrix/linalg/condInf))
 (export "laRank" (func $src/wasm/matrix/linalg/rank))
 (export "laSolve" (func $src/wasm/matrix/linalg/solve))
 (export "eigsSymmetric" (func $src/wasm/matrix/eigs/eigsSymmetric))
 (export "powerIteration" (func $src/wasm/matrix/eigs/powerIteration))
 (export "spectralRadius" (func $src/wasm/matrix/eigs/spectralRadius))
 (export "inverseIteration" (func $src/wasm/matrix/eigs/inverseIteration))
 (export "eigsSymmetricSIMD" (func $src/wasm/matrix/eigs/eigsSymmetricSIMD))
 (export "powerIterationSIMD" (func $src/wasm/matrix/eigs/powerIterationSIMD))
 (export "balanceMatrix" (func $src/wasm/matrix/complexEigs/balanceMatrix))
 (export "reduceToHessenberg" (func $src/wasm/matrix/complexEigs/reduceToHessenberg))
 (export "eigenvalues2x2" (func $src/wasm/matrix/complexEigs/eigenvalues2x2))
 (export "qrIterationStep" (func $src/wasm/matrix/complexEigs/qrIterationStep))
 (export "qrAlgorithm" (func $src/wasm/matrix/complexEigs/qrAlgorithm))
 (export "hessenbergQRStep" (func $src/wasm/matrix/complexEigs/hessenbergQRStep))
 (export "expm" (func $src/wasm/matrix/expm/expm))
 (export "expmSmall" (func $src/wasm/matrix/expm/expmSmall))
 (export "expmv" (func $src/wasm/matrix/expm/expmv))
 (export "sqrtm" (func $src/wasm/matrix/sqrtm/sqrtm))
 (export "sqrtmNewtonSchulz" (func $src/wasm/matrix/sqrtm/sqrtmNewtonSchulz))
 (export "sqrtmCholesky" (func $src/wasm/matrix/sqrtm/sqrtmCholesky))
 (export "sparseLu" (func $src/wasm/algebra/sparseLu/sparseLu))
 (export "sparseForwardSolve" (func $src/wasm/algebra/sparseLu/sparseForwardSolve))
 (export "sparseBackwardSolve" (func $src/wasm/algebra/sparseLu/sparseBackwardSolve))
 (export "sparseLuSolve" (func $src/wasm/algebra/sparseLu/sparseLuSolve))
 (export "sparseChol" (func $src/wasm/algebra/sparseChol/sparseChol))
 (export "sparseCholSolve" (func $src/wasm/algebra/sparseChol/sparseCholSolve))
 (export "eliminationTree" (func $src/wasm/algebra/sparseChol/eliminationTree))
 (export "columnCounts" (func $src/wasm/algebra/sparseChol/columnCounts))
 (export "plainAbs" (func $src/wasm/plain/operations/abs))
 (export "plainAdd" (func $src/wasm/plain/operations/add))
 (export "plainSubtract" (func $src/wasm/plain/operations/subtract))
 (export "plainMultiply" (func $src/wasm/plain/operations/multiply))
 (export "plainDivide" (func $src/wasm/plain/operations/divide))
 (export "plainUnaryMinus" (func $src/wasm/plain/operations/unaryMinus))
 (export "plainUnaryPlus" (func $src/wasm/plain/operations/unaryPlus))
 (export "plainCbrt" (func $src/wasm/plain/operations/cbrt))
 (export "plainCube" (func $src/wasm/plain/operations/cube))
 (export "plainExp" (func $src/wasm/plain/operations/exp))
 (export "plainExpm1" (func $src/wasm/plain/operations/expm1))
 (export "plainGcd" (func $src/wasm/plain/operations/gcd))
 (export "plainLcm" (func $src/wasm/plain/operations/lcm))
 (export "plainLog" (func $src/wasm/plain/operations/log))
 (export "plainLog2" (func $src/wasm/plain/operations/log2))
 (export "plainLog10" (func $src/wasm/plain/operations/log10))
 (export "plainLog1p" (func $src/wasm/plain/operations/log1p))
 (export "plainMod" (func $src/wasm/plain/operations/mod))
 (export "plainNthRoot" (func $src/wasm/plain/operations/nthRoot))
 (export "plainSign" (func $src/wasm/plain/operations/sign))
 (export "plainSqrt" (func $src/wasm/algebra/decomposition/sqrt))
 (export "plainSquare" (func $src/wasm/plain/operations/square))
 (export "plainPow" (func $src/wasm/plain/operations/pow))
 (export "plainNorm" (func $src/wasm/plain/operations/abs))
 (export "plainBitAnd" (func $src/wasm/plain/operations/bitAnd))
 (export "plainBitNot" (func $src/wasm/plain/operations/bitNot))
 (export "plainBitOr" (func $src/wasm/plain/operations/bitOr))
 (export "plainBitXor" (func $src/wasm/plain/operations/bitXor))
 (export "plainLeftShift" (func $src/wasm/plain/operations/leftShift))
 (export "plainRightArithShift" (func $src/wasm/plain/operations/rightArithShift))
 (export "plainRightLogShift" (func $src/wasm/plain/operations/rightLogShift))
 (export "plainCombinations" (func $src/wasm/plain/operations/combinations))
 (export "plainPI" (global $src/wasm/plain/operations/PI))
 (export "plainTAU" (global $src/wasm/plain/operations/TAU))
 (export "plainE" (global $src/wasm/plain/operations/E))
 (export "plainPHI" (global $src/wasm/plain/operations/PHI))
 (export "plainNot" (func $src/wasm/plain/operations/not))
 (export "plainOr" (func $src/wasm/plain/operations/or))
 (export "plainXor" (func $src/wasm/plain/operations/xor))
 (export "plainAnd" (func $src/wasm/plain/operations/and))
 (export "plainEqual" (func $src/wasm/relational/operations/equal))
 (export "plainUnequal" (func $src/wasm/relational/operations/unequal))
 (export "plainSmaller" (func $src/wasm/relational/operations/smaller))
 (export "plainSmallerEq" (func $src/wasm/relational/operations/smallerEq))
 (export "plainLarger" (func $src/wasm/relational/operations/larger))
 (export "plainLargerEq" (func $src/wasm/relational/operations/largerEq))
 (export "plainCompare" (func $src/wasm/plain/operations/compare))
 (export "plainGamma" (func $src/wasm/plain/operations/gamma))
 (export "plainLgamma" (func $src/wasm/plain/operations/lgamma))
 (export "plainAcos" (func $src/wasm/plain/operations/acos))
 (export "plainAcosh" (func $src/wasm/plain/operations/acosh))
 (export "plainAcot" (func $src/wasm/plain/operations/acot))
 (export "plainAcoth" (func $src/wasm/plain/operations/acoth))
 (export "plainAcsc" (func $src/wasm/plain/operations/acsc))
 (export "plainAcsch" (func $src/wasm/plain/operations/acsch))
 (export "plainAsec" (func $src/wasm/plain/operations/asec))
 (export "plainAsech" (func $src/wasm/plain/operations/asech))
 (export "plainAsin" (func $src/wasm/plain/operations/asin))
 (export "plainAsinh" (func $src/wasm/plain/operations/asinh))
 (export "plainAtan" (func $src/wasm/plain/operations/atan))
 (export "plainAtan2" (func $src/wasm/plain/operations/atan2))
 (export "plainAtanh" (func $src/wasm/plain/operations/atanh))
 (export "plainCos" (func $src/wasm/plain/operations/cos))
 (export "plainCosh" (func $src/wasm/plain/operations/cosh))
 (export "plainCot" (func $src/wasm/plain/operations/cot))
 (export "plainCoth" (func $src/wasm/plain/operations/coth))
 (export "plainCsc" (func $src/wasm/plain/operations/csc))
 (export "plainCsch" (func $src/wasm/plain/operations/csch))
 (export "plainSec" (func $src/wasm/plain/operations/sec))
 (export "plainSech" (func $src/wasm/plain/operations/sech))
 (export "plainSin" (func $src/wasm/plain/operations/sin))
 (export "plainSinh" (func $src/wasm/plain/operations/sinh))
 (export "plainTan" (func $src/wasm/plain/operations/tan))
 (export "plainTanh" (func $src/wasm/plain/operations/tanh))
 (export "plainIsIntegerValue" (func $src/wasm/plain/operations/isIntegerValue))
 (export "plainIsNegative" (func $src/wasm/relational/operations/isNegative))
 (export "plainIsPositive" (func $src/wasm/relational/operations/isPositive))
 (export "plainIsZero" (func $src/wasm/relational/operations/isZero))
 (export "plainIsNaN" (func $src/wasm/relational/operations/isNaN))
 (export "WORK_EIGS_SYMMETRIC" (global $src/wasm/utils/workPtrValidation/WORK_EIGS_SYMMETRIC))
 (export "WORK_POWER_ITERATION" (global $src/wasm/utils/workPtrValidation/WORK_POWER_ITERATION))
 (export "WORK_INVERSE_ITERATION_VECTOR" (global $src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_VECTOR))
 (export "WORK_INVERSE_ITERATION_MATRIX" (global $src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_MATRIX))
 (export "WORK_QR_ALGORITHM_VECTOR" (global $src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_VECTOR))
 (export "WORK_QR_ALGORITHM_MATRIX" (global $src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_MATRIX))
 (export "WORK_BALANCE_MATRIX" (global $src/wasm/utils/workPtrValidation/WORK_BALANCE_MATRIX))
 (export "WORK_EXPM" (global $src/wasm/utils/workPtrValidation/WORK_EXPM))
 (export "WORK_EXPMV" (global $src/wasm/utils/workPtrValidation/WORK_EXPMV))
 (export "WORK_SQRTM" (global $src/wasm/utils/workPtrValidation/WORK_SQRTM))
 (export "WORK_SQRTM_NEWTON_SCHULZ" (global $src/wasm/utils/workPtrValidation/WORK_SQRTM_NEWTON_SCHULZ))
 (export "WORK_SPARSE_LU_VECTOR" (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_VECTOR))
 (export "WORK_SPARSE_LU_INT" (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_INT))
 (export "WORK_SPARSE_CHOL_VECTOR" (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_VECTOR))
 (export "WORK_SPARSE_CHOL_INT" (global $src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_INT))
 (export "WORK_COLUMN_COUNTS" (global $src/wasm/utils/workPtrValidation/WORK_COLUMN_COUNTS))
 (export "WORK_LU_DECOMPOSITION" (global $src/wasm/utils/workPtrValidation/WORK_LU_DECOMPOSITION))
 (export "WORK_QR_DECOMPOSITION" (global $src/wasm/utils/workPtrValidation/WORK_QR_DECOMPOSITION))
 (export "WORK_CHOLESKY_DECOMPOSITION" (global $src/wasm/utils/workPtrValidation/WORK_CHOLESKY_DECOMPOSITION))
 (export "WORK_FFT_2D" (global $src/wasm/utils/workPtrValidation/WORK_FFT_2D))
 (export "WORK_IRFFT" (global $src/wasm/utils/workPtrValidation/WORK_IRFFT))
 (export "WORK_BLOCKED_MULTIPLY" (global $src/wasm/utils/workPtrValidation/WORK_BLOCKED_MULTIPLY))
 (export "eigsSymmetricWorkSize" (func $src/wasm/utils/workPtrValidation/eigsSymmetricWorkSize))
 (export "powerIterationWorkSize" (func $src/wasm/utils/workPtrValidation/powerIterationWorkSize))
 (export "inverseIterationWorkSize" (func $src/wasm/utils/workPtrValidation/inverseIterationWorkSize))
 (export "qrAlgorithmWorkSize" (func $src/wasm/utils/workPtrValidation/inverseIterationWorkSize))
 (export "expmWorkSize" (func $src/wasm/utils/workPtrValidation/expmWorkSize))
 (export "sqrtmWorkSize" (func $src/wasm/utils/workPtrValidation/sqrtmWorkSize))
 (export "sqrtmNewtonSchulzWorkSize" (func $src/wasm/utils/workPtrValidation/sqrtmNewtonSchulzWorkSize))
 (export "sparseLuWorkSize" (func $src/wasm/utils/workPtrValidation/sparseLuWorkSize))
 (export "sparseCholWorkSize" (func $src/wasm/utils/workPtrValidation/sparseLuWorkSize))
 (export "columnCountsWorkSize" (func $src/wasm/utils/workPtrValidation/columnCountsWorkSize))
 (export "fft2dWorkSize" (func $src/wasm/utils/workPtrValidation/fft2dWorkSize))
 (export "irfftWorkSize" (func $src/wasm/utils/workPtrValidation/eigsSymmetricWorkSize))
 (export "blockedMultiplyWorkSize" (func $src/wasm/utils/workPtrValidation/blockedMultiplyWorkSize))
 (export "condWorkSize" (func $src/wasm/utils/workPtrValidation/condWorkSize))
 (export "validateWorkPtrSize" (func $src/wasm/utils/workPtrValidation/validateWorkPtrSize))
 (export "getWorkPtrRequirement" (func $src/wasm/utils/workPtrValidation/getWorkPtrRequirement@varargs))
 (export "__new" (func $~lib/rt/itcms/__new))
 (export "__pin" (func $~lib/rt/itcms/__pin))
 (export "__unpin" (func $~lib/rt/itcms/__unpin))
 (export "__collect" (func $~lib/rt/itcms/__collect))
 (export "__rtti_base" (global $~lib/rt/__rtti_base))
 (export "memory" (memory $0))
 (export "__setArgumentsLength" (func $~setArgumentsLength))
 (export "_start" (func $~start))
 (func $src/wasm/matrix/multiply/multiplyDense (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  local.get $1
  local.get $5
  i32.mul
  local.set $4
  loop $for-loop|0
   local.get $4
   local.get $7
   i32.gt_s
   if
    local.get $6
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $11
   i32.gt_s
   if
    local.get $11
    i32.const -64
    i32.sub
    local.tee $4
    local.get $1
    local.get $1
    local.get $4
    i32.gt_s
    select
    local.set $13
    i32.const 0
    local.set $4
    loop $for-loop|2
     local.get $4
     local.get $5
     i32.lt_s
     if
      local.get $4
      i32.const -64
      i32.sub
      local.tee $7
      local.get $5
      local.get $5
      local.get $7
      i32.gt_s
      select
      local.set $14
      i32.const 0
      local.set $7
      loop $for-loop|3
       local.get $2
       local.get $7
       i32.gt_s
       if
        local.get $7
        i32.const -64
        i32.sub
        local.tee $8
        local.get $2
        local.get $2
        local.get $8
        i32.gt_s
        select
        local.set $15
        local.get $11
        local.set $8
        loop $for-loop|4
         local.get $8
         local.get $13
         i32.lt_s
         if
          local.get $4
          local.set $9
          loop $for-loop|5
           local.get $9
           local.get $14
           i32.lt_s
           if
            local.get $5
            local.get $8
            i32.mul
            local.get $9
            i32.add
            i32.const 3
            i32.shl
            local.tee $16
            local.get $6
            i32.add
            f64.load
            local.set $12
            local.get $7
            local.set $10
            loop $for-loop|6
             local.get $10
             local.get $15
             i32.lt_s
             if
              local.get $12
              local.get $0
              local.get $2
              local.get $8
              i32.mul
              local.get $10
              i32.add
              i32.const 3
              i32.shl
              i32.add
              f64.load
              local.get $3
              local.get $5
              local.get $10
              i32.mul
              local.get $9
              i32.add
              i32.const 3
              i32.shl
              i32.add
              f64.load
              f64.mul
              f64.add
              local.set $12
              local.get $10
              i32.const 1
              i32.add
              local.set $10
              br $for-loop|6
             end
            end
            local.get $6
            local.get $16
            i32.add
            local.get $12
            f64.store
            local.get $9
            i32.const 1
            i32.add
            local.set $9
            br $for-loop|5
           end
          end
          local.get $8
          i32.const 1
          i32.add
          local.set $8
          br $for-loop|4
         end
        end
        local.get $7
        i32.const -64
        i32.sub
        local.set $7
        br $for-loop|3
       end
      end
      local.get $4
      i32.const -64
      i32.sub
      local.set $4
      br $for-loop|2
     end
    end
    local.get $11
    i32.const -64
    i32.sub
    local.set $11
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/multiply/multiplyDenseSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  loop $for-loop|0
   local.get $1
   local.get $8
   i32.gt_s
   if
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $5
     local.get $7
     i32.gt_s
     if
      f64.const 0
      local.set $9
      i32.const 0
      local.set $4
      local.get $2
      local.get $2
      i32.const 2
      i32.rem_s
      i32.sub
      local.set $10
      loop $for-loop|2
       local.get $4
       local.get $10
       i32.lt_s
       if
        local.get $9
        local.get $0
        local.get $2
        local.get $8
        i32.mul
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $11
        f64.load
        local.get $3
        local.get $4
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.get $11
        f64.load offset=8
        local.get $3
        local.get $4
        i32.const 1
        i32.add
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $9
        local.get $4
        i32.const 2
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      loop $for-loop|3
       local.get $2
       local.get $4
       i32.gt_s
       if
        local.get $9
        local.get $0
        local.get $2
        local.get $8
        i32.mul
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $3
        local.get $4
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $9
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|3
       end
      end
      local.get $6
      local.get $5
      local.get $8
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $9
      f64.store
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/multiplyVector (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    f64.const 0
    local.set $7
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $2
     local.get $5
     i32.gt_s
     if
      local.get $7
      local.get $0
      local.get $2
      local.get $6
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $3
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.add
      local.set $7
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $4
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    local.get $7
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/transpose (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 32
    i32.add
    local.tee $4
    local.get $1
    local.get $1
    local.get $4
    i32.gt_s
    select
    local.set $8
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $2
     local.get $4
     i32.gt_s
     if
      local.get $4
      i32.const 32
      i32.add
      local.tee $5
      local.get $2
      local.get $2
      local.get $5
      i32.gt_s
      select
      local.set $9
      local.get $7
      local.set $5
      loop $for-loop|2
       local.get $5
       local.get $8
       i32.lt_s
       if
        local.get $4
        local.set $6
        loop $for-loop|3
         local.get $6
         local.get $9
         i32.lt_s
         if
          local.get $3
          local.get $1
          local.get $6
          i32.mul
          local.get $5
          i32.add
          i32.const 3
          i32.shl
          i32.add
          local.get $0
          local.get $2
          local.get $5
          i32.mul
          local.get $6
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.store
          local.get $6
          i32.const 1
          i32.add
          local.set $6
          br $for-loop|3
         end
        end
        local.get $5
        i32.const 1
        i32.add
        local.set $5
        br $for-loop|2
       end
      end
      local.get $4
      i32.const 32
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 32
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/add (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.add
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/subtract (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.sub
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/scalarMultiply (param $0 i32) (param $1 f64) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $1
    f64.mul
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/dotProduct (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $4
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.mul
    f64.add
    local.set $4
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $4
 )
 (func $src/wasm/matrix/multiply/multiplyBlockedSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 f64)
  (local $16 v128)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  (local $24 i32)
  local.get $1
  local.get $5
  i32.mul
  local.tee $10
  i32.const 1
  i32.sub
  local.set $8
  loop $for-loop|0
   local.get $8
   local.get $9
   i32.gt_s
   if
    local.get $6
    local.get $9
    i32.const 3
    i32.shl
    i32.add
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    v128.store
    local.get $9
    i32.const 2
    i32.add
    local.set $9
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $9
   local.get $10
   i32.lt_s
   if
    local.get $6
    local.get $9
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|1
   end
  end
  local.get $7
  if
   loop $for-loop|2
    local.get $4
    local.get $12
    i32.gt_s
    if
     i32.const 0
     local.set $8
     loop $for-loop|3
      local.get $5
      local.get $8
      i32.gt_s
      if
       local.get $7
       local.get $4
       local.get $8
       i32.mul
       local.get $12
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $3
       local.get $5
       local.get $12
       i32.mul
       local.get $8
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.store
       local.get $8
       i32.const 1
       i32.add
       local.set $8
       br $for-loop|3
      end
     end
     local.get $12
     i32.const 1
     i32.add
     local.set $12
     br $for-loop|2
    end
   end
  end
  local.get $7
  i32.const 0
  i32.ne
  local.set $20
  loop $for-loop|4
   local.get $1
   local.get $13
   i32.gt_s
   if
    local.get $13
    i32.const -64
    i32.sub
    local.tee $8
    local.get $1
    local.get $1
    local.get $8
    i32.gt_s
    select
    local.set $21
    i32.const 0
    local.set $12
    loop $for-loop|5
     local.get $5
     local.get $12
     i32.gt_s
     if
      local.get $12
      i32.const -64
      i32.sub
      local.tee $8
      local.get $5
      local.get $5
      local.get $8
      i32.gt_s
      select
      local.set $22
      i32.const 0
      local.set $11
      loop $for-loop|6
       local.get $2
       local.get $11
       i32.gt_s
       if
        local.get $11
        i32.const -64
        i32.sub
        local.tee $8
        local.get $2
        local.get $2
        local.get $8
        i32.gt_s
        select
        local.set $17
        local.get $13
        local.set $8
        loop $for-loop|7
         local.get $8
         local.get $21
         i32.lt_s
         if
          local.get $0
          local.get $2
          local.get $8
          i32.mul
          i32.const 3
          i32.shl
          i32.add
          local.set $18
          local.get $12
          local.set $9
          loop $for-loop|8
           local.get $9
           local.get $22
           i32.lt_s
           if
            v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
            local.set $16
            local.get $5
            local.get $8
            i32.mul
            local.get $9
            i32.add
            i32.const 3
            i32.shl
            local.tee $23
            local.get $6
            i32.add
            f64.load
            local.set $15
            local.get $11
            local.set $10
            local.get $20
            if
             local.get $17
             i32.const 1
             i32.sub
             local.set $14
             local.get $7
             local.get $4
             local.get $9
             i32.mul
             i32.const 3
             i32.shl
             i32.add
             local.set $19
             loop $for-loop|9
              local.get $10
              local.get $14
              i32.lt_s
              if
               local.get $16
               local.get $10
               i32.const 3
               i32.shl
               local.tee $24
               local.get $18
               i32.add
               v128.load
               local.get $19
               local.get $24
               i32.add
               v128.load
               f64x2.mul
               f64x2.add
               local.set $16
               local.get $10
               i32.const 2
               i32.add
               local.set $10
               br $for-loop|9
              end
             end
             local.get $15
             local.get $16
             f64x2.extract_lane 0
             local.get $16
             f64x2.extract_lane 1
             f64.add
             f64.add
             local.set $15
             loop $for-loop|10
              local.get $10
              local.get $17
              i32.lt_s
              if
               local.get $15
               local.get $10
               i32.const 3
               i32.shl
               local.tee $14
               local.get $18
               i32.add
               f64.load
               local.get $14
               local.get $19
               i32.add
               f64.load
               f64.mul
               f64.add
               local.set $15
               local.get $10
               i32.const 1
               i32.add
               local.set $10
               br $for-loop|10
              end
             end
            else
             loop $for-loop|11
              local.get $10
              local.get $17
              i32.lt_s
              if
               local.get $15
               local.get $18
               local.get $10
               i32.const 3
               i32.shl
               i32.add
               f64.load
               local.get $3
               local.get $5
               local.get $10
               i32.mul
               local.get $9
               i32.add
               i32.const 3
               i32.shl
               i32.add
               f64.load
               f64.mul
               f64.add
               local.set $15
               local.get $10
               i32.const 1
               i32.add
               local.set $10
               br $for-loop|11
              end
             end
            end
            local.get $6
            local.get $23
            i32.add
            local.get $15
            f64.store
            local.get $9
            i32.const 1
            i32.add
            local.set $9
            br $for-loop|8
           end
          end
          local.get $8
          i32.const 1
          i32.add
          local.set $8
          br $for-loop|7
         end
        end
        local.get $11
        i32.const -64
        i32.sub
        local.set $11
        br $for-loop|6
       end
      end
      local.get $12
      i32.const -64
      i32.sub
      local.set $12
      br $for-loop|5
     end
    end
    local.get $13
    i32.const -64
    i32.sub
    local.set $13
    br $for-loop|4
   end
  end
 )
 (func $src/wasm/matrix/multiply/addSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $2
  i32.const 1
  i32.sub
  local.set $6
  loop $for-loop|0
   local.get $4
   local.get $6
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    v128.load
    local.get $1
    local.get $5
    i32.add
    v128.load
    f64x2.add
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.add
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/multiply/subtractSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $2
  i32.const 1
  i32.sub
  local.set $6
  loop $for-loop|0
   local.get $4
   local.get $6
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    v128.load
    local.get $1
    local.get $5
    i32.add
    v128.load
    f64x2.sub
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.sub
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/multiply/scalarMultiplySIMD (param $0 i32) (param $1 f64) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 v128)
  (local $6 i32)
  (local $7 i32)
  local.get $1
  f64x2.splat
  local.set $5
  local.get $2
  i32.const 1
  i32.sub
  local.set $7
  loop $for-loop|0
   local.get $4
   local.get $7
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $3
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $5
    f64x2.mul
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $3
    i32.add
    local.get $0
    local.get $6
    i32.add
    f64.load
    local.get $1
    f64.mul
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/multiply/dotProductSIMD (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 v128)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  local.get $2
  i32.const 1
  i32.sub
  local.set $7
  loop $for-loop|0
   local.get $3
   local.get $7
   i32.lt_s
   if
    local.get $4
    local.get $3
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f64x2.mul
    f64x2.add
    local.set $4
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $4
  f64x2.extract_lane 0
  local.get $4
  f64x2.extract_lane 1
  f64.add
  local.set $5
  loop $for-loop|1
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $5
    local.get $3
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $6
    i32.add
    f64.load
    f64.mul
    f64.add
    local.set $5
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  local.get $5
 )
 (func $src/wasm/matrix/multiply/multiplyVectorSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 v128)
  (local $8 f64)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $6
    i32.mul
    i32.const 3
    i32.shl
    i32.add
    local.set $9
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.set $7
    i32.const 0
    local.set $5
    local.get $2
    i32.const 1
    i32.sub
    local.set $11
    loop $for-loop|1
     local.get $5
     local.get $11
     i32.lt_s
     if
      local.get $7
      local.get $5
      i32.const 3
      i32.shl
      local.tee $10
      local.get $9
      i32.add
      v128.load
      local.get $3
      local.get $10
      i32.add
      v128.load
      f64x2.mul
      f64x2.add
      local.set $7
      local.get $5
      i32.const 2
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $7
    f64x2.extract_lane 0
    local.get $7
    f64x2.extract_lane 1
    f64.add
    local.set $8
    loop $for-loop|2
     local.get $2
     local.get $5
     i32.gt_s
     if
      local.get $8
      local.get $5
      i32.const 3
      i32.shl
      local.tee $10
      local.get $9
      i32.add
      f64.load
      local.get $3
      local.get $10
      i32.add
      f64.load
      f64.mul
      f64.add
      local.set $8
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|2
     end
    end
    local.get $4
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    local.get $8
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/multiply/transposeSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 16
    i32.add
    local.tee $4
    local.get $1
    local.get $1
    local.get $4
    i32.gt_s
    select
    local.set $8
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $2
     local.get $4
     i32.gt_s
     if
      local.get $4
      i32.const 16
      i32.add
      local.tee $5
      local.get $2
      local.get $2
      local.get $5
      i32.gt_s
      select
      local.set $9
      local.get $7
      local.set $5
      loop $for-loop|2
       local.get $5
       local.get $8
       i32.lt_s
       if
        local.get $4
        local.set $6
        loop $for-loop|3
         local.get $6
         local.get $9
         i32.lt_s
         if
          local.get $3
          local.get $1
          local.get $6
          i32.mul
          local.get $5
          i32.add
          i32.const 3
          i32.shl
          i32.add
          local.get $0
          local.get $2
          local.get $5
          i32.mul
          local.get $6
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.store
          local.get $6
          i32.const 1
          i32.add
          local.set $6
          br $for-loop|3
         end
        end
        local.get $5
        i32.const 1
        i32.add
        local.set $5
        br $for-loop|2
       end
      end
      local.get $4
      i32.const 16
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 16
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/algebra/decomposition/abs (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.neg
  local.get $0
  f64.const 0
  f64.ge
  select
 )
 (func $src/wasm/algebra/decomposition/luDecomposition (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    local.get $3
    i32.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    call $src/wasm/algebra/decomposition/abs
    local.set $5
    local.get $4
    local.set $3
    local.get $4
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|2
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $7
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      call $src/wasm/algebra/decomposition/abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $3
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|2
     end
    end
    local.get $5
    f64.const 1e-14
    f64.lt
    if
     i32.const 1
     return
    end
    local.get $3
    local.get $4
    i32.ne
    if
     i32.const 0
     local.set $7
     loop $for-loop|00
      local.get $1
      local.get $7
      i32.gt_s
      if
       local.get $0
       local.get $1
       local.get $4
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $8
       f64.load
       local.set $5
       local.get $8
       local.get $0
       local.get $1
       local.get $3
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $8
       f64.load
       f64.store
       local.get $8
       local.get $5
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|00
      end
     end
     local.get $2
     local.get $4
     i32.const 2
     i32.shl
     i32.add
     local.tee $7
     i32.load
     local.set $8
     local.get $7
     local.get $2
     local.get $3
     i32.const 2
     i32.shl
     i32.add
     local.tee $3
     i32.load
     i32.store
     local.get $3
     local.get $8
     i32.store
    end
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $4
    i32.const 1
    i32.add
    local.set $3
    loop $for-loop|3
     local.get $1
     local.get $3
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $3
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.tee $7
      f64.load
      local.get $5
      f64.div
      local.set $6
      local.get $7
      local.get $6
      f64.store
      local.get $4
      i32.const 1
      i32.add
      local.set $7
      loop $for-loop|4
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $0
        local.get $1
        local.get $3
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $8
        local.get $8
        f64.load
        local.get $6
        local.get $0
        local.get $1
        local.get $4
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        f64.store
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|4
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|3
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  i32.const 0
 )
 (func $src/wasm/algebra/decomposition/sqrt (param $0 f64) (result f64)
  local.get $0
  f64.sqrt
 )
 (func $src/wasm/algebra/decomposition/qrDecomposition (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 f64)
  (local $9 i32)
  (local $10 f64)
  (local $11 i32)
  (local $12 i32)
  loop $for-loop|0
   local.get $1
   local.get $9
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $3
      local.get $1
      local.get $9
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $4
      local.get $9
      i32.eq
      select
      f64.store
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|0
   end
  end
  local.get $1
  local.get $2
  local.get $1
  local.get $2
  i32.lt_s
  select
  local.set $11
  loop $for-loop|2
   local.get $5
   local.get $11
   i32.lt_s
   if
    f64.const 0
    local.set $7
    local.get $5
    local.set $4
    loop $for-loop|3
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $7
      local.get $0
      local.get $2
      local.get $4
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $7
      local.get $7
      f64.mul
      f64.add
      local.set $7
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|3
     end
    end
    local.get $7
    f64.sqrt
    local.tee $8
    f64.const 1e-14
    f64.lt
    i32.eqz
    if
     local.get $0
     local.get $2
     local.get $5
     i32.mul
     local.get $5
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.tee $7
     f64.const 1
     f64.const -1
     local.get $7
     f64.const 0
     f64.ge
     select
     local.get $8
     f64.mul
     f64.add
     local.set $10
     f64.const 1
     local.set $7
     local.get $5
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|4
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $7
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.get $5
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $10
       f64.div
       local.tee $7
       local.get $7
       f64.mul
       f64.add
       local.set $7
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|4
      end
     end
     f64.const 2
     local.get $7
     f64.div
     local.set $8
     local.get $5
     local.set $4
     loop $for-loop|5
      local.get $2
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $7
       local.get $5
       i32.const 1
       i32.add
       local.set $9
       loop $for-loop|6
        local.get $1
        local.get $9
        i32.gt_s
        if
         local.get $7
         local.get $0
         local.get $2
         local.get $9
         i32.mul
         local.tee $6
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $10
         f64.div
         local.get $0
         local.get $4
         local.get $6
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.add
         local.set $7
         local.get $9
         i32.const 1
         i32.add
         local.set $9
         br $for-loop|6
        end
       end
       local.get $0
       local.get $2
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $6
       local.get $6
       f64.load
       local.get $8
       local.get $7
       f64.mul
       local.tee $7
       f64.sub
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $9
       loop $for-loop|7
        local.get $1
        local.get $9
        i32.gt_s
        if
         local.get $0
         local.get $2
         local.get $9
         i32.mul
         local.tee $12
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $6
         local.get $6
         f64.load
         local.get $7
         local.get $0
         local.get $5
         local.get $12
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $10
         f64.div
         f64.mul
         f64.sub
         f64.store
         local.get $9
         i32.const 1
         i32.add
         local.set $9
         br $for-loop|7
        end
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|5
      end
     end
     i32.const 0
     local.set $4
     loop $for-loop|8
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $7
       local.get $5
       i32.const 1
       i32.add
       local.set $9
       loop $for-loop|9
        local.get $1
        local.get $9
        i32.gt_s
        if
         local.get $7
         local.get $0
         local.get $2
         local.get $9
         i32.mul
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $10
         f64.div
         local.get $3
         local.get $1
         local.get $9
         i32.mul
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.add
         local.set $7
         local.get $9
         i32.const 1
         i32.add
         local.set $9
         br $for-loop|9
        end
       end
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $6
       local.get $6
       f64.load
       local.get $8
       local.get $7
       f64.mul
       local.tee $7
       f64.sub
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $9
       loop $for-loop|10
        local.get $1
        local.get $9
        i32.gt_s
        if
         local.get $3
         local.get $1
         local.get $9
         i32.mul
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $6
         local.get $6
         f64.load
         local.get $7
         local.get $0
         local.get $2
         local.get $9
         i32.mul
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $10
         f64.div
         f64.mul
         f64.sub
         f64.store
         local.get $9
         i32.const 1
         i32.add
         local.set $9
         br $for-loop|10
        end
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|8
      end
     end
     local.get $5
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|11
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.get $5
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 0
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|11
      end
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/algebra/decomposition/choleskyDecomposition (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  loop $for-loop|0
   local.get $3
   local.get $1
   local.get $1
   i32.mul
   i32.lt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $4
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|2
     local.get $3
     local.get $4
     i32.le_s
     if
      local.get $0
      local.get $1
      local.get $4
      i32.mul
      local.get $3
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $5
      i32.const 0
      local.set $6
      loop $for-loop|3
       local.get $3
       local.get $6
       i32.gt_s
       if
        local.get $5
        local.get $2
        local.get $1
        local.get $4
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $2
        local.get $1
        local.get $3
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        local.set $5
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|3
       end
      end
      local.get $3
      local.get $4
      i32.eq
      if
       local.get $5
       f64.const 0
       f64.le
       if
        i32.const 1
        return
       end
       local.get $2
       local.get $1
       local.get $4
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $5
       f64.sqrt
       f64.store
      else
       local.get $2
       local.get $1
       local.get $4
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $5
       local.get $2
       local.get $1
       local.get $3
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.div
       f64.store
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|2
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  i32.const 0
 )
 (func $src/wasm/algebra/decomposition/luSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $3
    local.get $2
    local.get $6
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $6
     local.get $7
     i32.gt_s
     if
      local.get $5
      local.get $0
      local.get $1
      local.get $6
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $4
      local.get $7
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.sub
      local.set $5
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $4
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    local.get $5
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  local.get $1
  i32.const 1
  i32.sub
  local.set $2
  loop $for-loop|2
   local.get $2
   i32.const 0
   i32.ge_s
   if
    local.get $4
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $2
    i32.const 1
    i32.add
    local.set $3
    loop $for-loop|3
     local.get $1
     local.get $3
     i32.gt_s
     if
      local.get $5
      local.get $0
      local.get $1
      local.get $2
      i32.mul
      local.get $3
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $4
      local.get $3
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.sub
      local.set $5
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|3
     end
    end
    local.get $4
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    local.get $5
    local.get $0
    local.get $1
    local.get $2
    i32.mul
    local.get $2
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.div
    f64.store
    local.get $2
    i32.const 1
    i32.sub
    local.set $2
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/algebra/decomposition/luDeterminant (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  f64.const 1
  local.set $3
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.mul
    local.set $3
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $5
   i32.gt_s
   if
    local.get $6
    i32.const 1
    i32.add
    local.get $6
    local.get $2
    local.get $5
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.get $5
    i32.ne
    select
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
  local.get $3
  f64.neg
  local.get $3
  local.get $6
  i32.const 1
  i32.and
  select
 )
 (func $src/wasm/algebra/decomposition/swapRowsSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 v128)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  local.get $0
  local.get $1
  local.get $2
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  local.set $2
  local.get $0
  local.get $1
  local.get $3
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  local.set $3
  local.get $1
  i32.const 1
  i32.sub
  local.set $7
  loop $for-loop|0
   local.get $4
   local.get $7
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $8
    local.get $2
    i32.add
    local.tee $0
    v128.load
    local.set $5
    local.get $0
    local.get $3
    local.get $8
    i32.add
    local.tee $0
    v128.load
    v128.store
    local.get $0
    local.get $5
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $0
    local.get $2
    i32.add
    local.tee $7
    f64.load
    local.set $6
    local.get $7
    local.get $0
    local.get $3
    i32.add
    local.tee $0
    f64.load
    f64.store
    local.get $0
    local.get $6
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/algebra/decomposition/luDecompositionSIMD (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 v128)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    local.get $3
    i32.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    call $src/wasm/algebra/decomposition/abs
    local.set $5
    local.get $4
    local.tee $3
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|2
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $7
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      call $src/wasm/algebra/decomposition/abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $3
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|2
     end
    end
    local.get $5
    f64.const 1e-14
    f64.lt
    if
     i32.const 1
     return
    end
    local.get $3
    local.get $4
    i32.ne
    if
     local.get $0
     local.get $1
     local.get $4
     local.get $3
     call $src/wasm/algebra/decomposition/swapRowsSIMD
     local.get $2
     local.get $4
     i32.const 2
     i32.shl
     i32.add
     local.tee $7
     i32.load
     local.set $8
     local.get $7
     local.get $2
     local.get $3
     i32.const 2
     i32.shl
     i32.add
     local.tee $3
     i32.load
     i32.store
     local.get $3
     local.get $8
     i32.store
    end
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $4
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|3
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $7
      i32.mul
      local.tee $3
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.tee $8
      f64.load
      local.get $5
      f64.div
      local.set $6
      local.get $8
      local.get $6
      f64.store
      local.get $0
      local.get $3
      i32.const 3
      i32.shl
      i32.add
      local.set $13
      local.get $0
      local.get $1
      local.get $4
      i32.mul
      i32.const 3
      i32.shl
      i32.add
      local.set $8
      local.get $6
      f64x2.splat
      local.set $9
      local.get $4
      i32.const 1
      i32.add
      local.set $3
      local.get $1
      i32.const 1
      i32.sub
      local.set $10
      loop $for-loop|4
       local.get $3
       local.get $10
       i32.lt_s
       if
        local.get $13
        local.get $3
        i32.const 3
        i32.shl
        local.tee $12
        i32.add
        local.tee $11
        local.get $11
        v128.load
        local.get $9
        local.get $8
        local.get $12
        i32.add
        v128.load
        f64x2.mul
        f64x2.sub
        v128.store
        local.get $3
        i32.const 2
        i32.add
        local.set $3
        br $for-loop|4
       end
      end
      loop $for-loop|5
       local.get $1
       local.get $3
       i32.gt_s
       if
        local.get $0
        local.get $1
        local.get $7
        i32.mul
        local.get $3
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $8
        local.get $8
        f64.load
        local.get $6
        local.get $0
        local.get $1
        local.get $4
        i32.mul
        local.get $3
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        f64.store
        local.get $3
        i32.const 1
        i32.add
        local.set $3
        br $for-loop|5
       end
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  i32.const 0
 )
 (func $src/wasm/algebra/decomposition/qrDecompositionSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 f64)
  (local $9 v128)
  (local $10 i32)
  (local $11 f64)
  (local $12 i32)
  (local $13 i32)
  loop $for-loop|0
   local.get $1
   local.get $10
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $3
      local.get $1
      local.get $10
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $4
      local.get $10
      i32.eq
      select
      f64.store
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|0
   end
  end
  local.get $1
  local.get $2
  local.get $1
  local.get $2
  i32.lt_s
  select
  local.set $12
  loop $for-loop|2
   local.get $5
   local.get $12
   i32.lt_s
   if
    local.get $5
    local.set $4
    local.get $1
    i32.const 1
    i32.sub
    local.set $6
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.set $9
    loop $for-loop|3
     local.get $4
     local.get $6
     i32.lt_s
     if
      local.get $9
      v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
      local.get $0
      local.get $2
      local.get $4
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64x2.replace_lane 0
      local.get $0
      local.get $4
      i32.const 1
      i32.add
      local.get $2
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64x2.replace_lane 1
      local.tee $9
      local.get $9
      f64x2.mul
      f64x2.add
      local.set $9
      local.get $4
      i32.const 2
      i32.add
      local.set $4
      br $for-loop|3
     end
    end
    local.get $9
    f64x2.extract_lane 0
    local.get $9
    f64x2.extract_lane 1
    f64.add
    local.set $7
    loop $for-loop|4
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $7
      local.get $0
      local.get $2
      local.get $4
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $7
      local.get $7
      f64.mul
      f64.add
      local.set $7
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|4
     end
    end
    local.get $7
    f64.sqrt
    local.tee $8
    f64.const 1e-14
    f64.lt
    i32.eqz
    if
     local.get $0
     local.get $2
     local.get $5
     i32.mul
     local.get $5
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.tee $7
     f64.const 1
     f64.const -1
     local.get $7
     f64.const 0
     f64.ge
     select
     local.get $8
     f64.mul
     f64.add
     local.set $11
     f64.const 1
     local.set $7
     local.get $5
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|5
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $7
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.get $5
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $11
       f64.div
       local.tee $7
       local.get $7
       f64.mul
       f64.add
       local.set $7
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|5
      end
     end
     f64.const 2
     local.get $7
     f64.div
     local.set $8
     local.get $5
     local.set $4
     loop $for-loop|6
      local.get $2
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $7
       local.get $5
       i32.const 1
       i32.add
       local.set $10
       loop $for-loop|7
        local.get $1
        local.get $10
        i32.gt_s
        if
         local.get $7
         local.get $0
         local.get $2
         local.get $10
         i32.mul
         local.tee $6
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $11
         f64.div
         local.get $0
         local.get $4
         local.get $6
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.add
         local.set $7
         local.get $10
         i32.const 1
         i32.add
         local.set $10
         br $for-loop|7
        end
       end
       local.get $0
       local.get $2
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $6
       local.get $6
       f64.load
       local.get $8
       local.get $7
       f64.mul
       local.tee $7
       f64.sub
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $10
       loop $for-loop|8
        local.get $1
        local.get $10
        i32.gt_s
        if
         local.get $0
         local.get $2
         local.get $10
         i32.mul
         local.tee $13
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $6
         local.get $6
         f64.load
         local.get $7
         local.get $0
         local.get $5
         local.get $13
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $11
         f64.div
         f64.mul
         f64.sub
         f64.store
         local.get $10
         i32.const 1
         i32.add
         local.set $10
         br $for-loop|8
        end
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|6
      end
     end
     i32.const 0
     local.set $4
     loop $for-loop|9
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $7
       local.get $5
       i32.const 1
       i32.add
       local.set $10
       loop $for-loop|10
        local.get $1
        local.get $10
        i32.gt_s
        if
         local.get $7
         local.get $0
         local.get $2
         local.get $10
         i32.mul
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $11
         f64.div
         local.get $3
         local.get $1
         local.get $10
         i32.mul
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.add
         local.set $7
         local.get $10
         i32.const 1
         i32.add
         local.set $10
         br $for-loop|10
        end
       end
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $6
       local.get $6
       f64.load
       local.get $8
       local.get $7
       f64.mul
       local.tee $7
       f64.sub
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $10
       loop $for-loop|11
        local.get $1
        local.get $10
        i32.gt_s
        if
         local.get $3
         local.get $1
         local.get $10
         i32.mul
         local.get $4
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $6
         local.get $6
         f64.load
         local.get $7
         local.get $0
         local.get $2
         local.get $10
         i32.mul
         local.get $5
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $11
         f64.div
         f64.mul
         f64.sub
         f64.store
         local.get $10
         i32.const 1
         i32.add
         local.set $10
         br $for-loop|11
        end
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|9
      end
     end
     local.get $5
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|12
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.get $5
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 0
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|12
      end
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/algebra/decomposition/choleskyDecompositionSIMD (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  (local $7 v128)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  loop $for-loop|0
   local.get $3
   local.get $1
   local.get $1
   i32.mul
   i32.lt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $5
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|2
     local.get $3
     local.get $5
     i32.le_s
     if
      local.get $0
      local.get $1
      local.get $5
      i32.mul
      local.tee $4
      local.get $3
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $2
      local.get $4
      i32.const 3
      i32.shl
      i32.add
      local.set $8
      local.get $2
      local.get $1
      local.get $3
      i32.mul
      i32.const 3
      i32.shl
      i32.add
      local.set $9
      i32.const 0
      local.set $4
      local.get $3
      i32.const 1
      i32.sub
      local.set $10
      v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
      local.set $7
      loop $for-loop|3
       local.get $4
       local.get $10
       i32.lt_s
       if
        local.get $7
        local.get $8
        local.get $4
        i32.const 3
        i32.shl
        local.tee $11
        i32.add
        v128.load
        local.get $9
        local.get $11
        i32.add
        v128.load
        f64x2.mul
        f64x2.add
        local.set $7
        local.get $4
        i32.const 2
        i32.add
        local.set $4
        br $for-loop|3
       end
      end
      local.get $7
      f64x2.extract_lane 0
      local.get $7
      f64x2.extract_lane 1
      f64.add
      f64.sub
      local.set $6
      loop $for-loop|4
       local.get $3
       local.get $4
       i32.gt_s
       if
        local.get $6
        local.get $2
        local.get $1
        local.get $5
        i32.mul
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $2
        local.get $1
        local.get $3
        i32.mul
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        local.set $6
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|4
       end
      end
      local.get $3
      local.get $5
      i32.eq
      if
       local.get $6
       f64.const 0
       f64.le
       if
        i32.const 1
        return
       end
       local.get $2
       local.get $1
       local.get $5
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $6
       f64.sqrt
       f64.store
      else
       local.get $2
       local.get $1
       local.get $5
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $6
       local.get $2
       local.get $1
       local.get $3
       i32.mul
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.div
       f64.store
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|2
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
  i32.const 0
 )
 (func $src/wasm/signal/fft/bitReverse (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  loop $for-loop|0
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $3
    local.get $4
    i32.gt_s
    if
     local.get $0
     local.get $4
     i32.const 4
     i32.shl
     i32.add
     local.tee $2
     f64.load
     local.set $5
     local.get $2
     local.get $0
     local.get $3
     i32.const 4
     i32.shl
     i32.add
     local.tee $6
     f64.load
     f64.store
     local.get $6
     local.get $5
     f64.store
     local.get $2
     f64.load offset=8
     local.set $5
     local.get $2
     local.get $6
     f64.load offset=8
     f64.store offset=8
     local.get $6
     local.get $5
     f64.store offset=8
    end
    local.get $1
    i32.const 1
    i32.shr_s
    local.set $2
    loop $while-continue|1
     local.get $2
     local.get $3
     i32.le_s
     if
      local.get $3
      local.get $2
      i32.sub
      local.set $3
      local.get $2
      i32.const 1
      i32.shr_s
      local.set $2
      br $while-continue|1
     end
    end
    local.get $2
    local.get $3
    i32.add
    local.set $3
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $~lib/math/pio2_large_quot (param $0 i64) (result i32)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (local $4 i32)
  (local $5 f64)
  (local $6 i64)
  (local $7 i64)
  (local $8 i64)
  (local $9 i64)
  (local $10 i64)
  (local $11 i64)
  (local $12 i64)
  local.get $0
  i64.const 9223372036854775807
  i64.and
  i64.const 52
  i64.shr_u
  i64.const 1045
  i64.sub
  local.tee $1
  i64.const 63
  i64.and
  local.set $6
  local.get $1
  i64.const 6
  i64.shr_s
  i32.wrap_i64
  i32.const 3
  i32.shl
  i32.const 1024
  i32.add
  local.tee $4
  i64.load
  local.set $3
  local.get $4
  i64.load offset=8
  local.set $2
  local.get $4
  i64.load offset=16
  local.set $1
  local.get $6
  i64.const 0
  i64.ne
  if
   local.get $3
   local.get $6
   i64.shl
   local.get $2
   i64.const 64
   local.get $6
   i64.sub
   local.tee $7
   i64.shr_u
   i64.or
   local.set $3
   local.get $2
   local.get $6
   i64.shl
   local.get $1
   local.get $7
   i64.shr_u
   i64.or
   local.set $2
   local.get $1
   local.get $6
   i64.shl
   local.get $4
   i64.load offset=24
   local.get $7
   i64.shr_u
   i64.or
   local.set $1
  end
  local.get $0
  i64.const 4503599627370495
  i64.and
  i64.const 4503599627370496
  i64.or
  local.tee $6
  i64.const 4294967295
  i64.and
  local.set $7
  local.get $6
  i64.const 32
  i64.shr_u
  local.tee $8
  local.get $2
  i64.const 4294967295
  i64.and
  local.tee $9
  i64.mul
  local.get $2
  i64.const 32
  i64.shr_u
  local.tee $2
  local.get $7
  i64.mul
  local.get $7
  local.get $9
  i64.mul
  local.tee $7
  i64.const 32
  i64.shr_u
  i64.add
  local.tee $9
  i64.const 4294967295
  i64.and
  i64.add
  local.set $10
  local.get $2
  local.get $8
  i64.mul
  local.get $9
  i64.const 32
  i64.shr_u
  i64.add
  local.get $10
  i64.const 32
  i64.shr_u
  i64.add
  global.set $~lib/math/res128_hi
  local.get $8
  local.get $1
  i64.const 32
  i64.shr_u
  i64.mul
  local.tee $1
  local.get $7
  i64.const 4294967295
  i64.and
  local.get $10
  i64.const 32
  i64.shl
  i64.add
  i64.add
  local.tee $2
  local.get $1
  i64.lt_u
  i64.extend_i32_u
  global.get $~lib/math/res128_hi
  local.get $3
  local.get $6
  i64.mul
  i64.add
  i64.add
  local.tee $3
  i64.const 2
  i64.shl
  local.get $2
  i64.const 62
  i64.shr_u
  i64.or
  local.tee $6
  i64.const 63
  i64.shr_s
  local.tee $7
  local.get $2
  i64.const 2
  i64.shl
  i64.xor
  local.set $8
  local.get $6
  local.get $7
  i64.const 1
  i64.shr_s
  i64.xor
  local.tee $1
  i64.clz
  local.set $9
  local.get $1
  local.get $9
  i64.shl
  local.get $8
  i64.const 64
  local.get $9
  i64.sub
  i64.shr_u
  i64.or
  local.tee $10
  i64.const 4294967295
  i64.and
  local.set $2
  local.get $10
  i64.const 32
  i64.shr_u
  local.tee $1
  i64.const 560513588
  i64.mul
  local.get $2
  i64.const 3373259426
  i64.mul
  local.get $2
  i64.const 560513588
  i64.mul
  local.tee $11
  i64.const 32
  i64.shr_u
  i64.add
  local.tee $2
  i64.const 4294967295
  i64.and
  i64.add
  local.set $12
  local.get $1
  i64.const 3373259426
  i64.mul
  local.get $2
  i64.const 32
  i64.shr_u
  i64.add
  local.get $12
  i64.const 32
  i64.shr_u
  i64.add
  global.set $~lib/math/res128_hi
  local.get $10
  f64.convert_i64_u
  f64.const 3.753184150245214e-04
  f64.mul
  local.get $8
  local.get $9
  i64.shl
  f64.convert_i64_u
  f64.const 3.834951969714103e-04
  f64.mul
  f64.add
  i64.trunc_sat_f64_u
  local.tee $1
  local.get $11
  i64.const 4294967295
  i64.and
  local.get $12
  i64.const 32
  i64.shl
  i64.add
  local.tee $2
  i64.gt_u
  i64.extend_i32_u
  global.get $~lib/math/res128_hi
  local.tee $8
  i64.const 11
  i64.shr_u
  i64.add
  f64.convert_i64_u
  global.set $~lib/math/rempio2_y0
  local.get $8
  i64.const 53
  i64.shl
  local.get $2
  i64.const 11
  i64.shr_u
  i64.or
  local.get $1
  i64.add
  f64.convert_i64_u
  f64.const 5.421010862427522e-20
  f64.mul
  global.set $~lib/math/rempio2_y1
  global.get $~lib/math/rempio2_y0
  i64.const 4372995238176751616
  local.get $9
  i64.const 52
  i64.shl
  i64.sub
  local.get $0
  local.get $6
  i64.xor
  i64.const -9223372036854775808
  i64.and
  i64.or
  f64.reinterpret_i64
  local.tee $5
  f64.mul
  global.set $~lib/math/rempio2_y0
  global.get $~lib/math/rempio2_y1
  local.get $5
  f64.mul
  global.set $~lib/math/rempio2_y1
  local.get $3
  i64.const 62
  i64.shr_s
  local.get $7
  i64.sub
  i32.wrap_i64
 )
 (func $~lib/math/NativeMath.cos (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 i64)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  local.get $0
  i64.reinterpret_f64
  local.tee $4
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $3
  i32.const 31
  i32.shr_u
  local.set $5
  local.get $3
  i32.const 2147483647
  i32.and
  local.tee $3
  i32.const 1072243195
  i32.le_u
  if
   local.get $3
   i32.const 1044816030
   i32.lt_u
   if
    f64.const 1
    return
   end
   local.get $0
   local.get $0
   f64.mul
   local.tee $1
   local.get $1
   f64.mul
   local.set $2
   f64.const 1
   local.get $1
   f64.const 0.5
   f64.mul
   local.tee $6
   f64.sub
   local.tee $7
   f64.const 1
   local.get $7
   f64.sub
   local.get $6
   f64.sub
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 2.480158728947673e-05
   f64.mul
   f64.const -0.001388888888887411
   f64.add
   f64.mul
   f64.const 0.0416666666666666
   f64.add
   f64.mul
   local.get $2
   local.get $2
   f64.mul
   local.get $1
   local.get $1
   f64.const -1.1359647557788195e-11
   f64.mul
   f64.const 2.087572321298175e-09
   f64.add
   f64.mul
   f64.const -2.7557314351390663e-07
   f64.add
   f64.mul
   f64.add
   f64.mul
   local.get $0
   f64.const 0
   f64.mul
   f64.sub
   f64.add
   f64.add
   return
  end
  local.get $3
  i32.const 2146435072
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.sub
   return
  end
  block $~lib/math/rempio2|inlined.0 (result i32)
   local.get $4
   i64.const 32
   i64.shr_u
   i32.wrap_i64
   i32.const 2147483647
   i32.and
   local.tee $3
   i32.const 1094263291
   i32.lt_u
   if
    local.get $3
    i32.const 20
    i32.shr_u
    local.tee $3
    local.get $0
    local.get $0
    f64.const 0.6366197723675814
    f64.mul
    f64.nearest
    local.tee $6
    f64.const 1.5707963267341256
    f64.mul
    f64.sub
    local.tee $0
    local.get $6
    f64.const 6.077100506506192e-11
    f64.mul
    local.tee $2
    f64.sub
    local.tee $1
    i64.reinterpret_f64
    i64.const 32
    i64.shr_u
    i32.wrap_i64
    i32.const 20
    i32.shr_u
    i32.const 2047
    i32.and
    i32.sub
    i32.const 16
    i32.gt_u
    if
     local.get $6
     f64.const 2.0222662487959506e-21
     f64.mul
     local.get $0
     local.get $0
     local.get $6
     f64.const 6.077100506303966e-11
     f64.mul
     local.tee $1
     f64.sub
     local.tee $0
     f64.sub
     local.get $1
     f64.sub
     f64.sub
     local.set $2
     local.get $3
     local.get $0
     local.get $2
     f64.sub
     local.tee $1
     i64.reinterpret_f64
     i64.const 32
     i64.shr_u
     i32.wrap_i64
     i32.const 20
     i32.shr_u
     i32.const 2047
     i32.and
     i32.sub
     i32.const 49
     i32.gt_u
     if
      local.get $6
      f64.const 8.4784276603689e-32
      f64.mul
      local.get $0
      local.get $0
      local.get $6
      f64.const 2.0222662487111665e-21
      f64.mul
      local.tee $1
      f64.sub
      local.tee $0
      f64.sub
      local.get $1
      f64.sub
      f64.sub
      local.set $2
      local.get $0
      local.get $2
      f64.sub
      local.set $1
     end
    end
    local.get $1
    global.set $~lib/math/rempio2_y0
    local.get $0
    local.get $1
    f64.sub
    local.get $2
    f64.sub
    global.set $~lib/math/rempio2_y1
    local.get $6
    i32.trunc_sat_f64_s
    br $~lib/math/rempio2|inlined.0
   end
   i32.const 0
   local.get $4
   call $~lib/math/pio2_large_quot
   local.tee $3
   i32.sub
   local.get $3
   local.get $5
   select
  end
  local.set $3
  global.get $~lib/math/rempio2_y0
  local.set $1
  global.get $~lib/math/rempio2_y1
  local.set $2
  local.get $3
  i32.const 1
  i32.and
  if (result f64)
   local.get $1
   local.get $1
   f64.mul
   local.tee $0
   local.get $1
   f64.mul
   local.set $6
   local.get $1
   local.get $0
   local.get $2
   f64.const 0.5
   f64.mul
   local.get $6
   local.get $0
   local.get $0
   f64.const 2.7557313707070068e-06
   f64.mul
   f64.const -1.984126982985795e-04
   f64.add
   f64.mul
   f64.const 0.00833333333332249
   f64.add
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   f64.mul
   local.get $0
   f64.const 1.58969099521155e-10
   f64.mul
   f64.const -2.5050760253406863e-08
   f64.add
   f64.mul
   f64.add
   f64.mul
   f64.sub
   f64.mul
   local.get $2
   f64.sub
   local.get $6
   f64.const -0.16666666666666632
   f64.mul
   f64.sub
   f64.sub
  else
   local.get $1
   local.get $1
   f64.mul
   local.tee $6
   local.get $6
   f64.mul
   local.set $7
   f64.const 1
   local.get $6
   f64.const 0.5
   f64.mul
   local.tee $0
   f64.sub
   local.tee $8
   f64.const 1
   local.get $8
   f64.sub
   local.get $0
   f64.sub
   local.get $6
   local.get $6
   local.get $6
   local.get $6
   f64.const 2.480158728947673e-05
   f64.mul
   f64.const -0.001388888888887411
   f64.add
   f64.mul
   f64.const 0.0416666666666666
   f64.add
   f64.mul
   local.get $7
   local.get $7
   f64.mul
   local.get $6
   local.get $6
   f64.const -1.1359647557788195e-11
   f64.mul
   f64.const 2.087572321298175e-09
   f64.add
   f64.mul
   f64.const -2.7557314351390663e-07
   f64.add
   f64.mul
   f64.add
   f64.mul
   local.get $1
   local.get $2
   f64.mul
   f64.sub
   f64.add
   f64.add
  end
  local.tee $0
  f64.neg
  local.get $0
  local.get $3
  i32.const 1
  i32.add
  i32.const 2
  i32.and
  select
 )
 (func $~lib/math/NativeMath.sin (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 i64)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  local.get $0
  i64.reinterpret_f64
  local.tee $4
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $3
  i32.const 31
  i32.shr_u
  local.set $5
  local.get $3
  i32.const 2147483647
  i32.and
  local.tee $3
  i32.const 1072243195
  i32.le_u
  if
   local.get $3
   i32.const 1045430272
   i32.lt_u
   if
    local.get $0
    return
   end
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   local.tee $1
   local.get $0
   f64.mul
   local.get $1
   local.get $1
   local.get $1
   f64.const 2.7557313707070068e-06
   f64.mul
   f64.const -1.984126982985795e-04
   f64.add
   f64.mul
   f64.const 0.00833333333332249
   f64.add
   local.get $1
   local.get $1
   local.get $1
   f64.mul
   f64.mul
   local.get $1
   f64.const 1.58969099521155e-10
   f64.mul
   f64.const -2.5050760253406863e-08
   f64.add
   f64.mul
   f64.add
   f64.mul
   f64.const -0.16666666666666632
   f64.add
   f64.mul
   f64.add
   return
  end
  local.get $3
  i32.const 2146435072
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.sub
   return
  end
  block $~lib/math/rempio2|inlined.1 (result i32)
   local.get $4
   i64.const 32
   i64.shr_u
   i32.wrap_i64
   i32.const 2147483647
   i32.and
   local.tee $3
   i32.const 1094263291
   i32.lt_u
   if
    local.get $3
    i32.const 20
    i32.shr_u
    local.tee $3
    local.get $0
    local.get $0
    f64.const 0.6366197723675814
    f64.mul
    f64.nearest
    local.tee $6
    f64.const 1.5707963267341256
    f64.mul
    f64.sub
    local.tee $0
    local.get $6
    f64.const 6.077100506506192e-11
    f64.mul
    local.tee $2
    f64.sub
    local.tee $1
    i64.reinterpret_f64
    i64.const 32
    i64.shr_u
    i32.wrap_i64
    i32.const 20
    i32.shr_u
    i32.const 2047
    i32.and
    i32.sub
    i32.const 16
    i32.gt_u
    if
     local.get $6
     f64.const 2.0222662487959506e-21
     f64.mul
     local.get $0
     local.get $0
     local.get $6
     f64.const 6.077100506303966e-11
     f64.mul
     local.tee $1
     f64.sub
     local.tee $0
     f64.sub
     local.get $1
     f64.sub
     f64.sub
     local.set $2
     local.get $3
     local.get $0
     local.get $2
     f64.sub
     local.tee $1
     i64.reinterpret_f64
     i64.const 32
     i64.shr_u
     i32.wrap_i64
     i32.const 20
     i32.shr_u
     i32.const 2047
     i32.and
     i32.sub
     i32.const 49
     i32.gt_u
     if
      local.get $6
      f64.const 8.4784276603689e-32
      f64.mul
      local.get $0
      local.get $0
      local.get $6
      f64.const 2.0222662487111665e-21
      f64.mul
      local.tee $1
      f64.sub
      local.tee $0
      f64.sub
      local.get $1
      f64.sub
      f64.sub
      local.set $2
      local.get $0
      local.get $2
      f64.sub
      local.set $1
     end
    end
    local.get $1
    global.set $~lib/math/rempio2_y0
    local.get $0
    local.get $1
    f64.sub
    local.get $2
    f64.sub
    global.set $~lib/math/rempio2_y1
    local.get $6
    i32.trunc_sat_f64_s
    br $~lib/math/rempio2|inlined.1
   end
   i32.const 0
   local.get $4
   call $~lib/math/pio2_large_quot
   local.tee $3
   i32.sub
   local.get $3
   local.get $5
   select
  end
  local.set $3
  global.get $~lib/math/rempio2_y0
  local.set $2
  global.get $~lib/math/rempio2_y1
  local.set $6
  local.get $3
  i32.const 1
  i32.and
  if (result f64)
   local.get $2
   local.get $2
   f64.mul
   local.tee $0
   local.get $0
   f64.mul
   local.set $1
   f64.const 1
   local.get $0
   f64.const 0.5
   f64.mul
   local.tee $7
   f64.sub
   local.tee $8
   f64.const 1
   local.get $8
   f64.sub
   local.get $7
   f64.sub
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const 2.480158728947673e-05
   f64.mul
   f64.const -0.001388888888887411
   f64.add
   f64.mul
   f64.const 0.0416666666666666
   f64.add
   f64.mul
   local.get $1
   local.get $1
   f64.mul
   local.get $0
   local.get $0
   f64.const -1.1359647557788195e-11
   f64.mul
   f64.const 2.087572321298175e-09
   f64.add
   f64.mul
   f64.const -2.7557314351390663e-07
   f64.add
   f64.mul
   f64.add
   f64.mul
   local.get $2
   local.get $6
   f64.mul
   f64.sub
   f64.add
   f64.add
  else
   local.get $2
   local.get $2
   f64.mul
   local.tee $0
   local.get $2
   f64.mul
   local.set $1
   local.get $2
   local.get $0
   local.get $6
   f64.const 0.5
   f64.mul
   local.get $1
   local.get $0
   local.get $0
   f64.const 2.7557313707070068e-06
   f64.mul
   f64.const -1.984126982985795e-04
   f64.add
   f64.mul
   f64.const 0.00833333333332249
   f64.add
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   f64.mul
   local.get $0
   f64.const 1.58969099521155e-10
   f64.mul
   f64.const -2.5050760253406863e-08
   f64.add
   f64.mul
   f64.add
   f64.mul
   f64.sub
   f64.mul
   local.get $6
   f64.sub
   local.get $1
   f64.const -0.16666666666666632
   f64.mul
   f64.sub
   f64.sub
  end
  local.tee $0
  f64.neg
  local.get $0
  local.get $3
  i32.const 2
  i32.and
  select
 )
 (func $src/wasm/signal/fft/fft (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 i32)
  local.get $0
  local.get $1
  call $src/wasm/signal/fft/bitReverse
  i32.const 2
  local.set $3
  loop $while-continue|0
   local.get $1
   local.get $3
   i32.ge_s
   if
    local.get $3
    i32.const 1
    i32.shr_s
    local.set $8
    f64.const 6.283185307179586
    f64.const -6.283185307179586
    local.get $2
    select
    local.get $3
    f64.convert_i32_s
    f64.div
    local.set $11
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $1
     local.get $5
     i32.gt_s
     if
      f64.const 0
      local.set $4
      i32.const 0
      local.set $6
      loop $for-loop|2
       local.get $6
       local.get $8
       i32.lt_s
       if
        local.get $4
        call $~lib/math/NativeMath.cos
        local.set $15
        local.get $4
        call $~lib/math/NativeMath.sin
        local.set $16
        local.get $5
        local.get $6
        i32.add
        local.tee $17
        i32.const 4
        i32.shl
        local.get $0
        i32.add
        local.tee $7
        f64.load
        local.set $9
        local.get $7
        f64.load offset=8
        local.set $10
        local.get $7
        local.get $9
        local.get $8
        local.get $17
        i32.add
        i32.const 4
        i32.shl
        local.get $0
        i32.add
        local.tee $17
        f64.load
        local.tee $12
        local.get $15
        f64.mul
        local.get $17
        f64.load offset=8
        local.tee $13
        local.get $16
        f64.mul
        f64.sub
        local.tee $14
        f64.add
        f64.store
        local.get $7
        local.get $10
        local.get $12
        local.get $16
        f64.mul
        local.get $13
        local.get $15
        f64.mul
        f64.add
        local.tee $12
        f64.add
        f64.store offset=8
        local.get $17
        local.get $9
        local.get $14
        f64.sub
        f64.store
        local.get $17
        local.get $10
        local.get $12
        f64.sub
        f64.store offset=8
        local.get $4
        local.get $11
        f64.add
        local.set $4
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|2
       end
      end
      local.get $3
      local.get $5
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.shl
    local.set $3
    br $while-continue|0
   end
  end
  local.get $2
  if
   f64.const 1
   local.get $1
   f64.convert_i32_s
   f64.div
   local.set $4
   local.get $1
   i32.const 1
   i32.shl
   local.set $2
   i32.const 0
   local.set $1
   loop $for-loop|3
    local.get $1
    local.get $2
    i32.lt_s
    if
     local.get $1
     i32.const 3
     i32.shl
     local.get $0
     i32.add
     local.tee $3
     local.get $3
     f64.load
     local.get $4
     f64.mul
     f64.store
     local.get $1
     i32.const 1
     i32.add
     local.set $1
     br $for-loop|3
    end
   end
  end
 )
 (func $src/wasm/signal/fft/fft2d (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $2
    local.get $6
    i32.mul
    i32.const 4
    i32.shl
    local.set $8
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $2
     local.get $5
     i32.gt_s
     if
      local.get $5
      i32.const 4
      i32.shl
      local.tee $9
      local.get $4
      i32.add
      local.tee $10
      local.get $0
      local.get $8
      local.get $9
      i32.add
      i32.add
      local.tee $9
      f64.load
      f64.store
      local.get $10
      local.get $9
      f64.load offset=8
      f64.store offset=8
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $4
    local.get $2
    local.get $3
    call $src/wasm/signal/fft/fft
    i32.const 0
    local.set $5
    loop $for-loop|2
     local.get $2
     local.get $5
     i32.gt_s
     if
      local.get $0
      local.get $5
      i32.const 4
      i32.shl
      local.tee $9
      local.get $8
      i32.add
      i32.add
      local.tee $10
      local.get $4
      local.get $9
      i32.add
      local.tee $9
      f64.load
      f64.store
      local.get $10
      local.get $9
      f64.load offset=8
      f64.store offset=8
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|2
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  loop $for-loop|3
   local.get $2
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $5
    loop $for-loop|4
     local.get $1
     local.get $5
     i32.gt_s
     if
      local.get $4
      local.get $5
      i32.const 4
      i32.shl
      i32.add
      local.tee $6
      local.get $0
      local.get $2
      local.get $5
      i32.mul
      local.get $7
      i32.add
      i32.const 4
      i32.shl
      i32.add
      local.tee $8
      f64.load
      f64.store
      local.get $6
      local.get $8
      f64.load offset=8
      f64.store offset=8
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|4
     end
    end
    local.get $4
    local.get $1
    local.get $3
    call $src/wasm/signal/fft/fft
    i32.const 0
    local.set $5
    loop $for-loop|5
     local.get $1
     local.get $5
     i32.gt_s
     if
      local.get $0
      local.get $2
      local.get $5
      i32.mul
      local.get $7
      i32.add
      i32.const 4
      i32.shl
      i32.add
      local.tee $6
      local.get $4
      local.get $5
      i32.const 4
      i32.shl
      i32.add
      local.tee $8
      f64.load
      f64.store
      local.get $6
      local.get $8
      f64.load offset=8
      f64.store offset=8
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|5
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|3
   end
  end
 )
 (func $src/wasm/signal/fft/convolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  local.get $6
  i32.const 1
  i32.shl
  local.set $12
  loop $for-loop|0
   local.get $7
   local.get $12
   i32.lt_s
   if
    local.get $4
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $8
   local.get $1
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $8
    i32.const 3
    i32.shl
    local.tee $7
    local.get $4
    i32.add
    local.get $0
    local.get $7
    i32.add
    f64.load
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
  loop $for-loop|2
   local.get $9
   local.get $12
   i32.lt_s
   if
    local.get $5
    local.get $9
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $10
   local.get $3
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $10
    i32.const 3
    i32.shl
    local.tee $0
    local.get $5
    i32.add
    local.get $0
    local.get $2
    i32.add
    f64.load
    f64.store
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|3
   end
  end
  local.get $4
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fft
  local.get $5
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fft
  loop $for-loop|4
   local.get $6
   local.get $11
   i32.gt_s
   if
    local.get $11
    i32.const 4
    i32.shl
    local.tee $0
    local.get $4
    i32.add
    local.tee $1
    f64.load
    local.set $13
    local.get $1
    local.get $13
    local.get $0
    local.get $5
    i32.add
    local.tee $0
    f64.load
    local.tee $14
    f64.mul
    local.get $1
    f64.load offset=8
    local.tee $15
    local.get $0
    f64.load offset=8
    local.tee $16
    f64.mul
    f64.sub
    f64.store
    local.get $1
    local.get $13
    local.get $16
    f64.mul
    local.get $15
    local.get $14
    f64.mul
    f64.add
    f64.store offset=8
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|4
   end
  end
  local.get $4
  local.get $6
  i32.const 1
  call $src/wasm/signal/fft/fft
 )
 (func $src/wasm/signal/fft/rfft (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 4
    i32.shl
    i32.add
    local.tee $4
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $4
    f64.const 0
    f64.store offset=8
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  local.get $1
  i32.const 0
  call $src/wasm/signal/fft/fft
 )
 (func $src/wasm/signal/fft/irfft (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $1
  i32.const 1
  i32.shl
  local.set $6
  loop $for-loop|0
   local.get $5
   local.get $6
   i32.lt_s
   if
    local.get $5
    i32.const 3
    i32.shl
    local.tee $7
    local.get $3
    i32.add
    local.get $0
    local.get $7
    i32.add
    f64.load
    f64.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $3
  local.get $1
  i32.const 1
  call $src/wasm/signal/fft/fft
  loop $for-loop|1
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $2
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    local.get $3
    local.get $4
    i32.const 4
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/signal/fft/isPowerOf2 (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.const 1
  i32.sub
  i32.and
  i32.eqz
  local.get $0
  i32.const 0
  i32.gt_s
  i32.and
 )
 (func $src/wasm/signal/fft/fftSIMD (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 v128)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 i32)
  (local $15 i32)
  (local $16 v128)
  local.get $0
  local.get $1
  call $src/wasm/signal/fft/bitReverse
  i32.const 2
  local.set $3
  loop $while-continue|0
   local.get $1
   local.get $3
   i32.ge_s
   if
    local.get $3
    i32.const 1
    i32.shr_s
    local.set $8
    f64.const 6.283185307179586
    f64.const -6.283185307179586
    local.get $2
    select
    local.get $3
    f64.convert_i32_s
    f64.div
    local.set $11
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $1
     local.get $4
     i32.gt_s
     if
      f64.const 0
      local.set $5
      i32.const 0
      local.set $6
      loop $for-loop|2
       local.get $6
       local.get $8
       i32.lt_s
       if
        local.get $5
        call $~lib/math/NativeMath.cos
        local.set $9
        local.get $5
        call $~lib/math/NativeMath.sin
        local.set $10
        local.get $4
        local.get $6
        i32.add
        local.tee $14
        i32.const 4
        i32.shl
        local.get $0
        i32.add
        local.tee $15
        v128.load
        local.set $7
        local.get $15
        local.get $7
        v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
        local.get $8
        local.get $14
        i32.add
        i32.const 4
        i32.shl
        local.get $0
        i32.add
        local.tee $14
        v128.load
        local.tee $16
        f64x2.extract_lane 0
        local.tee $12
        local.get $9
        f64.mul
        local.get $16
        f64x2.extract_lane 1
        local.tee $13
        local.get $10
        f64.mul
        f64.sub
        f64x2.replace_lane 0
        local.get $12
        local.get $10
        f64.mul
        local.get $13
        local.get $9
        f64.mul
        f64.add
        f64x2.replace_lane 1
        local.tee $16
        f64x2.add
        v128.store
        local.get $14
        local.get $7
        local.get $16
        f64x2.sub
        v128.store
        local.get $5
        local.get $11
        f64.add
        local.set $5
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|2
       end
      end
      local.get $3
      local.get $4
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.shl
    local.set $3
    br $while-continue|0
   end
  end
  local.get $2
  if
   f64.const 1
   local.get $1
   f64.convert_i32_s
   f64.div
   local.tee $5
   f64x2.splat
   local.set $7
   i32.const 0
   local.set $2
   local.get $1
   i32.const 1
   i32.shl
   local.tee $1
   i32.const 1
   i32.sub
   local.set $3
   loop $for-loop|3
    local.get $2
    local.get $3
    i32.lt_s
    if
     local.get $2
     i32.const 3
     i32.shl
     local.get $0
     i32.add
     local.tee $4
     local.get $4
     v128.load
     local.get $7
     f64x2.mul
     v128.store
     local.get $2
     i32.const 2
     i32.add
     local.set $2
     br $for-loop|3
    end
   end
   loop $for-loop|4
    local.get $1
    local.get $2
    i32.gt_s
    if
     local.get $2
     i32.const 3
     i32.shl
     local.get $0
     i32.add
     local.tee $3
     local.get $3
     f64.load
     local.get $5
     f64.mul
     f64.store
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $for-loop|4
    end
   end
  end
 )
 (func $src/wasm/signal/fft/convolveSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 f64)
  (local $11 v128)
  (local $12 v128)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 i32)
  (local $17 i32)
  local.get $6
  i32.const 1
  i32.shl
  local.tee $8
  i32.const 1
  i32.sub
  local.set $16
  loop $for-loop|0
   local.get $7
   local.get $16
   i32.lt_s
   if
    local.get $4
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $7
   local.get $8
   i32.lt_s
   if
    local.get $4
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
  i32.const 0
  local.set $7
  local.get $1
  i32.const 1
  i32.shl
  i32.const 1
  i32.sub
  local.set $17
  loop $for-loop|2
   local.get $7
   local.get $17
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $16
    local.get $4
    i32.add
    local.get $0
    local.get $16
    i32.add
    v128.load
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $7
   local.get $1
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $16
    local.get $4
    i32.add
    local.get $0
    local.get $16
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|3
   end
  end
  i32.const 0
  local.set $7
  local.get $8
  i32.const 1
  i32.sub
  local.set $0
  loop $for-loop|4
   local.get $0
   local.get $7
   i32.gt_s
   if
    local.get $5
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|4
   end
  end
  loop $for-loop|5
   local.get $7
   local.get $8
   i32.lt_s
   if
    local.get $5
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|5
   end
  end
  i32.const 0
  local.set $7
  local.get $3
  i32.const 1
  i32.shl
  i32.const 1
  i32.sub
  local.set $0
  loop $for-loop|6
   local.get $0
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $1
    local.get $5
    i32.add
    local.get $1
    local.get $2
    i32.add
    v128.load
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|6
   end
  end
  loop $for-loop|7
   local.get $7
   local.get $3
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $0
    local.get $5
    i32.add
    local.get $0
    local.get $2
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|7
   end
  end
  local.get $4
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fftSIMD
  local.get $5
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fftSIMD
  loop $for-loop|8
   local.get $6
   local.get $9
   i32.gt_s
   if
    local.get $9
    i32.const 4
    i32.shl
    local.tee $0
    local.get $4
    i32.add
    local.tee $1
    v128.load
    local.tee $11
    f64x2.extract_lane 0
    local.set $10
    local.get $1
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $10
    local.get $0
    local.get $5
    i32.add
    v128.load
    local.tee $12
    f64x2.extract_lane 0
    local.tee $13
    f64.mul
    local.get $11
    f64x2.extract_lane 1
    local.tee $14
    local.get $12
    f64x2.extract_lane 1
    local.tee $15
    f64.mul
    f64.sub
    f64x2.replace_lane 0
    local.get $10
    local.get $15
    f64.mul
    local.get $14
    local.get $13
    f64.mul
    f64.add
    f64x2.replace_lane 1
    v128.store
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|8
   end
  end
  local.get $4
  local.get $6
  i32.const 1
  call $src/wasm/signal/fft/fftSIMD
 )
 (func $src/wasm/signal/fft/powerSpectrumSIMD (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 v128)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $3
    i32.const 4
    i32.shl
    i32.add
    v128.load
    local.tee $4
    local.get $4
    f64x2.mul
    local.tee $4
    f64x2.extract_lane 0
    local.get $4
    f64x2.extract_lane 1
    f64.add
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/signal/fft/crossCorrelationSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 v128)
  (local $11 v128)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  local.get $6
  i32.const 1
  i32.shl
  local.tee $16
  i32.const 1
  i32.sub
  local.set $17
  loop $for-loop|0
   local.get $7
   local.get $17
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $15
    local.get $4
    i32.add
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    v128.store
    local.get $5
    local.get $15
    i32.add
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $7
   local.get $16
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $15
    local.get $4
    i32.add
    f64.const 0
    f64.store
    local.get $5
    local.get $15
    i32.add
    f64.const 0
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
  i32.const 0
  local.set $7
  local.get $1
  i32.const 1
  i32.shl
  i32.const 1
  i32.sub
  local.set $15
  loop $for-loop|2
   local.get $7
   local.get $15
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $16
    local.get $4
    i32.add
    local.get $0
    local.get $16
    i32.add
    v128.load
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $7
   local.get $1
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $15
    local.get $4
    i32.add
    local.get $0
    local.get $15
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|3
   end
  end
  i32.const 0
  local.set $7
  local.get $3
  i32.const 1
  i32.shl
  i32.const 1
  i32.sub
  local.set $0
  loop $for-loop|4
   local.get $0
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $1
    local.get $5
    i32.add
    local.get $1
    local.get $2
    i32.add
    v128.load
    v128.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|4
   end
  end
  loop $for-loop|5
   local.get $7
   local.get $3
   i32.const 1
   i32.shl
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $0
    local.get $5
    i32.add
    local.get $0
    local.get $2
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|5
   end
  end
  local.get $4
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fftSIMD
  local.get $5
  local.get $6
  i32.const 0
  call $src/wasm/signal/fft/fftSIMD
  loop $for-loop|6
   local.get $6
   local.get $8
   i32.gt_s
   if
    local.get $8
    i32.const 4
    i32.shl
    local.tee $0
    local.get $4
    i32.add
    local.tee $1
    v128.load
    local.tee $10
    f64x2.extract_lane 0
    local.set $9
    local.get $1
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $9
    local.get $0
    local.get $5
    i32.add
    v128.load
    local.tee $11
    f64x2.extract_lane 0
    local.tee $12
    f64.mul
    local.get $10
    f64x2.extract_lane 1
    local.tee $13
    local.get $11
    f64x2.extract_lane 1
    f64.neg
    local.tee $14
    f64.mul
    f64.sub
    f64x2.replace_lane 0
    local.get $9
    local.get $14
    f64.mul
    local.get $13
    local.get $12
    f64.mul
    f64.add
    f64x2.replace_lane 1
    v128.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|6
   end
  end
  local.get $4
  local.get $6
  i32.const 1
  call $src/wasm/signal/fft/fftSIMD
 )
 (func $src/wasm/signal/processing/freqz (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 f64)
  (local $16 f64)
  (local $17 f64)
  (local $18 f64)
  loop $for-loop|0
   local.get $5
   local.get $13
   i32.gt_s
   if
    local.get $13
    i32.const 3
    i32.shl
    local.tee $14
    local.get $4
    i32.add
    f64.load
    local.set $15
    f64.const 0
    local.set $11
    f64.const 0
    local.set $12
    i32.const 0
    local.set $8
    loop $for-loop|1
     local.get $1
     local.get $8
     i32.gt_s
     if
      local.get $8
      f64.convert_i32_s
      f64.neg
      local.get $15
      f64.mul
      local.tee $9
      call $~lib/math/NativeMath.cos
      local.set $10
      local.get $9
      call $~lib/math/NativeMath.sin
      local.set $9
      local.get $11
      local.get $0
      local.get $8
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $16
      local.get $10
      f64.mul
      f64.add
      local.set $11
      local.get $12
      local.get $16
      local.get $9
      f64.mul
      f64.add
      local.set $12
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|1
     end
    end
    f64.const 0
    local.set $9
    f64.const 0
    local.set $10
    i32.const 0
    local.set $8
    loop $for-loop|2
     local.get $3
     local.get $8
     i32.gt_s
     if
      local.get $8
      f64.convert_i32_s
      f64.neg
      local.get $15
      f64.mul
      local.tee $16
      call $~lib/math/NativeMath.cos
      local.set $17
      local.get $16
      call $~lib/math/NativeMath.sin
      local.set $18
      local.get $9
      local.get $2
      local.get $8
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $16
      local.get $17
      f64.mul
      f64.add
      local.set $9
      local.get $10
      local.get $16
      local.get $18
      f64.mul
      f64.add
      local.set $10
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|2
     end
    end
    local.get $6
    local.get $14
    i32.add
    local.get $11
    local.get $9
    f64.mul
    local.get $12
    local.get $10
    f64.mul
    f64.add
    local.get $9
    local.get $9
    f64.mul
    local.get $10
    local.get $10
    f64.mul
    f64.add
    local.tee $15
    f64.div
    f64.store
    local.get $7
    local.get $14
    i32.add
    local.get $12
    local.get $9
    f64.mul
    local.get $11
    local.get $10
    f64.mul
    f64.sub
    local.get $15
    f64.div
    f64.store
    local.get $13
    i32.const 1
    i32.add
    local.set $13
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/signal/processing/freqzUniform (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  (local $10 i32)
  (local $11 f64)
  (local $12 f64)
  (local $13 i32)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 f64)
  f64.const 3.141592653589793
  local.get $4
  f64.convert_i32_s
  f64.div
  local.set $14
  loop $for-loop|0
   local.get $4
   local.get $10
   i32.gt_s
   if
    local.get $10
    i32.const 3
    i32.shl
    local.set $13
    local.get $10
    f64.convert_i32_s
    local.get $14
    f64.mul
    local.set $16
    f64.const 0
    local.set $11
    f64.const 0
    local.set $12
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $11
      local.get $0
      local.get $7
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $8
      local.get $7
      f64.convert_i32_s
      f64.neg
      local.get $16
      f64.mul
      local.tee $9
      call $~lib/math/NativeMath.cos
      f64.mul
      f64.add
      local.set $11
      local.get $12
      local.get $8
      local.get $9
      call $~lib/math/NativeMath.sin
      f64.mul
      f64.add
      local.set $12
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    f64.const 0
    local.set $8
    f64.const 0
    local.set $9
    i32.const 0
    local.set $7
    loop $for-loop|2
     local.get $3
     local.get $7
     i32.gt_s
     if
      local.get $8
      local.get $2
      local.get $7
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $17
      local.get $7
      f64.convert_i32_s
      f64.neg
      local.get $16
      f64.mul
      local.tee $15
      call $~lib/math/NativeMath.cos
      f64.mul
      f64.add
      local.set $8
      local.get $9
      local.get $17
      local.get $15
      call $~lib/math/NativeMath.sin
      f64.mul
      f64.add
      local.set $9
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|2
     end
    end
    local.get $5
    local.get $13
    i32.add
    local.get $11
    local.get $8
    f64.mul
    local.get $12
    local.get $9
    f64.mul
    f64.add
    local.get $8
    local.get $8
    f64.mul
    local.get $9
    local.get $9
    f64.mul
    f64.add
    local.tee $15
    f64.div
    f64.store
    local.get $6
    local.get $13
    i32.add
    local.get $12
    local.get $8
    f64.mul
    local.get $11
    local.get $9
    f64.mul
    f64.sub
    local.get $15
    f64.div
    f64.store
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/signal/processing/polyMultiply (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  local.get $2
  local.get $5
  i32.add
  i32.const 1
  i32.sub
  local.set $10
  loop $for-loop|0
   local.get $8
   local.get $10
   i32.lt_s
   if
    local.get $8
    i32.const 3
    i32.shl
    local.tee $11
    local.get $6
    i32.add
    f64.const 0
    f64.store
    local.get $7
    local.get $11
    i32.add
    f64.const 0
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $9
   local.get $10
   i32.lt_s
   if
    local.get $9
    i32.const 3
    i32.shl
    local.set $17
    i32.const 0
    local.set $8
    loop $for-loop|2
     local.get $2
     local.get $8
     i32.gt_s
     if
      local.get $9
      local.get $8
      i32.sub
      local.tee $18
      local.get $5
      i32.lt_s
      local.get $18
      i32.const 0
      i32.ge_s
      i32.and
      if
       local.get $7
       local.get $17
       i32.add
       local.tee $11
       f64.load
       local.set $12
       local.get $6
       local.get $17
       i32.add
       local.tee $19
       local.get $19
       f64.load
       local.get $8
       i32.const 3
       i32.shl
       local.tee $19
       local.get $0
       i32.add
       f64.load
       local.tee $13
       local.get $18
       i32.const 3
       i32.shl
       local.tee $18
       local.get $3
       i32.add
       f64.load
       local.tee $14
       f64.mul
       f64.add
       local.get $1
       local.get $19
       i32.add
       f64.load
       local.tee $15
       local.get $4
       local.get $18
       i32.add
       f64.load
       local.tee $16
       f64.mul
       f64.sub
       f64.store
       local.get $11
       local.get $12
       local.get $13
       local.get $16
       f64.mul
       f64.add
       local.get $15
       local.get $14
       f64.mul
       f64.add
       f64.store
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|2
     end
    end
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/signal/processing/zpk2tf (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 f64) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (param $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 f64)
  (local $23 f64)
  (local $24 f64)
  (local $25 i32)
  (local $26 f64)
  (local $27 i32)
  local.get $2
  local.get $5
  local.get $2
  local.get $5
  i32.gt_s
  select
  i32.const 2
  i32.add
  i32.const 3
  i32.shl
  local.tee $12
  local.get $11
  i32.add
  local.set $15
  local.get $11
  local.get $12
  i32.const 1
  i32.shl
  i32.add
  local.set $16
  local.get $11
  local.get $12
  i32.const 3
  i32.mul
  i32.add
  local.set $17
  local.get $11
  local.tee $13
  f64.const 1
  f64.store
  local.get $15
  f64.const 0
  f64.store
  i32.const 1
  local.set $11
  loop $for-loop|0
   local.get $2
   local.get $18
   i32.gt_s
   if
    local.get $18
    i32.const 3
    i32.shl
    local.tee $12
    local.get $0
    i32.add
    f64.load
    local.set $23
    local.get $1
    local.get $12
    i32.add
    f64.load
    local.set $24
    local.get $11
    i32.const 1
    i32.add
    local.set $12
    i32.const 0
    local.set $14
    loop $for-loop|1
     local.get $12
     local.get $14
     i32.gt_s
     if
      local.get $14
      i32.const 3
      i32.shl
      local.tee $25
      local.get $16
      i32.add
      f64.const 0
      f64.store
      local.get $17
      local.get $25
      i32.add
      f64.const 0
      f64.store
      local.get $14
      i32.const 1
      i32.add
      local.set $14
      br $for-loop|1
     end
    end
    i32.const 0
    local.set $14
    loop $for-loop|2
     local.get $11
     local.get $14
     i32.gt_s
     if
      local.get $14
      i32.const 3
      i32.shl
      local.tee $25
      local.get $13
      i32.add
      f64.load
      local.set $26
      local.get $15
      local.get $25
      i32.add
      f64.load
      local.set $22
      local.get $16
      local.get $25
      i32.add
      local.tee $27
      local.get $27
      f64.load
      local.get $26
      f64.add
      f64.store
      local.get $17
      local.get $25
      i32.add
      local.tee $25
      local.get $25
      f64.load
      local.get $22
      f64.add
      f64.store
      local.get $14
      i32.const 1
      i32.add
      local.tee $14
      i32.const 3
      i32.shl
      local.tee $25
      local.get $16
      i32.add
      local.tee $27
      local.get $27
      f64.load
      local.get $26
      f64.neg
      local.get $23
      f64.mul
      local.get $22
      local.get $24
      f64.mul
      f64.add
      f64.add
      f64.store
      local.get $17
      local.get $25
      i32.add
      local.tee $25
      local.get $25
      f64.load
      local.get $26
      f64.neg
      local.get $24
      f64.mul
      local.get $22
      local.get $23
      f64.mul
      f64.sub
      f64.add
      f64.store
      br $for-loop|2
     end
    end
    i32.const 0
    local.set $11
    loop $for-loop|3
     local.get $11
     local.get $12
     i32.lt_s
     if
      local.get $11
      i32.const 3
      i32.shl
      local.tee $14
      local.get $13
      i32.add
      local.get $14
      local.get $16
      i32.add
      f64.load
      f64.store
      local.get $14
      local.get $15
      i32.add
      local.get $14
      local.get $17
      i32.add
      f64.load
      f64.store
      local.get $11
      i32.const 1
      i32.add
      local.set $11
      br $for-loop|3
     end
    end
    local.get $12
    local.set $11
    local.get $18
    i32.const 1
    i32.add
    local.set $18
    br $for-loop|0
   end
  end
  loop $for-loop|4
   local.get $11
   local.get $19
   i32.gt_s
   if
    local.get $19
    i32.const 3
    i32.shl
    local.tee $0
    local.get $7
    i32.add
    local.get $0
    local.get $13
    i32.add
    f64.load
    local.get $6
    f64.mul
    f64.store
    local.get $0
    local.get $8
    i32.add
    local.get $0
    local.get $15
    i32.add
    f64.load
    local.get $6
    f64.mul
    f64.store
    local.get $19
    i32.const 1
    i32.add
    local.set $19
    br $for-loop|4
   end
  end
  local.get $13
  f64.const 1
  f64.store
  local.get $15
  f64.const 0
  f64.store
  i32.const 1
  local.set $0
  loop $for-loop|5
   local.get $5
   local.get $20
   i32.gt_s
   if
    local.get $20
    i32.const 3
    i32.shl
    local.tee $1
    local.get $3
    i32.add
    f64.load
    local.set $6
    local.get $1
    local.get $4
    i32.add
    f64.load
    local.set $22
    local.get $0
    i32.const 1
    i32.add
    local.set $2
    i32.const 0
    local.set $1
    loop $for-loop|6
     local.get $1
     local.get $2
     i32.lt_s
     if
      local.get $1
      i32.const 3
      i32.shl
      local.tee $7
      local.get $16
      i32.add
      f64.const 0
      f64.store
      local.get $7
      local.get $17
      i32.add
      f64.const 0
      f64.store
      local.get $1
      i32.const 1
      i32.add
      local.set $1
      br $for-loop|6
     end
    end
    i32.const 0
    local.set $1
    loop $for-loop|7
     local.get $0
     local.get $1
     i32.gt_s
     if
      local.get $1
      i32.const 3
      i32.shl
      local.tee $7
      local.get $13
      i32.add
      f64.load
      local.set $23
      local.get $7
      local.get $15
      i32.add
      f64.load
      local.set $24
      local.get $7
      local.get $16
      i32.add
      local.tee $8
      local.get $8
      f64.load
      local.get $23
      f64.add
      f64.store
      local.get $7
      local.get $17
      i32.add
      local.tee $7
      local.get $7
      f64.load
      local.get $24
      f64.add
      f64.store
      local.get $1
      i32.const 1
      i32.add
      local.tee $1
      i32.const 3
      i32.shl
      local.tee $7
      local.get $16
      i32.add
      local.tee $8
      local.get $8
      f64.load
      local.get $23
      f64.neg
      local.get $6
      f64.mul
      local.get $24
      local.get $22
      f64.mul
      f64.add
      f64.add
      f64.store
      local.get $7
      local.get $17
      i32.add
      local.tee $7
      local.get $7
      f64.load
      local.get $23
      f64.neg
      local.get $22
      f64.mul
      local.get $24
      local.get $6
      f64.mul
      f64.sub
      f64.add
      f64.store
      br $for-loop|7
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|8
     local.get $0
     local.get $2
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $1
      local.get $13
      i32.add
      local.get $1
      local.get $16
      i32.add
      f64.load
      f64.store
      local.get $1
      local.get $15
      i32.add
      local.get $1
      local.get $17
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|8
     end
    end
    local.get $2
    local.set $0
    local.get $20
    i32.const 1
    i32.add
    local.set $20
    br $for-loop|5
   end
  end
  loop $for-loop|9
   local.get $0
   local.get $21
   i32.gt_s
   if
    local.get $21
    i32.const 3
    i32.shl
    local.tee $1
    local.get $9
    i32.add
    local.get $1
    local.get $13
    i32.add
    f64.load
    f64.store
    local.get $1
    local.get $10
    i32.add
    local.get $1
    local.get $15
    i32.add
    f64.load
    f64.store
    local.get $21
    i32.const 1
    i32.add
    local.set $21
    br $for-loop|9
   end
  end
 )
 (func $src/wasm/signal/processing/magnitude (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  loop $for-loop|0
   local.get $2
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    f64.load
    local.set $4
    local.get $3
    local.get $6
    i32.add
    local.get $4
    local.get $4
    f64.mul
    local.get $1
    local.get $6
    i32.add
    f64.load
    local.tee $4
    local.get $4
    f64.mul
    f64.add
    f64.sqrt
    f64.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $~lib/math/NativeMath.log (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 i64)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  local.get $0
  i64.reinterpret_f64
  local.tee $2
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $1
  i32.const 31
  i32.shr_u
  local.tee $3
  local.get $1
  i32.const 1048576
  i32.lt_u
  i32.or
  if
   local.get $2
   i64.const 1
   i64.shl
   i64.eqz
   if
    f64.const -1
    local.get $0
    local.get $0
    f64.mul
    f64.div
    return
   end
   local.get $3
   if
    local.get $0
    local.get $0
    f64.sub
    f64.const 0
    f64.div
    return
   end
   i32.const -54
   local.set $5
   local.get $0
   f64.const 18014398509481984
   f64.mul
   i64.reinterpret_f64
   local.tee $2
   i64.const 32
   i64.shr_u
   i32.wrap_i64
   local.set $1
  else
   local.get $1
   i32.const 2146435072
   i32.ge_u
   if
    local.get $0
    return
   else
    local.get $2
    i64.const 32
    i64.shl
    i64.eqz
    local.get $1
    i32.const 1072693248
    i32.eq
    i32.and
    if
     f64.const 0
     return
    end
   end
  end
  local.get $2
  i64.const 4294967295
  i64.and
  local.get $1
  i32.const 614242
  i32.add
  local.tee $1
  i32.const 1048575
  i32.and
  i32.const 1072079006
  i32.add
  i64.extend_i32_u
  i64.const 32
  i64.shl
  i64.or
  f64.reinterpret_i64
  f64.const -1
  f64.add
  local.tee $7
  f64.const 0.5
  f64.mul
  local.get $7
  f64.mul
  local.set $0
  local.get $7
  local.get $7
  f64.const 2
  f64.add
  f64.div
  local.tee $8
  local.get $8
  f64.mul
  local.tee $4
  local.get $4
  f64.mul
  local.set $6
  local.get $8
  local.get $0
  local.get $4
  local.get $6
  local.get $6
  local.get $6
  f64.const 0.14798198605116586
  f64.mul
  f64.const 0.1818357216161805
  f64.add
  f64.mul
  f64.const 0.2857142874366239
  f64.add
  f64.mul
  f64.const 0.6666666666666735
  f64.add
  f64.mul
  local.get $6
  local.get $6
  local.get $6
  f64.const 0.15313837699209373
  f64.mul
  f64.const 0.22222198432149784
  f64.add
  f64.mul
  f64.const 0.3999999999940942
  f64.add
  f64.mul
  f64.add
  f64.add
  f64.mul
  local.get $5
  local.get $1
  i32.const 20
  i32.shr_s
  i32.const 1023
  i32.sub
  i32.add
  f64.convert_i32_s
  local.tee $4
  f64.const 1.9082149292705877e-10
  f64.mul
  f64.add
  local.get $0
  f64.sub
  local.get $7
  f64.add
  local.get $4
  f64.const 0.6931471803691238
  f64.mul
  f64.add
 )
 (func $src/wasm/signal/processing/magnitudeDb (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  loop $for-loop|0
   local.get $2
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    f64.load
    local.tee $4
    local.get $4
    f64.mul
    local.get $1
    local.get $6
    i32.add
    f64.load
    local.tee $4
    local.get $4
    f64.mul
    f64.add
    f64.sqrt
    local.tee $4
    f64.const 1e-300
    f64.gt
    if
     local.get $3
     local.get $6
     i32.add
     local.get $4
     call $~lib/math/NativeMath.log
     f64.const 8.685889638065035
     f64.mul
     f64.store
    else
     local.get $3
     local.get $6
     i32.add
     f64.const -300
     f64.store
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $~lib/math/NativeMath.atan (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 f64)
  local.get $0
  local.set $1
  local.get $0
  i64.reinterpret_f64
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  i32.const 2147483647
  i32.and
  local.tee $2
  i32.const 1141899264
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.ne
   if
    local.get $0
    return
   end
   f64.const 1.5707963267948966
   local.get $1
   f64.copysign
   return
  end
  local.get $2
  i32.const 1071382528
  i32.lt_u
  if
   local.get $2
   i32.const 1044381696
   i32.lt_u
   if
    local.get $0
    return
   end
   i32.const -1
   local.set $3
  else
   local.get $0
   f64.abs
   local.set $0
   local.get $2
   i32.const 1072889856
   i32.lt_u
   if (result f64)
    local.get $2
    i32.const 1072037888
    i32.lt_u
    if (result f64)
     local.get $0
     local.get $0
     f64.add
     f64.const -1
     f64.add
     local.get $0
     f64.const 2
     f64.add
     f64.div
    else
     i32.const 1
     local.set $3
     local.get $0
     f64.const -1
     f64.add
     local.get $0
     f64.const 1
     f64.add
     f64.div
    end
   else
    local.get $2
    i32.const 1073971200
    i32.lt_u
    if (result f64)
     i32.const 2
     local.set $3
     local.get $0
     f64.const -1.5
     f64.add
     local.get $0
     f64.const 1.5
     f64.mul
     f64.const 1
     f64.add
     f64.div
    else
     i32.const 3
     local.set $3
     f64.const -1
     local.get $0
     f64.div
    end
   end
   local.set $0
  end
  local.get $0
  local.get $0
  f64.mul
  local.tee $5
  local.get $5
  f64.mul
  local.set $4
  local.get $0
  local.get $5
  local.get $4
  local.get $4
  local.get $4
  local.get $4
  local.get $4
  f64.const 0.016285820115365782
  f64.mul
  f64.const 0.049768779946159324
  f64.add
  f64.mul
  f64.const 0.06661073137387531
  f64.add
  f64.mul
  f64.const 0.09090887133436507
  f64.add
  f64.mul
  f64.const 0.14285714272503466
  f64.add
  f64.mul
  f64.const 0.3333333333333293
  f64.add
  f64.mul
  local.get $4
  local.get $4
  local.get $4
  local.get $4
  local.get $4
  f64.const -0.036531572744216916
  f64.mul
  f64.const -0.058335701337905735
  f64.add
  f64.mul
  f64.const -0.0769187620504483
  f64.add
  f64.mul
  f64.const -0.11111110405462356
  f64.add
  f64.mul
  f64.const -0.19999999999876483
  f64.add
  f64.mul
  f64.add
  f64.mul
  local.set $4
  local.get $3
  i32.const 0
  i32.lt_s
  if
   local.get $0
   local.get $4
   f64.sub
   return
  end
  block $break|0
   block $case4|0
    block $case3|0
     block $case2|0
      block $case1|0
       block $case0|0
        local.get $3
        br_table $case0|0 $case1|0 $case2|0 $case3|0 $case4|0
       end
       f64.const 0.4636476090008061
       local.get $4
       f64.const -2.2698777452961687e-17
       f64.add
       local.get $0
       f64.sub
       f64.sub
       local.set $0
       br $break|0
      end
      f64.const 0.7853981633974483
      local.get $4
      f64.const -3.061616997868383e-17
      f64.add
      local.get $0
      f64.sub
      f64.sub
      local.set $0
      br $break|0
     end
     f64.const 0.982793723247329
     local.get $4
     f64.const -1.3903311031230998e-17
     f64.add
     local.get $0
     f64.sub
     f64.sub
     local.set $0
     br $break|0
    end
    f64.const 1.5707963267948966
    local.get $4
    f64.const -6.123233995736766e-17
    f64.add
    local.get $0
    f64.sub
    f64.sub
    local.set $0
    br $break|0
   end
   unreachable
  end
  local.get $0
  local.get $1
  f64.copysign
 )
 (func $~lib/math/NativeMath.atan2 (param $0 f64) (param $1 f64) (result f64)
  (local $2 i32)
  (local $3 i64)
  (local $4 i64)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  local.get $0
  f64.ne
  local.get $1
  local.get $1
  f64.ne
  i32.or
  if
   local.get $1
   local.get $0
   f64.add
   return
  end
  local.get $0
  i64.reinterpret_f64
  local.tee $3
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.set $6
  local.get $1
  i64.reinterpret_f64
  local.tee $4
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.set $5
  local.get $4
  i32.wrap_i64
  local.tee $7
  local.get $5
  i32.const 1072693248
  i32.sub
  i32.or
  i32.eqz
  if
   local.get $0
   call $~lib/math/NativeMath.atan
   return
  end
  local.get $5
  i32.const 30
  i32.shr_u
  i32.const 2
  i32.and
  local.get $6
  i32.const 31
  i32.shr_u
  i32.or
  local.set $2
  local.get $6
  i32.const 2147483647
  i32.and
  local.tee $6
  local.get $3
  i32.wrap_i64
  i32.or
  i32.eqz
  if
   block $break|0
    block $case3|0
     block $case2|0
      local.get $2
      i32.eqz
      local.get $2
      i32.const 1
      i32.eq
      i32.or
      i32.eqz
      if
       local.get $2
       i32.const 2
       i32.eq
       br_if $case2|0
       local.get $2
       i32.const 3
       i32.eq
       br_if $case3|0
       br $break|0
      end
      local.get $0
      return
     end
     f64.const 3.141592653589793
     return
    end
    f64.const -3.141592653589793
    return
   end
  end
  block $folding-inner0
   local.get $7
   local.get $5
   i32.const 2147483647
   i32.and
   local.tee $5
   i32.or
   i32.eqz
   br_if $folding-inner0
   local.get $5
   i32.const 2146435072
   i32.eq
   if
    local.get $6
    i32.const 2146435072
    i32.eq
    if (result f64)
     f64.const 2.356194490192345
     f64.const 0.7853981633974483
     local.get $2
     i32.const 2
     i32.and
     select
     local.tee $0
     f64.neg
     local.get $0
     local.get $2
     i32.const 1
     i32.and
     select
    else
     f64.const 3.141592653589793
     f64.const 0
     local.get $2
     i32.const 2
     i32.and
     select
     local.tee $0
     f64.neg
     local.get $0
     local.get $2
     i32.const 1
     i32.and
     select
    end
    return
   end
   local.get $6
   i32.const 2146435072
   i32.eq
   local.get $5
   i32.const 67108864
   i32.add
   local.get $6
   i32.lt_u
   i32.or
   br_if $folding-inner0
   local.get $6
   i32.const 67108864
   i32.add
   local.get $5
   i32.lt_u
   i32.const 0
   local.get $2
   i32.const 2
   i32.and
   select
   if (result f64)
    f64.const 0
   else
    local.get $0
    local.get $1
    f64.div
    f64.abs
    call $~lib/math/NativeMath.atan
   end
   local.set $0
   block $break|1
    block $case3|1
     block $case2|1
      block $case1|1
       block $case0|1
        local.get $2
        br_table $case0|1 $case1|1 $case2|1 $case3|1 $break|1
       end
       local.get $0
       return
      end
      local.get $0
      f64.neg
      return
     end
     f64.const 3.141592653589793
     local.get $0
     f64.const -1.2246467991473532e-16
     f64.add
     f64.sub
     return
    end
    local.get $0
    f64.const -1.2246467991473532e-16
    f64.add
    f64.const -3.141592653589793
    f64.add
    return
   end
   unreachable
  end
  f64.const -1.5707963267948966
  f64.const 1.5707963267948966
  local.get $2
  i32.const 1
  i32.and
  select
 )
 (func $src/wasm/signal/processing/phase (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $1
    local.get $5
    i32.add
    f64.load
    local.get $0
    local.get $5
    i32.add
    f64.load
    call $~lib/math/NativeMath.atan2
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/signal/processing/unwrapPhase (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  local.get $1
  i32.const 0
  i32.le_s
  if
   return
  end
  local.get $2
  local.get $0
  f64.load
  f64.store
  local.get $1
  i32.const 2
  i32.lt_s
  if
   return
  end
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    f64.load
    local.tee $5
    local.get $4
    i32.const 1
    i32.sub
    i32.const 3
    i32.shl
    local.get $2
    i32.add
    f64.load
    f64.sub
    local.set $3
    loop $while-continue|1
     local.get $3
     f64.const 3.141592653589793
     f64.gt
     if
      local.get $5
      f64.const -6.283185307179586
      f64.add
      local.set $5
      local.get $3
      f64.const -6.283185307179586
      f64.add
      local.set $3
      br $while-continue|1
     end
    end
    loop $while-continue|2
     local.get $3
     f64.const -3.141592653589793
     f64.lt
     if
      local.get $5
      f64.const 6.283185307179586
      f64.add
      local.set $5
      local.get $3
      f64.const 6.283185307179586
      f64.add
      local.set $3
      br $while-continue|2
     end
    end
    local.get $2
    local.get $6
    i32.add
    local.get $5
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/signal/processing/groupDelay (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32)
  (local $6 i32)
  local.get $3
  i32.const 2
  i32.lt_s
  if
   loop $for-loop|0
    local.get $3
    local.get $6
    i32.gt_s
    if
     local.get $4
     local.get $6
     i32.const 3
     i32.shl
     i32.add
     f64.const 0
     f64.store
     local.get $6
     i32.const 1
     i32.add
     local.set $6
     br $for-loop|0
    end
   end
   return
  end
  local.get $0
  local.get $1
  local.get $3
  local.get $5
  call $src/wasm/signal/processing/phase
  local.get $5
  local.get $3
  local.get $5
  local.get $3
  i32.const 3
  i32.shl
  i32.add
  local.tee $5
  call $src/wasm/signal/processing/unwrapPhase
  i32.const 1
  local.set $0
  loop $for-loop|1
   local.get $0
   local.get $3
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $4
    local.get $0
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    i32.const 1
    i32.add
    local.tee $1
    i32.const 3
    i32.shl
    local.tee $6
    local.get $5
    i32.add
    f64.load
    local.get $0
    i32.const 1
    i32.sub
    i32.const 3
    i32.shl
    local.tee $0
    local.get $5
    i32.add
    f64.load
    f64.sub
    f64.neg
    local.get $2
    local.get $6
    i32.add
    f64.load
    local.get $0
    local.get $2
    i32.add
    f64.load
    f64.sub
    f64.div
    f64.store
    local.get $1
    local.set $0
    br $for-loop|1
   end
  end
  local.get $4
  local.get $5
  f64.load offset=8
  local.get $5
  f64.load
  f64.sub
  f64.neg
  local.get $2
  f64.load offset=8
  local.get $2
  f64.load
  f64.sub
  f64.div
  f64.store
  local.get $3
  i32.const 1
  i32.sub
  i32.const 3
  i32.shl
  local.tee $0
  local.get $4
  i32.add
  local.get $0
  local.get $5
  i32.add
  f64.load
  local.get $3
  i32.const 2
  i32.sub
  i32.const 3
  i32.shl
  local.tee $1
  local.get $5
  i32.add
  f64.load
  f64.sub
  f64.neg
  local.get $0
  local.get $2
  i32.add
  f64.load
  local.get $1
  local.get $2
  i32.add
  f64.load
  f64.sub
  f64.div
  f64.store
 )
 (func $src/wasm/numeric/ode/rk45Step (param $0 i32) (param $1 f64) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  loop $for-loop|0
   local.get $3
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $9
    local.get $5
    i32.add
    local.get $0
    local.get $9
    i32.add
    f64.load
    local.get $2
    local.get $4
    local.get $9
    i32.add
    f64.load
    f64.const 0.09114583333333333
    f64.mul
    local.get $4
    local.get $3
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 1
    i32.shl
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.44923629829290207
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 3
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.6510416666666666
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 2
    i32.shl
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const -0.322376179245283
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 5
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.13095238095238096
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 6
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0
    f64.mul
    f64.add
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $8
   i32.gt_s
   if
    local.get $8
    i32.const 3
    i32.shl
    local.tee $7
    local.get $6
    i32.add
    local.get $5
    local.get $7
    i32.add
    f64.load
    local.get $0
    local.get $7
    i32.add
    f64.load
    local.get $2
    local.get $4
    local.get $7
    i32.add
    f64.load
    f64.const 0.08991319444444444
    f64.mul
    local.get $4
    local.get $3
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 1
    i32.shl
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.4534890685834082
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 3
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.6140625
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 2
    i32.shl
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const -0.2715123820754717
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 5
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.08904761904761904
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 6
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.025
    f64.mul
    f64.add
    f64.mul
    f64.add
    f64.sub
    f64.abs
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/numeric/ode/rk23Step (param $0 i32) (param $1 f64) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  loop $for-loop|0
   local.get $3
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $9
    local.get $5
    i32.add
    local.get $0
    local.get $9
    i32.add
    f64.load
    local.get $2
    local.get $4
    local.get $9
    i32.add
    f64.load
    f64.const 0.2222222222222222
    f64.mul
    local.get $4
    local.get $3
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.3333333333333333
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 1
    i32.shl
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.4444444444444444
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 3
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0
    f64.mul
    f64.add
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $8
   i32.gt_s
   if
    local.get $8
    i32.const 3
    i32.shl
    local.tee $7
    local.get $6
    i32.add
    local.get $5
    local.get $7
    i32.add
    f64.load
    local.get $0
    local.get $7
    i32.add
    f64.load
    local.get $2
    local.get $4
    local.get $7
    i32.add
    f64.load
    f64.const 0.2916666666666667
    f64.mul
    local.get $4
    local.get $3
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.25
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 1
    i32.shl
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.3333333333333333
    f64.mul
    f64.add
    local.get $4
    local.get $3
    i32.const 3
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.const 0.125
    f64.mul
    f64.add
    f64.mul
    f64.add
    f64.sub
    f64.abs
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/numeric/ode/maxError (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.tee $2
    f64.lt
    if
     local.get $2
     local.set $3
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $~lib/math/NativeMath.scalbn (param $0 f64) (param $1 i32) (result f64)
  local.get $1
  i32.const 1023
  i32.gt_s
  if (result f64)
   local.get $0
   f64.const 8988465674311579538646525e283
   f64.mul
   local.set $0
   local.get $1
   i32.const 1023
   i32.sub
   local.tee $1
   i32.const 1023
   i32.gt_s
   if (result f64)
    i32.const 1023
    local.get $1
    i32.const 1023
    i32.sub
    local.tee $1
    local.get $1
    i32.const 1023
    i32.ge_s
    select
    local.set $1
    local.get $0
    f64.const 8988465674311579538646525e283
    f64.mul
   else
    local.get $0
   end
  else
   local.get $1
   i32.const -1022
   i32.lt_s
   if (result f64)
    local.get $0
    f64.const 2.004168360008973e-292
    f64.mul
    local.set $0
    local.get $1
    i32.const 969
    i32.add
    local.tee $1
    i32.const -1022
    i32.lt_s
    if (result f64)
     i32.const -1022
     local.get $1
     i32.const 969
     i32.add
     local.tee $1
     local.get $1
     i32.const -1022
     i32.le_s
     select
     local.set $1
     local.get $0
     f64.const 2.004168360008973e-292
     f64.mul
    else
     local.get $0
    end
   else
    local.get $0
   end
  end
  local.get $1
  i64.extend_i32_s
  i64.const 1023
  i64.add
  i64.const 52
  i64.shl
  f64.reinterpret_i64
  f64.mul
 )
 (func $~lib/math/NativeMath.pow (param $0 f64) (param $1 f64) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 i64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 f64)
  (local $12 i32)
  (local $13 i64)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 f64)
  (local $18 f64)
  (local $19 f64)
  (local $20 f64)
  (local $21 f64)
  local.get $1
  f64.abs
  f64.const 2
  f64.le
  if
   local.get $1
   f64.const 2
   f64.eq
   if
    local.get $0
    local.get $0
    f64.mul
    return
   end
   local.get $1
   f64.const 0.5
   f64.eq
   if
    local.get $0
    f64.sqrt
    f64.abs
    f64.const inf
    local.get $0
    f64.const -inf
    f64.ne
    select
    return
   end
   local.get $1
   f64.const -1
   f64.eq
   if
    f64.const 1
    local.get $0
    f64.div
    return
   end
   local.get $1
   f64.const 1
   f64.eq
   if
    local.get $0
    return
   end
   local.get $1
   f64.const 0
   f64.eq
   if
    f64.const 1
    return
   end
  end
  local.get $0
  i64.reinterpret_f64
  local.tee $6
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $12
  i32.const 2147483647
  i32.and
  local.set $2
  local.get $1
  i64.reinterpret_f64
  local.tee $13
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $8
  i32.const 2147483647
  i32.and
  local.tee $9
  local.get $13
  i32.wrap_i64
  local.tee $14
  i32.or
  i32.eqz
  if
   f64.const 1
   return
  end
  local.get $9
  i32.const 2146435072
  i32.eq
  local.get $14
  i32.const 0
  i32.ne
  i32.and
  local.get $2
  i32.const 2146435072
  i32.eq
  local.get $6
  i32.wrap_i64
  local.tee $7
  i32.const 0
  i32.ne
  i32.and
  local.get $2
  i32.const 2146435072
  i32.gt_s
  i32.or
  local.get $9
  i32.const 2146435072
  i32.gt_u
  i32.or
  i32.or
  if
   local.get $0
   local.get $1
   f64.add
   return
  end
  local.get $12
  i32.const 0
  i32.lt_s
  if (result i32)
   local.get $9
   i32.const 1128267776
   i32.ge_u
   if (result i32)
    i32.const 2
   else
    local.get $9
    i32.const 1072693248
    i32.ge_u
    if (result i32)
     i32.const 52
     i32.const 20
     local.get $9
     i32.const 20
     i32.shr_u
     i32.const 1023
     i32.sub
     local.tee $10
     i32.const 20
     i32.gt_s
     local.tee $15
     select
     local.get $10
     i32.sub
     local.set $10
     i32.const 2
     local.get $14
     local.get $9
     local.get $15
     select
     local.tee $15
     local.get $10
     i32.shr_u
     local.tee $16
     i32.const 1
     i32.and
     i32.sub
     i32.const 0
     local.get $16
     local.get $10
     i32.shl
     local.get $15
     i32.eq
     select
    else
     i32.const 0
    end
   end
  else
   i32.const 0
  end
  local.set $10
  local.get $14
  i32.eqz
  if
   local.get $9
   i32.const 2146435072
   i32.eq
   if
    local.get $2
    i32.const 1072693248
    i32.sub
    local.get $7
    i32.or
    if (result f64)
     local.get $1
     f64.const 0
     local.get $8
     i32.const 0
     i32.ge_s
     local.tee $4
     select
     f64.const 0
     local.get $1
     f64.neg
     local.get $4
     select
     local.get $2
     i32.const 1072693248
     i32.ge_s
     select
    else
     f64.const nan:0x8000000000000
    end
    return
   end
   local.get $9
   i32.const 1072693248
   i32.eq
   if
    local.get $8
    i32.const 0
    i32.ge_s
    if
     local.get $0
     return
    end
    f64.const 1
    local.get $0
    f64.div
    return
   end
   local.get $8
   i32.const 1073741824
   i32.eq
   if
    local.get $0
    local.get $0
    f64.mul
    return
   end
   local.get $8
   i32.const 1071644672
   i32.eq
   local.get $12
   i32.const 0
   i32.ge_s
   i32.and
   if
    local.get $0
    f64.sqrt
    return
   end
  end
  local.get $0
  f64.abs
  local.set $3
  local.get $7
  i32.eqz
  local.get $2
  i32.eqz
  local.get $2
  i32.const 2146435072
  i32.eq
  i32.or
  local.get $2
  i32.const 1072693248
  i32.eq
  i32.or
  i32.and
  if
   f64.const 1
   local.get $3
   f64.div
   local.get $3
   local.get $8
   i32.const 0
   i32.lt_s
   select
   local.set $0
   local.get $12
   i32.const 0
   i32.lt_s
   if (result f64)
    local.get $2
    i32.const 1072693248
    i32.sub
    local.get $10
    i32.or
    if (result f64)
     local.get $0
     f64.neg
     local.get $0
     local.get $10
     i32.const 1
     i32.eq
     select
    else
     local.get $0
     local.get $0
     f64.sub
     local.tee $0
     local.get $0
     f64.div
    end
   else
    local.get $0
   end
   return
  end
  local.get $12
  i32.const 0
  i32.lt_s
  if (result f64)
   local.get $10
   i32.eqz
   if
    local.get $0
    local.get $0
    f64.sub
    local.tee $0
    local.get $0
    f64.div
    return
   end
   f64.const -1
   f64.const 1
   local.get $10
   i32.const 1
   i32.eq
   select
  else
   f64.const 1
  end
  local.set $5
  local.get $9
  i32.const 1105199104
  i32.gt_u
  if (result f64)
   local.get $9
   i32.const 1139802112
   i32.gt_u
   if
    local.get $2
    i32.const 1072693247
    i32.le_s
    if
     f64.const inf
     f64.const 0
     local.get $8
     i32.const 0
     i32.lt_s
     select
     return
    end
    local.get $2
    i32.const 1072693248
    i32.ge_s
    if
     f64.const inf
     f64.const 0
     local.get $8
     i32.const 0
     i32.gt_s
     select
     return
    end
   end
   local.get $2
   i32.const 1072693247
   i32.lt_s
   if
    local.get $5
    f64.const 1.e+300
    f64.mul
    f64.const 1.e+300
    f64.mul
    local.get $5
    f64.const 1e-300
    f64.mul
    f64.const 1e-300
    f64.mul
    local.get $8
    i32.const 0
    i32.lt_s
    select
    return
   end
   local.get $2
   i32.const 1072693248
   i32.gt_s
   if
    local.get $5
    f64.const 1.e+300
    f64.mul
    f64.const 1.e+300
    f64.mul
    local.get $5
    f64.const 1e-300
    f64.mul
    f64.const 1e-300
    f64.mul
    local.get $8
    i32.const 0
    i32.gt_s
    select
    return
   end
   local.get $3
   f64.const -1
   f64.add
   local.tee $0
   f64.const 1.4426950216293335
   f64.mul
   local.tee $3
   local.get $0
   f64.const 1.9259629911266175e-08
   f64.mul
   local.get $0
   local.get $0
   f64.mul
   f64.const 0.5
   local.get $0
   f64.const 0.3333333333333333
   local.get $0
   f64.const 0.25
   f64.mul
   f64.sub
   f64.mul
   f64.sub
   f64.mul
   f64.const 1.4426950408889634
   f64.mul
   f64.sub
   local.tee $11
   f64.add
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.set $0
   local.get $11
   local.get $0
   local.get $3
   f64.sub
   f64.sub
  else
   local.get $2
   i32.const 1048576
   i32.lt_s
   if
    i32.const -53
    local.set $4
    local.get $3
    f64.const 9007199254740992
    f64.mul
    local.tee $3
    i64.reinterpret_f64
    i64.const 32
    i64.shr_u
    i32.wrap_i64
    local.set $2
   end
   local.get $4
   local.get $2
   i32.const 20
   i32.shr_s
   i32.const 1023
   i32.sub
   i32.add
   local.set $4
   local.get $2
   i32.const 1048575
   i32.and
   local.tee $7
   i32.const 1072693248
   i32.or
   local.set $2
   local.get $7
   i32.const 235662
   i32.le_u
   if (result i32)
    i32.const 0
   else
    local.get $7
    i32.const 767610
    i32.lt_u
    if (result i32)
     i32.const 1
    else
     local.get $4
     i32.const 1
     i32.add
     local.set $4
     local.get $2
     i32.const -1048576
     i32.add
     local.set $2
     i32.const 0
    end
   end
   local.set $7
   local.get $3
   i64.reinterpret_f64
   i64.const 4294967295
   i64.and
   local.get $2
   i64.extend_i32_s
   i64.const 32
   i64.shl
   i64.or
   f64.reinterpret_i64
   local.tee $17
   f64.const 1.5
   f64.const 1
   local.get $7
   select
   local.tee $18
   f64.sub
   local.tee $19
   f64.const 1
   local.get $17
   local.get $18
   f64.add
   f64.div
   local.tee $20
   f64.mul
   local.tee $0
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.tee $3
   local.get $3
   f64.mul
   local.set $21
   local.get $3
   local.get $21
   f64.const 3
   f64.add
   local.get $0
   local.get $0
   f64.mul
   local.tee $11
   local.get $11
   f64.mul
   local.get $11
   local.get $11
   local.get $11
   local.get $11
   local.get $11
   f64.const 0.20697501780033842
   f64.mul
   f64.const 0.23066074577556175
   f64.add
   f64.mul
   f64.const 0.272728123808534
   f64.add
   f64.mul
   f64.const 0.33333332981837743
   f64.add
   f64.mul
   f64.const 0.4285714285785502
   f64.add
   f64.mul
   f64.const 0.5999999999999946
   f64.add
   f64.mul
   local.get $20
   local.get $19
   local.get $3
   local.get $2
   i32.const 1
   i32.shr_s
   i32.const 536870912
   i32.or
   i32.const 524288
   i32.add
   local.get $7
   i32.const 18
   i32.shl
   i32.add
   i64.extend_i32_s
   i64.const 32
   i64.shl
   f64.reinterpret_i64
   local.tee $11
   f64.mul
   f64.sub
   local.get $3
   local.get $17
   local.get $11
   local.get $18
   f64.sub
   f64.sub
   f64.mul
   f64.sub
   f64.mul
   local.tee $11
   local.get $3
   local.get $0
   f64.add
   f64.mul
   f64.add
   local.tee $3
   f64.add
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.tee $17
   f64.mul
   local.tee $18
   local.get $11
   local.get $17
   f64.mul
   local.get $3
   local.get $17
   f64.const -3
   f64.add
   local.get $21
   f64.sub
   f64.sub
   local.get $0
   f64.mul
   f64.add
   local.tee $0
   f64.add
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.tee $3
   f64.const 0.9617967009544373
   f64.mul
   local.set $11
   local.get $3
   f64.const -7.028461650952758e-09
   f64.mul
   local.get $0
   local.get $3
   local.get $18
   f64.sub
   f64.sub
   f64.const 0.9617966939259756
   f64.mul
   f64.add
   f64.const 1.350039202129749e-08
   f64.const 0
   local.get $7
   select
   f64.add
   local.tee $0
   local.get $11
   local.get $0
   f64.add
   f64.const 0.5849624872207642
   f64.const 0
   local.get $7
   select
   local.tee $3
   f64.add
   local.get $4
   f64.convert_i32_s
   local.tee $17
   f64.add
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.tee $0
   local.get $17
   f64.sub
   local.get $3
   f64.sub
   local.get $11
   f64.sub
   f64.sub
  end
  local.set $3
  local.get $1
  local.get $1
  i64.reinterpret_f64
  i64.const -4294967296
  i64.and
  f64.reinterpret_i64
  local.tee $11
  f64.sub
  local.get $0
  f64.mul
  local.get $1
  local.get $3
  f64.mul
  f64.add
  local.tee $1
  local.get $11
  local.get $0
  f64.mul
  local.tee $0
  f64.add
  local.tee $3
  i64.reinterpret_f64
  local.tee $6
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.set $2
  local.get $6
  i32.wrap_i64
  local.set $4
  block $folding-inner1
   block $folding-inner0
    local.get $2
    i32.const 1083179008
    i32.ge_s
    if
     local.get $2
     i32.const 1083179008
     i32.sub
     local.get $4
     i32.or
     local.get $1
     f64.const 8.008566259537294e-17
     f64.add
     local.get $3
     local.get $0
     f64.sub
     f64.gt
     i32.or
     br_if $folding-inner0
    else
     local.get $2
     i32.const 2147483647
     i32.and
     i32.const 1083231232
     i32.ge_u
     i32.const 0
     local.get $2
     i32.const 1064252416
     i32.add
     local.get $4
     i32.or
     local.get $1
     local.get $3
     local.get $0
     f64.sub
     f64.le
     i32.or
     select
     br_if $folding-inner1
    end
    local.get $2
    i32.const 2147483647
    i32.and
    local.tee $7
    i32.const 20
    i32.shr_u
    i32.const 1023
    i32.sub
    local.set $8
    i32.const 0
    local.set $4
    local.get $7
    i32.const 1071644672
    i32.gt_u
    if
     local.get $2
     i32.const 1048576
     local.get $8
     i32.const 1
     i32.add
     i32.shr_s
     i32.add
     local.tee $7
     i32.const 2147483647
     i32.and
     i32.const 20
     i32.shr_u
     i32.const 1023
     i32.sub
     local.set $8
     i32.const 0
     local.get $7
     i32.const 1048575
     i32.and
     i32.const 1048576
     i32.or
     i32.const 20
     local.get $8
     i32.sub
     i32.shr_s
     local.tee $4
     i32.sub
     local.get $4
     local.get $2
     i32.const 0
     i32.lt_s
     select
     local.set $4
     local.get $0
     i32.const 1048575
     local.get $8
     i32.shr_s
     i32.const -1
     i32.xor
     local.get $7
     i32.and
     i64.extend_i32_s
     i64.const 32
     i64.shl
     f64.reinterpret_i64
     f64.sub
     local.set $0
    end
    local.get $1
    local.get $0
    f64.add
    i64.reinterpret_f64
    i64.const -4294967296
    i64.and
    f64.reinterpret_i64
    local.tee $3
    f64.const 0.6931471824645996
    f64.mul
    local.tee $11
    local.get $1
    local.get $3
    local.get $0
    f64.sub
    f64.sub
    f64.const 0.6931471805599453
    f64.mul
    local.get $3
    f64.const -1.904654299957768e-09
    f64.mul
    f64.add
    local.tee $0
    f64.add
    local.tee $1
    local.get $1
    f64.mul
    local.set $3
    local.get $5
    f64.const 1
    local.get $1
    local.get $1
    local.get $3
    local.get $3
    local.get $3
    local.get $3
    local.get $3
    f64.const 4.1381367970572385e-08
    f64.mul
    f64.const -1.6533902205465252e-06
    f64.add
    f64.mul
    f64.const 6.613756321437934e-05
    f64.add
    f64.mul
    f64.const -2.7777777777015593e-03
    f64.add
    f64.mul
    f64.const 0.16666666666666602
    f64.add
    f64.mul
    f64.sub
    local.tee $3
    f64.mul
    local.get $3
    f64.const -2
    f64.add
    f64.div
    local.get $0
    local.get $1
    local.get $11
    f64.sub
    f64.sub
    local.tee $0
    local.get $1
    local.get $0
    f64.mul
    f64.add
    f64.sub
    local.get $1
    f64.sub
    f64.sub
    local.tee $0
    i64.reinterpret_f64
    i64.const 32
    i64.shr_u
    i32.wrap_i64
    local.get $4
    i32.const 20
    i32.shl
    i32.add
    local.tee $2
    i32.const 20
    i32.shr_s
    i32.const 0
    i32.le_s
    if (result f64)
     local.get $0
     local.get $4
     call $~lib/math/NativeMath.scalbn
    else
     local.get $0
     i64.reinterpret_f64
     i64.const 4294967295
     i64.and
     local.get $2
     i64.extend_i32_s
     i64.const 32
     i64.shl
     i64.or
     f64.reinterpret_i64
    end
    f64.mul
    return
   end
   local.get $5
   f64.const 1.e+300
   f64.mul
   f64.const 1.e+300
   f64.mul
   return
  end
  local.get $5
  f64.const 1e-300
  f64.mul
  f64.const 1e-300
  f64.mul
 )
 (func $src/wasm/numeric/ode/computeStepAdjustment (param $0 f64) (param $1 f64) (param $2 i32) (param $3 f64) (param $4 f64) (result f64)
  local.get $3
  local.get $4
  local.get $1
  local.get $0
  f64.div
  f64.const 1
  local.get $2
  f64.convert_i32_s
  f64.div
  call $~lib/math/NativeMath.pow
  f64.const 0.84
  f64.mul
  local.tee $0
  local.get $0
  local.get $4
  f64.gt
  select
  local.get $0
  local.get $3
  f64.lt
  select
 )
 (func $src/wasm/numeric/ode/interpolate (param $0 i32) (param $1 i32) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  f64.const 1
  local.get $4
  local.get $2
  f64.sub
  local.get $3
  local.get $2
  f64.sub
  f64.div
  local.tee $2
  f64.sub
  local.set $3
  loop $for-loop|0
   local.get $5
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $8
    local.get $6
    i32.add
    local.get $3
    local.get $0
    local.get $8
    i32.add
    f64.load
    f64.mul
    local.get $2
    local.get $1
    local.get $8
    i32.add
    f64.load
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/numeric/ode/vectorCopy (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/numeric/ode/wouldOvershoot (param $0 f64) (param $1 f64) (param $2 f64) (param $3 i32) (result i32)
  local.get $0
  local.get $2
  f64.add
  local.tee $0
  local.get $1
  f64.gt
  local.get $0
  local.get $1
  f64.lt
  local.get $3
  select
 )
 (func $src/wasm/numeric/ode/trimStep (param $0 f64) (param $1 f64) (param $2 f64) (param $3 i32) (result f64)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  call $src/wasm/numeric/ode/wouldOvershoot
  if
   local.get $1
   local.get $0
   f64.sub
   return
  end
  local.get $2
 )
 (func $src/wasm/complex/operations/arg (param $0 f64) (param $1 f64) (result f64)
  local.get $1
  local.get $0
  call $~lib/math/NativeMath.atan2
 )
 (func $src/wasm/complex/operations/argArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $3
    i32.const 4
    i32.shl
    i32.add
    local.tee $4
    f64.load offset=8
    local.get $4
    f64.load
    call $~lib/math/NativeMath.atan2
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/complex/operations/conj (param $0 f64) (param $1 f64) (param $2 i32)
  local.get $2
  local.get $0
  f64.store
  local.get $2
  local.get $1
  f64.neg
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/conjArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 4
    i32.shl
    local.tee $5
    local.get $2
    i32.add
    local.tee $4
    local.get $0
    local.get $5
    i32.add
    local.tee $5
    f64.load
    f64.store
    local.get $4
    local.get $5
    f64.load offset=8
    f64.neg
    f64.store offset=8
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/complex/operations/re (param $0 f64) (param $1 f64) (result f64)
  local.get $0
 )
 (func $src/wasm/complex/operations/reArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $3
    i32.const 4
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/complex/operations/im (param $0 f64) (param $1 f64) (result f64)
  local.get $1
 )
 (func $src/wasm/complex/operations/imArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $3
    i32.const 12
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/complex/operations/abs (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $0
  f64.mul
  local.get $1
  local.get $1
  f64.mul
  f64.add
  f64.sqrt
 )
 (func $src/wasm/complex/operations/absArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $3
    i32.const 4
    i32.shl
    i32.add
    local.tee $5
    f64.load
    local.tee $4
    local.get $4
    f64.mul
    local.get $5
    f64.load offset=8
    local.tee $4
    local.get $4
    f64.mul
    f64.add
    f64.sqrt
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/complex/operations/addComplex (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 i32)
  local.get $4
  local.get $0
  local.get $2
  f64.add
  f64.store
  local.get $4
  local.get $1
  local.get $3
  f64.add
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/subComplex (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 i32)
  local.get $4
  local.get $0
  local.get $2
  f64.sub
  f64.store
  local.get $4
  local.get $1
  local.get $3
  f64.sub
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/mulComplex (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 i32)
  local.get $4
  local.get $0
  local.get $2
  f64.mul
  local.get $1
  local.get $3
  f64.mul
  f64.sub
  f64.store
  local.get $4
  local.get $0
  local.get $3
  f64.mul
  local.get $1
  local.get $2
  f64.mul
  f64.add
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/divComplex (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 i32)
  (local $5 f64)
  local.get $4
  local.get $0
  local.get $2
  f64.mul
  local.get $1
  local.get $3
  f64.mul
  f64.add
  local.get $2
  local.get $2
  f64.mul
  local.get $3
  local.get $3
  f64.mul
  f64.add
  local.tee $5
  f64.div
  f64.store
  local.get $4
  local.get $1
  local.get $2
  f64.mul
  local.get $0
  local.get $3
  f64.mul
  f64.sub
  local.get $5
  f64.div
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/sqrtComplex (param $0 f64) (param $1 f64) (param $2 i32)
  (local $3 f64)
  local.get $1
  f64.const 0
  f64.eq
  if
   local.get $0
   f64.const 0
   f64.ge
   if
    local.get $2
    local.get $0
    f64.sqrt
    f64.store
    local.get $2
    f64.const 0
    f64.store offset=8
   else
    local.get $2
    f64.const 0
    f64.store
    local.get $2
    local.get $0
    f64.neg
    f64.sqrt
    f64.store offset=8
   end
  else
   local.get $2
   local.get $0
   local.get $0
   f64.mul
   local.get $1
   local.get $1
   f64.mul
   f64.add
   f64.sqrt
   local.tee $3
   local.get $0
   f64.add
   f64.const 0.5
   f64.mul
   f64.sqrt
   f64.store
   local.get $2
   f64.const 1
   f64.const -1
   local.get $1
   f64.const 0
   f64.ge
   select
   local.get $3
   local.get $0
   f64.sub
   f64.const 0.5
   f64.mul
   f64.sqrt
   f64.mul
   f64.store offset=8
  end
 )
 (func $~lib/math/NativeMath.exp (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  local.get $0
  i64.reinterpret_f64
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $7
  i32.const 31
  i32.shr_u
  local.set $4
  local.get $7
  i32.const 2147483647
  i32.and
  local.tee $7
  i32.const 1082532651
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.ne
   if
    local.get $0
    return
   end
   local.get $0
   f64.const 709.782712893384
   f64.gt
   if
    local.get $0
    f64.const 8988465674311579538646525e283
    f64.mul
    return
   end
   local.get $0
   f64.const -745.1332191019411
   f64.lt
   if
    f64.const 0
    return
   end
  end
  local.get $7
  i32.const 1071001154
  i32.gt_u
  if
   local.get $0
   local.get $0
   f64.const 1.4426950408889634
   f64.mul
   f64.const 0.5
   local.get $0
   f64.copysign
   f64.add
   i32.trunc_sat_f64_s
   i32.const 1
   local.get $4
   i32.const 1
   i32.shl
   i32.sub
   local.get $7
   i32.const 1072734898
   i32.ge_u
   select
   local.tee $2
   f64.convert_i32_s
   f64.const 0.6931471803691238
   f64.mul
   f64.sub
   local.tee $1
   local.get $2
   f64.convert_i32_s
   f64.const 1.9082149292705877e-10
   f64.mul
   local.tee $5
   f64.sub
   local.set $0
  else
   local.get $7
   i32.const 1043333120
   i32.le_u
   if
    local.get $0
    f64.const 1
    f64.add
    return
   end
   local.get $0
   local.set $1
  end
  local.get $0
  local.get $0
  f64.mul
  local.tee $6
  local.get $6
  f64.mul
  local.set $3
  local.get $0
  local.get $0
  local.get $6
  f64.const 0.16666666666666602
  f64.mul
  local.get $3
  local.get $6
  f64.const 6.613756321437934e-05
  f64.mul
  f64.const -2.7777777777015593e-03
  f64.add
  local.get $3
  local.get $6
  f64.const 4.1381367970572385e-08
  f64.mul
  f64.const -1.6533902205465252e-06
  f64.add
  f64.mul
  f64.add
  f64.mul
  f64.add
  f64.sub
  local.tee $0
  f64.mul
  f64.const 2
  local.get $0
  f64.sub
  f64.div
  local.get $5
  f64.sub
  local.get $1
  f64.add
  f64.const 1
  f64.add
  local.set $0
  local.get $2
  if (result f64)
   local.get $0
   local.get $2
   call $~lib/math/NativeMath.scalbn
  else
   local.get $0
  end
 )
 (func $src/wasm/complex/operations/expComplex (param $0 f64) (param $1 f64) (param $2 i32)
  local.get $2
  local.get $0
  call $~lib/math/NativeMath.exp
  local.tee $0
  local.get $1
  call $~lib/math/NativeMath.cos
  f64.mul
  f64.store
  local.get $2
  local.get $0
  local.get $1
  call $~lib/math/NativeMath.sin
  f64.mul
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/logComplex (param $0 f64) (param $1 f64) (param $2 i32)
  local.get $2
  local.get $0
  local.get $0
  f64.mul
  local.get $1
  local.get $1
  f64.mul
  f64.add
  f64.sqrt
  call $~lib/math/NativeMath.log
  f64.store
  local.get $2
  local.get $1
  local.get $0
  call $~lib/math/NativeMath.atan2
  f64.store offset=8
 )
 (func $~lib/math/NativeMath.expm1 (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  local.get $0
  i64.reinterpret_f64
  local.tee $5
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  i32.const 2147483647
  i32.and
  local.set $3
  local.get $5
  i64.const 63
  i64.shr_u
  i32.wrap_i64
  local.set $4
  local.get $3
  i32.const 1078159482
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.ne
   if
    local.get $0
    return
   end
   local.get $4
   if
    f64.const -1
    return
   end
   local.get $0
   f64.const 709.782712893384
   f64.gt
   if
    local.get $0
    f64.const 8988465674311579538646525e283
    f64.mul
    return
   end
  end
  local.get $3
  i32.const 1071001154
  i32.gt_u
  if
   local.get $0
   i32.const 1
   local.get $4
   i32.const 1
   i32.shl
   i32.sub
   local.get $0
   f64.const 1.4426950408889634
   f64.mul
   f64.const 0.5
   local.get $0
   f64.copysign
   f64.add
   i32.trunc_sat_f64_s
   local.get $3
   i32.const 1072734898
   i32.lt_u
   select
   local.tee $1
   f64.convert_i32_s
   local.tee $0
   f64.const 0.6931471803691238
   f64.mul
   f64.sub
   local.tee $2
   local.get $2
   local.get $0
   f64.const 1.9082149292705877e-10
   f64.mul
   local.tee $2
   f64.sub
   local.tee $0
   f64.sub
   local.get $2
   f64.sub
   local.set $2
  else
   local.get $3
   i32.const 1016070144
   i32.lt_u
   if
    local.get $0
    return
   end
  end
  local.get $0
  local.get $0
  f64.const 0.5
  f64.mul
  local.tee $7
  f64.mul
  local.tee $6
  local.get $6
  f64.mul
  local.set $8
  f64.const 3
  local.get $6
  f64.const -0.03333333333333313
  f64.mul
  f64.const 1
  f64.add
  local.get $8
  local.get $6
  f64.const -7.93650757867488e-05
  f64.mul
  f64.const 1.5873015872548146e-03
  f64.add
  local.get $8
  local.get $6
  f64.const -2.0109921818362437e-07
  f64.mul
  f64.const 4.008217827329362e-06
  f64.add
  f64.mul
  f64.add
  f64.mul
  f64.add
  local.tee $8
  local.get $7
  f64.mul
  f64.sub
  local.set $7
  local.get $6
  local.get $8
  local.get $7
  f64.sub
  f64.const 6
  local.get $0
  local.get $7
  f64.mul
  f64.sub
  f64.div
  f64.mul
  local.set $7
  local.get $1
  i32.eqz
  if
   local.get $0
   local.get $0
   local.get $7
   f64.mul
   local.get $6
   f64.sub
   f64.sub
   return
  end
  local.get $0
  local.get $7
  local.get $2
  f64.sub
  f64.mul
  local.get $2
  f64.sub
  local.get $6
  f64.sub
  local.set $2
  local.get $1
  i32.const -1
  i32.eq
  if
   local.get $0
   local.get $2
   f64.sub
   f64.const 0.5
   f64.mul
   f64.const -0.5
   f64.add
   return
  end
  local.get $1
  i32.const 1
  i32.eq
  if
   local.get $0
   f64.const -0.25
   f64.lt
   if
    local.get $2
    local.get $0
    f64.const 0.5
    f64.add
    f64.sub
    f64.const -2
    f64.mul
    return
   end
   local.get $0
   local.get $2
   f64.sub
   f64.const 2
   f64.mul
   f64.const 1
   f64.add
   return
  end
  local.get $1
  i64.extend_i32_s
  i64.const 1023
  i64.add
  i64.const 52
  i64.shl
  f64.reinterpret_i64
  local.set $6
  local.get $1
  i32.const 0
  i32.lt_s
  local.get $1
  i32.const 56
  i32.gt_s
  i32.or
  if
   local.get $0
   local.get $2
   f64.sub
   f64.const 1
   f64.add
   local.tee $0
   local.get $0
   f64.add
   f64.const 8988465674311579538646525e283
   f64.mul
   local.get $0
   local.get $6
   f64.mul
   local.get $1
   i32.const 1024
   i32.eq
   select
   f64.const -1
   f64.add
   return
  end
  local.get $0
  f64.const 1
  i64.const 1023
  local.get $1
  i64.extend_i32_s
  i64.sub
  i64.const 52
  i64.shl
  f64.reinterpret_i64
  local.tee $0
  f64.sub
  local.get $2
  f64.sub
  f64.const 1
  local.get $2
  local.get $0
  f64.add
  f64.sub
  local.get $1
  i32.const 20
  i32.lt_s
  select
  f64.add
  local.get $6
  f64.mul
 )
 (func $~lib/math/NativeMath.cosh (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 i64)
  local.get $0
  i64.reinterpret_f64
  i64.const 9223372036854775807
  i64.and
  local.tee $2
  f64.reinterpret_i64
  local.set $0
  local.get $2
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $1
  i32.const 1072049730
  i32.lt_u
  if
   local.get $1
   i32.const 1045430272
   i32.lt_u
   if
    f64.const 1
    return
   end
   local.get $0
   call $~lib/math/NativeMath.expm1
   local.tee $0
   local.get $0
   f64.mul
   local.get $0
   local.get $0
   f64.add
   f64.const 2
   f64.add
   f64.div
   f64.const 1
   f64.add
   return
  end
  local.get $1
  i32.const 1082535490
  i32.lt_u
  if
   local.get $0
   call $~lib/math/NativeMath.exp
   local.tee $0
   f64.const 1
   local.get $0
   f64.div
   f64.add
   f64.const 0.5
   f64.mul
   return
  end
  local.get $0
  f64.const -1416.0996898839683
  f64.add
  call $~lib/math/NativeMath.exp
  f64.const 2247116418577894884661631e283
  f64.mul
  f64.const 2247116418577894884661631e283
  f64.mul
 )
 (func $~lib/math/NativeMath.sinh (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 i32)
  (local $3 i64)
  (local $4 f64)
  local.get $0
  i64.reinterpret_f64
  i64.const 9223372036854775807
  i64.and
  local.tee $3
  f64.reinterpret_i64
  local.set $4
  f64.const 0.5
  local.get $0
  f64.copysign
  local.set $1
  local.get $3
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $2
  i32.const 1082535490
  i32.lt_u
  if
   local.get $4
   call $~lib/math/NativeMath.expm1
   local.set $4
   local.get $2
   i32.const 1072693248
   i32.lt_u
   if
    local.get $2
    i32.const 1045430272
    i32.lt_u
    if
     local.get $0
     return
    end
    local.get $1
    local.get $4
    local.get $4
    f64.add
    local.get $4
    local.get $4
    f64.mul
    local.get $4
    f64.const 1
    f64.add
    f64.div
    f64.sub
    f64.mul
    return
   end
   local.get $1
   local.get $4
   local.get $4
   local.get $4
   f64.const 1
   f64.add
   f64.div
   f64.add
   f64.mul
   return
  end
  local.get $4
  f64.const -1416.0996898839683
  f64.add
  call $~lib/math/NativeMath.exp
  local.get $1
  local.get $1
  f64.add
  f64.const 2247116418577894884661631e283
  f64.mul
  f64.mul
  f64.const 2247116418577894884661631e283
  f64.mul
 )
 (func $src/wasm/complex/operations/sinComplex (param $0 f64) (param $1 f64) (param $2 i32)
  local.get $2
  local.get $0
  call $~lib/math/NativeMath.sin
  local.get $1
  call $~lib/math/NativeMath.cosh
  f64.mul
  f64.store
  local.get $2
  local.get $0
  call $~lib/math/NativeMath.cos
  local.get $1
  call $~lib/math/NativeMath.sinh
  f64.mul
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/cosComplex (param $0 f64) (param $1 f64) (param $2 i32)
  local.get $2
  local.get $0
  call $~lib/math/NativeMath.cos
  local.get $1
  call $~lib/math/NativeMath.cosh
  f64.mul
  f64.store
  local.get $2
  local.get $0
  call $~lib/math/NativeMath.sin
  f64.neg
  local.get $1
  call $~lib/math/NativeMath.sinh
  f64.mul
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/tanComplex (param $0 f64) (param $1 f64) (param $2 i32)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  local.get $0
  call $~lib/math/NativeMath.sin
  local.get $1
  call $~lib/math/NativeMath.cosh
  f64.mul
  local.set $4
  local.get $0
  call $~lib/math/NativeMath.cos
  local.get $1
  call $~lib/math/NativeMath.sinh
  f64.mul
  local.set $5
  local.get $0
  call $~lib/math/NativeMath.cos
  local.get $1
  call $~lib/math/NativeMath.cosh
  f64.mul
  local.tee $3
  local.get $3
  f64.mul
  local.get $0
  call $~lib/math/NativeMath.sin
  f64.neg
  local.get $1
  call $~lib/math/NativeMath.sinh
  f64.mul
  local.tee $0
  local.get $0
  f64.mul
  f64.add
  local.set $1
  local.get $2
  local.get $4
  local.get $3
  f64.mul
  local.get $5
  local.get $0
  f64.mul
  f64.add
  local.get $1
  f64.div
  f64.store
  local.get $2
  local.get $5
  local.get $3
  f64.mul
  local.get $4
  local.get $0
  f64.mul
  f64.sub
  local.get $1
  f64.div
  f64.store offset=8
 )
 (func $src/wasm/complex/operations/powComplexReal (param $0 f64) (param $1 f64) (param $2 f64) (param $3 i32)
  (local $4 f64)
  local.get $1
  local.get $0
  call $~lib/math/NativeMath.atan2
  local.set $4
  local.get $3
  local.get $0
  local.get $0
  f64.mul
  local.get $1
  local.get $1
  f64.mul
  f64.add
  f64.sqrt
  local.get $2
  call $~lib/math/NativeMath.pow
  local.tee $0
  local.get $2
  local.get $4
  f64.mul
  local.tee $1
  call $~lib/math/NativeMath.cos
  f64.mul
  f64.store
  local.get $3
  local.get $0
  local.get $1
  call $~lib/math/NativeMath.sin
  f64.mul
  f64.store offset=8
 )
 (func $src/wasm/geometry/operations/distance2D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (result f64)
  local.get $2
  local.get $0
  f64.sub
  local.tee $0
  local.get $0
  f64.mul
  local.get $3
  local.get $1
  f64.sub
  local.tee $0
  local.get $0
  f64.mul
  f64.add
  f64.sqrt
 )
 (func $src/wasm/geometry/operations/distance3D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (result f64)
  local.get $3
  local.get $0
  f64.sub
  local.tee $0
  local.get $0
  f64.mul
  local.get $4
  local.get $1
  f64.sub
  local.tee $0
  local.get $0
  f64.mul
  f64.add
  local.get $5
  local.get $2
  f64.sub
  local.tee $0
  local.get $0
  f64.mul
  f64.add
  f64.sqrt
 )
 (func $src/wasm/geometry/operations/distanceND (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $1
    i32.add
    f64.load
    local.get $0
    local.get $5
    i32.add
    f64.load
    f64.sub
    local.tee $3
    local.get $3
    f64.mul
    f64.add
    local.set $3
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  f64.sqrt
 )
 (func $src/wasm/geometry/operations/manhattanDistance2D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (result f64)
  local.get $2
  local.get $0
  f64.sub
  f64.abs
  local.get $3
  local.get $1
  f64.sub
  f64.abs
  f64.add
 )
 (func $src/wasm/geometry/operations/manhattanDistanceND (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $4
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $1
    i32.add
    f64.load
    local.get $0
    local.get $5
    i32.add
    f64.load
    f64.sub
    f64.abs
    f64.add
    local.set $4
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $4
 )
 (func $src/wasm/geometry/operations/intersect2DLines (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (param $8 i32)
  (local $9 f64)
  (local $10 f64)
  local.get $0
  local.get $2
  f64.sub
  local.get $5
  local.get $7
  f64.sub
  f64.mul
  local.get $1
  local.get $3
  f64.sub
  local.get $4
  local.get $6
  f64.sub
  f64.mul
  f64.sub
  local.tee $9
  f64.abs
  f64.const 1e-10
  f64.lt
  if
   local.get $8
   f64.const 0
   f64.store
   local.get $8
   f64.const 0
   f64.store offset=8
   local.get $8
   f64.const 0
   f64.store offset=16
   return
  end
  local.get $0
  local.get $4
  f64.sub
  local.tee $10
  local.get $5
  local.get $7
  f64.sub
  f64.mul
  local.get $1
  local.get $5
  f64.sub
  local.tee $5
  local.get $4
  local.get $6
  f64.sub
  f64.mul
  f64.sub
  local.get $9
  f64.div
  local.tee $4
  f64.const 1
  f64.le
  local.get $4
  f64.const 0
  f64.ge
  i32.and
  local.get $0
  local.get $2
  f64.sub
  local.get $5
  f64.mul
  local.get $1
  local.get $3
  f64.sub
  local.get $10
  f64.mul
  f64.sub
  f64.neg
  local.get $9
  f64.div
  local.tee $5
  f64.const 0
  f64.ge
  i32.and
  local.get $5
  f64.const 1
  f64.le
  i32.and
  if
   local.get $8
   local.get $0
   local.get $4
   local.get $2
   local.get $0
   f64.sub
   f64.mul
   f64.add
   f64.store
   local.get $8
   local.get $1
   local.get $4
   local.get $3
   local.get $1
   f64.sub
   f64.mul
   f64.add
   f64.store offset=8
   local.get $8
   f64.const 1
   f64.store offset=16
  else
   local.get $8
   local.get $0
   local.get $4
   local.get $2
   local.get $0
   f64.sub
   f64.mul
   f64.add
   f64.store
   local.get $8
   local.get $1
   local.get $4
   local.get $3
   local.get $1
   f64.sub
   f64.mul
   f64.add
   f64.store offset=8
   local.get $8
   f64.const 0
   f64.store offset=16
  end
 )
 (func $src/wasm/geometry/operations/intersect2DInfiniteLines (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (param $8 i32)
  (local $9 f64)
  local.get $0
  local.get $2
  f64.sub
  local.get $5
  local.get $7
  f64.sub
  f64.mul
  local.get $1
  local.get $3
  f64.sub
  local.get $4
  local.get $6
  f64.sub
  f64.mul
  f64.sub
  local.tee $9
  f64.abs
  f64.const 1e-10
  f64.lt
  if
   local.get $8
   f64.const 0
   f64.store
   local.get $8
   f64.const 0
   f64.store offset=8
   local.get $8
   f64.const 0
   f64.store offset=16
   return
  end
  local.get $8
  local.get $0
  local.get $0
  local.get $4
  f64.sub
  local.get $5
  local.get $7
  f64.sub
  f64.mul
  local.get $1
  local.get $5
  f64.sub
  local.get $4
  local.get $6
  f64.sub
  f64.mul
  f64.sub
  local.get $9
  f64.div
  local.tee $4
  local.get $2
  local.get $0
  f64.sub
  f64.mul
  f64.add
  f64.store
  local.get $8
  local.get $1
  local.get $4
  local.get $3
  local.get $1
  f64.sub
  f64.mul
  f64.add
  f64.store offset=8
  local.get $8
  f64.const 1
  f64.store offset=16
 )
 (func $src/wasm/geometry/operations/intersectLinePlane (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (param $8 f64) (param $9 f64) (param $10 i32)
  (local $11 f64)
  local.get $6
  local.get $3
  f64.mul
  local.get $7
  local.get $4
  f64.mul
  f64.add
  local.get $8
  local.get $5
  f64.mul
  f64.add
  local.tee $11
  f64.abs
  f64.const 1e-10
  f64.lt
  if
   local.get $10
   f64.const 0
   f64.store
   local.get $10
   f64.const 0
   f64.store offset=8
   local.get $10
   f64.const 0
   f64.store offset=16
   local.get $10
   f64.const 0
   f64.store offset=24
   return
  end
  local.get $10
  local.get $0
  local.get $6
  local.get $0
  f64.mul
  local.get $7
  local.get $1
  f64.mul
  f64.add
  local.get $8
  local.get $2
  f64.mul
  f64.add
  local.get $9
  f64.add
  f64.neg
  local.get $11
  f64.div
  local.tee $0
  local.get $3
  f64.mul
  f64.add
  f64.store
  local.get $10
  local.get $1
  local.get $0
  local.get $4
  f64.mul
  f64.add
  f64.store offset=8
  local.get $10
  local.get $2
  local.get $0
  local.get $5
  f64.mul
  f64.add
  f64.store offset=16
  local.get $10
  f64.const 1
  f64.store offset=24
 )
 (func $src/wasm/geometry/operations/cross3D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 i32)
  local.get $6
  local.get $1
  local.get $5
  f64.mul
  local.get $2
  local.get $4
  f64.mul
  f64.sub
  f64.store
  local.get $6
  local.get $2
  local.get $3
  f64.mul
  local.get $0
  local.get $5
  f64.mul
  f64.sub
  f64.store offset=8
  local.get $6
  local.get $0
  local.get $4
  f64.mul
  local.get $1
  local.get $3
  f64.mul
  f64.sub
  f64.store offset=16
 )
 (func $~lib/math/R (param $0 f64) (result f64)
  local.get $0
  local.get $0
  local.get $0
  local.get $0
  local.get $0
  local.get $0
  f64.const 3.479331075960212e-05
  f64.mul
  f64.const 7.915349942898145e-04
  f64.add
  f64.mul
  f64.const -0.04005553450067941
  f64.add
  f64.mul
  f64.const 0.20121253213486293
  f64.add
  f64.mul
  f64.const -0.3255658186224009
  f64.add
  f64.mul
  f64.const 0.16666666666666666
  f64.add
  f64.mul
  local.get $0
  local.get $0
  local.get $0
  local.get $0
  f64.const 0.07703815055590194
  f64.mul
  f64.const -0.6882839716054533
  f64.add
  f64.mul
  f64.const 2.0209457602335057
  f64.add
  f64.mul
  f64.const -2.403394911734414
  f64.add
  f64.mul
  f64.const 1
  f64.add
  f64.div
 )
 (func $~lib/math/NativeMath.acos (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  local.get $0
  i64.reinterpret_f64
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $2
  i32.const 2147483647
  i32.and
  local.tee $1
  i32.const 1072693248
  i32.ge_u
  if
   local.get $0
   i64.reinterpret_f64
   i32.wrap_i64
   local.get $1
   i32.const 1072693248
   i32.sub
   i32.or
   i32.eqz
   if
    local.get $2
    i32.const 0
    i32.lt_s
    if
     f64.const 3.141592653589793
     return
    end
    f64.const 0
    return
   end
   f64.const 0
   local.get $0
   local.get $0
   f64.sub
   f64.div
   return
  end
  local.get $1
  i32.const 1071644672
  i32.lt_u
  if
   local.get $1
   i32.const 1012924416
   i32.le_u
   if
    f64.const 1.5707963267948966
    return
   end
   f64.const 1.5707963267948966
   local.get $0
   f64.const 6.123233995736766e-17
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   call $~lib/math/R
   f64.mul
   f64.sub
   f64.sub
   f64.sub
   return
  end
  local.get $2
  i32.const 0
  i32.lt_s
  if
   f64.const 1.5707963267948966
   local.get $0
   f64.const 0.5
   f64.mul
   f64.const 0.5
   f64.add
   local.tee $0
   f64.sqrt
   local.tee $3
   local.get $0
   call $~lib/math/R
   local.get $3
   f64.mul
   f64.const -6.123233995736766e-17
   f64.add
   f64.add
   f64.sub
   f64.const 2
   f64.mul
   return
  end
  f64.const 0.5
  local.get $0
  f64.const 0.5
  f64.mul
  f64.sub
  local.tee $3
  f64.sqrt
  local.tee $4
  i64.reinterpret_f64
  i64.const -4294967296
  i64.and
  f64.reinterpret_i64
  local.tee $0
  local.get $3
  call $~lib/math/R
  local.get $4
  f64.mul
  local.get $3
  local.get $0
  local.get $0
  f64.mul
  f64.sub
  local.get $4
  local.get $0
  f64.add
  f64.div
  f64.add
  f64.add
  f64.const 2
  f64.mul
 )
 (func $src/wasm/geometry/operations/angle2D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (result f64)
  (local $4 f64)
  (local $5 f64)
  local.get $2
  local.get $2
  f64.mul
  local.get $3
  local.get $3
  f64.mul
  f64.add
  f64.sqrt
  local.tee $4
  f64.const 1e-10
  f64.lt
  local.get $0
  local.get $0
  f64.mul
  local.get $1
  local.get $1
  f64.mul
  f64.add
  f64.sqrt
  local.tee $5
  f64.const 1e-10
  f64.lt
  i32.or
  if
   f64.const 0
   return
  end
  local.get $0
  local.get $2
  f64.mul
  local.get $1
  local.get $3
  f64.mul
  f64.add
  local.get $5
  local.get $4
  f64.mul
  f64.div
  local.tee $0
  f64.const 1
  f64.gt
  if
   f64.const 1
   local.set $0
  end
  f64.const -1
  local.get $0
  local.get $0
  f64.const -1
  f64.lt
  select
  call $~lib/math/NativeMath.acos
 )
 (func $src/wasm/geometry/operations/angle3D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (result f64)
  (local $6 f64)
  (local $7 f64)
  local.get $3
  local.get $3
  f64.mul
  local.get $4
  local.get $4
  f64.mul
  f64.add
  local.get $5
  local.get $5
  f64.mul
  f64.add
  f64.sqrt
  local.tee $6
  f64.const 1e-10
  f64.lt
  local.get $0
  local.get $0
  f64.mul
  local.get $1
  local.get $1
  f64.mul
  f64.add
  local.get $2
  local.get $2
  f64.mul
  f64.add
  f64.sqrt
  local.tee $7
  f64.const 1e-10
  f64.lt
  i32.or
  if
   f64.const 0
   return
  end
  local.get $0
  local.get $3
  f64.mul
  local.get $1
  local.get $4
  f64.mul
  f64.add
  local.get $2
  local.get $5
  f64.mul
  f64.add
  local.get $7
  local.get $6
  f64.mul
  f64.div
  local.tee $0
  f64.const 1
  f64.gt
  if
   f64.const 1
   local.set $0
  end
  f64.const -1
  local.get $0
  local.get $0
  f64.const -1
  f64.lt
  select
  call $~lib/math/NativeMath.acos
 )
 (func $src/wasm/geometry/operations/triangleArea2D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (result f64)
  local.get $0
  local.get $3
  local.get $5
  f64.sub
  f64.mul
  local.get $2
  local.get $5
  local.get $1
  f64.sub
  f64.mul
  f64.add
  local.get $4
  local.get $1
  local.get $3
  f64.sub
  f64.mul
  f64.add
  f64.const 0.5
  f64.mul
  f64.abs
 )
 (func $src/wasm/geometry/operations/pointInTriangle2D (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (result f64)
  local.get $2
  local.get $3
  local.get $4
  local.get $5
  local.get $6
  local.get $7
  call $src/wasm/geometry/operations/triangleArea2D
  local.get $0
  local.get $1
  local.get $4
  local.get $5
  local.get $6
  local.get $7
  call $src/wasm/geometry/operations/triangleArea2D
  local.get $2
  local.get $3
  local.get $0
  local.get $1
  local.get $6
  local.get $7
  call $src/wasm/geometry/operations/triangleArea2D
  f64.add
  local.get $2
  local.get $3
  local.get $4
  local.get $5
  local.get $0
  local.get $1
  call $src/wasm/geometry/operations/triangleArea2D
  f64.add
  f64.sub
  f64.abs
  f64.const 1e-10
  f64.lt
  if
   f64.const 1
   return
  end
  f64.const 0
 )
 (func $src/wasm/geometry/operations/normalizeND (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.gt_s
   if
    local.get $4
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $4
    local.get $4
    f64.mul
    f64.add
    local.set $4
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $4
  f64.sqrt
  local.tee $4
  f64.const 1e-10
  f64.lt
  if
   loop $for-loop|1
    local.get $1
    local.get $3
    i32.gt_s
    if
     local.get $2
     local.get $3
     i32.const 3
     i32.shl
     i32.add
     f64.const 0
     f64.store
     local.get $3
     i32.const 1
     i32.add
     local.set $3
     br $for-loop|1
    end
   end
   return
  end
  loop $for-loop|2
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $2
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $4
    f64.div
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/logical/operations/and (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  i32.const 0
  local.get $0
  select
  i32.eqz
  i32.eqz
 )
 (func $src/wasm/logical/operations/or (param $0 i32) (param $1 i32) (result i32)
  i32.const 1
  local.get $1
  local.get $0
  select
  i32.eqz
  i32.eqz
 )
 (func $src/wasm/logical/operations/not (param $0 i32) (result i32)
  local.get $0
  i32.eqz
 )
 (func $src/wasm/logical/operations/xor (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  i32.const 0
  i32.ne
  local.tee $1
  local.get $0
  i32.const 0
  i32.ne
  local.tee $0
  i32.eqz
  i32.and
  local.get $1
  i32.eqz
  local.get $0
  i32.and
  i32.or
 )
 (func $src/wasm/logical/operations/nand (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  i32.const 0
  local.get $0
  select
  i32.eqz
 )
 (func $src/wasm/logical/operations/nor (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.or
  i32.eqz
 )
 (func $src/wasm/logical/operations/xnor (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  i32.const 0
  i32.ne
  local.get $1
  i32.const 0
  i32.ne
  i32.eq
 )
 (func $src/wasm/logical/operations/all (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eqz
    if
     i32.const 0
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $src/wasm/logical/operations/any (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    if
     i32.const 1
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const 0
 )
 (func $src/wasm/logical/operations/countTrue (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $3
    i32.const 1
    i32.add
    local.get $3
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    select
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/logical/operations/findFirst (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    if
     local.get $2
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const -1
 )
 (func $src/wasm/logical/operations/findLast (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  i32.const 1
  i32.sub
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 0
   i32.ge_s
   if
    local.get $0
    local.get $1
    i32.const 2
    i32.shl
    i32.add
    i32.load
    if
     local.get $1
     return
    end
    local.get $1
    i32.const 1
    i32.sub
    local.set $1
    br $for-loop|0
   end
  end
  i32.const -1
 )
 (func $src/wasm/logical/operations/findAll (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    i32.load
    if
     local.get $2
     local.get $3
     i32.const 2
     i32.shl
     i32.add
     local.get $4
     i32.store
     local.get $3
     i32.const 1
     i32.add
     local.set $3
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/logical/operations/select (param $0 i32) (param $1 f64) (param $2 f64) (result f64)
  local.get $1
  local.get $2
  local.get $0
  select
 )
 (func $src/wasm/logical/operations/selectArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  loop $for-loop|0
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 3
    i32.shl
    local.tee $6
    local.get $4
    i32.add
    local.get $1
    local.get $6
    i32.add
    f64.load
    local.get $2
    local.get $6
    i32.add
    f64.load
    local.get $0
    local.get $5
    i32.const 2
    i32.shl
    i32.add
    i32.load
    select
    f64.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/logical/operations/andArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $1
    local.get $5
    i32.add
    i32.load
    i32.const 0
    local.get $0
    local.get $5
    i32.add
    i32.load
    select
    i32.eqz
    i32.eqz
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/logical/operations/orArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    i32.const 1
    local.get $1
    local.get $5
    i32.add
    i32.load
    local.get $0
    local.get $5
    i32.add
    i32.load
    select
    i32.eqz
    i32.eqz
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/logical/operations/notArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 2
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    i32.load
    i32.eqz
    i32.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/logical/operations/xorArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    i32.load
    i32.const 0
    i32.ne
    local.set $5
    local.get $3
    local.get $6
    i32.add
    local.get $1
    local.get $6
    i32.add
    i32.load
    i32.const 0
    i32.ne
    local.tee $6
    local.get $5
    i32.eqz
    i32.and
    local.get $6
    i32.eqz
    local.get $5
    i32.and
    i32.or
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/compare (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.lt
  if
   i32.const -1
   return
  end
  local.get $0
  local.get $1
  f64.gt
  if
   i32.const 1
   return
  end
  i32.const 0
 )
 (func $src/wasm/relational/operations/compareArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 f64)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.set $5
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $0
    i32.add
    f64.load
    local.tee $7
    local.get $1
    local.get $6
    i32.add
    f64.load
    local.tee $8
    f64.lt
    if
     local.get $3
     local.get $5
     i32.add
     i32.const -1
     i32.store
    else
     local.get $7
     local.get $8
     f64.gt
     if
      local.get $3
      local.get $5
      i32.add
      i32.const 1
      i32.store
     else
      local.get $3
      local.get $5
      i32.add
      i32.const 0
      i32.store
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/equal (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.eq
 )
 (func $src/wasm/relational/operations/nearlyEqual (param $0 f64) (param $1 f64) (param $2 f64) (result i32)
  local.get $2
  local.get $0
  local.get $1
  f64.sub
  f64.abs
  f64.ge
 )
 (func $src/wasm/relational/operations/equalArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.eq
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/unequal (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.ne
 )
 (func $src/wasm/relational/operations/unequalArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.ne
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/larger (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.gt
 )
 (func $src/wasm/relational/operations/largerArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.gt
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/largerEq (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.ge
 )
 (func $src/wasm/relational/operations/largerEqArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.ge
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/smaller (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.lt
 )
 (func $src/wasm/relational/operations/smallerArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.lt
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/smallerEq (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.le
 )
 (func $src/wasm/relational/operations/smallerEqArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $0
    i32.add
    f64.load
    local.get $1
    local.get $5
    i32.add
    f64.load
    f64.le
    i32.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/min (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 i32)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.load
  local.set $2
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $3
    local.get $2
    f64.lt
    if
     local.get $3
     local.set $2
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/relational/operations/max (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 i32)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.load
  local.set $2
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $3
    local.get $2
    f64.gt
    if
     local.get $3
     local.set $2
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/relational/operations/argmin (param $0 i32) (param $1 i32) (result i32)
  (local $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   i32.const -1
   return
  end
  local.get $0
  f64.load
  local.set $2
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $5
    local.get $2
    f64.lt
    if
     local.get $4
     local.set $3
     local.get $5
     local.set $2
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/relational/operations/argmax (param $0 i32) (param $1 i32) (result i32)
  (local $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   i32.const -1
   return
  end
  local.get $0
  f64.load
  local.set $2
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $5
    local.get $2
    f64.gt
    if
     local.get $4
     local.set $3
     local.get $5
     local.set $2
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/relational/operations/clamp (param $0 f64) (param $1 f64) (param $2 f64) (result f64)
  local.get $0
  local.get $1
  f64.lt
  if
   local.get $1
   return
  end
  local.get $0
  local.get $2
  f64.gt
  if
   local.get $2
   return
  end
  local.get $0
 )
 (func $src/wasm/relational/operations/clampArray (param $0 i32) (param $1 f64) (param $2 f64) (param $3 i32) (param $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_s
   if
    local.get $6
    i32.const 3
    i32.shl
    local.tee $7
    local.get $0
    i32.add
    f64.load
    local.tee $5
    local.get $1
    f64.lt
    if
     local.get $1
     local.set $5
    end
    local.get $2
    local.get $5
    f64.lt
    if
     local.get $2
     local.set $5
    end
    local.get $4
    local.get $7
    i32.add
    local.get $5
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/inRange (param $0 f64) (param $1 f64) (param $2 f64) (result i32)
  local.get $0
  local.get $2
  f64.le
  local.get $0
  local.get $1
  f64.ge
  i32.and
 )
 (func $src/wasm/relational/operations/inRangeArray (param $0 i32) (param $1 f64) (param $2 f64) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 f64)
  loop $for-loop|0
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $4
    local.get $5
    i32.const 2
    i32.shl
    i32.add
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $6
    local.get $1
    f64.ge
    local.get $2
    local.get $6
    f64.ge
    i32.and
    i32.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/relational/operations/isPositive (param $0 f64) (result i32)
  local.get $0
  f64.const 0
  f64.gt
 )
 (func $src/wasm/relational/operations/isNegative (param $0 f64) (result i32)
  local.get $0
  f64.const 0
  f64.lt
 )
 (func $src/wasm/relational/operations/isZero (param $0 f64) (result i32)
  local.get $0
  f64.const 0
  f64.eq
 )
 (func $src/wasm/relational/operations/isNaN (param $0 f64) (result i32)
  local.get $0
  local.get $0
  f64.ne
 )
 (func $src/wasm/relational/operations/isFinite (param $0 f64) (result i32)
  local.get $0
  local.get $0
  f64.eq
  local.get $0
  f64.const inf
  f64.ne
  i32.and
  local.get $0
  f64.const -inf
  f64.ne
  i32.and
 )
 (func $src/wasm/relational/operations/isInteger (param $0 f64) (result i32)
  local.get $0
  local.get $0
  f64.floor
  f64.eq
 )
 (func $src/wasm/relational/operations/sign (param $0 f64) (result i32)
  local.get $0
  f64.const 0
  f64.gt
  if
   i32.const 1
   return
  end
  local.get $0
  f64.const 0
  f64.lt
  if
   i32.const -1
   return
  end
  i32.const 0
 )
 (func $src/wasm/relational/operations/signArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 2
    i32.shl
    local.set $4
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $5
    f64.const 0
    f64.gt
    if
     local.get $2
     local.get $4
     i32.add
     i32.const 1
     i32.store
    else
     local.get $5
     f64.const 0
     f64.lt
     if
      local.get $2
      local.get $4
      i32.add
      i32.const -1
      i32.store
     else
      local.get $2
      local.get $4
      i32.add
      i32.const 0
      i32.store
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/set/operations/quicksort (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  local.get $1
  local.get $2
  i32.ge_s
  if
   return
  end
  local.get $0
  local.get $1
  local.get $2
  i32.add
  i32.const 1
  i32.shr_s
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.set $5
  local.get $1
  local.set $3
  local.get $2
  local.set $4
  loop $while-continue|0
   local.get $3
   local.get $4
   i32.le_s
   if
    loop $while-continue|1
     local.get $0
     local.get $3
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.get $5
     f64.lt
     if
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $while-continue|1
     end
    end
    loop $while-continue|2
     local.get $0
     local.get $4
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.get $5
     f64.gt
     if
      local.get $4
      i32.const 1
      i32.sub
      local.set $4
      br $while-continue|2
     end
    end
    local.get $3
    local.get $4
    i32.le_s
    if
     local.get $0
     local.get $3
     i32.const 3
     i32.shl
     i32.add
     local.tee $7
     f64.load
     local.set $6
     local.get $7
     local.get $0
     local.get $4
     i32.const 3
     i32.shl
     i32.add
     local.tee $7
     f64.load
     f64.store
     local.get $7
     local.get $6
     f64.store
     local.get $4
     i32.const 1
     i32.sub
     local.set $4
     local.get $3
     i32.const 1
     i32.add
     local.set $3
    end
    br $while-continue|0
   end
  end
  local.get $1
  local.get $4
  i32.lt_s
  if
   local.get $0
   local.get $1
   local.get $4
   call $src/wasm/set/operations/quicksort
  end
  local.get $2
  local.get $3
  i32.gt_s
  if
   local.get $0
   local.get $3
   local.get $2
   call $src/wasm/set/operations/quicksort
  end
 )
 (func $src/wasm/set/operations/createSet (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   i32.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i32.const 0
  local.get $1
  i32.const 1
  i32.sub
  call $src/wasm/set/operations/quicksort
  i32.const 1
  local.set $0
  i32.const 1
  local.set $3
  loop $for-loop|1
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $5
    local.get $2
    local.get $0
    i32.const 1
    i32.sub
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.ne
    if
     local.get $2
     local.get $0
     i32.const 3
     i32.shl
     i32.add
     local.get $5
     f64.store
     local.get $0
     i32.const 1
     i32.add
     local.set $0
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  local.get $0
 )
 (func $src/wasm/set/operations/setUnion (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $1
  local.get $3
  i32.or
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  i32.eqz
  if
   loop $for-loop|0
    local.get $3
    local.get $5
    i32.gt_s
    if
     local.get $5
     i32.const 3
     i32.shl
     local.tee $0
     local.get $4
     i32.add
     local.get $0
     local.get $2
     i32.add
     f64.load
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
   local.get $3
   return
  end
  local.get $3
  i32.eqz
  if
   loop $for-loop|1
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $5
     i32.const 3
     i32.shl
     local.tee $2
     local.get $4
     i32.add
     local.get $0
     local.get $2
     i32.add
     f64.load
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|1
    end
   end
   local.get $1
   return
  end
  loop $while-continue|2
   local.get $3
   local.get $7
   i32.gt_s
   local.get $1
   local.get $6
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $8
    local.get $2
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $9
    f64.lt
    if
     local.get $4
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     local.get $8
     f64.store
     local.get $6
     i32.const 1
     i32.add
     local.set $6
    else
     local.get $8
     local.get $9
     f64.gt
     if
      local.get $4
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      local.get $9
      f64.store
     else
      local.get $4
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      local.get $8
      f64.store
      local.get $6
      i32.const 1
      i32.add
      local.set $6
     end
     local.get $7
     i32.const 1
     i32.add
     local.set $7
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|2
   end
  end
  loop $while-continue|3
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $4
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|3
   end
  end
  loop $while-continue|4
   local.get $3
   local.get $7
   i32.gt_s
   if
    local.get $4
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    local.get $2
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|4
   end
  end
  local.get $5
 )
 (func $src/wasm/set/operations/setIntersect (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $3
  i32.eqz
  local.get $1
  i32.eqz
  i32.or
  if
   i32.const 0
   return
  end
  loop $while-continue|0
   local.get $3
   local.get $6
   i32.gt_s
   local.get $1
   local.get $5
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $8
    local.get $2
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $9
    f64.lt
    if (result i32)
     local.get $5
     i32.const 1
     i32.add
    else
     local.get $6
     i32.const 1
     i32.add
     local.set $6
     local.get $8
     local.get $9
     f64.gt
     if (result i32)
      local.get $5
     else
      local.get $4
      local.get $7
      i32.const 3
      i32.shl
      i32.add
      local.get $8
      f64.store
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      local.get $5
      i32.const 1
      i32.add
     end
    end
    local.set $5
    br $while-continue|0
   end
  end
  local.get $7
 )
 (func $src/wasm/set/operations/setDifference (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $1
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $3
  i32.eqz
  if
   loop $for-loop|0
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $5
     i32.const 3
     i32.shl
     local.tee $2
     local.get $4
     i32.add
     local.get $0
     local.get $2
     i32.add
     f64.load
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
   local.get $1
   return
  end
  loop $while-continue|1
   local.get $3
   local.get $7
   i32.gt_s
   local.get $1
   local.get $5
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $8
    local.get $2
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $9
    f64.lt
    if (result i32)
     local.get $4
     local.get $6
     i32.const 3
     i32.shl
     i32.add
     local.get $8
     f64.store
     local.get $6
     i32.const 1
     i32.add
     local.set $6
     local.get $5
     i32.const 1
     i32.add
    else
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     local.get $5
     local.get $5
     i32.const 1
     i32.add
     local.get $8
     local.get $9
     f64.gt
     select
    end
    local.set $5
    br $while-continue|1
   end
  end
  loop $while-continue|2
   local.get $1
   local.get $5
   i32.gt_s
   if
    local.get $4
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $while-continue|2
   end
  end
  local.get $6
 )
 (func $src/wasm/set/operations/setSymDifference (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $1
  local.get $3
  i32.or
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  i32.eqz
  if
   loop $for-loop|0
    local.get $3
    local.get $5
    i32.gt_s
    if
     local.get $5
     i32.const 3
     i32.shl
     local.tee $0
     local.get $4
     i32.add
     local.get $0
     local.get $2
     i32.add
     f64.load
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
   local.get $3
   return
  end
  local.get $3
  i32.eqz
  if
   loop $for-loop|1
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $5
     i32.const 3
     i32.shl
     local.tee $2
     local.get $4
     i32.add
     local.get $0
     local.get $2
     i32.add
     f64.load
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|1
    end
   end
   local.get $1
   return
  end
  loop $while-continue|2
   local.get $3
   local.get $7
   i32.gt_s
   local.get $1
   local.get $6
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $8
    local.get $2
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $9
    f64.lt
    if
     local.get $4
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     local.get $8
     f64.store
     local.get $6
     i32.const 1
     i32.add
     local.set $6
     local.get $5
     i32.const 1
     i32.add
     local.set $5
    else
     local.get $8
     local.get $9
     f64.gt
     if
      local.get $4
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      local.get $9
      f64.store
      local.get $5
      i32.const 1
      i32.add
      local.set $5
     else
      local.get $6
      i32.const 1
      i32.add
      local.set $6
     end
     local.get $7
     i32.const 1
     i32.add
     local.set $7
    end
    br $while-continue|2
   end
  end
  loop $while-continue|3
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $4
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|3
   end
  end
  loop $while-continue|4
   local.get $3
   local.get $7
   i32.gt_s
   if
    local.get $4
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    local.get $2
    local.get $7
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|4
   end
  end
  local.get $5
 )
 (func $src/wasm/set/operations/setIsSubset (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  local.get $1
  i32.eqz
  if
   i32.const 1
   return
  end
  local.get $3
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $3
  i32.gt_s
  if
   i32.const 0
   return
  end
  loop $while-continue|0
   local.get $3
   local.get $5
   i32.gt_s
   local.get $1
   local.get $4
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $6
    local.get $2
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $7
    f64.lt
    if (result i32)
     i32.const 0
     return
    else
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     local.get $4
     local.get $4
     i32.const 1
     i32.add
     local.get $6
     local.get $7
     f64.gt
     select
    end
    local.set $4
    br $while-continue|0
   end
  end
  local.get $1
  local.get $4
  i32.eq
 )
 (func $src/wasm/set/operations/setIsProperSubset (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  call $src/wasm/set/operations/setIsSubset
  i32.const 1
  i32.eq
  local.get $1
  local.get $3
  i32.lt_s
  i32.and
 )
 (func $src/wasm/set/operations/setIsSuperset (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  local.get $2
  local.get $3
  local.get $0
  local.get $1
  call $src/wasm/set/operations/setIsSubset
 )
 (func $src/wasm/set/operations/setIsProperSuperset (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  local.get $2
  local.get $3
  local.get $0
  local.get $1
  call $src/wasm/set/operations/setIsProperSubset
 )
 (func $src/wasm/set/operations/setEquals (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  local.get $1
  local.get $3
  i32.ne
  if
   i32.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $3
    local.get $0
    i32.add
    f64.load
    local.get $2
    local.get $3
    i32.add
    f64.load
    f64.ne
    if
     i32.const 0
     return
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $src/wasm/set/operations/setIsDisjoint (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  (local $7 f64)
  local.get $3
  i32.eqz
  local.get $1
  i32.eqz
  i32.or
  if
   i32.const 1
   return
  end
  loop $while-continue|0
   local.get $3
   local.get $4
   i32.gt_s
   local.get $1
   local.get $5
   i32.gt_s
   i32.and
   if
    local.get $0
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $6
    local.get $2
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $7
    f64.lt
    if
     local.get $5
     i32.const 1
     i32.add
     local.set $5
    else
     local.get $6
     local.get $7
     f64.gt
     if (result i32)
      local.get $4
      i32.const 1
      i32.add
     else
      i32.const 0
      return
     end
     local.set $4
    end
    br $while-continue|0
   end
  end
  i32.const 1
 )
 (func $src/wasm/set/operations/setSize (param $0 i32) (result i32)
  local.get $0
 )
 (func $src/wasm/set/operations/setContains (param $0 i32) (param $1 i32) (param $2 f64) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  i32.const 1
  i32.sub
  local.set $1
  loop $while-continue|0
   local.get $1
   local.get $3
   i32.ge_s
   if
    local.get $0
    local.get $1
    local.get $3
    i32.add
    i32.const 1
    i32.shr_s
    local.tee $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $5
    local.get $2
    f64.eq
    if
     i32.const 1
     return
    else
     local.get $2
     local.get $5
     f64.gt
     if
      local.get $4
      i32.const 1
      i32.add
      local.set $3
     else
      local.get $4
      i32.const 1
      i32.sub
      local.set $1
     end
    end
    br $while-continue|0
   end
  end
  i32.const 0
 )
 (func $src/wasm/set/operations/setAdd (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $1
  i32.eqz
  if
   local.get $3
   local.get $2
   f64.store
   i32.const 1
   return
  end
  local.get $1
  local.set $4
  loop $while-continue|0
   local.get $4
   local.get $5
   i32.gt_s
   if
    local.get $0
    local.get $4
    local.get $5
    i32.add
    i32.const 1
    i32.shr_s
    local.tee $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.get $2
    f64.lt
    if
     local.get $6
     i32.const 1
     i32.add
     local.set $5
    else
     local.get $6
     local.set $4
    end
    br $while-continue|0
   end
  end
  local.get $1
  local.get $5
  i32.gt_s
  if (result i32)
   local.get $0
   local.get $5
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $2
   f64.eq
  else
   i32.const 0
  end
  if
   loop $for-loop|1
    local.get $1
    local.get $7
    i32.gt_s
    if
     local.get $7
     i32.const 3
     i32.shl
     local.tee $4
     local.get $3
     i32.add
     local.get $0
     local.get $4
     i32.add
     f64.load
     f64.store
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|1
    end
   end
   local.get $1
   return
  end
  loop $for-loop|2
   local.get $5
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $4
    local.get $3
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|2
   end
  end
  local.get $3
  local.get $5
  i32.const 3
  i32.shl
  i32.add
  local.get $2
  f64.store
  local.get $5
  local.set $4
  loop $for-loop|3
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 1
    i32.add
    local.tee $5
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $5
    local.set $4
    br $for-loop|3
   end
  end
  local.get $1
  i32.const 1
  i32.add
 )
 (func $src/wasm/set/operations/setRemove (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  local.get $1
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  i32.const 1
  i32.sub
  local.set $5
  loop $while-continue|0
   local.get $5
   local.get $6
   i32.ge_s
   if
    local.get $0
    local.get $5
    local.get $6
    i32.add
    i32.const 1
    i32.shr_s
    local.tee $8
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $7
    local.get $2
    f64.eq
    if
     loop $for-loop|1
      local.get $4
      local.get $8
      i32.lt_s
      if
       local.get $4
       i32.const 3
       i32.shl
       local.tee $5
       local.get $3
       i32.add
       local.get $0
       local.get $5
       i32.add
       f64.load
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|1
      end
     end
     local.get $8
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|2
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $3
       local.get $4
       i32.const 1
       i32.sub
       i32.const 3
       i32.shl
       i32.add
       local.get $0
       local.get $4
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|2
      end
     end
     local.get $1
     i32.const 1
     i32.sub
     return
    else
     local.get $2
     local.get $7
     f64.gt
     if
      local.get $8
      i32.const 1
      i32.add
      local.set $6
     else
      local.get $8
      i32.const 1
      i32.sub
      local.set $5
     end
    end
    br $while-continue|0
   end
  end
  loop $for-loop|3
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|3
   end
  end
  local.get $1
 )
 (func $src/wasm/set/operations/setCartesian (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $3
  i32.eqz
  local.get $1
  i32.eqz
  i32.or
  if
   i32.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $8
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $3
     local.get $5
     i32.gt_s
     if
      local.get $2
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $9
      local.get $4
      local.get $7
      i32.const 3
      i32.shl
      i32.add
      local.get $8
      f64.store
      local.get $4
      local.get $7
      i32.const 1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $9
      f64.store
      local.get $7
      i32.const 2
      i32.add
      local.set $7
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  local.get $1
  local.get $3
  i32.mul
 )
 (func $src/wasm/set/operations/setPowerSetSize (param $0 i32) (result i32)
  i32.const 1
  local.get $0
  i32.shl
 )
 (func $src/wasm/set/operations/setGetSubset (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.gt_s
   if
    local.get $2
    i32.const 1
    local.get $5
    i32.shl
    i32.and
    if
     local.get $3
     local.get $4
     i32.const 3
     i32.shl
     i32.add
     local.get $0
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.store
     local.get $4
     i32.const 1
     i32.add
     local.set $4
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $4
 )
 (func $src/wasm/special/functions/erf (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  f64.const 1
  local.get $0
  f64.abs
  local.tee $2
  f64.const 0.3275911
  f64.mul
  f64.const 1
  f64.add
  f64.div
  local.tee $1
  local.get $1
  f64.mul
  local.tee $4
  local.get $1
  f64.mul
  local.tee $5
  local.get $1
  f64.mul
  local.set $3
  f64.const 1
  f64.const -1
  local.get $0
  f64.const 0
  f64.ge
  select
  f64.const 1
  local.get $1
  f64.const 0.254829592
  f64.mul
  local.get $4
  f64.const -0.284496736
  f64.mul
  f64.add
  local.get $5
  f64.const 1.421413741
  f64.mul
  f64.add
  local.get $3
  f64.const -1.453152027
  f64.mul
  f64.add
  local.get $3
  local.get $1
  f64.mul
  f64.const 1.061405429
  f64.mul
  f64.add
  local.get $2
  f64.neg
  local.get $2
  f64.mul
  call $~lib/math/NativeMath.exp
  f64.mul
  f64.sub
  f64.mul
 )
 (func $src/wasm/special/functions/erfArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/erf
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/erfc (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  call $src/wasm/special/functions/erf
  f64.sub
 )
 (func $src/wasm/special/functions/erfcArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    f64.const 1
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/erf
    f64.sub
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/gamma (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  local.get $0
  local.get $0
  f64.ne
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 0.5
  f64.lt
  if
   f64.const 3.141592653589793
   local.get $0
   f64.const 3.141592653589793
   f64.mul
   call $~lib/math/NativeMath.sin
   f64.const 1
   local.get $0
   f64.sub
   call $src/wasm/special/functions/gamma
   f64.mul
   f64.div
   return
  end
  local.get $0
  f64.const -1
  f64.add
  local.tee $1
  f64.const 7
  f64.add
  local.tee $2
  f64.const 0.5
  f64.add
  local.tee $0
  local.get $1
  f64.const 0.5
  f64.add
  call $~lib/math/NativeMath.pow
  f64.const 2.5066282746310007
  f64.mul
  local.get $0
  f64.neg
  call $~lib/math/NativeMath.exp
  f64.mul
  f64.const 676.5203681218851
  local.get $1
  f64.const 1
  f64.add
  f64.div
  f64.const 0.9999999999998099
  f64.add
  f64.const -1259.1392167224028
  local.get $1
  f64.const 2
  f64.add
  f64.div
  f64.add
  f64.const 771.3234287776531
  local.get $1
  f64.const 3
  f64.add
  f64.div
  f64.add
  f64.const -176.6150291621406
  local.get $1
  f64.const 4
  f64.add
  f64.div
  f64.add
  f64.const 12.507343278686905
  local.get $1
  f64.const 5
  f64.add
  f64.div
  f64.add
  f64.const -0.13857109526572012
  local.get $1
  f64.const 6
  f64.add
  f64.div
  f64.add
  f64.const 9.984369578019572e-06
  local.get $2
  f64.div
  f64.add
  f64.const 1.5056327351493116e-07
  local.get $1
  f64.const 8
  f64.add
  f64.div
  f64.add
  f64.mul
 )
 (func $src/wasm/special/functions/gammaArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/gamma
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/lgamma (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  local.get $0
  f64.const 0
  f64.le
  if
   f64.const inf
   return
  end
  local.get $0
  f64.const 0.5
  f64.lt
  if
   f64.const 1.1447298858494002
   local.get $0
   f64.const 3.141592653589793
   f64.mul
   call $~lib/math/NativeMath.sin
   f64.abs
   call $~lib/math/NativeMath.log
   f64.sub
   f64.const 1
   local.get $0
   f64.sub
   call $src/wasm/special/functions/lgamma
   f64.sub
   return
  end
  local.get $0
  f64.const -1
  f64.add
  local.tee $1
  f64.const 7
  f64.add
  local.tee $0
  f64.const 0.5
  f64.add
  local.set $2
  f64.const 6.283185307179586
  call $~lib/math/NativeMath.log
  f64.const 0.5
  f64.mul
  local.get $1
  f64.const 0.5
  f64.add
  local.get $2
  call $~lib/math/NativeMath.log
  f64.mul
  f64.add
  local.get $2
  f64.sub
  f64.const 676.5203681218851
  local.get $1
  f64.const 1
  f64.add
  f64.div
  f64.const 0.9999999999998099
  f64.add
  f64.const -1259.1392167224028
  local.get $1
  f64.const 2
  f64.add
  f64.div
  f64.add
  f64.const 771.3234287776531
  local.get $1
  f64.const 3
  f64.add
  f64.div
  f64.add
  f64.const -176.6150291621406
  local.get $1
  f64.const 4
  f64.add
  f64.div
  f64.add
  f64.const 12.507343278686905
  local.get $1
  f64.const 5
  f64.add
  f64.div
  f64.add
  f64.const -0.13857109526572012
  local.get $1
  f64.const 6
  f64.add
  f64.div
  f64.add
  f64.const 9.984369578019572e-06
  local.get $0
  f64.div
  f64.add
  f64.const 1.5056327351493116e-07
  local.get $1
  f64.const 8
  f64.add
  f64.div
  f64.add
  call $~lib/math/NativeMath.log
  f64.add
 )
 (func $src/wasm/special/functions/lgammaArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/lgamma
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/zetaPositive (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 f64)
  (local $3 f64)
  f64.const 1
  local.set $3
  i32.const 1
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 50
   i32.le_s
   if
    local.get $2
    local.get $3
    local.get $1
    f64.convert_i32_s
    local.get $0
    call $~lib/math/NativeMath.pow
    f64.div
    f64.add
    local.set $2
    local.get $3
    f64.neg
    local.set $3
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  f64.const 1
  f64.const 2
  f64.const 1
  local.get $0
  f64.sub
  call $~lib/math/NativeMath.pow
  f64.sub
  local.tee $3
  f64.abs
  f64.const 1e-15
  f64.lt
  if
   f64.const 0
   local.set $2
   i32.const 1
   local.set $1
   loop $for-loop|1
    local.get $1
    i32.const 100
    i32.le_s
    if
     local.get $2
     f64.const 1
     local.get $1
     f64.convert_i32_s
     local.get $0
     call $~lib/math/NativeMath.pow
     f64.div
     f64.add
     local.set $2
     local.get $1
     i32.const 1
     i32.add
     local.set $1
     br $for-loop|1
    end
   end
   local.get $2
   return
  end
  local.get $2
  local.get $3
  f64.div
 )
 (func $src/wasm/special/functions/zeta (param $0 f64) (result f64)
  local.get $0
  f64.const 1
  f64.eq
  if
   f64.const inf
   return
  end
  local.get $0
  f64.const 0
  f64.eq
  if
   f64.const -0.5
   return
  end
  local.get $0
  i32.trunc_sat_f64_s
  i32.const 1
  i32.and
  i32.const 1
  local.get $0
  local.get $0
  f64.floor
  f64.eq
  local.get $0
  f64.const 0
  f64.lt
  i32.and
  select
  i32.eqz
  if
   f64.const 0
   return
  end
  local.get $0
  f64.const 1
  f64.gt
  if
   local.get $0
   call $src/wasm/special/functions/zetaPositive
   return
  end
  f64.const 2
  local.get $0
  call $~lib/math/NativeMath.pow
  f64.const 3.141592653589793
  local.get $0
  f64.const -1
  f64.add
  call $~lib/math/NativeMath.pow
  f64.mul
  local.get $0
  f64.const 3.141592653589793
  f64.mul
  f64.const 0.5
  f64.mul
  call $~lib/math/NativeMath.sin
  f64.mul
  f64.const 1
  local.get $0
  f64.sub
  local.tee $0
  call $src/wasm/special/functions/gamma
  f64.mul
  local.get $0
  call $src/wasm/special/functions/zetaPositive
  f64.mul
 )
 (func $src/wasm/special/functions/zetaArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/zeta
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/beta (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  call $src/wasm/special/functions/lgamma
  local.get $1
  call $src/wasm/special/functions/lgamma
  f64.add
  local.get $0
  local.get $1
  f64.add
  call $src/wasm/special/functions/lgamma
  f64.sub
  call $~lib/math/NativeMath.exp
 )
 (func $src/wasm/special/functions/gammainc_cf (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  f64.const 9999999999999998791471364e5
  local.set $2
  f64.const 1
  local.get $1
  f64.const 1
  f64.add
  local.get $0
  f64.sub
  local.tee $5
  f64.div
  local.tee $4
  local.set $6
  i32.const 1
  local.set $3
  loop $for-loop|0
   local.get $3
   i32.const 100
   i32.lt_s
   if
    block $for-break0
     local.get $6
     f64.const 1
     f64.const 1e-30
     local.get $3
     f64.convert_i32_s
     f64.neg
     local.get $3
     f64.convert_i32_s
     local.get $0
     f64.sub
     f64.mul
     local.tee $6
     local.get $4
     f64.mul
     local.get $5
     f64.const 2
     f64.add
     local.tee $5
     f64.add
     local.tee $4
     local.get $4
     f64.abs
     f64.const 1e-30
     f64.lt
     select
     f64.div
     local.tee $4
     local.get $5
     local.get $6
     local.get $2
     f64.div
     f64.add
     local.tee $2
     f64.abs
     f64.const 1e-30
     f64.lt
     if
      f64.const 1e-30
      local.set $2
     end
     local.get $2
     f64.mul
     local.tee $7
     f64.mul
     local.set $6
     local.get $7
     f64.const -1
     f64.add
     f64.abs
     f64.const 1e-15
     f64.lt
     br_if $for-break0
     local.get $3
     i32.const 1
     i32.add
     local.set $3
     br $for-loop|0
    end
   end
  end
  local.get $0
  local.get $1
  call $~lib/math/NativeMath.log
  f64.mul
  local.get $1
  f64.sub
  local.get $0
  call $src/wasm/special/functions/lgamma
  f64.sub
  call $~lib/math/NativeMath.exp
  local.get $6
  f64.mul
 )
 (func $src/wasm/special/functions/gammainc (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 f64)
  local.get $1
  f64.const 0
  f64.lt
  local.get $0
  f64.const 0
  f64.le
  i32.or
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  f64.const 0
  f64.eq
  if
   f64.const 0
   return
  end
  local.get $1
  local.get $0
  f64.const 1
  f64.add
  f64.lt
  if
   f64.const 1
   local.get $0
   f64.div
   local.tee $4
   local.set $2
   i32.const 1
   local.set $3
   loop $for-loop|0
    local.get $3
    i32.const 100
    i32.lt_s
    if
     block $for-break0
      local.get $2
      local.get $4
      local.get $1
      local.get $0
      local.get $3
      f64.convert_i32_s
      f64.add
      f64.div
      f64.mul
      local.tee $4
      f64.add
      local.set $2
      local.get $4
      f64.abs
      local.get $2
      f64.abs
      f64.const 1e-15
      f64.mul
      f64.lt
      br_if $for-break0
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|0
     end
    end
   end
   local.get $2
   local.get $0
   local.get $1
   call $~lib/math/NativeMath.log
   f64.mul
   local.get $1
   f64.sub
   local.get $0
   call $src/wasm/special/functions/lgamma
   f64.sub
   call $~lib/math/NativeMath.exp
   f64.mul
   return
  end
  f64.const 1
  local.get $0
  local.get $1
  call $src/wasm/special/functions/gammainc_cf
  f64.sub
 )
 (func $~lib/math/tan_kern (param $0 f64) (param $1 f64) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  local.get $0
  i64.reinterpret_f64
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $3
  i32.const 2147483647
  i32.and
  i32.const 1072010280
  i32.ge_u
  local.tee $4
  if
   f64.const 0.7853981633974483
   local.get $3
   i32.const 0
   i32.lt_s
   if (result f64)
    local.get $1
    f64.neg
    local.set $1
    local.get $0
    f64.neg
   else
    local.get $0
   end
   f64.sub
   f64.const 3.061616997868383e-17
   local.get $1
   f64.sub
   f64.add
   local.set $0
   f64.const 0
   local.set $1
  end
  local.get $0
  local.get $0
  f64.mul
  local.tee $5
  local.get $5
  f64.mul
  local.set $6
  local.get $0
  local.get $1
  local.get $5
  local.get $5
  local.get $0
  f64.mul
  local.tee $7
  local.get $6
  local.get $6
  local.get $6
  local.get $6
  local.get $6
  f64.const -1.8558637485527546e-05
  f64.mul
  f64.const 7.817944429395571e-05
  f64.add
  f64.mul
  f64.const 5.880412408202641e-04
  f64.add
  f64.mul
  f64.const 3.5920791075913124e-03
  f64.add
  f64.mul
  f64.const 0.021869488294859542
  f64.add
  f64.mul
  f64.const 0.13333333333320124
  f64.add
  local.get $5
  local.get $6
  local.get $6
  local.get $6
  local.get $6
  local.get $6
  f64.const 2.590730518636337e-05
  f64.mul
  f64.const 7.140724913826082e-05
  f64.add
  f64.mul
  f64.const 2.464631348184699e-04
  f64.add
  f64.mul
  f64.const 1.4562094543252903e-03
  f64.add
  f64.mul
  f64.const 0.0088632398235993
  f64.add
  f64.mul
  f64.const 0.05396825397622605
  f64.add
  f64.mul
  f64.add
  f64.mul
  local.get $1
  f64.add
  f64.mul
  f64.add
  local.get $7
  f64.const 0.3333333333333341
  f64.mul
  f64.add
  local.tee $1
  f64.add
  local.set $5
  local.get $4
  if
   f64.const 1
   local.get $3
   i32.const 30
   i32.shr_s
   i32.const 2
   i32.and
   f64.convert_i32_s
   f64.sub
   local.get $2
   f64.convert_i32_s
   local.tee $6
   local.get $0
   local.get $5
   local.get $5
   f64.mul
   local.get $5
   local.get $6
   f64.add
   f64.div
   local.get $1
   f64.sub
   f64.sub
   f64.const 2
   f64.mul
   f64.sub
   f64.mul
   return
  end
  local.get $2
  i32.const 1
  i32.eq
  if
   local.get $5
   return
  end
  f64.const -1
  local.get $5
  f64.div
  local.tee $6
  i64.reinterpret_f64
  i64.const -4294967296
  i64.and
  f64.reinterpret_i64
  local.tee $7
  local.get $6
  local.get $7
  local.get $5
  i64.reinterpret_f64
  i64.const -4294967296
  i64.and
  f64.reinterpret_i64
  local.tee $5
  f64.mul
  f64.const 1
  f64.add
  local.get $7
  local.get $1
  local.get $5
  local.get $0
  f64.sub
  f64.sub
  f64.mul
  f64.add
  f64.mul
  f64.add
 )
 (func $~lib/math/NativeMath.tan (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  (local $5 i64)
  (local $6 i32)
  local.get $0
  i64.reinterpret_f64
  local.tee $5
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $2
  i32.const 31
  i32.shr_u
  local.set $6
  local.get $2
  i32.const 2147483647
  i32.and
  local.tee $2
  i32.const 1072243195
  i32.le_u
  if
   local.get $2
   i32.const 1044381696
   i32.lt_u
   if
    local.get $0
    return
   end
   local.get $0
   f64.const 0
   i32.const 1
   call $~lib/math/tan_kern
   return
  end
  local.get $2
  i32.const 2146435072
  i32.ge_u
  if
   local.get $0
   local.get $0
   f64.sub
   return
  end
  block $~lib/math/rempio2|inlined.2 (result i32)
   local.get $5
   i64.const 32
   i64.shr_u
   i32.wrap_i64
   i32.const 2147483647
   i32.and
   local.tee $2
   i32.const 1094263291
   i32.lt_u
   if
    local.get $2
    i32.const 20
    i32.shr_u
    local.tee $2
    local.get $0
    local.get $0
    f64.const 0.6366197723675814
    f64.mul
    f64.nearest
    local.tee $3
    f64.const 1.5707963267341256
    f64.mul
    f64.sub
    local.tee $0
    local.get $3
    f64.const 6.077100506506192e-11
    f64.mul
    local.tee $4
    f64.sub
    local.tee $1
    i64.reinterpret_f64
    i64.const 32
    i64.shr_u
    i32.wrap_i64
    i32.const 20
    i32.shr_u
    i32.const 2047
    i32.and
    i32.sub
    i32.const 16
    i32.gt_u
    if
     local.get $3
     f64.const 2.0222662487959506e-21
     f64.mul
     local.get $0
     local.get $0
     local.get $3
     f64.const 6.077100506303966e-11
     f64.mul
     local.tee $1
     f64.sub
     local.tee $0
     f64.sub
     local.get $1
     f64.sub
     f64.sub
     local.set $4
     local.get $2
     local.get $0
     local.get $4
     f64.sub
     local.tee $1
     i64.reinterpret_f64
     i64.const 32
     i64.shr_u
     i32.wrap_i64
     i32.const 20
     i32.shr_u
     i32.const 2047
     i32.and
     i32.sub
     i32.const 49
     i32.gt_u
     if
      local.get $3
      f64.const 8.4784276603689e-32
      f64.mul
      local.get $0
      local.get $0
      local.get $3
      f64.const 2.0222662487111665e-21
      f64.mul
      local.tee $1
      f64.sub
      local.tee $0
      f64.sub
      local.get $1
      f64.sub
      f64.sub
      local.set $4
      local.get $0
      local.get $4
      f64.sub
      local.set $1
     end
    end
    local.get $1
    global.set $~lib/math/rempio2_y0
    local.get $0
    local.get $1
    f64.sub
    local.get $4
    f64.sub
    global.set $~lib/math/rempio2_y1
    local.get $3
    i32.trunc_sat_f64_s
    br $~lib/math/rempio2|inlined.2
   end
   i32.const 0
   local.get $5
   call $~lib/math/pio2_large_quot
   local.tee $2
   i32.sub
   local.get $2
   local.get $6
   select
  end
  local.set $2
  global.get $~lib/math/rempio2_y0
  global.get $~lib/math/rempio2_y1
  i32.const 1
  local.get $2
  i32.const 1
  i32.and
  i32.const 1
  i32.shl
  i32.sub
  call $~lib/math/tan_kern
 )
 (func $src/wasm/special/functions/digamma (param $0 f64) (result f64)
  (local $1 f64)
  local.get $0
  f64.const 0
  f64.lt
  if
   f64.const 1
   local.get $0
   f64.sub
   call $src/wasm/special/functions/digamma
   f64.const 3.141592653589793
   local.get $0
   f64.const 3.141592653589793
   f64.mul
   call $~lib/math/NativeMath.tan
   f64.div
   f64.sub
   return
  end
  loop $while-continue|0
   local.get $0
   f64.const 6
   f64.lt
   if
    local.get $1
    f64.const 1
    local.get $0
    f64.div
    f64.sub
    local.set $1
    local.get $0
    f64.const 1
    f64.add
    local.set $0
    br $while-continue|0
   end
  end
  local.get $1
  local.get $0
  call $~lib/math/NativeMath.log
  f64.const 0.5
  local.get $0
  f64.div
  f64.sub
  f64.const 1
  local.get $0
  local.get $0
  f64.mul
  f64.div
  local.tee $0
  f64.const 0.08333333333333333
  local.get $0
  f64.const 0.008333333333333333
  local.get $0
  f64.const 0.003968253968253968
  local.get $0
  f64.const 0.004166666666666667
  f64.mul
  f64.sub
  f64.mul
  f64.sub
  f64.mul
  f64.sub
  f64.mul
  f64.sub
  f64.add
 )
 (func $src/wasm/special/functions/digammaArray (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f64.load
    call $src/wasm/special/functions/digamma
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/special/functions/besselJ0 (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  local.get $0
  f64.abs
  local.tee $1
  f64.const 8
  f64.lt
  if (result f64)
   local.get $1
   local.get $1
   f64.mul
   local.tee $0
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const -184.9052456
   f64.mul
   f64.const 77392.33017
   f64.add
   f64.mul
   f64.const -11214424.18
   f64.add
   f64.mul
   f64.const 651619640.7
   f64.add
   f64.mul
   f64.const -13362590354
   f64.add
   f64.mul
   f64.const 57568490574
   f64.add
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const 267.8532712
   f64.add
   f64.mul
   f64.const 59272.64853
   f64.add
   f64.mul
   f64.const 9494680.718
   f64.add
   f64.mul
   f64.const 1029532985
   f64.add
   f64.mul
   f64.const 57568490411
   f64.add
   f64.div
  else
   f64.const 0.636619772
   local.get $1
   f64.div
   f64.sqrt
   local.get $1
   f64.const -0.785398164
   f64.add
   local.tee $0
   call $~lib/math/NativeMath.cos
   f64.const 8
   local.get $1
   f64.div
   local.tee $2
   local.get $2
   f64.mul
   local.tee $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 2.093887211e-07
   f64.mul
   f64.const -2.073370639e-06
   f64.add
   f64.mul
   f64.const 0.00002734510407
   f64.add
   f64.mul
   f64.const -0.001098628627
   f64.add
   f64.mul
   f64.const 1
   f64.add
   f64.mul
   local.get $2
   local.get $0
   call $~lib/math/NativeMath.sin
   f64.mul
   local.get $1
   local.get $1
   local.get $1
   f64.const 7.621095161e-07
   local.get $1
   f64.const 9.34935152e-08
   f64.mul
   f64.sub
   f64.mul
   f64.const -6.911147651e-06
   f64.add
   f64.mul
   f64.const 0.0001430488765
   f64.add
   f64.mul
   f64.const -0.01562499995
   f64.add
   f64.mul
   f64.sub
   f64.mul
  end
 )
 (func $src/wasm/special/functions/besselJ1 (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  f64.const -1
  f64.const 1
  local.get $0
  f64.const 0
  f64.lt
  select
  local.set $1
  local.get $0
  f64.abs
  local.tee $0
  f64.const 8
  f64.lt
  if (result f64)
   local.get $1
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   local.tee $0
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const -30.16036606
   f64.mul
   f64.const 15704.4826
   f64.add
   f64.mul
   f64.const -2972611.439
   f64.add
   f64.mul
   f64.const 242396853.1
   f64.add
   f64.mul
   f64.const -7895059235
   f64.add
   f64.mul
   f64.const 72362614232
   f64.add
   f64.mul
   f64.mul
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const 376.9991397
   f64.add
   f64.mul
   f64.const 99447.43394
   f64.add
   f64.mul
   f64.const 18583304.74
   f64.add
   f64.mul
   f64.const 2300535178
   f64.add
   f64.mul
   f64.const 144725228442
   f64.add
   f64.div
  else
   local.get $1
   f64.const 0.636619772
   local.get $0
   f64.div
   f64.sqrt
   f64.mul
   local.get $0
   f64.const -2.356194491
   f64.add
   local.tee $1
   call $~lib/math/NativeMath.cos
   f64.const 8
   local.get $0
   f64.div
   local.tee $0
   local.get $0
   f64.mul
   local.tee $2
   local.get $2
   local.get $2
   f64.const 2.457520174e-06
   local.get $2
   f64.const 2.404127372e-07
   f64.mul
   f64.sub
   f64.mul
   f64.const -0.00003516396496
   f64.add
   f64.mul
   f64.const 0.00183105
   f64.add
   f64.mul
   f64.const 1
   f64.add
   f64.mul
   local.get $0
   local.get $1
   call $~lib/math/NativeMath.sin
   f64.mul
   local.get $2
   local.get $2
   local.get $2
   local.get $2
   f64.const 1.057874125e-07
   f64.mul
   f64.const -8.820898866e-07
   f64.add
   f64.mul
   f64.const 8.449199096e-06
   f64.add
   f64.mul
   f64.const -0.0002002690873
   f64.add
   f64.mul
   f64.const 0.04687499995
   f64.add
   f64.mul
   f64.sub
   f64.mul
  end
 )
 (func $src/wasm/special/functions/besselY0 (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  local.get $0
  f64.const 0
  f64.le
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 8
  f64.lt
  if (result f64)
   local.get $0
   local.get $0
   f64.mul
   local.tee $1
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 228.4622733
   f64.mul
   f64.const -86327.92757
   f64.add
   f64.mul
   f64.const 10879881.29
   f64.add
   f64.mul
   f64.const -512359803.6
   f64.add
   f64.mul
   f64.const 7062834065
   f64.add
   f64.mul
   f64.const -2957821389
   f64.add
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 226.1030244
   f64.add
   f64.mul
   f64.const 47447.2647
   f64.add
   f64.mul
   f64.const 7189466.438
   f64.add
   f64.mul
   f64.const 745249964.8
   f64.add
   f64.mul
   f64.const 40076544269
   f64.add
   f64.div
   local.get $0
   call $src/wasm/special/functions/besselJ0
   f64.const 0.636619772
   f64.mul
   local.get $0
   call $~lib/math/NativeMath.log
   f64.mul
   f64.add
  else
   f64.const 0.636619772
   local.get $0
   f64.div
   f64.sqrt
   local.get $0
   f64.const -0.785398164
   f64.add
   local.tee $1
   call $~lib/math/NativeMath.sin
   f64.const 8
   local.get $0
   f64.div
   local.tee $2
   local.get $2
   f64.mul
   local.tee $0
   local.get $0
   local.get $0
   local.get $0
   f64.const 2.093887211e-07
   f64.mul
   f64.const -2.073370639e-06
   f64.add
   f64.mul
   f64.const 0.00002734510407
   f64.add
   f64.mul
   f64.const -0.001098628627
   f64.add
   f64.mul
   f64.const 1
   f64.add
   f64.mul
   local.get $2
   local.get $1
   call $~lib/math/NativeMath.cos
   f64.mul
   local.get $0
   local.get $0
   local.get $0
   f64.const 7.621095161e-07
   local.get $0
   f64.const 9.34935152e-08
   f64.mul
   f64.sub
   f64.mul
   f64.const -6.911147651e-06
   f64.add
   f64.mul
   f64.const 0.0001430488765
   f64.add
   f64.mul
   f64.const -0.01562499995
   f64.add
   f64.mul
   f64.add
   f64.mul
  end
 )
 (func $src/wasm/special/functions/besselY1 (param $0 f64) (result f64)
  (local $1 f64)
  (local $2 f64)
  local.get $0
  f64.const 0
  f64.le
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 8
  f64.lt
  if (result f64)
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   local.tee $1
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 8511.937935
   f64.mul
   f64.const -4237922.726
   f64.add
   f64.mul
   f64.const 734926455.1
   f64.add
   f64.mul
   f64.const -51534381390
   f64.add
   f64.mul
   f64.const 127527439e4
   f64.add
   f64.mul
   f64.const -4900604943e3
   f64.add
   f64.mul
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   local.get $1
   f64.const 354.9632885
   f64.add
   f64.mul
   f64.const 102042.605
   f64.add
   f64.mul
   f64.const 22459040.02
   f64.add
   f64.mul
   f64.const 3733650367
   f64.add
   f64.mul
   f64.const 424441966400
   f64.add
   f64.mul
   f64.const 2490985738e4
   f64.add
   f64.div
   local.get $0
   call $src/wasm/special/functions/besselJ1
   local.get $0
   call $~lib/math/NativeMath.log
   f64.mul
   f64.const 1
   local.get $0
   f64.div
   f64.sub
   f64.const 0.636619772
   f64.mul
   f64.add
  else
   f64.const 0.636619772
   local.get $0
   f64.div
   f64.sqrt
   local.get $0
   f64.const -2.356194491
   f64.add
   local.tee $1
   call $~lib/math/NativeMath.sin
   f64.const 8
   local.get $0
   f64.div
   local.tee $2
   local.get $2
   f64.mul
   local.tee $0
   local.get $0
   local.get $0
   f64.const 2.457520174e-06
   local.get $0
   f64.const 2.404127372e-07
   f64.mul
   f64.sub
   f64.mul
   f64.const -0.00003516396496
   f64.add
   f64.mul
   f64.const 0.00183105
   f64.add
   f64.mul
   f64.const 1
   f64.add
   f64.mul
   local.get $2
   local.get $1
   call $~lib/math/NativeMath.cos
   f64.mul
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.const 1.057874125e-07
   f64.mul
   f64.const -8.820898866e-07
   f64.add
   f64.mul
   f64.const 8.449199096e-06
   f64.add
   f64.mul
   f64.const -0.0002002690873
   f64.add
   f64.mul
   f64.const 0.04687499995
   f64.add
   f64.mul
   f64.add
   f64.mul
  end
 )
 (func $src/wasm/string/operations/isDigit (param $0 i32) (result i32)
  local.get $0
  i32.const 57
  i32.le_s
  local.get $0
  i32.const 48
  i32.ge_s
  i32.and
 )
 (func $src/wasm/string/operations/isLetter (param $0 i32) (result i32)
  local.get $0
  i32.const 122
  i32.le_s
  local.get $0
  i32.const 97
  i32.ge_s
  i32.and
  local.get $0
  i32.const 90
  i32.le_s
  local.get $0
  i32.const 65
  i32.ge_s
  i32.and
  i32.or
 )
 (func $src/wasm/string/operations/isAlphanumeric (param $0 i32) (result i32)
  local.get $0
  call $src/wasm/string/operations/isDigit
  i32.const 1
  i32.eq
  if (result i32)
   i32.const 1
  else
   local.get $0
   call $src/wasm/string/operations/isLetter
   i32.const 1
   i32.eq
  end
 )
 (func $src/wasm/string/operations/isWhitespace (param $0 i32) (result i32)
  local.get $0
  i32.const 9
  i32.eq
  local.get $0
  i32.const 32
  i32.eq
  i32.or
  local.get $0
  i32.const 10
  i32.eq
  i32.or
  local.get $0
  i32.const 13
  i32.eq
  i32.or
 )
 (func $src/wasm/string/operations/toLowerCode (param $0 i32) (result i32)
  local.get $0
  i32.const 90
  i32.le_s
  local.get $0
  i32.const 65
  i32.ge_s
  i32.and
  if
   local.get $0
   i32.const 32
   i32.add
   return
  end
  local.get $0
 )
 (func $src/wasm/string/operations/toUpperCode (param $0 i32) (result i32)
  local.get $0
  i32.const 122
  i32.le_s
  local.get $0
  i32.const 97
  i32.ge_s
  i32.and
  if
   local.get $0
   i32.const 32
   i32.sub
   return
  end
  local.get $0
 )
 (func $src/wasm/string/operations/parseIntFromCodes (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  (local $5 i32)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  f64.const 1
  local.set $3
  loop $while-continue|0
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isWhitespace
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|0
   end
  end
  local.get $1
  local.get $2
  i32.le_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $5
  i32.const 45
  i32.eq
  if (result i32)
   f64.const -1
   local.set $3
   local.get $2
   i32.const 1
   i32.add
  else
   local.get $2
   i32.const 1
   i32.add
   local.get $2
   local.get $5
   i32.const 43
   i32.eq
   select
  end
  local.tee $2
  local.get $1
  i32.ge_s
  if (result i32)
   i32.const 0
  else
   local.get $0
   local.get $2
   i32.const 2
   i32.shl
   i32.add
   i32.load
   call $src/wasm/string/operations/isDigit
  end
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $while-continue|1
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isDigit
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $4
    f64.const 10
    f64.mul
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 48
    i32.sub
    f64.convert_i32_s
    f64.add
    local.set $4
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|1
   end
  end
  local.get $3
  local.get $4
  f64.mul
 )
 (func $src/wasm/string/operations/parseFloatFromCodes (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  f64.const 1
  local.set $7
  loop $while-continue|0
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isWhitespace
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|0
   end
  end
  local.get $1
  local.get $2
  i32.le_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $4
  i32.const 45
  i32.eq
  if (result i32)
   f64.const -1
   local.set $7
   local.get $2
   i32.const 1
   i32.add
  else
   local.get $2
   i32.const 1
   i32.add
   local.get $2
   local.get $4
   i32.const 43
   i32.eq
   select
  end
  local.tee $2
  local.get $1
  i32.ge_s
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $while-continue|1
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isDigit
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $3
    f64.const 10
    f64.mul
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 48
    i32.sub
    f64.convert_i32_s
    f64.add
    local.set $3
    i32.const 1
    local.set $6
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|1
   end
  end
  f64.const 1
  local.set $9
  local.get $1
  local.get $2
  i32.gt_s
  if (result i32)
   local.get $0
   local.get $2
   i32.const 2
   i32.shl
   i32.add
   i32.load
   i32.const 46
   i32.eq
  else
   i32.const 0
  end
  if
   local.get $2
   i32.const 1
   i32.add
   local.set $2
   loop $while-continue|2
    local.get $1
    local.get $2
    i32.gt_s
    if (result i32)
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     call $src/wasm/string/operations/isDigit
     i32.const 1
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $8
     f64.const 10
     f64.mul
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 48
     i32.sub
     f64.convert_i32_s
     f64.add
     local.set $8
     local.get $9
     f64.const 10
     f64.mul
     local.set $9
     i32.const 1
     local.set $5
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $while-continue|2
    end
   end
  end
  local.get $5
  local.get $6
  i32.or
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $3
  local.get $8
  local.get $9
  f64.div
  f64.add
  local.set $3
  local.get $7
  local.get $1
  local.get $2
  i32.gt_s
  if (result f64)
   local.get $0
   local.get $2
   i32.const 2
   i32.shl
   i32.add
   i32.load
   local.tee $4
   i32.const 101
   i32.eq
   local.get $4
   i32.const 69
   i32.eq
   i32.or
   if (result f64)
    f64.const 1
    local.set $9
    local.get $2
    i32.const 1
    i32.add
    local.tee $2
    local.get $1
    i32.lt_s
    if
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     local.tee $4
     i32.const 45
     i32.eq
     if (result i32)
      f64.const -1
      local.set $9
      local.get $2
      i32.const 1
      i32.add
     else
      local.get $2
      i32.const 1
      i32.add
      local.get $2
      local.get $4
      i32.const 43
      i32.eq
      select
     end
     local.set $2
    end
    f64.const 0
    local.set $8
    loop $while-continue|3
     local.get $1
     local.get $2
     i32.gt_s
     if (result i32)
      local.get $0
      local.get $2
      i32.const 2
      i32.shl
      i32.add
      i32.load
      call $src/wasm/string/operations/isDigit
      i32.const 1
      i32.eq
     else
      i32.const 0
     end
     if
      local.get $8
      f64.const 10
      f64.mul
      local.get $0
      local.get $2
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.const 48
      i32.sub
      f64.convert_i32_s
      f64.add
      local.set $8
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $while-continue|3
     end
    end
    local.get $3
    f64.const 10
    local.get $9
    local.get $8
    f64.mul
    call $~lib/math/NativeMath.pow
    f64.mul
   else
    local.get $3
   end
  else
   local.get $3
  end
  f64.mul
 )
 (func $src/wasm/string/operations/countDigits (param $0 i64) (result i32)
  (local $1 i32)
  local.get $0
  i64.eqz
  if
   i32.const 1
   return
  end
  i64.const 0
  local.get $0
  i64.sub
  local.get $0
  local.get $0
  i64.const 0
  i64.lt_s
  select
  local.set $0
  loop $while-continue|0
   local.get $0
   i64.const 0
   i64.gt_s
   if
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    local.get $0
    i64.const 10
    i64.div_s
    local.set $0
    br $while-continue|0
   end
  end
  local.get $1
 )
 (func $src/wasm/string/operations/formatIntToCodes (param $0 i64) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  i64.eqz
  if
   local.get $1
   i32.const 48
   i32.store
   i32.const 1
   return
  end
  i64.const 0
  local.get $0
  i64.sub
  local.get $0
  local.get $0
  i64.const 0
  i64.lt_s
  local.tee $3
  select
  local.tee $0
  call $src/wasm/string/operations/countDigits
  local.tee $2
  i32.const 1
  i32.add
  local.get $2
  local.get $3
  select
  local.tee $4
  i32.const 1
  i32.sub
  local.set $2
  loop $while-continue|0
   local.get $0
   i64.const 0
   i64.gt_s
   if
    local.get $1
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    local.get $0
    i64.const 10
    i64.rem_s
    i32.wrap_i64
    i32.const 48
    i32.add
    i32.store
    local.get $0
    i64.const 10
    i64.div_s
    local.set $0
    local.get $2
    i32.const 1
    i32.sub
    local.set $2
    br $while-continue|0
   end
  end
  local.get $3
  if
   local.get $1
   i32.const 45
   i32.store
  end
  local.get $4
 )
 (func $src/wasm/string/operations/formatFloatToCodes (param $0 f64) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i64)
  (local $5 i32)
  (local $6 f64)
  local.get $0
  local.get $0
  f64.ne
  if
   local.get $2
   i32.const 78
   i32.store
   local.get $2
   i32.const 97
   i32.store offset=4
   local.get $2
   i32.const 78
   i32.store offset=8
   i32.const 3
   return
  end
  local.get $0
  f64.const inf
  f64.eq
  if
   local.get $2
   i32.const 73
   i32.store
   local.get $2
   i32.const 110
   i32.store offset=4
   local.get $2
   i32.const 102
   i32.store offset=8
   local.get $2
   i32.const 105
   i32.store offset=12
   local.get $2
   i32.const 110
   i32.store offset=16
   local.get $2
   i32.const 105
   i32.store offset=20
   local.get $2
   i32.const 116
   i32.store offset=24
   local.get $2
   i32.const 121
   i32.store offset=28
   i32.const 8
   return
  end
  local.get $0
  f64.const -inf
  f64.eq
  if
   local.get $2
   i32.const 45
   i32.store
   local.get $2
   i32.const 73
   i32.store offset=4
   local.get $2
   i32.const 110
   i32.store offset=8
   local.get $2
   i32.const 102
   i32.store offset=12
   local.get $2
   i32.const 105
   i32.store offset=16
   local.get $2
   i32.const 110
   i32.store offset=20
   local.get $2
   i32.const 105
   i32.store offset=24
   local.get $2
   i32.const 116
   i32.store offset=28
   local.get $2
   i32.const 121
   i32.store offset=32
   i32.const 9
   return
  end
  local.get $0
  f64.neg
  local.get $0
  local.get $0
  f64.const 0
  f64.lt
  local.tee $3
  select
  f64.const 10
  local.get $1
  f64.convert_i32_s
  call $~lib/math/NativeMath.pow
  local.tee $6
  f64.mul
  local.tee $0
  f64.ceil
  local.get $0
  f64.ceil
  f64.const -0.5
  f64.add
  local.get $0
  f64.gt
  f64.convert_i32_u
  f64.sub
  local.get $6
  f64.div
  local.tee $0
  f64.floor
  i64.trunc_sat_f64_s
  local.set $4
  local.get $0
  local.get $4
  f64.convert_i64_s
  f64.sub
  local.set $0
  local.get $4
  local.get $2
  local.get $3
  if (result i32)
   local.get $2
   i32.const 45
   i32.store
   i32.const 1
  else
   i32.const 0
  end
  local.tee $3
  i32.const 2
  i32.shl
  i32.add
  call $src/wasm/string/operations/formatIntToCodes
  local.get $3
  i32.add
  local.set $3
  local.get $1
  i32.const 0
  i32.gt_s
  if
   local.get $2
   local.get $3
   i32.const 2
   i32.shl
   i32.add
   i32.const 46
   i32.store
   local.get $3
   i32.const 1
   i32.add
   local.set $3
   loop $for-loop|0
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $2
     local.get $3
     i32.const 2
     i32.shl
     i32.add
     local.get $0
     f64.const 10
     f64.mul
     local.tee $0
     f64.floor
     i32.trunc_sat_f64_s
     i32.const 10
     i32.rem_s
     i32.const 48
     i32.add
     i32.store
     local.get $3
     i32.const 1
     i32.add
     local.set $3
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
  end
  local.get $3
 )
 (func $src/wasm/string/operations/compareCodeArrays (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $1
  local.get $3
  local.get $1
  local.get $3
  i32.lt_s
  select
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $7
    local.get $0
    i32.add
    i32.load
    local.tee $6
    local.get $2
    local.get $7
    i32.add
    i32.load
    local.tee $7
    i32.lt_s
    if
     i32.const -1
     return
    end
    local.get $6
    local.get $7
    i32.gt_s
    if
     i32.const 1
     return
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $1
  local.get $3
  i32.lt_s
  if
   i32.const -1
   return
  end
  local.get $1
  local.get $3
  i32.gt_s
  if
   i32.const 1
   return
  end
  i32.const 0
 )
 (func $src/wasm/string/operations/hashCodes (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  i32.const -2128831035
  local.set $2
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.xor
    i32.const 16777619
    i32.mul
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/string/operations/findPattern (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $3
  i32.lt_s
  if
   i32.const -1
   return
  end
  loop $for-loop|0
   local.get $5
   local.get $1
   local.get $3
   i32.sub
   i32.le_s
   if
    i32.const 1
    local.set $6
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $3
     local.get $4
     i32.gt_s
     if
      block $for-break1
       local.get $0
       local.get $4
       local.get $5
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.get $2
       local.get $4
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.ne
       if
        i32.const 0
        local.set $6
        br $for-break1
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|1
      end
     end
    end
    local.get $6
    if
     local.get $5
     return
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  i32.const -1
 )
 (func $src/wasm/string/operations/countPattern (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $3
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $3
  i32.lt_s
  if
   i32.const 0
   return
  end
  loop $while-continue|0
   local.get $5
   local.get $1
   local.get $3
   i32.sub
   i32.le_s
   if
    i32.const 1
    local.set $6
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $3
     local.get $4
     i32.gt_s
     if
      block $for-break1
       local.get $0
       local.get $4
       local.get $5
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.get $2
       local.get $4
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.ne
       if
        i32.const 0
        local.set $6
        br $for-break1
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|1
      end
     end
    end
    local.get $6
    if (result i32)
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     local.get $3
     local.get $5
     i32.add
    else
     local.get $5
     i32.const 1
     i32.add
    end
    local.set $5
    br $while-continue|0
   end
  end
  local.get $7
 )
 (func $src/wasm/string/operations/utf8ByteLength (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $0
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $4
    i32.const 127
    i32.le_s
    if (result i32)
     local.get $2
     i32.const 1
     i32.add
    else
     local.get $2
     i32.const 2
     i32.add
     local.get $2
     i32.const 3
     i32.add
     local.get $2
     i32.const 4
     i32.add
     local.get $4
     i32.const 65535
     i32.le_s
     select
     local.get $4
     i32.const 2047
     i32.le_s
     select
    end
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/string/operations/isNumericString (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.eqz
  if
   i32.const 0
   return
  end
  loop $while-continue|0
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isWhitespace
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|0
   end
  end
  local.get $1
  local.get $2
  i32.le_s
  if
   i32.const 0
   return
  end
  local.get $2
  i32.const 1
  i32.add
  local.get $2
  local.get $0
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $2
  i32.const 43
  i32.eq
  local.get $2
  i32.const 45
  i32.eq
  i32.or
  select
  local.tee $2
  local.get $1
  i32.ge_s
  if
   i32.const 0
   return
  end
  loop $while-continue|1
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isDigit
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    i32.const 1
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|1
   end
  end
  local.get $1
  local.get $2
  i32.gt_s
  if (result i32)
   local.get $0
   local.get $2
   i32.const 2
   i32.shl
   i32.add
   i32.load
   i32.const 46
   i32.eq
  else
   i32.const 0
  end
  if
   local.get $2
   i32.const 1
   i32.add
   local.set $2
   loop $while-continue|2
    local.get $1
    local.get $2
    i32.gt_s
    if (result i32)
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     call $src/wasm/string/operations/isDigit
     i32.const 1
     i32.eq
    else
     i32.const 0
    end
    if
     i32.const 1
     local.set $3
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $while-continue|2
    end
   end
  end
  local.get $3
  i32.eqz
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $2
  i32.gt_s
  if
   local.get $0
   local.get $2
   i32.const 2
   i32.shl
   i32.add
   i32.load
   local.tee $3
   i32.const 101
   i32.eq
   local.get $3
   i32.const 69
   i32.eq
   i32.or
   if
    local.get $2
    i32.const 1
    i32.add
    local.tee $2
    local.get $1
    i32.lt_s
    if
     local.get $2
     i32.const 1
     i32.add
     local.get $2
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     local.tee $2
     i32.const 43
     i32.eq
     local.get $2
     i32.const 45
     i32.eq
     i32.or
     select
     local.set $2
    end
    local.get $1
    local.get $2
    i32.le_s
    if (result i32)
     i32.const 0
    else
     local.get $0
     local.get $2
     i32.const 2
     i32.shl
     i32.add
     i32.load
     call $src/wasm/string/operations/isDigit
    end
    i32.eqz
    if
     i32.const 0
     return
    end
    loop $while-continue|3
     local.get $1
     local.get $2
     i32.gt_s
     if (result i32)
      local.get $0
      local.get $2
      i32.const 2
      i32.shl
      i32.add
      i32.load
      call $src/wasm/string/operations/isDigit
      i32.const 1
      i32.eq
     else
      i32.const 0
     end
     if
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $while-continue|3
     end
    end
   end
  end
  loop $while-continue|4
   local.get $1
   local.get $2
   i32.gt_s
   if (result i32)
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    call $src/wasm/string/operations/isWhitespace
    i32.const 1
    i32.eq
   else
    i32.const 0
   end
   if
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $while-continue|4
   end
  end
  local.get $1
  local.get $2
  i32.eq
 )
 (func $src/wasm/simd/operations/simdAddF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -2
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f64x2.add
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 1
  i32.and
  if
   local.get $5
   i32.const 3
   i32.shl
   local.tee $3
   local.get $2
   i32.add
   local.get $0
   local.get $3
   i32.add
   f64.load
   local.get $1
   local.get $3
   i32.add
   f64.load
   f64.add
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdSubF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -2
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f64x2.sub
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 1
  i32.and
  if
   local.get $5
   i32.const 3
   i32.shl
   local.tee $3
   local.get $2
   i32.add
   local.get $0
   local.get $3
   i32.add
   f64.load
   local.get $1
   local.get $3
   i32.add
   f64.load
   f64.sub
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdMulF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -2
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f64x2.mul
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 1
  i32.and
  if
   local.get $5
   i32.const 3
   i32.shl
   local.tee $3
   local.get $2
   i32.add
   local.get $0
   local.get $3
   i32.add
   f64.load
   local.get $1
   local.get $3
   i32.add
   f64.load
   f64.mul
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdDivF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -2
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f64x2.div
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 1
  i32.and
  if
   local.get $5
   i32.const 3
   i32.shl
   local.tee $3
   local.get $2
   i32.add
   local.get $0
   local.get $3
   i32.add
   f64.load
   local.get $1
   local.get $3
   i32.add
   f64.load
   f64.div
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdScaleF64 (param $0 i32) (param $1 f64) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 v128)
  (local $7 i32)
  local.get $3
  i32.const -2
  i32.and
  local.set $5
  local.get $1
  f64x2.splat
  local.set $6
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $7
    local.get $2
    i32.add
    local.get $0
    local.get $7
    i32.add
    v128.load
    local.get $6
    f64x2.mul
    v128.store
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 1
  i32.and
  if
   local.get $5
   i32.const 3
   i32.shl
   local.tee $3
   local.get $2
   i32.add
   local.get $0
   local.get $3
   i32.add
   f64.load
   local.get $1
   f64.mul
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdDotF64 (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 v128)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  local.get $2
  i32.const -2
  i32.and
  local.set $6
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.lt_s
   if
    local.get $4
    local.get $3
    i32.const 3
    i32.shl
    local.tee $7
    local.get $0
    i32.add
    v128.load
    local.get $1
    local.get $7
    i32.add
    v128.load
    f64x2.mul
    f64x2.add
    local.set $4
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $4
  f64x2.extract_lane 0
  local.get $4
  f64x2.extract_lane 1
  f64.add
  local.set $5
  local.get $2
  i32.const 1
  i32.and
  if (result f64)
   local.get $5
   local.get $6
   i32.const 3
   i32.shl
   local.tee $2
   local.get $0
   i32.add
   f64.load
   local.get $1
   local.get $2
   i32.add
   f64.load
   f64.mul
   f64.add
  else
   local.get $5
  end
 )
 (func $src/wasm/simd/operations/simdSumF64 (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 v128)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.const -2
  i32.and
  local.set $4
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.lt_s
   if
    local.get $3
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    v128.load
    f64x2.add
    local.set $3
    local.get $2
    i32.const 2
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
  f64x2.extract_lane 0
  local.get $3
  f64x2.extract_lane 1
  f64.add
  local.set $5
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $5
   local.get $0
   local.get $4
   i32.const 3
   i32.shl
   i32.add
   f64.load
   f64.add
  else
   local.get $5
  end
 )
 (func $src/wasm/simd/operations/simdSumSquaresF64 (param $0 i32) (param $1 i32) (result f64)
  (local $2 v128)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  i32.const -2
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $2
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    v128.load
    local.tee $2
    local.get $2
    f64x2.mul
    f64x2.add
    local.set $2
    local.get $4
    i32.const 2
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $2
  f64x2.extract_lane 0
  local.get $2
  f64x2.extract_lane 1
  f64.add
  local.set $3
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $3
   local.get $0
   local.get $5
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.tee $3
   local.get $3
   f64.mul
   f64.add
  else
   local.get $3
  end
 )
 (func $src/wasm/simd/operations/simdNormF64 (param $0 i32) (param $1 i32) (result f64)
  local.get $0
  local.get $1
  call $src/wasm/simd/operations/simdSumSquaresF64
  f64.sqrt
 )
 (func $src/wasm/simd/operations/simdMinF64 (param $0 i32) (param $1 i32) (result f64)
  (local $2 v128)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  i32.const -2
  i32.and
  local.set $4
  v128.const i32x4 0xffffffff 0x7fefffff 0xffffffff 0x7fefffff
  local.set $2
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.lt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    local.get $0
    i32.add
    v128.load
    f64x2.min
    local.set $2
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  f64x2.extract_lane 0
  local.get $2
  f64x2.extract_lane 1
  f64.min
  local.set $5
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $0
   local.get $4
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $5
   f64.min
  else
   local.get $5
  end
 )
 (func $src/wasm/simd/operations/simdMaxF64 (param $0 i32) (param $1 i32) (result f64)
  (local $2 v128)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  i32.const -2
  i32.and
  local.set $4
  v128.const i32x4 0x00000001 0x00000000 0x00000001 0x00000000
  local.set $2
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.lt_s
   if
    local.get $2
    local.get $3
    i32.const 3
    i32.shl
    local.get $0
    i32.add
    v128.load
    f64x2.max
    local.set $2
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  f64x2.extract_lane 0
  local.get $2
  f64x2.extract_lane 1
  f64.max
  local.set $5
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $0
   local.get $4
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $5
   f64.max
  else
   local.get $5
  end
 )
 (func $src/wasm/simd/operations/simdAbsF64 (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  i32.const -2
  i32.and
  local.set $4
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.lt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $1
    i32.add
    local.get $0
    local.get $5
    i32.add
    v128.load
    f64x2.abs
    v128.store
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i32.const 1
  i32.and
  if
   local.get $4
   i32.const 3
   i32.shl
   local.tee $2
   local.get $1
   i32.add
   local.get $0
   local.get $2
   i32.add
   f64.load
   f64.abs
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdSqrtF64 (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  i32.const -2
  i32.and
  local.set $4
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.lt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $1
    i32.add
    local.get $0
    local.get $5
    i32.add
    v128.load
    f64x2.sqrt
    v128.store
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i32.const 1
  i32.and
  if
   local.get $4
   i32.const 3
   i32.shl
   local.tee $2
   local.get $1
   i32.add
   local.get $0
   local.get $2
   i32.add
   f64.load
   f64.sqrt
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdNegF64 (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  i32.const -2
  i32.and
  local.set $4
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.lt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $1
    i32.add
    local.get $0
    local.get $5
    i32.add
    v128.load
    f64x2.neg
    v128.store
    local.get $3
    i32.const 2
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i32.const 1
  i32.and
  if
   local.get $4
   i32.const 3
   i32.shl
   local.tee $2
   local.get $1
   i32.add
   local.get $0
   local.get $2
   i32.add
   f64.load
   f64.neg
   f64.store
  end
 )
 (func $src/wasm/simd/operations/simdMatVecMulF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 v128)
  (local $8 f64)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  local.get $4
  i32.const -2
  i32.and
  local.set $9
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_s
   if
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.set $7
    local.get $4
    local.get $6
    i32.mul
    i32.const 3
    i32.shl
    local.set $10
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $5
     local.get $9
     i32.lt_s
     if
      local.get $7
      local.get $5
      i32.const 3
      i32.shl
      local.tee $11
      local.get $0
      local.get $10
      i32.add
      i32.add
      v128.load
      local.get $1
      local.get $11
      i32.add
      v128.load
      f64x2.mul
      f64x2.add
      local.set $7
      local.get $5
      i32.const 2
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $7
    f64x2.extract_lane 0
    local.get $7
    f64x2.extract_lane 1
    f64.add
    local.set $8
    local.get $2
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    local.get $4
    i32.const 1
    i32.and
    if (result f64)
     local.get $8
     local.get $0
     local.get $9
     i32.const 3
     i32.shl
     local.tee $5
     local.get $10
     i32.add
     i32.add
     f64.load
     local.get $1
     local.get $5
     i32.add
     f64.load
     f64.mul
     f64.add
    else
     local.get $8
    end
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/simd/operations/simdMatAddF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  local.get $4
  i32.mul
  call $src/wasm/simd/operations/simdAddF64
 )
 (func $src/wasm/simd/operations/simdMatSubF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  local.get $4
  i32.mul
  call $src/wasm/simd/operations/simdSubF64
 )
 (func $src/wasm/simd/operations/simdMatDotMulF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  local.get $4
  i32.mul
  call $src/wasm/simd/operations/simdMulF64
 )
 (func $src/wasm/simd/operations/simdMatScaleF64 (param $0 i32) (param $1 f64) (param $2 i32) (param $3 i32) (param $4 i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  local.get $4
  i32.mul
  call $src/wasm/simd/operations/simdScaleF64
 )
 (func $src/wasm/simd/operations/simdMatMulF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 v128)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i32)
  local.get $4
  i32.const -2
  i32.and
  local.set $10
  loop $for-loop|0
   local.get $3
   local.get $8
   i32.gt_s
   if
    local.get $4
    local.get $8
    i32.mul
    i32.const 3
    i32.shl
    local.set $11
    local.get $5
    local.get $8
    i32.mul
    i32.const 3
    i32.shl
    local.set $13
    i32.const 0
    local.set $6
    loop $for-loop|1
     local.get $5
     local.get $6
     i32.gt_s
     if
      v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
      local.set $9
      i32.const 0
      local.set $7
      loop $for-loop|2
       local.get $7
       local.get $10
       i32.lt_s
       if
        local.get $9
        local.get $0
        local.get $11
        i32.add
        local.get $7
        i32.const 3
        i32.shl
        i32.add
        v128.load
        v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
        local.get $1
        local.get $5
        local.get $7
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64x2.replace_lane 0
        local.get $1
        local.get $7
        i32.const 1
        i32.add
        local.get $5
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64x2.replace_lane 1
        f64x2.mul
        f64x2.add
        local.set $9
        local.get $7
        i32.const 2
        i32.add
        local.set $7
        br $for-loop|2
       end
      end
      local.get $9
      f64x2.extract_lane 0
      local.get $9
      f64x2.extract_lane 1
      f64.add
      local.set $12
      local.get $2
      local.get $13
      i32.add
      local.get $6
      i32.const 3
      i32.shl
      i32.add
      local.get $4
      i32.const 1
      i32.and
      if (result f64)
       local.get $12
       local.get $0
       local.get $11
       i32.add
       local.get $10
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $1
       local.get $5
       local.get $10
       i32.mul
       local.get $6
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.mul
       f64.add
      else
       local.get $12
      end
      f64.store
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|1
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/simd/operations/simdMatTransposeF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 i32)
  (local $13 i32)
  local.get $2
  i32.const -2
  i32.and
  local.set $5
  local.get $3
  i32.const -2
  i32.and
  local.set $6
  loop $for-loop|0
   local.get $5
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $4
     local.get $6
     i32.lt_s
     if
      local.get $0
      local.get $3
      local.get $7
      i32.mul
      local.get $4
      i32.add
      local.tee $12
      i32.const 1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $9
      local.get $0
      local.get $7
      i32.const 1
      i32.add
      local.get $3
      i32.mul
      local.get $4
      i32.add
      local.tee $13
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $10
      local.get $0
      local.get $13
      i32.const 1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $11
      local.get $1
      local.get $2
      local.get $4
      i32.mul
      local.get $7
      i32.add
      local.tee $13
      i32.const 3
      i32.shl
      i32.add
      local.get $0
      local.get $12
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $1
      local.get $13
      i32.const 1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $10
      f64.store
      local.get $1
      local.get $4
      i32.const 1
      i32.add
      local.get $2
      i32.mul
      local.get $7
      i32.add
      local.tee $12
      i32.const 3
      i32.shl
      i32.add
      local.get $9
      f64.store
      local.get $1
      local.get $12
      i32.const 1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $11
      f64.store
      local.get $4
      i32.const 2
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  local.get $5
  local.set $4
  loop $for-loop|2
   local.get $2
   local.get $4
   i32.gt_s
   if
    i32.const 0
    local.set $7
    loop $for-loop|3
     local.get $3
     local.get $7
     i32.gt_s
     if
      local.get $1
      local.get $2
      local.get $7
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $0
      local.get $3
      local.get $4
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|2
   end
  end
  loop $for-loop|4
   local.get $5
   local.get $8
   i32.gt_s
   if
    local.get $6
    local.set $4
    loop $for-loop|5
     local.get $3
     local.get $4
     i32.gt_s
     if
      local.get $1
      local.get $2
      local.get $4
      i32.mul
      local.get $8
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $0
      local.get $3
      local.get $8
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|5
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|4
   end
  end
 )
 (func $src/wasm/simd/operations/simdMeanF64 (param $0 i32) (param $1 i32) (result f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  call $src/wasm/simd/operations/simdSumF64
  local.get $1
  f64.convert_i32_s
  f64.div
 )
 (func $src/wasm/simd/operations/simdVarianceF64 (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 v128)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  (local $7 v128)
  (local $8 f64)
  local.get $1
  local.get $2
  i32.le_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  i32.const -2
  i32.and
  local.set $6
  local.get $0
  local.get $1
  call $src/wasm/simd/operations/simdMeanF64
  local.tee $4
  f64x2.splat
  local.set $7
  loop $for-loop|0
   local.get $5
   local.get $6
   i32.lt_s
   if
    local.get $3
    local.get $5
    i32.const 3
    i32.shl
    local.get $0
    i32.add
    v128.load
    local.get $7
    f64x2.sub
    local.tee $3
    local.get $3
    f64x2.mul
    f64x2.add
    local.set $3
    local.get $5
    i32.const 2
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $3
  f64x2.extract_lane 0
  local.get $3
  f64x2.extract_lane 1
  f64.add
  local.set $8
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $8
   local.get $0
   local.get $6
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $4
   f64.sub
   local.tee $4
   local.get $4
   f64.mul
   f64.add
  else
   local.get $8
  end
  local.get $1
  local.get $2
  i32.sub
  f64.convert_i32_s
  f64.div
 )
 (func $src/wasm/simd/operations/simdVarianceF64@varargs (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  block $1of1
   block $0of1
    block $outOfRange
     global.get $~argumentsLength
     i32.const 2
     i32.sub
     br_table $0of1 $1of1 $outOfRange
    end
    unreachable
   end
   i32.const 0
   local.set $2
  end
  local.get $0
  local.get $1
  local.get $2
  call $src/wasm/simd/operations/simdVarianceF64
 )
 (func $src/wasm/simd/operations/simdStdF64@varargs (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  block $1of1
   block $0of1
    block $outOfRange
     global.get $~argumentsLength
     i32.const 2
     i32.sub
     br_table $0of1 $1of1 $outOfRange
    end
    unreachable
   end
   i32.const 0
   local.set $2
  end
  local.get $0
  local.get $1
  local.get $2
  call $src/wasm/simd/operations/simdVarianceF64
  f64.sqrt
 )
 (func $src/wasm/simd/operations/simdAddF32 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -4
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f32x4.add
    v128.store
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 2
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f32.load
    local.get $1
    local.get $4
    i32.add
    f32.load
    f32.add
    f32.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/simd/operations/simdMulF32 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -4
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    f32x4.mul
    v128.store
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 2
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    f32.load
    local.get $1
    local.get $4
    i32.add
    f32.load
    f32.mul
    f32.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/simd/operations/simdDotF32 (param $0 i32) (param $1 i32) (param $2 i32) (result f32)
  (local $3 i32)
  (local $4 i32)
  (local $5 v128)
  (local $6 f32)
  (local $7 i32)
  local.get $2
  i32.const -4
  i32.and
  local.set $3
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.gt_s
   if
    local.get $5
    local.get $4
    i32.const 2
    i32.shl
    local.tee $7
    local.get $0
    i32.add
    v128.load
    local.get $1
    local.get $7
    i32.add
    v128.load
    f32x4.mul
    f32x4.add
    local.set $5
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $5
  f32x4.extract_lane 0
  local.get $5
  f32x4.extract_lane 1
  f32.add
  local.get $5
  f32x4.extract_lane 2
  f32.add
  local.get $5
  f32x4.extract_lane 3
  f32.add
  local.set $6
  loop $for-loop|1
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $6
    local.get $3
    i32.const 2
    i32.shl
    local.tee $4
    local.get $0
    i32.add
    f32.load
    local.get $1
    local.get $4
    i32.add
    f32.load
    f32.mul
    f32.add
    local.set $6
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  local.get $6
 )
 (func $src/wasm/simd/operations/simdSumF32 (param $0 i32) (param $1 i32) (result f32)
  (local $2 i32)
  (local $3 v128)
  (local $4 i32)
  (local $5 f32)
  local.get $1
  i32.const -4
  i32.and
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $4
    i32.const 2
    i32.shl
    i32.add
    v128.load
    f32x4.add
    local.set $3
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  f32x4.extract_lane 0
  local.get $3
  f32x4.extract_lane 1
  f32.add
  local.get $3
  f32x4.extract_lane 2
  f32.add
  local.get $3
  f32x4.extract_lane 3
  f32.add
  local.set $5
  loop $for-loop|1
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $5
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    f32.load
    f32.add
    local.set $5
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|1
   end
  end
  local.get $5
 )
 (func $src/wasm/simd/operations/simdAddI32 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -4
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    i32x4.add
    v128.store
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 2
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    i32.load
    local.get $1
    local.get $4
    i32.add
    i32.load
    i32.add
    i32.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/simd/operations/simdMulI32 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $3
  i32.const -4
  i32.and
  local.set $5
  loop $for-loop|0
   local.get $4
   local.get $5
   i32.lt_s
   if
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    local.get $2
    i32.add
    local.get $0
    local.get $6
    i32.add
    v128.load
    local.get $1
    local.get $6
    i32.add
    v128.load
    i32x4.mul
    v128.store
    local.get $4
    i32.const 4
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 2
    i32.shl
    local.tee $4
    local.get $2
    i32.add
    local.get $0
    local.get $4
    i32.add
    i32.load
    local.get $1
    local.get $4
    i32.add
    i32.load
    i32.mul
    i32.store
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/simd/operations/simdComplexMulF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 i32)
  loop $for-loop|0
   local.get $3
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 4
    i32.shl
    local.tee $11
    local.get $0
    i32.add
    local.tee $6
    f64.load
    local.set $5
    local.get $2
    local.get $11
    i32.add
    local.tee $7
    local.get $5
    local.get $1
    local.get $11
    i32.add
    local.tee $11
    f64.load
    local.tee $8
    f64.mul
    local.get $6
    f64.load offset=8
    local.tee $9
    local.get $11
    f64.load offset=8
    local.tee $10
    f64.mul
    f64.sub
    f64.store
    local.get $7
    local.get $5
    local.get $10
    f64.mul
    local.get $9
    local.get $8
    f64.mul
    f64.add
    f64.store offset=8
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/simd/operations/simdComplexAddF64 (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  i32.const 1
  i32.shl
  call $src/wasm/simd/operations/simdAddF64
 )
 (func $src/wasm/simd/operations/simdSupported (result i32)
  i32.const 1
 )
 (func $src/wasm/simd/operations/simdVectorSizeF64 (result i32)
  i32.const 2
 )
 (func $src/wasm/simd/operations/simdVectorSizeF32 (result i32)
  i32.const 4
 )
 (func $src/wasm/statistics/basic/mean (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  local.get $1
  i32.eqz
  if
   f64.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.add
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
  local.get $1
  f64.convert_i32_s
  f64.div
 )
 (func $src/wasm/statistics/basic/median (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  local.get $1
  i32.eqz
  if
   f64.const 0
   return
  end
  local.get $1
  i32.const 1
  i32.eq
  if
   local.get $0
   f64.load
   return
  end
  local.get $1
  i32.const 1
  i32.shr_s
  local.set $2
  local.get $1
  i32.const 1
  i32.and
  if (result f64)
   local.get $0
   local.get $2
   i32.const 3
   i32.shl
   i32.add
   f64.load
  else
   local.get $0
   local.get $2
   i32.const 1
   i32.sub
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $0
   local.get $2
   i32.const 3
   i32.shl
   i32.add
   f64.load
   f64.add
   f64.const 0.5
   f64.mul
  end
 )
 (func $src/wasm/statistics/basic/quicksortRaw (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  local.get $1
  local.get $2
  i32.ge_s
  if
   return
  end
  local.get $0
  local.get $2
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.set $9
  local.get $1
  local.tee $3
  i32.const 1
  i32.sub
  local.set $4
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $9
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    local.tee $7
    f64.load
    local.tee $8
    f64.ge
    if
     local.get $0
     local.get $4
     i32.const 1
     i32.add
     local.tee $4
     i32.const 3
     i32.shl
     i32.add
     local.tee $6
     f64.load
     local.set $5
     local.get $6
     local.get $8
     f64.store
     local.get $7
     local.get $5
     f64.store
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $0
  local.get $4
  i32.const 1
  i32.add
  local.tee $3
  i32.const 3
  i32.shl
  i32.add
  local.tee $4
  f64.load
  local.set $5
  local.get $4
  local.get $0
  local.get $2
  i32.const 3
  i32.shl
  i32.add
  local.tee $4
  f64.load
  f64.store
  local.get $4
  local.get $5
  f64.store
  local.get $0
  local.get $1
  local.get $3
  i32.const 1
  i32.sub
  call $src/wasm/statistics/basic/quicksortRaw
  local.get $0
  local.get $3
  i32.const 1
  i32.add
  local.get $2
  call $src/wasm/statistics/basic/quicksortRaw
 )
 (func $src/wasm/statistics/basic/medianUnsorted (param $0 i32) (param $1 i32) (result f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  i32.const 0
  local.get $1
  i32.const 1
  i32.sub
  call $src/wasm/statistics/basic/quicksortRaw
  local.get $0
  local.get $1
  call $src/wasm/statistics/basic/median
 )
 (func $src/wasm/statistics/basic/variance (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  local.get $1
  i32.eqz
  if
   f64.const 0
   return
  end
  local.get $1
  local.get $2
  i32.le_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  call $src/wasm/statistics/basic/mean
  local.set $5
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.get $5
    f64.sub
    local.tee $3
    local.get $3
    f64.mul
    f64.add
    local.set $3
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $3
  local.get $1
  local.get $2
  i32.sub
  f64.convert_i32_s
  f64.div
 )
 (func $src/wasm/statistics/basic/std (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  local.get $0
  local.get $1
  local.get $2
  call $src/wasm/statistics/basic/variance
  f64.sqrt
 )
 (func $src/wasm/statistics/basic/sum (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.add
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/statistics/basic/prod (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 i32)
  f64.const 1
  local.set $2
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.mul
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/statistics/basic/mad (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  local.get $1
  i32.eqz
  if
   f64.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $5
    local.get $2
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i32.const 0
  local.get $1
  i32.const 1
  i32.sub
  call $src/wasm/statistics/basic/quicksortRaw
  local.get $2
  local.get $1
  call $src/wasm/statistics/basic/median
  local.set $6
  loop $for-loop|1
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $4
    i32.const 3
    i32.shl
    local.tee $3
    local.get $2
    i32.add
    local.get $0
    local.get $3
    i32.add
    f64.load
    local.get $6
    f64.sub
    f64.abs
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  local.get $2
  i32.const 0
  local.get $1
  i32.const 1
  i32.sub
  call $src/wasm/statistics/basic/quicksortRaw
  local.get $2
  local.get $1
  call $src/wasm/statistics/basic/median
 )
 (func $src/wasm/statistics/basic/kurtosis (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  local.get $1
  i32.const 4
  i32.lt_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  call $src/wasm/statistics/basic/mean
  local.set $4
  local.get $0
  local.get $1
  i32.const 1
  call $src/wasm/statistics/basic/variance
  f64.sqrt
  local.tee $5
  f64.const 0
  f64.eq
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.get $4
    f64.sub
    local.get $5
    f64.div
    local.tee $2
    local.get $2
    f64.mul
    local.tee $2
    local.get $2
    f64.mul
    f64.add
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $1
  f64.convert_i32_s
  local.tee $5
  f64.const -1
  f64.add
  local.set $6
  local.get $5
  local.get $5
  f64.const 1
  f64.add
  f64.mul
  local.get $6
  local.get $5
  f64.const -2
  f64.add
  local.tee $4
  f64.mul
  local.get $5
  f64.const -3
  f64.add
  local.tee $5
  f64.mul
  f64.div
  local.get $2
  f64.mul
  local.get $6
  f64.const 3
  f64.mul
  local.get $6
  f64.mul
  local.get $4
  local.get $5
  f64.mul
  f64.div
  f64.sub
 )
 (func $src/wasm/statistics/basic/skewness (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 i32)
  (local $4 f64)
  (local $5 f64)
  local.get $1
  i32.const 3
  i32.lt_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  call $src/wasm/statistics/basic/mean
  local.set $5
  local.get $0
  local.get $1
  i32.const 1
  call $src/wasm/statistics/basic/variance
  f64.sqrt
  local.tee $4
  f64.const 0
  f64.eq
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.get $5
    f64.sub
    local.get $4
    f64.div
    local.tee $2
    local.get $2
    f64.mul
    local.get $2
    f64.mul
    f64.add
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $1
  f64.convert_i32_s
  local.tee $4
  local.get $4
  f64.const -1
  f64.add
  local.get $4
  f64.const -2
  f64.add
  f64.mul
  f64.div
  local.get $2
  f64.mul
 )
 (func $src/wasm/statistics/basic/coefficientOfVariation (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  local.get $0
  local.get $1
  call $src/wasm/statistics/basic/mean
  local.tee $2
  f64.const 0
  f64.eq
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  i32.const 1
  call $src/wasm/statistics/basic/variance
  f64.sqrt
  local.get $2
  f64.abs
  f64.div
 )
 (func $src/wasm/statistics/basic/correlation (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 i32)
  (local $10 f64)
  (local $11 f64)
  local.get $2
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $2
  call $src/wasm/statistics/basic/mean
  local.set $7
  local.get $1
  local.get $2
  call $src/wasm/statistics/basic/mean
  local.set $8
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    i32.const 3
    i32.shl
    local.tee $9
    local.get $0
    i32.add
    f64.load
    local.get $7
    f64.sub
    local.tee $10
    local.get $1
    local.get $9
    i32.add
    f64.load
    local.get $8
    f64.sub
    local.tee $11
    f64.mul
    f64.add
    local.set $3
    local.get $5
    local.get $10
    local.get $10
    f64.mul
    f64.add
    local.set $5
    local.get $6
    local.get $11
    local.get $11
    f64.mul
    f64.add
    local.set $6
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $5
  local.get $6
  f64.mul
  f64.sqrt
  local.tee $5
  f64.const 0
  f64.eq
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $3
  local.get $5
  f64.div
 )
 (func $src/wasm/statistics/basic/covariance (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 i32)
  local.get $2
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $2
  local.get $3
  i32.le_s
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $2
  call $src/wasm/statistics/basic/mean
  local.set $6
  local.get $1
  local.get $2
  call $src/wasm/statistics/basic/mean
  local.set $7
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $5
    local.get $4
    i32.const 3
    i32.shl
    local.tee $8
    local.get $0
    i32.add
    f64.load
    local.get $6
    f64.sub
    local.get $1
    local.get $8
    i32.add
    f64.load
    local.get $7
    f64.sub
    f64.mul
    f64.add
    local.set $5
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $5
  local.get $2
  local.get $3
  i32.sub
  f64.convert_i32_s
  f64.div
 )
 (func $src/wasm/statistics/basic/geometricMean (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $4
    f64.const 0
    f64.le
    if
     f64.const nan:0x8000000000000
     return
    end
    local.get $3
    local.get $4
    call $~lib/math/NativeMath.log
    f64.add
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
  local.get $1
  f64.convert_i32_s
  f64.div
  call $~lib/math/NativeMath.exp
 )
 (func $src/wasm/statistics/basic/harmonicMean (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $4
    f64.const 0
    f64.eq
    if
     f64.const 0
     return
    end
    local.get $3
    f64.const 1
    local.get $4
    f64.div
    f64.add
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $1
  f64.convert_i32_s
  local.get $3
  f64.div
 )
 (func $src/wasm/statistics/basic/rms (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 i32)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $2
    local.get $2
    f64.mul
    f64.add
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  local.get $1
  f64.convert_i32_s
  f64.div
  f64.sqrt
 )
 (func $src/wasm/statistics/basic/quantile (param $0 i32) (param $1 i32) (param $2 f64) (result f64)
  (local $3 i32)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $2
  f64.const 0
  f64.lt
  local.get $2
  f64.const 1
  f64.gt
  i32.or
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $2
  local.get $1
  i32.const 1
  i32.sub
  f64.convert_i32_s
  f64.mul
  local.tee $2
  f64.floor
  i32.trunc_sat_f64_s
  local.tee $1
  local.get $2
  f64.ceil
  i32.trunc_sat_f64_s
  local.tee $3
  i32.eq
  if
   local.get $0
   local.get $1
   i32.const 3
   i32.shl
   i32.add
   f64.load
   return
  end
  local.get $0
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  f64.load
  f64.const 1
  local.get $2
  local.get $1
  f64.convert_i32_s
  f64.sub
  local.tee $2
  f64.sub
  f64.mul
  local.get $0
  local.get $3
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.get $2
  f64.mul
  f64.add
 )
 (func $src/wasm/statistics/basic/percentile (param $0 i32) (param $1 i32) (param $2 f64) (result f64)
  local.get $0
  local.get $1
  local.get $2
  f64.const 100
  f64.div
  call $src/wasm/statistics/basic/quantile
 )
 (func $src/wasm/statistics/basic/interquartileRange (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  local.get $1
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  i32.const 0
  local.get $1
  i32.const 1
  i32.sub
  call $src/wasm/statistics/basic/quicksortRaw
  local.get $0
  local.get $1
  f64.const 0.25
  call $src/wasm/statistics/basic/quantile
  local.set $2
  local.get $0
  local.get $1
  f64.const 0.75
  call $src/wasm/statistics/basic/quantile
  local.get $2
  f64.sub
 )
 (func $src/wasm/statistics/basic/range (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 i32)
  f64.const nan:0x8000000000000
  local.set $2
  local.get $1
  if
   local.get $0
   f64.load
   local.set $2
   i32.const 1
   local.set $5
   loop $for-loop|0
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $0
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.tee $3
     local.get $2
     f64.gt
     if
      local.get $3
      local.set $2
     end
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|0
    end
   end
  end
  local.get $2
  f64.const nan:0x8000000000000
  local.set $2
  local.get $1
  if
   local.get $0
   f64.load
   local.set $2
   i32.const 1
   local.set $5
   loop $for-loop|00
    local.get $1
    local.get $5
    i32.gt_s
    if
     local.get $0
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.tee $3
     local.get $2
     f64.lt
     if
      local.get $3
      local.set $2
     end
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     br $for-loop|00
    end
   end
  end
  local.get $2
  f64.sub
 )
 (func $src/wasm/statistics/basic/cumsum (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.eqz
  if
   return
  end
  i32.const 1
  local.set $2
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    local.tee $3
    local.get $0
    local.get $2
    i32.const 1
    i32.sub
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.get $3
    f64.load
    f64.add
    f64.store
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/statistics/basic/zscore (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 f64)
  (local $6 i32)
  local.get $2
  i32.eqz
  if
   return
  end
  local.get $0
  local.get $2
  call $src/wasm/statistics/basic/mean
  local.set $4
  local.get $0
  local.get $2
  i32.const 1
  call $src/wasm/statistics/basic/variance
  f64.sqrt
  local.tee $5
  f64.const 0
  f64.eq
  if
   loop $for-loop|0
    local.get $2
    local.get $3
    i32.gt_s
    if
     local.get $1
     local.get $3
     i32.const 3
     i32.shl
     i32.add
     f64.const 0
     f64.store
     local.get $3
     i32.const 1
     i32.add
     local.set $3
     br $for-loop|0
    end
   end
   return
  end
  loop $for-loop|1
   local.get $2
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 3
    i32.shl
    local.tee $6
    local.get $1
    i32.add
    local.get $0
    local.get $6
    i32.add
    f64.load
    local.get $4
    f64.sub
    local.get $5
    f64.div
    f64.store
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/linalg/det (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 i32)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 i32)
  local.get $1
  i32.const 1
  i32.eq
  if
   local.get $0
   f64.load
   return
  end
  local.get $1
  i32.const 2
  i32.eq
  if
   local.get $0
   f64.load
   local.get $0
   f64.load offset=24
   f64.mul
   local.get $0
   f64.load offset=8
   local.get $0
   f64.load offset=16
   f64.mul
   f64.sub
   return
  end
  local.get $1
  i32.const 3
  i32.eq
  if
   local.get $0
   f64.load
   local.tee $9
   local.get $0
   f64.load offset=32
   local.tee $10
   f64.mul
   local.get $0
   i32.const -64
   i32.sub
   f64.load
   local.tee $11
   f64.mul
   local.get $0
   f64.load offset=8
   local.tee $13
   local.get $0
   f64.load offset=40
   local.tee $14
   f64.mul
   local.get $0
   f64.load offset=48
   local.tee $15
   f64.mul
   f64.add
   local.get $0
   f64.load offset=16
   local.tee $3
   local.get $0
   f64.load offset=24
   local.tee $5
   f64.mul
   local.get $0
   f64.load offset=56
   local.tee $6
   f64.mul
   f64.add
   local.get $3
   local.get $10
   f64.mul
   local.get $15
   f64.mul
   f64.sub
   local.get $13
   local.get $5
   f64.mul
   local.get $11
   f64.mul
   f64.sub
   local.get $9
   local.get $14
   f64.mul
   local.get $6
   f64.mul
   f64.sub
   return
  end
  local.get $1
  local.get $1
  i32.mul
  local.set $16
  loop $for-loop|0
   local.get $7
   local.get $16
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $12
    local.get $2
    i32.add
    local.get $0
    local.get $12
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  f64.const 1
  local.set $3
  loop $for-loop|1
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $2
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $4
    local.tee $0
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|2
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $2
      local.get $1
      local.get $7
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $0
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|2
     end
    end
    local.get $5
    f64.const 1e-14
    f64.lt
    if
     f64.const 0
     return
    end
    local.get $0
    local.get $4
    i32.ne
    if
     i32.const 0
     local.set $7
     loop $for-loop|3
      local.get $1
      local.get $7
      i32.gt_s
      if
       local.get $2
       local.get $1
       local.get $4
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $12
       f64.load
       local.set $5
       local.get $12
       local.get $2
       local.get $0
       local.get $1
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $12
       f64.load
       f64.store
       local.get $12
       local.get $5
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|3
      end
     end
     local.get $3
     f64.neg
     local.set $3
    end
    local.get $2
    local.get $1
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $4
    i32.const 1
    i32.add
    local.set $0
    loop $for-loop|4
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $2
      local.get $0
      local.get $1
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $5
      f64.div
      local.set $6
      local.get $4
      i32.const 1
      i32.add
      local.set $7
      loop $for-loop|5
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $2
        local.get $0
        local.get $1
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $12
        local.get $12
        f64.load
        local.get $6
        local.get $2
        local.get $1
        local.get $4
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        f64.store
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|5
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|4
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  loop $for-loop|6
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $3
    local.get $2
    local.get $1
    local.get $8
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.mul
    local.set $3
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|6
   end
  end
  local.get $3
 )
 (func $src/wasm/matrix/linalg/inv (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  local.get $1
  i32.const 1
  i32.shl
  local.set $8
  loop $for-loop|0
   local.get $1
   local.get $9
   i32.gt_s
   if
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $3
      local.get $8
      local.get $9
      i32.mul
      local.tee $11
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $0
      local.get $1
      local.get $9
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $3
      local.get $1
      local.get $11
      i32.add
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $7
      local.get $9
      i32.eq
      select
      f64.store
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|0
   end
  end
  loop $for-loop|2
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $3
    local.get $4
    local.get $8
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $4
    local.tee $0
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|3
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $3
      local.get $7
      local.get $8
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $0
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    local.get $5
    f64.const 1e-14
    f64.lt
    if
     i32.const 0
     return
    end
    local.get $0
    local.get $4
    i32.ne
    if
     i32.const 0
     local.set $7
     loop $for-loop|4
      local.get $7
      local.get $8
      i32.lt_s
      if
       local.get $3
       local.get $4
       local.get $8
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $9
       f64.load
       local.set $5
       local.get $9
       local.get $3
       local.get $0
       local.get $8
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $9
       f64.load
       f64.store
       local.get $9
       local.get $5
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|4
      end
     end
    end
    local.get $3
    local.get $4
    local.get $8
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    i32.const 0
    local.set $0
    loop $for-loop|5
     local.get $0
     local.get $8
     i32.lt_s
     if
      local.get $3
      local.get $4
      local.get $8
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.tee $7
      local.get $7
      f64.load
      local.get $5
      f64.div
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|5
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|6
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $0
      local.get $4
      i32.ne
      if
       local.get $3
       local.get $0
       local.get $8
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $5
       i32.const 0
       local.set $7
       loop $for-loop|7
        local.get $7
        local.get $8
        i32.lt_s
        if
         local.get $3
         local.get $0
         local.get $8
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $9
         local.get $9
         f64.load
         local.get $5
         local.get $3
         local.get $4
         local.get $8
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.sub
         f64.store
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|7
        end
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|6
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|2
   end
  end
  loop $for-loop|8
   local.get $1
   local.get $10
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|9
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $2
      local.get $1
      local.get $10
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $3
      local.get $8
      local.get $10
      i32.mul
      local.get $1
      i32.add
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|9
     end
    end
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|8
   end
  end
  i32.const 1
 )
 (func $src/wasm/matrix/linalg/inv2x2 (param $0 i32) (param $1 i32) (result i32)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  local.get $0
  f64.load
  local.tee $2
  local.get $0
  f64.load offset=24
  local.tee $6
  f64.mul
  local.get $0
  f64.load offset=8
  local.tee $3
  local.get $0
  f64.load offset=16
  local.tee $4
  f64.mul
  f64.sub
  local.tee $5
  f64.abs
  f64.const 1e-14
  f64.lt
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $6
  f64.const 1
  local.get $5
  f64.div
  local.tee $5
  f64.mul
  f64.store
  local.get $1
  local.get $3
  f64.neg
  local.get $5
  f64.mul
  f64.store offset=8
  local.get $1
  local.get $4
  f64.neg
  local.get $5
  f64.mul
  f64.store offset=16
  local.get $1
  local.get $2
  local.get $5
  f64.mul
  f64.store offset=24
  i32.const 1
 )
 (func $src/wasm/matrix/linalg/inv3x3 (param $0 i32) (param $1 i32) (result i32)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  local.get $0
  f64.load offset=32
  local.tee $5
  local.get $0
  i32.const -64
  i32.sub
  f64.load
  local.tee $12
  f64.mul
  local.get $0
  f64.load offset=40
  local.tee $6
  local.get $0
  f64.load offset=56
  local.tee $7
  f64.mul
  f64.sub
  local.set $14
  local.get $6
  local.get $0
  f64.load offset=48
  local.tee $8
  f64.mul
  local.get $0
  f64.load offset=24
  local.tee $9
  local.get $12
  f64.mul
  f64.sub
  local.set $10
  local.get $0
  f64.load offset=16
  local.tee $2
  local.get $7
  f64.mul
  local.get $0
  f64.load offset=8
  local.tee $3
  local.get $12
  f64.mul
  f64.sub
  local.set $11
  local.get $0
  f64.load
  local.tee $4
  local.get $12
  f64.mul
  local.get $2
  local.get $8
  f64.mul
  f64.sub
  local.set $15
  local.get $4
  local.get $14
  f64.mul
  local.get $3
  local.get $10
  f64.mul
  f64.add
  local.get $2
  local.get $9
  local.get $7
  f64.mul
  local.get $5
  local.get $8
  f64.mul
  f64.sub
  local.tee $12
  f64.mul
  f64.add
  local.tee $13
  f64.abs
  f64.const 1e-14
  f64.lt
  if
   i32.const 0
   return
  end
  local.get $1
  local.get $14
  f64.const 1
  local.get $13
  f64.div
  local.tee $13
  f64.mul
  f64.store
  local.get $1
  local.get $11
  local.get $13
  f64.mul
  f64.store offset=8
  local.get $1
  local.get $3
  local.get $6
  f64.mul
  local.get $2
  local.get $5
  f64.mul
  f64.sub
  local.get $13
  f64.mul
  f64.store offset=16
  local.get $1
  local.get $10
  local.get $13
  f64.mul
  f64.store offset=24
  local.get $1
  local.get $15
  local.get $13
  f64.mul
  f64.store offset=32
  local.get $1
  local.get $2
  local.get $9
  f64.mul
  local.get $4
  local.get $6
  f64.mul
  f64.sub
  local.get $13
  f64.mul
  f64.store offset=40
  local.get $1
  local.get $12
  local.get $13
  f64.mul
  f64.store offset=48
  local.get $1
  local.get $3
  local.get $8
  f64.mul
  local.get $4
  local.get $7
  f64.mul
  f64.sub
  local.get $13
  f64.mul
  f64.store offset=56
  local.get $1
  i32.const -64
  i32.sub
  local.get $4
  local.get $5
  f64.mul
  local.get $3
  local.get $9
  f64.mul
  f64.sub
  local.get $13
  f64.mul
  f64.store
  i32.const 1
 )
 (func $src/wasm/matrix/linalg/norm1 (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $3
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    f64.add
    local.set $3
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/matrix/linalg/norm2 (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $2
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $2
    local.get $2
    f64.mul
    f64.add
    local.set $2
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  f64.sqrt
 )
 (func $src/wasm/matrix/linalg/normP (param $0 i32) (param $1 i32) (param $2 f64) (result f64)
  (local $3 i32)
  (local $4 f64)
  local.get $2
  f64.const 1
  f64.eq
  if
   local.get $0
   local.get $1
   call $src/wasm/matrix/linalg/norm1
   return
  end
  local.get $2
  f64.const 2
  f64.eq
  if
   local.get $0
   local.get $1
   call $src/wasm/matrix/linalg/norm2
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $4
    local.get $0
    local.get $3
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.get $2
    call $~lib/math/NativeMath.pow
    f64.add
    local.set $4
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $4
  f64.const 1
  local.get $2
  f64.div
  call $~lib/math/NativeMath.pow
 )
 (func $src/wasm/matrix/linalg/normFro (param $0 i32) (param $1 i32) (result f64)
  local.get $0
  local.get $1
  call $src/wasm/matrix/linalg/norm2
 )
 (func $src/wasm/matrix/linalg/matrixNorm1 (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  loop $for-loop|0
   local.get $2
   local.get $5
   i32.gt_s
   if
    f64.const 0
    local.set $3
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $3
      local.get $0
      local.get $2
      local.get $4
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      f64.add
      local.set $3
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $3
    local.get $6
    local.get $3
    local.get $6
    f64.gt
    select
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $6
 )
 (func $src/wasm/matrix/linalg/matrixNormInf (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.gt_s
   if
    f64.const 0
    local.set $3
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $2
     local.get $4
     i32.gt_s
     if
      local.get $3
      local.get $0
      local.get $2
      local.get $5
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      f64.add
      local.set $3
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $3
    local.get $6
    local.get $3
    local.get $6
    f64.gt
    select
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $6
 )
 (func $src/wasm/matrix/linalg/normalize (param $0 i32) (param $1 i32) (result f64)
  (local $2 i32)
  (local $3 f64)
  (local $4 i32)
  local.get $0
  local.get $1
  call $src/wasm/matrix/linalg/norm2
  local.tee $3
  f64.const 1e-14
  f64.lt
  if
   f64.const 0
   return
  end
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.const 3
    i32.shl
    i32.add
    local.tee $4
    local.get $4
    f64.load
    local.get $3
    f64.div
    f64.store
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/matrix/linalg/kron (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  local.get $2
  local.get $5
  i32.mul
  local.set $11
  loop $for-loop|0
   local.get $1
   local.get $10
   i32.gt_s
   if
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $2
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $2
      local.get $10
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $12
      i32.const 0
      local.set $8
      loop $for-loop|2
       local.get $4
       local.get $8
       i32.gt_s
       if
        i32.const 0
        local.set $9
        loop $for-loop|3
         local.get $5
         local.get $9
         i32.gt_s
         if
          local.get $6
          local.get $5
          local.get $7
          i32.mul
          local.get $9
          i32.add
          local.get $4
          local.get $10
          i32.mul
          local.get $8
          i32.add
          local.get $11
          i32.mul
          i32.add
          i32.const 3
          i32.shl
          i32.add
          local.get $12
          local.get $3
          local.get $5
          local.get $8
          i32.mul
          local.get $9
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.store
          local.get $9
          i32.const 1
          i32.add
          local.set $9
          br $for-loop|3
         end
        end
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $for-loop|2
       end
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/linalg/cross (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  local.get $0
  f64.load
  local.set $3
  local.get $1
  f64.load
  local.set $4
  local.get $2
  local.get $0
  f64.load offset=8
  local.tee $5
  local.get $1
  f64.load offset=16
  local.tee $6
  f64.mul
  local.get $0
  f64.load offset=16
  local.tee $7
  local.get $1
  f64.load offset=8
  local.tee $8
  f64.mul
  f64.sub
  f64.store
  local.get $2
  local.get $7
  local.get $4
  f64.mul
  local.get $3
  local.get $6
  f64.mul
  f64.sub
  f64.store offset=8
  local.get $2
  local.get $3
  local.get $8
  f64.mul
  local.get $5
  local.get $4
  f64.mul
  f64.sub
  f64.store offset=16
 )
 (func $src/wasm/matrix/linalg/outer (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $7
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $3
     local.get $5
     i32.gt_s
     if
      local.get $4
      local.get $3
      local.get $6
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $7
      local.get $2
      local.get $5
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.store
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/linalg/cond1 (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  local.get $0
  local.get $1
  local.get $1
  call $src/wasm/matrix/linalg/matrixNorm1
  local.get $0
  local.get $1
  local.get $2
  local.get $2
  local.get $1
  local.get $1
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  call $src/wasm/matrix/linalg/inv
  i32.eqz
  if
   f64.const inf
   return
  end
  local.get $2
  local.get $1
  local.get $1
  call $src/wasm/matrix/linalg/matrixNorm1
  f64.mul
 )
 (func $src/wasm/matrix/linalg/condInf (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  local.get $0
  local.get $1
  local.get $1
  call $src/wasm/matrix/linalg/matrixNormInf
  local.get $0
  local.get $1
  local.get $2
  local.get $2
  local.get $1
  local.get $1
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  call $src/wasm/matrix/linalg/inv
  i32.eqz
  if
   f64.const inf
   return
  end
  local.get $2
  local.get $1
  local.get $1
  call $src/wasm/matrix/linalg/matrixNormInf
  f64.mul
 )
 (func $src/wasm/matrix/linalg/rank (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (result i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  local.get $1
  local.get $2
  i32.mul
  local.set $11
  loop $for-loop|0
   local.get $6
   local.get $11
   i32.lt_s
   if
    local.get $6
    i32.const 3
    i32.shl
    local.tee $10
    local.get $4
    i32.add
    local.get $0
    local.get $10
    i32.add
    f64.load
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  local.get $1
  local.get $2
  local.get $1
  local.get $2
  i32.lt_s
  select
  local.set $11
  loop $for-loop|1
   local.get $8
   local.get $11
   i32.lt_s
   if
    f64.const 0
    local.set $9
    i32.const -1
    local.set $6
    local.get $5
    local.set $0
    loop $for-loop|2
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $4
      local.get $0
      local.get $2
      i32.mul
      local.get $8
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $7
      local.get $9
      f64.gt
      if
       local.get $7
       local.set $9
       local.get $0
       local.set $6
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|2
     end
    end
    local.get $3
    local.get $9
    f64.ge
    i32.eqz
    if
     local.get $5
     local.get $6
     i32.ne
     if
      i32.const 0
      local.set $0
      loop $for-loop|3
       local.get $0
       local.get $2
       i32.lt_s
       if
        local.get $4
        local.get $2
        local.get $5
        i32.mul
        local.get $0
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        local.set $7
        local.get $10
        local.get $4
        local.get $2
        local.get $6
        i32.mul
        local.get $0
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        f64.store
        local.get $10
        local.get $7
        f64.store
        local.get $0
        i32.const 1
        i32.add
        local.set $0
        br $for-loop|3
       end
      end
     end
     local.get $4
     local.get $2
     local.get $5
     i32.mul
     local.get $8
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.set $9
     local.get $5
     i32.const 1
     i32.add
     local.set $6
     loop $for-loop|4
      local.get $1
      local.get $6
      i32.gt_s
      if
       local.get $4
       local.get $2
       local.get $6
       i32.mul
       local.get $8
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $9
       f64.div
       local.set $7
       local.get $8
       local.set $0
       loop $for-loop|5
        local.get $0
        local.get $2
        i32.lt_s
        if
         local.get $4
         local.get $2
         local.get $6
         i32.mul
         local.get $0
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $10
         local.get $10
         f64.load
         local.get $7
         local.get $4
         local.get $2
         local.get $5
         i32.mul
         local.get $0
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.sub
         f64.store
         local.get $0
         i32.const 1
         i32.add
         local.set $0
         br $for-loop|5
        end
       end
       local.get $6
       i32.const 1
       i32.add
       local.set $6
       br $for-loop|4
      end
     end
     local.get $5
     i32.const 1
     i32.add
     local.set $5
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
  local.get $5
 )
 (func $src/wasm/matrix/linalg/solve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  local.get $4
  local.get $2
  local.get $2
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  local.set $11
  loop $for-loop|0
   local.get $9
   local.get $2
   local.get $2
   i32.mul
   i32.lt_s
   if
    local.get $9
    i32.const 3
    i32.shl
    local.tee $12
    local.get $4
    i32.add
    local.get $0
    local.get $12
    i32.add
    f64.load
    f64.store
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $8
   i32.gt_s
   if
    local.get $11
    local.get $8
    i32.const 2
    i32.shl
    i32.add
    local.get $8
    i32.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
  loop $for-loop|2
   local.get $6
   local.get $2
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $4
    local.get $2
    local.get $6
    i32.mul
    local.get $6
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $6
    local.tee $0
    i32.const 1
    i32.add
    local.set $8
    loop $for-loop|3
     local.get $2
     local.get $8
     i32.gt_s
     if
      local.get $4
      local.get $2
      local.get $8
      i32.mul
      local.get $6
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $7
      local.get $5
      f64.gt
      if
       local.get $7
       local.set $5
       local.get $8
       local.set $0
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|3
     end
    end
    local.get $5
    f64.const 1e-14
    f64.lt
    if
     i32.const 0
     return
    end
    local.get $0
    local.get $6
    i32.ne
    if
     i32.const 0
     local.set $8
     loop $for-loop|4
      local.get $2
      local.get $8
      i32.gt_s
      if
       local.get $4
       local.get $2
       local.get $6
       i32.mul
       local.get $8
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $9
       f64.load
       local.set $5
       local.get $9
       local.get $4
       local.get $0
       local.get $2
       i32.mul
       local.get $8
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $9
       f64.load
       f64.store
       local.get $9
       local.get $5
       f64.store
       local.get $8
       i32.const 1
       i32.add
       local.set $8
       br $for-loop|4
      end
     end
     local.get $11
     local.get $6
     i32.const 2
     i32.shl
     i32.add
     local.tee $8
     i32.load
     local.set $9
     local.get $8
     local.get $11
     local.get $0
     i32.const 2
     i32.shl
     i32.add
     local.tee $0
     i32.load
     i32.store
     local.get $0
     local.get $9
     i32.store
    end
    local.get $4
    local.get $2
    local.get $6
    i32.mul
    local.get $6
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $6
    i32.const 1
    i32.add
    local.set $0
    loop $for-loop|5
     local.get $0
     local.get $2
     i32.lt_s
     if
      local.get $4
      local.get $0
      local.get $2
      i32.mul
      local.get $6
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.tee $8
      f64.load
      local.get $5
      f64.div
      local.set $7
      local.get $8
      local.get $7
      f64.store
      local.get $6
      i32.const 1
      i32.add
      local.set $8
      loop $for-loop|6
       local.get $2
       local.get $8
       i32.gt_s
       if
        local.get $4
        local.get $0
        local.get $2
        i32.mul
        local.get $8
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $9
        local.get $9
        f64.load
        local.get $7
        local.get $4
        local.get $2
        local.get $6
        i32.mul
        local.get $8
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        f64.store
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $for-loop|6
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|5
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|2
   end
  end
  local.get $4
  local.get $2
  i32.const 1
  i32.sub
  local.tee $0
  local.get $2
  i32.mul
  local.get $0
  i32.add
  i32.const 3
  i32.shl
  i32.add
  f64.load
  f64.abs
  f64.const 1e-14
  f64.lt
  if
   i32.const 0
   return
  end
  loop $for-loop|7
   local.get $2
   local.get $10
   i32.gt_s
   if
    local.get $1
    local.get $11
    local.get $10
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    i32.const 0
    local.set $0
    loop $for-loop|8
     local.get $0
     local.get $10
     i32.lt_s
     if
      local.get $5
      local.get $4
      local.get $2
      local.get $10
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $3
      local.get $0
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.sub
      local.set $5
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|8
     end
    end
    local.get $3
    local.get $10
    i32.const 3
    i32.shl
    i32.add
    local.get $5
    f64.store
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|7
   end
  end
  local.get $2
  i32.const 1
  i32.sub
  local.set $0
  loop $for-loop|9
   local.get $0
   i32.const 0
   i32.ge_s
   if
    local.get $3
    local.get $0
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    local.get $0
    i32.const 1
    i32.add
    local.set $1
    loop $for-loop|10
     local.get $1
     local.get $2
     i32.lt_s
     if
      local.get $5
      local.get $4
      local.get $0
      local.get $2
      i32.mul
      local.get $1
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.get $3
      local.get $1
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.mul
      f64.sub
      local.set $5
      local.get $1
      i32.const 1
      i32.add
      local.set $1
      br $for-loop|10
     end
    end
    local.get $3
    local.get $0
    i32.const 3
    i32.shl
    i32.add
    local.get $5
    local.get $4
    local.get $0
    local.get $2
    i32.mul
    local.get $0
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.div
    f64.store
    local.get $0
    i32.const 1
    i32.sub
    local.set $0
    br $for-loop|9
   end
  end
  i32.const 1
 )
 (func $src/wasm/matrix/eigs/getMaxOffDiagonal (param $0 i32) (param $1 i32) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.gt_s
   if
    local.get $5
    i32.const 1
    i32.add
    local.set $4
    loop $for-loop|1
     local.get $1
     local.get $4
     i32.gt_s
     if
      local.get $3
      local.get $0
      local.get $1
      local.get $5
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $2
      f64.lt
      if
       local.get $2
       local.set $3
      end
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/wasm/matrix/eigs/findMaxOffDiagonalIndices (param $0 i32) (param $1 i32) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  i32.const 1
  local.set $2
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    local.get $3
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|1
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $6
      local.get $0
      local.get $1
      local.get $3
      i32.mul
      local.get $7
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $5
      f64.lt
      if
       local.get $5
       local.set $6
       local.get $3
       local.set $4
       local.get $7
       local.set $2
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $2
  i64.extend_i32_s
  local.get $4
  i64.extend_i32_s
  i64.const 32
  i64.shl
  i64.or
 )
 (func $src/wasm/matrix/eigs/getTheta (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 f64) (result f64)
  (local $5 f64)
  (local $6 i32)
  local.get $1
  local.get $2
  i32.mul
  local.tee $6
  local.get $3
  i32.add
  i32.const 3
  i32.shl
  local.get $0
  i32.add
  f64.load
  local.set $5
  local.get $4
  local.get $1
  local.get $3
  i32.mul
  local.get $3
  i32.add
  i32.const 3
  i32.shl
  local.get $0
  i32.add
  f64.load
  local.get $2
  local.get $6
  i32.add
  i32.const 3
  i32.shl
  local.get $0
  i32.add
  f64.load
  f64.sub
  local.tee $4
  f64.abs
  f64.ge
  if (result f64)
   f64.const 0.7853981633974483
  else
   local.get $5
   local.get $5
   f64.add
   local.get $4
   f64.div
   call $~lib/math/NativeMath.atan
   f64.const 0.5
   f64.mul
  end
 )
 (func $src/wasm/matrix/eigs/applyJacobiRotation (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 i32)
  (local $16 f64)
  (local $17 i32)
  (local $18 f64)
  (local $19 f64)
  (local $20 i32)
  local.get $2
  call $~lib/math/NativeMath.cos
  local.set $11
  local.get $2
  call $~lib/math/NativeMath.sin
  local.tee $12
  local.get $12
  f64.mul
  local.set $16
  local.get $1
  local.get $4
  i32.mul
  local.tee $10
  local.get $4
  i32.add
  i32.const 3
  i32.shl
  local.set $9
  local.get $3
  local.get $10
  i32.add
  i32.const 3
  i32.shl
  local.set $17
  local.get $11
  local.get $11
  f64.mul
  local.tee $13
  local.get $1
  local.get $3
  i32.mul
  local.tee $15
  local.get $3
  i32.add
  i32.const 3
  i32.shl
  local.tee $10
  local.get $0
  i32.add
  f64.load
  local.tee $14
  f64.mul
  local.get $11
  local.get $11
  f64.add
  local.get $12
  f64.mul
  local.get $4
  local.get $15
  i32.add
  i32.const 3
  i32.shl
  local.tee $15
  local.get $0
  i32.add
  f64.load
  f64.mul
  local.tee $18
  f64.sub
  local.get $16
  local.get $0
  local.get $9
  i32.add
  f64.load
  local.tee $19
  f64.mul
  f64.add
  local.set $2
  local.get $16
  local.get $14
  f64.mul
  local.get $18
  f64.add
  local.get $13
  local.get $19
  f64.mul
  f64.add
  local.set $13
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $20
    local.get $5
    i32.add
    local.get $11
    local.get $0
    local.get $1
    local.get $3
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $14
    f64.mul
    local.get $12
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $16
    f64.mul
    f64.sub
    f64.store
    local.get $6
    local.get $20
    i32.add
    local.get $12
    local.get $14
    f64.mul
    local.get $11
    local.get $16
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  local.get $0
  local.get $10
  i32.add
  local.get $2
  f64.store
  local.get $0
  local.get $9
  i32.add
  local.get $13
  f64.store
  local.get $0
  local.get $15
  i32.add
  f64.const 0
  f64.store
  local.get $0
  local.get $17
  i32.add
  f64.const 0
  f64.store
  loop $for-loop|1
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $4
    local.get $8
    i32.ne
    local.get $3
    local.get $8
    i32.ne
    i32.and
    if
     local.get $8
     i32.const 3
     i32.shl
     local.tee $7
     local.get $5
     i32.add
     f64.load
     local.set $2
     local.get $6
     local.get $7
     i32.add
     f64.load
     local.set $11
     local.get $0
     local.get $1
     local.get $3
     i32.mul
     local.get $8
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $2
     f64.store
     local.get $0
     local.get $1
     local.get $8
     i32.mul
     local.tee $7
     local.get $3
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $2
     f64.store
     local.get $0
     local.get $1
     local.get $4
     i32.mul
     local.get $8
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $11
     f64.store
     local.get $0
     local.get $4
     local.get $7
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $11
     f64.store
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/eigs/applyJacobiRotationToVectors (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 f64)
  (local $11 i32)
  (local $12 i32)
  (local $13 f64)
  local.get $2
  call $~lib/math/NativeMath.cos
  local.set $9
  local.get $2
  call $~lib/math/NativeMath.sin
  local.set $10
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    local.get $9
    local.get $0
    local.get $1
    local.get $7
    i32.mul
    local.tee $12
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $13
    f64.mul
    local.get $10
    local.get $0
    local.get $4
    local.get $12
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $2
    f64.mul
    f64.sub
    f64.store
    local.get $6
    local.get $11
    i32.add
    local.get $10
    local.get $13
    f64.mul
    local.get $9
    local.get $2
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $0
    local.get $1
    local.get $8
    i32.mul
    local.tee $7
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.get $8
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    f64.load
    f64.store
    local.get $0
    local.get $4
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.get $6
    local.get $11
    i32.add
    f64.load
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/matrix/eigs/sortEigenvalues (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  loop $for-loop|0
   local.get $6
   local.get $2
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $6
    local.set $4
    local.get $0
    local.get $6
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $6
    i32.const 1
    i32.add
    local.set $8
    loop $for-loop|1
     local.get $2
     local.get $8
     i32.gt_s
     if
      local.get $0
      local.get $8
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $7
      local.get $5
      f64.lt
      if
       local.get $7
       local.set $5
       local.get $8
       local.set $4
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|1
     end
    end
    local.get $4
    local.get $6
    i32.ne
    if
     local.get $0
     local.get $6
     i32.const 3
     i32.shl
     i32.add
     local.tee $8
     f64.load
     local.set $5
     local.get $8
     local.get $0
     local.get $4
     i32.const 3
     i32.shl
     i32.add
     local.tee $8
     f64.load
     f64.store
     local.get $8
     local.get $5
     f64.store
     local.get $3
     if
      i32.const 0
      local.set $8
      loop $for-loop|2
       local.get $2
       local.get $8
       i32.gt_s
       if
        local.get $1
        local.get $2
        local.get $8
        i32.mul
        local.tee $10
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $9
        f64.load
        local.set $5
        local.get $9
        local.get $1
        local.get $4
        local.get $10
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $9
        f64.load
        f64.store
        local.get $9
        local.get $5
        f64.store
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $for-loop|2
       end
      end
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/eigs/eigsSymmetric (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (result i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i64)
  (local $14 i32)
  (local $15 i32)
  local.get $4
  i32.const 0
  i32.ne
  local.tee $11
  if
   loop $for-loop|0
    local.get $1
    local.get $7
    i32.gt_s
    if
     i32.const 0
     local.set $6
     loop $for-loop|1
      local.get $1
      local.get $6
      i32.gt_s
      if
       local.get $4
       local.get $1
       local.get $7
       i32.mul
       local.get $6
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 1
       f64.const 0
       local.get $6
       local.get $7
       i32.eq
       select
       f64.store
       local.get $6
       i32.const 1
       i32.add
       local.set $6
       br $for-loop|1
      end
     end
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|0
    end
   end
  end
  local.get $2
  local.get $1
  f64.convert_i32_s
  f64.div
  f64.abs
  local.set $12
  local.get $1
  local.get $1
  i32.mul
  i32.const 30
  i32.mul
  local.set $14
  local.get $5
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  local.set $15
  local.get $0
  local.get $1
  call $src/wasm/matrix/eigs/getMaxOffDiagonal
  local.set $9
  loop $while-continue|2
   local.get $10
   local.get $14
   i32.lt_s
   local.get $9
   f64.abs
   local.get $12
   f64.ge
   i32.and
   if
    local.get $0
    local.get $1
    local.get $0
    local.get $1
    local.get $0
    local.get $1
    call $src/wasm/matrix/eigs/findMaxOffDiagonalIndices
    local.tee $13
    i64.const 32
    i64.shr_s
    i32.wrap_i64
    local.tee $6
    local.get $13
    i64.const 4294967295
    i64.and
    i32.wrap_i64
    local.tee $7
    local.get $2
    call $src/wasm/matrix/eigs/getTheta
    local.tee $9
    local.get $6
    local.get $7
    local.get $5
    local.get $15
    call $src/wasm/matrix/eigs/applyJacobiRotation
    local.get $11
    if
     local.get $4
     local.get $1
     local.get $9
     local.get $6
     local.get $7
     local.get $5
     local.get $15
     call $src/wasm/matrix/eigs/applyJacobiRotationToVectors
    end
    local.get $0
    local.get $1
    call $src/wasm/matrix/eigs/getMaxOffDiagonal
    local.set $9
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $while-continue|2
   end
  end
  loop $for-loop|3
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $3
    local.get $8
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $1
    local.get $8
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|3
   end
  end
  local.get $3
  local.get $4
  local.get $1
  local.get $11
  call $src/wasm/matrix/eigs/sortEigenvalues
  i32.const -1
  local.get $10
  local.get $10
  local.get $14
  i32.ge_s
  select
 )
 (func $src/wasm/matrix/eigs/powerIteration (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (param $5 i32) (param $6 i32) (result i32)
  (local $7 f64)
  (local $8 f64)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  f64.const 1
  local.get $1
  f64.convert_i32_s
  f64.sqrt
  f64.div
  local.set $7
  loop $for-loop|0
   local.get $1
   local.get $11
   i32.gt_s
   if
    local.get $5
    local.get $11
    i32.const 3
    i32.shl
    i32.add
    local.get $7
    f64.store
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $10
   i32.gt_s
   if
    i32.const 0
    local.set $11
    loop $for-loop|2
     local.get $1
     local.get $11
     i32.gt_s
     if
      f64.const 0
      local.set $7
      i32.const 0
      local.set $9
      loop $for-loop|3
       local.get $1
       local.get $9
       i32.gt_s
       if
        local.get $7
        local.get $0
        local.get $1
        local.get $11
        i32.mul
        local.get $9
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $5
        local.get $9
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $7
        local.get $9
        i32.const 1
        i32.add
        local.set $9
        br $for-loop|3
       end
      end
      local.get $6
      local.get $11
      i32.const 3
      i32.shl
      i32.add
      local.get $7
      f64.store
      local.get $11
      i32.const 1
      i32.add
      local.set $11
      br $for-loop|2
     end
    end
    f64.const 0
    local.set $7
    i32.const 0
    local.set $11
    loop $for-loop|4
     local.get $1
     local.get $11
     i32.gt_s
     if
      local.get $7
      local.get $6
      local.get $11
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $7
      local.get $7
      f64.mul
      f64.add
      local.set $7
      local.get $11
      i32.const 1
      i32.add
      local.set $11
      br $for-loop|4
     end
    end
    local.get $7
    f64.sqrt
    local.tee $7
    f64.const 1e-15
    f64.lt
    if
     local.get $4
     f64.const 0
     f64.store
     local.get $10
     return
    end
    i32.const 0
    local.set $11
    loop $for-loop|5
     local.get $1
     local.get $11
     i32.gt_s
     if
      local.get $11
      i32.const 3
      i32.shl
      local.tee $9
      local.get $5
      i32.add
      local.get $6
      local.get $9
      i32.add
      f64.load
      local.get $7
      f64.div
      f64.store
      local.get $11
      i32.const 1
      i32.add
      local.set $11
      br $for-loop|5
     end
    end
    local.get $7
    local.get $8
    f64.sub
    f64.abs
    local.get $3
    f64.lt
    if
     local.get $4
     local.get $7
     f64.store
     local.get $10
     i32.const 1
     i32.add
     return
    end
    local.get $7
    local.set $8
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|1
   end
  end
  local.get $4
  local.get $8
  f64.store
  i32.const -1
 )
 (func $src/wasm/matrix/eigs/spectralRadius (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (result f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  local.get $4
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  local.set $9
  f64.const 1
  local.get $1
  f64.convert_i32_s
  f64.sqrt
  f64.div
  local.set $5
  loop $for-loop|0
   local.get $1
   local.get $10
   i32.gt_s
   if
    local.get $4
    local.get $10
    i32.const 3
    i32.shl
    i32.add
    local.get $5
    f64.store
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $8
   i32.gt_s
   if
    i32.const 0
    local.set $10
    loop $for-loop|2
     local.get $1
     local.get $10
     i32.gt_s
     if
      f64.const 0
      local.set $5
      i32.const 0
      local.set $7
      loop $for-loop|3
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $5
        local.get $0
        local.get $1
        local.get $10
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $4
        local.get $7
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $5
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|3
       end
      end
      local.get $9
      local.get $10
      i32.const 3
      i32.shl
      i32.add
      local.get $5
      f64.store
      local.get $10
      i32.const 1
      i32.add
      local.set $10
      br $for-loop|2
     end
    end
    f64.const 0
    local.set $5
    i32.const 0
    local.set $10
    loop $for-loop|4
     local.get $1
     local.get $10
     i32.gt_s
     if
      local.get $5
      local.get $9
      local.get $10
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $5
      local.get $5
      f64.mul
      f64.add
      local.set $5
      local.get $10
      i32.const 1
      i32.add
      local.set $10
      br $for-loop|4
     end
    end
    local.get $5
    f64.sqrt
    local.tee $5
    f64.const 1e-15
    f64.lt
    if
     f64.const 0
     return
    end
    i32.const 0
    local.set $10
    loop $for-loop|5
     local.get $1
     local.get $10
     i32.gt_s
     if
      local.get $10
      i32.const 3
      i32.shl
      local.tee $7
      local.get $4
      i32.add
      local.get $7
      local.get $9
      i32.add
      f64.load
      local.get $5
      f64.div
      f64.store
      local.get $10
      i32.const 1
      i32.add
      local.set $10
      br $for-loop|5
     end
    end
    local.get $5
    local.get $6
    f64.sub
    f64.abs
    local.get $3
    f64.lt
    if
     local.get $5
     return
    end
    local.get $5
    local.set $6
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
  local.get $6
 )
 (func $src/wasm/matrix/eigs/inverseIteration (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 f64) (param $5 i32) (param $6 i32) (result i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 f64)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  local.get $6
  local.tee $8
  local.get $1
  local.get $1
  i32.mul
  i32.const 3
  i32.shl
  i32.add
  local.set $10
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $6
    loop $for-loop|1
     local.get $1
     local.get $6
     i32.gt_s
     if
      local.get $1
      local.get $7
      i32.mul
      local.get $6
      i32.add
      i32.const 3
      i32.shl
      local.tee $15
      local.get $0
      i32.add
      f64.load
      local.set $4
      local.get $8
      local.get $15
      i32.add
      local.get $4
      local.get $2
      f64.sub
      local.get $4
      local.get $6
      local.get $7
      i32.eq
      select
      f64.store
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|2
   local.get $1
   local.get $9
   i32.gt_s
   if
    local.get $5
    local.get $9
    i32.const 3
    i32.shl
    i32.add
    local.get $9
    f64.convert_i32_s
    f64.const 0.1
    f64.mul
    f64.const 1
    f64.add
    f64.store
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $1
   local.get $12
   i32.gt_s
   if
    local.get $11
    local.get $5
    local.get $12
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $2
    local.get $2
    f64.mul
    f64.add
    local.set $11
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|3
   end
  end
  local.get $11
  f64.sqrt
  local.set $2
  loop $for-loop|4
   local.get $1
   local.get $13
   i32.gt_s
   if
    local.get $5
    local.get $13
    i32.const 3
    i32.shl
    i32.add
    local.tee $0
    local.get $0
    f64.load
    local.get $2
    f64.div
    f64.store
    local.get $13
    i32.const 1
    i32.add
    local.set $13
    br $for-loop|4
   end
  end
  loop $for-loop|5
   local.get $3
   local.get $14
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|6
     local.get $0
     local.get $1
     local.get $1
     i32.mul
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.get $8
      i32.add
      local.tee $6
      local.get $6
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|6
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|7
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $6
      local.get $10
      i32.add
      local.get $5
      local.get $6
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|7
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|8
     local.get $0
     local.get $1
     i32.const 1
     i32.sub
     i32.lt_s
     if
      local.get $8
      local.get $0
      local.get $1
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.set $2
      local.get $0
      local.set $6
      local.get $0
      i32.const 1
      i32.add
      local.set $7
      loop $for-loop|9
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $8
        local.get $1
        local.get $7
        i32.mul
        local.get $0
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.abs
        local.tee $4
        local.get $2
        f64.gt
        if
         local.get $7
         local.set $6
         local.get $4
         local.set $2
        end
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|9
       end
      end
      local.get $0
      local.get $6
      i32.ne
      if
       i32.const 0
       local.set $7
       loop $for-loop|10
        local.get $1
        local.get $7
        i32.gt_s
        if
         local.get $8
         local.get $0
         local.get $1
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $9
         f64.load
         local.set $2
         local.get $9
         local.get $8
         local.get $1
         local.get $6
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $9
         f64.load
         f64.store
         local.get $9
         local.get $2
         f64.store
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|10
        end
       end
       local.get $10
       local.get $0
       i32.const 3
       i32.shl
       i32.add
       local.tee $7
       f64.load
       local.set $2
       local.get $7
       local.get $10
       local.get $6
       i32.const 3
       i32.shl
       i32.add
       local.tee $6
       f64.load
       f64.store
       local.get $6
       local.get $2
       f64.store
      end
      local.get $8
      local.get $0
      local.get $1
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $2
      f64.abs
      f64.const 1e-15
      f64.lt
      i32.eqz
      if
       local.get $0
       i32.const 1
       i32.add
       local.set $7
       loop $for-loop|11
        local.get $1
        local.get $7
        i32.gt_s
        if
         local.get $8
         local.get $1
         local.get $7
         i32.mul
         local.get $0
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $2
         f64.div
         local.set $4
         local.get $0
         local.set $6
         loop $for-loop|12
          local.get $1
          local.get $6
          i32.gt_s
          if
           local.get $8
           local.get $1
           local.get $7
           i32.mul
           local.get $6
           i32.add
           i32.const 3
           i32.shl
           i32.add
           local.tee $9
           local.get $9
           f64.load
           local.get $4
           local.get $8
           local.get $0
           local.get $1
           i32.mul
           local.get $6
           i32.add
           i32.const 3
           i32.shl
           i32.add
           f64.load
           f64.mul
           f64.sub
           f64.store
           local.get $6
           i32.const 1
           i32.add
           local.set $6
           br $for-loop|12
          end
         end
         local.get $10
         local.get $7
         i32.const 3
         i32.shl
         i32.add
         local.tee $6
         local.get $6
         f64.load
         local.get $4
         local.get $10
         local.get $0
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.sub
         f64.store
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|11
        end
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|8
     end
    end
    local.get $1
    i32.const 1
    i32.sub
    local.set $0
    loop $for-loop|13
     local.get $0
     i32.const 0
     i32.ge_s
     if
      local.get $10
      local.get $0
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $2
      local.get $0
      i32.const 1
      i32.add
      local.set $6
      loop $for-loop|14
       local.get $1
       local.get $6
       i32.gt_s
       if
        local.get $2
        local.get $8
        local.get $0
        local.get $1
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $5
        local.get $6
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        local.set $2
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|14
       end
      end
      local.get $8
      local.get $0
      local.get $1
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $4
      f64.abs
      f64.const 1e-15
      f64.gt
      if
       local.get $5
       local.get $0
       i32.const 3
       i32.shl
       i32.add
       local.get $2
       local.get $4
       f64.div
       f64.store
      end
      local.get $0
      i32.const 1
      i32.sub
      local.set $0
      br $for-loop|13
     end
    end
    f64.const 0
    local.set $11
    i32.const 0
    local.set $0
    loop $for-loop|15
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $11
      local.get $5
      local.get $0
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $2
      local.get $2
      f64.mul
      f64.add
      local.set $11
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|15
     end
    end
    local.get $11
    f64.sqrt
    local.tee $2
    f64.const 1e-15
    f64.lt
    if
     i32.const -1
     return
    end
    i32.const 0
    local.set $0
    loop $for-loop|16
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $5
      local.get $0
      i32.const 3
      i32.shl
      i32.add
      local.tee $6
      local.get $6
      f64.load
      local.get $2
      f64.div
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|16
     end
    end
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    br $for-loop|5
   end
  end
  local.get $3
 )
 (func $src/wasm/matrix/eigs/applyJacobiRotationSIMD (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 v128)
  (local $9 v128)
  (local $10 i32)
  (local $11 i32)
  (local $12 v128)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 v128)
  (local $18 i32)
  (local $19 f64)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 f64)
  (local $24 f64)
  (local $25 i32)
  (local $26 i32)
  (local $27 v128)
  local.get $2
  call $~lib/math/NativeMath.cos
  local.set $13
  local.get $2
  call $~lib/math/NativeMath.sin
  local.tee $14
  local.get $14
  f64.mul
  local.set $19
  local.get $1
  local.get $4
  i32.mul
  local.tee $10
  local.get $4
  i32.add
  i32.const 3
  i32.shl
  local.set $20
  local.get $3
  local.get $10
  i32.add
  i32.const 3
  i32.shl
  local.set $21
  local.get $13
  local.get $13
  f64.mul
  local.tee $15
  local.get $1
  local.get $3
  i32.mul
  local.tee $11
  local.get $3
  i32.add
  i32.const 3
  i32.shl
  local.tee $10
  local.get $0
  i32.add
  f64.load
  local.tee $16
  f64.mul
  local.get $13
  local.get $13
  f64.add
  local.get $14
  f64.mul
  local.get $4
  local.get $11
  i32.add
  i32.const 3
  i32.shl
  local.tee $22
  local.get $0
  i32.add
  f64.load
  f64.mul
  local.tee $23
  f64.sub
  local.get $19
  local.get $0
  local.get $20
  i32.add
  f64.load
  local.tee $24
  f64.mul
  f64.add
  local.set $2
  local.get $19
  local.get $16
  f64.mul
  local.get $23
  f64.add
  local.get $15
  local.get $24
  f64.mul
  f64.add
  local.set $15
  local.get $13
  f64x2.splat
  local.set $8
  local.get $14
  f64x2.splat
  local.set $9
  local.get $1
  i32.const 1
  i32.sub
  local.set $25
  loop $for-loop|0
   local.get $7
   local.get $25
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    local.get $8
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $0
    local.get $1
    local.get $3
    i32.mul
    local.tee $18
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 0
    local.get $0
    local.get $18
    local.get $7
    i32.const 1
    i32.add
    local.tee $26
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 1
    local.tee $17
    f64x2.mul
    local.get $9
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.tee $18
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 0
    local.get $0
    local.get $18
    local.get $26
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 1
    local.tee $27
    f64x2.mul
    f64x2.sub
    local.tee $12
    f64x2.extract_lane 0
    f64.store
    local.get $26
    i32.const 3
    i32.shl
    local.tee $18
    local.get $5
    i32.add
    local.get $12
    f64x2.extract_lane 1
    f64.store
    local.get $6
    local.get $11
    i32.add
    local.get $9
    local.get $17
    f64x2.mul
    local.get $8
    local.get $27
    f64x2.mul
    f64x2.add
    local.tee $12
    f64x2.extract_lane 0
    f64.store
    local.get $6
    local.get $18
    i32.add
    local.get $12
    f64x2.extract_lane 1
    f64.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    local.get $13
    local.get $0
    local.get $1
    local.get $3
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $16
    f64.mul
    local.get $14
    local.get $0
    local.get $1
    local.get $4
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $19
    f64.mul
    f64.sub
    f64.store
    local.get $6
    local.get $11
    i32.add
    local.get $14
    local.get $16
    f64.mul
    local.get $13
    local.get $19
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
  local.get $0
  local.get $10
  i32.add
  local.get $2
  f64.store
  local.get $0
  local.get $20
  i32.add
  local.get $15
  f64.store
  local.get $0
  local.get $22
  i32.add
  f64.const 0
  f64.store
  local.get $0
  local.get $21
  i32.add
  f64.const 0
  f64.store
  i32.const 0
  local.set $7
  loop $for-loop|2
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $4
    local.get $7
    i32.ne
    local.get $3
    local.get $7
    i32.ne
    i32.and
    if
     local.get $7
     i32.const 3
     i32.shl
     local.tee $10
     local.get $5
     i32.add
     f64.load
     local.set $2
     local.get $6
     local.get $10
     i32.add
     f64.load
     local.set $13
     local.get $0
     local.get $1
     local.get $3
     i32.mul
     local.get $7
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $2
     f64.store
     local.get $0
     local.get $1
     local.get $7
     i32.mul
     local.tee $10
     local.get $3
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $2
     f64.store
     local.get $0
     local.get $1
     local.get $4
     i32.mul
     local.get $7
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $13
     f64.store
     local.get $0
     local.get $4
     local.get $10
     i32.add
     i32.const 3
     i32.shl
     i32.add
     local.get $13
     f64.store
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/matrix/eigs/applyJacobiRotationToVectorsSIMD (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 v128)
  (local $9 f64)
  (local $10 v128)
  (local $11 i32)
  (local $12 v128)
  (local $13 f64)
  (local $14 i32)
  (local $15 i32)
  (local $16 v128)
  (local $17 i32)
  (local $18 i32)
  (local $19 v128)
  (local $20 f64)
  local.get $2
  call $~lib/math/NativeMath.cos
  local.tee $9
  f64x2.splat
  local.set $8
  local.get $2
  call $~lib/math/NativeMath.sin
  local.tee $13
  f64x2.splat
  local.set $10
  local.get $1
  i32.const 1
  i32.sub
  local.set $17
  loop $for-loop|0
   local.get $7
   local.get $17
   i32.lt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $14
    local.get $5
    i32.add
    local.get $8
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $0
    local.get $1
    local.get $7
    i32.mul
    local.tee $15
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 0
    local.get $0
    local.get $7
    i32.const 1
    i32.add
    local.tee $18
    local.get $1
    i32.mul
    local.tee $11
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 1
    local.tee $16
    f64x2.mul
    local.get $10
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.get $0
    local.get $4
    local.get $15
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 0
    local.get $0
    local.get $4
    local.get $11
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64x2.replace_lane 1
    local.tee $19
    f64x2.mul
    f64x2.sub
    local.tee $12
    f64x2.extract_lane 0
    f64.store
    local.get $18
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    local.get $12
    f64x2.extract_lane 1
    f64.store
    local.get $6
    local.get $14
    i32.add
    local.get $10
    local.get $16
    f64x2.mul
    local.get $8
    local.get $19
    f64x2.mul
    f64x2.add
    local.tee $12
    f64x2.extract_lane 0
    f64.store
    local.get $6
    local.get $11
    i32.add
    local.get $12
    f64x2.extract_lane 1
    f64.store
    local.get $7
    i32.const 2
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $7
    i32.const 3
    i32.shl
    local.tee $11
    local.get $5
    i32.add
    local.get $9
    local.get $0
    local.get $1
    local.get $7
    i32.mul
    local.tee $14
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $20
    f64.mul
    local.get $13
    local.get $0
    local.get $4
    local.get $14
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $2
    f64.mul
    f64.sub
    f64.store
    local.get $6
    local.get $11
    i32.add
    local.get $13
    local.get $20
    f64.mul
    local.get $9
    local.get $2
    f64.mul
    f64.add
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
  i32.const 0
  local.set $7
  loop $for-loop|2
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $0
    local.get $1
    local.get $7
    i32.mul
    local.tee $11
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.get $7
    i32.const 3
    i32.shl
    local.tee $14
    local.get $5
    i32.add
    f64.load
    f64.store
    local.get $0
    local.get $4
    local.get $11
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.get $6
    local.get $14
    i32.add
    f64.load
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/matrix/eigs/eigsSymmetricSIMD (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (result i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i64)
  (local $14 i32)
  (local $15 i32)
  local.get $4
  i32.const 0
  i32.ne
  local.tee $11
  if
   loop $for-loop|0
    local.get $1
    local.get $7
    i32.gt_s
    if
     i32.const 0
     local.set $6
     loop $for-loop|1
      local.get $1
      local.get $6
      i32.gt_s
      if
       local.get $4
       local.get $1
       local.get $7
       i32.mul
       local.get $6
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 1
       f64.const 0
       local.get $6
       local.get $7
       i32.eq
       select
       f64.store
       local.get $6
       i32.const 1
       i32.add
       local.set $6
       br $for-loop|1
      end
     end
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|0
    end
   end
  end
  local.get $2
  local.get $1
  f64.convert_i32_s
  f64.div
  f64.abs
  local.set $12
  local.get $1
  local.get $1
  i32.mul
  i32.const 30
  i32.mul
  local.set $14
  local.get $5
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  local.set $15
  local.get $0
  local.get $1
  call $src/wasm/matrix/eigs/getMaxOffDiagonal
  local.set $9
  loop $while-continue|2
   local.get $10
   local.get $14
   i32.lt_s
   local.get $9
   f64.abs
   local.get $12
   f64.ge
   i32.and
   if
    local.get $0
    local.get $1
    local.get $0
    local.get $1
    local.get $0
    local.get $1
    call $src/wasm/matrix/eigs/findMaxOffDiagonalIndices
    local.tee $13
    i64.const 32
    i64.shr_s
    i32.wrap_i64
    local.tee $6
    local.get $13
    i64.const 4294967295
    i64.and
    i32.wrap_i64
    local.tee $7
    local.get $2
    call $src/wasm/matrix/eigs/getTheta
    local.tee $9
    local.get $6
    local.get $7
    local.get $5
    local.get $15
    call $src/wasm/matrix/eigs/applyJacobiRotationSIMD
    local.get $11
    if
     local.get $4
     local.get $1
     local.get $9
     local.get $6
     local.get $7
     local.get $5
     local.get $15
     call $src/wasm/matrix/eigs/applyJacobiRotationToVectorsSIMD
    end
    local.get $0
    local.get $1
    call $src/wasm/matrix/eigs/getMaxOffDiagonal
    local.set $9
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $while-continue|2
   end
  end
  loop $for-loop|3
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $3
    local.get $8
    i32.const 3
    i32.shl
    i32.add
    local.get $0
    local.get $1
    local.get $8
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|3
   end
  end
  local.get $3
  local.get $4
  local.get $1
  local.get $11
  call $src/wasm/matrix/eigs/sortEigenvalues
  i32.const -1
  local.get $10
  local.get $10
  local.get $14
  i32.ge_s
  select
 )
 (func $src/wasm/matrix/eigs/powerIterationSIMD (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (param $5 i32) (param $6 i32) (result i32)
  (local $7 f64)
  (local $8 f64)
  (local $9 i32)
  (local $10 v128)
  (local $11 i32)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  f64.const 1
  local.get $1
  f64.convert_i32_s
  f64.sqrt
  f64.div
  local.set $7
  loop $for-loop|0
   local.get $1
   local.get $16
   i32.gt_s
   if
    local.get $5
    local.get $16
    i32.const 3
    i32.shl
    i32.add
    local.get $7
    f64.store
    local.get $16
    i32.const 1
    i32.add
    local.set $16
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $14
   i32.gt_s
   if
    i32.const 0
    local.set $15
    loop $for-loop|2
     local.get $1
     local.get $15
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $15
      i32.mul
      i32.const 3
      i32.shl
      i32.add
      local.set $13
      v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
      local.set $10
      i32.const 0
      local.set $16
      local.get $1
      i32.const 1
      i32.sub
      local.set $9
      loop $for-loop|3
       local.get $9
       local.get $16
       i32.gt_s
       if
        local.get $10
        local.get $16
        i32.const 3
        i32.shl
        local.tee $11
        local.get $13
        i32.add
        v128.load
        local.get $5
        local.get $11
        i32.add
        v128.load
        f64x2.mul
        f64x2.add
        local.set $10
        local.get $16
        i32.const 2
        i32.add
        local.set $16
        br $for-loop|3
       end
      end
      local.get $10
      f64x2.extract_lane 0
      local.get $10
      f64x2.extract_lane 1
      f64.add
      local.set $7
      loop $for-loop|4
       local.get $1
       local.get $16
       i32.gt_s
       if
        local.get $7
        local.get $16
        i32.const 3
        i32.shl
        local.tee $9
        local.get $13
        i32.add
        f64.load
        local.get $5
        local.get $9
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $7
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|4
       end
      end
      local.get $6
      local.get $15
      i32.const 3
      i32.shl
      i32.add
      local.get $7
      f64.store
      local.get $15
      i32.const 1
      i32.add
      local.set $15
      br $for-loop|2
     end
    end
    v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000
    local.set $10
    i32.const 0
    local.set $16
    local.get $1
    i32.const 1
    i32.sub
    local.set $11
    loop $for-loop|5
     local.get $11
     local.get $16
     i32.gt_s
     if
      local.get $10
      local.get $6
      local.get $16
      i32.const 3
      i32.shl
      i32.add
      v128.load
      local.tee $10
      local.get $10
      f64x2.mul
      f64x2.add
      local.set $10
      local.get $16
      i32.const 2
      i32.add
      local.set $16
      br $for-loop|5
     end
    end
    local.get $10
    f64x2.extract_lane 0
    local.get $10
    f64x2.extract_lane 1
    f64.add
    local.set $7
    loop $for-loop|6
     local.get $1
     local.get $16
     i32.gt_s
     if
      local.get $7
      local.get $6
      local.get $16
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.tee $7
      local.get $7
      f64.mul
      f64.add
      local.set $7
      local.get $16
      i32.const 1
      i32.add
      local.set $16
      br $for-loop|6
     end
    end
    local.get $7
    f64.sqrt
    local.tee $7
    f64.const 1e-15
    f64.lt
    if
     local.get $4
     f64.const 0
     f64.store
     local.get $14
     return
    end
    f64.const 1
    local.get $7
    f64.div
    local.tee $12
    f64x2.splat
    local.set $10
    i32.const 0
    local.set $16
    loop $for-loop|7
     local.get $11
     local.get $16
     i32.gt_s
     if
      local.get $16
      i32.const 3
      i32.shl
      local.tee $9
      local.get $5
      i32.add
      local.get $6
      local.get $9
      i32.add
      v128.load
      local.get $10
      f64x2.mul
      v128.store
      local.get $16
      i32.const 2
      i32.add
      local.set $16
      br $for-loop|7
     end
    end
    loop $for-loop|8
     local.get $1
     local.get $16
     i32.gt_s
     if
      local.get $16
      i32.const 3
      i32.shl
      local.tee $9
      local.get $5
      i32.add
      local.get $6
      local.get $9
      i32.add
      f64.load
      local.get $12
      f64.mul
      f64.store
      local.get $16
      i32.const 1
      i32.add
      local.set $16
      br $for-loop|8
     end
    end
    local.get $7
    local.get $8
    f64.sub
    f64.abs
    local.get $3
    f64.lt
    if
     local.get $4
     local.get $7
     f64.store
     local.get $14
     i32.const 1
     i32.add
     return
    end
    local.get $7
    local.set $8
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    br $for-loop|1
   end
  end
  local.get $4
  local.get $8
  f64.store
  i32.const -1
 )
 (func $src/wasm/matrix/complexEigs/balanceMatrix (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (result i32)
  (local $4 f64)
  (local $5 f64)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 f64)
  (local $14 f64)
  (local $15 i32)
  local.get $3
  i32.const 0
  i32.ne
  local.tee $12
  if
   loop $for-loop|0
    local.get $1
    local.get $6
    i32.gt_s
    if
     i32.const 0
     local.set $7
     loop $for-loop|1
      local.get $1
      local.get $7
      i32.gt_s
      if
       local.get $3
       local.get $1
       local.get $6
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 1
       f64.const 0
       local.get $6
       local.get $7
       i32.eq
       select
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|1
      end
     end
     local.get $6
     i32.const 1
     i32.add
     local.set $6
     br $for-loop|0
    end
   end
  end
  loop $while-continue|2
   local.get $11
   i32.eqz
   local.get $10
   i32.const 100
   i32.lt_s
   i32.and
   if
    i32.const 1
    local.set $11
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    i32.const 0
    local.set $7
    loop $for-loop|3
     local.get $1
     local.get $7
     i32.gt_s
     if
      f64.const 0
      local.set $4
      f64.const 0
      local.set $8
      i32.const 0
      local.set $6
      loop $for-loop|4
       local.get $1
       local.get $6
       i32.gt_s
       if
        local.get $6
        local.get $7
        i32.ne
        if
         local.get $8
         local.get $0
         local.get $1
         local.get $7
         i32.mul
         local.get $6
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.abs
         f64.add
         local.set $8
         local.get $4
         local.get $0
         local.get $1
         local.get $6
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.abs
         f64.add
         local.set $4
        end
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|4
       end
      end
      local.get $2
      local.get $8
      f64.lt
      local.get $2
      local.get $4
      f64.lt
      i32.and
      if
       f64.const 1
       local.set $9
       local.get $4
       local.set $5
       local.get $8
       f64.const 0.5
       f64.mul
       local.set $13
       local.get $8
       local.get $8
       f64.add
       local.set $14
       loop $while-continue|5
        local.get $5
        local.get $13
        f64.lt
        if
         local.get $5
         f64.const 4
         f64.mul
         local.set $5
         local.get $9
         local.get $9
         f64.add
         local.set $9
         br $while-continue|5
        end
       end
       loop $while-continue|6
        local.get $5
        local.get $14
        f64.gt
        if
         local.get $5
         f64.const 0.25
         f64.mul
         local.set $5
         local.get $9
         f64.const 0.5
         f64.mul
         local.set $9
         br $while-continue|6
        end
       end
       local.get $4
       local.get $8
       f64.add
       f64.const 0.95
       f64.mul
       local.get $5
       local.get $8
       f64.add
       local.get $9
       f64.div
       f64.gt
       if
        i32.const 0
        local.set $11
        f64.const 1
        local.get $9
        f64.div
        local.set $4
        i32.const 0
        local.set $6
        loop $for-loop|7
         local.get $1
         local.get $6
         i32.gt_s
         if
          local.get $6
          local.get $7
          i32.ne
          if
           local.get $0
           local.get $1
           local.get $7
           i32.mul
           local.get $6
           i32.add
           i32.const 3
           i32.shl
           i32.add
           local.tee $15
           local.get $15
           f64.load
           local.get $4
           f64.mul
           f64.store
           local.get $0
           local.get $1
           local.get $6
           i32.mul
           local.get $7
           i32.add
           i32.const 3
           i32.shl
           i32.add
           local.tee $15
           local.get $15
           f64.load
           local.get $9
           f64.mul
           f64.store
          end
          local.get $6
          i32.const 1
          i32.add
          local.set $6
          br $for-loop|7
         end
        end
        local.get $12
        if
         i32.const 0
         local.set $6
         loop $for-loop|8
          local.get $1
          local.get $6
          i32.gt_s
          if
           local.get $3
           local.get $1
           local.get $7
           i32.mul
           local.get $6
           i32.add
           i32.const 3
           i32.shl
           i32.add
           local.tee $15
           local.get $15
           f64.load
           local.get $4
           f64.mul
           f64.store
           local.get $6
           i32.const 1
           i32.add
           local.set $6
           br $for-loop|8
          end
         end
        end
       end
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    br $while-continue|2
   end
  end
  local.get $10
 )
 (func $src/wasm/matrix/complexEigs/reduceToHessenberg (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  local.get $3
  i32.const 0
  i32.ne
  local.tee $9
  if
   loop $for-loop|0
    local.get $1
    local.get $7
    i32.gt_s
    if
     i32.const 0
     local.set $4
     loop $for-loop|1
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $3
       local.get $1
       local.get $7
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 1
       f64.const 0
       local.get $4
       local.get $7
       i32.eq
       select
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|1
      end
     end
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|0
    end
   end
  end
  loop $for-loop|2
   local.get $8
   local.get $1
   i32.const 2
   i32.sub
   i32.lt_s
   if
    local.get $0
    local.get $8
    i32.const 1
    i32.add
    local.tee $4
    local.get $1
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $8
    i32.const 2
    i32.add
    local.set $7
    loop $for-loop|3
     local.get $1
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $7
      i32.mul
      local.get $8
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $4
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    local.get $2
    local.get $5
    f64.gt
    i32.eqz
    if
     local.get $4
     local.get $8
     i32.const 1
     i32.add
     i32.ne
     if
      i32.const 0
      local.set $7
      loop $for-loop|4
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $0
        local.get $1
        local.get $4
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        local.set $5
        local.get $10
        local.get $0
        local.get $8
        i32.const 1
        i32.add
        local.get $1
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        f64.store
        local.get $10
        local.get $5
        f64.store
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|4
       end
      end
      i32.const 0
      local.set $7
      loop $for-loop|5
       local.get $1
       local.get $7
       i32.gt_s
       if
        local.get $0
        local.get $1
        local.get $7
        i32.mul
        local.tee $10
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $11
        f64.load
        local.set $5
        local.get $11
        local.get $0
        local.get $10
        local.get $8
        i32.const 1
        i32.add
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        f64.store
        local.get $10
        local.get $5
        f64.store
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|5
       end
      end
      local.get $9
      if
       i32.const 0
       local.set $7
       loop $for-loop|6
        local.get $1
        local.get $7
        i32.gt_s
        if
         local.get $3
         local.get $1
         local.get $4
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $10
         f64.load
         local.set $5
         local.get $10
         local.get $3
         local.get $8
         i32.const 1
         i32.add
         local.get $1
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         i32.add
         local.tee $10
         f64.load
         f64.store
         local.get $10
         local.get $5
         f64.store
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|6
        end
       end
      end
     end
     local.get $0
     local.get $8
     i32.const 1
     i32.add
     local.get $1
     i32.mul
     local.get $8
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.set $5
     local.get $8
     i32.const 2
     i32.add
     local.set $7
     loop $for-loop|7
      local.get $1
      local.get $7
      i32.gt_s
      if
       local.get $0
       local.get $1
       local.get $7
       i32.mul
       local.get $8
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $5
       f64.div
       local.tee $6
       f64.abs
       local.get $2
       f64.lt
       i32.eqz
       if
        i32.const 0
        local.set $4
        loop $for-loop|8
         local.get $1
         local.get $4
         i32.gt_s
         if
          local.get $0
          local.get $1
          local.get $7
          i32.mul
          local.get $4
          i32.add
          i32.const 3
          i32.shl
          i32.add
          local.tee $10
          local.get $10
          f64.load
          local.get $6
          local.get $0
          local.get $8
          i32.const 1
          i32.add
          local.get $1
          i32.mul
          local.get $4
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.sub
          f64.store
          local.get $4
          i32.const 1
          i32.add
          local.set $4
          br $for-loop|8
         end
        end
        i32.const 0
        local.set $4
        loop $for-loop|9
         local.get $1
         local.get $4
         i32.gt_s
         if
          local.get $0
          local.get $1
          local.get $4
          i32.mul
          local.tee $10
          local.get $8
          i32.const 1
          i32.add
          i32.add
          i32.const 3
          i32.shl
          i32.add
          local.tee $11
          local.get $11
          f64.load
          local.get $6
          local.get $0
          local.get $7
          local.get $10
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.add
          f64.store
          local.get $4
          i32.const 1
          i32.add
          local.set $4
          br $for-loop|9
         end
        end
        local.get $9
        if
         i32.const 0
         local.set $4
         loop $for-loop|10
          local.get $1
          local.get $4
          i32.gt_s
          if
           local.get $3
           local.get $1
           local.get $7
           i32.mul
           local.get $4
           i32.add
           i32.const 3
           i32.shl
           i32.add
           local.tee $10
           local.get $10
           f64.load
           local.get $6
           local.get $3
           local.get $8
           i32.const 1
           i32.add
           local.get $1
           i32.mul
           local.get $4
           i32.add
           i32.const 3
           i32.shl
           i32.add
           f64.load
           f64.mul
           f64.sub
           f64.store
           local.get $4
           i32.const 1
           i32.add
           local.set $4
           br $for-loop|10
          end
         end
        end
       end
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|7
      end
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|2
   end
  end
 )
 (func $src/wasm/matrix/complexEigs/eigenvalues2x2 (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 i32)
  (local $5 f64)
  local.get $0
  local.get $3
  f64.add
  local.tee $5
  local.get $5
  f64.mul
  local.get $0
  local.get $3
  f64.mul
  local.get $1
  local.get $2
  f64.mul
  f64.sub
  f64.const 4
  f64.mul
  f64.sub
  local.tee $0
  f64.const 0
  f64.ge
  if
   local.get $4
   local.get $5
   local.get $0
   f64.sqrt
   local.tee $0
   f64.add
   f64.const 0.5
   f64.mul
   f64.store
   local.get $4
   f64.const 0
   f64.store offset=8
   local.get $4
   local.get $5
   local.get $0
   f64.sub
   f64.const 0.5
   f64.mul
   f64.store offset=16
   local.get $4
   f64.const 0
   f64.store offset=24
  else
   local.get $4
   local.get $5
   f64.const 0.5
   f64.mul
   local.tee $1
   f64.store
   local.get $4
   local.get $0
   f64.neg
   f64.sqrt
   local.tee $0
   f64.const 0.5
   f64.mul
   f64.store offset=8
   local.get $4
   local.get $1
   f64.store offset=16
   local.get $4
   local.get $0
   f64.const -0.5
   f64.mul
   f64.store offset=24
  end
 )
 (func $src/wasm/matrix/complexEigs/qrIterationStep (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 i32)
  local.get $1
  i32.const 2
  i32.ge_s
  if (result f64)
   local.get $1
   i32.const 2
   i32.sub
   local.tee $4
   local.get $2
   i32.mul
   local.set $9
   local.get $1
   i32.const 1
   i32.sub
   local.tee $10
   local.get $2
   i32.mul
   local.set $11
   local.get $0
   local.get $4
   local.get $9
   i32.add
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.tee $6
   local.get $0
   local.get $10
   local.get $11
   i32.add
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.tee $12
   f64.add
   local.tee $13
   local.get $13
   f64.mul
   local.get $6
   local.get $12
   f64.mul
   local.get $0
   local.get $9
   local.get $10
   i32.add
   i32.const 3
   i32.shl
   i32.add
   f64.load
   local.get $0
   local.get $4
   local.get $11
   i32.add
   i32.const 3
   i32.shl
   i32.add
   f64.load
   f64.mul
   f64.sub
   f64.const 4
   f64.mul
   f64.sub
   local.tee $6
   f64.const 0
   f64.ge
   if (result f64)
    local.get $13
    local.get $6
    f64.sqrt
    local.tee $6
    f64.add
    f64.const 0.5
    f64.mul
    local.tee $14
    local.get $13
    local.get $6
    f64.sub
    f64.const 0.5
    f64.mul
    local.tee $6
    local.get $14
    local.get $12
    f64.sub
    f64.abs
    local.get $6
    local.get $12
    f64.sub
    f64.abs
    f64.lt
    select
   else
    local.get $12
   end
  else
   f64.const 0
  end
  local.set $6
  local.get $3
  i32.const 0
  i32.ne
  local.set $9
  loop $for-loop|0
   local.get $1
   local.get $7
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $7
    i32.mul
    local.get $7
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.tee $4
    local.get $4
    f64.load
    local.get $6
    f64.sub
    f64.store
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $5
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $0
    local.get $2
    local.get $5
    i32.mul
    local.get $5
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $12
    local.get $12
    f64.mul
    local.get $0
    local.get $5
    i32.const 1
    i32.add
    local.get $2
    i32.mul
    local.get $5
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $13
    local.get $13
    f64.mul
    f64.add
    f64.sqrt
    local.tee $14
    f64.const 1e-15
    f64.lt
    i32.eqz
    if
     local.get $12
     local.get $14
     f64.div
     local.set $12
     local.get $13
     local.get $14
     f64.div
     local.set $13
     local.get $5
     local.set $4
     loop $for-loop|2
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $7
       f64.load
       local.set $14
       local.get $7
       local.get $12
       local.get $14
       f64.mul
       local.get $13
       local.get $0
       local.get $5
       i32.const 1
       i32.add
       local.get $2
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $7
       f64.load
       local.tee $15
       f64.mul
       f64.add
       f64.store
       local.get $7
       local.get $13
       f64.neg
       local.get $14
       f64.mul
       local.get $12
       local.get $15
       f64.mul
       f64.add
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|2
      end
     end
     i32.const 0
     local.set $4
     local.get $5
     i32.const 2
     i32.add
     local.set $10
     local.get $1
     i32.const 1
     i32.sub
     local.set $11
     loop $for-loop|3
      local.get $4
      local.get $10
      local.get $11
      local.get $10
      local.get $11
      i32.lt_s
      select
      i32.le_s
      if
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.tee $16
       local.get $5
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $7
       f64.load
       local.set $14
       local.get $7
       local.get $12
       local.get $14
       f64.mul
       local.get $13
       local.get $0
       local.get $16
       local.get $5
       i32.const 1
       i32.add
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $7
       f64.load
       local.tee $15
       f64.mul
       f64.add
       f64.store
       local.get $7
       local.get $13
       f64.neg
       local.get $14
       f64.mul
       local.get $12
       local.get $15
       f64.mul
       f64.add
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|3
      end
     end
     local.get $9
     if
      i32.const 0
      local.set $4
      loop $for-loop|4
       local.get $2
       local.get $4
       i32.gt_s
       if
        local.get $3
        local.get $2
        local.get $4
        i32.mul
        local.tee $7
        local.get $5
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $10
        f64.load
        local.set $14
        local.get $10
        local.get $12
        local.get $14
        f64.mul
        local.get $13
        local.get $3
        local.get $7
        local.get $5
        i32.const 1
        i32.add
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $7
        f64.load
        local.tee $15
        f64.mul
        f64.add
        f64.store
        local.get $7
        local.get $13
        f64.neg
        local.get $14
        f64.mul
        local.get $12
        local.get $15
        f64.mul
        f64.add
        f64.store
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|4
       end
      end
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
  loop $for-loop|5
   local.get $1
   local.get $8
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $8
    i32.mul
    local.get $8
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.tee $3
    local.get $3
    f64.load
    local.get $6
    f64.add
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|5
   end
  end
 )
 (func $src/wasm/matrix/complexEigs/getMagnitude (param $0 i32) (param $1 i32) (param $2 i32) (result f64)
  (local $3 f64)
  local.get $2
  i32.const 3
  i32.shl
  local.tee $2
  local.get $0
  i32.add
  f64.load
  local.tee $3
  local.get $3
  f64.mul
  local.get $1
  local.get $2
  i32.add
  f64.load
  local.tee $3
  local.get $3
  f64.mul
  f64.add
  f64.sqrt
 )
 (func $src/wasm/matrix/complexEigs/sortComplexEigenvalues (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  loop $for-loop|0
   local.get $4
   local.get $2
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $4
    local.set $3
    local.get $0
    local.get $1
    local.get $4
    call $src/wasm/matrix/complexEigs/getMagnitude
    local.set $5
    local.get $4
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|1
     local.get $2
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $1
      local.get $7
      call $src/wasm/matrix/complexEigs/getMagnitude
      local.tee $6
      local.get $5
      f64.lt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $3
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $3
    local.get $4
    i32.ne
    if
     local.get $4
     i32.const 3
     i32.shl
     local.tee $7
     local.get $0
     i32.add
     local.tee $8
     f64.load
     local.set $5
     local.get $8
     local.get $3
     i32.const 3
     i32.shl
     local.tee $3
     local.get $0
     i32.add
     local.tee $8
     f64.load
     f64.store
     local.get $8
     local.get $5
     f64.store
     local.get $1
     local.get $7
     i32.add
     local.tee $7
     f64.load
     local.set $5
     local.get $7
     local.get $1
     local.get $3
     i32.add
     local.tee $3
     f64.load
     f64.store
     local.get $3
     local.get $5
     f64.store
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/complexEigs/qrAlgorithm (param $0 i32) (param $1 i32) (param $2 f64) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (result i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 f64)
  (local $14 i32)
  (local $15 i32)
  (local $16 f64)
  (local $17 f64)
  local.get $6
  if
   loop $for-loop|0
    local.get $9
    local.get $1
    local.get $1
    i32.mul
    i32.lt_s
    if
     local.get $9
     i32.const 3
     i32.shl
     local.tee $14
     local.get $6
     i32.add
     local.get $0
     local.get $14
     i32.add
     f64.load
     f64.store
     local.get $9
     i32.const 1
     i32.add
     local.set $9
     br $for-loop|0
    end
   end
  end
  local.get $6
  local.get $0
  local.get $6
  select
  local.set $9
  local.get $7
  i32.const 0
  i32.ne
  local.tee $14
  if
   loop $for-loop|1
    local.get $1
    local.get $11
    i32.gt_s
    if
     i32.const 0
     local.set $0
     loop $for-loop|2
      local.get $0
      local.get $1
      i32.lt_s
      if
       local.get $7
       local.get $1
       local.get $11
       i32.mul
       local.get $0
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.const 1
       f64.const 0
       local.get $0
       local.get $11
       i32.eq
       select
       f64.store
       local.get $0
       i32.const 1
       i32.add
       local.set $0
       br $for-loop|2
      end
     end
     local.get $11
     i32.const 1
     i32.add
     local.set $11
     br $for-loop|1
    end
   end
  end
  local.get $9
  local.get $1
  local.get $2
  i32.const 0
  call $src/wasm/matrix/complexEigs/balanceMatrix
  drop
  local.get $9
  local.get $1
  local.get $2
  local.get $7
  i32.const 0
  local.get $14
  select
  call $src/wasm/matrix/complexEigs/reduceToHessenberg
  local.get $1
  local.set $0
  loop $while-continue|3
   local.get $3
   local.get $12
   i32.gt_s
   local.get $0
   i32.const 0
   i32.gt_s
   i32.and
   if
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    local.get $0
    i32.const 1
    i32.eq
    if
     local.get $10
     i32.const 3
     i32.shl
     local.tee $6
     local.get $4
     i32.add
     local.get $9
     local.get $1
     local.get $0
     i32.const 1
     i32.sub
     local.tee $0
     i32.mul
     local.get $0
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.store
     local.get $5
     local.get $6
     i32.add
     f64.const 0
     f64.store
     local.get $10
     i32.const 1
     i32.add
     local.set $10
     i32.const 0
     local.set $12
    else
     local.get $9
     local.get $0
     i32.const 2
     i32.sub
     local.tee $11
     local.get $1
     i32.mul
     local.get $11
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.abs
     local.set $13
     local.get $9
     local.get $0
     i32.const 1
     i32.sub
     local.tee $6
     local.get $1
     i32.mul
     local.tee $15
     local.get $11
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.abs
     local.get $2
     local.get $9
     local.get $6
     local.get $15
     i32.add
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.abs
     local.get $13
     f64.add
     f64.const 1e-15
     f64.add
     f64.mul
     f64.lt
     if
      local.get $10
      i32.const 3
      i32.shl
      local.tee $11
      local.get $4
      i32.add
      local.get $9
      local.get $1
      local.get $6
      local.tee $0
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.store
      local.get $5
      local.get $11
      i32.add
      f64.const 0
      f64.store
      local.get $10
      i32.const 1
      i32.add
      local.set $10
      i32.const 0
      local.set $12
     else
      local.get $0
      i32.const 2
      i32.ge_s
      if
       local.get $0
       i32.const 2
       i32.eq
       local.get $0
       i32.const 2
       i32.gt_s
       if (result f64)
        local.get $0
        i32.const 3
        i32.sub
        local.get $0
        i32.const 2
        i32.sub
        local.get $1
        i32.mul
        i32.add
        i32.const 3
        i32.shl
        local.get $9
        i32.add
        f64.load
        f64.abs
       else
        f64.const 0
       end
       local.get $2
       local.get $13
       local.get $0
       i32.const 2
       i32.gt_s
       if (result f64)
        local.get $9
        local.get $0
        i32.const 3
        i32.sub
        local.tee $6
        local.get $1
        i32.mul
        local.get $6
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.abs
       else
        f64.const 0
       end
       f64.add
       f64.const 1e-15
       f64.add
       f64.mul
       f64.lt
       i32.or
       if
        local.get $0
        i32.const 2
        i32.sub
        local.tee $6
        local.get $1
        i32.mul
        local.set $11
        local.get $0
        i32.const 1
        i32.sub
        local.tee $12
        local.get $1
        i32.mul
        local.set $15
        local.get $9
        local.get $6
        local.get $11
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.tee $16
        local.get $9
        local.get $12
        local.get $15
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.tee $17
        f64.add
        local.tee $13
        local.get $13
        f64.mul
        local.get $16
        local.get $17
        f64.mul
        local.get $9
        local.get $11
        local.get $12
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $9
        local.get $6
        local.get $15
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        f64.const 4
        f64.mul
        f64.sub
        local.tee $16
        f64.const 0
        f64.ge
        if
         local.get $10
         i32.const 3
         i32.shl
         local.tee $6
         local.get $4
         i32.add
         local.get $13
         local.get $16
         f64.sqrt
         local.tee $16
         f64.add
         f64.const 0.5
         f64.mul
         f64.store
         local.get $5
         local.get $6
         i32.add
         f64.const 0
         f64.store
         local.get $4
         local.get $10
         i32.const 1
         i32.add
         local.tee $10
         i32.const 3
         i32.shl
         i32.add
         local.get $13
         local.get $16
         f64.sub
         f64.const 0.5
         f64.mul
         f64.store
         local.get $5
         local.get $10
         i32.const 3
         i32.shl
         i32.add
         f64.const 0
         f64.store
        else
         local.get $10
         i32.const 3
         i32.shl
         local.tee $6
         local.get $4
         i32.add
         local.get $13
         f64.const 0.5
         f64.mul
         local.tee $13
         f64.store
         local.get $5
         local.get $6
         i32.add
         local.get $16
         f64.neg
         f64.sqrt
         local.tee $16
         f64.const 0.5
         f64.mul
         f64.store
         local.get $4
         local.get $10
         i32.const 1
         i32.add
         local.tee $10
         i32.const 3
         i32.shl
         i32.add
         local.get $13
         f64.store
         local.get $5
         local.get $10
         i32.const 3
         i32.shl
         i32.add
         local.get $16
         f64.const -0.5
         f64.mul
         f64.store
        end
        local.get $10
        i32.const 1
        i32.add
        local.set $10
        local.get $0
        i32.const 2
        i32.sub
        local.set $0
        i32.const 0
        local.set $12
       else
        local.get $9
        local.get $0
        local.get $1
        local.get $7
        i32.const 0
        local.get $14
        select
        local.get $8
        call $src/wasm/matrix/complexEigs/qrIterationStep
       end
      end
     end
    end
    br $while-continue|3
   end
  end
  local.get $4
  local.get $5
  local.get $10
  call $src/wasm/matrix/complexEigs/sortComplexEigenvalues
  i32.const -1
  local.get $10
  local.get $3
  local.get $12
  i32.le_s
  select
 )
 (func $src/wasm/matrix/complexEigs/hessenbergQRStep (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  local.get $1
  i32.const 2
  i32.lt_s
  if
   return
  end
  local.get $0
  local.get $1
  i32.const 2
  i32.sub
  local.tee $8
  local.get $2
  i32.mul
  local.tee $9
  local.get $8
  i32.add
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.tee $7
  local.get $0
  local.get $1
  i32.const 1
  i32.sub
  local.tee $10
  local.get $2
  i32.mul
  local.tee $11
  local.get $10
  i32.add
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.tee $5
  f64.add
  local.tee $12
  local.get $12
  f64.mul
  local.get $7
  local.get $5
  f64.mul
  local.get $0
  local.get $9
  local.get $10
  i32.add
  i32.const 3
  i32.shl
  i32.add
  f64.load
  local.get $0
  local.get $8
  local.get $11
  i32.add
  i32.const 3
  i32.shl
  i32.add
  f64.load
  f64.mul
  f64.sub
  f64.const 4
  f64.mul
  f64.sub
  local.tee $7
  f64.const 0
  f64.ge
  if
   local.get $12
   local.get $7
   f64.sqrt
   local.tee $7
   f64.add
   f64.const 0.5
   f64.mul
   local.tee $13
   local.get $12
   local.get $7
   f64.sub
   f64.const 0.5
   f64.mul
   local.tee $7
   local.get $13
   local.get $5
   f64.sub
   f64.abs
   local.get $7
   local.get $5
   f64.sub
   f64.abs
   f64.lt
   select
   local.set $5
  end
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.tee $8
    local.get $8
    f64.load
    local.get $5
    f64.sub
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    local.get $0
    local.get $2
    local.get $3
    i32.mul
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $7
    local.get $7
    f64.mul
    local.get $0
    local.get $3
    i32.const 1
    i32.add
    local.get $2
    i32.mul
    local.get $3
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $12
    local.get $12
    f64.mul
    f64.add
    f64.sqrt
    local.tee $13
    f64.const 1e-15
    f64.lt
    i32.eqz
    if
     local.get $7
     local.get $13
     f64.div
     local.set $7
     local.get $12
     local.get $13
     f64.div
     local.set $12
     local.get $3
     local.set $4
     loop $for-loop|2
      local.get $1
      local.get $4
      i32.gt_s
      if
       local.get $0
       local.get $2
       local.get $3
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $8
       f64.load
       local.set $13
       local.get $8
       local.get $7
       local.get $13
       f64.mul
       local.get $12
       local.get $0
       local.get $3
       i32.const 1
       i32.add
       local.get $2
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $8
       f64.load
       local.tee $14
       f64.mul
       f64.add
       f64.store
       local.get $8
       local.get $12
       f64.neg
       local.get $13
       f64.mul
       local.get $7
       local.get $14
       f64.mul
       f64.add
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|2
      end
     end
     i32.const 0
     local.set $4
     local.get $3
     i32.const 2
     i32.add
     local.set $8
     local.get $1
     i32.const 1
     i32.sub
     local.set $9
     loop $for-loop|3
      local.get $4
      local.get $8
      local.get $9
      local.get $8
      local.get $9
      i32.lt_s
      select
      i32.le_s
      if
       local.get $0
       local.get $2
       local.get $4
       i32.mul
       local.tee $10
       local.get $3
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $11
       f64.load
       local.set $13
       local.get $11
       local.get $7
       local.get $13
       f64.mul
       local.get $12
       local.get $0
       local.get $10
       local.get $3
       i32.const 1
       i32.add
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.tee $10
       f64.load
       local.tee $14
       f64.mul
       f64.add
       f64.store
       local.get $10
       local.get $12
       f64.neg
       local.get $13
       f64.mul
       local.get $7
       local.get $14
       f64.mul
       f64.add
       f64.store
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|3
      end
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  loop $for-loop|4
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $6
    i32.mul
    local.get $6
    i32.add
    i32.const 3
    i32.shl
    i32.add
    local.tee $3
    local.get $3
    f64.load
    local.get $5
    f64.add
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|4
   end
  end
 )
 (func $src/wasm/matrix/expm/findParams (param $0 f64) (result i64)
  (local $1 f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  loop $for-loop|0
   local.get $5
   i32.const 30
   i32.lt_s
   if
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $5
     local.get $7
     i32.ge_s
     if
      local.get $5
      local.get $7
      i32.sub
      local.set $4
      f64.const 1
      local.set $2
      i32.const 2
      local.set $6
      loop $for-loop|00
       local.get $6
       local.get $7
       i32.le_s
       if
        local.get $2
        local.get $6
        f64.convert_i32_s
        f64.mul
        local.set $2
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|00
       end
      end
      local.get $2
      local.set $1
      local.get $7
      i32.const 1
      i32.add
      local.set $6
      loop $for-loop|11
       local.get $6
       local.get $7
       i32.const 1
       i32.shl
       i32.le_s
       if
        local.get $1
        local.get $6
        f64.convert_i32_s
        f64.mul
        local.set $1
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|11
       end
      end
      local.get $0
      f64.const 2
      local.get $4
      f64.convert_i32_s
      call $~lib/math/NativeMath.pow
      f64.div
      local.get $7
      f64.convert_i32_s
      f64.const 2
      f64.mul
      local.tee $3
      call $~lib/math/NativeMath.pow
      f64.const 8
      f64.mul
      local.get $2
      f64.mul
      local.get $2
      f64.mul
      local.get $1
      local.get $1
      local.get $3
      f64.const 1
      f64.add
      f64.mul
      f64.mul
      f64.div
      f64.const 1e-15
      f64.lt
      if
       local.get $4
       i64.extend_i32_s
       local.get $7
       i64.extend_i32_s
       i64.const 32
       i64.shl
       i64.or
       return
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|1
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  i64.const 55834574848
 )
 (func $src/wasm/matrix/expm/matrixMultiply (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $3
     local.get $4
     i32.gt_s
     if
      f64.const 0
      local.set $7
      i32.const 0
      local.set $5
      loop $for-loop|2
       local.get $3
       local.get $5
       i32.gt_s
       if
        local.get $7
        local.get $0
        local.get $3
        local.get $6
        i32.mul
        local.get $5
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $1
        local.get $3
        local.get $5
        i32.mul
        local.get $4
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.add
        local.set $7
        local.get $5
        i32.const 1
        i32.add
        local.set $5
        br $for-loop|2
       end
      end
      local.get $2
      local.get $3
      local.get $6
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      local.get $7
      f64.store
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/matrix/expm/matrixInverse (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 f64)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  loop $for-loop|0
   local.get $2
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $2
     local.get $3
     i32.gt_s
     if
      local.get $1
      local.get $2
      local.get $7
      i32.mul
      local.get $3
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $3
      local.get $7
      i32.eq
      select
      f64.store
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  loop $for-loop|2
   local.get $2
   local.get $4
   i32.gt_s
   if
    local.get $0
    local.get $2
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.abs
    local.set $5
    local.get $4
    local.tee $3
    i32.const 1
    i32.add
    local.set $7
    loop $for-loop|3
     local.get $2
     local.get $7
     i32.gt_s
     if
      local.get $0
      local.get $2
      local.get $7
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      local.tee $6
      local.get $5
      f64.gt
      if
       local.get $6
       local.set $5
       local.get $7
       local.set $3
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|3
     end
    end
    local.get $5
    f64.const 1e-15
    f64.lt
    if
     i32.const -1
     return
    end
    local.get $3
    local.get $4
    i32.ne
    if
     i32.const 0
     local.set $7
     loop $for-loop|4
      local.get $2
      local.get $7
      i32.gt_s
      if
       local.get $2
       local.get $4
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       local.tee $9
       local.get $0
       i32.add
       local.tee $8
       f64.load
       local.set $5
       local.get $8
       local.get $2
       local.get $3
       i32.mul
       local.get $7
       i32.add
       i32.const 3
       i32.shl
       local.tee $8
       local.get $0
       i32.add
       local.tee $10
       f64.load
       f64.store
       local.get $10
       local.get $5
       f64.store
       local.get $1
       local.get $9
       i32.add
       local.tee $9
       f64.load
       local.set $5
       local.get $9
       local.get $1
       local.get $8
       i32.add
       local.tee $8
       f64.load
       f64.store
       local.get $8
       local.get $5
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|4
      end
     end
    end
    local.get $0
    local.get $2
    local.get $4
    i32.mul
    local.get $4
    i32.add
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $5
    i32.const 0
    local.set $3
    loop $for-loop|5
     local.get $2
     local.get $3
     i32.gt_s
     if
      local.get $2
      local.get $4
      i32.mul
      local.get $3
      i32.add
      i32.const 3
      i32.shl
      local.tee $7
      local.get $0
      i32.add
      local.tee $8
      local.get $8
      f64.load
      local.get $5
      f64.div
      f64.store
      local.get $1
      local.get $7
      i32.add
      local.tee $7
      local.get $7
      f64.load
      local.get $5
      f64.div
      f64.store
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|5
     end
    end
    i32.const 0
    local.set $3
    loop $for-loop|6
     local.get $2
     local.get $3
     i32.gt_s
     if
      local.get $3
      local.get $4
      i32.ne
      if
       local.get $0
       local.get $2
       local.get $3
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.set $5
       i32.const 0
       local.set $7
       loop $for-loop|7
        local.get $2
        local.get $7
        i32.gt_s
        if
         local.get $2
         local.get $3
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         local.tee $8
         local.get $0
         i32.add
         local.tee $9
         local.get $9
         f64.load
         local.get $5
         local.get $2
         local.get $4
         i32.mul
         local.get $7
         i32.add
         i32.const 3
         i32.shl
         local.tee $9
         local.get $0
         i32.add
         f64.load
         f64.mul
         f64.sub
         f64.store
         local.get $1
         local.get $8
         i32.add
         local.tee $8
         local.get $8
         f64.load
         local.get $5
         local.get $1
         local.get $9
         i32.add
         f64.load
         f64.mul
         f64.sub
         f64.store
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|7
        end
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|6
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|2
   end
  end
  i32.const 0
 )
 (func $src/wasm/matrix/expm/expm (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 f64)
  (local $17 i32)
  (local $18 i64)
  (local $19 i32)
  local.get $3
  local.get $1
  local.get $1
  i32.mul
  local.tee $8
  i32.const 3
  i32.shl
  i32.add
  local.set $13
  local.get $3
  local.get $8
  i32.const 4
  i32.shl
  i32.add
  local.set $14
  local.get $3
  local.get $8
  i32.const 24
  i32.mul
  i32.add
  local.set $12
  local.get $3
  local.get $8
  i32.const 5
  i32.shl
  i32.add
  local.set $10
  loop $for-loop|0
   local.get $1
   local.get $9
   i32.gt_s
   if
    f64.const 0
    local.set $6
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $1
     local.get $5
     i32.gt_s
     if
      local.get $6
      local.get $0
      local.get $1
      local.get $9
      i32.mul
      local.get $5
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.abs
      f64.add
      local.set $6
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $6
    local.get $4
    local.get $4
    local.get $6
    f64.lt
    select
    local.set $4
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|0
   end
  end
  local.get $4
  call $src/wasm/matrix/expm/findParams
  local.tee $18
  i64.const 32
  i64.shr_s
  i32.wrap_i64
  local.set $9
  f64.const 2
  i32.const 0
  local.get $18
  i64.const 4294967295
  i64.and
  i32.wrap_i64
  local.tee $19
  i32.sub
  f64.convert_i32_s
  call $~lib/math/NativeMath.pow
  local.set $4
  loop $for-loop|00
   local.get $8
   local.get $11
   i32.gt_s
   if
    local.get $11
    i32.const 3
    i32.shl
    local.tee $5
    local.get $3
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $4
    f64.mul
    f64.store
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|00
   end
  end
  loop $for-loop|11
   local.get $1
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|2
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $1
      local.get $7
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      local.tee $5
      local.get $13
      i32.add
      f64.const 1
      f64.const 0
      local.get $0
      local.get $7
      i32.eq
      select
      local.tee $4
      f64.store
      local.get $5
      local.get $14
      i32.add
      local.get $4
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|2
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|11
   end
  end
  loop $for-loop|3
   local.get $8
   local.get $15
   i32.gt_s
   if
    local.get $15
    i32.const 3
    i32.shl
    local.tee $0
    local.get $12
    i32.add
    local.get $0
    local.get $3
    i32.add
    f64.load
    f64.store
    local.get $15
    i32.const 1
    i32.add
    local.set $15
    br $for-loop|3
   end
  end
  f64.const 1
  local.set $6
  f64.const -1
  local.set $4
  i32.const 1
  local.set $0
  loop $for-loop|4
   local.get $0
   local.get $9
   i32.le_s
   if
    local.get $0
    i32.const 1
    i32.gt_s
    if
     local.get $12
     local.get $3
     local.get $10
     local.get $1
     call $src/wasm/matrix/expm/matrixMultiply
     i32.const 0
     local.set $5
     loop $for-loop|5
      local.get $5
      local.get $8
      i32.lt_s
      if
       local.get $5
       i32.const 3
       i32.shl
       local.tee $7
       local.get $12
       i32.add
       local.get $7
       local.get $10
       i32.add
       f64.load
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $5
       br $for-loop|5
      end
     end
     local.get $4
     f64.neg
     local.set $4
    end
    local.get $6
    local.get $9
    local.get $0
    i32.sub
    i32.const 1
    i32.add
    f64.convert_i32_s
    f64.mul
    local.get $9
    f64.convert_i32_s
    f64.const 2
    f64.mul
    local.get $0
    f64.convert_i32_s
    f64.sub
    f64.const 1
    f64.add
    local.get $0
    f64.convert_i32_s
    f64.mul
    f64.div
    local.set $6
    i32.const 0
    local.set $5
    loop $for-loop|6
     local.get $5
     local.get $8
     i32.lt_s
     if
      local.get $5
      i32.const 3
      i32.shl
      local.tee $7
      local.get $12
      i32.add
      f64.load
      local.set $16
      local.get $7
      local.get $13
      i32.add
      local.tee $11
      local.get $11
      f64.load
      local.get $6
      local.get $16
      f64.mul
      f64.add
      f64.store
      local.get $7
      local.get $14
      i32.add
      local.tee $7
      local.get $7
      f64.load
      local.get $6
      local.get $4
      f64.mul
      local.get $16
      f64.mul
      f64.add
      f64.store
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|6
     end
    end
    local.get $0
    i32.const 1
    i32.add
    local.set $0
    br $for-loop|4
   end
  end
  local.get $14
  local.get $10
  local.get $1
  call $src/wasm/matrix/expm/matrixInverse
  i32.const 0
  i32.lt_s
  if
   i32.const -1
   return
  end
  local.get $10
  local.get $13
  local.get $2
  local.get $1
  call $src/wasm/matrix/expm/matrixMultiply
  loop $for-loop|7
   local.get $17
   local.get $19
   i32.lt_s
   if
    local.get $2
    local.get $2
    local.get $10
    local.get $1
    call $src/wasm/matrix/expm/matrixMultiply
    i32.const 0
    local.set $0
    loop $for-loop|8
     local.get $0
     local.get $8
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $3
      local.get $2
      i32.add
      local.get $3
      local.get $10
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|8
     end
    end
    local.get $17
    i32.const 1
    i32.add
    local.set $17
    br $for-loop|7
   end
  end
  i32.const 0
 )
 (func $src/wasm/matrix/expm/expmSmall (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 f64)
  (local $18 f64)
  (local $19 i32)
  (local $20 i32)
  loop $for-loop|0
   local.get $1
   local.get $19
   i32.gt_s
   if
    i32.const 0
    local.set $20
    loop $for-loop|1
     local.get $1
     local.get $20
     i32.gt_s
     if
      local.get $2
      local.get $1
      local.get $19
      i32.mul
      local.get $20
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $19
      local.get $20
      i32.eq
      select
      f64.store
      local.get $20
      i32.const 1
      i32.add
      local.set $20
      br $for-loop|1
     end
    end
    local.get $19
    i32.const 1
    i32.add
    local.set $19
    br $for-loop|0
   end
  end
  local.get $1
  i32.const 1
  i32.eq
  if
   local.get $2
   local.get $0
   f64.load
   call $~lib/math/NativeMath.exp
   f64.store
   return
  end
  local.get $1
  i32.const 2
  i32.eq
  if
   f64.const 1
   local.set $18
   f64.const 1
   local.set $7
   local.get $0
   f64.load
   local.set $13
   local.get $0
   f64.load offset=8
   local.set $12
   local.get $0
   f64.load offset=16
   local.set $11
   local.get $0
   f64.load offset=24
   local.set $10
   f64.const 1
   local.set $17
   f64.const 1
   local.set $16
   i32.const 1
   local.set $0
   loop $for-loop|2
    local.get $0
    local.get $3
    i32.le_s
    if
     block $for-break2
      local.get $18
      local.get $12
      f64.mul
      local.get $6
      local.get $10
      f64.mul
      f64.add
      f64.const 1
      local.get $0
      f64.convert_i32_s
      f64.div
      local.tee $15
      f64.mul
      local.set $5
      local.get $14
      local.get $12
      f64.mul
      local.get $7
      local.get $10
      f64.mul
      f64.add
      local.get $15
      f64.mul
      local.set $4
      local.get $17
      local.get $18
      local.get $13
      f64.mul
      local.get $6
      local.get $11
      f64.mul
      f64.add
      local.get $15
      f64.mul
      local.tee $18
      f64.add
      local.set $17
      local.get $9
      local.get $5
      local.tee $6
      f64.add
      local.set $9
      local.get $8
      local.get $14
      local.get $13
      f64.mul
      local.get $7
      local.get $11
      f64.mul
      f64.add
      local.get $15
      f64.mul
      local.tee $14
      f64.add
      local.set $8
      local.get $16
      local.get $4
      local.tee $7
      f64.add
      local.set $16
      local.get $18
      f64.abs
      local.get $6
      f64.abs
      f64.add
      local.get $14
      f64.abs
      f64.add
      local.get $7
      f64.abs
      f64.add
      f64.const 1e-16
      f64.lt
      br_if $for-break2
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|2
     end
    end
   end
   local.get $2
   local.get $17
   f64.store
   local.get $2
   local.get $9
   f64.store offset=8
   local.get $2
   local.get $8
   f64.store offset=16
   local.get $2
   local.get $16
   f64.store offset=24
  end
 )
 (func $src/wasm/matrix/expm/expmv (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 f64)
  local.get $4
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  local.set $9
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $6
    i32.const 3
    i32.shl
    local.tee $8
    local.get $2
    i32.add
    f64.load
    local.set $7
    local.get $4
    local.get $8
    i32.add
    local.get $7
    f64.store
    local.get $3
    local.get $8
    i32.add
    local.get $7
    f64.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  i32.const 1
  local.set $8
  loop $for-loop|1
   local.get $5
   local.get $8
   i32.ge_s
   if
    block $for-break1
     f64.const 1
     local.get $8
     f64.convert_i32_s
     f64.div
     local.set $10
     i32.const 0
     local.set $2
     loop $for-loop|2
      local.get $1
      local.get $2
      i32.gt_s
      if
       f64.const 0
       local.set $7
       i32.const 0
       local.set $6
       loop $for-loop|3
        local.get $1
        local.get $6
        i32.gt_s
        if
         local.get $7
         local.get $0
         local.get $1
         local.get $2
         i32.mul
         local.get $6
         i32.add
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $4
         local.get $6
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.add
         local.set $7
         local.get $6
         i32.const 1
         i32.add
         local.set $6
         br $for-loop|3
        end
       end
       local.get $9
       local.get $2
       i32.const 3
       i32.shl
       i32.add
       local.get $7
       local.get $10
       f64.mul
       f64.store
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|2
      end
     end
     f64.const 0
     local.set $7
     i32.const 0
     local.set $2
     loop $for-loop|4
      local.get $1
      local.get $2
      i32.gt_s
      if
       local.get $9
       local.get $2
       i32.const 3
       i32.shl
       local.tee $6
       i32.add
       f64.load
       local.set $10
       local.get $4
       local.get $6
       i32.add
       local.get $10
       f64.store
       local.get $3
       local.get $6
       i32.add
       local.tee $6
       local.get $6
       f64.load
       local.get $10
       f64.add
       f64.store
       local.get $7
       local.get $10
       local.get $10
       f64.mul
       f64.add
       local.set $7
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|4
      end
     end
     local.get $7
     f64.const 1e-30
     f64.lt
     br_if $for-break1
     local.get $8
     i32.const 1
     i32.add
     local.set $8
     br $for-loop|1
    end
   end
  end
 )
 (func $src/wasm/matrix/sqrtm/sqrtm (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (param $5 i32) (result i32)
  (local $6 f64)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  local.get $5
  local.get $1
  local.get $1
  i32.mul
  local.tee $16
  i32.const 3
  i32.shl
  i32.add
  local.set $12
  local.get $5
  local.get $16
  i32.const 4
  i32.shl
  i32.add
  local.set $13
  local.get $5
  local.get $16
  i32.const 24
  i32.mul
  i32.add
  local.set $10
  local.get $5
  local.get $16
  i32.const 5
  i32.shl
  i32.add
  local.set $9
  loop $for-loop|0
   local.get $14
   local.get $16
   i32.lt_s
   if
    local.get $14
    i32.const 3
    i32.shl
    local.tee $8
    local.get $5
    i32.add
    local.get $0
    local.get $8
    i32.add
    f64.load
    f64.store
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $17
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|2
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $12
      local.get $1
      local.get $17
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $0
      local.get $17
      i32.eq
      select
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|2
     end
    end
    local.get $17
    i32.const 1
    i32.add
    local.set $17
    br $for-loop|1
   end
  end
  loop $for-loop|3
   local.get $4
   local.get $11
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|4
     local.get $0
     local.get $16
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $8
      local.get $13
      i32.add
      local.get $5
      local.get $8
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|4
     end
    end
    local.get $12
    local.get $10
    local.get $1
    call $src/wasm/matrix/expm/matrixInverse
    i32.const 0
    i32.lt_s
    if
     i32.const -1
     return
    end
    local.get $13
    local.get $9
    local.get $1
    call $src/wasm/matrix/expm/matrixInverse
    i32.const 0
    i32.lt_s
    if
     i32.const -1
     return
    end
    i32.const 0
    local.set $17
    loop $for-loop|5
     local.get $16
     local.get $17
     i32.gt_s
     if
      local.get $17
      i32.const 3
      i32.shl
      local.tee $8
      local.get $5
      i32.add
      local.get $8
      local.get $13
      i32.add
      f64.load
      local.get $8
      local.get $10
      i32.add
      f64.load
      f64.add
      f64.const 0.5
      f64.mul
      f64.store
      local.get $8
      local.get $12
      i32.add
      local.tee $0
      local.get $0
      f64.load
      local.get $8
      local.get $9
      i32.add
      f64.load
      f64.add
      f64.const 0.5
      f64.mul
      f64.store
      local.get $17
      i32.const 1
      i32.add
      local.set $17
      br $for-loop|5
     end
    end
    f64.const 0
    local.set $7
    i32.const 0
    local.set $0
    loop $for-loop|6
     local.get $0
     local.get $16
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $8
      local.get $5
      i32.add
      f64.load
      local.get $8
      local.get $13
      i32.add
      f64.load
      f64.sub
      f64.abs
      local.tee $6
      local.get $7
      f64.gt
      if
       local.get $6
       local.set $7
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|6
     end
    end
    local.get $3
    local.get $7
    f64.ge
    if
     loop $for-loop|7
      local.get $15
      local.get $16
      i32.lt_s
      if
       local.get $15
       i32.const 3
       i32.shl
       local.tee $0
       local.get $2
       i32.add
       local.get $0
       local.get $5
       i32.add
       f64.load
       f64.store
       local.get $15
       i32.const 1
       i32.add
       local.set $15
       br $for-loop|7
      end
     end
     local.get $11
     i32.const 1
     i32.add
     return
    end
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|3
   end
  end
  loop $for-loop|8
   local.get $15
   local.get $16
   i32.lt_s
   if
    local.get $15
    i32.const 3
    i32.shl
    local.tee $0
    local.get $2
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    f64.store
    local.get $15
    i32.const 1
    i32.add
    local.set $15
    br $for-loop|8
   end
  end
  i32.const -1
 )
 (func $src/wasm/matrix/sqrtm/sqrtmNewtonSchulz (param $0 i32) (param $1 i32) (param $2 i32) (param $3 f64) (param $4 i32) (param $5 i32) (result i32)
  (local $6 f64)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 f64)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  local.get $5
  local.get $1
  local.get $1
  i32.mul
  local.tee $15
  i32.const 3
  i32.shl
  i32.add
  local.set $12
  loop $for-loop|0
   local.get $8
   local.get $15
   i32.lt_s
   if
    local.get $7
    local.get $0
    local.get $8
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.tee $6
    local.get $6
    f64.mul
    f64.add
    local.set $7
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
  local.get $7
  f64.sqrt
  local.tee $11
  f64.const 1e-15
  f64.lt
  if
   loop $for-loop|1
    local.get $15
    local.get $16
    i32.gt_s
    if
     local.get $2
     local.get $16
     i32.const 3
     i32.shl
     i32.add
     f64.const 0
     f64.store
     local.get $16
     i32.const 1
     i32.add
     local.set $16
     br $for-loop|1
    end
   end
   i32.const 0
   return
  end
  local.get $5
  local.get $15
  i32.const 4
  i32.shl
  i32.add
  local.set $13
  f64.const 1
  local.get $11
  f64.div
  local.set $6
  loop $for-loop|2
   local.get $10
   local.get $15
   i32.lt_s
   if
    local.get $10
    i32.const 3
    i32.shl
    local.tee $8
    local.get $5
    i32.add
    local.get $0
    local.get $8
    i32.add
    f64.load
    local.get $6
    f64.mul
    f64.store
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $1
   local.get $16
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|4
     local.get $0
     local.get $1
     i32.lt_s
     if
      local.get $12
      local.get $1
      local.get $16
      i32.mul
      local.get $0
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.const 1
      f64.const 0
      local.get $0
      local.get $16
      i32.eq
      select
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|4
     end
    end
    local.get $16
    i32.const 1
    i32.add
    local.set $16
    br $for-loop|3
   end
  end
  loop $for-loop|5
   local.get $4
   local.get $9
   i32.gt_s
   if
    i32.const 0
    local.set $0
    loop $for-loop|6
     local.get $0
     local.get $1
     i32.lt_s
     if
      i32.const 0
      local.set $16
      loop $for-loop|7
       local.get $1
       local.get $16
       i32.gt_s
       if
        f64.const 0
        local.set $7
        i32.const 0
        local.set $8
        loop $for-loop|8
         local.get $1
         local.get $8
         i32.gt_s
         if
          local.get $7
          local.get $12
          local.get $0
          local.get $1
          i32.mul
          local.get $8
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          local.get $5
          local.get $1
          local.get $8
          i32.mul
          local.get $16
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.add
          local.set $7
          local.get $8
          i32.const 1
          i32.add
          local.set $8
          br $for-loop|8
         end
        end
        local.get $13
        local.get $0
        local.get $1
        i32.mul
        local.get $16
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.get $7
        f64.store
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|7
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|6
     end
    end
    f64.const 0
    local.set $7
    i32.const 0
    local.set $0
    loop $for-loop|9
     local.get $0
     local.get $1
     i32.lt_s
     if
      i32.const 0
      local.set $16
      loop $for-loop|10
       local.get $1
       local.get $16
       i32.gt_s
       if
        local.get $13
        local.get $0
        local.get $1
        i32.mul
        local.get $16
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.const 1
        f64.const 0
        local.get $0
        local.get $16
        i32.eq
        select
        f64.sub
        f64.abs
        local.tee $6
        local.get $7
        f64.gt
        if
         local.get $6
         local.set $7
        end
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|10
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|9
     end
    end
    local.get $3
    local.get $7
    f64.ge
    if
     local.get $11
     f64.sqrt
     local.set $3
     loop $for-loop|11
      local.get $14
      local.get $15
      i32.lt_s
      if
       local.get $14
       i32.const 3
       i32.shl
       local.tee $0
       local.get $2
       i32.add
       local.get $0
       local.get $5
       i32.add
       f64.load
       local.get $3
       f64.mul
       f64.store
       local.get $14
       i32.const 1
       i32.add
       local.set $14
       br $for-loop|11
      end
     end
     local.get $9
     i32.const 1
     i32.add
     return
    end
    i32.const 0
    local.set $0
    loop $for-loop|12
     local.get $0
     local.get $1
     i32.lt_s
     if
      i32.const 0
      local.set $16
      loop $for-loop|13
       local.get $1
       local.get $16
       i32.gt_s
       if
        local.get $13
        local.get $0
        local.get $1
        i32.mul
        local.get $16
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.tee $8
        f64.const 3
        f64.const 0
        local.get $0
        local.get $16
        i32.eq
        select
        local.get $8
        f64.load
        f64.sub
        f64.store
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|13
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|12
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|14
     local.get $0
     local.get $1
     i32.lt_s
     if
      i32.const 0
      local.set $16
      loop $for-loop|15
       local.get $1
       local.get $16
       i32.gt_s
       if
        f64.const 0
        local.set $7
        i32.const 0
        local.set $8
        loop $for-loop|16
         local.get $1
         local.get $8
         i32.gt_s
         if
          local.get $7
          local.get $5
          local.get $0
          local.get $1
          i32.mul
          local.get $8
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          local.get $13
          local.get $1
          local.get $8
          i32.mul
          local.get $16
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.add
          local.set $7
          local.get $8
          i32.const 1
          i32.add
          local.set $8
          br $for-loop|16
         end
        end
        local.get $2
        local.get $0
        local.get $1
        i32.mul
        local.get $16
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.get $7
        f64.const 0.5
        f64.mul
        f64.store
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|15
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|14
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|17
     local.get $0
     local.get $1
     i32.lt_s
     if
      i32.const 0
      local.set $16
      loop $for-loop|18
       local.get $1
       local.get $16
       i32.gt_s
       if
        f64.const 0
        local.set $7
        i32.const 0
        local.set $8
        loop $for-loop|19
         local.get $1
         local.get $8
         i32.gt_s
         if
          local.get $7
          local.get $13
          local.get $0
          local.get $1
          i32.mul
          local.get $8
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          local.get $12
          local.get $1
          local.get $8
          i32.mul
          local.get $16
          i32.add
          i32.const 3
          i32.shl
          i32.add
          f64.load
          f64.mul
          f64.add
          local.set $7
          local.get $8
          i32.const 1
          i32.add
          local.set $8
          br $for-loop|19
         end
        end
        local.get $12
        local.get $0
        local.get $1
        i32.mul
        local.get $16
        i32.add
        i32.const 3
        i32.shl
        i32.add
        local.get $7
        f64.const 0.5
        f64.mul
        f64.store
        local.get $16
        i32.const 1
        i32.add
        local.set $16
        br $for-loop|18
       end
      end
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|17
     end
    end
    i32.const 0
    local.set $0
    loop $for-loop|20
     local.get $0
     local.get $15
     i32.lt_s
     if
      local.get $0
      i32.const 3
      i32.shl
      local.tee $8
      local.get $5
      i32.add
      local.get $2
      local.get $8
      i32.add
      f64.load
      f64.store
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|20
     end
    end
    local.get $9
    i32.const 1
    i32.add
    local.set $9
    br $for-loop|5
   end
  end
  local.get $11
  f64.sqrt
  local.set $3
  loop $for-loop|21
   local.get $14
   local.get $15
   i32.lt_s
   if
    local.get $14
    i32.const 3
    i32.shl
    local.tee $0
    local.get $2
    i32.add
    local.get $0
    local.get $5
    i32.add
    f64.load
    local.get $3
    f64.mul
    f64.store
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    br $for-loop|21
   end
  end
  i32.const -1
 )
 (func $src/wasm/matrix/sqrtm/sqrtmCholesky (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 f64)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  loop $for-loop|0
   local.get $4
   local.get $1
   local.get $1
   i32.mul
   i32.lt_s
   if
    local.get $3
    local.get $4
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $5
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|2
     local.get $4
     local.get $5
     i32.le_s
     if
      local.get $0
      local.get $1
      local.get $5
      i32.mul
      local.get $4
      i32.add
      i32.const 3
      i32.shl
      i32.add
      f64.load
      local.set $6
      i32.const 0
      local.set $7
      loop $for-loop|3
       local.get $4
       local.get $7
       i32.gt_s
       if
        local.get $6
        local.get $3
        local.get $1
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $3
        local.get $1
        local.get $4
        i32.mul
        local.get $7
        i32.add
        i32.const 3
        i32.shl
        i32.add
        f64.load
        f64.mul
        f64.sub
        local.set $6
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|3
       end
      end
      local.get $4
      local.get $5
      i32.eq
      if
       local.get $6
       f64.const 0
       f64.le
       if
        i32.const -1
        return
       end
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $6
       f64.sqrt
       f64.store
      else
       local.get $3
       local.get $1
       local.get $4
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.tee $9
       f64.abs
       f64.const 1e-15
       f64.lt
       if
        i32.const -1
        return
       end
       local.get $3
       local.get $1
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 3
       i32.shl
       i32.add
       local.get $6
       local.get $9
       f64.div
       f64.store
      end
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|2
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|1
   end
  end
  loop $for-loop|4
   local.get $8
   local.get $1
   local.get $1
   i32.mul
   i32.lt_s
   if
    local.get $8
    i32.const 3
    i32.shl
    local.tee $0
    local.get $2
    i32.add
    local.get $0
    local.get $3
    i32.add
    f64.load
    f64.store
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|4
   end
  end
  i32.const 0
 )
 (func $src/wasm/algebra/sparseLu/dfs (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (result i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  local.get $3
  local.get $0
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $7
  i32.const 0
  i32.ge_s
  if
   local.get $2
   local.get $7
   i32.const 1
   i32.add
   i32.const 2
   i32.shl
   i32.add
   i32.load
   local.set $9
   local.get $2
   local.get $7
   i32.const 2
   i32.shl
   i32.add
   i32.load
   local.set $8
   loop $for-loop|0
    local.get $8
    local.get $9
    i32.lt_s
    if
     local.get $1
     local.get $8
     i32.const 2
     i32.shl
     i32.add
     i32.load
     local.set $10
     i32.const 0
     local.set $7
     loop $for-loop|1
      local.get $6
      local.get $7
      i32.gt_s
      if
       block $for-break1
        local.get $3
        local.get $7
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.get $10
        i32.eq
        if
         local.get $7
         local.get $1
         local.get $2
         local.get $3
         local.get $4
         local.get $5
         local.get $6
         call $src/wasm/algebra/sparseLu/dfs
         local.set $5
         br $for-break1
        end
        local.get $7
        i32.const 1
        i32.add
        local.set $7
        br $for-loop|1
       end
      end
     end
     local.get $8
     i32.const 1
     i32.add
     local.set $8
     br $for-loop|0
    end
   end
  end
  local.get $4
  local.get $5
  i32.const 1
  i32.sub
  local.tee $1
  i32.const 2
  i32.shl
  i32.add
  local.get $0
  i32.store
  local.get $1
 )
 (func $src/wasm/algebra/sparseLu/sparseReachAndSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (result i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i32)
  local.get $10
  local.set $11
  local.get $5
  local.get $6
  i32.const 1
  i32.add
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.set $13
  local.get $5
  local.get $6
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.set $5
  loop $for-loop|0
   local.get $5
   local.get $13
   i32.lt_s
   if
    local.get $8
    local.get $4
    local.get $5
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $6
    i32.const 3
    i32.shl
    i32.add
    local.get $3
    local.get $5
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $6
    local.get $1
    local.get $2
    local.get $9
    local.get $7
    local.get $11
    local.get $10
    call $src/wasm/algebra/sparseLu/dfs
    local.set $11
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  local.get $11
  local.set $3
  loop $for-loop|1
   local.get $3
   local.get $10
   i32.lt_s
   if
    local.get $9
    local.get $7
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $4
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $5
    i32.const 0
    i32.ge_s
    if
     local.get $2
     local.get $5
     i32.const 1
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     local.set $6
     local.get $8
     local.get $4
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.set $12
     local.get $2
     local.get $5
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 1
     i32.add
     local.set $4
     loop $for-loop|2
      local.get $4
      local.get $6
      i32.lt_s
      if
       local.get $1
       local.get $4
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.set $13
       i32.const 0
       local.set $5
       loop $for-loop|3
        local.get $5
        local.get $10
        i32.lt_s
        if
         block $for-break3
          local.get $9
          local.get $5
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.get $13
          i32.eq
          if
           local.get $8
           local.get $5
           i32.const 3
           i32.shl
           i32.add
           local.tee $5
           local.get $5
           f64.load
           local.get $0
           local.get $4
           i32.const 3
           i32.shl
           i32.add
           f64.load
           local.get $12
           f64.mul
           f64.sub
           f64.store
           br $for-break3
          end
          local.get $5
          i32.const 1
          i32.add
          local.set $5
          br $for-loop|3
         end
        end
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|2
      end
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  local.get $11
 )
 (func $src/wasm/algebra/sparseLu/sparseLu (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 f64) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (param $11 i32) (param $12 i32) (param $13 i32) (result i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 f64)
  (local $17 f64)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  (local $24 i32)
  (local $25 i32)
  (local $26 i32)
  local.get $13
  local.tee $19
  local.get $3
  i32.const 3
  i32.shl
  i32.add
  local.set $22
  loop $for-loop|0
   local.get $3
   local.get $15
   i32.gt_s
   if
    local.get $19
    local.get $15
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $12
    local.get $15
    i32.const 2
    i32.shl
    i32.add
    i32.const -1
    i32.store
    local.get $15
    i32.const 1
    i32.add
    local.set $15
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $18
   i32.gt_s
   if
    local.get $18
    i32.const 2
    i32.shl
    local.tee $15
    local.get $8
    i32.add
    local.get $14
    i32.store
    local.get $11
    local.get $15
    i32.add
    local.get $25
    i32.store
    i32.const -1
    local.set $13
    f64.const -1
    local.set $17
    local.get $6
    local.get $7
    local.get $8
    local.get $0
    local.get $1
    local.get $2
    local.get $4
    if (result i32)
     local.get $4
     local.get $15
     i32.add
     i32.load
    else
     local.get $18
    end
    local.tee $15
    local.get $22
    local.get $19
    local.get $12
    local.get $3
    call $src/wasm/algebra/sparseLu/sparseReachAndSolve
    local.tee $24
    local.set $23
    loop $for-loop|2
     local.get $3
     local.get $23
     i32.gt_s
     if
      local.get $12
      local.get $22
      local.get $23
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $26
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $20
      i32.const 0
      i32.lt_s
      if
       local.get $19
       local.get $26
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.abs
       local.tee $16
       local.get $17
       f64.gt
       if
        local.get $16
        local.set $17
        local.get $26
        local.set $13
       end
      else
       local.get $10
       local.get $25
       i32.const 2
       i32.shl
       i32.add
       local.get $20
       i32.store
       local.get $9
       local.get $25
       i32.const 3
       i32.shl
       i32.add
       local.get $19
       local.get $26
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.store
       local.get $25
       i32.const 1
       i32.add
       local.set $25
      end
      local.get $23
      i32.const 1
      i32.add
      local.set $23
      br $for-loop|2
     end
    end
    local.get $13
    i32.const 0
    i32.lt_s
    local.get $17
    f64.const 0
    f64.le
    i32.or
    if
     i32.const -1
     return
    end
    local.get $12
    local.get $15
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 0
    i32.lt_s
    if
     local.get $15
     local.get $13
     local.get $19
     local.get $15
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.abs
     local.get $17
     local.get $5
     f64.mul
     f64.ge
     select
     local.set $13
    end
    local.get $19
    local.get $13
    i32.const 3
    i32.shl
    i32.add
    f64.load
    local.set $16
    local.get $10
    local.get $25
    i32.const 2
    i32.shl
    i32.add
    local.get $18
    i32.store
    local.get $9
    local.get $25
    i32.const 3
    i32.shl
    i32.add
    local.get $16
    f64.store
    local.get $25
    i32.const 1
    i32.add
    local.set $25
    local.get $12
    local.get $13
    i32.const 2
    i32.shl
    i32.add
    local.get $18
    i32.store
    local.get $7
    local.get $14
    i32.const 2
    i32.shl
    i32.add
    local.get $13
    i32.store
    local.get $6
    local.get $14
    i32.const 3
    i32.shl
    i32.add
    f64.const 1
    f64.store
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    loop $for-loop|3
     local.get $3
     local.get $24
     i32.gt_s
     if
      local.get $12
      local.get $22
      local.get $24
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $13
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.const 0
      i32.lt_s
      if
       local.get $7
       local.get $14
       i32.const 2
       i32.shl
       i32.add
       local.get $13
       i32.store
       local.get $6
       local.get $14
       i32.const 3
       i32.shl
       i32.add
       local.get $19
       local.get $13
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $16
       f64.div
       f64.store
       local.get $14
       i32.const 1
       i32.add
       local.set $14
      end
      local.get $19
      local.get $13
      i32.const 3
      i32.shl
      i32.add
      f64.const 0
      f64.store
      local.get $24
      i32.const 1
      i32.add
      local.set $24
      br $for-loop|3
     end
    end
    local.get $18
    i32.const 1
    i32.add
    local.set $18
    br $for-loop|1
   end
  end
  local.get $3
  i32.const 2
  i32.shl
  local.tee $0
  local.get $8
  i32.add
  local.get $14
  i32.store
  local.get $0
  local.get $11
  i32.add
  local.get $25
  i32.store
  loop $for-loop|4
   local.get $14
   local.get $21
   i32.gt_s
   if
    local.get $7
    local.get $21
    i32.const 2
    i32.shl
    i32.add
    local.tee $0
    local.get $12
    local.get $0
    i32.load
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.store
    local.get $21
    i32.const 1
    i32.add
    local.set $21
    br $for-loop|4
   end
  end
  local.get $14
 )
 (func $src/wasm/algebra/sparseLu/sparseForwardSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  (local $9 i32)
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_s
   if
    local.get $2
    local.get $6
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $5
    local.get $2
    local.get $6
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $8
    i32.lt_s
    if
     local.get $4
     local.get $6
     i32.const 3
     i32.shl
     i32.add
     local.tee $9
     f64.load
     local.get $0
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.div
     local.set $7
     local.get $9
     local.get $7
     f64.store
     local.get $5
     i32.const 1
     i32.add
     local.set $5
     loop $for-loop|1
      local.get $5
      local.get $8
      i32.lt_s
      if
       local.get $4
       local.get $1
       local.get $5
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 3
       i32.shl
       i32.add
       local.tee $9
       local.get $9
       f64.load
       local.get $0
       local.get $5
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $7
       f64.mul
       f64.sub
       f64.store
       local.get $5
       i32.const 1
       i32.add
       local.set $5
       br $for-loop|1
      end
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/algebra/sparseLu/sparseBackwardSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f64)
  (local $8 i32)
  local.get $3
  i32.const 1
  i32.sub
  local.set $5
  loop $for-loop|0
   local.get $5
   i32.const 0
   i32.ge_s
   if
    local.get $2
    local.get $5
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $3
    local.get $2
    local.get $5
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $6
    i32.lt_s
    if
     local.get $4
     local.get $5
     i32.const 3
     i32.shl
     i32.add
     local.tee $8
     f64.load
     local.get $0
     local.get $6
     i32.const 1
     i32.sub
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.div
     local.set $7
     local.get $8
     local.get $7
     f64.store
     loop $for-loop|1
      local.get $3
      local.get $6
      i32.const 1
      i32.sub
      i32.lt_s
      if
       local.get $4
       local.get $1
       local.get $3
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 3
       i32.shl
       i32.add
       local.tee $8
       local.get $8
       f64.load
       local.get $0
       local.get $3
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $7
       f64.mul
       f64.sub
       f64.store
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|1
      end
     end
    end
    local.get $5
    i32.const 1
    i32.sub
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/algebra/sparseLu/sparseLuSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32)
  (local $11 i32)
  (local $12 i32)
  loop $for-loop|0
   local.get $8
   local.get $12
   i32.gt_s
   if
    local.get $10
    local.get $6
    local.get $12
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 3
    i32.shl
    i32.add
    local.get $9
    local.get $12
    i32.const 3
    i32.shl
    i32.add
    f64.load
    f64.store
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|0
   end
  end
  local.get $0
  local.get $1
  local.get $2
  local.get $8
  local.get $10
  call $src/wasm/algebra/sparseLu/sparseForwardSolve
  local.get $3
  local.get $4
  local.get $5
  local.get $8
  local.get $10
  call $src/wasm/algebra/sparseLu/sparseBackwardSolve
  local.get $7
  if
   loop $for-loop|1
    local.get $8
    local.get $11
    i32.gt_s
    if
     local.get $9
     local.get $7
     local.get $11
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 3
     i32.shl
     i32.add
     local.get $10
     local.get $11
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.store
     local.get $11
     i32.const 1
     i32.add
     local.set $11
     br $for-loop|1
    end
   end
  else
   loop $for-loop|2
    local.get $8
    local.get $11
    i32.gt_s
    if
     local.get $11
     i32.const 3
     i32.shl
     local.tee $0
     local.get $9
     i32.add
     local.get $0
     local.get $10
     i32.add
     f64.load
     f64.store
     local.get $11
     i32.const 1
     i32.add
     local.set $11
     br $for-loop|2
    end
   end
  end
 )
 (func $src/wasm/algebra/sparseChol/ereach (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (result i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  local.get $7
  local.set $9
  local.get $0
  i32.const 2
  i32.shl
  local.tee $8
  local.get $5
  i32.add
  i32.const -1
  i32.store
  local.get $1
  local.get $6
  if (result i32)
   local.get $6
   local.get $8
   i32.add
   i32.load
  else
   local.get $0
  end
  local.tee $8
  i32.const 1
  i32.add
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.set $12
  local.get $1
  local.get $8
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.set $11
  loop $for-loop|0
   local.get $11
   local.get $12
   i32.lt_s
   if
    local.get $2
    local.get $11
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $1
    local.get $6
    if
     i32.const 0
     local.set $8
     loop $for-loop|1
      local.get $7
      local.get $8
      i32.gt_s
      if
       block $for-break1
        local.get $6
        local.get $8
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.get $1
        i32.eq
        if
         local.get $8
         local.set $1
         br $for-break1
        end
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $for-loop|1
       end
      end
     end
    end
    local.get $0
    local.get $1
    i32.gt_s
    if
     i32.const 0
     local.set $10
     local.get $1
     local.set $8
     loop $while-continue|2
      local.get $8
      i32.const -1
      i32.ne
      local.get $0
      local.get $8
      i32.gt_s
      i32.and
      if
       local.get $8
       i32.const 2
       i32.shl
       local.tee $1
       local.get $5
       i32.add
       local.tee $13
       i32.load
       i32.const 0
       i32.ge_s
       if
        local.get $4
        local.get $10
        i32.const 2
        i32.shl
        i32.add
        local.get $8
        i32.store
        local.get $10
        i32.const 1
        i32.add
        local.set $10
        local.get $13
        i32.const -1
        i32.store
        local.get $1
        local.get $3
        i32.add
        i32.load
        local.set $8
        br $while-continue|2
       end
      end
     end
     loop $while-continue|3
      local.get $10
      i32.const 0
      i32.gt_s
      if
       local.get $4
       local.get $9
       i32.const 1
       i32.sub
       local.tee $9
       i32.const 2
       i32.shl
       i32.add
       local.get $4
       local.get $10
       i32.const 1
       i32.sub
       local.tee $10
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.store
       br $while-continue|3
      end
     end
    end
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|0
   end
  end
  local.get $9
  local.set $0
  loop $for-loop|4
   local.get $0
   local.get $7
   i32.lt_s
   if
    local.get $5
    local.get $4
    local.get $0
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 2
    i32.shl
    i32.add
    local.tee $1
    local.get $1
    i32.load
    i32.const 2147483647
    i32.and
    i32.store
    local.get $0
    i32.const 1
    i32.add
    local.set $0
    br $for-loop|4
   end
  end
  local.get $9
 )
 (func $src/wasm/algebra/sparseChol/sparseChol (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (result i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 f64)
  (local $18 f64)
  (local $19 i32)
  (local $20 i32)
  local.get $10
  local.tee $14
  local.get $3
  i32.const 3
  i32.shl
  i32.add
  local.tee $16
  local.get $3
  i32.const 2
  i32.shl
  i32.add
  local.set $19
  loop $for-loop|0
   local.get $3
   local.get $11
   i32.gt_s
   if
    local.get $11
    i32.const 2
    i32.shl
    local.tee $10
    local.get $5
    i32.add
    i32.load
    local.set $12
    local.get $9
    local.get $10
    i32.add
    local.get $12
    i32.store
    local.get $10
    local.get $16
    i32.add
    local.get $12
    i32.store
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 2
  i32.shl
  local.tee $10
  local.get $9
  i32.add
  local.get $5
  local.get $10
  i32.add
  i32.load
  i32.store
  loop $for-loop|1
   local.get $3
   local.get $13
   i32.gt_s
   if
    local.get $13
    local.get $2
    local.get $1
    local.get $4
    local.get $19
    local.get $16
    local.get $6
    local.get $3
    call $src/wasm/algebra/sparseChol/ereach
    local.set $10
    local.get $14
    local.get $13
    i32.const 3
    i32.shl
    i32.add
    f64.const 0
    f64.store
    local.get $2
    local.get $6
    if (result i32)
     local.get $6
     local.get $13
     i32.const 2
     i32.shl
     i32.add
     i32.load
    else
     local.get $13
    end
    local.tee $11
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $20
    local.get $2
    local.get $11
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $15
    loop $for-loop|2
     local.get $15
     local.get $20
     i32.lt_s
     if
      local.get $1
      local.get $15
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.set $12
      local.get $6
      if
       i32.const 0
       local.set $11
       loop $for-loop|3
        local.get $3
        local.get $11
        i32.gt_s
        if
         block $for-break3
          local.get $6
          local.get $11
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.get $12
          i32.eq
          if
           local.get $11
           local.set $12
           br $for-break3
          end
          local.get $11
          i32.const 1
          i32.add
          local.set $11
          br $for-loop|3
         end
        end
       end
      end
      local.get $12
      local.get $13
      i32.le_s
      if
       local.get $14
       local.get $12
       i32.const 3
       i32.shl
       i32.add
       local.get $0
       local.get $15
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.store
      end
      local.get $15
      i32.const 1
      i32.add
      local.set $15
      br $for-loop|2
     end
    end
    local.get $14
    local.get $13
    i32.const 3
    i32.shl
    i32.add
    local.tee $11
    f64.load
    local.set $17
    local.get $11
    f64.const 0
    f64.store
    loop $for-loop|4
     local.get $3
     local.get $10
     i32.gt_s
     if
      local.get $19
      local.get $10
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $11
      i32.const 2
      i32.shl
      local.tee $12
      local.get $9
      i32.add
      i32.load
      local.set $15
      local.get $14
      local.get $11
      i32.const 3
      i32.shl
      i32.add
      local.tee $20
      f64.load
      local.get $7
      local.get $15
      i32.const 3
      i32.shl
      i32.add
      f64.load
      f64.div
      local.set $18
      local.get $20
      f64.const 0
      f64.store
      local.get $12
      local.get $16
      i32.add
      i32.load
      local.set $20
      local.get $15
      i32.const 1
      i32.add
      local.set $12
      loop $for-loop|5
       local.get $12
       local.get $20
       i32.lt_s
       if
        local.get $14
        local.get $8
        local.get $12
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.const 3
        i32.shl
        i32.add
        local.tee $15
        local.get $15
        f64.load
        local.get $7
        local.get $12
        i32.const 3
        i32.shl
        i32.add
        f64.load
        local.get $18
        f64.mul
        f64.sub
        f64.store
        local.get $12
        i32.const 1
        i32.add
        local.set $12
        br $for-loop|5
       end
      end
      local.get $17
      local.get $18
      local.get $18
      f64.mul
      f64.sub
      local.set $17
      local.get $8
      local.get $16
      local.get $11
      i32.const 2
      i32.shl
      i32.add
      local.tee $11
      i32.load
      local.tee $12
      i32.const 2
      i32.shl
      i32.add
      local.get $13
      i32.store
      local.get $7
      local.get $12
      i32.const 3
      i32.shl
      i32.add
      local.get $18
      f64.store
      local.get $11
      local.get $12
      i32.const 1
      i32.add
      i32.store
      local.get $10
      i32.const 1
      i32.add
      local.set $10
      br $for-loop|4
     end
    end
    local.get $17
    f64.const 0
    f64.le
    if
     i32.const -1
     return
    end
    local.get $8
    local.get $16
    local.get $13
    i32.const 2
    i32.shl
    i32.add
    local.tee $10
    i32.load
    local.tee $11
    i32.const 2
    i32.shl
    i32.add
    local.get $13
    i32.store
    local.get $7
    local.get $11
    i32.const 3
    i32.shl
    i32.add
    local.get $17
    f64.sqrt
    f64.store
    local.get $10
    local.get $11
    i32.const 1
    i32.add
    i32.store
    local.get $13
    i32.const 1
    i32.add
    local.set $13
    br $for-loop|1
   end
  end
  local.get $5
  local.get $3
  i32.const 2
  i32.shl
  i32.add
  i32.load
 )
 (func $src/wasm/algebra/sparseChol/sparseCholSolve (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 f64)
  (local $11 i32)
  (local $12 i32)
  local.get $4
  if
   loop $for-loop|0
    local.get $3
    local.get $7
    i32.gt_s
    if
     local.get $6
     local.get $4
     local.get $7
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 3
     i32.shl
     i32.add
     local.get $5
     local.get $7
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.store
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|0
    end
   end
  else
   loop $for-loop|1
    local.get $3
    local.get $7
    i32.gt_s
    if
     local.get $7
     i32.const 3
     i32.shl
     local.tee $11
     local.get $6
     i32.add
     local.get $5
     local.get $11
     i32.add
     f64.load
     f64.store
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     br $for-loop|1
    end
   end
  end
  loop $for-loop|2
   local.get $3
   local.get $8
   i32.gt_s
   if
    local.get $2
    local.get $8
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $7
    local.get $2
    local.get $8
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $11
    i32.lt_s
    if
     local.get $6
     local.get $8
     i32.const 3
     i32.shl
     i32.add
     local.tee $12
     f64.load
     local.get $0
     local.get $7
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.div
     local.set $10
     local.get $12
     local.get $10
     f64.store
     local.get $7
     i32.const 1
     i32.add
     local.set $7
     loop $for-loop|3
      local.get $7
      local.get $11
      i32.lt_s
      if
       local.get $6
       local.get $1
       local.get $7
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 3
       i32.shl
       i32.add
       local.tee $12
       local.get $12
       f64.load
       local.get $0
       local.get $7
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $10
       f64.mul
       f64.sub
       f64.store
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|3
      end
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|2
   end
  end
  local.get $3
  i32.const 1
  i32.sub
  local.set $8
  loop $for-loop|4
   local.get $8
   i32.const 0
   i32.ge_s
   if
    local.get $2
    local.get $8
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $11
    local.get $2
    local.get $8
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $12
    i32.lt_s
    if
     local.get $6
     local.get $8
     i32.const 3
     i32.shl
     i32.add
     f64.load
     local.set $10
     local.get $11
     i32.const 1
     i32.add
     local.set $7
     loop $for-loop|5
      local.get $7
      local.get $12
      i32.lt_s
      if
       local.get $10
       local.get $0
       local.get $7
       i32.const 3
       i32.shl
       i32.add
       f64.load
       local.get $6
       local.get $1
       local.get $7
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 3
       i32.shl
       i32.add
       f64.load
       f64.mul
       f64.sub
       local.set $10
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|5
      end
     end
     local.get $6
     local.get $8
     i32.const 3
     i32.shl
     i32.add
     local.get $10
     local.get $0
     local.get $11
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.div
     f64.store
    end
    local.get $8
    i32.const 1
    i32.sub
    local.set $8
    br $for-loop|4
   end
  end
  local.get $4
  if
   loop $for-loop|6
    local.get $3
    local.get $9
    i32.gt_s
    if
     local.get $5
     local.get $9
     i32.const 3
     i32.shl
     i32.add
     local.get $6
     local.get $4
     local.get $9
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 3
     i32.shl
     i32.add
     f64.load
     f64.store
     local.get $9
     i32.const 1
     i32.add
     local.set $9
     br $for-loop|6
    end
   end
  else
   loop $for-loop|7
    local.get $3
    local.get $9
    i32.gt_s
    if
     local.get $9
     i32.const 3
     i32.shl
     local.tee $0
     local.get $5
     i32.add
     local.get $0
     local.get $6
     i32.add
     f64.load
     f64.store
     local.get $9
     i32.const 1
     i32.add
     local.set $9
     br $for-loop|7
    end
   end
  end
 )
 (func $src/wasm/algebra/sparseChol/eliminationTree (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  local.get $4
  local.set $7
  loop $for-loop|0
   local.get $2
   local.get $6
   i32.gt_s
   if
    local.get $6
    i32.const 2
    i32.shl
    local.tee $4
    local.get $3
    i32.add
    i32.const -1
    i32.store
    local.get $4
    local.get $7
    i32.add
    i32.const -1
    i32.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $2
   local.get $8
   i32.gt_s
   if
    local.get $1
    local.get $8
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $10
    local.get $1
    local.get $8
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $9
    loop $for-loop|2
     local.get $9
     local.get $10
     i32.lt_s
     if
      local.get $8
      local.get $0
      local.get $9
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $6
      i32.gt_s
      if
       local.get $6
       local.set $4
       loop $while-continue|3
        local.get $7
        local.get $4
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.tee $5
        local.get $8
        i32.eq
        local.get $5
        i32.const 0
        i32.lt_s
        i32.or
        i32.eqz
        if
         local.get $5
         local.set $4
         br $while-continue|3
        end
       end
       loop $while-continue|4
        local.get $4
        local.get $6
        i32.ne
        if
         local.get $7
         local.get $6
         i32.const 2
         i32.shl
         i32.add
         local.tee $5
         i32.load
         local.set $6
         local.get $5
         local.get $8
         i32.store
         br $while-continue|4
        end
       end
       local.get $3
       local.get $4
       i32.const 2
       i32.shl
       i32.add
       local.tee $5
       i32.load
       i32.const 0
       i32.lt_s
       if
        local.get $5
        local.get $8
        i32.store
       end
       local.get $7
       local.get $4
       i32.const 2
       i32.shl
       i32.add
       local.get $8
       i32.store
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|2
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|1
   end
  end
 )
 (func $src/wasm/algebra/sparseChol/postorder (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  loop $for-loop|0
   local.get $1
   local.get $6
   i32.gt_s
   if
    local.get $0
    local.get $6
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const -1
    i32.eq
    if
     local.get $3
     local.get $6
     i32.store
     i32.const 1
     local.set $4
     loop $while-continue|1
      local.get $4
      i32.const 0
      i32.gt_s
      if
       local.get $3
       local.get $4
       i32.const 1
       i32.sub
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.set $9
       i32.const 0
       local.set $10
       i32.const 0
       local.set $5
       loop $for-loop|2
        local.get $1
        local.get $5
        i32.gt_s
        if
         block $for-break2
          local.get $0
          local.get $5
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.get $9
          i32.eq
          if
           i32.const 0
           local.set $11
           i32.const 0
           local.set $7
           loop $for-loop|3
            local.get $7
            local.get $8
            i32.lt_s
            if
             block $for-break3
              local.get $2
              local.get $7
              i32.const 2
              i32.shl
              i32.add
              i32.load
              local.get $5
              i32.eq
              if
               i32.const 1
               local.set $11
               br $for-break3
              end
              local.get $7
              i32.const 1
              i32.add
              local.set $7
              br $for-loop|3
             end
            end
           end
           local.get $11
           i32.eqz
           if
            local.get $3
            local.get $4
            i32.const 2
            i32.shl
            i32.add
            local.get $5
            i32.store
            local.get $4
            i32.const 1
            i32.add
            local.set $4
            i32.const 1
            local.set $10
            br $for-break2
           end
          end
          local.get $5
          i32.const 1
          i32.add
          local.set $5
          br $for-loop|2
         end
        end
       end
       local.get $10
       i32.eqz
       if
        local.get $2
        local.get $8
        i32.const 2
        i32.shl
        i32.add
        local.get $9
        i32.store
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        local.get $4
        i32.const 1
        i32.sub
        local.set $4
       end
       br $while-continue|1
      end
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $src/wasm/algebra/sparseChol/columnCounts (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  local.get $5
  local.get $3
  i32.const 2
  i32.shl
  i32.add
  local.set $13
  local.get $0
  local.get $3
  local.get $5
  local.get $5
  local.get $3
  i32.const 3
  i32.shl
  i32.add
  call $src/wasm/algebra/sparseChol/postorder
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_s
   if
    local.get $6
    i32.const 2
    i32.shl
    local.tee $7
    local.get $13
    i32.add
    i32.const -1
    i32.store
    local.get $4
    local.get $7
    i32.add
    i32.const 0
    i32.store
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $3
   local.get $12
   i32.gt_s
   if
    local.get $1
    local.get $5
    local.get $12
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $15
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $8
    local.get $1
    local.get $15
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.set $14
    loop $for-loop|2
     local.get $8
     local.get $14
     i32.gt_s
     if
      local.get $2
      local.get $14
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $7
      local.get $15
      i32.le_s
      if
       local.get $7
       local.set $6
       loop $while-continue|3
        local.get $6
        i32.const 2
        i32.shl
        local.tee $9
        local.get $13
        i32.add
        local.tee $6
        i32.load
        local.tee $16
        local.get $15
        i32.ne
        local.get $16
        i32.const -1
        i32.ne
        i32.and
        if
         block $while-break|3
          local.get $6
          i32.load
          drop
          local.get $6
          local.get $15
          i32.store
          local.get $4
          local.get $9
          i32.add
          local.tee $6
          local.get $6
          i32.load
          i32.const 1
          i32.add
          i32.store
          local.get $0
          local.get $9
          i32.add
          i32.load
          local.tee $6
          i32.const 0
          i32.lt_s
          br_if $while-break|3
          br $while-continue|3
         end
        end
       end
       local.get $13
       local.get $7
       i32.const 2
       i32.shl
       i32.add
       local.tee $6
       i32.load
       i32.const -1
       i32.eq
       if
        local.get $6
        local.get $15
        i32.store
       end
      end
      local.get $14
      i32.const 1
      i32.add
      local.set $14
      br $for-loop|2
     end
    end
    local.get $4
    local.get $15
    i32.const 2
    i32.shl
    i32.add
    local.tee $6
    local.get $6
    i32.load
    i32.const 1
    i32.add
    i32.store
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|1
   end
  end
  loop $for-loop|4
   local.get $3
   local.get $11
   i32.gt_s
   if
    local.get $4
    local.get $11
    i32.const 2
    i32.shl
    i32.add
    local.tee $0
    i32.load
    local.get $0
    local.get $10
    i32.store
    local.get $10
    i32.add
    local.set $10
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|4
   end
  end
  local.get $4
  local.get $3
  i32.const 2
  i32.shl
  i32.add
  local.get $10
  i32.store
 )
 (func $src/wasm/plain/operations/abs (param $0 f64) (result f64)
  local.get $0
  f64.abs
 )
 (func $src/wasm/plain/operations/add (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  f64.add
 )
 (func $src/wasm/plain/operations/subtract (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  f64.sub
 )
 (func $src/wasm/plain/operations/multiply (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  f64.mul
 )
 (func $src/wasm/plain/operations/divide (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  f64.div
 )
 (func $src/wasm/plain/operations/unaryMinus (param $0 f64) (result f64)
  local.get $0
  f64.neg
 )
 (func $src/wasm/plain/operations/unaryPlus (param $0 f64) (result f64)
  local.get $0
 )
 (func $src/wasm/plain/operations/cbrt (param $0 f64) (result f64)
  (local $1 i32)
  local.get $0
  f64.const 0
  f64.eq
  if
   local.get $0
   return
  end
  local.get $0
  f64.neg
  local.get $0
  local.get $0
  f64.const 0
  f64.lt
  local.tee $1
  select
  local.tee $0
  local.get $0
  f64.sub
  f64.const 0
  f64.eq
  if
   local.get $0
   local.get $0
   call $~lib/math/NativeMath.log
   f64.const 3
   f64.div
   call $~lib/math/NativeMath.exp
   local.tee $0
   local.get $0
   f64.mul
   f64.div
   local.get $0
   local.get $0
   f64.add
   f64.add
   f64.const 3
   f64.div
   local.set $0
  end
  local.get $0
  f64.neg
  local.get $0
  local.get $1
  select
 )
 (func $src/wasm/plain/operations/cube (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.mul
  local.get $0
  f64.mul
 )
 (func $src/wasm/plain/operations/exp (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.exp
 )
 (func $src/wasm/plain/operations/expm1 (param $0 f64) (result f64)
  (local $1 f64)
  local.get $0
  f64.const -0.0002
  f64.le
  local.get $0
  f64.const 0.0002
  f64.ge
  i32.or
  if (result f64)
   local.get $0
   call $~lib/math/NativeMath.exp
   f64.const -1
   f64.add
  else
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   local.tee $1
   f64.const 0.5
   f64.mul
   f64.add
   local.get $1
   local.get $0
   f64.mul
   f64.const 6
   f64.div
   f64.add
  end
 )
 (func $src/wasm/plain/operations/isInteger (param $0 f64) (result i32)
  local.get $0
  local.get $0
  f64.floor
  f64.eq
  local.get $0
  local.get $0
  f64.sub
  f64.const 0
  f64.eq
  i32.and
 )
 (func $~lib/math/NativeMath.mod (param $0 f64) (param $1 f64) (result f64)
  (local $2 i64)
  (local $3 i64)
  (local $4 i64)
  (local $5 i64)
  (local $6 i64)
  (local $7 i64)
  (local $8 i64)
  local.get $1
  f64.abs
  f64.const 1
  f64.eq
  if
   local.get $0
   local.get $0
   f64.trunc
   f64.sub
   local.get $0
   f64.copysign
   return
  end
  local.get $1
  i64.reinterpret_f64
  local.tee $4
  i64.const 52
  i64.shr_u
  i64.const 2047
  i64.and
  local.set $7
  local.get $4
  i64.const 1
  i64.shl
  local.tee $3
  i64.eqz
  local.get $0
  i64.reinterpret_f64
  local.tee $6
  i64.const 52
  i64.shr_u
  i64.const 2047
  i64.and
  local.tee $8
  i64.const 2047
  i64.eq
  i32.or
  local.get $1
  local.get $1
  f64.ne
  i32.or
  if
   local.get $0
   local.get $1
   f64.mul
   local.tee $0
   local.get $0
   f64.div
   return
  end
  local.get $6
  i64.const 1
  i64.shl
  local.tee $2
  local.get $3
  i64.le_u
  if
   local.get $0
   local.get $2
   local.get $3
   i64.ne
   f64.convert_i32_u
   f64.mul
   return
  end
  local.get $6
  i64.const 63
  i64.shr_u
  local.get $8
  i64.eqz
  if (result i64)
   local.get $6
   i64.const 1
   local.get $8
   local.get $6
   i64.const 12
   i64.shl
   i64.clz
   i64.sub
   local.tee $8
   i64.sub
   i64.shl
  else
   local.get $6
   i64.const 4503599627370495
   i64.and
   i64.const 4503599627370496
   i64.or
  end
  local.set $2
  local.get $7
  i64.eqz
  if (result i64)
   local.get $4
   i64.const 1
   local.get $7
   local.get $4
   i64.const 12
   i64.shl
   i64.clz
   i64.sub
   local.tee $7
   i64.sub
   i64.shl
  else
   local.get $4
   i64.const 4503599627370495
   i64.and
   i64.const 4503599627370496
   i64.or
  end
  local.set $3
  loop $while-continue|0
   local.get $7
   local.get $8
   i64.lt_s
   if
    local.get $2
    local.get $3
    i64.ge_u
    if (result i64)
     local.get $2
     local.get $3
     i64.eq
     if
      local.get $0
      f64.const 0
      f64.mul
      return
     end
     local.get $2
     local.get $3
     i64.sub
    else
     local.get $2
    end
    i64.const 1
    i64.shl
    local.set $2
    local.get $8
    i64.const 1
    i64.sub
    local.set $8
    br $while-continue|0
   end
  end
  local.get $2
  local.get $3
  i64.ge_u
  if
   local.get $2
   local.get $3
   i64.eq
   if
    local.get $0
    f64.const 0
    f64.mul
    return
   end
   local.get $2
   local.get $3
   i64.sub
   local.set $2
  end
  local.get $8
  local.get $2
  i64.const 11
  i64.shl
  i64.clz
  local.tee $4
  i64.sub
  local.set $3
  i64.const 63
  i64.shl
  local.get $2
  local.get $4
  i64.shl
  local.tee $2
  i64.const 4503599627370496
  i64.sub
  local.get $3
  i64.const 52
  i64.shl
  i64.or
  local.get $2
  i64.const 1
  local.get $3
  i64.sub
  i64.shr_u
  local.get $3
  i64.const 0
  i64.gt_s
  select
  i64.or
  f64.reinterpret_i64
 )
 (func $src/wasm/plain/operations/gcd (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  local.get $0
  call $src/wasm/plain/operations/isInteger
  if (result i32)
   local.get $1
   call $src/wasm/plain/operations/isInteger
  else
   i32.const 0
  end
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  loop $while-continue|0
   local.get $1
   f64.const 0
   f64.ne
   if
    local.get $0
    local.get $1
    call $~lib/math/NativeMath.mod
    local.get $1
    local.set $0
    local.set $1
    br $while-continue|0
   end
  end
  local.get $0
  f64.neg
  local.get $0
  local.get $0
  f64.const 0
  f64.lt
  select
 )
 (func $src/wasm/plain/operations/lcm (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  local.get $0
  call $src/wasm/plain/operations/isInteger
  if (result i32)
   local.get $1
   call $src/wasm/plain/operations/isInteger
  else
   i32.const 0
  end
  i32.eqz
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  f64.const 0
  f64.eq
  local.get $0
  f64.const 0
  f64.eq
  i32.or
  if
   f64.const 0
   return
  end
  local.get $0
  local.get $1
  f64.mul
  loop $while-continue|0
   local.get $1
   f64.const 0
   f64.ne
   if
    local.get $0
    local.get $1
    local.tee $0
    call $~lib/math/NativeMath.mod
    local.set $1
    br $while-continue|0
   end
  end
  local.get $0
  f64.div
  f64.abs
 )
 (func $src/wasm/plain/operations/log (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/log2 (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.log
  f64.const 0.6931471805599453
  f64.div
 )
 (func $src/wasm/plain/operations/log10 (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.log
  f64.const 2.302585092994046
  f64.div
 )
 (func $src/wasm/plain/operations/log1p (param $0 f64) (result f64)
  local.get $0
  f64.const 1
  f64.add
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/mod (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $0
  local.get $1
  local.get $0
  local.get $1
  f64.div
  f64.floor
  f64.mul
  f64.sub
  local.get $1
  f64.const 0
  f64.eq
  select
 )
 (func $src/wasm/plain/operations/nthRoot (param $0 f64) (param $1 f64) (result f64)
  (local $2 i32)
  local.get $1
  f64.neg
  local.get $1
  local.get $1
  f64.const 0
  f64.lt
  local.tee $2
  select
  local.tee $1
  f64.const 0
  f64.eq
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 0
  f64.lt
  if (result i32)
   local.get $1
   f64.abs
   f64.const 2
   call $~lib/math/NativeMath.mod
   f64.const 1
   f64.ne
  else
   i32.const 0
  end
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 0
  f64.eq
  if
   f64.const inf
   f64.const 0
   local.get $2
   select
   return
  end
  local.get $0
  local.get $0
  f64.sub
  f64.const 0
  f64.ne
  if
   f64.const 0
   local.get $0
   local.get $2
   select
   return
  end
  f64.const 1
  local.get $0
  f64.abs
  f64.const 1
  local.get $1
  f64.div
  call $~lib/math/NativeMath.pow
  local.tee $1
  f64.neg
  local.get $1
  local.get $0
  f64.const 0
  f64.lt
  select
  local.tee $0
  f64.div
  local.get $0
  local.get $2
  select
 )
 (func $src/wasm/plain/operations/sign (param $0 f64) (result f64)
  local.get $0
  f64.const 0
  f64.gt
  if
   f64.const 1
   return
  end
  local.get $0
  f64.const 0
  f64.lt
  if
   f64.const -1
   return
  end
  f64.const 0
 )
 (func $src/wasm/plain/operations/square (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.mul
 )
 (func $src/wasm/plain/operations/pow (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  local.get $1
  f64.const -inf
  f64.eq
  local.get $0
  local.get $0
  f64.mul
  local.tee $2
  f64.const 1
  f64.gt
  i32.and
  local.get $1
  f64.const inf
  f64.eq
  local.get $2
  f64.const 1
  f64.lt
  i32.and
  i32.or
  if
   f64.const 0
   return
  end
  local.get $0
  local.get $1
  call $~lib/math/NativeMath.pow
 )
 (func $src/wasm/plain/operations/bitAnd (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.and
 )
 (func $src/wasm/plain/operations/bitNot (param $0 i32) (result i32)
  local.get $0
  i32.const -1
  i32.xor
 )
 (func $src/wasm/plain/operations/bitOr (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.or
 )
 (func $src/wasm/plain/operations/bitXor (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.xor
 )
 (func $src/wasm/plain/operations/leftShift (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.shl
 )
 (func $src/wasm/plain/operations/rightArithShift (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.shr_s
 )
 (func $src/wasm/plain/operations/rightLogShift (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.shr_u
 )
 (func $src/wasm/plain/operations/product (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  f64.const 1
  local.set $2
  loop $for-loop|0
   local.get $0
   local.get $1
   f64.le
   if
    local.get $2
    local.get $0
    f64.mul
    local.set $2
    local.get $0
    f64.const 1
    f64.add
    local.set $0
    br $for-loop|0
   end
  end
  local.get $2
 )
 (func $src/wasm/plain/operations/combinations (param $0 f64) (param $1 f64) (result f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 i32)
  local.get $0
  call $src/wasm/plain/operations/isInteger
  i32.eqz
  local.get $0
  f64.const 0
  f64.lt
  i32.or
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $1
  call $src/wasm/plain/operations/isInteger
  i32.eqz
  local.get $1
  f64.const 0
  f64.lt
  i32.or
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  local.get $1
  f64.lt
  if
   f64.const nan:0x8000000000000
   return
  end
  f64.const 1
  local.set $3
  f64.const 2
  local.set $2
  local.get $0
  local.get $1
  f64.sub
  local.tee $4
  local.get $1
  f64.gt
  local.set $6
  local.get $1
  local.get $4
  local.get $6
  select
  local.set $5
  local.get $4
  f64.const 1
  f64.add
  local.get $1
  f64.const 1
  f64.add
  local.get $6
  select
  local.set $4
  loop $for-loop|0
   local.get $0
   local.get $4
   f64.ge
   if
    local.get $3
    local.get $4
    f64.mul
    local.set $3
    loop $while-continue|1
     local.get $2
     local.get $5
     f64.le
     if (result i32)
      local.get $3
      local.get $2
      call $~lib/math/NativeMath.mod
      f64.const 0
      f64.eq
     else
      i32.const 0
     end
     if
      local.get $2
      local.tee $1
      f64.const 1
      f64.add
      local.set $2
      local.get $3
      local.get $1
      f64.div
      local.set $3
      br $while-continue|1
     end
    end
    local.get $4
    f64.const 1
    f64.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $2
  local.get $5
  f64.le
  if (result f64)
   local.get $3
   local.get $2
   local.get $5
   call $src/wasm/plain/operations/product
   f64.div
  else
   local.get $3
  end
 )
 (func $src/wasm/plain/operations/not (param $0 f64) (result i32)
  local.get $0
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.gt_u
 )
 (func $src/wasm/plain/operations/or (param $0 f64) (param $1 f64) (result i32)
  local.get $1
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  local.get $0
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  i32.or
 )
 (func $src/wasm/plain/operations/xor (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  local.get $1
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  i32.ne
 )
 (func $src/wasm/plain/operations/and (param $0 f64) (param $1 f64) (result i32)
  local.get $1
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  local.get $0
  i64.reinterpret_f64
  i64.const 1
  i64.shl
  i64.const 2
  i64.sub
  i64.const -9007199254740994
  i64.le_u
  i32.and
 )
 (func $src/wasm/plain/operations/compare (param $0 f64) (param $1 f64) (result i32)
  local.get $0
  local.get $1
  f64.eq
  if
   i32.const 0
   return
  end
  local.get $0
  local.get $1
  f64.lt
  if
   i32.const -1
   return
  end
  i32.const 1
 )
 (func $src/wasm/plain/operations/getGammaP (param $0 i32) (result f64)
  local.get $0
  i32.eqz
  if
   f64.const 0.9999999999999971
   return
  end
  local.get $0
  i32.const 1
  i32.eq
  if
   f64.const 57.15623566586292
   return
  end
  local.get $0
  i32.const 2
  i32.eq
  if
   f64.const -59.59796035547549
   return
  end
  local.get $0
  i32.const 3
  i32.eq
  if
   f64.const 14.136097974741746
   return
  end
  local.get $0
  i32.const 4
  i32.eq
  if
   f64.const -0.4919138160976202
   return
  end
  local.get $0
  i32.const 5
  i32.eq
  if
   f64.const 3.399464998481189e-05
   return
  end
  local.get $0
  i32.const 6
  i32.eq
  if
   f64.const 4.652362892704858e-05
   return
  end
  local.get $0
  i32.const 7
  i32.eq
  if
   f64.const -9.837447530487956e-05
   return
  end
  local.get $0
  i32.const 8
  i32.eq
  if
   f64.const 1.580887032249125e-04
   return
  end
  local.get $0
  i32.const 9
  i32.eq
  if
   f64.const -2.1026444172410488e-04
   return
  end
  local.get $0
  i32.const 10
  i32.eq
  if
   f64.const 2.1743961811521265e-04
   return
  end
  local.get $0
  i32.const 11
  i32.eq
  if
   f64.const -1.643181065367639e-04
   return
  end
  local.get $0
  i32.const 12
  i32.eq
  if
   f64.const 8.441822398385275e-05
   return
  end
  local.get $0
  i32.const 13
  i32.eq
  if
   f64.const -2.6190838401581408e-05
   return
  end
  local.get $0
  i32.const 14
  i32.eq
  if
   f64.const 3.6899182659531625e-06
   return
  end
  f64.const 0
 )
 (func $src/wasm/plain/operations/gamma (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  local.get $0
  call $src/wasm/plain/operations/isInteger
  if
   local.get $0
   f64.const 0
   f64.le
   if
    f64.const inf
    f64.const nan:0x8000000000000
    local.get $0
    local.get $0
    f64.sub
    f64.const 0
    f64.eq
    select
    return
   end
   local.get $0
   f64.const 171
   f64.gt
   if
    f64.const inf
    return
   end
   f64.const 1
   local.get $0
   f64.const -1
   f64.add
   call $src/wasm/plain/operations/product
   return
  end
  local.get $0
  f64.const 0.5
  f64.lt
  if
   f64.const 3.141592653589793
   local.get $0
   f64.const 3.141592653589793
   f64.mul
   call $~lib/math/NativeMath.sin
   f64.const 1
   local.get $0
   f64.sub
   call $src/wasm/plain/operations/gamma
   f64.mul
   f64.div
   return
  end
  local.get $0
  f64.const 171.35
  f64.ge
  if
   f64.const inf
   return
  end
  local.get $0
  f64.const 85
  f64.gt
  if
   local.get $0
   local.get $0
   f64.mul
   local.tee $2
   local.get $0
   f64.mul
   local.tee $3
   local.get $0
   f64.mul
   local.tee $4
   local.get $0
   f64.mul
   local.set $5
   f64.const 6.283185307179586
   local.get $0
   f64.div
   f64.sqrt
   local.get $0
   f64.const 2.718281828459045
   f64.div
   local.get $0
   call $~lib/math/NativeMath.pow
   f64.mul
   f64.const 1
   local.get $0
   f64.const 12
   f64.mul
   f64.div
   f64.const 1
   f64.add
   f64.const 1
   local.get $2
   f64.const 288
   f64.mul
   f64.div
   f64.add
   f64.const 139
   local.get $3
   f64.const 51840
   f64.mul
   f64.div
   f64.sub
   f64.const 571
   local.get $4
   f64.const 2488320
   f64.mul
   f64.div
   f64.sub
   f64.const 163879
   local.get $5
   f64.const 209018880
   f64.mul
   f64.div
   f64.add
   f64.const 5246819
   local.get $5
   f64.const 75246796800
   f64.mul
   local.get $0
   f64.mul
   f64.div
   f64.add
   f64.mul
   return
  end
  local.get $0
  f64.const -1
  f64.add
  local.set $2
  i32.const 0
  call $src/wasm/plain/operations/getGammaP
  local.set $0
  i32.const 1
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 15
   i32.lt_s
   if
    local.get $0
    local.get $1
    call $src/wasm/plain/operations/getGammaP
    local.get $2
    local.get $1
    f64.convert_i32_s
    f64.add
    f64.div
    f64.add
    local.set $0
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  local.get $2
  f64.const 4.7421875
  f64.add
  f64.const 0.5
  f64.add
  local.tee $3
  local.get $2
  f64.const 0.5
  f64.add
  call $~lib/math/NativeMath.pow
  f64.const 2.5066282746310002
  f64.mul
  local.get $3
  f64.neg
  call $~lib/math/NativeMath.exp
  f64.mul
  local.get $0
  f64.mul
 )
 (func $src/wasm/plain/operations/getLgammaSeries (param $0 i32) (result f64)
  local.get $0
  i32.eqz
  if
   f64.const 1.000000000190015
   return
  end
  local.get $0
  i32.const 1
  i32.eq
  if
   f64.const 76.18009172947146
   return
  end
  local.get $0
  i32.const 2
  i32.eq
  if
   f64.const -86.50532032941678
   return
  end
  local.get $0
  i32.const 3
  i32.eq
  if
   f64.const 24.01409824083091
   return
  end
  local.get $0
  i32.const 4
  i32.eq
  if
   f64.const -1.231739572450155
   return
  end
  local.get $0
  i32.const 5
  i32.eq
  if
   f64.const 0.001208650973866179
   return
  end
  local.get $0
  i32.const 6
  i32.eq
  if
   f64.const -5.395239384953e-06
   return
  end
  f64.const 0
 )
 (func $src/wasm/plain/operations/lgamma (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 f64)
  (local $3 f64)
  local.get $0
  f64.const 0
  f64.lt
  if
   f64.const nan:0x8000000000000
   return
  end
  local.get $0
  f64.const 0
  f64.eq
  if
   f64.const inf
   return
  end
  local.get $0
  local.get $0
  f64.sub
  f64.const 0
  f64.ne
  if
   local.get $0
   return
  end
  local.get $0
  f64.const 0.5
  f64.lt
  if
   f64.const 3.141592653589793
   local.get $0
   f64.const 3.141592653589793
   f64.mul
   call $~lib/math/NativeMath.sin
   f64.div
   call $~lib/math/NativeMath.log
   f64.const 1
   local.get $0
   f64.sub
   call $src/wasm/plain/operations/lgamma
   f64.sub
   return
  end
  local.get $0
  f64.const -1
  f64.add
  local.tee $2
  f64.const 5
  f64.add
  f64.const 0.5
  f64.add
  local.set $3
  i32.const 0
  call $src/wasm/plain/operations/getLgammaSeries
  local.set $0
  i32.const 6
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 0
   i32.gt_s
   if
    local.get $0
    local.get $1
    call $src/wasm/plain/operations/getLgammaSeries
    local.get $2
    local.get $1
    f64.convert_i32_s
    f64.add
    f64.div
    f64.add
    local.set $0
    local.get $1
    i32.const 1
    i32.sub
    local.set $1
    br $for-loop|0
   end
  end
  local.get $2
  f64.const 0.5
  f64.add
  local.get $3
  call $~lib/math/NativeMath.log
  f64.mul
  f64.const 0.9189385332046728
  f64.add
  local.get $3
  f64.sub
  local.get $0
  call $~lib/math/NativeMath.log
  f64.add
 )
 (func $src/wasm/plain/operations/acos (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.acos
 )
 (func $src/wasm/plain/operations/acosh (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.mul
  f64.const -1
  f64.add
  f64.sqrt
  local.get $0
  f64.add
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/acot (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  f64.div
  call $~lib/math/NativeMath.atan
 )
 (func $src/wasm/plain/operations/acoth (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.sub
  f64.const 0
  f64.eq
  if (result f64)
   local.get $0
   f64.const 1
   f64.add
   local.get $0
   f64.div
   call $~lib/math/NativeMath.log
   local.get $0
   local.get $0
   f64.const -1
   f64.add
   f64.div
   call $~lib/math/NativeMath.log
   f64.add
   f64.const 0.5
   f64.mul
  else
   f64.const 0
  end
 )
 (func $~lib/math/NativeMath.asin (param $0 f64) (result f64)
  (local $1 i32)
  (local $2 i32)
  (local $3 f64)
  (local $4 f64)
  local.get $0
  i64.reinterpret_f64
  i64.const 32
  i64.shr_u
  i32.wrap_i64
  local.tee $2
  i32.const 2147483647
  i32.and
  local.tee $1
  i32.const 1072693248
  i32.ge_u
  if
   local.get $0
   i64.reinterpret_f64
   i32.wrap_i64
   local.get $1
   i32.const 1072693248
   i32.sub
   i32.or
   i32.eqz
   if
    local.get $0
    f64.const 1.5707963267948966
    f64.mul
    f64.const 7.52316384526264e-37
    f64.add
    return
   end
   f64.const 0
   local.get $0
   local.get $0
   f64.sub
   f64.div
   return
  end
  local.get $1
  i32.const 1071644672
  i32.lt_u
  if
   local.get $1
   i32.const 1045430272
   i32.lt_u
   local.get $1
   i32.const 1048576
   i32.ge_u
   i32.and
   if
    local.get $0
    return
   end
   local.get $0
   local.get $0
   local.get $0
   local.get $0
   f64.mul
   call $~lib/math/R
   f64.mul
   f64.add
   return
  end
  f64.const 0.5
  local.get $0
  f64.abs
  f64.const 0.5
  f64.mul
  f64.sub
  local.tee $0
  f64.sqrt
  local.set $3
  local.get $0
  call $~lib/math/R
  local.set $4
  local.get $1
  i32.const 1072640819
  i32.ge_u
  if (result f64)
   f64.const 1.5707963267948966
   local.get $3
   local.get $3
   local.get $4
   f64.mul
   f64.add
   f64.const 2
   f64.mul
   f64.const -6.123233995736766e-17
   f64.add
   f64.sub
  else
   f64.const 0.7853981633974483
   local.get $3
   local.get $3
   f64.add
   local.get $4
   f64.mul
   f64.const 6.123233995736766e-17
   local.get $0
   local.get $3
   i64.reinterpret_f64
   i64.const -4294967296
   i64.and
   f64.reinterpret_i64
   local.tee $0
   local.get $0
   f64.mul
   f64.sub
   local.get $3
   local.get $0
   f64.add
   f64.div
   f64.const 2
   f64.mul
   f64.sub
   f64.sub
   f64.const 0.7853981633974483
   local.get $0
   local.get $0
   f64.add
   f64.sub
   f64.sub
   f64.sub
  end
  local.tee $0
  f64.neg
  local.get $0
  local.get $2
  i32.const 0
  i32.lt_s
  select
 )
 (func $src/wasm/plain/operations/acsc (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  f64.div
  call $~lib/math/NativeMath.asin
 )
 (func $src/wasm/plain/operations/acsch (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  f64.div
  local.tee $0
  local.get $0
  local.get $0
  f64.mul
  f64.const 1
  f64.add
  f64.sqrt
  f64.add
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/asec (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  f64.div
  call $~lib/math/NativeMath.acos
 )
 (func $src/wasm/plain/operations/asech (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  f64.div
  local.tee $0
  local.get $0
  f64.mul
  f64.const -1
  f64.add
  f64.sqrt
  local.get $0
  f64.add
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/asin (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.asin
 )
 (func $src/wasm/plain/operations/asinh (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.mul
  f64.const 1
  f64.add
  f64.sqrt
  local.get $0
  f64.add
  call $~lib/math/NativeMath.log
 )
 (func $src/wasm/plain/operations/atan (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.atan
 )
 (func $src/wasm/plain/operations/atan2 (param $0 f64) (param $1 f64) (result f64)
  local.get $0
  local.get $1
  call $~lib/math/NativeMath.atan2
 )
 (func $src/wasm/plain/operations/atanh (param $0 f64) (result f64)
  local.get $0
  f64.const 1
  f64.add
  f64.const 1
  local.get $0
  f64.sub
  f64.div
  call $~lib/math/NativeMath.log
  f64.const 0.5
  f64.mul
 )
 (func $src/wasm/plain/operations/cos (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.cos
 )
 (func $src/wasm/plain/operations/cosh (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.exp
  local.get $0
  f64.neg
  call $~lib/math/NativeMath.exp
  f64.add
  f64.const 0.5
  f64.mul
 )
 (func $src/wasm/plain/operations/cot (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  call $~lib/math/NativeMath.tan
  f64.div
 )
 (func $src/wasm/plain/operations/coth (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.add
  call $~lib/math/NativeMath.exp
  local.tee $0
  f64.const 1
  f64.add
  local.get $0
  f64.const -1
  f64.add
  f64.div
 )
 (func $src/wasm/plain/operations/csc (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  call $~lib/math/NativeMath.sin
  f64.div
 )
 (func $src/wasm/plain/operations/csch (param $0 f64) (result f64)
  local.get $0
  f64.const 0
  f64.eq
  if (result f64)
   f64.const inf
  else
   f64.const 2
   local.get $0
   call $~lib/math/NativeMath.exp
   local.get $0
   f64.neg
   call $~lib/math/NativeMath.exp
   f64.sub
   f64.div
   f64.abs
   local.get $0
   call $src/wasm/plain/operations/sign
   f64.mul
  end
 )
 (func $src/wasm/plain/operations/sec (param $0 f64) (result f64)
  f64.const 1
  local.get $0
  call $~lib/math/NativeMath.cos
  f64.div
 )
 (func $src/wasm/plain/operations/sech (param $0 f64) (result f64)
  f64.const 2
  local.get $0
  call $~lib/math/NativeMath.exp
  local.get $0
  f64.neg
  call $~lib/math/NativeMath.exp
  f64.add
  f64.div
 )
 (func $src/wasm/plain/operations/sin (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.sin
 )
 (func $src/wasm/plain/operations/sinh (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.exp
  local.get $0
  f64.neg
  call $~lib/math/NativeMath.exp
  f64.sub
  f64.const 0.5
  f64.mul
 )
 (func $src/wasm/plain/operations/tan (param $0 f64) (result f64)
  local.get $0
  call $~lib/math/NativeMath.tan
 )
 (func $src/wasm/plain/operations/tanh (param $0 f64) (result f64)
  local.get $0
  local.get $0
  f64.add
  call $~lib/math/NativeMath.exp
  local.tee $0
  f64.const -1
  f64.add
  local.get $0
  f64.const 1
  f64.add
  f64.div
 )
 (func $src/wasm/plain/operations/isIntegerValue (param $0 f64) (result i32)
  local.get $0
  call $src/wasm/plain/operations/isInteger
 )
 (func $src/wasm/utils/workPtrValidation/eigsSymmetricWorkSize (param $0 i32) (result i32)
  local.get $0
  i32.const 4
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/powerIterationWorkSize (param $0 i32) (result i32)
  local.get $0
  i32.const 3
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/inverseIterationWorkSize (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.mul
  local.get $0
  i32.const 1
  i32.shl
  i32.add
  i32.const 3
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/expmWorkSize (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.mul
  i32.const 48
  i32.mul
 )
 (func $src/wasm/utils/workPtrValidation/sqrtmWorkSize (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.mul
  i32.const 40
  i32.mul
 )
 (func $src/wasm/utils/workPtrValidation/sqrtmNewtonSchulzWorkSize (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.mul
  i32.const 24
  i32.mul
 )
 (func $src/wasm/utils/workPtrValidation/sparseLuWorkSize (param $0 i32) (result i32)
  local.get $0
  i32.const 3
  i32.shl
  local.tee $0
  local.get $0
  i32.add
 )
 (func $src/wasm/utils/workPtrValidation/columnCountsWorkSize (param $0 i32) (result i32)
  local.get $0
  i32.const 12
  i32.mul
 )
 (func $src/wasm/utils/workPtrValidation/fft2dWorkSize (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  local.get $0
  local.get $1
  i32.gt_s
  select
  i32.const 4
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/blockedMultiplyWorkSize (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.mul
  i32.const 3
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/condWorkSize (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.mul
  i32.const 4
  i32.shl
 )
 (func $src/wasm/utils/workPtrValidation/validateWorkPtrSize (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.le_s
 )
 (func $src/wasm/utils/workPtrValidation/getWorkPtrRequirement (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  local.get $0
  i32.const 1
  i32.eq
  if
   local.get $1
   i32.const 4
   i32.shl
   return
  end
  local.get $0
  i32.const 2
  i32.eq
  if
   local.get $1
   i32.const 3
   i32.shl
   return
  end
  local.get $0
  i32.const 3
  i32.eq
  if
   local.get $1
   call $src/wasm/utils/workPtrValidation/inverseIterationWorkSize
   return
  end
  local.get $0
  i32.const 4
  i32.eq
  if
   local.get $1
   call $src/wasm/utils/workPtrValidation/inverseIterationWorkSize
   return
  end
  local.get $0
  i32.const 5
  i32.eq
  if
   local.get $1
   local.get $1
   i32.mul
   i32.const 48
   i32.mul
   return
  end
  local.get $0
  i32.const 6
  i32.eq
  if
   local.get $1
   local.get $1
   i32.mul
   i32.const 40
   i32.mul
   return
  end
  local.get $0
  i32.const 7
  i32.eq
  local.get $0
  i32.const 8
  i32.eq
  i32.or
  i32.eqz
  if
   local.get $0
   i32.const 9
   i32.eq
   if
    local.get $1
    i32.const 12
    i32.mul
    return
   end
   local.get $0
   i32.const 10
   i32.eq
   if
    local.get $1
    local.get $2
    call $src/wasm/utils/workPtrValidation/fft2dWorkSize
    return
   end
   local.get $0
   i32.const 11
   i32.eq
   if
    local.get $1
    i32.const 4
    i32.shl
    return
   end
   local.get $0
   i32.const 12
   i32.eq
   if
    local.get $1
    local.get $2
    i32.mul
    i32.const 3
    i32.shl
    return
   end
   local.get $0
   i32.const 13
   i32.eq
   if
    local.get $1
    local.get $1
    i32.mul
    i32.const 4
    i32.shl
    return
   end
   i32.const 0
   return
  end
  local.get $1
  i32.const 3
  i32.shl
  local.tee $0
  local.get $0
  i32.add
 )
 (func $src/wasm/utils/workPtrValidation/getWorkPtrRequirement@varargs (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  block $1of1
   block $0of1
    block $outOfRange
     global.get $~argumentsLength
     i32.const 2
     i32.sub
     br_table $0of1 $1of1 $outOfRange
    end
    unreachable
   end
   i32.const 0
   local.set $2
  end
  local.get $0
  local.get $1
  local.get $2
  call $src/wasm/utils/workPtrValidation/getWorkPtrRequirement
 )
 (func $~lib/rt/itcms/initLazy (param $0 i32) (result i32)
  local.get $0
  local.get $0
  i32.store offset=4
  local.get $0
  local.get $0
  i32.store offset=8
  local.get $0
 )
 (func $~lib/rt/itcms/visitRoots
  (local $0 i32)
  (local $1 i32)
  i32.const 1440
  call $~lib/rt/itcms/__visit
  i32.const 1248
  call $~lib/rt/itcms/__visit
  i32.const 1648
  call $~lib/rt/itcms/__visit
  i32.const 1712
  call $~lib/rt/itcms/__visit
  global.get $~lib/rt/itcms/pinSpace
  local.tee $1
  i32.load offset=4
  i32.const -4
  i32.and
  local.set $0
  loop $while-continue|0
   local.get $0
   local.get $1
   i32.ne
   if
    local.get $0
    i32.load offset=4
    i32.const 3
    i32.and
    i32.const 3
    i32.ne
    if
     i32.const 0
     i32.const 1312
     i32.const 160
     i32.const 16
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    i32.const 20
    i32.add
    call $~lib/rt/__visit_members
    local.get $0
    i32.load offset=4
    i32.const -4
    i32.and
    local.set $0
    br $while-continue|0
   end
  end
 )
 (func $~lib/rt/itcms/Object#set:color (param $0 i32) (param $1 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const -4
  i32.and
  local.get $1
  i32.or
  i32.store offset=4
 )
 (func $~lib/rt/itcms/Object#set:next (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  local.get $0
  i32.load offset=4
  i32.const 3
  i32.and
  i32.or
  i32.store offset=4
 )
 (func $~lib/rt/itcms/Object#unlink (param $0 i32)
  (local $1 i32)
  local.get $0
  i32.load offset=4
  i32.const -4
  i32.and
  local.tee $1
  i32.eqz
  if
   local.get $0
   i32.load offset=8
   i32.eqz
   local.get $0
   i32.const 34548
   i32.lt_u
   i32.and
   i32.eqz
   if
    i32.const 0
    i32.const 1312
    i32.const 128
    i32.const 18
    call $~lib/builtins/abort
    unreachable
   end
   return
  end
  local.get $0
  i32.load offset=8
  local.tee $0
  i32.eqz
  if
   i32.const 0
   i32.const 1312
   i32.const 132
   i32.const 16
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  local.get $0
  i32.store offset=8
  local.get $0
  local.get $1
  call $~lib/rt/itcms/Object#set:next
 )
 (func $~lib/rt/itcms/Object#linkTo (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  local.get $1
  i32.load offset=8
  local.set $3
  local.get $0
  local.get $1
  local.get $2
  i32.or
  i32.store offset=4
  local.get $0
  local.get $3
  i32.store offset=8
  local.get $3
  local.get $0
  call $~lib/rt/itcms/Object#set:next
  local.get $1
  local.get $0
  i32.store offset=8
 )
 (func $~lib/rt/itcms/Object#makeGray (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  global.get $~lib/rt/itcms/iter
  i32.eq
  if
   local.get $0
   i32.load offset=8
   local.tee $1
   i32.eqz
   if
    i32.const 0
    i32.const 1312
    i32.const 148
    i32.const 30
    call $~lib/builtins/abort
    unreachable
   end
   local.get $1
   global.set $~lib/rt/itcms/iter
  end
  local.get $0
  call $~lib/rt/itcms/Object#unlink
  global.get $~lib/rt/itcms/toSpace
  local.set $1
  local.get $0
  i32.load offset=12
  local.tee $2
  i32.const 2
  i32.le_u
  if (result i32)
   i32.const 1
  else
   local.get $2
   i32.const 1760
   i32.load
   i32.gt_u
   if
    i32.const 1440
    i32.const 1504
    i32.const 21
    i32.const 28
    call $~lib/builtins/abort
    unreachable
   end
   local.get $2
   i32.const 2
   i32.shl
   i32.const 1764
   i32.add
   i32.load
   i32.const 32
   i32.and
  end
  local.set $2
  local.get $0
  local.get $1
  global.get $~lib/rt/itcms/white
  i32.eqz
  i32.const 2
  local.get $2
  select
  call $~lib/rt/itcms/Object#linkTo
 )
 (func $~lib/rt/itcms/__visit (param $0 i32)
  local.get $0
  i32.eqz
  if
   return
  end
  global.get $~lib/rt/itcms/white
  local.get $0
  i32.const 20
  i32.sub
  local.tee $0
  i32.load offset=4
  i32.const 3
  i32.and
  i32.eq
  if
   local.get $0
   call $~lib/rt/itcms/Object#makeGray
   global.get $~lib/rt/itcms/visitCount
   i32.const 1
   i32.add
   global.set $~lib/rt/itcms/visitCount
  end
 )
 (func $~lib/rt/tlsf/removeBlock (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  i32.load
  local.tee $3
  i32.const 1
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 268
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $3
  i32.const -4
  i32.and
  local.tee $3
  i32.const 12
  i32.lt_u
  if
   i32.const 0
   i32.const 1584
   i32.const 270
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $3
  i32.const 256
  i32.lt_u
  if (result i32)
   local.get $3
   i32.const 4
   i32.shr_u
  else
   i32.const 31
   i32.const 1073741820
   local.get $3
   local.get $3
   i32.const 1073741820
   i32.ge_u
   select
   local.tee $3
   i32.clz
   i32.sub
   local.tee $4
   i32.const 7
   i32.sub
   local.set $2
   local.get $3
   local.get $4
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
  end
  local.tee $4
  i32.const 16
  i32.lt_u
  local.get $2
  i32.const 23
  i32.lt_u
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 284
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.load offset=8
  local.set $5
  local.get $1
  i32.load offset=4
  local.tee $3
  if
   local.get $3
   local.get $5
   i32.store offset=8
  end
  local.get $5
  if
   local.get $5
   local.get $3
   i32.store offset=4
  end
  local.get $1
  local.get $0
  local.get $2
  i32.const 4
  i32.shl
  local.get $4
  i32.add
  i32.const 2
  i32.shl
  i32.add
  local.tee $1
  i32.load offset=96
  i32.eq
  if
   local.get $1
   local.get $5
   i32.store offset=96
   local.get $5
   i32.eqz
   if
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    local.tee $1
    i32.load offset=4
    i32.const -2
    local.get $4
    i32.rotl
    i32.and
    local.set $3
    local.get $1
    local.get $3
    i32.store offset=4
    local.get $3
    i32.eqz
    if
     local.get $0
     local.get $0
     i32.load
     i32.const -2
     local.get $2
     i32.rotl
     i32.and
     i32.store
    end
   end
  end
 )
 (func $~lib/rt/tlsf/insertBlock (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $1
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 201
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.load
  local.tee $3
  i32.const 1
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 203
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 4
  i32.add
  local.get $1
  i32.load
  i32.const -4
  i32.and
  i32.add
  local.tee $4
  i32.load
  local.tee $2
  i32.const 1
  i32.and
  if
   local.get $0
   local.get $4
   call $~lib/rt/tlsf/removeBlock
   local.get $1
   local.get $3
   i32.const 4
   i32.add
   local.get $2
   i32.const -4
   i32.and
   i32.add
   local.tee $3
   i32.store
   local.get $1
   i32.const 4
   i32.add
   local.get $1
   i32.load
   i32.const -4
   i32.and
   i32.add
   local.tee $4
   i32.load
   local.set $2
  end
  local.get $3
  i32.const 2
  i32.and
  if
   local.get $1
   i32.const 4
   i32.sub
   i32.load
   local.tee $1
   i32.load
   local.tee $6
   i32.const 1
   i32.and
   i32.eqz
   if
    i32.const 0
    i32.const 1584
    i32.const 221
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
   local.get $0
   local.get $1
   call $~lib/rt/tlsf/removeBlock
   local.get $1
   local.get $6
   i32.const 4
   i32.add
   local.get $3
   i32.const -4
   i32.and
   i32.add
   local.tee $3
   i32.store
  end
  local.get $4
  local.get $2
  i32.const 2
  i32.or
  i32.store
  local.get $3
  i32.const -4
  i32.and
  local.tee $2
  i32.const 12
  i32.lt_u
  if
   i32.const 0
   i32.const 1584
   i32.const 233
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $4
  local.get $1
  i32.const 4
  i32.add
  local.get $2
  i32.add
  i32.ne
  if
   i32.const 0
   i32.const 1584
   i32.const 234
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $4
  i32.const 4
  i32.sub
  local.get $1
  i32.store
  local.get $2
  i32.const 256
  i32.lt_u
  if (result i32)
   local.get $2
   i32.const 4
   i32.shr_u
  else
   i32.const 31
   i32.const 1073741820
   local.get $2
   local.get $2
   i32.const 1073741820
   i32.ge_u
   select
   local.tee $2
   i32.clz
   i32.sub
   local.tee $3
   i32.const 7
   i32.sub
   local.set $5
   local.get $2
   local.get $3
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
  end
  local.tee $2
  i32.const 16
  i32.lt_u
  local.get $5
  i32.const 23
  i32.lt_u
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 251
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $5
  i32.const 4
  i32.shl
  local.get $2
  i32.add
  i32.const 2
  i32.shl
  i32.add
  i32.load offset=96
  local.set $3
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  local.get $3
  i32.store offset=8
  local.get $3
  if
   local.get $3
   local.get $1
   i32.store offset=4
  end
  local.get $0
  local.get $5
  i32.const 4
  i32.shl
  local.get $2
  i32.add
  i32.const 2
  i32.shl
  i32.add
  local.get $1
  i32.store offset=96
  local.get $0
  local.get $0
  i32.load
  i32.const 1
  local.get $5
  i32.shl
  i32.or
  i32.store
  local.get $0
  local.get $5
  i32.const 2
  i32.shl
  i32.add
  local.tee $0
  local.get $0
  i32.load offset=4
  i32.const 1
  local.get $2
  i32.shl
  i32.or
  i32.store offset=4
 )
 (func $~lib/rt/tlsf/addMemory (param $0 i32) (param $1 i32) (param $2 i64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  local.get $1
  i64.extend_i32_u
  i64.lt_u
  if
   i32.const 0
   i32.const 1584
   i32.const 382
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.set $1
  local.get $0
  i32.load offset=1568
  local.tee $3
  if
   local.get $3
   i32.const 4
   i32.add
   local.get $1
   i32.gt_u
   if
    i32.const 0
    i32.const 1584
    i32.const 389
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
   local.get $1
   i32.const 16
   i32.sub
   local.tee $5
   local.get $3
   i32.eq
   if
    local.get $3
    i32.load
    local.set $4
    local.get $5
    local.set $1
   end
  else
   local.get $0
   i32.const 1572
   i32.add
   local.get $1
   i32.gt_u
   if
    i32.const 0
    i32.const 1584
    i32.const 402
    i32.const 5
    call $~lib/builtins/abort
    unreachable
   end
  end
  local.get $2
  i32.wrap_i64
  i32.const -16
  i32.and
  local.get $1
  i32.sub
  local.tee $3
  i32.const 20
  i32.lt_u
  if
   return
  end
  local.get $1
  local.get $4
  i32.const 2
  i32.and
  local.get $3
  i32.const 8
  i32.sub
  local.tee $3
  i32.const 1
  i32.or
  i32.or
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $1
  i32.const 4
  i32.add
  local.get $3
  i32.add
  local.tee $3
  i32.const 2
  i32.store
  local.get $0
  local.get $3
  i32.store offset=1568
  local.get $0
  local.get $1
  call $~lib/rt/tlsf/insertBlock
 )
 (func $~lib/rt/tlsf/initialize
  (local $0 i32)
  (local $1 i32)
  memory.size
  local.tee $0
  i32.const 0
  i32.le_s
  if (result i32)
   i32.const 1
   local.get $0
   i32.sub
   memory.grow
   i32.const 0
   i32.lt_s
  else
   i32.const 0
  end
  if
   unreachable
  end
  i32.const 34560
  i32.const 0
  i32.store
  i32.const 36128
  i32.const 0
  i32.store
  loop $for-loop|0
   local.get $1
   i32.const 23
   i32.lt_u
   if
    local.get $1
    i32.const 2
    i32.shl
    i32.const 34560
    i32.add
    i32.const 0
    i32.store offset=4
    i32.const 0
    local.set $0
    loop $for-loop|1
     local.get $0
     i32.const 16
     i32.lt_u
     if
      local.get $1
      i32.const 4
      i32.shl
      local.get $0
      i32.add
      i32.const 2
      i32.shl
      i32.const 34560
      i32.add
      i32.const 0
      i32.store offset=96
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|1
     end
    end
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const 34560
  i32.const 36132
  memory.size
  i64.extend_i32_s
  i64.const 16
  i64.shl
  call $~lib/rt/tlsf/addMemory
  i32.const 34560
  global.set $~lib/rt/tlsf/ROOT
 )
 (func $~lib/rt/itcms/step (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  block $break|0
   block $case2|0
    block $case1|0
     block $case0|0
      global.get $~lib/rt/itcms/state
      br_table $case0|0 $case1|0 $case2|0 $break|0
     end
     i32.const 1
     global.set $~lib/rt/itcms/state
     i32.const 0
     global.set $~lib/rt/itcms/visitCount
     call $~lib/rt/itcms/visitRoots
     global.get $~lib/rt/itcms/toSpace
     global.set $~lib/rt/itcms/iter
     global.get $~lib/rt/itcms/visitCount
     return
    end
    global.get $~lib/rt/itcms/white
    i32.eqz
    local.set $1
    global.get $~lib/rt/itcms/iter
    i32.load offset=4
    i32.const -4
    i32.and
    local.set $0
    loop $while-continue|1
     local.get $0
     global.get $~lib/rt/itcms/toSpace
     i32.ne
     if
      local.get $0
      global.set $~lib/rt/itcms/iter
      local.get $1
      local.get $0
      i32.load offset=4
      i32.const 3
      i32.and
      i32.ne
      if
       local.get $0
       local.get $1
       call $~lib/rt/itcms/Object#set:color
       i32.const 0
       global.set $~lib/rt/itcms/visitCount
       local.get $0
       i32.const 20
       i32.add
       call $~lib/rt/__visit_members
       global.get $~lib/rt/itcms/visitCount
       return
      end
      local.get $0
      i32.load offset=4
      i32.const -4
      i32.and
      local.set $0
      br $while-continue|1
     end
    end
    i32.const 0
    global.set $~lib/rt/itcms/visitCount
    call $~lib/rt/itcms/visitRoots
    global.get $~lib/rt/itcms/toSpace
    global.get $~lib/rt/itcms/iter
    i32.load offset=4
    i32.const -4
    i32.and
    i32.eq
    if
     i32.const 34548
     local.set $0
     loop $while-continue|0
      local.get $0
      i32.const 34548
      i32.lt_u
      if
       local.get $0
       i32.load
       call $~lib/rt/itcms/__visit
       local.get $0
       i32.const 4
       i32.add
       local.set $0
       br $while-continue|0
      end
     end
     global.get $~lib/rt/itcms/iter
     i32.load offset=4
     i32.const -4
     i32.and
     local.set $0
     loop $while-continue|2
      local.get $0
      global.get $~lib/rt/itcms/toSpace
      i32.ne
      if
       local.get $1
       local.get $0
       i32.load offset=4
       i32.const 3
       i32.and
       i32.ne
       if
        local.get $0
        local.get $1
        call $~lib/rt/itcms/Object#set:color
        local.get $0
        i32.const 20
        i32.add
        call $~lib/rt/__visit_members
       end
       local.get $0
       i32.load offset=4
       i32.const -4
       i32.and
       local.set $0
       br $while-continue|2
      end
     end
     global.get $~lib/rt/itcms/fromSpace
     local.set $0
     global.get $~lib/rt/itcms/toSpace
     global.set $~lib/rt/itcms/fromSpace
     local.get $0
     global.set $~lib/rt/itcms/toSpace
     local.get $1
     global.set $~lib/rt/itcms/white
     local.get $0
     i32.load offset=4
     i32.const -4
     i32.and
     global.set $~lib/rt/itcms/iter
     i32.const 2
     global.set $~lib/rt/itcms/state
    end
    global.get $~lib/rt/itcms/visitCount
    return
   end
   global.get $~lib/rt/itcms/iter
   local.tee $0
   global.get $~lib/rt/itcms/toSpace
   i32.ne
   if
    local.get $0
    i32.load offset=4
    i32.const -4
    i32.and
    global.set $~lib/rt/itcms/iter
    global.get $~lib/rt/itcms/white
    i32.eqz
    local.get $0
    i32.load offset=4
    i32.const 3
    i32.and
    i32.ne
    if
     i32.const 0
     i32.const 1312
     i32.const 229
     i32.const 20
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    i32.const 34548
    i32.lt_u
    if
     local.get $0
     i32.const 0
     i32.store offset=4
     local.get $0
     i32.const 0
     i32.store offset=8
    else
     global.get $~lib/rt/itcms/total
     local.get $0
     i32.load
     i32.const -4
     i32.and
     i32.const 4
     i32.add
     i32.sub
     global.set $~lib/rt/itcms/total
     local.get $0
     i32.const 4
     i32.add
     local.tee $1
     i32.const 34548
     i32.ge_u
     if
      global.get $~lib/rt/tlsf/ROOT
      i32.eqz
      if
       call $~lib/rt/tlsf/initialize
      end
      global.get $~lib/rt/tlsf/ROOT
      local.get $1
      i32.const 4
      i32.sub
      local.set $0
      local.get $1
      i32.const 15
      i32.and
      i32.const 1
      local.get $1
      select
      if (result i32)
       i32.const 1
      else
       local.get $0
       i32.load
       i32.const 1
       i32.and
      end
      if
       i32.const 0
       i32.const 1584
       i32.const 562
       i32.const 3
       call $~lib/builtins/abort
       unreachable
      end
      local.get $0
      local.get $0
      i32.load
      i32.const 1
      i32.or
      i32.store
      local.get $0
      call $~lib/rt/tlsf/insertBlock
     end
    end
    i32.const 10
    return
   end
   global.get $~lib/rt/itcms/toSpace
   global.get $~lib/rt/itcms/toSpace
   i32.store offset=4
   global.get $~lib/rt/itcms/toSpace
   global.get $~lib/rt/itcms/toSpace
   i32.store offset=8
   i32.const 0
   global.set $~lib/rt/itcms/state
  end
  i32.const 0
 )
 (func $~lib/rt/tlsf/roundSize (param $0 i32) (result i32)
  local.get $0
  i32.const 536870910
  i32.lt_u
  if (result i32)
   local.get $0
   i32.const 1
   i32.const 27
   local.get $0
   i32.clz
   i32.sub
   i32.shl
   i32.add
   i32.const 1
   i32.sub
  else
   local.get $0
  end
 )
 (func $~lib/rt/tlsf/searchBlock (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.const 256
  i32.lt_u
  if (result i32)
   local.get $1
   i32.const 4
   i32.shr_u
  else
   i32.const 31
   local.get $1
   call $~lib/rt/tlsf/roundSize
   local.tee $1
   i32.clz
   i32.sub
   local.tee $3
   i32.const 7
   i32.sub
   local.set $2
   local.get $1
   local.get $3
   i32.const 4
   i32.sub
   i32.shr_u
   i32.const 16
   i32.xor
  end
  local.tee $1
  i32.const 16
  i32.lt_u
  local.get $2
  i32.const 23
  i32.lt_u
  i32.and
  i32.eqz
  if
   i32.const 0
   i32.const 1584
   i32.const 334
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  i32.load offset=4
  i32.const -1
  local.get $1
  i32.shl
  i32.and
  local.tee $1
  if (result i32)
   local.get $0
   local.get $1
   i32.ctz
   local.get $2
   i32.const 4
   i32.shl
   i32.add
   i32.const 2
   i32.shl
   i32.add
   i32.load offset=96
  else
   local.get $0
   i32.load
   i32.const -1
   local.get $2
   i32.const 1
   i32.add
   i32.shl
   i32.and
   local.tee $1
   if (result i32)
    local.get $0
    local.get $1
    i32.ctz
    local.tee $1
    i32.const 2
    i32.shl
    i32.add
    i32.load offset=4
    local.tee $2
    i32.eqz
    if
     i32.const 0
     i32.const 1584
     i32.const 347
     i32.const 18
     call $~lib/builtins/abort
     unreachable
    end
    local.get $0
    local.get $2
    i32.ctz
    local.get $1
    i32.const 4
    i32.shl
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load offset=96
   else
    i32.const 0
   end
  end
 )
 (func $~lib/rt/tlsf/allocateBlock (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 1248
   i32.const 1584
   i32.const 461
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 12
  local.get $1
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.get $1
  i32.const 12
  i32.le_u
  select
  local.tee $1
  call $~lib/rt/tlsf/searchBlock
  local.tee $2
  i32.eqz
  if
   local.get $1
   i32.const 256
   i32.ge_u
   if (result i32)
    local.get $1
    call $~lib/rt/tlsf/roundSize
   else
    local.get $1
   end
   local.set $2
   memory.size
   local.tee $3
   local.get $2
   i32.const 4
   local.get $0
   i32.load offset=1568
   local.get $3
   i32.const 16
   i32.shl
   i32.const 4
   i32.sub
   i32.ne
   i32.shl
   i32.add
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $2
   local.get $2
   local.get $3
   i32.lt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $2
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
   local.get $0
   local.get $3
   i32.const 16
   i32.shl
   memory.size
   i64.extend_i32_s
   i64.const 16
   i64.shl
   call $~lib/rt/tlsf/addMemory
   local.get $0
   local.get $1
   call $~lib/rt/tlsf/searchBlock
   local.tee $2
   i32.eqz
   if
    i32.const 0
    i32.const 1584
    i32.const 499
    i32.const 16
    call $~lib/builtins/abort
    unreachable
   end
  end
  local.get $1
  local.get $2
  i32.load
  i32.const -4
  i32.and
  i32.gt_u
  if
   i32.const 0
   i32.const 1584
   i32.const 501
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  local.get $2
  call $~lib/rt/tlsf/removeBlock
  local.get $2
  i32.load
  local.set $3
  local.get $1
  i32.const 4
  i32.add
  i32.const 15
  i32.and
  if
   i32.const 0
   i32.const 1584
   i32.const 361
   i32.const 14
   call $~lib/builtins/abort
   unreachable
  end
  local.get $3
  i32.const -4
  i32.and
  local.get $1
  i32.sub
  local.tee $4
  i32.const 16
  i32.ge_u
  if
   local.get $2
   local.get $1
   local.get $3
   i32.const 2
   i32.and
   i32.or
   i32.store
   local.get $2
   i32.const 4
   i32.add
   local.get $1
   i32.add
   local.tee $1
   local.get $4
   i32.const 4
   i32.sub
   i32.const 1
   i32.or
   i32.store
   local.get $0
   local.get $1
   call $~lib/rt/tlsf/insertBlock
  else
   local.get $2
   local.get $3
   i32.const -2
   i32.and
   i32.store
   local.get $2
   i32.const 4
   i32.add
   local.get $2
   i32.load
   i32.const -4
   i32.and
   i32.add
   local.tee $0
   local.get $0
   i32.load
   i32.const -3
   i32.and
   i32.store
  end
  local.get $2
 )
 (func $~lib/rt/itcms/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  i32.const 1073741804
  i32.ge_u
  if
   i32.const 1248
   i32.const 1312
   i32.const 261
   i32.const 31
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/itcms/total
  global.get $~lib/rt/itcms/threshold
  i32.ge_u
  if
   block $__inlined_func$~lib/rt/itcms/interrupt$82
    i32.const 2048
    local.set $2
    loop $do-loop|0
     local.get $2
     call $~lib/rt/itcms/step
     i32.sub
     local.set $2
     global.get $~lib/rt/itcms/state
     i32.eqz
     if
      global.get $~lib/rt/itcms/total
      i64.extend_i32_u
      i64.const 200
      i64.mul
      i64.const 100
      i64.div_u
      i32.wrap_i64
      i32.const 1024
      i32.add
      global.set $~lib/rt/itcms/threshold
      br $__inlined_func$~lib/rt/itcms/interrupt$82
     end
     local.get $2
     i32.const 0
     i32.gt_s
     br_if $do-loop|0
    end
    global.get $~lib/rt/itcms/total
    global.get $~lib/rt/itcms/total
    global.get $~lib/rt/itcms/threshold
    i32.sub
    i32.const 1024
    i32.lt_u
    i32.const 10
    i32.shl
    i32.add
    global.set $~lib/rt/itcms/threshold
   end
  end
  global.get $~lib/rt/tlsf/ROOT
  i32.eqz
  if
   call $~lib/rt/tlsf/initialize
  end
  global.get $~lib/rt/tlsf/ROOT
  local.get $0
  i32.const 16
  i32.add
  call $~lib/rt/tlsf/allocateBlock
  local.tee $2
  local.get $1
  i32.store offset=12
  local.get $2
  local.get $0
  i32.store offset=16
  local.get $2
  global.get $~lib/rt/itcms/fromSpace
  global.get $~lib/rt/itcms/white
  call $~lib/rt/itcms/Object#linkTo
  global.get $~lib/rt/itcms/total
  local.get $2
  i32.load
  i32.const -4
  i32.and
  i32.const 4
  i32.add
  i32.add
  global.set $~lib/rt/itcms/total
  local.get $2
  i32.const 20
  i32.add
  local.tee $1
  i32.const 0
  local.get $0
  memory.fill
  local.get $1
 )
 (func $~lib/rt/itcms/__pin (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  if
   local.get $0
   i32.const 20
   i32.sub
   local.tee $1
   i32.load offset=4
   i32.const 3
   i32.and
   i32.const 3
   i32.eq
   if
    i32.const 1648
    i32.const 1312
    i32.const 338
    i32.const 7
    call $~lib/builtins/abort
    unreachable
   end
   local.get $1
   call $~lib/rt/itcms/Object#unlink
   local.get $1
   global.get $~lib/rt/itcms/pinSpace
   i32.const 3
   call $~lib/rt/itcms/Object#linkTo
  end
  local.get $0
 )
 (func $~lib/rt/itcms/__unpin (param $0 i32)
  local.get $0
  i32.eqz
  if
   return
  end
  local.get $0
  i32.const 20
  i32.sub
  local.tee $0
  i32.load offset=4
  i32.const 3
  i32.and
  i32.const 3
  i32.ne
  if
   i32.const 1712
   i32.const 1312
   i32.const 352
   i32.const 5
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/itcms/state
  i32.const 1
  i32.eq
  if
   local.get $0
   call $~lib/rt/itcms/Object#makeGray
  else
   local.get $0
   call $~lib/rt/itcms/Object#unlink
   local.get $0
   global.get $~lib/rt/itcms/fromSpace
   global.get $~lib/rt/itcms/white
   call $~lib/rt/itcms/Object#linkTo
  end
 )
 (func $~lib/rt/itcms/__collect
  global.get $~lib/rt/itcms/state
  i32.const 0
  i32.gt_s
  if
   loop $while-continue|0
    global.get $~lib/rt/itcms/state
    if
     call $~lib/rt/itcms/step
     drop
     br $while-continue|0
    end
   end
  end
  call $~lib/rt/itcms/step
  drop
  loop $while-continue|1
   global.get $~lib/rt/itcms/state
   if
    call $~lib/rt/itcms/step
    drop
    br $while-continue|1
   end
  end
  global.get $~lib/rt/itcms/total
  i64.extend_i32_u
  i64.const 200
  i64.mul
  i64.const 100
  i64.div_u
  i32.wrap_i64
  i32.const 1024
  i32.add
  global.set $~lib/rt/itcms/threshold
 )
 (func $~lib/rt/__visit_members (param $0 i32)
  block $invalid
   block $~lib/arraybuffer/ArrayBufferView
    block $~lib/string/String
     block $~lib/arraybuffer/ArrayBuffer
      block $~lib/object/Object
       local.get $0
       i32.const 8
       i32.sub
       i32.load
       br_table $~lib/object/Object $~lib/arraybuffer/ArrayBuffer $~lib/string/String $~lib/arraybuffer/ArrayBufferView $invalid
      end
      return
     end
     return
    end
    return
   end
   local.get $0
   i32.load
   call $~lib/rt/itcms/__visit
   return
  end
  unreachable
 )
 (func $~setArgumentsLength (param $0 i32)
  local.get $0
  global.set $~argumentsLength
 )
 (func $~start
  global.get $~started
  if
   return
  end
  i32.const 1
  global.set $~started
  memory.size
  i32.const 16
  i32.shl
  i32.const 34548
  i32.sub
  i32.const 1
  i32.shr_u
  global.set $~lib/rt/itcms/threshold
  i32.const 1360
  call $~lib/rt/itcms/initLazy
  global.set $~lib/rt/itcms/pinSpace
  i32.const 1392
  call $~lib/rt/itcms/initLazy
  global.set $~lib/rt/itcms/toSpace
  i32.const 1536
  call $~lib/rt/itcms/initLazy
  global.set $~lib/rt/itcms/fromSpace
 )
)
