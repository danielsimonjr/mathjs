# AssemblyScript Conversion Candidates

> **Generated**: 2026-01-13
>
> This report identifies TypeScript files in `src/` that could potentially be
> converted to AssemblyScript for WASM compilation.

## Summary

| Category | Count | Description |
|----------|-------|-------------|
| Highly Compatible | 0 | Ready for conversion with minimal changes |
| Likely Compatible | 0 | Minor refactoring needed |
| Needs Refactoring | 502 | Significant changes required |
| Not Compatible | 296 | Cannot convert (symbolic math, parsers, etc.) |
| Already in WASM | 198 | Already implemented in `src/wasm/` |
| **Total Analyzed** | **996** | TypeScript files in `src/` |

**Conversion Candidates**: 0 files

---

## Highly Compatible

These files are ready for AssemblyScript conversion with minimal or no changes.

*None found*

---

## Likely Compatible

These files need minor refactoring to be AssemblyScript-compatible.

*None found*

---

## Needs Refactoring

These files require significant changes before conversion. Showing top 30 by score.

| File | Score | Main Issues |
|------|-------|-------------|
| `plain\number\index.ts` | 0 | - |
| `utils\switch.ts` | -9 | Uses "any" type |
| `entry\allFactoriesAny.ts` | -10 | Uses RegExp |
| `entry\allFactoriesNumber.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAbs.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAcos.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAcosh.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAddScalar.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAnd.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAndTransform.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesArg.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAsin.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAsinh.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAtan.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesAtanh.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBellNumbers.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBigint.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBin.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBitAnd.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBitAndTransform.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBitNot.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBitOr.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBitOrTransform.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesBoolean.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesCatalan.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesCeil.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesClone.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesColumn.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesColumnTransform.generated.ts` | -10 | Uses RegExp |
| `entry\dependenciesAny\dependenciesCombinations.generated.ts` | -10 | Uses RegExp |

*... and 472 more files*

---

## Not Compatible

These 296 files cannot be converted due to fundamental incompatibilities:

- Expression parser and AST manipulation
- Symbolic mathematics (derivative, simplify, etc.)
- Type classes (BigNumber, Fraction, Unit, Complex class)
- Dynamic typing and runtime type checking
- String manipulation and regex operations
- Async/Promise patterns

<details>
<summary>Click to expand full list</summary>

- `error\ArgumentsError.ts`
- `function\matrix\eigs\realSymmetric.ts`
- `error\IndexError.ts`
- `expression\transform\utils\errorTransform.ts`
- `entry\dependenciesAny\dependenciesAdd.generated.ts`
- `entry\dependenciesAny\dependenciesBitXor.generated.ts`
- `entry\dependenciesAny\dependenciesChainClass.generated.ts`
- `entry\dependenciesAny\dependenciesDiag.generated.ts`
- `entry\dependenciesAny\dependenciesDotDivide.generated.ts`
- `entry\dependenciesAny\dependenciesDotPow.generated.ts`
- `entry\dependenciesAny\dependenciesEqual.generated.ts`
- `entry\dependenciesAny\dependenciesLarger.generated.ts`
- `entry\dependenciesAny\dependenciesLargerEq.generated.ts`
- `entry\dependenciesAny\dependenciesLup.generated.ts`
- `entry\dependenciesAny\dependenciesMatrix.generated.ts`
- `entry\dependenciesAny\dependenciesNode.generated.ts`
- `entry\dependenciesAny\dependenciesSlu.generated.ts`
- `entry\dependenciesAny\dependenciesSmaller.generated.ts`
- `entry\dependenciesAny\dependenciesSmallerEq.generated.ts`
- `entry\dependenciesAny\dependenciesSparse.generated.ts`
- `entry\dependenciesAny\dependenciesUnequal.generated.ts`
- `entry\dependenciesAny\dependenciesXor.generated.ts`
- `entry\dependenciesNumber\dependenciesChainClass.generated.ts`
- `entry\dependenciesNumber\dependenciesNode.generated.ts`
- `entry\dependenciesNumber\dependenciesSQRT1_2.generated.ts`
- `header.ts`
- `version.ts`
- `entry\dependenciesAny\dependenciesFraction.generated.ts`
- `entry\dependenciesAny\dependenciesBernoulli.generated.ts`
- `entry\dependenciesAny\dependenciesCbrt.generated.ts`
- `entry\dependenciesAny\dependenciesCompare.generated.ts`
- `entry\dependenciesAny\dependenciesSign.generated.ts`
- `entry\dependenciesAny\dependenciesTyped.generated.ts`
- `entry\dependenciesAny\dependenciesUnitClass.generated.ts`
- `function\probability\util\randomMatrix.ts`
- `entry\dependenciesAny\dependenciesIdentity.generated.ts`
- `entry\dependenciesAny\dependenciesRotationMatrix.generated.ts`
- `entry\dependenciesAny\dependenciesSQRT1_2.generated.ts`
- `entry\dependenciesAny\dependenciesAccessorNode.generated.ts`
- `entry\dependenciesAny\dependenciesArrayNode.generated.ts`
- `entry\dependenciesAny\dependenciesAssignmentNode.generated.ts`
- `entry\dependenciesAny\dependenciesBlockNode.generated.ts`
- `entry\dependenciesAny\dependenciesChain.generated.ts`
- `entry\dependenciesAny\dependenciesConditionalNode.generated.ts`
- `entry\dependenciesAny\dependenciesFunctionAssignmentNode.generated.ts`
- `entry\dependenciesAny\dependenciesIndexNode.generated.ts`
- `entry\dependenciesAny\dependenciesObjectNode.generated.ts`
- `entry\dependenciesAny\dependenciesParenthesisNode.generated.ts`
- `entry\dependenciesAny\dependenciesRangeNode.generated.ts`
- `entry\dependenciesAny\dependenciesRelationalNode.generated.ts`
- `entry\dependenciesNumber\dependenciesAccessorNode.generated.ts`
- `entry\dependenciesNumber\dependenciesArrayNode.generated.ts`
- `entry\dependenciesNumber\dependenciesAssignmentNode.generated.ts`
- `entry\dependenciesNumber\dependenciesBlockNode.generated.ts`
- `entry\dependenciesNumber\dependenciesChain.generated.ts`
- `entry\dependenciesNumber\dependenciesConditionalNode.generated.ts`
- `entry\dependenciesNumber\dependenciesFunctionAssignmentNode.generated.ts`
- `entry\dependenciesNumber\dependenciesIndexNode.generated.ts`
- `entry\dependenciesNumber\dependenciesObjectNode.generated.ts`
- `entry\dependenciesNumber\dependenciesParenthesisNode.generated.ts`
- `entry\dependenciesNumber\dependenciesRangeNode.generated.ts`
- `entry\dependenciesNumber\dependenciesRelationalNode.generated.ts`
- `utils\scope.ts`
- `expression\transform\utils\lastDimToZeroBase.ts`
- `core\config.ts`
- `error\DimensionError.ts`
- `plain\bignumber\index.ts`
- `utils\complex.ts`
- `utils\product.ts`
- `function\relational\compareUnits.ts`
- `function\trigonometry\trigUnit.ts`
- `expression\transform\utils\dimToZeroBase.ts`
- `function\matrix\eigs\complexEigs.ts`
- `type\matrix\DenseMatrix.ts`
- `function\statistics\utils\improveErrorMessage.ts`
- `entry\dependenciesAny\dependenciesSymbolicEqual.generated.ts`
- `entry\mainAny.ts`
- `entry\mainNumber.ts`
- `utils\bigint.ts`
- `entry\configReadonly.ts`
- `type\matrix\SparseMatrix.ts`
- `type\matrix\utils\broadcast.ts`
- `function\matrix\size.ts`
- `function\string\bin.ts`
- `function\string\hex.ts`
- `function\string\oct.ts`
- `type\matrix\utils\matAlgo02xDS0.ts`
- `type\matrix\utils\matAlgo11xS0s.ts`
- `entry\dependenciesAny\dependenciesConstantNode.generated.ts`
- `entry\dependenciesAny\dependenciesOperatorNode.generated.ts`
- `entry\dependenciesAny\dependenciesSymbolNode.generated.ts`
- `entry\dependenciesNumber\dependenciesConstantNode.generated.ts`
- `entry\dependenciesNumber\dependenciesOperatorNode.generated.ts`
- `entry\dependenciesNumber\dependenciesSymbolNode.generated.ts`
- `expression\types.ts`
- `json\replacer.ts`
- `type\unit\function\splitUnit.ts`
- `function\arithmetic\divideScalar.ts`
- `function\algebra\decomposition\slu.ts`
- `core\function\config.ts`
- `function\matrix\eigs.ts`
- `type\matrix\utils\matAlgo06xS0S0.ts`
- `utils\collection.ts`
- `type\matrix\ImmutableDenseMatrix.ts`
- `function\arithmetic\fix.ts`
- `type\matrix\utils\matAlgo07xSSf.ts`
- `utils\bignumber\nearlyEqual.ts`
- `utils\emitter.ts`
- `entry\typeChecks.ts`
- `expression\function\compile.ts`
- `type\matrix\FibonacciHeap.ts`
- `type\matrix\utils\matAlgo03xDSf.ts`
- `utils\node.ts`
- `type\matrix\MatrixIndex.ts`
- `type\complex\function\complex.ts`
- `function\algebra\leafCount.ts`
- `function\algebra\sparse\csSymperm.ts`
- `type\matrix\utils\matAlgo08xS0Sid.ts`
- `function\probability\kldivergence.ts`
- `type\matrix\Matrix.ts`
- `expression\transform\quantileSeq.transform.ts`
- `type\boolean.ts`
- `type\matrix\utils\matAlgo01xDSid.ts`
- `type\matrix\utils\matAlgo04xSidSid.ts`
- `type\matrix\utils\matAlgo05xSfSf.ts`
- `utils\array.ts`
- `function\numeric\solveODE.ts`
- `utils\function.ts`
- `type\matrix\utils\matAlgo14xDs.ts`
- `function\matrix\map.ts`
- `function\matrix\partitionSelect.ts`
- `function\probability\util\seededRNG.ts`
- `type\matrix\utils\matAlgo09xS0Sf.ts`
- `expression\function\parser.ts`
- `function\algebra\lyap.ts`
- `function\arithmetic\addScalar.ts`
- `function\arithmetic\multiplyScalar.ts`
- `function\arithmetic\subtractScalar.ts`
- `function\bitwise\useMatrixForArrayScalar.ts`
- `function\matrix\ctranspose.ts`
- `function\matrix\forEach.ts`
- `function\matrix\getMatrixDataType.ts`
- `function\matrix\count.ts`
- `expression\node\utils\access.ts`
- `function\matrix\column.ts`
- `function\matrix\row.ts`
- `function\string\format.ts`
- `expression\transform\and.transform.ts`
- `expression\transform\bitAnd.transform.ts`
- `expression\transform\bitOr.transform.ts`
- `expression\transform\or.transform.ts`
- `type\matrix\utils\matAlgo10xSids.ts`
- `type\matrix\utils\matAlgo12xSfs.ts`
- `type\matrix\utils\matAlgo13xDD.ts`
- `function\algebra\sparse\csSqr.ts`
- `type\local\Complex.ts`
- `entry\dependenciesAny\dependenciesFunctionNode.generated.ts`
- `entry\dependenciesNumber\dependenciesFunctionNode.generated.ts`
- `expression\transform\range.transform.ts`
- `expression\transform\subset.transform.ts`
- `function\unit\to.ts`
- `function\arithmetic\unaryPlus.ts`
- `type\number.ts`
- `function\relational\deepEqual.ts`
- `type\matrix\Spa.ts`
- `function\algebra\sylvester.ts`
- `function\matrix\filter.ts`
- `function\probability\pickRandom.ts`
- `type\bigint.ts`
- `type\matrix\utils\matrixAlgorithmSuite.ts`
- `type\unit\function\unit.ts`
- `function\utils\isBounded.ts`
- `function\matrix\diff.ts`
- `function\probability\bernoulli.ts`
- `expression\transform\nullish.transform.ts`
- `function\relational\equalText.ts`
- `type\string.ts`
- `type\local\Fraction.ts`
- `entry\dependenciesAny\dependenciesResolve.generated.ts`
- `entry\dependenciesAny.generated.ts`
- `entry\dependenciesNumber\dependenciesResolve.generated.ts`
- `entry\dependenciesNumber.generated.ts`
- `entry\pureFunctionsNumber.generated.ts`
- `expression\function\evaluate.ts`
- `expression\transform\diff.transform.ts`
- `expression\transform\max.transform.ts`
- `expression\transform\mean.transform.ts`
- `expression\transform\min.transform.ts`
- `expression\transform\std.transform.ts`
- `expression\transform\sum.transform.ts`
- `expression\transform\variance.transform.ts`
- `function\arithmetic\unaryMinus.ts`
- `function\matrix\sort.ts`
- `function\matrix\squeeze.ts`
- `function\relational\compareText.ts`
- `type\chain\function\chain.ts`
- `type\matrix\function\sparse.ts`
- `type\unit\physicalConstants.ts`
- `types.ts`
- `type\bignumber\function\bignumber.ts`
- `function\logical\nullish.ts`
- `function\probability\multinomial.ts`
- `type\fraction\function\fraction.ts`
- `type\matrix\function\matrix.ts`
- `type\matrix\Range.ts`
- `utils\lruQueue.ts`
- `function\matrix\matrixFromRows.ts`
- `expression\transform\column.transform.ts`
- `expression\transform\row.transform.ts`
- `function\matrix\matrixFromColumns.ts`
- `expression\node\RelationalNode.ts`
- `function\algebra\polynomialRoot.ts`
- `type\local\Decimal.ts`
- `type\matrix\function\index.ts`
- `utils\factory.ts`
- `function\unit\toBest.ts`
- `entry\dependenciesAny\dependenciesDerivative.generated.ts`
- `entry\dependenciesAny\dependenciesParse.generated.ts`
- `entry\dependenciesAny\dependenciesSimplify.generated.ts`
- `entry\dependenciesAny\dependenciesSimplifyCore.generated.ts`
- `entry\dependenciesNumber\dependenciesDerivative.generated.ts`
- `entry\dependenciesNumber\dependenciesParse.generated.ts`
- `entry\dependenciesNumber\dependenciesRationalize.generated.ts`
- `entry\dependenciesNumber\dependenciesSimplify.generated.ts`
- `entry\dependenciesNumber\dependenciesSimplifyConstant.generated.ts`
- `entry\dependenciesNumber\dependenciesSimplifyCore.generated.ts`
- `expression\function\help.ts`
- `expression\transform\index.transform.ts`
- `expression\transform\print.transform.ts`
- `type\unit\function\createUnit.ts`
- `utils\optimizeCallback.ts`
- `utils\latex.ts`
- `function\matrix\resize.ts`
- `function\string\print.ts`
- `utils\customs.ts`
- `entry\dependenciesAny\dependenciesRationalize.generated.ts`
- `entry\dependenciesAny\dependenciesSimplifyConstant.generated.ts`
- `expression\node\utils\assign.ts`
- `function\matrix\subset.ts`
- `expression\transform\concat.transform.ts`
- `expression\transform\cumsum.transform.ts`
- `expression\transform\mapSlices.transform.ts`
- `entry\pureFunctionsAny.generated.ts`
- `function\matrix\concat.ts`
- `function\matrix\mapSlices.ts`
- `function\algebra\solver\utils\solveValidation.ts`
- `expression\transform\filter.transform.ts`
- `expression\transform\forEach.transform.ts`
- `expression\transform\map.transform.ts`
- `type\complex\Complex.ts`
- `utils\number.ts`
- `type\fraction\Fraction.ts`
- `function\algebra\rationalize.ts`
- `type\bignumber\BigNumber.ts`
- `utils\bignumber\formatter.ts`
- `core\function\typed.ts`
- `expression\node\ParenthesisNode.ts`
- `utils\map.ts`
- `expression\transform\utils\compileInlineExpression.ts`
- `function\algebra\simplify\wildcards.ts`
- `expression\transform\utils\transformCallback.ts`
- `function\algebra\derivative.ts`
- `function\matrix\matrixFromFunction.ts`
- `expression\node\BlockNode.ts`
- `expression\node\ArrayNode.ts`
- `expression\node\RangeNode.ts`
- `expression\node\Node.ts`
- `expression\node\AccessorNode.ts`
- `expression\node\IndexNode.ts`
- `expression\operators.ts`
- `expression\node\SymbolNode.ts`
- `function\algebra\symbolicEqual.ts`
- `core\create.ts`
- `expression\node\ConstantNode.ts`
- `utils\object.ts`
- `function\algebra\simplifyCore.ts`
- `expression\node\FunctionAssignmentNode.ts`
- `function\algebra\simplify\util.ts`
- `expression\parse.ts`
- `entry\impureFunctionsAny.generated.ts`
- `entry\impureFunctionsNumber.generated.ts`
- `utils\snapshot.ts`
- `function\algebra\resolve.ts`
- `core\function\import.ts`
- `expression\node\ObjectNode.ts`
- `expression\node\OperatorNode.ts`
- `expression\node\AssignmentNode.ts`
- `expression\node\ConditionalNode.ts`
- `expression\Parser.ts`
- `utils\string.ts`
- `type\unit\Unit.ts`
- `utils\is.ts`
- `function\algebra\simplifyConstant.ts`
- `function\algebra\simplify.ts`
- `type\chain\Chain.ts`
- `expression\node\FunctionNode.ts`

</details>

---

## Already Implemented in WASM

These 198 files already have equivalent implementations in `src/wasm/`.

<details>
<summary>Click to expand full list</summary>

- `constants.ts`
- `function\algebra\decomposition\lup.ts`
- `function\algebra\decomposition\qr.ts`
- `function\algebra\decomposition\schur.ts`
- `function\algebra\solver\lsolve.ts`
- `function\algebra\solver\lsolveAll.ts`
- `function\algebra\solver\lusolve.ts`
- `function\algebra\solver\usolve.ts`
- `function\algebra\solver\usolveAll.ts`
- `function\algebra\sparse\csAmd.ts`
- `function\algebra\sparse\csChol.ts`
- `function\algebra\sparse\csCounts.ts`
- `function\algebra\sparse\csCumsum.ts`
- `function\algebra\sparse\csDfs.ts`
- `function\algebra\sparse\csEreach.ts`
- `function\algebra\sparse\csEtree.ts`
- `function\algebra\sparse\csFkeep.ts`
- `function\algebra\sparse\csFlip.ts`
- `function\algebra\sparse\csIpvec.ts`
- `function\algebra\sparse\csLeaf.ts`
- `function\algebra\sparse\csLu.ts`
- `function\algebra\sparse\csMark.ts`
- `function\algebra\sparse\csMarked.ts`
- `function\algebra\sparse\csPermute.ts`
- `function\algebra\sparse\csPost.ts`
- `function\algebra\sparse\csReach.ts`
- `function\algebra\sparse\csSpsolve.ts`
- `function\algebra\sparse\csTdfs.ts`
- `function\algebra\sparse\csUnflip.ts`
- `function\arithmetic\abs.ts`
- `function\arithmetic\add.ts`
- `function\arithmetic\cbrt.ts`
- `function\arithmetic\ceil.ts`
- `function\arithmetic\cube.ts`
- `function\arithmetic\divide.ts`
- `function\arithmetic\dotDivide.ts`
- `function\arithmetic\dotMultiply.ts`
- `function\arithmetic\dotPow.ts`
- `function\arithmetic\exp.ts`
- `function\arithmetic\expm1.ts`
- `function\arithmetic\floor.ts`
- `function\arithmetic\gcd.ts`
- `function\arithmetic\hypot.ts`
- `function\arithmetic\invmod.ts`
- `function\arithmetic\lcm.ts`
- `function\arithmetic\log.ts`
- `function\arithmetic\log10.ts`
- `function\arithmetic\log1p.ts`
- `function\arithmetic\log2.ts`
- `function\arithmetic\mod.ts`
- `function\arithmetic\multiply.ts`
- `function\arithmetic\norm.ts`
- `function\arithmetic\nthRoot.ts`
- `function\arithmetic\nthRoots.ts`
- `function\arithmetic\pow.ts`
- `function\arithmetic\round.ts`
- `function\arithmetic\sign.ts`
- `function\arithmetic\sqrt.ts`
- `function\arithmetic\square.ts`
- `function\arithmetic\subtract.ts`
- `function\arithmetic\xgcd.ts`
- `function\bitwise\bitAnd.ts`
- `function\bitwise\bitNot.ts`
- `function\bitwise\bitOr.ts`
- `function\bitwise\bitXor.ts`
- `function\bitwise\leftShift.ts`
- `function\bitwise\rightArithShift.ts`
- `function\bitwise\rightLogShift.ts`
- `function\combinatorics\bellNumbers.ts`
- `function\combinatorics\catalan.ts`
- `function\combinatorics\composition.ts`
- `function\combinatorics\stirlingS2.ts`
- `function\complex\arg.ts`
- `function\complex\conj.ts`
- `function\complex\im.ts`
- `function\complex\re.ts`
- `function\geometry\distance.ts`
- `function\geometry\intersect.ts`
- `function\logical\and.ts`
- `function\logical\not.ts`
- `function\logical\or.ts`
- `function\logical\xor.ts`
- `function\matrix\cross.ts`
- `function\matrix\det.ts`
- `function\matrix\diag.ts`
- `function\matrix\dot.ts`
- `function\matrix\expm.ts`
- `function\matrix\fft.ts`
- `function\matrix\flatten.ts`
- `function\matrix\identity.ts`
- `function\matrix\ifft.ts`
- `function\matrix\inv.ts`
- `function\matrix\kron.ts`
- `function\matrix\ones.ts`
- `function\matrix\pinv.ts`
- `function\matrix\range.ts`
- `function\matrix\reshape.ts`
- `function\matrix\rotate.ts`
- `function\matrix\rotationMatrix.ts`
- `function\matrix\sqrtm.ts`
- `function\matrix\trace.ts`
- `function\matrix\transpose.ts`
- `function\matrix\zeros.ts`
- `function\probability\combinations.ts`
- `function\probability\combinationsWithRep.ts`
- `function\probability\factorial.ts`
- `function\probability\gamma.ts`
- `function\probability\lgamma.ts`
- `function\probability\permutations.ts`
- `function\probability\random.ts`
- `function\probability\randomInt.ts`
- `function\relational\compare.ts`
- `function\relational\compareNatural.ts`
- `function\relational\equal.ts`
- `function\relational\equalScalar.ts`
- `function\relational\larger.ts`
- `function\relational\largerEq.ts`
- `function\relational\smaller.ts`
- `function\relational\smallerEq.ts`
- `function\relational\unequal.ts`
- `function\set\setCartesian.ts`
- `function\set\setDifference.ts`
- `function\set\setDistinct.ts`
- `function\set\setIntersect.ts`
- `function\set\setIsSubset.ts`
- `function\set\setMultiplicity.ts`
- `function\set\setPowerset.ts`
- `function\set\setSize.ts`
- `function\set\setSymDifference.ts`
- `function\set\setUnion.ts`
- `function\signal\freqz.ts`
- `function\signal\zpk2tf.ts`
- `function\special\erf.ts`
- `function\special\zeta.ts`
- `function\statistics\corr.ts`
- `function\statistics\cumsum.ts`
- `function\statistics\mad.ts`
- `function\statistics\max.ts`
- `function\statistics\mean.ts`
- `function\statistics\median.ts`
- `function\statistics\min.ts`
- `function\statistics\mode.ts`
- `function\statistics\prod.ts`
- `function\statistics\quantileSeq.ts`
- `function\statistics\std.ts`
- `function\statistics\sum.ts`
- `function\statistics\variance.ts`
- `function\trigonometry\acos.ts`
- `function\trigonometry\acosh.ts`
- `function\trigonometry\acot.ts`
- `function\trigonometry\acoth.ts`
- `function\trigonometry\acsc.ts`
- `function\trigonometry\acsch.ts`
- `function\trigonometry\asec.ts`
- `function\trigonometry\asech.ts`
- `function\trigonometry\asin.ts`
- `function\trigonometry\asinh.ts`
- `function\trigonometry\atan.ts`
- `function\trigonometry\atan2.ts`
- `function\trigonometry\atanh.ts`
- `function\trigonometry\cos.ts`
- `function\trigonometry\cosh.ts`
- `function\trigonometry\cot.ts`
- `function\trigonometry\coth.ts`
- `function\trigonometry\csc.ts`
- `function\trigonometry\csch.ts`
- `function\trigonometry\sec.ts`
- `function\trigonometry\sech.ts`
- `function\trigonometry\sin.ts`
- `function\trigonometry\sinh.ts`
- `function\trigonometry\tan.ts`
- `function\trigonometry\tanh.ts`
- `function\utils\clone.ts`
- `function\utils\hasNumericValue.ts`
- `function\utils\isFinite.ts`
- `function\utils\isInteger.ts`
- `function\utils\isNaN.ts`
- `function\utils\isNegative.ts`
- `function\utils\isNumeric.ts`
- `function\utils\isPositive.ts`
- `function\utils\isPrime.ts`
- `function\utils\isZero.ts`
- `function\utils\numeric.ts`
- `function\utils\typeOf.ts`
- `plain\bignumber\arithmetic.ts`
- `plain\number\arithmetic.ts`
- `plain\number\bitwise.ts`
- `plain\number\combinations.ts`
- `plain\number\constants.ts`
- `plain\number\logical.ts`
- `plain\number\probability.ts`
- `plain\number\relational.ts`
- `plain\number\trigonometry.ts`
- `plain\number\utils.ts`
- `utils\bignumber\bitwise.ts`
- `utils\bignumber\constants.ts`
- `utils\log.ts`
- `utils\noop.ts`

</details>

---

## Scoring Criteria

### Incompatibility Indicators (Negative Score)

| Pattern | Weight | Reason |
|---------|--------|--------|
| `any` type | 10 | No dynamic typing in AS |
| `instanceof` | 8 | No runtime type checking |
| RegExp | 10 | No regex support |
| String methods | 5-8 | Limited string support |
| Map/Set/WeakMap | 5-10 | Use typed arrays instead |
| async/await/Promise | 10 | No async in AS |
| Expression imports | 10 | Parser not convertible |
| BigNumber/Fraction | 6-8 | Use numeric alternatives |

### Compatibility Indicators (Positive Score)

| Pattern | Weight | Reason |
|---------|--------|--------|
| TypedArrays | 5 | Native AS support |
| Explicit numeric types | 3 | Clean conversion |
| Math.* functions | 2 | Direct AS equivalents |
| Numeric for loops | 2 | Efficient AS code |

---

## Recommendations

1. **Focus on high-value targets**: Files with numeric algorithms that would benefit from WASM acceleration
2. **Skip utility files**: Small helper functions may not justify conversion overhead
3. **Check existing WASM**: Many functions are already implemented in `src/wasm/`
4. **Consider numerical alternatives**: For symbolic operations, use numerical methods instead

## References

- [AssemblyScript Documentation](https://www.assemblyscript.org/)
- [WASM Implementation Plan](../REFACTORING_TO_ASSEMBLYSCRIPT_PLAN.md)
- [Existing WASM Modules](../../src/wasm/)
