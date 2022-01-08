const registry = require('prismarine-registry')('1.18')

registry.biomes.set(2, 'minecraft:ocean', { data: 'about an ocean biome' })
console.assert(registry.biomes.getIndex('minecraft:ocean') === 2)
console.log(registry.biomes.get('minecraft:ocean')) // Should get { data: 'about an ocean biome' }
