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
      data.items = this.buildIndexFromArray(data.itemsArray, 'id')
      data.itemsByName = this.buildIndexFromArray(data.itemsArray, 'name')
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
