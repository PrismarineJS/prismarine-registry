/* eslint-env mocha */

const Registry = require('prismarine-registry')
const assert = require('assert')

describe('basic registry works', () => {
  const registry = Registry('1.18')

  const oceanIndex = 1
  const oceanStringKey = 'ocean'
  const oceanData = 'Some data about Ocean'

  registry.biomes.set(oceanIndex, oceanStringKey, oceanData)

  const gotValueFromKey = registry.biomes.getValue(oceanStringKey)
  const gotValueFromIndex = registry.biomes.getValueAt(oceanIndex)

  const gotNameFromIndex = registry.biomes.getName(oceanIndex)
  const gotIndexFromName = registry.biomes.getIndex('ocean')

  assert(gotValueFromIndex === oceanData)
  assert(gotValueFromKey === oceanData)

  assert(gotNameFromIndex === 'ocean')
  assert(gotIndexFromName === 1)

  // console.log('Registry', registry)
  // console.log('Got value from key', gotValueFromKey)
  // console.log('Got value from index', gotValueFromIndex)
  // console.log('Got name from index', gotNameFromIndex)
  // console.log('Got index from name', gotIndexFromName)

  const exampleRecipe = { type: 'minecraft:crafting_shaped', recipeId: 'minecraft:smooth_stone_slab', data: { width: 3, height: 1, group: '', ingredients: [[[{ present: true, itemId: 165, itemCount: 1 }]], [[{ present: true, itemId: 165, itemCount: 1 }]], [[{ present: true, itemId: 165, itemCount: 1 }]]], result: { present: true, itemId: 147, itemCount: 6 } } }
  registry.recipes.add(exampleRecipe.recipeId, exampleRecipe)
  const x = registry.recipes.get(exampleRecipe.recipeId)
  assert.deepStrictEqual(x, exampleRecipe)

  console.log(registry)
})
