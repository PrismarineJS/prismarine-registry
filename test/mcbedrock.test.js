/* eslint-env mocha */

const SUPPORTED_VERSIONS = ['1.17.10', '1.18.0', '1.18.11', '1.18.30', '1.19.1', '1.19.10', '1.21.70']
const test = require('./mcbedrock')
const { sleep } = require('./util/sleep')

describe('mcbedrock', function () {
  const vcount = SUPPORTED_VERSIONS.length
  this.timeout(vcount * 80 * 1000)

  for (const version of SUPPORTED_VERSIONS) {
    it('works on ' + version, async () => {
      await test(version)
      await sleep(100)
    })
  }
})
