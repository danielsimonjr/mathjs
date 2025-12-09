// @ts-nocheck
/**
 * Advanced jscodeshift transform for Math.js → TypeScript conversion
 *
 * This transform is specifically designed for Math.js patterns:
 * - Factory functions with dependency injection
 * - typed-function signatures
 * - Matrix operations with multiple type signatures
 * - Big numbers, complex numbers, fractions, units
 *
 * Usage:
 *   # Dry run (preview changes without modifying files)
 *   npx jscodeshift -t tools/transform-mathjs-to-ts.js src/function/arithmetic/add.js --dry --print
 *
 *   # Convert single file
 *   npx jscodeshift -t tools/transform-mathjs-to-ts.js src/function/arithmetic/add.js
 *
 *   # Convert all arithmetic functions
 *   npx jscodeshift -t tools/transform-mathjs-to-ts.js src/function/arithmetic/*.js
 *
 *   # Convert with options
 *   npx jscodeshift -t tools/transform-mathjs-to-ts.js src/function/arithmetic/*.js --extensions=js --parser=babel
 */

const fs = require('fs');
const path = require('path');

// Load dependency graph for enhanced type inference
let dependencyGraph = null;
try {
  const graphPath = path.join(__dirname, 'dependency-graph.json');
  if (fs.existsSync(graphPath)) {
    dependencyGraph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
    console.log('📊 Loaded dependency graph with', Object.keys(dependencyGraph.files).length, 'files');
  }
} catch (err) {
  console.warn('⚠️  Could not load dependency graph:', err.message);
}

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const filePath = file.path;

  console.log(`\n📝 Processing: ${filePath}`);

  let modifications = {
    imports: 0,
    factoryTypes: 0,
    typedFunctionSignatures: 0,
    jsdocConversions: 0,
    typeAnnotations: 0
  };

  // ========================================
  // Step 1: Update import extensions .js → .ts
  // ========================================
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source;
    if (source.value && source.value.match(/\.js$/)) {
      const oldValue = source.value;
      source.value = source.value.replace(/\.js$/, '.ts');
      console.log(`  ✓ Import: ${oldValue} → ${source.value}`);
      modifications.imports++;
    }
  });

  // ========================================
  // Step 2: Convert factory function to TypeScript
  // ========================================
  root.find(j.ExportNamedDeclaration).forEach(path => {
    const declaration = path.node.declaration;

    // Pattern: export const createFoo = /* #__PURE__ */ factory('foo', [...], ({ deps }) => {...})
    if (declaration?.type === 'VariableDeclaration') {
      const declarator = declaration.declarations[0];
      const init = declarator.init;

      // Check if it's a factory call (with or without PURE comment)
      const factoryCall = init?.type === 'CallExpression' && init.callee.name === 'factory'
        ? init
        : init?.type === 'CallExpression' && init.callee.type === 'CallExpression' && init.callee.callee.name === 'factory'
          ? init.callee
          : null;

      if (factoryCall && factoryCall.arguments.length >= 3) {
        const factoryNameArg = factoryCall.arguments[0];
        // Handle both literals ('add') and identifiers (name variable)
        const factoryName = factoryNameArg.type === 'Literal'
          ? factoryNameArg.value
          : factoryNameArg.type === 'Identifier'
            ? factoryNameArg.name
            : 'unknown';
        const dependencies = factoryCall.arguments[1]; // ['typed', 'matrix', ...]
        const factoryImpl = factoryCall.arguments[2]; // ({ typed, matrix }) => {...}

        console.log(`  🏭 Factory: ${factoryName}`);

        // Add type annotations to dependency parameters
        if (factoryImpl.params && factoryImpl.params[0]?.type === 'ObjectPattern') {
          const depObject = factoryImpl.params[0];

          // Build type annotation for the entire object parameter
          const typeProperties = [];
          depObject.properties.forEach(prop => {
            if (prop.type === 'Property') {
              const depName = prop.key.name;
              const inferredType = inferDependencyType(depName);

              // Create type property signature
              const typeProp = j.tsPropertySignature(
                j.identifier(depName),
                j.tsTypeAnnotation(j.tsTypeReference(j.identifier(inferredType)))
              );

              typeProperties.push(typeProp);
              console.log(`    └─ ${depName}: ${inferredType}`);
              modifications.factoryTypes++;
            }
          });

          // Create type annotation for the object parameter
          if (typeProperties.length > 0) {
            depObject.typeAnnotation = j.tsTypeAnnotation(
              j.tsTypeLiteral(typeProperties)
            );
          }
        }

        // Analyze typed-function signatures and add return type
        const returnType = analyzeTypedFunctionReturnType(j, factoryImpl);
        if (returnType) {
          factoryImpl.returnType = j.tsTypeAnnotation(returnType);
          console.log(`    └─ Return type: ${returnType.typeName?.name || 'TypedFunction'}`);
          modifications.typedFunctionSignatures++;
        }
      }
    }
  });

  // ========================================
  // Step 3: Convert typed-function signatures to type-safe versions
  // ========================================
  root.find(j.CallExpression, { callee: { name: 'typed' } }).forEach(path => {
    const typedCall = path.node;

    if (typedCall.arguments.length >= 2 && typedCall.arguments[1].type === 'ObjectExpression') {
      const signatures = typedCall.arguments[1].properties;

      console.log(`  🔤 typed() signatures: ${signatures.length}`);

      signatures.forEach(sig => {
        if (sig.type === 'Property') {
          // Handle both string literals ("number, number") and identifiers (number)
          let signatureStr;
          if (sig.key.type === 'Literal') {
            signatureStr = sig.key.value; // e.g., "number, number" or "Array | Matrix"
          } else if (sig.key.type === 'Identifier') {
            signatureStr = sig.key.name; // e.g., "number", "BigNumber", "bigint"
          } else {
            return; // Skip unknown key types
          }

          const implFn = sig.value; // e.g., (x, y) => x + y

          // Skip function references (not inline implementations)
          if (implFn.type === 'Identifier' || implFn.type === 'MemberExpression') {
            return; // Function reference like _gcdNumber or Math.sin
          }

          // Handle variadic signature '...' - needs special treatment
          if (signatureStr === '...') {
            if (implFn.type === 'FunctionExpression' && implFn.params.length === 1) {
              // Convert single param to rest parameter with type any[]
              const param = implFn.params[0];
              param.typeAnnotation = j.tsTypeAnnotation(
                j.tsArrayType(j.tsAnyKeyword())
              );
              // Mark as rest parameter
              implFn.params[0] = j.restElement(param);

              console.log(`    └─ ... → (...args: any[])`);
              modifications.typedFunctionSignatures++;
            }
            return;
          }

          // Parse signature and add type annotations to implementation
          const types = parseTypedFunctionSignature(signatureStr);

          if (implFn.type === 'ArrowFunctionExpression' || implFn.type === 'FunctionExpression') {
            types.forEach((type, idx) => {
              if (implFn.params[idx]) {
                implFn.params[idx].typeAnnotation = j.tsTypeAnnotation(
                  createTypeNode(j, type)
                );
              }
            });

            // Infer return type from signature
            const returnType = inferReturnTypeFromSignature(signatureStr, types);
            if (returnType) {
              implFn.returnType = j.tsTypeAnnotation(createTypeNode(j, returnType));
            }

            console.log(`    └─ ${signatureStr} → (${types.join(', ')}) => ${returnType || 'inferred'}`);
            modifications.typedFunctionSignatures++;
          }
        }
      });
    }
  });

  // ========================================
  // Step 4: Convert JSDoc to TypeScript type annotations
  // ========================================
  root.find(j.VariableDeclarator).forEach(path => {
    const declarator = path.node;

    // Check for leading JSDoc comment
    const parentPath = path.parent;
    if (parentPath.value.comments && parentPath.value.comments.length > 0) {
      const jsdocComment = parentPath.value.comments.find(c => c.type === 'CommentBlock' && c.value.includes('@param'));

      if (jsdocComment && declarator.init) {
        const jsdoc = parseJSDoc(jsdocComment.value);

        if (jsdoc.params.length > 0 || jsdoc.returns) {
          console.log(`  📖 JSDoc conversion detected`);

          // Apply to arrow function or function expression
          const func = declarator.init;
          if (func.type === 'ArrowFunctionExpression' || func.type === 'FunctionExpression') {
            // Add parameter types
            jsdoc.params.forEach((param, idx) => {
              if (func.params[idx]) {
                func.params[idx].typeAnnotation = j.tsTypeAnnotation(
                  parseJSDocTypeToTS(j, param.type)
                );
                console.log(`    └─ @param ${param.name}: ${param.type}`);
                modifications.jsdocConversions++;
              }
            });

            // Add return type
            if (jsdoc.returns) {
              func.returnType = j.tsTypeAnnotation(
                parseJSDocTypeToTS(j, jsdoc.returns)
              );
              console.log(`    └─ @returns ${jsdoc.returns}`);
              modifications.jsdocConversions++;
            }
          }
        }
      }
    }
  });

  // ========================================
  // Step 5: Add necessary type imports
  // ========================================
  const needsTypeImports = determineNeededTypeImports(root, j);
  if (needsTypeImports.length > 0) {
    addTypeImports(root, j, needsTypeImports);
    modifications.typeAnnotations += needsTypeImports.length;
    console.log(`  📦 Added type imports: ${needsTypeImports.join(', ')}`);
  }

  // ========================================
  // Summary
  // ========================================
  const totalMods = Object.values(modifications).reduce((a, b) => a + b, 0);

  if (totalMods > 0) {
    console.log(`\n  ✅ Applied ${totalMods} modifications:`);
    console.log(`     - ${modifications.imports} import updates`);
    console.log(`     - ${modifications.factoryTypes} factory parameter types`);
    console.log(`     - ${modifications.typedFunctionSignatures} typed-function signatures`);
    console.log(`     - ${modifications.jsdocConversions} JSDoc conversions`);
    console.log(`     - ${modifications.typeAnnotations} type imports\n`);

    // Use TypeScript-specific printing options
    let code = root.toSource({
      quote: 'single',
      arrowParensAlways: true, // Force parentheses around arrow function params
      objectCurlySpacing: true,
      trailingComma: false
    });

    // Post-process: Fix arrow functions with single typed parameters
    // recast doesn't always add parentheses around single params with type annotations
    // Pattern: "param: Type =>" should be "(param: Type) =>"
    // BUT: Don't match object properties like "Array: x: any[] =>" or "'string': x: Type =>"
    // Use a more specific pattern: match only when preceded by whitespace or comma, not colon
    code = code.replace(/([,\s])(\w+): ([\w\s|[\]<>]+) =>/g, '$1($2: $3) =>');

    return code;
  } else {
    console.log(`  ⏭️  No modifications needed\n`);
    return null; // No changes
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Infer TypeScript type for Math.js dependency parameters
 * Enhanced with dependency graph lookup
 */
function inferDependencyType(depName) {
  // First, try to look up the dependency in the dependency graph
  if (dependencyGraph && dependencyGraph.functions) {
    const functionInfo = dependencyGraph.functions[depName];
    if (functionInfo) {
      // Check if the TypeScript version of this file exists
      const tsFilePath = path.join(__dirname, '..', 'src', functionInfo.file.replace(/\.js$/, '.ts'));
      if (fs.existsSync(tsFilePath)) {
        // Attempt to extract type signature from the TypeScript file
        try {
          const tsContent = fs.readFileSync(tsFilePath, 'utf-8');

          // Look for the export pattern: export const createFoo = factory(..., ({ deps }) => TypedFunction)
          // Extract the return type annotation if present
          const returnTypeMatch = tsContent.match(new RegExp(`export\\s+const\\s+create${capitalize(depName)}\\s*=.*=>\\s*([\\w<>]+)`));
          if (returnTypeMatch) {
            return returnTypeMatch[1];
          }

          // If we found a .ts file but couldn't extract the type, mark it as TypedFunction (safer than 'any')
          return 'TypedFunction';
        } catch (err) {
          // Fall through to hardcoded mappings
        }
      }
    }
  }

  // Fallback to hardcoded type mappings
  const knownTypes = {
    // Core dependencies
    'typed': 'TypedFunction',
    'config': 'ConfigOptions',

    // Type constructors
    'matrix': 'MatrixConstructor',
    'Matrix': 'typeof Matrix',
    'DenseMatrix': 'typeof DenseMatrix',
    'SparseMatrix': 'typeof SparseMatrix',
    'BigNumber': 'typeof BigNumber',
    'Complex': 'typeof Complex',
    'Fraction': 'typeof Fraction',
    'Unit': 'typeof Unit',
    'Range': 'typeof Range',
    'Index': 'typeof Index',
    'ResultSet': 'typeof ResultSet',

    // Scalar operations
    'addScalar': '(a: number, b: number) => number',
    'subtractScalar': '(a: number, b: number) => number',
    'multiplyScalar': '(a: number, b: number) => number',
    'divideScalar': '(a: number, b: number) => number',
    'powScalar': '(a: number, b: number) => number',
    'modScalar': '(a: number, b: number) => number',
    'unaryMinus': '(a: number) => number',
    'unaryPlus': '(a: number) => number',

    // Comparison operations
    'equalScalar': '(a: any, b: any) => boolean',
    'compareNatural': '(a: any, b: any) => number',
    'smaller': '(a: any, b: any) => boolean',
    'larger': '(a: any, b: any) => boolean',

    // Type checking utilities
    'isInteger': '(value: any) => boolean',
    'isNumeric': '(value: any) => boolean',
    'isPositive': '(value: any) => boolean',
    'isNegative': '(value: any) => boolean',
    'isZero': '(value: any) => boolean',
    'isNaN': '(value: any) => boolean',

    // Matrix algorithms (sparse)
    'algorithm01': 'SparseMatrixAlgorithm',
    'algorithm02': 'SparseMatrixAlgorithm',
    'algorithm03': 'SparseMatrixAlgorithm',
    'algorithm04': 'SparseMatrixAlgorithm',
    'algorithm05': 'SparseMatrixAlgorithm',
    'algorithm06': 'DenseMatrixAlgorithm',
    'algorithm07': 'DenseMatrixAlgorithm',
    'algorithm08': 'MatrixAlgorithm',
    'algorithm09': 'MatrixAlgorithm',
    'algorithm10': 'MatrixAlgorithm',
    'algorithm11': 'MatrixAlgorithm',
    'algorithm12': 'MatrixAlgorithm',
    'algorithm13': 'MatrixAlgorithm',
    'algorithm14': 'MatrixAlgorithm',
  };

  return knownTypes[depName] || 'any';
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Analyze typed() call and infer return type
 */
function analyzeTypedFunctionReturnType(j, factoryFunction) {
  // Look for typed() call in the function body
  const typedCalls = j(factoryFunction.body)
    .find(j.CallExpression, { callee: { name: 'typed' } });

  if (typedCalls.length > 0) {
    // Return TypedFunction type reference (without generic parameters)
    return j.tsTypeReference(
      j.identifier('TypedFunction')
    );
  }

  return null;
}

/**
 * Parse typed-function signature string into types
 * e.g., "number, number" → ["number", "number"]
 *       "Matrix, Matrix" → ["Matrix", "Matrix"]
 */
function parseTypedFunctionSignature(signatureStr) {
  // Handle union types with | (e.g., "Array | Matrix")
  // Don't split on | inside a type, only split on commas between parameters

  // If no comma, it's a single parameter (which might be a union)
  if (!signatureStr.includes(',')) {
    return [signatureStr.trim()];
  }

  // Split by comma for multiple parameters
  return signatureStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Infer return type from typed-function signature
 */
function inferReturnTypeFromSignature(signatureStr, types) {
  // Heuristics for Math.js:
  // For type-checking functions (isInteger, isPositive, etc.), return boolean
  // For arithmetic functions, return the same type as input
  // For matrix operations, return Matrix
  // For mixed types, return the "highest" type in the hierarchy

  const firstType = types[0];

  // Single parameter functions that are likely type checkers
  if (types.length === 1) {
    // Most single-parameter functions are identity or type-check
    // We can't reliably infer, so return 'any' and let manual refinement handle it
    return null; // Don't auto-infer, let TypeScript infer or require manual annotation
  }

  // If all types are the same, return type is likely the same
  if (types.every(t => t === firstType)) {
    return firstType;
  }

  // Mixed types usually return the "highest" type in the hierarchy
  // Matrix > Array > BigNumber > Complex > Fraction > Unit > number

  const typeHierarchy = ['Matrix', 'Array', 'BigNumber', 'Complex', 'Fraction', 'Unit', 'number'];

  for (const hierarchyType of typeHierarchy) {
    if (types.includes(hierarchyType)) {
      return hierarchyType;
    }
  }

  return null; // Don't infer, let TypeScript handle it
}

/**
 * Create TypeScript type AST node from type string
 */
function createTypeNode(j, typeStr) {
  const primitives = {
    'number': j.tsNumberKeyword(),
    'string': j.tsStringKeyword(),
    'boolean': j.tsBooleanKeyword(),
    'any': j.tsAnyKeyword(),
    'void': j.tsVoidKeyword(),
    'null': j.tsNullKeyword(),
    'undefined': j.tsUndefinedKeyword(),
    'bigint': j.tsBigIntKeyword(),
  };

  if (primitives[typeStr]) {
    return primitives[typeStr];
  }

  // Handle union types (e.g., "Array | Matrix")
  if (typeStr.includes(' | ')) {
    const types = typeStr.split(' | ').map(t => createTypeNode(j, t.trim()));
    return j.tsUnionType(types);
  }

  // Handle array types
  if (typeStr === 'Array' || typeStr.endsWith('[]')) {
    return j.tsArrayType(j.tsAnyKeyword());
  }

  // Handle custom types (Matrix, Complex, etc.)
  return j.tsTypeReference(j.identifier(typeStr));
}

/**
 * Parse JSDoc comment block into structured data
 */
function parseJSDoc(commentValue) {
  const result = {
    params: [],
    returns: null,
    description: ''
  };

  const lines = commentValue.split('\n').map(l => l.trim().replace(/^\*\s?/, ''));

  lines.forEach(line => {
    // @param {Type} name - description
    const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)(?:\s+-\s+(.*))?/);
    if (paramMatch) {
      result.params.push({
        type: paramMatch[1],
        name: paramMatch[2],
        description: paramMatch[3] || ''
      });
    }

    // @returns {Type} description
    const returnsMatch = line.match(/@returns?\s+\{([^}]+)\}(?:\s+(.*))?/);
    if (returnsMatch) {
      result.returns = returnsMatch[1];
    }
  });

  return result;
}

/**
 * Convert JSDoc type string to TypeScript AST type
 */
function parseJSDocTypeToTS(j, typeStr) {
  // Handle union types: number|string
  if (typeStr.includes('|')) {
    const types = typeStr.split('|').map(t => parseJSDocTypeToTS(j, t.trim()));
    return j.tsUnionType(types);
  }

  // Handle array types: Array<number>, number[]
  const arrayMatch = typeStr.match(/Array<(.+)>/);
  if (arrayMatch) {
    return j.tsArrayType(parseJSDocTypeToTS(j, arrayMatch[1]));
  }
  if (typeStr.endsWith('[]')) {
    return j.tsArrayType(parseJSDocTypeToTS(j, typeStr.slice(0, -2)));
  }

  // Handle primitives
  return createTypeNode(j, typeStr);
}

/**
 * Determine which type imports are needed
 */
function determineNeededTypeImports(root, j) {
  const typeImports = new Set();

  // Check for TypedFunction usage
  if (root.find(j.Identifier, { name: 'typed' }).length > 0) {
    typeImports.add('TypedFunction');
  }

  // Check for Matrix types
  ['Matrix', 'DenseMatrix', 'SparseMatrix'].forEach(matrixType => {
    if (root.find(j.TSTypeReference, { typeName: { name: matrixType } }).length > 0) {
      typeImports.add(matrixType);
    }
  });

  // Check for numeric types
  ['BigNumber', 'Complex', 'Fraction', 'Unit'].forEach(numericType => {
    if (root.find(j.TSTypeReference, { typeName: { name: numericType } }).length > 0) {
      typeImports.add(numericType);
    }
  });

  return Array.from(typeImports);
}

/**
 * Add type imports to the file
 */
function addTypeImports(root, j, typeNames) {
  const typeImportSpecifiers = typeNames.map(name =>
    j.importSpecifier(j.identifier(name))
  );

  const typeImportDeclaration = j.importDeclaration(
    typeImportSpecifiers,
    j.literal('../../types.ts')
  );

  // Insert after existing imports
  const lastImport = root.find(j.ImportDeclaration).at(-1);
  if (lastImport.length > 0) {
    lastImport.insertAfter(typeImportDeclaration);
  } else {
    // No imports exist, add at top
    root.get().node.program.body.unshift(typeImportDeclaration);
  }
}
