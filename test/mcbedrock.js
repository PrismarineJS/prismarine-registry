const Registry = require('prismarine-registry')
const collectPackets = require('./util/collectBedrockPackets')
const assert = require('assert')

async function main (version = '1.19.63') {
  const registry = Registry(`bedrock_${version}`)
  let loggedIn = false
  const handlers = {
    start_game (version, params) {
      console.log('Loading item palette and custom blocks')
      registry.handleStartGame(params)

      if (params.itemstates != null) {
        console.log('Loaded item palette')

        const reEncoded = registry.writeItemStates()
        assert.deepEqual(
          reEncoded.sort((a, b) => a.runtime_id - b.runtime_id),
          params.itemstates.sort((a, b) => a.runtime_id - b.runtime_id)
        )
        console.log('Re-encoded item palette')
      }

      loggedIn = true
    }
  }

  await collectPackets(version, Object.keys(handlers), (name, params) => handlers[name](version, params))
  if (!loggedIn) {
    throw new Error('Did not login')
  }
}

module.exports = main
