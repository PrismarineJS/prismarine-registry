const buildIndexFromArray = require('../indexer')
module.exports = (registry, data) => {
  return {
    loadItemStates (itemStates) {
      const items = []
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')
        items.push({ ...data.itemsByName[name], name, id: item.runtime_id })
      }
      data.itemsArray = items
      data.items = buildIndexFromArray(data.itemsArray, 'id')
      data.itemsByName = buildIndexFromArray(data.itemsArray, 'name')
    },

    loadHashedRuntimeIds () {
      const Block = require('prismarine-block')(registry)
      data.blocksByRuntimeId = {}
      for (let i = 0; i < data.blockStates.length; i++) {
        const { name, states } = data.blockStates[i]
        const hash = Block.getHash(name, states)
        data.blocksByRuntimeId[hash] = { stateId: i, ...data.blocksByStateId[i] }
      }
    },

    loadRuntimeIds () {
      data.blocksByRuntimeId = {}
      for (let i = 0; i < data.blockStates.length; i++) {
        data.blocksByRuntimeId[i] = { stateId: i, ...data.blocksByStateId[i] }
      }
    }
  }
}
