module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '.pages-dist/**'],
  rules: {
    'color-hex-length': null,
    'color-function-notation': 'modern',
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'import-notation': 'string',
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'selector-class-pattern': null,
  },
};
