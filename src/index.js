/**
 * Copyright 2020 hueyhe. All rights reserved.
 */

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export default function () {
  function cleanseInput(patterns) {
    if (!patterns || !Array.isArray(patterns) || !patterns.length) {
      throw new Error(`Invalid input patterns '${patterns}'.`);
    }

    const count = patterns.length;
    const cleansed = [];
    for (let i = 0; i < count; i += 1) {
      let pattern = patterns[i];
      const isString = typeof pattern === 'string';
      if (!(pattern instanceof RegExp) && !isString) {
        throw new Error(`Invalid pattern '${pattern}'. A pattern should be either a string or a regular expression.`);
      }
      if (isString) {
        pattern = new RegExp(escapeRegExp(pattern));
      }
      cleansed.push(pattern);
    }
    return cleansed;
  }

  function matched(value, patterns) {
    const count = patterns.length;
    for (let i = 0; i < count; i += 1) {
      if (patterns[i].test(value)) {
        return true;
      }
    }
    return false;
  }

  return {
    visitor: {
      ImportDeclaration: {
        enter(path, { opts }) {
          const { patterns: patternsInput } = opts;
          const patterns = cleanseInput(patternsInput);

          if (matched(path.node.source.value, patterns)) {
            const specifiers = path.get('specifiers');

            if (specifiers.length) {
              const specifier = specifiers[specifiers.length - 1];

              if (specifier.isImportDefaultSpecifier()) {
                return console.warn(`${path.node.source.value} should not be imported using default imports. Import ignoring not applied.`);
              }
              if (specifier.isImportSpecifier()) {
                return console.warn(`${path.node.source.value} should not be imported using named imports. Import ignoring not applied.`);
              }
              if (specifier.isImportNamespaceSpecifier()) {
                return console.warn(`${path.node.source.value} should not be imported using namespace imports. Import ignoring not applied.`);
              }
            }

            path.remove();
          }
        },
      },

      CallExpression: {
        enter(path, { opts }) {
          const { patterns: patternsInput } = opts;

          const callee = path.get('callee');
          if (callee.isIdentifier() && callee.equals('name', 'require')) {
            const arg = path.get('arguments')[0];
            const patterns = cleanseInput(patternsInput);

            if (arg && arg.isStringLiteral() && matched(arg.node.value, patterns)) {
              if (path.parentPath.isVariableDeclarator()) {
                return console.warn(`${arg.node.value} should not be assigned to variable. Import ignoring not applied.`);
              }
              path.remove();
            }
          }

          if (callee.isImport()) {
            const arg = path.get('arguments')[0];
            const patterns = cleanseInput(patternsInput);

            if (arg && arg.isStringLiteral() && matched(arg.node.value, patterns)) {
              const expPath = path.findParent(parent => parent.isExpressionStatement());
              if (!expPath) {
                return console.warn(`Dynamic imported ${arg.node.value} should not be used as type other than expression statement. Import ignoring not applied.`);
              }
              expPath.remove();
            }
          }
        },
      },
    },
  };
}
