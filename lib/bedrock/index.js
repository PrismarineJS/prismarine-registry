module.exports = (data) => {
  return {
    loadItemStates (itemStates) {
      for (const item of itemStates) {
        const name = item.name.replace('minecraft:', '')

        if (data.itemsArray) {
          data.itemsArray = data.itemsArray.map((_item) => {
            return {
              ..._item,
              id: name === _item.name ? item.id : _item.id
            }
          })
        }
      }
      data.itemsById = this.buildIndexFromArray(data.items, 'id')
      data.itemsByName = this.buildIndexFromArray(data.items, 'name')
      this.loadedItemStates = true
    },
    buildIndexFromArray (array, fieldToIndex) {
      if (array === undefined) { return undefined }
      return array.reduce(function (index, element) {
        index[element[fieldToIndex]] = element
        return index
      }, {})
    }
  }
}
