const { buildIndexFromArray } = require('./indexer')

module.exports = (data) => {
  return {
    loadItemStates (itemStates) {
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')

        if (data.itemsArray) {
          data.itemsArray = data.itemsArray.map((_item) => {
            return {
              ..._item,
              id: name === _item.name ? item.runtime_id : _item.id
            }
          })
        }
      }
      data.items = buildIndexFromArray(data.itemsArray, 'id')
      data.itemsByName = buildIndexFromArray(data.itemsArray, 'name')
    }
  }
}
