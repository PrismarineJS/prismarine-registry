const collectPackets = require('./util/collectMcpcPackets')
const Registry = require('prismarine-registry')

async function main (version = '1.18') {
  const registry = Registry(version)
  let loadedDimensionCodec = false
  const handlers = {
    login (version, body) {
      registry.loadDimensionCodec(body.dimensionCodec)
      console.log('Loaded dimension codec', registry.biomes)
      loadedDimensionCodec = true
    },

    declare_recipes (version, body) {

    }
  }

  await collectPackets(version, Object.keys(handlers), (name, body) => handlers[name](version, body))
  await new Promise(resolve => setTimeout(resolve, 5000))
  if (!loadedDimensionCodec) {
    throw new Error('No dimension codec loaded')
  }
}

module.exports = main
