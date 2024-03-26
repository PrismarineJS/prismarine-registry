module.exports = (data) => {
  return {
    handleStartGame (packet) {
      const { loadItemStates, loadRuntimeIds, loadHashedRuntimeIds } = require('./loader')(this, data)
      loadItemStates(packet.itemstates)
      if (this.supportFeature('blockHashes') && packet.block_network_ids_are_hashes) {
        loadHashedRuntimeIds()
      } else {
        loadRuntimeIds()
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

        itemstates.push({ name: `${ns}:${name}`, runtime_id: item.id, component_based: ns !== 'minecraft' })
      }

      return itemstates
    }
  }
}
