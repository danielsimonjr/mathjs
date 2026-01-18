# Type Precedence for Node Operations

This document explains the critical ordering requirements for typed-function signatures when implementing Node-aware arithmetic operators.

## How typed-function Dispatch Works

typed-function dispatches to the **FIRST matching signature** in declaration order. This means:

1. More specific types must be declared BEFORE more general types
2. `'any, any'` catch-all signatures must come LAST
3. Node signatures must appear BEFORE generic signatures

## Critical Rule

**Node signatures MUST be declared BEFORE 'any, any' catch-all signatures.**

If `'any, any'` appears first, it will match Node arguments and the Node-specific handlers will never be reached.

## Correct Signature Order

```javascript
typed(name, {
  // SPECIFIC: Node signatures first (highest priority)
  'Node, Node': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  'Node, number': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  'number, Node': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  'Node, BigNumber': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  'BigNumber, Node': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  // ... more Node combinations ...

  // MEDIUM: Specific type signatures
  'number, number': (x, y) => x + y,
  'BigNumber, BigNumber': (x, y) => x.plus(y),
  'Complex, Complex': (x, y) => x.add(y),
  // ... more specific types ...

  // GENERAL: Catch-all last (lowest priority)
  'any, any': (x, y) => scalarHandler(x, y)
})
```

## Incorrect Signature Order (Bug!)

```javascript
typed(name, {
  // BUG: Catch-all catches everything including Nodes!
  'any, any': (x, y) => scalarHandler(x, y),

  // UNREACHABLE: Node signatures never execute
  'Node, Node': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y),
  'Node, number': (x, y) => nodeOperations.createBinaryNode(op, fn, x, y)
})
```

## Node Type Hierarchy

In math.js, the Node types are registered in typed-function as:

- `Node` - Base type for all expression nodes (matches any node)
- `ConstantNode` - Numeric/string constants
- `SymbolNode` - Variable references
- `OperatorNode` - Binary/unary operators
- `FunctionNode` - Function calls
- And more...

When checking for Node arguments, use the base `Node` type to match all node subtypes:

```javascript
'Node, Node': handler,       // Matches any two nodes
'Node, number': handler,     // Matches any node + number
'SymbolNode, number': handler  // Only matches SymbolNode + number
```

## Verification

To verify Node types are correctly registered:

```javascript
const math = require('mathjs')
const x = new math.SymbolNode('x')

console.log(math.typeOf(x))  // 'SymbolNode'
console.log(math.typeOf(new math.ConstantNode(5)))  // 'ConstantNode'
```

## Implementation Checklist

When adding Node support to an operator:

1. Add `nodeOperations` to dependencies
2. Add Node signatures at the TOP of the signature object
3. Ensure 'any, any' (if present) is at the BOTTOM
4. Test with both `math.add(5, symbolNode)` and `math.add(symbolNode, 5)`

## Related Files

- `src/core/function/typed.ts` - Type registrations
- `src/function/arithmetic/utils/nodeOperations.ts` - Node operation utilities
- `docs/refactoring/phases/signature-template.ts` - Signature templates
