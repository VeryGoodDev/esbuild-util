module.exports = {
  overrides: [
    {
      files: [`src/esbuild/**/*.js`],
      extends: require.resolve(`@vgd/eslint-config-personal/node-js`),
    },
  ],
}
