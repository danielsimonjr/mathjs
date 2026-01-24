/** Exported memory */
export declare const memory: WebAssembly.Memory;
// Exported runtime interface
export declare function __new(size: number, id: number): number;
export declare function __pin(ptr: number): number;
export declare function __unpin(ptr: number): void;
export declare function __collect(): void;
export declare const __rtti_base: number;
/**
 * src/wasm/matrix/multiply/multiplyDense
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param bPtr `usize`
 * @param bRows `i32`
 * @param bCols `i32`
 * @param resultPtr `usize`
 */
export declare function multiplyDense(aPtr: number, aRows: number, aCols: number, bPtr: number, bRows: number, bCols: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/multiplyDenseSIMD
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param bPtr `usize`
 * @param bRows `i32`
 * @param bCols `i32`
 * @param resultPtr `usize`
 */
export declare function multiplyDenseSIMD(aPtr: number, aRows: number, aCols: number, bPtr: number, bRows: number, bCols: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/multiplyVector
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param xPtr `usize`
 * @param resultPtr `usize`
 */
export declare function multiplyVector(aPtr: number, aRows: number, aCols: number, xPtr: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/transpose
 * @param aPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @param resultPtr `usize`
 */
export declare function transpose(aPtr: number, rows: number, cols: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/add
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function add(aPtr: number, bPtr: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/subtract
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function subtract(aPtr: number, bPtr: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/scalarMultiply
 * @param aPtr `usize`
 * @param scalar `f64`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function scalarMultiply(aPtr: number, scalar: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/dotProduct
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @returns `f64`
 */
export declare function dotProduct(aPtr: number, bPtr: number, size: number): number;
/**
 * src/wasm/matrix/multiply/multiplyBlockedSIMD
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param bPtr `usize`
 * @param bRows `i32`
 * @param bCols `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 */
export declare function multiplyBlockedSIMD(aPtr: number, aRows: number, aCols: number, bPtr: number, bRows: number, bCols: number, resultPtr: number, workPtr: number): void;
/**
 * src/wasm/matrix/multiply/addSIMD
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function addSIMD(aPtr: number, bPtr: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/subtractSIMD
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function subtractSIMD(aPtr: number, bPtr: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/scalarMultiplySIMD
 * @param aPtr `usize`
 * @param scalar `f64`
 * @param size `i32`
 * @param resultPtr `usize`
 */
export declare function scalarMultiplySIMD(aPtr: number, scalar: number, size: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/dotProductSIMD
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param size `i32`
 * @returns `f64`
 */
export declare function dotProductSIMD(aPtr: number, bPtr: number, size: number): number;
/**
 * src/wasm/matrix/multiply/multiplyVectorSIMD
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param xPtr `usize`
 * @param resultPtr `usize`
 */
export declare function multiplyVectorSIMD(aPtr: number, aRows: number, aCols: number, xPtr: number, resultPtr: number): void;
/**
 * src/wasm/matrix/multiply/transposeSIMD
 * @param aPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @param resultPtr `usize`
 */
export declare function transposeSIMD(aPtr: number, rows: number, cols: number, resultPtr: number): void;
/**
 * src/wasm/algebra/decomposition/luDecomposition
 * @param aPtr `usize`
 * @param n `i32`
 * @param permPtr `usize`
 * @returns `i32`
 */
export declare function luDecomposition(aPtr: number, n: number, permPtr: number): number;
/**
 * src/wasm/algebra/decomposition/qrDecomposition
 * @param aPtr `usize`
 * @param m `i32`
 * @param n `i32`
 * @param qPtr `usize`
 */
export declare function qrDecomposition(aPtr: number, m: number, n: number, qPtr: number): void;
/**
 * src/wasm/algebra/decomposition/choleskyDecomposition
 * @param aPtr `usize`
 * @param n `i32`
 * @param lPtr `usize`
 * @returns `i32`
 */
export declare function choleskyDecomposition(aPtr: number, n: number, lPtr: number): number;
/**
 * src/wasm/algebra/decomposition/luSolve
 * @param luPtr `usize`
 * @param n `i32`
 * @param permPtr `usize`
 * @param bPtr `usize`
 * @param xPtr `usize`
 */
export declare function luSolve(luPtr: number, n: number, permPtr: number, bPtr: number, xPtr: number): void;
/**
 * src/wasm/algebra/decomposition/luDeterminant
 * @param luPtr `usize`
 * @param n `i32`
 * @param permPtr `usize`
 * @returns `f64`
 */
export declare function luDeterminant(luPtr: number, n: number, permPtr: number): number;
/**
 * src/wasm/algebra/decomposition/luDecompositionSIMD
 * @param aPtr `usize`
 * @param n `i32`
 * @param permPtr `usize`
 * @returns `i32`
 */
export declare function luDecompositionSIMD(aPtr: number, n: number, permPtr: number): number;
/**
 * src/wasm/algebra/decomposition/qrDecompositionSIMD
 * @param aPtr `usize`
 * @param m `i32`
 * @param n `i32`
 * @param qPtr `usize`
 */
export declare function qrDecompositionSIMD(aPtr: number, m: number, n: number, qPtr: number): void;
/**
 * src/wasm/algebra/decomposition/choleskyDecompositionSIMD
 * @param aPtr `usize`
 * @param n `i32`
 * @param lPtr `usize`
 * @returns `i32`
 */
export declare function choleskyDecompositionSIMD(aPtr: number, n: number, lPtr: number): number;
/**
 * src/wasm/signal/fft/fft
 * @param dataPtr `usize`
 * @param n `i32`
 * @param inverse `i32`
 */
export declare function fft(dataPtr: number, n: number, inverse: number): void;
/**
 * src/wasm/signal/fft/fft2d
 * @param dataPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @param inverse `i32`
 * @param workPtr `usize`
 */
export declare function fft2d(dataPtr: number, rows: number, cols: number, inverse: number, workPtr: number): void;
/**
 * src/wasm/signal/fft/convolve
 * @param signalPtr `usize`
 * @param n `i32`
 * @param kernelPtr `usize`
 * @param m `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @param size `i32`
 */
export declare function convolve(signalPtr: number, n: number, kernelPtr: number, m: number, resultPtr: number, workPtr: number, size: number): void;
/**
 * src/wasm/signal/fft/rfft
 * @param dataPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function rfft(dataPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/fft/irfft
 * @param dataPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 */
export declare function irfft(dataPtr: number, n: number, resultPtr: number, workPtr: number): void;
/**
 * src/wasm/signal/fft/isPowerOf2
 * @param n `i32`
 * @returns `i32`
 */
export declare function isPowerOf2(n: number): number;
/**
 * src/wasm/signal/fft/fftSIMD
 * @param dataPtr `usize`
 * @param n `i32`
 * @param inverse `i32`
 */
export declare function fftSIMD(dataPtr: number, n: number, inverse: number): void;
/**
 * src/wasm/signal/fft/convolveSIMD
 * @param signalPtr `usize`
 * @param n `i32`
 * @param kernelPtr `usize`
 * @param m `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @param size `i32`
 */
export declare function convolveSIMD(signalPtr: number, n: number, kernelPtr: number, m: number, resultPtr: number, workPtr: number, size: number): void;
/**
 * src/wasm/signal/fft/powerSpectrumSIMD
 * @param dataPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function powerSpectrumSIMD(dataPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/fft/crossCorrelationSIMD
 * @param aPtr `usize`
 * @param n `i32`
 * @param bPtr `usize`
 * @param m `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @param size `i32`
 */
export declare function crossCorrelationSIMD(aPtr: number, n: number, bPtr: number, m: number, resultPtr: number, workPtr: number, size: number): void;
/**
 * src/wasm/signal/processing/freqz
 * @param bPtr `usize`
 * @param bLen `i32`
 * @param aPtr `usize`
 * @param aLen `i32`
 * @param wPtr `usize`
 * @param wLen `i32`
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 */
export declare function freqz(bPtr: number, bLen: number, aPtr: number, aLen: number, wPtr: number, wLen: number, hRealPtr: number, hImagPtr: number): void;
/**
 * src/wasm/signal/processing/freqzUniform
 * @param bPtr `usize`
 * @param bLen `i32`
 * @param aPtr `usize`
 * @param aLen `i32`
 * @param n `i32`
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 */
export declare function freqzUniform(bPtr: number, bLen: number, aPtr: number, aLen: number, n: number, hRealPtr: number, hImagPtr: number): void;
/**
 * src/wasm/signal/processing/polyMultiply
 * @param aRealPtr `usize`
 * @param aImagPtr `usize`
 * @param aLen `i32`
 * @param bRealPtr `usize`
 * @param bImagPtr `usize`
 * @param bLen `i32`
 * @param cRealPtr `usize`
 * @param cImagPtr `usize`
 */
export declare function polyMultiply(aRealPtr: number, aImagPtr: number, aLen: number, bRealPtr: number, bImagPtr: number, bLen: number, cRealPtr: number, cImagPtr: number): void;
/**
 * src/wasm/signal/processing/zpk2tf
 * @param zRealPtr `usize`
 * @param zImagPtr `usize`
 * @param zLen `i32`
 * @param pRealPtr `usize`
 * @param pImagPtr `usize`
 * @param pLen `i32`
 * @param k `f64`
 * @param numRealPtr `usize`
 * @param numImagPtr `usize`
 * @param denRealPtr `usize`
 * @param denImagPtr `usize`
 * @param workPtr `usize`
 */
export declare function zpk2tf(zRealPtr: number, zImagPtr: number, zLen: number, pRealPtr: number, pImagPtr: number, pLen: number, k: number, numRealPtr: number, numImagPtr: number, denRealPtr: number, denImagPtr: number, workPtr: number): void;
/**
 * src/wasm/signal/processing/magnitude
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function magnitude(hRealPtr: number, hImagPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/processing/magnitudeDb
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function magnitudeDb(hRealPtr: number, hImagPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/processing/phase
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function phase(hRealPtr: number, hImagPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/processing/unwrapPhase
 * @param phaseInPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function unwrapPhase(phaseInPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/signal/processing/groupDelay
 * @param hRealPtr `usize`
 * @param hImagPtr `usize`
 * @param wPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 */
export declare function groupDelay(hRealPtr: number, hImagPtr: number, wPtr: number, n: number, resultPtr: number, workPtr: number): void;
/**
 * src/wasm/numeric/ode/rk45Step
 * @param yPtr `usize`
 * @param t `f64`
 * @param h `f64`
 * @param n `i32`
 * @param kPtr `usize`
 * @param yNextPtr `usize`
 * @param yErrorPtr `usize`
 */
export declare function rk45Step(yPtr: number, t: number, h: number, n: number, kPtr: number, yNextPtr: number, yErrorPtr: number): void;
/**
 * src/wasm/numeric/ode/rk23Step
 * @param yPtr `usize`
 * @param t `f64`
 * @param h `f64`
 * @param n `i32`
 * @param kPtr `usize`
 * @param yNextPtr `usize`
 * @param yErrorPtr `usize`
 */
export declare function rk23Step(yPtr: number, t: number, h: number, n: number, kPtr: number, yNextPtr: number, yErrorPtr: number): void;
/**
 * src/wasm/numeric/ode/maxError
 * @param errorPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function maxError(errorPtr: number, n: number): number;
/**
 * src/wasm/numeric/ode/computeStepAdjustment
 * @param error `f64`
 * @param tolerance `f64`
 * @param order `i32`
 * @param minDelta `f64`
 * @param maxDelta `f64`
 * @returns `f64`
 */
export declare function computeStepAdjustment(error: number, tolerance: number, order: number, minDelta: number, maxDelta: number): number;
/**
 * src/wasm/numeric/ode/interpolate
 * @param y0Ptr `usize`
 * @param y1Ptr `usize`
 * @param t0 `f64`
 * @param t1 `f64`
 * @param t `f64`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function interpolate(y0Ptr: number, y1Ptr: number, t0: number, t1: number, t: number, n: number, resultPtr: number): void;
/**
 * src/wasm/numeric/ode/vectorCopy
 * @param srcPtr `usize`
 * @param n `i32`
 * @param dstPtr `usize`
 */
export declare function vectorCopy(srcPtr: number, n: number, dstPtr: number): void;
/**
 * src/wasm/numeric/ode/vectorScale
 * @param vecPtr `usize`
 * @param scale `f64`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function vectorScale(vecPtr: number, scale: number, n: number, resultPtr: number): void;
/**
 * src/wasm/numeric/ode/vectorAdd
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function vectorAdd(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/numeric/ode/wouldOvershoot
 * @param t `f64`
 * @param tf `f64`
 * @param h `f64`
 * @param forward `i32`
 * @returns `i32`
 */
export declare function wouldOvershoot(t: number, tf: number, h: number, forward: number): number;
/**
 * src/wasm/numeric/ode/trimStep
 * @param t `f64`
 * @param tf `f64`
 * @param h `f64`
 * @param forward `i32`
 * @returns `f64`
 */
export declare function trimStep(t: number, tf: number, h: number, forward: number): number;
/**
 * src/wasm/complex/operations/arg
 * @param re `f64`
 * @param im `f64`
 * @returns `f64`
 */
export declare function arg(re: number, im: number): number;
/**
 * src/wasm/complex/operations/argArray
 * @param dataPtr `usize`
 * @param len `i32`
 * @param resultPtr `usize`
 */
export declare function argArray(dataPtr: number, len: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/conj
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function conj(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/conjArray
 * @param dataPtr `usize`
 * @param len `i32`
 * @param resultPtr `usize`
 */
export declare function conjArray(dataPtr: number, len: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/re
 * @param re `f64`
 * @param im `f64`
 * @returns `f64`
 */
export declare function re(re: number, im: number): number;
/**
 * src/wasm/complex/operations/reArray
 * @param dataPtr `usize`
 * @param len `i32`
 * @param resultPtr `usize`
 */
export declare function reArray(dataPtr: number, len: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/im
 * @param re `f64`
 * @param im `f64`
 * @returns `f64`
 */
export declare function im(re: number, im: number): number;
/**
 * src/wasm/complex/operations/imArray
 * @param dataPtr `usize`
 * @param len `i32`
 * @param resultPtr `usize`
 */
export declare function imArray(dataPtr: number, len: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/abs
 * @param re `f64`
 * @param im `f64`
 * @returns `f64`
 */
export declare function abs(re: number, im: number): number;
/**
 * src/wasm/complex/operations/absArray
 * @param dataPtr `usize`
 * @param len `i32`
 * @param resultPtr `usize`
 */
export declare function absArray(dataPtr: number, len: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/addComplex
 * @param re1 `f64`
 * @param im1 `f64`
 * @param re2 `f64`
 * @param im2 `f64`
 * @param resultPtr `usize`
 */
export declare function addComplex(re1: number, im1: number, re2: number, im2: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/subComplex
 * @param re1 `f64`
 * @param im1 `f64`
 * @param re2 `f64`
 * @param im2 `f64`
 * @param resultPtr `usize`
 */
export declare function subComplex(re1: number, im1: number, re2: number, im2: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/mulComplex
 * @param re1 `f64`
 * @param im1 `f64`
 * @param re2 `f64`
 * @param im2 `f64`
 * @param resultPtr `usize`
 */
export declare function mulComplex(re1: number, im1: number, re2: number, im2: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/divComplex
 * @param re1 `f64`
 * @param im1 `f64`
 * @param re2 `f64`
 * @param im2 `f64`
 * @param resultPtr `usize`
 */
export declare function divComplex(re1: number, im1: number, re2: number, im2: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/sqrtComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function sqrtComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/expComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function expComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/logComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function logComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/sinComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function sinComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/cosComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function cosComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/tanComplex
 * @param re `f64`
 * @param im `f64`
 * @param resultPtr `usize`
 */
export declare function tanComplex(re: number, im: number, resultPtr: number): void;
/**
 * src/wasm/complex/operations/powComplexReal
 * @param re `f64`
 * @param im `f64`
 * @param n `f64`
 * @param resultPtr `usize`
 */
export declare function powComplexReal(re: number, im: number, n: number, resultPtr: number): void;
/**
 * src/wasm/geometry/operations/distance2D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @returns `f64`
 */
export declare function distance2D(x1: number, y1: number, x2: number, y2: number): number;
/**
 * src/wasm/geometry/operations/distance3D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param z1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param z2 `f64`
 * @returns `f64`
 */
export declare function distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;
/**
 * src/wasm/geometry/operations/distanceND
 * @param p1Ptr `usize`
 * @param p2Ptr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function distanceND(p1Ptr: number, p2Ptr: number, n: number): number;
/**
 * src/wasm/geometry/operations/manhattanDistance2D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @returns `f64`
 */
export declare function manhattanDistance2D(x1: number, y1: number, x2: number, y2: number): number;
/**
 * src/wasm/geometry/operations/manhattanDistanceND
 * @param p1Ptr `usize`
 * @param p2Ptr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function manhattanDistanceND(p1Ptr: number, p2Ptr: number, n: number): number;
/**
 * src/wasm/geometry/operations/intersect2DLines
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param x3 `f64`
 * @param y3 `f64`
 * @param x4 `f64`
 * @param y4 `f64`
 * @param resultPtr `usize`
 */
export declare function intersect2DLines(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, resultPtr: number): void;
/**
 * src/wasm/geometry/operations/intersect2DInfiniteLines
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param x3 `f64`
 * @param y3 `f64`
 * @param x4 `f64`
 * @param y4 `f64`
 * @param resultPtr `usize`
 */
export declare function intersect2DInfiniteLines(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, resultPtr: number): void;
/**
 * src/wasm/geometry/operations/intersectLinePlane
 * @param px `f64`
 * @param py `f64`
 * @param pz `f64`
 * @param dx `f64`
 * @param dy `f64`
 * @param dz `f64`
 * @param a `f64`
 * @param b `f64`
 * @param c `f64`
 * @param d `f64`
 * @param resultPtr `usize`
 */
export declare function intersectLinePlane(px: number, py: number, pz: number, dx: number, dy: number, dz: number, a: number, b: number, c: number, d: number, resultPtr: number): void;
/**
 * src/wasm/geometry/operations/cross3D
 * @param ax `f64`
 * @param ay `f64`
 * @param az `f64`
 * @param bx `f64`
 * @param by `f64`
 * @param bz `f64`
 * @param resultPtr `usize`
 */
export declare function cross3D(ax: number, ay: number, az: number, bx: number, by: number, bz: number, resultPtr: number): void;
/**
 * src/wasm/geometry/operations/dotND
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function dotND(aPtr: number, bPtr: number, n: number): number;
/**
 * src/wasm/geometry/operations/angle2D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @returns `f64`
 */
export declare function angle2D(x1: number, y1: number, x2: number, y2: number): number;
/**
 * src/wasm/geometry/operations/angle3D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param z1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param z2 `f64`
 * @returns `f64`
 */
export declare function angle3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number;
/**
 * src/wasm/geometry/operations/triangleArea2D
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param x3 `f64`
 * @param y3 `f64`
 * @returns `f64`
 */
export declare function triangleArea2D(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
/**
 * src/wasm/geometry/operations/pointInTriangle2D
 * @param px `f64`
 * @param py `f64`
 * @param x1 `f64`
 * @param y1 `f64`
 * @param x2 `f64`
 * @param y2 `f64`
 * @param x3 `f64`
 * @param y3 `f64`
 * @returns `f64`
 */
export declare function pointInTriangle2D(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
/**
 * src/wasm/geometry/operations/normalizeND
 * @param vPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function normalizeND(vPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/logical/operations/and
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function and(a: number, b: number): number;
/**
 * src/wasm/logical/operations/or
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function or(a: number, b: number): number;
/**
 * src/wasm/logical/operations/not
 * @param a `i32`
 * @returns `i32`
 */
export declare function not(a: number): number;
/**
 * src/wasm/logical/operations/xor
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function xor(a: number, b: number): number;
/**
 * src/wasm/logical/operations/nand
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function nand(a: number, b: number): number;
/**
 * src/wasm/logical/operations/nor
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function nor(a: number, b: number): number;
/**
 * src/wasm/logical/operations/xnor
 * @param a `i32`
 * @param b `i32`
 * @returns `i32`
 */
export declare function xnor(a: number, b: number): number;
/**
 * src/wasm/logical/operations/all
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function all(aPtr: number, n: number): number;
/**
 * src/wasm/logical/operations/any
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function any(aPtr: number, n: number): number;
/**
 * src/wasm/logical/operations/countTrue
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function countTrue(aPtr: number, n: number): number;
/**
 * src/wasm/logical/operations/findFirst
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function findFirst(aPtr: number, n: number): number;
/**
 * src/wasm/logical/operations/findLast
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function findLast(aPtr: number, n: number): number;
/**
 * src/wasm/logical/operations/findAll
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function findAll(aPtr: number, n: number, resultPtr: number): number;
/**
 * src/wasm/logical/operations/select
 * @param condition `i32`
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function select(condition: number, a: number, b: number): number;
/**
 * src/wasm/logical/operations/selectArray
 * @param conditionPtr `usize`
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function selectArray(conditionPtr: number, aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/logical/operations/andArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function andArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/logical/operations/orArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function orArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/logical/operations/notArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function notArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/logical/operations/xorArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function xorArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/compare
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function compare(a: number, b: number): number;
/**
 * src/wasm/relational/operations/compareArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function compareArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/equal
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function equal(a: number, b: number): number;
/**
 * src/wasm/relational/operations/nearlyEqual
 * @param a `f64`
 * @param b `f64`
 * @param tolerance `f64`
 * @returns `i32`
 */
export declare function nearlyEqual(a: number, b: number, tolerance: number): number;
/**
 * src/wasm/relational/operations/equalArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function equalArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/unequal
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function unequal(a: number, b: number): number;
/**
 * src/wasm/relational/operations/unequalArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function unequalArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/larger
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function larger(a: number, b: number): number;
/**
 * src/wasm/relational/operations/largerArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function largerArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/largerEq
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function largerEq(a: number, b: number): number;
/**
 * src/wasm/relational/operations/largerEqArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function largerEqArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/smaller
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function smaller(a: number, b: number): number;
/**
 * src/wasm/relational/operations/smallerArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function smallerArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/smallerEq
 * @param a `f64`
 * @param b `f64`
 * @returns `i32`
 */
export declare function smallerEq(a: number, b: number): number;
/**
 * src/wasm/relational/operations/smallerEqArray
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function smallerEqArray(aPtr: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/min
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function min(aPtr: number, n: number): number;
/**
 * src/wasm/relational/operations/max
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function max(aPtr: number, n: number): number;
/**
 * src/wasm/relational/operations/argmin
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function argmin(aPtr: number, n: number): number;
/**
 * src/wasm/relational/operations/argmax
 * @param aPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function argmax(aPtr: number, n: number): number;
/**
 * src/wasm/relational/operations/clamp
 * @param value `f64`
 * @param minVal `f64`
 * @param maxVal `f64`
 * @returns `f64`
 */
export declare function clamp(value: number, minVal: number, maxVal: number): number;
/**
 * src/wasm/relational/operations/clampArray
 * @param aPtr `usize`
 * @param minVal `f64`
 * @param maxVal `f64`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function clampArray(aPtr: number, minVal: number, maxVal: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/inRange
 * @param value `f64`
 * @param minVal `f64`
 * @param maxVal `f64`
 * @returns `i32`
 */
export declare function inRange(value: number, minVal: number, maxVal: number): number;
/**
 * src/wasm/relational/operations/inRangeArray
 * @param aPtr `usize`
 * @param minVal `f64`
 * @param maxVal `f64`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function inRangeArray(aPtr: number, minVal: number, maxVal: number, n: number, resultPtr: number): void;
/**
 * src/wasm/relational/operations/isPositive
 * @param a `f64`
 * @returns `i32`
 */
export declare function isPositive(a: number): number;
/**
 * src/wasm/relational/operations/isNegative
 * @param a `f64`
 * @returns `i32`
 */
export declare function isNegative(a: number): number;
/**
 * src/wasm/relational/operations/isZero
 * @param a `f64`
 * @returns `i32`
 */
export declare function isZero(a: number): number;
/**
 * src/wasm/relational/operations/isNaN
 * @param a `f64`
 * @returns `i32`
 */
export declare function isNaN(a: number): number;
/**
 * src/wasm/relational/operations/isFinite
 * @param a `f64`
 * @returns `i32`
 */
export declare function isFinite(a: number): number;
/**
 * src/wasm/relational/operations/isInteger
 * @param a `f64`
 * @returns `i32`
 */
export declare function isInteger(a: number): number;
/**
 * src/wasm/relational/operations/sign
 * @param a `f64`
 * @returns `i32`
 */
export declare function sign(a: number): number;
/**
 * src/wasm/relational/operations/signArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function signArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/set/operations/createSet
 * @param arrPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function createSet(arrPtr: number, n: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setUnion
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setUnion(aPtr: number, na: number, bPtr: number, nb: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setIntersect
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setIntersect(aPtr: number, na: number, bPtr: number, nb: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setDifference
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setDifference(aPtr: number, na: number, bPtr: number, nb: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setSymDifference
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setSymDifference(aPtr: number, na: number, bPtr: number, nb: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setIsSubset
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setIsSubset(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setIsProperSubset
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setIsProperSubset(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setIsSuperset
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setIsSuperset(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setIsProperSuperset
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setIsProperSuperset(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setEquals
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setEquals(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setIsDisjoint
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function setIsDisjoint(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/set/operations/setSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function setSize(n: number): number;
/**
 * src/wasm/set/operations/setContains
 * @param aPtr `usize`
 * @param n `i32`
 * @param value `f64`
 * @returns `i32`
 */
export declare function setContains(aPtr: number, n: number, value: number): number;
/**
 * src/wasm/set/operations/setAdd
 * @param aPtr `usize`
 * @param n `i32`
 * @param value `f64`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setAdd(aPtr: number, n: number, value: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setRemove
 * @param aPtr `usize`
 * @param n `i32`
 * @param value `f64`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setRemove(aPtr: number, n: number, value: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setCartesian
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setCartesian(aPtr: number, na: number, bPtr: number, nb: number, resultPtr: number): number;
/**
 * src/wasm/set/operations/setPowerSetSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function setPowerSetSize(n: number): number;
/**
 * src/wasm/set/operations/setGetSubset
 * @param aPtr `usize`
 * @param n `i32`
 * @param index `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function setGetSubset(aPtr: number, n: number, index: number, resultPtr: number): number;
/**
 * src/wasm/special/functions/erf
 * @param x `f64`
 * @returns `f64`
 */
export declare function erf(x: number): number;
/**
 * src/wasm/special/functions/erfArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function erfArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/erfc
 * @param x `f64`
 * @returns `f64`
 */
export declare function erfc(x: number): number;
/**
 * src/wasm/special/functions/erfcArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function erfcArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/gamma
 * @param x `f64`
 * @returns `f64`
 */
export declare function gamma(x: number): number;
/**
 * src/wasm/special/functions/gammaArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function gammaArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/lgamma
 * @param x `f64`
 * @returns `f64`
 */
export declare function lgamma(x: number): number;
/**
 * src/wasm/special/functions/lgammaArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function lgammaArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/zeta
 * @param s `f64`
 * @returns `f64`
 */
export declare function zeta(s: number): number;
/**
 * src/wasm/special/functions/zetaArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function zetaArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/beta
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function beta(a: number, b: number): number;
/**
 * src/wasm/special/functions/gammainc
 * @param a `f64`
 * @param x `f64`
 * @returns `f64`
 */
export declare function gammainc(a: number, x: number): number;
/**
 * src/wasm/special/functions/digamma
 * @param x `f64`
 * @returns `f64`
 */
export declare function digamma(x: number): number;
/**
 * src/wasm/special/functions/digammaArray
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function digammaArray(aPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/special/functions/besselJ0
 * @param x `f64`
 * @returns `f64`
 */
export declare function besselJ0(x: number): number;
/**
 * src/wasm/special/functions/besselJ1
 * @param x `f64`
 * @returns `f64`
 */
export declare function besselJ1(x: number): number;
/**
 * src/wasm/special/functions/besselY0
 * @param x `f64`
 * @returns `f64`
 */
export declare function besselY0(x: number): number;
/**
 * src/wasm/special/functions/besselY1
 * @param x `f64`
 * @returns `f64`
 */
export declare function besselY1(x: number): number;
/**
 * src/wasm/string/operations/isDigit
 * @param code `i32`
 * @returns `i32`
 */
export declare function isDigit(code: number): number;
/**
 * src/wasm/string/operations/isLetter
 * @param code `i32`
 * @returns `i32`
 */
export declare function isLetter(code: number): number;
/**
 * src/wasm/string/operations/isAlphanumeric
 * @param code `i32`
 * @returns `i32`
 */
export declare function isAlphanumeric(code: number): number;
/**
 * src/wasm/string/operations/isWhitespace
 * @param code `i32`
 * @returns `i32`
 */
export declare function isWhitespace(code: number): number;
/**
 * src/wasm/string/operations/toLowerCode
 * @param code `i32`
 * @returns `i32`
 */
export declare function toLowerCode(code: number): number;
/**
 * src/wasm/string/operations/toUpperCode
 * @param code `i32`
 * @returns `i32`
 */
export declare function toUpperCode(code: number): number;
/**
 * src/wasm/string/operations/parseIntFromCodes
 * @param codesPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function parseIntFromCodes(codesPtr: number, n: number): number;
/**
 * src/wasm/string/operations/parseFloatFromCodes
 * @param codesPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function parseFloatFromCodes(codesPtr: number, n: number): number;
/**
 * src/wasm/string/operations/countDigits
 * @param value `i64`
 * @returns `i32`
 */
export declare function countDigits(value: bigint): number;
/**
 * src/wasm/string/operations/formatIntToCodes
 * @param value `i64`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function formatIntToCodes(value: bigint, resultPtr: number): number;
/**
 * src/wasm/string/operations/formatFloatToCodes
 * @param value `f64`
 * @param decimals `i32`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function formatFloatToCodes(value: number, decimals: number, resultPtr: number): number;
/**
 * src/wasm/string/operations/compareCodeArrays
 * @param aPtr `usize`
 * @param na `i32`
 * @param bPtr `usize`
 * @param nb `i32`
 * @returns `i32`
 */
export declare function compareCodeArrays(aPtr: number, na: number, bPtr: number, nb: number): number;
/**
 * src/wasm/string/operations/hashCodes
 * @param codesPtr `usize`
 * @param n `i32`
 * @returns `u32`
 */
export declare function hashCodes(codesPtr: number, n: number): number;
/**
 * src/wasm/string/operations/findPattern
 * @param textPtr `usize`
 * @param textLen `i32`
 * @param patternPtr `usize`
 * @param patternLen `i32`
 * @returns `i32`
 */
export declare function findPattern(textPtr: number, textLen: number, patternPtr: number, patternLen: number): number;
/**
 * src/wasm/string/operations/countPattern
 * @param textPtr `usize`
 * @param textLen `i32`
 * @param patternPtr `usize`
 * @param patternLen `i32`
 * @returns `i32`
 */
export declare function countPattern(textPtr: number, textLen: number, patternPtr: number, patternLen: number): number;
/**
 * src/wasm/string/operations/utf8ByteLength
 * @param codesPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function utf8ByteLength(codesPtr: number, n: number): number;
/**
 * src/wasm/string/operations/isNumericString
 * @param codesPtr `usize`
 * @param n `i32`
 * @returns `i32`
 */
export declare function isNumericString(codesPtr: number, n: number): number;
/**
 * src/wasm/simd/operations/simdAddF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdAddF64(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdSubF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdSubF64(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdMulF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdMulF64(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdDivF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdDivF64(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdScaleF64
 * @param aPtr `usize`
 * @param scalar `f64`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdScaleF64(aPtr: number, scalar: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdDotF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdDotF64(aPtr: number, bPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdSumF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdSumF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdSumSquaresF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdSumSquaresF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdNormF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdNormF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdMinF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdMinF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdMaxF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdMaxF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdAbsF64
 * @param aPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdAbsF64(aPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdSqrtF64
 * @param aPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdSqrtF64(aPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdNegF64
 * @param aPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdNegF64(aPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdMatVecMulF64
 * @param APtr `usize`
 * @param xPtr `usize`
 * @param resultPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatVecMulF64(APtr: number, xPtr: number, resultPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatAddF64
 * @param APtr `usize`
 * @param BPtr `usize`
 * @param CPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatAddF64(APtr: number, BPtr: number, CPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatSubF64
 * @param APtr `usize`
 * @param BPtr `usize`
 * @param CPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatSubF64(APtr: number, BPtr: number, CPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatDotMulF64
 * @param APtr `usize`
 * @param BPtr `usize`
 * @param CPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatDotMulF64(APtr: number, BPtr: number, CPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatScaleF64
 * @param APtr `usize`
 * @param scalar `f64`
 * @param BPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatScaleF64(APtr: number, scalar: number, BPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatMulF64
 * @param APtr `usize`
 * @param BPtr `usize`
 * @param CPtr `usize`
 * @param m `i32`
 * @param k `i32`
 * @param n `i32`
 */
export declare function simdMatMulF64(APtr: number, BPtr: number, CPtr: number, m: number, k: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMatTransposeF64
 * @param APtr `usize`
 * @param BPtr `usize`
 * @param m `i32`
 * @param n `i32`
 */
export declare function simdMatTransposeF64(APtr: number, BPtr: number, m: number, n: number): void;
/**
 * src/wasm/simd/operations/simdMeanF64
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function simdMeanF64(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdVarianceF64
 * @param aPtr `usize`
 * @param length `i32`
 * @param ddof `i32`
 * @returns `f64`
 */
export declare function simdVarianceF64(aPtr: number, length: number, ddof?: number): number;
/**
 * src/wasm/simd/operations/simdStdF64
 * @param aPtr `usize`
 * @param length `i32`
 * @param ddof `i32`
 * @returns `f64`
 */
export declare function simdStdF64(aPtr: number, length: number, ddof?: number): number;
/**
 * src/wasm/simd/operations/simdAddF32
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdAddF32(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdMulF32
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdMulF32(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdDotF32
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param length `i32`
 * @returns `f32`
 */
export declare function simdDotF32(aPtr: number, bPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdSumF32
 * @param aPtr `usize`
 * @param length `i32`
 * @returns `f32`
 */
export declare function simdSumF32(aPtr: number, length: number): number;
/**
 * src/wasm/simd/operations/simdAddI32
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdAddI32(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdMulI32
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function simdMulI32(aPtr: number, bPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/simd/operations/simdComplexMulF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param count `i32`
 */
export declare function simdComplexMulF64(aPtr: number, bPtr: number, resultPtr: number, count: number): void;
/**
 * src/wasm/simd/operations/simdComplexAddF64
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 * @param count `i32`
 */
export declare function simdComplexAddF64(aPtr: number, bPtr: number, resultPtr: number, count: number): void;
/**
 * src/wasm/simd/operations/simdSupported
 * @returns `bool`
 */
export declare function simdSupported(): boolean;
/**
 * src/wasm/simd/operations/simdVectorSizeF64
 * @returns `i32`
 */
export declare function simdVectorSizeF64(): number;
/**
 * src/wasm/simd/operations/simdVectorSizeF32
 * @returns `i32`
 */
export declare function simdVectorSizeF32(): number;
/**
 * src/wasm/statistics/basic/mean
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsMean(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/median
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsMedian(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/medianUnsorted
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsMedianUnsorted(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/variance
 * @param dataPtr `usize`
 * @param length `i32`
 * @param ddof `i32`
 * @returns `f64`
 */
export declare function statsVariance(dataPtr: number, length: number, ddof: number): number;
/**
 * src/wasm/statistics/basic/std
 * @param dataPtr `usize`
 * @param length `i32`
 * @param ddof `i32`
 * @returns `f64`
 */
export declare function statsStd(dataPtr: number, length: number, ddof: number): number;
/**
 * src/wasm/statistics/basic/sum
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsSum(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/prod
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsProd(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/mad
 * @param dataPtr `usize`
 * @param length `i32`
 * @param workPtr `usize`
 * @returns `f64`
 */
export declare function statsMad(dataPtr: number, length: number, workPtr: number): number;
/**
 * src/wasm/statistics/basic/kurtosis
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsKurtosis(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/skewness
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsSkewness(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/coefficientOfVariation
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsCV(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/correlation
 * @param xPtr `usize`
 * @param yPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsCorrelation(xPtr: number, yPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/covariance
 * @param xPtr `usize`
 * @param yPtr `usize`
 * @param length `i32`
 * @param ddof `i32`
 * @returns `f64`
 */
export declare function statsCovariance(xPtr: number, yPtr: number, length: number, ddof: number): number;
/**
 * src/wasm/statistics/basic/geometricMean
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsGeometricMean(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/harmonicMean
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsHarmonicMean(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/rms
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsRms(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/quantile
 * @param dataPtr `usize`
 * @param length `i32`
 * @param p `f64`
 * @returns `f64`
 */
export declare function statsQuantile(dataPtr: number, length: number, p: number): number;
/**
 * src/wasm/statistics/basic/percentile
 * @param dataPtr `usize`
 * @param length `i32`
 * @param p `f64`
 * @returns `f64`
 */
export declare function statsPercentile(dataPtr: number, length: number, p: number): number;
/**
 * src/wasm/statistics/basic/interquartileRange
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsIQR(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/range
 * @param dataPtr `usize`
 * @param length `i32`
 * @returns `f64`
 */
export declare function statsRange(dataPtr: number, length: number): number;
/**
 * src/wasm/statistics/basic/cumsum
 * @param dataPtr `usize`
 * @param length `i32`
 */
export declare function statsCumsum(dataPtr: number, length: number): void;
/**
 * src/wasm/statistics/basic/zscore
 * @param dataPtr `usize`
 * @param resultPtr `usize`
 * @param length `i32`
 */
export declare function statsZscore(dataPtr: number, resultPtr: number, length: number): void;
/**
 * src/wasm/matrix/linalg/det
 * @param aPtr `usize`
 * @param n `i32`
 * @param workPtr `usize`
 * @returns `f64`
 */
export declare function laDet(aPtr: number, n: number, workPtr: number): number;
/**
 * src/wasm/matrix/linalg/inv
 * @param aPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function laInv(aPtr: number, n: number, resultPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/linalg/inv2x2
 * @param aPtr `usize`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function laInv2x2(aPtr: number, resultPtr: number): number;
/**
 * src/wasm/matrix/linalg/inv3x3
 * @param aPtr `usize`
 * @param resultPtr `usize`
 * @returns `i32`
 */
export declare function laInv3x3(aPtr: number, resultPtr: number): number;
/**
 * src/wasm/matrix/linalg/norm1
 * @param xPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function laNorm1(xPtr: number, n: number): number;
/**
 * src/wasm/matrix/linalg/norm2
 * @param xPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function laNorm2(xPtr: number, n: number): number;
/**
 * src/wasm/matrix/linalg/normP
 * @param xPtr `usize`
 * @param n `i32`
 * @param p `f64`
 * @returns `f64`
 */
export declare function laNormP(xPtr: number, n: number, p: number): number;
/**
 * src/wasm/matrix/linalg/normInf
 * @param xPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function laNormInf(xPtr: number, n: number): number;
/**
 * src/wasm/matrix/linalg/normFro
 * @param aPtr `usize`
 * @param size `i32`
 * @returns `f64`
 */
export declare function laNormFro(aPtr: number, size: number): number;
/**
 * src/wasm/matrix/linalg/matrixNorm1
 * @param aPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @returns `f64`
 */
export declare function laMatrixNorm1(aPtr: number, rows: number, cols: number): number;
/**
 * src/wasm/matrix/linalg/matrixNormInf
 * @param aPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @returns `f64`
 */
export declare function laMatrixNormInf(aPtr: number, rows: number, cols: number): number;
/**
 * src/wasm/matrix/linalg/normalize
 * @param xPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function laNormalize(xPtr: number, n: number): number;
/**
 * src/wasm/matrix/linalg/kron
 * @param aPtr `usize`
 * @param aRows `i32`
 * @param aCols `i32`
 * @param bPtr `usize`
 * @param bRows `i32`
 * @param bCols `i32`
 * @param resultPtr `usize`
 */
export declare function laKron(aPtr: number, aRows: number, aCols: number, bPtr: number, bRows: number, bCols: number, resultPtr: number): void;
/**
 * src/wasm/matrix/linalg/cross
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param resultPtr `usize`
 */
export declare function laCross(aPtr: number, bPtr: number, resultPtr: number): void;
/**
 * src/wasm/matrix/linalg/dot
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @returns `f64`
 */
export declare function laDot(aPtr: number, bPtr: number, n: number): number;
/**
 * src/wasm/matrix/linalg/outer
 * @param aPtr `usize`
 * @param m `i32`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 */
export declare function laOuter(aPtr: number, m: number, bPtr: number, n: number, resultPtr: number): void;
/**
 * src/wasm/matrix/linalg/cond1
 * @param aPtr `usize`
 * @param n `i32`
 * @param workPtr `usize`
 * @returns `f64`
 */
export declare function laCond1(aPtr: number, n: number, workPtr: number): number;
/**
 * src/wasm/matrix/linalg/condInf
 * @param aPtr `usize`
 * @param n `i32`
 * @param workPtr `usize`
 * @returns `f64`
 */
export declare function laCondInf(aPtr: number, n: number, workPtr: number): number;
/**
 * src/wasm/matrix/linalg/rank
 * @param aPtr `usize`
 * @param rows `i32`
 * @param cols `i32`
 * @param tol `f64`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function laRank(aPtr: number, rows: number, cols: number, tol: number, workPtr: number): number;
/**
 * src/wasm/matrix/linalg/solve
 * @param aPtr `usize`
 * @param bPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function laSolve(aPtr: number, bPtr: number, n: number, resultPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/eigsSymmetric
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param precision `f64`
 * @param eigenvaluesPtr `usize`
 * @param eigenvectorsPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function eigsSymmetric(matrixPtr: number, n: number, precision: number, eigenvaluesPtr: number, eigenvectorsPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/powerIteration
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param maxIterations `i32`
 * @param tolerance `f64`
 * @param eigenvaluePtr `usize`
 * @param eigenvectorPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function powerIteration(matrixPtr: number, n: number, maxIterations: number, tolerance: number, eigenvaluePtr: number, eigenvectorPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/spectralRadius
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param maxIterations `i32`
 * @param tolerance `f64`
 * @param workPtr `usize`
 * @returns `f64`
 */
export declare function spectralRadius(matrixPtr: number, n: number, maxIterations: number, tolerance: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/inverseIteration
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param eigenvalue `f64`
 * @param maxIterations `i32`
 * @param tolerance `f64`
 * @param eigenvectorPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function inverseIteration(matrixPtr: number, n: number, eigenvalue: number, maxIterations: number, tolerance: number, eigenvectorPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/eigsSymmetricSIMD
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param precision `f64`
 * @param eigenvaluesPtr `usize`
 * @param eigenvectorsPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function eigsSymmetricSIMD(matrixPtr: number, n: number, precision: number, eigenvaluesPtr: number, eigenvectorsPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/eigs/powerIterationSIMD
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param maxIterations `i32`
 * @param tolerance `f64`
 * @param eigenvaluePtr `usize`
 * @param eigenvectorPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function powerIterationSIMD(matrixPtr: number, n: number, maxIterations: number, tolerance: number, eigenvaluePtr: number, eigenvectorPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/complexEigs/balanceMatrix
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param tolerance `f64`
 * @param transformPtr `usize`
 * @returns `i32`
 */
export declare function balanceMatrix(matrixPtr: number, n: number, tolerance: number, transformPtr: number): number;
/**
 * src/wasm/matrix/complexEigs/reduceToHessenberg
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param tolerance `f64`
 * @param transformPtr `usize`
 */
export declare function reduceToHessenberg(matrixPtr: number, n: number, tolerance: number, transformPtr: number): void;
/**
 * src/wasm/matrix/complexEigs/eigenvalues2x2
 * @param a `f64`
 * @param b `f64`
 * @param c `f64`
 * @param d `f64`
 * @param eigenvaluesPtr `usize`
 */
export declare function eigenvalues2x2(a: number, b: number, c: number, d: number, eigenvaluesPtr: number): void;
/**
 * src/wasm/matrix/complexEigs/qrIterationStep
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param fullN `i32`
 * @param qPtr `usize`
 * @param workPtr `usize`
 */
export declare function qrIterationStep(matrixPtr: number, n: number, fullN: number, qPtr: number, workPtr: number): void;
/**
 * src/wasm/matrix/complexEigs/qrAlgorithm
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param tolerance `f64`
 * @param maxIterations `i32`
 * @param eigenvaluesRealPtr `usize`
 * @param eigenvaluesImagPtr `usize`
 * @param schurPtr `usize`
 * @param qPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function qrAlgorithm(matrixPtr: number, n: number, tolerance: number, maxIterations: number, eigenvaluesRealPtr: number, eigenvaluesImagPtr: number, schurPtr: number, qPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/complexEigs/hessenbergQRStep
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param fullN `i32`
 */
export declare function hessenbergQRStep(matrixPtr: number, n: number, fullN: number): void;
/**
 * src/wasm/matrix/expm/expm
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function expm(matrixPtr: number, n: number, resultPtr: number, workPtr: number): number;
/**
 * src/wasm/matrix/expm/expmSmall
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param numTerms `i32`
 */
export declare function expmSmall(matrixPtr: number, n: number, resultPtr: number, numTerms: number): void;
/**
 * src/wasm/matrix/expm/expmv
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param xPtr `usize`
 * @param yPtr `usize`
 * @param workPtr `usize`
 * @param numTerms `i32`
 */
export declare function expmv(matrixPtr: number, n: number, xPtr: number, yPtr: number, workPtr: number, numTerms: number): void;
/**
 * src/wasm/matrix/sqrtm/sqrtm
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param tolerance `f64`
 * @param maxIterations `i32`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function sqrtm(matrixPtr: number, n: number, resultPtr: number, tolerance: number, maxIterations: number, workPtr: number): number;
/**
 * src/wasm/matrix/sqrtm/sqrtmNewtonSchulz
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param tolerance `f64`
 * @param maxIterations `i32`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function sqrtmNewtonSchulz(matrixPtr: number, n: number, resultPtr: number, tolerance: number, maxIterations: number, workPtr: number): number;
/**
 * src/wasm/matrix/sqrtm/sqrtmCholesky
 * @param matrixPtr `usize`
 * @param n `i32`
 * @param resultPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function sqrtmCholesky(matrixPtr: number, n: number, resultPtr: number, workPtr: number): number;
/**
 * src/wasm/algebra/sparseLu/sparseLu
 * @param avaluesPtr `usize`
 * @param aindexPtr `usize`
 * @param aptrPtr `usize`
 * @param n `i32`
 * @param qPtr `usize`
 * @param tol `f64`
 * @param lvaluesPtr `usize`
 * @param lindexPtr `usize`
 * @param lptrPtr `usize`
 * @param uvaluesPtr `usize`
 * @param uindexPtr `usize`
 * @param uptrPtr `usize`
 * @param pinvPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function sparseLu(avaluesPtr: number, aindexPtr: number, aptrPtr: number, n: number, qPtr: number, tol: number, lvaluesPtr: number, lindexPtr: number, lptrPtr: number, uvaluesPtr: number, uindexPtr: number, uptrPtr: number, pinvPtr: number, workPtr: number): number;
/**
 * src/wasm/algebra/sparseLu/sparseForwardSolve
 * @param lvaluesPtr `usize`
 * @param lindexPtr `usize`
 * @param lptrPtr `usize`
 * @param n `i32`
 * @param bPtr `usize`
 */
export declare function sparseForwardSolve(lvaluesPtr: number, lindexPtr: number, lptrPtr: number, n: number, bPtr: number): void;
/**
 * src/wasm/algebra/sparseLu/sparseBackwardSolve
 * @param uvaluesPtr `usize`
 * @param uindexPtr `usize`
 * @param uptrPtr `usize`
 * @param n `i32`
 * @param bPtr `usize`
 */
export declare function sparseBackwardSolve(uvaluesPtr: number, uindexPtr: number, uptrPtr: number, n: number, bPtr: number): void;
/**
 * src/wasm/algebra/sparseLu/sparseLuSolve
 * @param lvaluesPtr `usize`
 * @param lindexPtr `usize`
 * @param lptrPtr `usize`
 * @param uvaluesPtr `usize`
 * @param uindexPtr `usize`
 * @param uptrPtr `usize`
 * @param pinvPtr `usize`
 * @param qPtr `usize`
 * @param n `i32`
 * @param bPtr `usize`
 * @param workPtr `usize`
 */
export declare function sparseLuSolve(lvaluesPtr: number, lindexPtr: number, lptrPtr: number, uvaluesPtr: number, uindexPtr: number, uptrPtr: number, pinvPtr: number, qPtr: number, n: number, bPtr: number, workPtr: number): void;
/**
 * src/wasm/algebra/sparseChol/sparseChol
 * @param avaluesPtr `usize`
 * @param aindexPtr `usize`
 * @param aptrPtr `usize`
 * @param n `i32`
 * @param parentPtr `usize`
 * @param cpPtr `usize`
 * @param pinvPtr `usize`
 * @param lvaluesPtr `usize`
 * @param lindexPtr `usize`
 * @param lptrPtr `usize`
 * @param workPtr `usize`
 * @returns `i32`
 */
export declare function sparseChol(avaluesPtr: number, aindexPtr: number, aptrPtr: number, n: number, parentPtr: number, cpPtr: number, pinvPtr: number, lvaluesPtr: number, lindexPtr: number, lptrPtr: number, workPtr: number): number;
/**
 * src/wasm/algebra/sparseChol/sparseCholSolve
 * @param lvaluesPtr `usize`
 * @param lindexPtr `usize`
 * @param lptrPtr `usize`
 * @param n `i32`
 * @param pinvPtr `usize`
 * @param bPtr `usize`
 * @param workPtr `usize`
 */
export declare function sparseCholSolve(lvaluesPtr: number, lindexPtr: number, lptrPtr: number, n: number, pinvPtr: number, bPtr: number, workPtr: number): void;
/**
 * src/wasm/algebra/sparseChol/eliminationTree
 * @param aindexPtr `usize`
 * @param aptrPtr `usize`
 * @param n `i32`
 * @param parentPtr `usize`
 * @param workPtr `usize`
 */
export declare function eliminationTree(aindexPtr: number, aptrPtr: number, n: number, parentPtr: number, workPtr: number): void;
/**
 * src/wasm/algebra/sparseChol/columnCounts
 * @param parentPtr `usize`
 * @param aptrPtr `usize`
 * @param aindexPtr `usize`
 * @param n `i32`
 * @param cpPtr `usize`
 * @param workPtr `usize`
 */
export declare function columnCounts(parentPtr: number, aptrPtr: number, aindexPtr: number, n: number, cpPtr: number, workPtr: number): void;
/**
 * src/wasm/plain/operations/abs
 * @param a `f64`
 * @returns `f64`
 */
export declare function plainAbs(a: number): number;
/**
 * src/wasm/plain/operations/add
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainAdd(a: number, b: number): number;
/**
 * src/wasm/plain/operations/subtract
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainSubtract(a: number, b: number): number;
/**
 * src/wasm/plain/operations/multiply
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainMultiply(a: number, b: number): number;
/**
 * src/wasm/plain/operations/divide
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainDivide(a: number, b: number): number;
/**
 * src/wasm/plain/operations/unaryMinus
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainUnaryMinus(x: number): number;
/**
 * src/wasm/plain/operations/unaryPlus
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainUnaryPlus(x: number): number;
/**
 * src/wasm/plain/operations/cbrt
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCbrt(x: number): number;
/**
 * src/wasm/plain/operations/cube
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCube(x: number): number;
/**
 * src/wasm/plain/operations/exp
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainExp(x: number): number;
/**
 * src/wasm/plain/operations/expm1
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainExpm1(x: number): number;
/**
 * src/wasm/plain/operations/gcd
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainGcd(a: number, b: number): number;
/**
 * src/wasm/plain/operations/lcm
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function plainLcm(a: number, b: number): number;
/**
 * src/wasm/plain/operations/log
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainLog(x: number): number;
/**
 * src/wasm/plain/operations/log2
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainLog2(x: number): number;
/**
 * src/wasm/plain/operations/log10
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainLog10(x: number): number;
/**
 * src/wasm/plain/operations/log1p
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainLog1p(x: number): number;
/**
 * src/wasm/plain/operations/mod
 * @param x `f64`
 * @param y `f64`
 * @returns `f64`
 */
export declare function plainMod(x: number, y: number): number;
/**
 * src/wasm/plain/operations/nthRoot
 * @param a `f64`
 * @param root `f64`
 * @returns `f64`
 */
export declare function plainNthRoot(a: number, root: number): number;
/**
 * src/wasm/plain/operations/sign
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSign(x: number): number;
/**
 * src/wasm/plain/operations/sqrt
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSqrt(x: number): number;
/**
 * src/wasm/plain/operations/square
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSquare(x: number): number;
/**
 * src/wasm/plain/operations/pow
 * @param x `f64`
 * @param y `f64`
 * @returns `f64`
 */
export declare function plainPow(x: number, y: number): number;
/**
 * src/wasm/plain/operations/norm
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainNorm(x: number): number;
/**
 * src/wasm/plain/operations/bitAnd
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainBitAnd(x: number, y: number): number;
/**
 * src/wasm/plain/operations/bitNot
 * @param x `i32`
 * @returns `i32`
 */
export declare function plainBitNot(x: number): number;
/**
 * src/wasm/plain/operations/bitOr
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainBitOr(x: number, y: number): number;
/**
 * src/wasm/plain/operations/bitXor
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainBitXor(x: number, y: number): number;
/**
 * src/wasm/plain/operations/leftShift
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainLeftShift(x: number, y: number): number;
/**
 * src/wasm/plain/operations/rightArithShift
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainRightArithShift(x: number, y: number): number;
/**
 * src/wasm/plain/operations/rightLogShift
 * @param x `i32`
 * @param y `i32`
 * @returns `i32`
 */
export declare function plainRightLogShift(x: number, y: number): number;
/**
 * src/wasm/plain/operations/combinations
 * @param n `f64`
 * @param k `f64`
 * @returns `f64`
 */
export declare function plainCombinations(n: number, k: number): number;
/** src/wasm/plain/operations/PI */
export declare const plainPI: {
  /** @type `f64` */
  get value(): number
};
/** src/wasm/plain/operations/TAU */
export declare const plainTAU: {
  /** @type `f64` */
  get value(): number
};
/** src/wasm/plain/operations/E */
export declare const plainE: {
  /** @type `f64` */
  get value(): number
};
/** src/wasm/plain/operations/PHI */
export declare const plainPHI: {
  /** @type `f64` */
  get value(): number
};
/**
 * src/wasm/plain/operations/not
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainNot(x: number): boolean;
/**
 * src/wasm/plain/operations/or
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainOr(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/xor
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainXor(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/and
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainAnd(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/equal
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainEqual(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/unequal
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainUnequal(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/smaller
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainSmaller(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/smallerEq
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainSmallerEq(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/larger
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainLarger(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/largerEq
 * @param x `f64`
 * @param y `f64`
 * @returns `bool`
 */
export declare function plainLargerEq(x: number, y: number): boolean;
/**
 * src/wasm/plain/operations/compare
 * @param x `f64`
 * @param y `f64`
 * @returns `i32`
 */
export declare function plainCompare(x: number, y: number): number;
/**
 * src/wasm/plain/operations/gamma
 * @param n `f64`
 * @returns `f64`
 */
export declare function plainGamma(n: number): number;
/**
 * src/wasm/plain/operations/lgamma
 * @param n `f64`
 * @returns `f64`
 */
export declare function plainLgamma(n: number): number;
/**
 * src/wasm/plain/operations/acos
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcos(x: number): number;
/**
 * src/wasm/plain/operations/acosh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcosh(x: number): number;
/**
 * src/wasm/plain/operations/acot
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcot(x: number): number;
/**
 * src/wasm/plain/operations/acoth
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcoth(x: number): number;
/**
 * src/wasm/plain/operations/acsc
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcsc(x: number): number;
/**
 * src/wasm/plain/operations/acsch
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAcsch(x: number): number;
/**
 * src/wasm/plain/operations/asec
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAsec(x: number): number;
/**
 * src/wasm/plain/operations/asech
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAsech(x: number): number;
/**
 * src/wasm/plain/operations/asin
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAsin(x: number): number;
/**
 * src/wasm/plain/operations/asinh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAsinh(x: number): number;
/**
 * src/wasm/plain/operations/atan
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAtan(x: number): number;
/**
 * src/wasm/plain/operations/atan2
 * @param y `f64`
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAtan2(y: number, x: number): number;
/**
 * src/wasm/plain/operations/atanh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainAtanh(x: number): number;
/**
 * src/wasm/plain/operations/cos
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCos(x: number): number;
/**
 * src/wasm/plain/operations/cosh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCosh(x: number): number;
/**
 * src/wasm/plain/operations/cot
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCot(x: number): number;
/**
 * src/wasm/plain/operations/coth
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCoth(x: number): number;
/**
 * src/wasm/plain/operations/csc
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCsc(x: number): number;
/**
 * src/wasm/plain/operations/csch
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainCsch(x: number): number;
/**
 * src/wasm/plain/operations/sec
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSec(x: number): number;
/**
 * src/wasm/plain/operations/sech
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSech(x: number): number;
/**
 * src/wasm/plain/operations/sin
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSin(x: number): number;
/**
 * src/wasm/plain/operations/sinh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainSinh(x: number): number;
/**
 * src/wasm/plain/operations/tan
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainTan(x: number): number;
/**
 * src/wasm/plain/operations/tanh
 * @param x `f64`
 * @returns `f64`
 */
export declare function plainTanh(x: number): number;
/**
 * src/wasm/plain/operations/isIntegerValue
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainIsIntegerValue(x: number): boolean;
/**
 * src/wasm/plain/operations/isNegative
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainIsNegative(x: number): boolean;
/**
 * src/wasm/plain/operations/isPositive
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainIsPositive(x: number): boolean;
/**
 * src/wasm/plain/operations/isZero
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainIsZero(x: number): boolean;
/**
 * src/wasm/plain/operations/isNaN
 * @param x `f64`
 * @returns `bool`
 */
export declare function plainIsNaN(x: number): boolean;
/** src/wasm/utils/workPtrValidation/WORK_EIGS_SYMMETRIC */
export declare const WORK_EIGS_SYMMETRIC: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_POWER_ITERATION */
export declare const WORK_POWER_ITERATION: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_VECTOR */
export declare const WORK_INVERSE_ITERATION_VECTOR: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_INVERSE_ITERATION_MATRIX */
export declare const WORK_INVERSE_ITERATION_MATRIX: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_VECTOR */
export declare const WORK_QR_ALGORITHM_VECTOR: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_QR_ALGORITHM_MATRIX */
export declare const WORK_QR_ALGORITHM_MATRIX: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_BALANCE_MATRIX */
export declare const WORK_BALANCE_MATRIX: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_EXPM */
export declare const WORK_EXPM: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_EXPMV */
export declare const WORK_EXPMV: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SQRTM */
export declare const WORK_SQRTM: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SQRTM_NEWTON_SCHULZ */
export declare const WORK_SQRTM_NEWTON_SCHULZ: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_VECTOR */
export declare const WORK_SPARSE_LU_VECTOR: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SPARSE_LU_INT */
export declare const WORK_SPARSE_LU_INT: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_VECTOR */
export declare const WORK_SPARSE_CHOL_VECTOR: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_SPARSE_CHOL_INT */
export declare const WORK_SPARSE_CHOL_INT: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_COLUMN_COUNTS */
export declare const WORK_COLUMN_COUNTS: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_LU_DECOMPOSITION */
export declare const WORK_LU_DECOMPOSITION: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_QR_DECOMPOSITION */
export declare const WORK_QR_DECOMPOSITION: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_CHOLESKY_DECOMPOSITION */
export declare const WORK_CHOLESKY_DECOMPOSITION: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_FFT_2D */
export declare const WORK_FFT_2D: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_IRFFT */
export declare const WORK_IRFFT: {
  /** @type `i32` */
  get value(): number
};
/** src/wasm/utils/workPtrValidation/WORK_BLOCKED_MULTIPLY */
export declare const WORK_BLOCKED_MULTIPLY: {
  /** @type `i32` */
  get value(): number
};
/**
 * src/wasm/utils/workPtrValidation/eigsSymmetricWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function eigsSymmetricWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/powerIterationWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function powerIterationWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/inverseIterationWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function inverseIterationWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/qrAlgorithmWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function qrAlgorithmWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/expmWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function expmWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/sqrtmWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function sqrtmWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/sqrtmNewtonSchulzWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function sqrtmNewtonSchulzWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/sparseLuWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function sparseLuWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/sparseCholWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function sparseCholWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/columnCountsWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function columnCountsWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/fft2dWorkSize
 * @param rows `i32`
 * @param cols `i32`
 * @returns `i32`
 */
export declare function fft2dWorkSize(rows: number, cols: number): number;
/**
 * src/wasm/utils/workPtrValidation/irfftWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function irfftWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/blockedMultiplyWorkSize
 * @param bRows `i32`
 * @param bCols `i32`
 * @returns `i32`
 */
export declare function blockedMultiplyWorkSize(bRows: number, bCols: number): number;
/**
 * src/wasm/utils/workPtrValidation/condWorkSize
 * @param n `i32`
 * @returns `i32`
 */
export declare function condWorkSize(n: number): number;
/**
 * src/wasm/utils/workPtrValidation/validateWorkPtrSize
 * @param requiredSize `i32`
 * @param providedSize `i32`
 * @returns `i32`
 */
export declare function validateWorkPtrSize(requiredSize: number, providedSize: number): number;
/**
 * src/wasm/utils/workPtrValidation/getWorkPtrRequirement
 * @param operation `i32`
 * @param n `i32`
 * @param m `i32`
 * @returns `i32`
 */
export declare function getWorkPtrRequirement(operation: number, n: number, m?: number): number;
