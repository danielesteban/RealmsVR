const path = require('path');
module.exports = {
  env: {
    browser: true,
  },
  globals: {
    __ANALYTICS__: 'readonly',
    __API__: 'readonly',
    __BASENAME__: 'readonly',
    __DOMAIN__: 'readonly',
    __COUNTRY_FLAGS_CDN__: 'readonly',
    __PRODUCTION__: 'readonly',
    __VERSION__: 'readonly',
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', path.resolve(__dirname, 'src')],
          ['three', 'three-optionalxr'],
        ],
        extensions: [
          '.js', '.jsx', '.json',
        ],
      },
    },
  },
  rules: {
    'jsx-a11y/alt-text': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/media-has-caption': 0,
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/jsx-props-no-spreading': 0,
  },
};
