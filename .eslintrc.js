module.exports = {
    root: false,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/essential',
        // '@vue/standard',
        '@vue/prettier',
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'comma-dangle': ['error', 'always-multiline'],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
}
