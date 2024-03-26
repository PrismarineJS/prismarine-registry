const buildIndexFromArray = require('../indexer')

module.exports = (data) => {
  return {

    handleStartGame (packet) {
      this.loadItemStates(packet.itemstates)
      if (this.supportFeature('blockHashes') && packet.block_network_ids_are_hashes) {
        this.loadHashedRuntimeIds()
      } else {
        this.loadRuntimeIds()
      }
    },

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

    writeItemStates () {
      const itemstates = []
      for (const item of data.itemsArray) {
        // Custom items with different namespaces can also be in the palette
        let [ns, name] = item.name.split(':')
        if (!name) {
          name = ns
          ns = 'minecraft'
        }

        itemstates.push({ name: `${ns}:${name}`, runtime_id: item.id, component_based: ns !== 'minecraft' })
      }

      return itemstates
    },

    loadHashedRuntimeIds () {
      const Block = require('prismarine-block')(this)
      data.blocksByRuntimeId = {}
      for (let i = 0; i < data.blockStates.length; i++) {
        const { name, states } = data.blockStates[i]
        const hash = Block.getHash(name, states)
        data.blocksByRuntimeId[hash] = { stateId: i, ...data.blocksByStateId[i] }
      }
    },

    loadRuntimeIds () {
      data.blocksByRuntimeId = data.blocksByStateId
      for (let i = 0; i < data.blockStates.length; i++) {
        data.blocksByRuntimeId[i] = { stateId: i, ...data.blocksByStateId[i] }
      }
    }
  }
}
