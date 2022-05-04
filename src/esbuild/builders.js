const aliasPlugin = require(`esbuild-plugin-alias`)

const { createBuildRunner, resolveToAbsolute } = require(`./util.js`)

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 * @typedef {import('./util').BuildRunner} BuildRunner
 */

/**
 * @returns {BuildOptions}
 */
const getElectronBaseConfig = () => ({
  bundle: true,
  external: [`electron`],
  format: `esm`,
  minify: true,
  outdir: `dist/electron`,
  platform: `node`,
  target: [`node16`],
})

/**
 * Returns a build runner with reasonable defaults set for an Electron app. When calling the build runner, an override config can be provided to replace any defaults as needed. Any options that can be passed to esbuild's `build` function can be provided, but for this Electron runner, one option that **_must_** be provided is the `entryPoints` field. The reason for this is because for most Electron apps, there will often be at least two scripts that need to be handled:
 * - a main script that creates the window, handles setup, etc.
 * - and a preload script that helps bridge gaps as needed between the browser and Node JS environments
 *
 * The base config provided for this runner does not include anything for `entryPoints` to ensure that when using it, it is provided for the specific project. If an override config is not provided, or if one is provided without the `entryPoints` field, the build runner will throw an error.
 *
 * @returns {BuildRunner}
 */
const getElectronBuildRunner = () => createBuildRunner(getElectronBaseConfig(), [`entryPoints`])

const getPreactAliases = () =>
  Promise.all([resolveToAbsolute(`preact/compat`), resolveToAbsolute(`preact/test-utils`)]).then(
    ([compat, testUtils]) => ({
      react: compat,
      'react-dom': compat,
      'react-dom/test-utils': testUtils,
    })
  )

/**
 * @returns {BuildOptions}
 */
const getPreactBaseConfig = async () => ({
  bundle: true,
  define: {
    'process.env.NODE_ENV': `'production'`,
  },
  entryPoints: [`src/index.tsx`],
  external: [`react`],
  format: `esm`,
  inject: [await resolveToAbsolute(`./shims/preact-shim.js`)],
  outdir: `dist`,
  plugins: [aliasPlugin(await getPreactAliases())],
  target: [`esnext`],
})

/**
 * Returns a build runner with reasonable defaults set for a Preact-based app. When calling the build runner, an override config can be provided to replace any defaults as needed. Some examples of things that may need to be replaced:
 * - `entryPoints` defaults to `['src/index.tsx']`, but for non-TS projects or projects with a different folder structure, this would need to be replaced
 * - `inject` defaults to add a shim for the Preact `h` and `Fragment` exports, but if other shim functionality is needed for some reason, this can be replaced in the override
 * - `outdir` defaults to `dist`, but if a project has a different output destination, this can be overridden
 *
 * In addition to replacing defaults, the override functionality also allows for extending the config. Some examples of this:
 * - the `watch` option is omitted by default, but can be provided in the override to add logging or any other functionality that may be useful on rebuild
 * - adding options not added by the default, such as `minify: true` for prod builds or `sourcemap: true` for dev builds, allows flexibility to re-use one build runner for multiple uses
 *
 * @returns {BuildRunner} A function that can be called to start a build
 */
const getPreactBuildRunner = async () => createBuildRunner(await getPreactBaseConfig())

module.exports = { getElectronBuildRunner, getPreactAliases, getPreactBuildRunner }
