/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.18']
const test = require('./mcpc')

describe('mcpc', function () {
  this.timeout(9000 * 10)

  for (const version of SUPPORTED_VERSIONS) {
    it('works on ' + version, () => test(version))
  }
})
