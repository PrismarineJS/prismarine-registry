const collectPackets = require('./util/collectMcpcPackets')
const Registry = require('prismarine-registry')
const assert = require('assert')

async function main (version = '1.18') {
  const registry = Registry(version)
  let loggedIn = false
  const handlers = {
    login (version, body) {
      if (body.dimensionCodec) {
        registry.loadDimensionCodec(body.dimensionCodec)
        console.log('Loaded dimension codec', registry.biomes)

        const reEncoded = registry.writeDimensionCodec()

        // TODO: Add proper way to compare two NBT objects in prismarine-nbt, as deepEqual will fail with incorrect sorting

        // require('fs').writeFileSync('./dimension-codec0.json', JSON.stringify(reEncoded, null, 2))
        // require('fs').writeFileSync('./dimension-codec1.json', JSON.stringify(body.dimensionCodec, null, 2))
        // assert.deepEqual(reEncoded, body.dimensionCodec)
        console.log('Re-encoded dimension codec')
      }
      loggedIn = true
    },

    declare_recipes (version, body) {
      // todo: load recipes
    }
  }

  await collectPackets(version, Object.keys(handlers), (name, body) => handlers[name](version, body))
  await new Promise(resolve => setTimeout(resolve, 5000))
  if (!loggedIn) {
    throw new Error('Did not login')
  }
}

module.exports = main
