const path = require('path');
module.exports = {
  env: {
    browser: true,
  },
  globals: {
    __API__: '',
    __BASENAME__: '',
    __DOMAIN__: '',
    __COUNTRY_FLAGS_CDN__: '',
    __PRODUCTION__: false,
    __VERSION__: '',
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
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/media-has-caption': 0,
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'no-alert': 0,
  },
};
