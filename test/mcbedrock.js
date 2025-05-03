const Registry = require('prismarine-registry')
const collectPackets = require('./util/collectBedrockPackets')
const { versions } = require('minecraft-data')
const assert = require('assert')

async function main (version = '1.19.63') {
  const registry = Registry(`bedrock_${version}`)
  const Versions = Object.fromEntries(versions.bedrock.filter(e => e.releaseType === 'release').map(e => [e.minecraftVersion, e.version]))

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

  const packets = Versions[version] >= Versions['1.21.70']
    ? ['start_game', 'item_registry']
    : ['start_game']

  await collectPackets(version, packets, (name, params) => handlers[name](version, params))

  const reEncoded = registry.writeItemStates()
  reEncoded.sort((a, b) => a.runtime_id - b.runtime_id)
  itemstates.sort((a, b) => a.runtime_id - b.runtime_id)

  assert.deepEqual(reEncoded[0], itemstates[0])
  console.log('Re-encoded item palette')

  if (!itemstates) {
    throw new Error('Did not login')
  }
}

module.exports = main
