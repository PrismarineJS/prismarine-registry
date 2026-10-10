const Registry = require('prismarine-registry')
const collectPackets = require('./util/collectBedrockPackets')
const assert = require('assert')

async function main (version = '1.19.63') {
  const registry = Registry(`bedrock_${version}`)

  let itemstates
  const handlers = {
    start_game (version, params) {
      const action = params.itemstates
        ? 'item palette and custom blocks'
        : 'custom blocks'

      console.log(`Loading ${action}`)

      registry.handleStartGame(params)
      itemstates = params.itemstates

      console.log(`loaded ${action}`)
    },

    item_registry (version, params) {
      console.log('Loading item palette', registry.items)

      registry.handleItemRegistry(params)
      itemstates = params.itemstates

      console.log('Loaded item palette', registry.items)
    }
  }
  const packets = registry.supportFeature('itemRegistryPacket')
    ? ['start_game', 'item_registry']
    : ['start_game']

  await collectPackets(version, packets, (name, params) => handlers[name](version, params))

  if (itemstates === undefined) {
    throw new Error('Did not login')
  }

  assert.deepStrictEqual(registry.writeItemStates(), itemstates)
  console.log('Re-encoded item palette')
}

module.exports = main
