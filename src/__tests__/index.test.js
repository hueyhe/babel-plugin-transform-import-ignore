import { transform } from '@babel/core';
import plugin from '../';

const exampleCode = `
import defaultExport from 'module-name';
import * as name from 'module-name';
import { export1 } from 'module-name';
import { export1 as alias1 } from 'module-name';
import { export3, export4 } from 'module-name';
import { foo , bar } from 'module-name/path/to/specific/un-exported/file';
import { export5 , export6 as alias2 } from 'module-name';
import defaultExport2, { export7 } from 'module-name';
import defaultExport3, * as defaultName from 'module-name';
import 'module-name';

import './a/very/long/path/to/the/style.ext';

import('./path/to/style.css').then(() => {});

require('./path/to/style.css');

const style = require('./path/to/style.css');

async function dynamicImport() {
  await import('./path/to/style.css');
  const style = await import('./path/to/style.css');
}
`;

it('works', () => {
  const { code } = transform(exampleCode, {
    plugins: [
      [
        plugin,
        {
          patterns: [/\.s?css$/, 'module-name', './a/very/long/*/style.ext'],
        },
      ]
    ],
  });
  expect(code).toMatchSnapshot();
});
