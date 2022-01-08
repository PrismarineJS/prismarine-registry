const collectPackets = require('./util/collectMcpcPackets')
const nbt = require('prismarine-nbt')
const Registry = require('prismarine-registry')

async function main (version = '1.18') {
  const registries = Registry(version)
  const handlers = {
    login (version, body) {
      const dimensionCodec = nbt.simplify(body.dimensionCodec)
      const biomes = dimensionCodec['minecraft:worldgen/biome'].value
      for (const { name, id, element } of biomes) {
        registries.biomes.set(id, name, element)
      }
    },

    declare_recipes (version, body) {
      for (const recipe of body.recipes) {
        registries.recipes.add(recipe.recipeId, recipe)
      }
    }
  }

  collectPackets(version, Object.keys(handlers), (name, body) => handlers[name](version, body))
}

main()
module.exports = main
