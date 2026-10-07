const nbt = require('prismarine-nbt')
const buildIndexFromArray = require('../indexer')

module.exports = (data) => {
  // The registry data is a shallow copy of minecraft-data (see lib/loader.js), so
  // data.blocksArray / data.blockStates / data.itemsByName initially point at the
  // shared, immutable minecraft-data structures.
  const sourceBlocksArray = data.blocksArray
  const sourceBlockStates = data.blockStates
  const sourceItemsByName = data.itemsByName

  // until start_game remaps them, state ids are the indexes into blockStates
  if (sourceBlockStates) {
    data.blockStatesByStateId = Object.fromEntries(sourceBlockStates.map((blockState, index) => [index, blockState]))
  }

  // What the components of an item state tell about the item; minecraft-data has the vanilla items, these are for
  // the others. Repair items given by a tag are left out: minecraft-data has no item tags.
  function itemFromComponents (itemState) {
    const components = itemState.nbt && nbt.simplify(itemState.nbt).components
    if (!components) return {}
    const item = {}
    const stackSize = components.item_properties?.max_stack_size ?? components['minecraft:max_stack_size']
    if (stackSize !== undefined) item.stackSize = stackSize
    const maxDurability = components['minecraft:durability']?.max_durability
    if (maxDurability !== undefined) item.maxDurability = maxDurability
    const displayName = components['minecraft:display_name']?.value
    if (displayName !== undefined) item.displayName = data.language?.[displayName] ?? displayName
    const repairWith = components['minecraft:repairable']?.repair_items
      .flatMap(repairItem => repairItem.items)
      .filter(repairItem => repairItem.name)
      .map(repairItem => repairItem.name.replace('minecraft:', ''))
    if (repairWith?.length) item.repairWith = repairWith
    return item
  }

  function loadItemStates (itemStates) {
    const items = []
    for (const item of itemStates) {
      const name = item.name.replace('minecraft:', '')
      items.push({ ...itemFromComponents(item), ...sourceItemsByName[name], name, id: item.runtime_id, componentBased: item.component_based, nbt: item.nbt, version: item.version })
    }
    data.itemsArray = items
    data.items = buildIndexFromArray(data.itemsArray, 'id')
    data.itemsByName = buildIndexFromArray(data.itemsArray, 'name')
  }

  function remapBlocks (registry, useHashes) {
    const stateIdByIndex = new Array(sourceBlockStates.length)
    if (useHashes) {
      const Block = require('prismarine-block')(registry)
      for (let i = 0; i < sourceBlockStates.length; i++) {
        const { name, states } = sourceBlockStates[i]
        stateIdByIndex[i] = Block.getHash(name, states)
      }
    } else {
      for (let i = 0; i < sourceBlockStates.length; i++) {
        stateIdByIndex[i] = i
      }
    }

    data.blockStates = sourceBlockStates.map((blockState, i) => ({ ...blockState, stateId: stateIdByIndex[i] }))
    data.blockStatesByStateId = Object.fromEntries(data.blockStates.map(blockState => [blockState.stateId, blockState]))

    data.blocksArray = sourceBlocksArray.map((block) => {
      const states = []
      for (let index = block.minStateId; index <= block.maxStateId; index++) {
        states.push(stateIdByIndex[index])
      }
      const remapped = { ...block, states, defaultState: stateIdByIndex[block.defaultState] }
      if (useHashes) {
        remapped.minStateId = undefined
        remapped.maxStateId = undefined
      }
      return remapped
    })

    data.blocks = buildIndexFromArray(data.blocksArray, 'id')
    data.blocksByName = buildIndexFromArray(data.blocksArray, 'name')

    data.blocksByStateId = {}
    data.blocksByRuntimeId = {}
    for (const block of data.blocksArray) {
      for (const stateId of block.states) {
        data.blocksByStateId[stateId] = block
        data.blocksByRuntimeId[stateId] = { stateId, ...block }
      }
    }
  }

  return {
    handleStartGame (packet) {
      if (packet.itemstates) {
        loadItemStates(packet.itemstates)
      }

      remapBlocks(this, this.supportFeature('blockHashes') && !!packet.block_network_ids_are_hashes)
    },
    handleItemRegistry (packet) {
      if (packet.itemstates) {
        loadItemStates(packet.itemstates)
      }
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

        const itemState = {
          name: `${ns}:${name}`,
          runtime_id: item.id,
          // vanilla items can be component based too; guess only for items not loaded from a palette
          component_based: item.componentBased ?? ns !== 'minecraft'
        }

        if (item.version !== undefined) {
          itemState.version = item.version
        }

        if (item.nbt !== undefined) {
          itemState.nbt = item.nbt
        }

        itemstates.push(itemState)
      }

      return itemstates
    }
  }
}
