const buildIndexFromArray = require('../indexer')

module.exports = (data) => {
  return {

    handleStartGame (packet) {
      this.loadItemStates(packet.itemstates)
      this.loadCustomBlockStates(packet.block_properties)
      if (this.supportFeature('blockHashes') && packet.block_network_ids_are_hashes) {
        this.calculateBlockStateHashes()
      } else {
        const blocksByRuntimeId = {}
        for (const [stateId] of Object.entries(data.blockStates)) {
          blocksByRuntimeId[stateId] = data.blocksByStateId[stateId]
          blocksByRuntimeId[stateId].stateId = stateId
        }
        data.blocksByRuntimeId = data.blocksByStateId
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

    loadCustomBlockStates (blockStates) {
      const blocks = []
      for (const block of blockStates) {
        let [ns, name] = block.name.split(':')
        if (!name) {
          name = ns
          ns = 'minecraft'
        }
        blocks.push({ name: `${ns}:${name}`, runtime_id: block.state.value.vanilla_block_data.value.block_id.value, component_based: ns !== 'minecraft' })
      }
      data.blockStates.push(...blockStates)
      data.blocksArray.push(...blocks)
      data.blocks = buildIndexFromArray(data.blocksArray, 'id')
      data.blocksByName = buildIndexFromArray(data.blocksArray, 'name')
    },

    writeCustomBlockStates () {
      const blockstates = []
      for (const block of data.blocksArray) {
        // Custom items with different namespaces can also be in the palette
        let [ns, name] = block.name.split(':')
        if (!name) {
          name = ns
          ns = 'minecraft'
        }

        blockstates.push({ name: `${ns}:${name}`, runtime_id: block.state.value.vanilla_block_data.value.block_id.value, component_based: ns !== 'minecraft' })
      }

      return blockstates
    },

    calculateBlockStateHashes () {
      const pBlock = require('prismarine-block')(this, this.version)
      const blocksByRuntimeId = {}
      for (const [stateId, block] of Object.entries(data.blockStates)) {
        const name = `minecraft:${block.name}`
        const states = {}
        for (const key of Object.keys(block.states).sort()) {
          states[key] = block.states[key]
        }
        const hash = pBlock.getHash(name, states)
        blocksByRuntimeId[hash] = data.blocksByStateId[stateId]
        blocksByRuntimeId[hash].stateId = stateId
      }
      data.blocksByRuntimeId = blocksByRuntimeId
    }
  }
}
