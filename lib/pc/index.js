const nbt = require('prismarine-nbt')

module.exports = (data) => ({
  loadDimensionCodec (codec) {
    data.biomes = []
    data.biomesByName = {}
    data.biomesArray = []

    // ... and update the codec to use the new biome data
    const dimensionCodec = nbt.simplify(codec)
    const biomes = dimensionCodec['minecraft:worldgen/biome'].value
    const all = []
    for (const { name, id, element } of biomes) {
      data.biomes[id] = element
      data.biomesByName[name] = element
      all.push(element)
    }
    data.biomesArray = biomes
  },

  writeDimensionCodec (codec) {
    // todo
  }
})
