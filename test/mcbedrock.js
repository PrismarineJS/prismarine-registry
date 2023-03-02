const Registry = require('prismarine-registry')
const collectPackets = require('./util/collectBedrockPackets')

async function main (version = '1.19.63') {
  const registry = Registry(`bedrock_${version}`)
  let loggedIn = false
  const handlers = {
    play_status (version, params) {
      if (params.status === 'login_success') {
        loggedIn = true
      }
    },
    start_game (version, params) {
      registry.loadItemStates(params.itemstates)
      console.log('Loaded item palette', registry.items)
      // console.log('iron shovel', params.itemstates.find(x => x.name === 'minecraft:iron_shovel'), registry.itemsByName.iron_shovel)
    }
  }

  await collectPackets(version, Object.keys(handlers), (name, params) => handlers[name](version, params))
  await new Promise((resolve) => setTimeout(resolve, 5000))
  if (!loggedIn) {
    throw new Error('Did not login')
  }
}

module.exports = main
