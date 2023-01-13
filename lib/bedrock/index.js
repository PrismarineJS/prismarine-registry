module.exports = (data) => {
  return {
    loadItemStates (itemStates) {
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')
        const id = data.itemsByName[name].id

        if (data.items[id]) data.items[id].id = item.runtime_id
        if (data.itemsByName[name]) data.itemsByName[name].id = item.runtime_id
        if (data.itemsArray) {
          data.itemsArray = data.itemsArray.map((_item) => {
            return {
              ..._item,
              id: name === _item.name ? item.id : _item.id
            }
          })
        }
      }
      this.loadedItemStates = true
    }
  }
}
