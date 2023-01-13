module.exports = (data) => {
  return {
    loadItemStates (itemStates) {
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')
        const id = data.itemsByName[name].id

        data.items[id].id = item.runtime_id
        data.itemsByName[name].id = item.runtime_id
        data.itemsArray = data.itemsArray.map((_item) => {
          return {
            ..._item,
            id: name === _item.name ? item.id : _item.id
          }
        })
      }
      this.loadedItemStates = true
    }
  }
}
