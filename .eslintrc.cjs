module.exports = {
  overrides: [
    {
      files: [`src/**/*.js`],
      extends: require.resolve(`@vgd/eslint-config-personal/node-js`),
    },
  ],
}
