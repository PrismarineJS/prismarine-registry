/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.18']
const test = require('./mcpc')

describe('mcpc', () => {
  for (const version of SUPPORTED_VERSIONS) {
    it('works on ' + version, () => test(version))
  }
})
