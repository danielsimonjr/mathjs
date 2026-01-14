/**
 * THIS FILE IS AUTO-GENERATED
 * DON'T MAKE CHANGES HERE
 */
import { ConstantNodeDependencies } from './dependenciesConstantNode.generated.js'
import { FunctionNodeDependencies } from './dependenciesFunctionNode.generated.js'
import { OperatorNodeDependencies } from './dependenciesOperatorNode.generated.js'
import { ParenthesisNodeDependencies } from './dependenciesParenthesisNode.generated.js'
import { parseDependencies } from './dependenciesParse.generated.js'
import { typedDependencies } from './dependenciesTyped.generated.js'
import { createResolve } from '../../factoriesNumber.js'

export const resolveDependencies: Record<string, unknown> = {
  ConstantNodeDependencies,
  FunctionNodeDependencies,
  OperatorNodeDependencies,
  ParenthesisNodeDependencies,
  parseDependencies,
  typedDependencies,
  createResolve
}
