// @ts-nocheck
/**
 * jscodeshift transform to convert Math.js factory functions from JS to TypeScript
 *
 * Usage:
 *   npx jscodeshift -t tools/transform-to-ts.js src/function/arithmetic/add.js
 *   npx jscodeshift -t tools/transform-to-ts.js src/function/arithmetic/*.js --dry --print
 *
 * Features:
 * - Converts factory function parameters to typed parameters
 * - Adds return type annotations based on typed-function signatures
 * - Converts JSDoc @param and @returns to TypeScript types
 * - Updates imports to use .ts extensions
 * - Adds TypeScript-specific type guards where needed
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Step 1: Convert imports to .ts extensions
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source;
    if (source.value && source.value.endsWith('.js')) {
      source.value = source.value.replace(/\.js$/, '.ts');
      hasModifications = true;
    }
  });

  // Step 2: Find factory function exports
  root.find(j.ExportNamedDeclaration).forEach(path => {
    const declaration = path.node.declaration;

    // Look for: export const createAdd = factory(...)
    if (declaration &&
        declaration.type === 'VariableDeclaration' &&
        declaration.declarations[0].init &&
        declaration.declarations[0].init.callee &&
        declaration.declarations[0].init.callee.name === 'factory') {

      const functionName = declaration.declarations[0].id.name;
      const factoryCall = declaration.declarations[0].init;

      // Extract factory arguments
      const factoryName = factoryCall.arguments[0].value; // 'add'
      const dependencies = factoryCall.arguments[1]; // ['typed', 'matrix', ...]
      const factoryFunction = factoryCall.arguments[2]; // ({ typed, matrix }) => {...}

      // Add type annotations to factory function parameters
      if (factoryFunction && factoryFunction.params && factoryFunction.params[0]) {
        const param = factoryFunction.params[0];

        // Convert destructured parameters to typed versions
        if (param.type === 'ObjectPattern') {
          param.properties.forEach(prop => {
            // Add type annotation for dependency parameters
            const paramName = prop.key.name;
            prop.value = j.identifier.from({
              name: paramName,
              typeAnnotation: j.tsTypeAnnotation(
                j.tsTypeReference(
                  j.identifier(inferDependencyType(paramName))
                )
              )
            });
          });
          hasModifications = true;
        }
      }

      // Try to infer return type from typed-function signatures
      const returnType = inferReturnType(factoryFunction);
      if (returnType && factoryFunction.body) {
        factoryFunction.returnType = j.tsTypeAnnotation(returnType);
        hasModifications = true;
      }
    }
  });

  // Step 3: Convert JSDoc types to TypeScript annotations
  root.find(j.FunctionDeclaration).forEach(path => {
    const func = path.node;

    // Extract JSDoc comments
    if (func.comments && func.comments.length > 0) {
      const jsdoc = func.comments[0].value;

      // Parse @param {Type} name
      const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)/g;
      let match;
      while ((match = paramRegex.exec(jsdoc)) !== null) {
        const [, type, paramName] = match;
        const param = func.params.find(p => p.name === paramName);
        if (param) {
          param.typeAnnotation = j.tsTypeAnnotation(
            parseJSDocType(j, type)
          );
          hasModifications = true;
        }
      }

      // Parse @returns {Type}
      const returnsRegex = /@returns?\s+\{([^}]+)\}/;
      const returnsMatch = jsdoc.match(returnsRegex);
      if (returnsMatch) {
        const returnType = returnsMatch[1];
        func.returnType = j.tsTypeAnnotation(
          parseJSDocType(j, returnType)
        );
        hasModifications = true;
      }
    }
  });

  // Step 4: Add utility type imports if needed
  if (hasModifications) {
    // Check if we need to import types
    const needsTypedFunction = root.find(j.Identifier, { name: 'typed' }).length > 0;
    const needsMatrix = root.find(j.Identifier, { name: 'matrix' }).length > 0;

    const typeImports = [];
    if (needsTypedFunction) {
      typeImports.push(j.importSpecifier(j.identifier('TypedFunction')));
    }
    if (needsMatrix) {
      typeImports.push(j.importSpecifier(j.identifier('Matrix')));
    }

    if (typeImports.length > 0) {
      const typeImportDeclaration = j.importDeclaration(
        typeImports,
        j.literal('../types.ts')
      );

      // Add type import at the top
      const firstImport = root.find(j.ImportDeclaration).at(0);
      if (firstImport.length > 0) {
        firstImport.insertBefore(typeImportDeclaration);
      } else {
        root.get().node.program.body.unshift(typeImportDeclaration);
      }
    }
  }

  return hasModifications ? root.toSource() : null;
};

/**
 * Infer TypeScript type for a dependency parameter
 */
function inferDependencyType(paramName) {
  const typeMap = {
    'typed': 'TypedFunction',
    'matrix': 'MatrixConstructor',
    'equalScalar': '(a: any, b: any) => boolean',
    'addScalar': '(a: number, b: number) => number',
    'multiplyScalar': '(a: number, b: number) => number',
    'subtractScalar': '(a: number, b: number) => number',
    'divideScalar': '(a: number, b: number) => number',
    'unaryMinus': '(a: number) => number',
    'isInteger': '(value: any) => boolean',
    'isNumeric': '(value: any) => boolean',
    'DenseMatrix': 'typeof DenseMatrix',
    'SparseMatrix': 'typeof SparseMatrix',
    'BigNumber': 'typeof BigNumber',
    'Complex': 'typeof Complex',
    'Fraction': 'typeof Fraction',
    'Unit': 'typeof Unit',
  };

  return typeMap[paramName] || 'any';
}

/**
 * Infer return type from typed-function body
 */
function inferReturnType(factoryFunction) {
  // This is a simplified version - in practice, you'd analyze the typed() call
  // and extract return types from the signature map

  // For now, return a generic typed function type
  const j = require('jscodeshift');
  return j.tsTypeReference(
    j.identifier('TypedFunction'),
    j.tsTypeParameterInstantiation([
      j.tsAnyKeyword()
    ])
  );
}

/**
 * Convert JSDoc type string to TypeScript AST type node
 */
function parseJSDocType(j, typeString) {
  // Handle common JSDoc types
  const typeMap = {
    'number': j.tsNumberKeyword(),
    'string': j.tsStringKeyword(),
    'boolean': j.tsBooleanKeyword(),
    'Array': j.tsArrayType(j.tsAnyKeyword()),
    'Object': j.tsTypeLiteral([]),
    'any': j.tsAnyKeyword(),
    'void': j.tsVoidKeyword(),
    'null': j.tsNullKeyword(),
    'undefined': j.tsUndefinedKeyword(),
  };

  // Handle simple types
  if (typeMap[typeString]) {
    return typeMap[typeString];
  }

  // Handle Array<Type>
  const arrayMatch = typeString.match(/Array<(.+)>/);
  if (arrayMatch) {
    return j.tsArrayType(parseJSDocType(j, arrayMatch[1]));
  }

  // Handle union types: Type1 | Type2
  if (typeString.includes('|')) {
    const types = typeString.split('|').map(t => parseJSDocType(j, t.trim()));
    return j.tsUnionType(types);
  }

  // Handle Matrix, Complex, BigNumber, etc.
  if (/^[A-Z]/.test(typeString)) {
    return j.tsTypeReference(j.identifier(typeString));
  }

  // Default to any
  return j.tsAnyKeyword();
}
