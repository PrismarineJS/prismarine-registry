const buildIndexFromArray = require('../indexer')

module.exports = (data) => {
  return {

    loadItemStates(itemStates) {
      const items = []
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')
        items.push({ ...data.itemsByName[name], name, id: item.runtime_id })
      }
      data.itemsArray = items
      data.items = buildIndexFromArray(data.itemsArray, 'id')
      data.itemsByName = buildIndexFromArray(data.itemsArray, 'name')
    },

    writeItemStates() {
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

    calculateBlockStateHashes() {

      const nbt = require('prismarine-nbt')
      const blockStatesByRuntimeId = {}
      for (const [stateId, block] of Object.entries(data.blockStates)) {

        const name = `minecraft:${block.name}`

        var states = {}
        for (const key of Object.keys(block.states).sort()) {

          states[key] = block.states[key]
        }

        const tag = nbt.comp({

          name: { type: 'string', value: name },
          states: nbt.comp(states)
        })

        var s = nbt.writeUncompressed(tag, 'little').toString()
        const hash = (name === 'minecraft:unknown' ? -2 : fnv1a32(s))

        blockStatesByRuntimeId[hash] = Number(stateId)
      }

      data.blockStatesByRuntimeId = blockStatesByRuntimeId
    }
  }
}

function fnv1a32(s) {

  //https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV_hash_parameters
  const FNV1_OFFSET_32 = 0x811c9dc5
  const FNV1_PRIME_32 = 0x01000193

  var h = FNV1_OFFSET_32
  for (let i = 0; i < s.length; i++) {

    h ^= s.charCodeAt(i) & 0xff;
    //h *= FNV1_PRIME_32; //<-- this does not work in nodejs
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }

  return h & h
  //return h >>> 0   
  //return h
}
