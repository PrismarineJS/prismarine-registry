const Registry = require('prismarine-registry')
const collectPackets = require('./util/collectBedrockPackets')
// const assert = require('assert')

async function main (version = '1.19.63') {
  const registry = Registry(`bedrock_${version}`)
  let loggedIn = false
  const handlers = {
    play_status (version, params) {
      if (params.status === 'login_success') loggedIn = true
    },
    start_game (version, params) {
      registry.loadItemStates(params.itemstates)
      console.log('Loaded item palette', registry.items)

      registry.writeItemStates()
      // TODO: implement component_based so that this works
      // assert.deepEqual(
      //   reEncoded.sort((a, b) => a.runtime_id - b.runtime_id),
      //   params.itemstates.sort((a, b) => a.runtime_id - b.runtime_id)
      // )
      console.log('Re-encoded item palette')
    }
  }

  await collectPackets(version, Object.keys(handlers), (name, params) => handlers[name](version, params))
  await new Promise((resolve) => setTimeout(resolve, 5000))
  if (!loggedIn) {
    throw new Error('Did not login')
  }
}

module.exports = main
