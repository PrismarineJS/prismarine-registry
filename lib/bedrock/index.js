const buildIndexFromArray = require('./indexer')

module.exports = (data) => {
  return {
    loadItemStates (itemStates) {
      const items = []
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')
        items.push({ ...data.itemsByName[name], id: item.runtime_id })
      }
      data.itemsArray = items
      data.items = buildIndexFromArray(data.itemsArray, 'id')
      data.itemsByName = buildIndexFromArray(data.itemsArray, 'name')
    },

    writeItemStates () {
      const itemstates = []
      for (const item of Object.values(data.items)) {
        // Custom items with different namespaces can also be in the palette
        // There might be a better way to test for this
        const name = /(\w+?):(\w+)/.test(item.name) ? item.name : `minecraft:${item.name}`

        // TODO: component_based?
        itemstates.push({ name, runtime_id: item.id, component_based: false })
      }

      return itemstates
    }
  }
}
