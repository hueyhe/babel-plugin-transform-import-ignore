# babel-plugin-transform-import-ignore

Ignore imports that do not work in node environment. The most common use case is ignoring stylesheet imports in server-side rendering.

## Install

```bash
$ yarn add babel-plugin-transform-import-ignore --dev
```

## Usage

Configure the plguin in your babel configuration file and specify the import paths that you want to ignore.

```.babalrc
{
  "plugins": [
    [
      "babel-plugin-transform-import-ignore",
      {
        "patterns": [/\.s?css$/, /\.less$/]
      }
    ]
  ]
}
```

The plugin only deals with import expressions with side-effect. If the imported module is assgined to a variable, the import statement won't be ignored.

```javascript
import './path/to/style.css'; // If pattern matched, will be ignored.

import css from './path/to/style.css'; // Won't be ignored even if pattern matched.
```
