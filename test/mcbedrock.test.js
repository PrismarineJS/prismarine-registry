/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.17.10', '1.18.0', '1.19.1', '1.19.63']
const test = require('./mcbedrock')

describe('mcbedrock', function () {
  this.timeout(9000 * 10)

  for (const version of SUPPORTED_VERSIONS) {
    it('works on ' + version, () => test(version))
  }
})
