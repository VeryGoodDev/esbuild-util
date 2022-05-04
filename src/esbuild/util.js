const esbuild = require(`esbuild`)

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 * @typedef {import('esbuild').BuildResult} BuildResult
 * @typedef {import('esbuild').ServeResult} ServeResult
 * @typedef {keyof BuildOptions} BuildOptionKey
 * @typedef {(overrides?: BuildOptions) => Promise<BuildResult>} BuildRunner
 * @typedef {(overrides?: BuildOptions) => Promise<ServeResult>} DevServer
 */

/**
 * @param {BuildOptions} config Config to start with
 * @param {BuildOptions} overrides Any overrides for things in config
 * @returns {BuildOptions}
 */
const combineConfigs = (config, overrides = {}) => {
  const originalPlugins = config.plugins || []
  const overridePlugins = overrides.plugins || []
  const plugins = [...originalPlugins, ...overridePlugins]
  return { ...config, ...overrides, plugins }
}

/**
 * @param {BuildOptions} config The config to base the build runner on
 * @param {BuildOptionKey[]} requiredOverrides Any overrides that must be provided when calling the returned build runner. If there are any values provided in this array, the build runner will throw an error if it isn't called with an override config containing all of the required fields
 * @returns {BuildRunner}
 */
const createBuildRunner =
  (config, requiredOverrides = []) =>
  (overrides = {}) => {
    const missingOverrides = requiredOverrides.filter((key) => !(key in overrides))
    if (missingOverrides.length > 0) {
      const missingOverrideList = missingOverrides.join(`, `)
      throw new Error(
        `This build runner must be called with an override config containing the following fields: ${missingOverrideList}`
      )
    }
    return esbuild.build(combineConfigs(config, overrides))
  }

/**
 * @param {BuildOptions} config The config to base the build runner on
 * @param {BuildOptionKey[]} requiredOverrides Any overrides that must be provided when calling the returned build runner. If there are any values provided in this array, the build runner will throw an error if it isn't called with an override config containing all of the required fields
 * @returns {DevServer}
 */
const createDevServer =
  (config, requiredOverrides = []) =>
  (overrides = {}) => {
    const missingOverrides = requiredOverrides.filter((key) => !(key in overrides))
    if (missingOverrides.length > 0) {
      const missingOverrideList = missingOverrides.join(`, `)
      throw new Error(
        `This build runner must be called with an override config containing the following fields: ${missingOverrideList}`
      )
    }
    return esbuild.serve({ host: `localhost`, port: 6969 }, combineConfigs(config, overrides))
  }

/**
 * @param {number} startTime Timestamp of the starting point of the timeframe being measured
 * @param {number} precision How many decimal places to round the diff to. Defaults to 2 places
 * @returns {number}
 */
const getTimeDiff = (startTime, precision = 2) => (performance.now() - startTime).toFixed(precision)

/**
 * @param {string} path The module path to be resolved
 * @returns {Promise<string>}
 */
const resolveToAbsolute = (path) => Promise.resolve(require.resolve(path))
// TODO eventually when it's better supported, all my Node projects will use ESM and this will need to be updated to use this method instead
// Const resolveToAbsolute = (path) => import.meta.resolve(path).then((resolved) => resolved.replace(/^file:\/\//, ``))

module.exports = { createBuildRunner, createDevServer, getTimeDiff, resolveToAbsolute }
